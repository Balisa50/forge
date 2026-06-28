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
 title: "Bayes box, the base-rate trap",
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
 "About <b>50%</b>. With 10,000 people: 99 sick test positive, but 99 of the 9,900 healthy ALSO test positive. Half of all positives are false, the rare base rate dominates.",
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
 blurb: "Compare simple, compound, and continuous growth of the same deposit, see the gap widen with time.",
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
 options: ["A little, maybe $100", "Almost double the interest", "No difference"],
 answer: 1,
 reveal:
 "Simple gives $2,600; compound gives ~$4,660. Compounding earns interest <b>on the interest</b>, so over long horizons it pulls far ahead, the whole reason annuities and bonds are priced the way they are.",
 },
 ),
};

/* ───────────────────── CLT simulator ───────────────────── */
const cltSimulator: ConceptWidgetDef = {
 id: "clt-simulator",
 title: "The Central Limit Theorem, live",
 blurb: "Pick a wildly non-normal source, average n draws thousands of times, and watch the bell appear anyway.",
 bridge:
 "On the exam you invoke the CLT to turn an aggregate-loss question into one Z-table lookup. The leap of faith, that the sum is normal whatever the pieces look like, is exactly what you just watched happen.",
 html: () =>
 widgetDoc(
 `
<div class="w-title">Sample-mean histogram</div>
<div class="w-sub">2,000 samples · each the mean of n draws</div>
<div class="w-row">
 <span class="w-label">Source</span>
 <select id="src" style="font-family:var(--mono);font-size:12px;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:5px 8px;flex:1">
 <option value="unif">Uniform (flat)</option>
 <option value="expo">Exponential (skewed)</option>
 <option value="bimod">Bimodal (two spikes)</option>
 <option value="bern">Coin flip (0/1)</option>
 </select>
</div>
<div class="w-row"><span class="w-label">Sample size n</span><input id="n" type="range" min="1" max="50" step="1" value="1"><span class="w-val" id="nV">1</span></div>
<svg id="src-plot" viewBox="0 0 320 44" style="margin-top:2px"></svg>
<div class="w-sub" style="margin:2px 0 0">source shape ↑ &nbsp; sample-mean shape ↓</div>
<svg id="plot" viewBox="0 0 320 130" style="margin-top:2px"></svg>
<div class="w-note" id="out"></div>
`,
 `
var src=document.getElementById("src"),n=document.getElementById("n"),plot=document.getElementById("plot"),srcPlot=document.getElementById("src-plot"),out=document.getElementById("out");
function draw1(){ // one draw from the chosen source, support roughly [0,1]
 var d=src.value;
 if(d==="unif")return Math.random();
 if(d==="expo"){var x=-Math.log(1-Math.random())/3;return Math.min(x,1);} // mean ~1/3, clipped
 if(d==="bimod")return Math.random()<0.5?0.15+Math.random()*0.12:0.73+Math.random()*0.12;
 return Math.random()<0.5?0:1; // bernoulli
}
function srcMoments(){
 var d=src.value;
 if(d==="unif")return {m:0.5,v:1/12};
 if(d==="expo")return {m:0.305,v:0.07}; // empirical for clipped version
 if(d==="bimod")return {m:0.5,v:0.087};
 return {m:0.5,v:0.25};
}
function hist(data,bins,lo,hi){
 var h=new Array(bins).fill(0),w=(hi-lo)/bins;
 data.forEach(function(x){var b=Math.floor((x-lo)/w);if(b<0)b=0;if(b>=bins)b=bins-1;h[b]++;});
 return h;
}
function svgBars(el,h,color,H){
 var W=320,pad=3,bw=(W-2*pad)/h.length,max=Math.max.apply(null,h)||1,s="";
 h.forEach(function(c,i){var bh=c/max*(H-6);s+='<rect x="'+(pad+i*bw+0.4).toFixed(1)+'" y="'+(H-3-bh).toFixed(1)+'" width="'+Math.max(bw-0.8,0.8).toFixed(1)+'" height="'+bh.toFixed(1)+'" fill="'+color+'"/>';});
 el.innerHTML=s;
}
function run(){
 var N=+n.value;document.getElementById("nV").textContent=N;
 // source preview
 var raw=[];for(var i=0;i<3000;i++)raw.push(draw1());
 svgBars(srcPlot,hist(raw,32,0,1),"#8a7c63",44);
 // sample means
 var means=[],T=2000;
 for(var t=0;t<T;t++){var s=0;for(var k=0;k<N;k++)s+=draw1();means.push(s/N);}
 var H=130,bins=36;
 svgBars(plot,hist(means,bins,0,1),"#60a5fa",H);
 // overlay theoretical normal of the sample mean
 var mom=srcMoments(),mu=mom.m,sd=Math.sqrt(mom.v/N);
 var W=320,pad=3,max=0,pts=[],binw=1/bins;
 for(var i=0;i<bins;i++){var x=(i+0.5)/bins;var y=Math.exp(-0.5*Math.pow((x-mu)/sd,2));if(y>max)max=y;pts.push([x,y]);}
 var poly=pts.map(function(p){return (pad+p[0]*(W-2*pad)).toFixed(1)+","+(H-3-p[1]/max*(H-10)).toFixed(1);}).join(" ");
 plot.innerHTML+='<polyline points="'+poly+'" fill="none" stroke="#D4AF37" stroke-width="1.8"/>';
 out.innerHTML="With <b>n="+N+"</b>, the average of "+(src.options[src.selectedIndex].text.toLowerCase())+" draws has SD <b>"+sd.toFixed(3)+"</b> = σ/√n. "+(N>=20?"<b style='color:#D4AF37'>Already a clean bell</b>, the source shape is gone.":(N===1?"At n=1 the histogram is just the source itself.":"Getting more bell-shaped as n climbs."));
}
src.addEventListener("change",run);n.addEventListener("input",run);
run();
`,
 {
 question: "You average 30 draws from a wildly skewed distribution, thousands of times, and histogram the averages. The shape is…",
 options: ["Still skewed like the source", "A symmetric bell", "Flat / uniform"],
 answer: 1,
 reveal:
 "A <b>bell</b>. The Central Limit Theorem says the sample mean tends to normal as n grows, no matter how lopsided the source, its SD shrinks like σ/√n. That is why the normal shows up everywhere.",
 },
 ),
};

/* ─────────────── Law of total variance / mixtures ─────────────── */
const totalVariance: ConceptWidgetDef = {
 id: "total-variance",
 title: "Total variance = within + between",
 blurb: "Split a population into two risk classes and watch overall variance break into within-group plus between-group.",
 bridge:
 "Double expectation and the law of total variance power every conditional-mean question. Var(X) = E[Var(X|Y)] + Var(E[X|Y]), the within piece plus the between piece you just separated by hand.",
 html: () =>
 widgetDoc(
 `
<div class="w-title">Mixing two risk classes</div>
<div class="w-sub">E[X]=E[E[X|Y]] &nbsp; Var(X)=E[Var(X|Y)]+Var(E[X|Y])</div>
<div class="w-row"><span class="w-label">P(class A)</span><input id="w" type="range" min="5" max="95" step="1" value="60"><span class="w-val" id="wV">0.60</span></div>
<div class="w-row"><span class="w-label">mean A</span><input id="ma" type="range" min="0" max="100" step="1" value="20"><span class="w-val" id="maV">20</span></div>
<div class="w-row"><span class="w-label">mean B</span><input id="mb" type="range" min="0" max="100" step="1" value="60"><span class="w-val" id="mbV">60</span></div>
<div class="w-row"><span class="w-label">within sd</span><input id="sd" type="range" min="2" max="30" step="1" value="8"><span class="w-val" id="sdV">8</span></div>
<svg id="plot" viewBox="0 0 320 120" style="margin-top:6px"></svg>
<div class="w-note" id="out"></div>
`,
 `
var w=document.getElementById("w"),ma=document.getElementById("ma"),mb=document.getElementById("mb"),sd=document.getElementById("sd"),plot=document.getElementById("plot"),out=document.getElementById("out");
function draw(){
 var pa=+w.value/100,pb=1-pa,muA=+ma.value,muB=+mb.value,s=+sd.value,vw=s*s;
 document.getElementById("wV").textContent=pa.toFixed(2);
 document.getElementById("maV").textContent=muA;document.getElementById("mbV").textContent=muB;document.getElementById("sdV").textContent=s;
 var EX=pa*muA+pb*muB; // E[E[X|Y]]
 var within=pa*vw+pb*vw; // E[Var(X|Y)]
 var between=pa*Math.pow(muA-EX,2)+pb*Math.pow(muB-EX,2); // Var(E[X|Y])
 var total=within+between;
 // draw two gaussians on a 0..100 axis scaled by class probability
 var W=320,H=120,pad=6;
 function gx(x){return pad+x/100*(W-2*pad);}
 function bell(mu,p,col){var pts="";for(var i=0;i<=80;i++){var x=i/80*100;var y=p*Math.exp(-0.5*Math.pow((x-mu)/s,2));pts+=gx(x).toFixed(1)+","+y;}
 return {pts:pts,col:col};}
 // find max height for scaling
 var maxH=0;[ [muA,pa],[muB,pb] ].forEach(function(g){var y=g[1]*1;if(y>maxH)maxH=y;});
 function poly(mu,p,col){var s2="";for(var i=0;i<=80;i++){var x=i/80*100;var yy=p*Math.exp(-0.5*Math.pow((x-mu)/s,2));s2+=gx(x).toFixed(1)+","+(H-8-yy/maxH*(H-24)).toFixed(1)+" ";}
 return '<polyline points="'+s2+'" fill="none" stroke="'+col+'" stroke-width="2"/>';}
 var mxx=gx(EX);
 plot.innerHTML=poly(muA,pa,"#60a5fa")+poly(muB,pb,"#fb7185")
 +'<line x1="'+mxx.toFixed(1)+'" y1="4" x2="'+mxx.toFixed(1)+'" y2="'+(H-8)+'" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="3 2"/>'
 +'<text x="'+gx(muA)+'" y="'+(H-1)+'" text-anchor="middle" fill="#60a5fa" font-size="8" font-family="monospace">A</text>'
 +'<text x="'+gx(muB)+'" y="'+(H-1)+'" text-anchor="middle" fill="#fb7185" font-size="8" font-family="monospace">B</text>'
 +'<text x="'+mxx.toFixed(1)+'" y="3" text-anchor="middle" fill="#D4AF37" font-size="8" font-family="monospace">E[X]</text>';
 out.innerHTML="E[X] = <b style='color:#D4AF37'>"+EX.toFixed(1)+"</b><br>"
 +"within E[Var(X|Y)] = <b>"+within.toFixed(1)+"</b><br>"
 +"between Var(E[X|Y]) = <b style='color:#fb7185'>"+between.toFixed(1)+"</b><br>"
 +"total Var(X) = <b style='color:#D4AF37'>"+total.toFixed(1)+"</b> &nbsp;<span style='color:#8a7c63'>(spread the means apart → between grows)</span>";
}
[w,ma,mb,sd].forEach(function(el){el.addEventListener("input",draw);});
draw();
`,
 {
 question: "Two equally likely risk classes have the SAME within-class variance. You pull their means far apart. Overall variance…",
 options: ["Stays the same", "Goes up (between-group grows)", "Goes down"],
 answer: 1,
 reveal:
 "It <b>rises</b>. Total variance = within + between. Pulling the class means apart inflates the between-group term Var(E[X|Y]) while the within term is unchanged.",
 },
 ),
};

/* ─────────────── Bond book value / amortization ─────────────── */
const bondBookValue: ConceptWidgetDef = {
 id: "bond-bookvalue",
 title: "Bond book value pulls to par",
 blurb: "Set coupon vs yield and watch the amortized book value glide to redemption, premium down, discount up.",
 bridge:
 "Book value after t coupons is just the bond priced with the remaining coupons. Premium bonds amortize DOWN to redemption; discount bonds accrete UP. The pull-to-par picture is the whole amortization schedule.",
 html: () =>
 widgetDoc(
 `
<div class="w-title">Amortized book value · redemption = 100</div>
<div class="w-sub">premium if coupon &gt; yield · discount if coupon &lt; yield</div>
<div class="w-row"><span class="w-label">Coupon rate</span><input id="c" type="range" min="0" max="12" step="0.25" value="8"><span class="w-val" id="cV">8%</span></div>
<div class="w-row"><span class="w-label">Yield rate</span><input id="y" type="range" min="1" max="12" step="0.25" value="6"><span class="w-val" id="yV">6%</span></div>
<div class="w-row"><span class="w-label">Years</span><input id="n" type="range" min="2" max="20" step="1" value="10"><span class="w-val" id="nV">10</span></div>
<svg id="plot" viewBox="0 0 320 140" style="margin-top:6px"></svg>
<div class="w-note" id="out"></div>
`,
 `
var c=document.getElementById("c"),y=document.getElementById("y"),n=document.getElementById("n"),plot=document.getElementById("plot"),out=document.getElementById("out");
function price(coupon,i,periods){ // F=100 par, redemption 100
 var v=1/(1+i),a=(1-Math.pow(v,periods))/i;
 return coupon*100*a+100*Math.pow(v,periods);
}
function draw(){
 var cr=+c.value/100,i=+y.value/100,N=+n.value;
 document.getElementById("cV").textContent=(+c.value).toFixed(2)+"%";
 document.getElementById("yV").textContent=(+y.value).toFixed(2)+"%";
 document.getElementById("nV").textContent=N;
 var bv=[];for(var t=0;t<=N;t++)bv.push(price(cr,i,N-t));
 var lo=Math.min.apply(null,bv.concat([100])),hi=Math.max.apply(null,bv.concat([100]));
 if(hi-lo<2){lo-=2;hi+=2;}
 var W=320,H=140,pad=8,padL=30;
 function X(t){return padL+t/N*(W-padL-pad);}
 function Y(v){return pad+(hi-v)/(hi-lo)*(H-2*pad);}
 var path="";bv.forEach(function(v,t){path+=(t?"L":"M")+X(t).toFixed(1)+","+Y(v).toFixed(1);});
 var par=Y(100);
 var col=cr>i?"#fb7185":(cr<i?"#22c55e":"#D4AF37");
 plot.innerHTML='<line x1="'+padL+'" y1="'+par.toFixed(1)+'" x2="'+(W-pad)+'" y2="'+par.toFixed(1)+'" stroke="#3a2f20" stroke-width="1" stroke-dasharray="3 2"/>'
 +'<text x="'+padL+'" y="'+(par-3).toFixed(1)+'" fill="#8a7c63" font-size="8" font-family="monospace">100</text>'
 +'<path d="'+path+'" fill="none" stroke="'+col+'" stroke-width="2.2"/>'
 +bv.map(function(v,t){return '<circle cx="'+X(t).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="2" fill="'+col+'"/>';}).join("");
 var P0=bv[0];
 var label=cr>i?"premium":(cr<i?"discount":"par");
 out.innerHTML="Price today = <b style='color:"+col+"'>"+P0.toFixed(2)+"</b> ("+label+"). "
 +(cr>i?"Coupon beats yield, so you overpay and the book value <b>amortizes down</b> to 100.":(cr<i?"Coupon lags yield, so you pay below par and the book value <b>accretes up</b> to 100.":"Coupon equals yield, so it sits flat at 100."))
 +"<br><span style='color:#8a7c63'>Each period: interest earned = i × book value; the difference vs the coupon writes the book value toward par.</span>";
}
[c,y,n].forEach(function(el){el.addEventListener("input",draw);});
draw();
`,
 {
 question: "You buy a bond at a PREMIUM (coupon rate above the yield). Over its life, its book value…",
 options: ["Rises above the purchase price", "Declines toward redemption value", "Stays flat at the purchase price"],
 answer: 1,
 reveal:
 "It <b>declines to redemption</b>. A premium is amortized away each period (write-down), so book value glides down to par by maturity. A discount bond does the reverse, accretes up.",
 },
 ),
};

/* ─────────────── Spot vs forward rate curve ─────────────── */
const spotForward: ConceptWidgetDef = {
 id: "spot-forward",
 title: "Spot rates imply forward rates",
 blurb: "Drag the spot-rate curve and watch the one-year forward rates the market is baking in.",
 bridge:
 "A forward rate is locked in today by the spot curve: (1+s_t)^t = (1+s_{t-1})^{t-1}(1+f). When the spot curve rises, forwards sit above it, exactly what you read off here.",
 html: () =>
 widgetDoc(
 `
<div class="w-title">Term structure · spot vs 1-yr forward</div>
<div class="w-sub">gold = spot s_t · blue = implied forward f(t-1,t)</div>
<div class="w-row"><span class="w-label">s₁</span><input id="s1" type="range" min="1" max="10" step="0.1" value="3"><span class="w-val" id="s1V">3.0%</span></div>
<div class="w-row"><span class="w-label">s₂</span><input id="s2" type="range" min="1" max="10" step="0.1" value="4"><span class="w-val" id="s2V">4.0%</span></div>
<div class="w-row"><span class="w-label">s₃</span><input id="s3" type="range" min="1" max="10" step="0.1" value="4.7"><span class="w-val" id="s3V">4.7%</span></div>
<div class="w-row"><span class="w-label">s₄</span><input id="s4" type="range" min="1" max="10" step="0.1" value="5.2"><span class="w-val" id="s4V">5.2%</span></div>
<svg id="plot" viewBox="0 0 320 140" style="margin-top:6px"></svg>
<div class="w-note" id="out"></div>
`,
 `
var ids=["s1","s2","s3","s4"],els=ids.map(function(k){return document.getElementById(k);});
var plot=document.getElementById("plot"),out=document.getElementById("out");
function draw(){
 var s=els.map(function(e){return +e.value/100;});
 ids.forEach(function(k,i){document.getElementById(k+"V").textContent=(s[i]*100).toFixed(1)+"%";});
 // forward rates: (1+s_t)^t = (1+s_{t-1})^{t-1}(1+f_t)
 var f=[s[0]];
 for(var t=2;t<=4;t++){var num=Math.pow(1+s[t-1],t),den=Math.pow(1+s[t-2],t-1);f.push(num/den-1);}
 var all=s.concat(f),lo=Math.min.apply(null,all),hi=Math.max.apply(null,all);
 lo=Math.min(lo,0.02);hi=hi+0.005;
 var W=320,H=140,pad=10,padL=26,padB=18;
 function X(t){return padL+(t-1)/3*(W-padL-pad);}
 function Y(v){return pad+(hi-v)/(hi-lo)*(H-pad-padB);}
 function line(arr,col){var p="";arr.forEach(function(v,i){p+=(i?"L":"M")+X(i+1).toFixed(1)+","+Y(v).toFixed(1);});
 return '<path d="'+p+'" fill="none" stroke="'+col+'" stroke-width="2"/>'+arr.map(function(v,i){return '<circle cx="'+X(i+1).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="2.4" fill="'+col+'"><title>'+(v*100).toFixed(2)+'%</title></circle>';}).join("");}
 var ax="";for(var t=1;t<=4;t++)ax+='<text x="'+X(t).toFixed(1)+'" y="'+(H-5)+'" text-anchor="middle" fill="#8a7c63" font-size="8" font-family="monospace">'+t+'y</text>';
 plot.innerHTML=ax+line(s,"#D4AF37")+line(f,"#60a5fa");
 var rising=s[3]>s[0];
 out.innerHTML="1-yr forwards: "+f.map(function(v){return (v*100).toFixed(2)+"%";}).join(" · ")
 +"<br><span style='color:#8a7c63'>"+(rising?"Upward-sloping spot curve → forwards sit <b style='color:#60a5fa'>above</b> spots (the market expects rates to climb).":"Flat/inverted spot curve pulls forwards at or below spots.")+"</span>";
}
els.forEach(function(e){e.addEventListener("input",draw);});
draw();
`,
 {
 question: "The spot-rate curve slopes upward (longer rates higher). The implied 1-year forward rates lie…",
 options: ["Below the spot curve", "Above the spot curve", "Exactly on it"],
 answer: 1,
 reveal:
 "<b>Above</b>. To make a longer, higher spot rate consistent, the marginal one-year forward must exceed the average so far, an upward spot curve implies forwards sitting above it.",
 },
 ),
};

/* ───────────────────── Three-set Venn (the 7 regions) ───────────────────── */
const vennThreeSet: ConceptWidgetDef = {
 id: "venn-three-set",
 title: "Three-set Venn, the seven regions",
 blurb: "Click an event and watch exactly which of the seven regions it sweeps in. The gap between 'exactly one' and 'at least one' is where most marks are lost.",
 bridge:
 "Every SOA three-set counting question is this picture in words. Translate the totals into the seven disjoint regions, then read off whichever event they ask for, exactly one, exactly two, only A, none, never confuse them again.",
 html: () =>
 widgetDoc(
 `
<div class="w-title">Three-set Venn · 100 insurance clients</div>
<div class="w-sub">A = Auto · B = Life · C = Health · click an event below</div>
<canvas id="vn" width="320" height="250" style="max-width:100%"></canvas>
<div class="w-row" id="btns" style="flex-wrap:wrap;gap:6px;justify-content:center"></div>
<div class="w-note" id="out"></div>
`,
 `
var R={oA:20,oB:15,oC:10,AB:12,AC:8,BC:6,ABC:5,none:24};
var cvs=document.getElementById("vn"),ctx=cvs.getContext("2d");
var A={x:122,y:104,r:64},B={x:198,y:104,r:64},C={x:160,y:168,r:64};
var MAP={A:A,B:B,C:C};
function circle(c,g){g.beginPath();g.arc(c.x,c.y,c.r,0,7);g.fill();}
// build a gold mask for ONE atom defined by which sets it is inside/outside
function atomCanvas(inSets){
 var t=document.createElement("canvas");t.width=320;t.height=250;var x=t.getContext("2d");
 x.fillStyle="#D4AF37";
 var ins=["A","B","C"].filter(function(k){return inSets[k]===true;});
 var outs=["A","B","C"].filter(function(k){return inSets[k]===false;});
 if(ins.length===0){x.fillRect(0,0,320,250);}
 else{x.globalCompositeOperation="source-over";circle(MAP[ins[0]],x);
  for(var i=1;i<ins.length;i++){x.globalCompositeOperation="destination-in";circle(MAP[ins[i]],x);}}
 for(var j=0;j<outs.length;j++){x.globalCompositeOperation="destination-out";circle(MAP[outs[j]],x);}
 return t;
}
var ATOM={
 onlyA:{in:{A:true,B:false,C:false},c:[92,96],n:R.oA},
 onlyB:{in:{A:false,B:true,C:false},c:[228,96],n:R.oB},
 onlyC:{in:{A:false,B:false,C:true},c:[160,205],n:R.oC},
 AB:{in:{A:true,B:true,C:false},c:[160,80],n:R.AB},
 AC:{in:{A:true,B:false,C:true},c:[116,150],n:R.AC},
 BC:{in:{A:false,B:true,C:true},c:[204,150],n:R.BC},
 ABC:{in:{A:true,B:true,C:true},c:[160,122],n:R.ABC},
 none:{in:{A:false,B:false,C:false},c:[296,236],n:R.none}
};
var EVENTS=[
 {k:"one",label:"Exactly one",atoms:["onlyA","onlyB","onlyC"],
  note:function(s){return "<b>Exactly one</b> = only-A + only-B + only-C = "+R.oA+" + "+R.oB+" + "+R.oC+" = <b style='color:#D4AF37'>"+s+"</b>";}},
 {k:"two",label:"Exactly two",atoms:["AB","AC","BC"],
  note:function(s){return "<b>Exactly two</b> = the three lens-only regions = "+R.AB+" + "+R.AC+" + "+R.BC+" = <b style='color:#D4AF37'>"+s+"</b>";}},
 {k:"all",label:"All three",atoms:["ABC"],
  note:function(s){return "<b>All three</b> = the center only = <b style='color:#D4AF37'>"+s+"</b>";}},
 {k:"atleast",label:"At least one",atoms:["onlyA","onlyB","onlyC","AB","AC","BC","ABC"],
  note:function(s){return "<b>At least one</b> = everything inside a circle = <b style='color:#D4AF37'>"+s+"</b>. Note it is NOT exactly one, it sweeps in every overlap too.";}},
 {k:"A",label:"Buy A (Auto)",atoms:["onlyA","AB","AC","ABC"],
  note:function(s){return "<b>Buy A</b> = the whole A circle = "+R.oA+" + "+R.AB+" + "+R.AC+" + "+R.ABC+" = <b style='color:#D4AF37'>"+s+"</b>";}},
 {k:"none",label:"None",atoms:["none"],
  note:function(s){return "<b>None</b> = outside all three circles = <b style='color:#D4AF37'>"+s+"</b>. Always 100 minus 'at least one'.";}}
];
function sumOf(atoms){var s=0;atoms.forEach(function(a){s+=ATOM[a].n;});return s;}
function draw(ev){
 ctx.clearRect(0,0,320,250);
 ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;
 ctx.fillStyle="rgba(96,165,250,0.12)";circle(A,ctx);
 ctx.fillStyle="rgba(52,211,153,0.12)";circle(B,ctx);
 ctx.fillStyle="rgba(244,114,182,0.12)";circle(C,ctx);
 var hot={};
 if(ev){ev.atoms.forEach(function(a){hot[a]=true;});
  ctx.globalAlpha=0.5;
  ev.atoms.forEach(function(a){ctx.drawImage(atomCanvas(ATOM[a].in),0,0);});
  ctx.globalAlpha=1;}
 ctx.lineWidth=1.5;ctx.strokeStyle="#8a7c63";
 [A,B,C].forEach(function(c){ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.stroke();});
 ctx.font="bold 11px monospace";ctx.fillStyle="#cbb88f";ctx.textAlign="center";
 ctx.fillText("A",A.x-44,A.y-46);ctx.fillText("B",B.x+44,B.y-46);ctx.fillText("C",C.x,C.y+58);
 Object.keys(ATOM).forEach(function(k){var a=ATOM[k];
  ctx.font=(hot[k]?"bold 13px":"12px")+" monospace";
  ctx.fillStyle=hot[k]?"#1a1208":"#9a8c6f";
  ctx.fillText(String(a.n),a.c[0],a.c[1]+4);});
}
var out=document.getElementById("out"),btns=document.getElementById("btns");
EVENTS.forEach(function(ev){var b=document.createElement("button");b.className="w-pick";b.textContent=ev.label;
 b.addEventListener("click",function(){select(ev,b);});btns.appendChild(b);});
function select(ev,b){[].forEach.call(btns.children,function(x){x.className="w-pick muted";});
 if(b)b.className="w-pick right";draw(ev);out.innerHTML=ev.note(sumOf(ev.atoms))+"<br><span style='color:#8a7c63'>All seven regions sum to 100 clients.</span>";}
select(EVENTS[0],btns.children[0]);
`,
 {
 question: "Of these 100 clients, how many buy EXACTLY ONE product?",
 options: ["45", "76", "26"],
 answer: 0,
 reveal:
 "<b>45</b> = only-A + only-B + only-C = 20 + 15 + 10. The trap is <b>76</b> ('at least one'), which also counts every overlap; <b>26</b> is exactly-two.",
 },
 ),
};

export const actuaryWidgets: ConceptWidgetDef[] = [
 bayesBox,
 distExplorer,
 tvmGrowth,
 cltSimulator,
 totalVariance,
 bondBookValue,
 spotForward,
 vennThreeSet,
];
