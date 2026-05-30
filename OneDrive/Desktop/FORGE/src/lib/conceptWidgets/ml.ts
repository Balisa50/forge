import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** Step through k-means: assign, then move centroids, repeat. */
const kmeansStepper: ConceptWidgetDef = {
  id: "kmeans-stepper",
  title: "k-means, one step at a time",
  blurb: "Click Step to alternate assign → re-centre until it converges.",
  html: () =>
    widgetDoc(
      `<div class="w-title">k-means clustering (k = 3)</div>
       <div class="w-sub">it only ever does two things, over and over: assign points to the nearest centre, then move each centre to the middle of its points</div>
       <svg id="sv" viewBox="0 0 260 200" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-row"><button class="w-btn" id="step">Step</button><button class="w-btn alt" id="reset">Reset</button><span class="w-chip" id="phase"></span></div>
       <div class="w-note" id="why">Centres start in random spots. Watch them crawl to the heart of each blob.</div>`,
      `
var W=260,H=200,K=3,cols=["#60a5fa","#22c55e","#fb7185"];
var pts=[],cen=[],phase=0;
function rnd(a,b){return a+Math.random()*(b-a);}
function blob(cx,cy,n){for(var i=0;i<n;i++)pts.push({x:cx+rnd(-30,30),y:cy+rnd(-30,30),c:-1});}
function init(){
  pts=[];blob(70,60,14);blob(190,70,14);blob(120,150,14);
  cen=[];for(var i=0;i<K;i++)cen.push({x:rnd(40,220),y:rnd(40,160)});
  phase=0;draw("Centres dropped at random. Click Step to assign points.");
}
function assign(){
  pts.forEach(function(p){
    var best=0,bd=1e9;
    cen.forEach(function(c,i){var d=(p.x-c.x)*(p.x-c.x)+(p.y-c.y)*(p.y-c.y);if(d<bd){bd=d;best=i;}});
    p.c=best;
  });
}
function move(){
  cen.forEach(function(c,i){
    var xs=pts.filter(function(p){return p.c===i;});
    if(xs.length){c.x=xs.reduce(function(s,p){return s+p.x;},0)/xs.length;c.y=xs.reduce(function(s,p){return s+p.y;},0)/xs.length;}
  });
}
function draw(msg){
  var s="";
  pts.forEach(function(p){s+="<circle cx="+p.x.toFixed(1)+" cy="+p.y.toFixed(1)+" r='3.5' fill='"+(p.c<0?"#8a7c63":cols[p.c])+"' opacity='.85'/>";});
  cen.forEach(function(c,i){
    s+="<rect x="+(c.x-5).toFixed(1)+" y="+(c.y-5).toFixed(1)+" width='10' height='10' fill='"+cols[i]+"' stroke='#15110d' stroke-width='2'/>";
  });
  document.getElementById("sv").innerHTML=s;
  if(msg)document.getElementById("why").innerHTML=msg;
  document.getElementById("phase").textContent=phase%2===0?"next: assign":"next: re-centre";
}
document.getElementById("step").onclick=function(){
  if(phase%2===0){assign();draw("<b>Assign:</b> every point took the colour of its nearest square.");}
  else{move();draw("<b>Re-centre:</b> each square jumped to the average of its own points.");}
  phase++;
};
document.getElementById("reset").onclick=init;
init();
`,
      {
        question: "k-means repeats two steps until it settles. What are they?",
        options: ["Split the data, then sort it", "Assign each point to its nearest centre, then move centres to the middle", "Pick k, then draw a boundary line"],
        answer: 1,
        reveal: "Assign → re-centre, over and over. Each pass can only lower the total distance, so it always converges — but <b>where</b> it lands depends on the random starting centres.",
      },
    ),
  bridge: "Run sklearn's KMeans(n_clusters=3) on a real 2-D dataset and plot the labels — then re-run with a different random_state and watch the clusters sometimes land differently.",
};

/** KNN: change k, classify the moving query point. */
const knnBoundary: ConceptWidgetDef = {
  id: "knn-boundary",
  title: "k-NN: who are your neighbours?",
  blurb: "Move the query point and change k to see the vote flip.",
  html: () =>
    widgetDoc(
      `<div class="w-title">k-nearest neighbours</div>
       <div class="w-sub">a new point (white ring) is classified by a majority vote of its k closest neighbours — move it around</div>
       <svg id="sv" viewBox="0 0 260 200" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px;touch-action:none"></svg>
       <div class="w-row"><span class="w-label">k</span><input id="k" type="range" min="1" max="9" step="2" value="3"><span class="w-val" id="kv">3</span></div>
       <div class="w-note" id="lab"></div>`,
      `
var W=260,H=200,A=[],B=[];
function rnd(a,b){return a+Math.random()*(b-a);}
for(var i=0;i<12;i++){A.push([rnd(20,110),rnd(30,170)]);B.push([rnd(150,240),rnd(30,170)]);}
var q={x:130,y:100};
var svg=document.getElementById("sv");
function classify(){
  var k=+document.getElementById("k").value;
  var all=A.map(function(p){return{d:(p[0]-q.x)*(p[0]-q.x)+(p[1]-q.y)*(p[1]-q.y),c:"A",p:p};})
    .concat(B.map(function(p){return{d:(p[0]-q.x)*(p[0]-q.x)+(p[1]-q.y)*(p[1]-q.y),c:"B",p:p};}));
  all.sort(function(a,b){return a.d-b.d;});
  var near=all.slice(0,k),votes=near.filter(function(n){return n.c==="A";}).length;
  return {label:votes>k/2?"A":"B",near:near,a:votes,b:k-votes};
}
function draw(){
  var k=+document.getElementById("k").value;
  document.getElementById("kv").textContent=k;
  var r=classify(),s="";
  A.forEach(function(p){s+="<circle cx="+p[0]+" cy="+p[1]+" r='4' fill='#60a5fa'/>";});
  B.forEach(function(p){s+="<circle cx="+p[0]+" cy="+p[1]+" r='4' fill='#fb7185'/>";});
  r.near.forEach(function(n){s+="<line x1="+q.x+" y1="+q.y+" x2="+n.p[0]+" y2="+n.p[1]+" stroke='#D4AF37' stroke-width='1' opacity='.6'/>";});
  var col=r.label==="A"?"#60a5fa":"#fb7185";
  s+="<circle cx="+q.x+" cy="+q.y+" r='7' fill='"+col+"' stroke='#fff' stroke-width='2'/>";
  svg.innerHTML=s;
  document.getElementById("lab").innerHTML="Vote: <b style='color:#60a5fa'>"+r.a+" blue</b> vs <b style='color:#fb7185'>"+r.b+" red</b> &rarr; classified <b>"+r.label+"</b>. Notice how a different <b>k</b> can change the answer near the border.";
}
function pos(e){
  var rect=svg.getBoundingClientRect(),t=e.touches?e.touches[0]:e;
  q.x=Math.max(8,Math.min(252,(t.clientX-rect.left)/rect.width*W));
  q.y=Math.max(8,Math.min(192,(t.clientY-rect.top)/rect.height*H));
  draw();
}
svg.addEventListener("mousemove",function(e){if(e.buttons)pos(e);});
svg.addEventListener("mousedown",pos);
svg.addEventListener("touchmove",function(e){e.preventDefault();pos(e);});
document.getElementById("k").addEventListener("input",draw);
draw();
`,
      {
        question: "You raise k from 1 to 9. What happens to the decision boundary?",
        options: ["It gets jagged and follows every single point", "It gets smoother and ignores lone outliers", "It disappears entirely"],
        answer: 1,
        reveal: "More neighbours voting means a single odd point gets outvoted. Small k <b>overfits</b> to noise; large k smooths — but can blur real structure too.",
      },
    ),
  bridge: "Fit KNeighborsClassifier for k=1 and k=15 on the same data and compare the boundaries — small k memorises, large k generalises.",
};

/** Slide model complexity; train error falls but test error U-turns. */
const trainTestOverfit: ConceptWidgetDef = {
  id: "train-test-overfit",
  title: "Overfitting: the U-shaped curve",
  blurb: "Crank model complexity and watch the test error turn back up.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Why a more complex model isn't always better</div>
       <div class="w-sub">drag complexity — the fitted curve and the two error bars react</div>
       <svg id="fit" viewBox="0 0 260 150" width="49%" style="background:rgba(0,0,0,.2);border-radius:8px;display:inline-block"></svg>
       <svg id="err" viewBox="0 0 260 150" width="49%" style="background:rgba(0,0,0,.2);border-radius:8px;display:inline-block"></svg>
       <div class="w-row"><span class="w-label">complexity</span><input id="c" type="range" min="1" max="14" step="1" value="3"><span class="w-val" id="cv">3</span></div>
       <div class="w-note" id="lab"></div>`,
      `
var pts=[];
for(var i=0;i<14;i++){var x=i/13;pts.push([x,Math.sin(x*3)*0.5+0.5+(Math.random()-0.5)*0.18]);}
function poly(x,deg,co){var y=0;for(var i=0;i<=deg;i++)y+=co[i]*Math.pow(x,i);return y;}
function fitPoly(deg){
  var co=[];for(var i=0;i<=deg;i++)co.push(0);
  for(var it=0;it<4000;it++){
    var g=co.map(function(){return 0;});
    pts.forEach(function(p){
      var pred=poly(p[0],deg,co),e=pred-p[1];
      for(var i=0;i<=deg;i++)g[i]+=2*e*Math.pow(p[0],i)/pts.length;
    });
    for(var i=0;i<=deg;i++)co[i]-=0.3*g[i];
  }
  return co;
}
function draw(){
  var deg=+document.getElementById("c").value;document.getElementById("cv").textContent=deg;
  var co=fitPoly(deg);
  var s="";
  for(var x=0;x<=1;x+=0.02){var y=poly(x,deg,co);s+="<circle cx="+(10+x*240)+" cy="+(140-y*130)+" r='1.2' fill='#D4AF37'/>";}
  pts.forEach(function(p){s+="<circle cx="+(10+p[0]*240)+" cy="+(140-p[1]*130)+" r='3' fill='#60a5fa'/>";});
  document.getElementById("fit").innerHTML=s;
  var trainE=Math.max(0.01,0.13-deg*0.012);
  var testE=0.04+Math.pow(Math.max(0,deg-5),2)*0.006+Math.max(0,5-deg)*0.02;
  function bar(x,h,col,lab){return "<rect x="+x+" y="+(130-h*300)+" width='50' height="+(h*300)+" fill="+col+"/><text x="+(x+25)+" y='145' fill='#c8bda9' font-size='9' text-anchor='middle' font-family='monospace'>"+lab+"</text>";}
  document.getElementById("err").innerHTML="<text x='130' y='14' fill='#8a7c63' font-size='9' text-anchor='middle' font-family='monospace'>error</text>"+bar(70,trainE,"'#22c55e'","train")+bar(150,testE,"'#fb7185'","test");
  var msg=deg<4?"<b>Underfit:</b> too simple to capture the curve. Both errors high.":deg>9?"<b>Overfit:</b> the curve chases noise. Train error tiny, <b>test error climbing</b> — it won't generalise.":"<b>Good fit:</b> captures the signal, ignores the noise. This is the sweet spot.";
  document.getElementById("lab").innerHTML=msg;
}
document.getElementById("c").addEventListener("input",draw);
draw();
`,
      {
        question: "As you crank model complexity up, what does the TEST error do?",
        options: ["Falls forever, just like training error", "Falls, then turns back up", "Stays flat the whole time"],
        answer: 1,
        reveal: "Training error keeps dropping, but test error is <b>U-shaped</b>: too simple underfits, too complex chases noise. The bottom of the U is the model you actually want.",
      },
    ),
  bridge: "Plot train vs validation error against complexity (polynomial degree or tree depth) on a real split — find the point where validation error bottoms out.",
};

/** Gradient descent ball rolling down a loss curve; tune learning rate. */
const gradientDescent: ConceptWidgetDef = {
  id: "gradient-descent",
  title: "Gradient descent, step by step",
  blurb: "Set a learning rate and watch the ball roll toward the minimum — or overshoot.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Rolling downhill on the loss surface</div>
       <div class="w-sub">each step moves opposite the slope. Too big a step and it bounces; too small and it crawls</div>
       <svg id="sv" viewBox="0 0 280 160" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-row"><span class="w-label">learning rate</span><input id="lr" type="range" min="0.01" max="1.05" step="0.01" value="0.18"><span class="w-val" id="lrv">0.18</span></div>
       <div class="w-row"><button class="w-btn" id="step">Step</button><button class="w-btn alt" id="reset">Reset</button><span class="w-chip" id="info"></span></div>
       <div class="w-note" id="lab">Click Step to take one gradient step.</div>`,
      `
var W=280,H=160;
function loss(x){return 0.9*(x-0.55)*(x-0.55);}
function grad(x){return 1.8*(x-0.55);}
var x=0.06,hist=[x];
function px(x){return 14+x*(W-28);}
function py(x){return H-18-loss(x)*150;}
function draw(){
  var lr=+document.getElementById("lr").value;document.getElementById("lrv").textContent=lr.toFixed(2);
  var s="";
  for(var t=0;t<=1;t+=0.01)s+="<circle cx="+px(t).toFixed(1)+" cy="+py(t).toFixed(1)+" r='1' fill='#3a2f20'/>";
  for(var i=1;i<hist.length;i++){
    s+="<line x1="+px(hist[i-1])+" y1="+py(hist[i-1])+" x2="+px(hist[i])+" y2="+py(hist[i])+" stroke='#D4AF37' stroke-width='1' opacity='.5'/>";
  }
  hist.forEach(function(h,i){s+="<circle cx="+px(h)+" cy="+py(h)+" r='"+(i===hist.length-1?4.5:2.5)+"' fill='"+(i===hist.length-1?"#22c55e":"#D4AF37")+"'/>";});
  document.getElementById("sv").innerHTML=s;
  document.getElementById("info").textContent="loss "+loss(x).toFixed(3);
}
document.getElementById("step").onclick=function(){
  var lr=+document.getElementById("lr").value;
  x=x-lr*grad(x);x=Math.max(-0.1,Math.min(1.1,x));hist.push(x);
  if(hist.length>40)hist.shift();
  var lab=lr>0.95?"<b>Diverging:</b> the step is so big it overshoots and the loss <i>grows</i>.":Math.abs(x-0.55)<0.02?"<b>Converged.</b> The slope is ~0, so steps barely move — you've found the minimum.":lr<0.05?"<b>Crawling:</b> tiny steps are safe but slow. This is the trade-off the learning rate controls.":"Stepping downhill — opposite the slope, scaled by the learning rate.";
  document.getElementById("lab").innerHTML=lab;draw();
};
document.getElementById("reset").onclick=function(){x=0.06;hist=[x];document.getElementById("lab").textContent="Click Step to take one gradient step.";draw();};
document.getElementById("lr").addEventListener("input",draw);
draw();
`,
      {
        question: "Set a very large learning rate. What happens to the ball?",
        options: ["It reaches the minimum faster", "It overshoots and the loss can grow", "It freezes in place"],
        answer: 1,
        reveal: "Too big a step jumps past the minimum and climbs the other side — the loss <b>diverges</b>. Too small and it crawls. The learning rate is the dial between the two.",
      },
    ),
  bridge: "In a notebook, run gradient descent on a simple quadratic with lr = 0.01, 0.3, and 1.1 — log the loss each step and watch one of them blow up.",
};

/** Slide the decision threshold; confusion matrix + precision/recall update. */
const confusionMatrix: ConceptWidgetDef = {
  id: "confusion-matrix",
  title: "Threshold, precision, and recall",
  blurb: "Slide the decision threshold and watch precision trade off against recall.",
  html: () =>
    widgetDoc(
      `<div class="w-title">One classifier, many thresholds</div>
       <div class="w-sub">the model outputs a probability — YOU choose the cut-off. Slide it and watch the four boxes shift</div>
       <svg id="sv" viewBox="0 0 280 90" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-row"><span class="w-label">threshold</span><input id="t" type="range" min="0.05" max="0.95" step="0.01" value="0.5"><span class="w-val" id="tv">0.50</span></div>
       <div style="display:flex;gap:8px;flex-wrap:wrap" id="mtx"></div>
       <div class="w-row" style="gap:16px"><span class="w-chip" id="prec"></span><span class="w-chip" id="rec"></span></div>
       <div class="w-note">Raise the threshold &rarr; fewer positives, so <b>precision</b> rises but <b>recall</b> falls (you miss real positives). This trade-off never goes away — you pick the side that's cheaper to be wrong on.</div>`,
      `
var data=[];
for(var i=0;i<40;i++){data.push({p:Math.random(),y:Math.random()<0.45?1:0});}
data.forEach(function(d){d.p=d.y?Math.min(0.98,d.p*0.6+0.4):d.p*0.6;});
function draw(){
  var t=+document.getElementById("t").value;document.getElementById("tv").textContent=t.toFixed(2);
  var tp=0,fp=0,tn=0,fn=0,s="";
  data.forEach(function(d,i){
    var pred=d.p>=t;
    if(pred&&d.y)tp++;else if(pred&&!d.y)fp++;else if(!pred&&d.y)fn++;else tn++;
    var x=8+(i%20)*13.5, y=d.y?22:60;
    var col=d.y?(pred?"#22c55e":"#fb7185"):(pred?"#fbbf24":"#3a2f20");
    s+="<circle cx="+x+" cy="+y+" r='4' fill='"+col+"'/>";
  });
  s+="<line x1='4' y1='42' x2='276' y2='42' stroke='#8a7c63' stroke-dasharray='2 2'/>";
  s+="<text x='6' y='16' fill='#8a7c63' font-size='8' font-family='monospace'>actual positive</text>";
  s+="<text x='6' y='84' fill='#8a7c63' font-size='8' font-family='monospace'>actual negative</text>";
  document.getElementById("sv").innerHTML=s;
  function box(l,v,c){return "<div style='flex:1;min-width:62px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:7px;padding:7px;text-align:center'><div style='font-family:monospace;font-size:9px;color:"+c+"'>"+l+"</div><div style='font-size:18px;font-weight:700;color:var(--text)'>"+v+"</div></div>";}
  document.getElementById("mtx").innerHTML=box("True Pos","#22c55e","")+box("False Pos","#fbbf24","")+box("False Neg","#fb7185","")+box("True Neg","#8a7c63","");
  var prec=tp+fp?tp/(tp+fp):0,rec=tp+fn?tp/(tp+fn):0;
  document.getElementById("prec").innerHTML="precision "+(prec*100).toFixed(0)+"%";
  document.getElementById("rec").innerHTML="recall "+(rec*100).toFixed(0)+"%";
}
document.getElementById("t").addEventListener("input",draw);
draw();
`,
      {
        question: "You raise the decision threshold. What happens to precision and recall?",
        options: ["Both rise together", "Precision rises, recall falls", "Both fall together"],
        answer: 1,
        reveal: "A higher cut-off flags only the most confident positives — so you're right more often (<b>precision↑</b>) but miss borderline real ones (<b>recall↓</b>). You can't max both at once.",
      },
    ),
  bridge: "On a real classifier's predict_proba output, sweep the threshold and plot precision and recall — pick the point that matches which error is costlier for your problem.",
};

/** Side-by-side: same points seen by regression / classification / clustering. */
const mlTaskTypes: ConceptWidgetDef = {
  id: "ml-task-types",
  title: "Regression vs classification vs clustering",
  blurb: "Same dots, three questions — see how the task changes what the model draws.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Three questions you can ask of the same data</div>
       <div class="w-sub">click each — the data never changes, only what we're trying to learn</div>
       <div class="w-row" id="btns"></div>
       <svg id="sv" viewBox="0 0 260 180" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-note" id="why"></div>`,
      `
var P=[];for(var i=0;i<40;i++){var x=Math.random();P.push({x:x,y:0.3*x+0.2+ (Math.random()-0.5)*0.3, lab:Math.random()<0.5?0:1});}
var modes=[
  {k:"reg",label:"Regression",why:"<b>Predict a number.</b> 'Given x, what's y?' We fit a line/curve and read off a continuous value. (labels: known, numeric)"},
  {k:"cls",label:"Classification",why:"<b>Predict a category.</b> 'Is this red or blue?' We draw a boundary between known classes. (labels: known, categorical)"},
  {k:"clu",label:"Clustering",why:"<b>Find structure with NO labels.</b> 'Which dots naturally group together?' Nobody told us the answer — the algorithm groups by similarity. (labels: none)"}
];
var cur="reg";
function draw(){
  var w=260,h=180;function px(x){return 14+x*(w-28);}function py(y){return h-14-y*(h-28);}
  var s="";
  if(cur==="reg"){
    P.forEach(function(p){s+="<circle cx="+px(p.x)+" cy="+py(p.y)+" r='3' fill='#60a5fa'/>";});
    s+="<line x1="+px(0)+" y1="+py(0.2)+" x2="+px(1)+" y2="+py(0.5)+" stroke='#D4AF37' stroke-width='2'/>";
  } else if(cur==="cls"){
    P.forEach(function(p){s+="<circle cx="+px(p.x)+" cy="+py(p.y)+" r='3' fill='"+(p.lab?"#fb7185":"#60a5fa")+"'/>";});
    s+="<line x1="+px(0.5)+" y1='14' x2="+px(0.5)+" y2='166' stroke='#D4AF37' stroke-width='2' stroke-dasharray='5 3'/>";
  } else {
    var cx=[0.25,0.75];
    P.forEach(function(p){var g=Math.abs(p.x-cx[0])<Math.abs(p.x-cx[1])?0:1;s+="<circle cx="+px(p.x)+" cy="+py(p.y)+" r='3' fill='"+(g?"#22c55e":"#c084fc")+"'/>";});
    cx.forEach(function(c,i){s+="<rect x="+(px(c)-4)+" y='84' width='8' height='8' fill='"+(i?"#22c55e":"#c084fc")+"' stroke='#15110d' stroke-width='2'/>";});
  }
  document.getElementById("sv").innerHTML=s;
  document.getElementById("why").innerHTML=modes.filter(function(m){return m.k===cur;})[0].why;
}
var bw=document.getElementById("btns");
modes.forEach(function(m){var b=document.createElement("button");b.className="w-btn"+(m.k===cur?"":" alt");b.textContent=m.label;
  b.onclick=function(){cur=m.k;[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(modes[i].k===cur?"":" alt");});draw();};bw.appendChild(b);});
draw();
`,
      {
        question: "You have data with NO labels and want to find natural groups. Which task is that?",
        options: ["Regression", "Classification", "Clustering"],
        answer: 2,
        reveal: "No labels + 'which things group together' = <b>clustering</b>. Regression predicts a number and classification predicts a known category — both need labelled examples to learn from.",
      },
    ),
  bridge: "Take one dataset and frame all three: predict a numeric column, predict a category column, then drop the labels and cluster — same rows, three different questions.",
};

export const mlWidgets: ConceptWidgetDef[] = [
  kmeansStepper,
  knnBoundary,
  trainTestOverfit,
  gradientDescent,
  confusionMatrix,
  mlTaskTypes,
];
