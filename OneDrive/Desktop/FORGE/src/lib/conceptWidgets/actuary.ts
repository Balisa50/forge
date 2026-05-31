/**
 * Interactive sims for the actuary concept paths (Exam P + Exam FM).
 *
 * Same sandboxed-iframe contract as every other concept widget (see scaffold.ts):
 * each def returns a full self-contained HTML doc via widgetDoc(body, script).
 * No network, no storage, theme tokens only. These are the "feel it" pieces that
 * turn an abstract identity into something the student has watched move.
 */

import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/* ─────────────────────────── Bayes box ─────────────────────────── */
const bayesBox: ConceptWidgetDef = {
  id: "bayes-box",
  title: "Bayes box — the base-rate trap",
  blurb: "Set how rare a condition is and how accurate the test is, then watch how few positives are real.",
  bridge:
    "On the exam, a Bayes question is just this box in words. Read off P(disease) and the two accuracy rates, fill 10,000 people, and read the answer from the positive column.",
  html: () =>
    widgetDoc(
      `
<div class="w-title">Bayes box · per 10,000 people</div>
<div class="w-sub">posterior P(D | +) updates live</div>
<div class="w-row"><span class="w-label">Prevalence P(D)</span><input id="prev" type="range" min="0.1" max="50" step="0.1" value="1"><span class="w-val" id="prevV">1%</span></div>
<div class="w-row"><span class="w-label">Sensitivity</span><input id="sens" type="range" min="50" max="100" step="0.5" value="99"><span class="w-val" id="sensV">99%</span></div>
<div class="w-row"><span class="w-label">Specificity</span><input id="spec" type="range" min="50" max="100" step="0.5" value="99"><span class="w-val" id="specV">99%</span></div>
<svg id="grid" viewBox="0 0 320 120" style="margin-top:6px"></svg>
<div class="w-note" id="out"></div>
`,
      `
var prev=document.getElementById("prev"),sens=document.getElementById("sens"),spec=document.getElementById("spec");
var grid=document.getElementById("grid"),out=document.getElementById("out");
var COL={tp:"#22c55e",fn:"#3a2f20",fp:"#ef4444",tn:"#1c1711"};
function draw(){
  var p=+prev.value/100, se=+sens.value/100, sp=+spec.value/100;
  document.getElementById("prevV").textContent=(+prev.value).toFixed(1)+"%";
  document.getElementById("sensV").textContent=(+sens.value).toFixed(1)+"%";
  document.getElementById("specV").textContent=(+spec.value).toFixed(1)+"%";
  var N=10000, dis=p*N, well=N-dis;
  var tp=dis*se, fn=dis-tp, fp=well*(1-sp), tn=well-fp;
  var post= tp/(tp+fp||1);
  // stacked bars: diseased row (tp,fn) and well row (fp,tn), widths ~ counts
  var W=320,H=120, scale=W/N;
  function bar(y,segs){
    var x=0,s="";
    segs.forEach(function(g){var w=Math.max(g.n*scale,g.n>0?0.6:0);
      s+='<rect x="'+x.toFixed(1)+'" y="'+y+'" width="'+w.toFixed(1)+'" height="46" fill="'+g.c+'"><title>'+g.t+': '+Math.round(g.n)+'</title></rect>';x+=w;});
    return s;
  }
  grid.innerHTML=bar(8,[{n:tp,c:COL.tp,t:"True positive"},{n:fn,c:COL.fn,t:"False negative"}])
    +bar(62,[{n:fp,c:COL.fp,t:"False positive"},{n:tn,c:COL.tn,t:"True negative"}])
    +'<text x="2" y="6" fill="#8a7c63" font-size="7" font-family="monospace">HAVE DISEASE</text>'
    +'<text x="2" y="60" fill="#8a7c63" font-size="7" font-family="monospace">HEALTHY</text>';
  out.innerHTML="Of <b>"+Math.round(tp+fp)+"</b> positive tests, only <b style='color:#22c55e'>"+Math.round(tp)+
    "</b> truly have it. So a positive result means disease with probability <b style='color:#D4AF37'>"+
    (post*100).toFixed(1)+"%</b>.<br><span style='color:#8a7c63'>P(D|+) = "+Math.round(tp)+" / ("+Math.round(tp)+" + "+Math.round(fp)+")</span>";
}
[prev,sens,spec].forEach(function(el){el.addEventListener("input",draw);});
draw();
`,
      {
        question: "A disease hits 1% of people. A test is 99% sensitive and 99% specific. You test positive. P(you have it)?",
        options: ["~99%", "~50%", "~9%"],
        answer: 1,
        reveal:
          "About <b>50%</b>. With 10,000 people: 99 sick test positive, but 99 of the 9,900 healthy ALSO test positive. Half of all positives are false — the rare base rate dominates.",
      },
    ),
};

/* ───────────────────── Distribution explorer ───────────────────── */
const distExplorer: ConceptWidgetDef = {
  id: "dist-explorer",
  title: "Distribution explorer",
  blurb: "Switch distribution and drag its parameters; watch the shape, mean, and variance move together.",
  bridge:
    "Every Exam P distribution question starts by naming the distribution and its parameters. Train your eye here so you recognise the shape and recall E[X], Var[X] on sight.",
  html: () =>
    widgetDoc(
      `
<div class="w-title">Distribution explorer</div>
<div class="w-sub">pmf / pdf · mean (gold line) · ±1 sd</div>
<div class="w-row">
  <span class="w-label">Distribution</span>
  <select id="dist" style="font-family:var(--mono);font-size:12px;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:5px 8px;flex:1">
    <option value="binom">Binomial (n, p)</option>
    <option value="pois">Poisson (λ)</option>
    <option value="geom">Geometric (p)</option>
    <option value="norm">Normal (μ, σ)</option>
    <option value="expo">Exponential (λ)</option>
  </select>
</div>
<div class="w-row" id="r1"><span class="w-label" id="l1"></span><input id="p1" type="range"><span class="w-val" id="v1"></span></div>
<div class="w-row" id="r2"><span class="w-label" id="l2"></span><input id="p2" type="range"><span class="w-val" id="v2"></span></div>
<svg id="plot" viewBox="0 0 320 140" style="margin-top:6px"></svg>
<div class="w-note" id="stat"></div>
`,
      `
var dist=document.getElementById("dist"),p1=document.getElementById("p1"),p2=document.getElementById("p2");
var plot=document.getElementById("plot"),stat=document.getElementById("stat");
var r2=document.getElementById("r2");
function fact(n){var f=1;for(var i=2;i<=n;i++)f*=i;return f;}
function choose(n,k){if(k<0||k>n)return 0;return fact(n)/(fact(k)*fact(n-k));}
function cfg(){
  var d=dist.value;
  if(d==="binom"){set(p1,1,40,1,10);set(p2,1,99,1,50);document.getElementById("l1").textContent="n";document.getElementById("l2").textContent="p";r2.style.display="";}
  else if(d==="pois"){set(p1,1,200,1,30);document.getElementById("l1").textContent="λ×10";r2.style.display="none";}
  else if(d==="geom"){set(p1,5,95,1,30);document.getElementById("l1").textContent="p%";r2.style.display="none";}
  else if(d==="norm"){set(p1,-30,30,1,0);set(p2,5,40,1,15);document.getElementById("l1").textContent="μ";document.getElementById("l2").textContent="σ×10";r2.style.display="";}
  else if(d==="expo"){set(p1,2,60,1,20);document.getElementById("l1").textContent="λ×10";r2.style.display="none";}
  draw();
}
function set(el,min,max,step,val){el.min=min;el.max=max;el.step=step;el.value=val;}
function draw(){
  var d=dist.value,bars=[],mean=0,vr=0,a1=+p1.value,a2=+p2.value,lo=0,hi=20,cont=false;
  if(d==="binom"){var n=a1,p=a2/100;for(var k=0;k<=n;k++)bars.push([k,choose(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k)]);mean=n*p;vr=n*p*(1-p);hi=n;document.getElementById("v1").textContent=n;document.getElementById("v2").textContent=p.toFixed(2);}
  else if(d==="pois"){var L=a1/10;hi=Math.min(Math.ceil(L+4*Math.sqrt(L))+1,40);for(var k=0;k<=hi;k++)bars.push([k,Math.exp(-L)*Math.pow(L,k)/fact(k)]);mean=L;vr=L;document.getElementById("v1").textContent=L.toFixed(1);}
  else if(d==="geom"){var p=a1/100;hi=Math.min(Math.ceil(5/p),40);for(var k=1;k<=hi;k++)bars.push([k,Math.pow(1-p,k-1)*p]);mean=1/p;vr=(1-p)/(p*p);document.getElementById("v1").textContent=(a1)+"%";}
  else if(d==="norm"){cont=true;var mu=a1,sg=a2/10;lo=mu-4*sg;hi=mu+4*sg;for(var i=0;i<=60;i++){var x=lo+(hi-lo)*i/60;bars.push([x,Math.exp(-0.5*Math.pow((x-mu)/sg,2))/(sg*Math.sqrt(2*Math.PI))]);}mean=mu;vr=sg*sg;document.getElementById("v1").textContent=mu;document.getElementById("v2").textContent=sg.toFixed(1);}
  else if(d==="expo"){cont=true;var L=a1/10;lo=0;hi=5/L;for(var i=0;i<=60;i++){var x=lo+(hi-lo)*i/60;bars.push([x,L*Math.exp(-L*x)]);}mean=1/L;vr=1/(L*L);document.getElementById("v1").textContent=L.toFixed(1);}
  var maxY=0;bars.forEach(function(b){if(b[1]>maxY)maxY=b[1];});
  var W=320,H=140,pad=4,bw=(W-2*pad)/bars.length;
  var sx=function(x){return pad+(x-lo)/(hi-lo||1)*(W-2*pad);};
  var s="";
  if(cont){var pts=bars.map(function(b){return sx(b[0]).toFixed(1)+","+(H-6-b[1]/maxY*(H-20)).toFixed(1);}).join(" ");
    s+='<polyline points="'+pts+'" fill="none" stroke="#60a5fa" stroke-width="2"/>';
    s+='<polygon points="'+pad+','+(H-6)+' '+pts+' '+(W-pad)+','+(H-6)+'" fill="rgba(96,165,250,.15)"/>';
  } else {
    bars.forEach(function(b,i){var h=b[1]/maxY*(H-20);s+='<rect x="'+(pad+i*bw+0.5).toFixed(1)+'" y="'+(H-6-h).toFixed(1)+'" width="'+Math.max(bw-1,1).toFixed(1)+'" height="'+h.toFixed(1)+'" fill="#60a5fa"><title>P('+b[0]+')='+b[1].toFixed(3)+'</title></rect>';});
  }
  var mx=sx(mean);s+='<line x1="'+mx.toFixed(1)+'" y1="2" x2="'+mx.toFixed(1)+'" y2="'+(H-6)+'" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="3 2"/>';
  plot.innerHTML=s;
  stat.innerHTML="E[X] = <b style='color:#D4AF37'>"+mean.toFixed(3)+"</b> &nbsp; Var[X] = <b>"+vr.toFixed(3)+"</b> &nbsp; SD = <b>"+Math.sqrt(vr).toFixed(3)+"</b>";
}
dist.addEventListener("change",cfg);[p1,p2].forEach(function(el){el.addEventListener("input",draw);});
cfg();
`,
    ),
};

/* ─────────────────── Time value of money grower ─────────────────── */
const tvmGrowth: ConceptWidgetDef = {
  id: "tvm-growth",
  title: "How money grows",
  blurb: "Compare simple, compound, and continuous growth of the same deposit — see the gap widen with time.",
  bridge:
    "Compound interest is the engine of all of FM. Once you feel why $(1+i)^t$ pulls away from simple $1+it$, accumulation and discount stop being formulas to memorise.",
  html: () =>
    widgetDoc(
      `
<div class="w-title">$1,000 growing three ways</div>
<div class="w-sub">simple · compound · continuous (force of interest)</div>
<div class="w-row"><span class="w-label">Rate i</span><input id="rate" type="range" min="1" max="20" step="0.5" value="8"><span class="w-val" id="rateV">8%</span></div>
<div class="w-row"><span class="w-label">Years</span><input id="yrs" type="range" min="1" max="40" step="1" value="20"><span class="w-val" id="yrsV">20</span></div>
<svg id="plot" viewBox="0 0 320 150" style="margin-top:6px"></svg>
<div class="w-note" id="out"></div>
`,
      `
var rate=document.getElementById("rate"),yrs=document.getElementById("yrs"),plot=document.getElementById("plot"),out=document.getElementById("out");
function draw(){
  var i=+rate.value/100,T=+yrs.value,P=1000;
  document.getElementById("rateV").textContent=(+rate.value).toFixed(1)+"%";
  document.getElementById("yrsV").textContent=T;
  var simple=function(t){return P*(1+i*t);},comp=function(t){return P*Math.pow(1+i,t);},cont=function(t){return P*Math.exp(i*t);};
  var maxY=cont(T),W=320,H=150,pad=6;
  function path(fn){var s="";for(var t=0;t<=T;t++){var x=pad+t/T*(W-2*pad),y=H-pad-(fn(t)/maxY)*(H-2*pad);s+=(t?"L":"M")+x.toFixed(1)+","+y.toFixed(1);}return s;}
  plot.innerHTML='<path d="'+path(cont)+'" fill="none" stroke="#c084fc" stroke-width="2"/>'
    +'<path d="'+path(comp)+'" fill="none" stroke="#22c55e" stroke-width="2"/>'
    +'<path d="'+path(simple)+'" fill="none" stroke="#60a5fa" stroke-width="2"/>'
    +'<text x="'+(W-pad)+'" y="14" text-anchor="end" fill="#c084fc" font-size="8" font-family="monospace">continuous</text>'
    +'<text x="'+(W-pad)+'" y="26" text-anchor="end" fill="#22c55e" font-size="8" font-family="monospace">compound</text>'
    +'<text x="'+(W-pad)+'" y="38" text-anchor="end" fill="#60a5fa" font-size="8" font-family="monospace">simple</text>';
  out.innerHTML="After <b>"+T+"</b> yrs: simple <b style='color:#60a5fa'>$"+Math.round(simple(T)).toLocaleString()+
    "</b>, compound <b style='color:#22c55e'>$"+Math.round(comp(T)).toLocaleString()+
    "</b>, continuous <b style='color:#c084fc'>$"+Math.round(cont(T)).toLocaleString()+"</b>.";
}
[rate,yrs].forEach(function(el){el.addEventListener("input",draw);});
draw();
`,
      {
        question: "$1,000 at 8% for 20 years. Roughly how much MORE does compound interest give you than simple interest?",
        options: ["A little — maybe $100", "Almost double the interest", "No difference"],
        answer: 1,
        reveal:
          "Simple gives $2,600; compound gives ~$4,660. Compounding earns interest <b>on the interest</b>, so over long horizons it pulls far ahead — the whole reason annuities and bonds are priced the way they are.",
      },
    ),
};

export const actuaryWidgets: ConceptWidgetDef[] = [bayesBox, distExplorer, tvmGrowth];
