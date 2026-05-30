import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** Type `df` vs `df["col"]` vs a boolean mask, and watch the table react. */
const dfInspector: ConceptWidgetDef = {
  id: "df-inspector",
  title: "What pandas actually returns",
  blurb: "Click an expression and see exactly what comes back.",
  html: () =>
    widgetDoc(
      `<div class="w-title">df = a tiny DataFrame of orders</div>
       <div class="w-sub">click an expression below — the output is what Python would print</div>
       <div class="w-row" id="btns"></div>
       <div id="expr" class="mono" style="font-size:13px;color:var(--accent-soft);margin:6px 0 10px"></div>
       <div id="out"></div>
       <div class="w-note" id="why"></div>`,
      `
var data=[
  {city:"Banjul",qty:2,paid:true},
  {city:"Serrekunda",qty:5,paid:false},
  {city:"Banjul",qty:2,paid:true},
  {city:"Brikama",qty:9,paid:true}
];
var cols=["city","qty","paid"];
var modes=[
  {k:"df", label:"df", why:"The whole DataFrame — every row, every column."},
  {k:"col", label:'df["qty"]', why:"One column. This is a <b>Series</b>, not a table — a single labelled column of values."},
  {k:"mask", label:'df["qty"]==2', why:"A <b>boolean mask</b>. Same length as the column, but every value is True/False. It does NOT filter yet — it just marks which rows match."},
  {k:"filter", label:'df[df["qty"]==2]', why:"Now the mask is used to <b>filter</b>. Only rows where the mask was True survive. This two-step (mask, then index by it) is the heart of pandas filtering."}
];
var cur="df";
function esc(v){return v===true?"True":v===false?"False":String(v);}
function render(){
  var m=modes.filter(function(x){return x.k===cur;})[0];
  document.getElementById("expr").innerHTML="&gt;&gt;&gt; "+m.label;
  document.getElementById("why").innerHTML=m.why;
  var html="";
  if(cur==="df"||cur==="filter"){
    html="<table><tr><th></th>";
    cols.forEach(function(c){html+="<th>"+c+"</th>";});
    html+="</tr>";
    data.forEach(function(r,i){
      var keep=cur==="df"||r.qty===2;
      if(cur==="filter"&&!keep)return;
      html+="<tr"+(cur==="filter"?" class=hit":"")+"><th>"+i+"</th>";
      cols.forEach(function(c){html+="<td>"+esc(r[c])+"</td>";});
      html+="</tr>";
    });
    html+="</table>";
  } else if(cur==="col"){
    html="<table><tr><th></th><th>qty</th></tr>";
    data.forEach(function(r,i){html+="<tr><th>"+i+"</th><td>"+r.qty+"</td></tr>";});
    html+="</table><div class='w-sub' style='margin-top:6px'>dtype: int64 · Name: qty</div>";
  } else if(cur==="mask"){
    html="<table><tr><th></th><th>qty==2</th></tr>";
    data.forEach(function(r,i){
      var hit=r.qty===2;
      html+="<tr"+(hit?" class=hit":"")+"><th>"+i+"</th><td>"+(hit?"True":"False")+"</td></tr>";
    });
    html+="</table><div class='w-sub' style='margin-top:6px'>dtype: bool</div>";
  }
  document.getElementById("out").innerHTML=html;
}
var bw=document.getElementById("btns");
modes.forEach(function(m){
  var b=document.createElement("button");
  b.className="w-btn"+(m.k===cur?"":" alt");
  b.innerHTML=m.label;
  b.onclick=function(){cur=m.k;[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(modes[i].k===cur?"":" alt");});render();};
  bw.appendChild(b);
});
render();
`,
      {
        question: 'df["qty"]==2 — what does pandas hand back?',
        options: ["The 2 matching rows", "A True/False for every row", "Just the number 2"],
        answer: 1,
        reveal: "It's a <b>boolean mask</b> — same length as the column, all True/False. It marks which rows match; it hasn't filtered anything yet.",
      },
    ),
  bridge: "Open a notebook, build a 4-row DataFrame, and run all four expressions yourself — then check df['qty'].dtype is int and the mask's dtype is bool.",
};

/** Drag slope + intercept; the line moves and the squared error updates live. */
const regressionSlider: ConceptWidgetDef = {
  id: "regression-slider",
  title: "Slope, intercept, and the line of best fit",
  blurb: "Tune the line by hand, then let least-squares snap it into place.",
  html: () =>
    widgetDoc(
      `<div class="w-title">y = m·x + b</div>
       <div class="w-sub">drag the sliders to fit the line through the points — minimise the total squared error</div>
       <svg id="plot" viewBox="0 0 320 200" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-row"><span class="w-label">slope (m)</span><input id="m" type="range" min="-2" max="4" step="0.05" value="0.4"><span class="w-val" id="mv">0.40</span></div>
       <div class="w-row"><span class="w-label">intercept (b)</span><input id="b" type="range" min="-40" max="120" step="1" value="20"><span class="w-val" id="bv">20</span></div>
       <div class="w-row"><button class="w-btn" id="best">Snap to best fit</button><span class="w-chip" id="err"></span></div>
       <div class="w-note">The dashed grey lines are <b>residuals</b> — the miss on each point. Least-squares finds the one line that makes the <b>sum of their squares</b> as small as possible.</div>`,
      `
var pts=[[1,30],[2,38],[3,55],[4,58],[5,80],[6,78],[7,99],[8,110]];
var W=320,H=200,padL=34,padB=24,padT=10,padR=10;
var xmin=0,xmax=9,ymin=0,ymax=130;
function sx(x){return padL+(x-xmin)/(xmax-xmin)*(W-padL-padR);}
function sy(y){return H-padB-(y-ymin)/(ymax-ymin)*(H-padT-padB);}
var svg=document.getElementById("plot");
function draw(){
  var m=+document.getElementById("m").value, b=+document.getElementById("b").value;
  document.getElementById("mv").textContent=m.toFixed(2);
  document.getElementById("bv").textContent=b.toFixed(0);
  var sse=0;
  var s="";
  s+="<line x1="+padL+" y1="+sy(0)+" x2="+sx(xmax)+" y2="+sy(0)+" stroke='#3a2f20'/>";
  s+="<line x1="+padL+" y1="+padT+" x2="+padL+" y2="+sy(0)+" stroke='#3a2f20'/>";
  pts.forEach(function(p){
    var pred=m*p[0]+b; sse+=(p[1]-pred)*(p[1]-pred);
    s+="<line x1="+sx(p[0])+" y1="+sy(p[1])+" x2="+sx(p[0])+" y2="+sy(pred)+" stroke='#8a7c63' stroke-dasharray='3 2'/>";
  });
  s+="<line x1="+sx(xmin)+" y1="+sy(m*xmin+b)+" x2="+sx(xmax)+" y2="+sy(m*xmax+b)+" stroke='#D4AF37' stroke-width='2'/>";
  pts.forEach(function(p){
    s+="<circle cx="+sx(p[0])+" cy="+sy(p[1])+" r='4' fill='#60a5fa'/>";
  });
  svg.innerHTML=s;
  document.getElementById("err").textContent="squared error: "+Math.round(sse);
}
function fit(){
  var n=pts.length,sx2=0,sy2=0,sxy=0,sxx=0;
  pts.forEach(function(p){sx2+=p[0];sy2+=p[1];sxy+=p[0]*p[1];sxx+=p[0]*p[0];});
  var m=(n*sxy-sx2*sy2)/(n*sxx-sx2*sx2);
  var b=(sy2-m*sx2)/n;
  return [m,b];
}
document.getElementById("m").addEventListener("input",draw);
document.getElementById("b").addEventListener("input",draw);
document.getElementById("best").addEventListener("click",function(){
  var f=fit();
  document.getElementById("m").value=f[0].toFixed(2);
  document.getElementById("b").value=f[1].toFixed(0);
  draw();
});
draw();
`,
      {
        question: "To fit best, least-squares makes which quantity as small as possible?",
        options: ["The total distance to the points", "The sum of the squared misses", "The count of points above the line"],
        answer: 1,
        reveal: "It minimises the <b>sum of squared residuals</b>. Squaring punishes big misses far more than small ones — which is why a single outlier can swing the whole line.",
      },
    ),
  bridge: "Fit the same points with sklearn's LinearRegression in a notebook and confirm .coef_ and .intercept_ match what 'Snap to best fit' found.",
};

/** Drag mean + spread; histogram + mean/median/std update. */
const distributionStats: ConceptWidgetDef = {
  id: "distribution-stats",
  title: "Mean, median, and spread",
  blurb: "Shift and stretch a distribution; watch the summary stats move.",
  html: () =>
    widgetDoc(
      `<div class="w-title">One distribution, three numbers</div>
       <div class="w-sub">slide the centre and the spread — see how mean, median and std respond</div>
       <svg id="hist" viewBox="0 0 320 150" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-row"><span class="w-label">centre</span><input id="c" type="range" min="20" max="80" step="1" value="50"><span class="w-val" id="cv">50</span></div>
       <div class="w-row"><span class="w-label">spread</span><input id="s" type="range" min="3" max="25" step="1" value="10"><span class="w-val" id="sv">10</span></div>
       <div class="w-row"><span class="w-label">skew right</span><input id="k" type="range" min="0" max="1" step="0.05" value="0"><span class="w-val" id="kv">0.0</span></div>
       <div class="w-row" style="gap:18px">
         <span class="w-chip" id="mean"></span><span class="w-chip" id="med"></span><span class="w-chip" id="std"></span></div>
       <div class="w-note">Turn up <b>skew</b> and watch the <b>mean</b> get pulled toward the long tail while the <b>median</b> barely moves. That gap is why we report the median for incomes, house prices, and anything lopsided.</div>`,
      `
var W=320,H=150,n=400;
function gen(c,s,k){
  var a=[];
  for(var i=0;i<n;i++){
    var u=0;for(var j=0;j<6;j++)u+=Math.random();u=(u-3)/3*s;
    var v=c+u; if(k>0)v=c+(u>=0?u*(1+3*k):u); a.push(v);
  }
  return a;
}
function stats(a){
  var s=a.slice().sort(function(x,y){return x-y;});
  var mean=a.reduce(function(p,q){return p+q;},0)/a.length;
  var med=s[Math.floor(s.length/2)];
  var v=a.reduce(function(p,q){return p+(q-mean)*(q-mean);},0)/a.length;
  return {mean:mean,med:med,std:Math.sqrt(v)};
}
function draw(){
  var c=+document.getElementById("c").value,s=+document.getElementById("s").value,k=+document.getElementById("k").value;
  document.getElementById("cv").textContent=c;
  document.getElementById("sv").textContent=s;
  document.getElementById("kv").textContent=k.toFixed(1);
  var a=gen(c,s,k),bins=30,lo=0,hi=110,bw=(hi-lo)/bins,h=new Array(bins).fill(0);
  a.forEach(function(x){var b=Math.floor((x-lo)/bw);if(b>=0&&b<bins)h[b]++;});
  var mx=Math.max.apply(null,h)||1,st=stats(a);
  var out="";
  for(var i=0;i<bins;i++){
    var bh=h[i]/mx*(H-20),x=10+i*((W-20)/bins);
    out+="<rect x="+x.toFixed(1)+" y="+(H-10-bh).toFixed(1)+" width="+((W-20)/bins-1).toFixed(1)+" height="+bh.toFixed(1)+" fill='#60a5fa' opacity='.8'/>";
  }
  function vx(val){return 10+(val-lo)/(hi-lo)*(W-20);}
  out+="<line x1="+vx(st.mean)+" y1='4' x2="+vx(st.mean)+" y2="+(H-10)+" stroke='#D4AF37' stroke-width='2'/>";
  out+="<line x1="+vx(st.med)+" y1='4' x2="+vx(st.med)+" y2="+(H-10)+" stroke='#22c55e' stroke-width='2' stroke-dasharray='4 3'/>";
  document.getElementById("hist").innerHTML=out;
  document.getElementById("mean").innerHTML="mean "+st.mean.toFixed(1);
  document.getElementById("mean").style.color="#D4AF37";
  document.getElementById("med").innerHTML="median "+st.med.toFixed(1);
  document.getElementById("med").style.color="#22c55e";
  document.getElementById("std").innerHTML="std "+st.std.toFixed(1);
}
["c","s","k"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
draw();
`,
      {
        question: "Skew the data hard to the right. What happens to the mean and median?",
        options: ["Both slide right together", "The mean gets pulled right; the median barely moves", "The median moves; the mean stays put"],
        answer: 1,
        reveal: "The <b>mean</b> chases the long tail while the <b>median</b> just counts to the middle. That gap is exactly why incomes and house prices are reported as medians.",
      },
    ),
  bridge: "Load a skewed real column (salaries, prices) in pandas and compare .mean() to .median() — the wider the gap, the more skew.",
};

/** Drag correlation; scatter cloud morphs from -1 to +1. */
const correlationScatter: ConceptWidgetDef = {
  id: "correlation-scatter",
  title: "What correlation looks like",
  blurb: "Drag r from -1 to +1 and watch the cloud tighten and flip.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Correlation coefficient r</div>
       <div class="w-sub">r measures how tightly two variables move together — not whether one causes the other</div>
       <svg id="sc" viewBox="0 0 240 180" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-row"><span class="w-label">r</span><input id="r" type="range" min="-1" max="1" step="0.05" value="0.8"><span class="w-val" id="rv">0.80</span></div>
       <div class="w-note" id="lab"></div>`,
      `
var W=240,H=180,N=60,base=[];
for(var i=0;i<N;i++){base.push([Math.random()*2-1,Math.random()*2-1]);}
function draw(){
  var r=+document.getElementById("r").value;
  document.getElementById("rv").textContent=r.toFixed(2);
  var out="";
  base.forEach(function(p){
    var x=p[0], y=r*x+Math.sqrt(Math.max(0,1-r*r))*p[1];
    var px=20+(x+1)/2*(W-40), py=H-15-(y+1)/2*(H-30);
    out+="<circle cx="+px.toFixed(1)+" cy="+py.toFixed(1)+" r='3' fill='#c084fc' opacity='.75'/>";
  });
  document.getElementById("sc").innerHTML=out;
  var d=Math.abs(r), strength=d>.85?"very strong":d>.6?"strong":d>.3?"moderate":d>.1?"weak":"basically none";
  var dir=r>.1?"positive — they rise together":r<-.1?"negative — one rises as the other falls":"no linear relationship";
  document.getElementById("lab").innerHTML="<b>"+strength+"</b>, "+dir+".";
}
document.getElementById("r").addEventListener("input",draw);
draw();
`,
      {
        question: "A correlation of r = 0 between two variables means…",
        options: ["They are completely unrelated", "No straight-line link — they could still curve together", "One must cause the other"],
        answer: 1,
        reveal: "r only measures <b>linear</b> association. A perfect U-shape can sit at r≈0 while being tightly related — and a high r never proves causation.",
      },
    ),
  bridge: "Run df.corr() on a real dataset, then scatter-plot the strongest pair — check the number actually matches the shape your eyes see.",
};

/** Pick an aggregation; see groupby collapse rows. */
const groupbyAggregator: ConceptWidgetDef = {
  id: "groupby-aggregator",
  title: "groupby: split, apply, combine",
  blurb: "Choose a function and watch many rows collapse into one per group.",
  html: () =>
    widgetDoc(
      `<div class="w-title">df.groupby("city")["qty"].agg(...)</div>
       <div class="w-sub">pick an aggregation — every city's rows collapse to a single number</div>
       <div class="w-row" id="aggbtns"></div>
       <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
         <div><div class="w-sub">raw rows</div><div id="raw"></div></div>
         <div style="align-self:center;color:var(--accent);font-size:20px">&rarr;</div>
         <div><div class="w-sub">result</div><div id="res"></div></div>
       </div>
       <div class="w-note">groupby is three steps: <b>split</b> rows into groups by key, <b>apply</b> a function to each group, <b>combine</b> the answers into one row per group.</div>`,
      `
var rows=[["Banjul",2],["Serrekunda",5],["Banjul",4],["Brikama",9],["Serrekunda",1],["Banjul",3]];
var aggs=[
  {k:"sum",f:function(a){return a.reduce(function(p,q){return p+q;},0);}},
  {k:"mean",f:function(a){return (a.reduce(function(p,q){return p+q;},0)/a.length).toFixed(1);}},
  {k:"max",f:function(a){return Math.max.apply(null,a);}},
  {k:"count",f:function(a){return a.length;}}
];
var cur="sum";
function rawTable(){
  var h="<table><tr><th>city</th><th>qty</th></tr>";
  rows.forEach(function(r){h+="<tr><td>"+r[0]+"</td><td>"+r[1]+"</td></tr>";});
  return h+"</table>";
}
function result(){
  var g={};rows.forEach(function(r){(g[r[0]]=g[r[0]]||[]).push(r[1]);});
  var f=aggs.filter(function(a){return a.k===cur;})[0].f;
  var h="<table><tr><th>city</th><th>"+cur+"</th></tr>";
  Object.keys(g).forEach(function(c){h+="<tr class=hit><td>"+c+"</td><td>"+f(g[c])+"</td></tr>";});
  return h+"</table>";
}
function render(){document.getElementById("res").innerHTML=result();}
var bw=document.getElementById("aggbtns");
aggs.forEach(function(a){
  var b=document.createElement("button");b.className="w-btn"+(a.k===cur?"":" alt");b.textContent=a.k;
  b.onclick=function(){cur=a.k;[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(aggs[i].k===cur?"":" alt");});render();};
  bw.appendChild(b);
});
document.getElementById("raw").innerHTML=rawTable();
render();
`,
      {
        question: "df.groupby('city')['qty'].sum() gives you back…",
        options: ["One row per original order", "One row per city", "A single grand total"],
        answer: 1,
        reveal: "groupby <b>collapses</b> each group to one row: split by the key, apply the function per group, combine into one row per city.",
      },
    ),
  bridge: "In pandas, groupby a real dataset by a category and try .sum(), .mean(), .count() — watch the row count fall to the number of groups.",
};

/** Toggle join type; see which rows survive. */
const joinVisualiser: ConceptWidgetDef = {
  id: "join-visualiser",
  title: "INNER vs LEFT vs OUTER join",
  blurb: "Switch the join type and watch which rows survive and where NULLs appear.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Joining customers to orders on id</div>
       <div class="w-sub">the join type decides what happens to rows with no match on the other side</div>
       <div class="w-row" id="jbtns"></div>
       <div id="out"></div>
       <div class="w-note" id="why"></div>`,
      `
var left=[{id:1,name:"Awa"},{id:2,name:"Lamin"},{id:3,name:"Fatou"}];
var right=[{id:1,total:40},{id:2,total:75},{id:4,total:12}];
var joins=[
  {k:"inner",why:"<b>INNER</b>: keep only ids present on <i>both</i> sides. Fatou (no order) and order #4 (no customer) both vanish."},
  {k:"left",why:"<b>LEFT</b>: keep every customer. Fatou stays but her total is <b>NULL</b> — there was no matching order."},
  {k:"outer",why:"<b>OUTER</b>: keep everything from both sides. Unmatched cells on either side become <b>NULL</b>."}
];
var cur="inner";
function build(){
  var ids;
  if(cur==="inner")ids=left.filter(function(l){return right.some(function(r){return r.id===l.id;});}).map(function(l){return l.id;});
  else if(cur==="left")ids=left.map(function(l){return l.id;});
  else{ids=[];left.forEach(function(l){ids.push(l.id);});right.forEach(function(r){if(ids.indexOf(r.id)<0)ids.push(r.id);});}
  var h="<table><tr><th>id</th><th>name</th><th>total</th></tr>";
  ids.forEach(function(id){
    var l=left.filter(function(x){return x.id===id;})[0];
    var r=right.filter(function(x){return x.id===id;})[0];
    var nm=l?l.name:"<span style='color:var(--red)'>NULL</span>";
    var tt=r?r.total:"<span style='color:var(--red)'>NULL</span>";
    h+="<tr class=hit><td>"+id+"</td><td>"+nm+"</td><td>"+tt+"</td></tr>";
  });
  document.getElementById("out").innerHTML=h+"</table>";
  document.getElementById("why").innerHTML=joins.filter(function(j){return j.k===cur;})[0].why;
}
var bw=document.getElementById("jbtns");
joins.forEach(function(j){
  var b=document.createElement("button");b.className="w-btn"+(j.k===cur?"":" alt");b.textContent=j.k.toUpperCase()+" JOIN";
  b.onclick=function(){cur=j.k;[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(joins[i].k===cur?"":" alt");});build();};
  bw.appendChild(b);
});
build();
`,
      {
        question: "A customer with no orders. After an INNER join of customers→orders, that customer…",
        options: ["Stays, with NULL for the order columns", "Disappears from the result", "Triggers an error"],
        answer: 1,
        reveal: "<b>INNER</b> keeps only ids found on both sides, so the order-less customer vanishes. Switch to <b>LEFT</b> to keep her with NULL totals.",
      },
    ),
  bridge: "Join two real tables with SQL or pandas .merge(how=...), then count rows after each type — you'll see INNER ≤ LEFT ≤ OUTER.",
};

export const dataWidgets: ConceptWidgetDef[] = [
  dfInspector,
  regressionSlider,
  distributionStats,
  correlationScatter,
  groupbyAggregator,
  joinVisualiser,
];
