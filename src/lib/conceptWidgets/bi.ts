import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** Dashboard filter reactivity. */
const dashboardFilter: ConceptWidgetDef = {
 id: "dashboard-filter",
 title: "How a dashboard filter cascades",
 blurb: "Click a region and watch every chart on the page recompute.",
 html: () =>
 widgetDoc(
 `<div class="w-title">One filter, every chart reacts</div>
 <div class="w-sub">click a region, the KPI, the bar chart, and the table all recompute from the same filtered data</div>
 <div class="w-row" id="rbtns"></div>
 <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
 <div style="flex:1;min-width:110px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center"><div class="w-sub">total sales</div><div id="kpi" style="font-size:24px;font-weight:700;color:var(--accent)"></div></div>
 <div style="flex:2;min-width:160px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px"><div class="w-sub">by product</div><svg id="bars" viewBox="0 0 200 80" width="100%"></svg></div>
 </div>
 <div class="w-note">This is the core of every BI tool: filters don't edit charts one by one, they narrow the <b>underlying dataset</b>, and every visual re-queries it. Get the data model right and interactivity is free.</div>`,
 `
var data=[
 {region:"North",product:"A",sales:40},{region:"North",product:"B",sales:25},
 {region:"South",product:"A",sales:30},{region:"South",product:"B",sales:55},
 {region:"East",product:"A",sales:20},{region:"East",product:"B",sales:35}
];
var regions=["All","North","South","East"],cur="All";
function draw(){
 var rows=cur==="All"?data:data.filter(function(d){return d.region===cur;});
 var total=rows.reduce(function(s,d){return s+d.sales;},0);
 document.getElementById("kpi").textContent="$"+total+"k";
 var byP={};rows.forEach(function(d){byP[d.product]=(byP[d.product]||0)+d.sales;});
 var keys=Object.keys(byP),mx=Math.max.apply(null,keys.map(function(k){return byP[k];}))||1;
 var s="";keys.forEach(function(k,i){var w=byP[k]/mx*150;
 s+="<text x='0' y='"+(18+i*34)+"' fill='#c8bda9' font-size='10' font-family='monospace'>"+k+"</text>";
 s+="<rect x='20' y='"+(8+i*34)+"' width='"+w+"' height='18' rx='3' fill='#60a5fa'/>";
 s+="<text x='"+(24+w)+"' y='"+(21+i*34)+"' fill='#f4ede0' font-size='10' font-family='monospace'>"+byP[k]+"</text>";});
 document.getElementById("bars").innerHTML=s;
}
var bw=document.getElementById("rbtns");
regions.forEach(function(r){var b=document.createElement("button");b.className="w-btn"+(r===cur?"":" alt");b.textContent=r;
 b.onclick=function(){cur=r;[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(regions[i]===cur?"":" alt");});draw();};bw.appendChild(b);});
draw();
`,
 {
 question: "You click a region filter and three charts update. What did the filter actually change?",
 options: ["Each chart, edited one at a time", "The underlying dataset that every chart re-queries", "Only the chart you clicked on"],
 answer: 1,
 reveal: "Filters narrow the <b>underlying dataset</b>, and every visual re-queries it, that's why one click updates the KPI, the bars, and the table together. Get the data model right and interactivity is free.",
 },
 ),
 bridge: "In Power BI or Tableau, drop two charts off one table, add a slicer, and click a value, both recompute at once because they share the same filtered source.",
};

/** Star schema explorer. */
const starSchema: ConceptWidgetDef = {
 id: "star-schema",
 title: "The star schema",
 blurb: "Hover the fact table's keys and see them light up their dimensions.",
 html: () =>
 widgetDoc(
 `<div class="w-title">One fact table, many dimensions</div>
 <div class="w-sub">click a foreign key in the centre fact table, it points to one dimension table. That's the "star".</div>
 <svg id="sv" viewBox="0 0 300 220" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
 <div class="w-note" id="lab">Click a key in the Sales fact table.</div>`,
 `
var dims=[
 {id:"date",name:"dim_date",x:30,y:20,fields:["date_key","day","month","year"]},
 {id:"prod",name:"dim_product",x:200,y:20,fields:["product_key","name","category"]},
 {id:"cust",name:"dim_customer",x:30,y:150,fields:["customer_key","name","region"]},
 {id:"store",name:"dim_store",x:200,y:150,fields:["store_key","city","manager"]}
];
var factKeys=["date_key","product_key","customer_key","store_key","quantity","amount"];
var sel=null;
function box(x,y,title,fields,hl){
 var h="<rect x="+x+" y="+y+" width='80' height='"+(14+fields.length*12)+"' rx='5' fill='"+(hl?"rgba(34,197,94,.15)":"var(--card)")+"' stroke='"+(hl?"#22c55e":"var(--border)")+"'/>";
 h+="<text x="+(x+5)+" y="+(y+11)+" fill='"+(hl?"#22c55e":"#D4AF37")+"' font-size='8' font-family='monospace' font-weight='700'>"+title+"</text>";
 fields.forEach(function(f,i){h+="<text x="+(x+5)+" y="+(y+23+i*12)+" fill='#c8bda9' font-size='7.5' font-family='monospace'>"+f+"</text>";});
 return h;
}
function draw(){
 var s="";
 // lines
 dims.forEach(function(d){var hl=sel&&d.fields[0]===sel;s+="<line x1='150' y1='110' x2="+(d.x+40)+" y2="+(d.y+15)+" stroke='"+(hl?"#22c55e":"#3a2f20")+"' stroke-width='"+(hl?2:1)+"'/>";});
 dims.forEach(function(d){s+=box(d.x,d.y,d.name,d.fields,sel&&d.fields[0]===sel);});
 // fact in middle
 s+="<rect x='110' y='78' width='80' height='"+(14+factKeys.length*12)+"' rx='5' fill='rgba(212,175,55,.12)' stroke='var(--accent)'/>";
 s+="<text x='115' y='89' fill='#D4AF37' font-size='8' font-family='monospace' font-weight='700'>fact_sales</text>";
 factKeys.forEach(function(f,i){var isKey=/_key$/.test(f);
 s+="<text x='115' y='101' dy='"+(i*12)+"' fill='"+(isKey?"#60a5fa":"#8a7c63")+"' font-size='7.5' font-family='monospace' style='cursor:"+(isKey?"pointer":"default")+"' data-k='"+(isKey?f:"")+"'>"+f+"</text>";});
 document.getElementById("sv").innerHTML=s;
}
document.getElementById("sv").addEventListener("click",function(e){var k=e.target.getAttribute&&e.target.getAttribute("data-k");if(!k)return;sel=k;
 var d=dims.filter(function(x){return x.fields[0]===k;})[0];
 document.getElementById("lab").innerHTML="<b>"+k+"</b> in the fact table is a foreign key into <b>"+(d?d.name:"?")+"</b>. The fact table stores <i>measurements</i> (quantity, amount) + keys; the dimensions store the <i>descriptions</i> you slice by.";
 draw();});
draw();
`,
 {
 question: "In a star schema, what lives in the centre fact table?",
 options: ["The descriptive text you slice by", "The measurements plus foreign keys to the dimensions", "A full copy of every dimension"],
 answer: 1,
 reveal: "The <b>fact table</b> stores measurements (quantity, amount) plus foreign keys; the <b>dimensions</b> hold the descriptions (product name, region, date) you slice by. That hub-and-spoke shape is the 'star'.",
 },
 ),
 bridge: "Sketch a fact table for orders, keep only keys and numeric measures in it, push every descriptive attribute out to its own dimension, and you've built a star.",
};

/** KPI threshold / RAG status. */
const kpiThreshold: ConceptWidgetDef = {
 id: "kpi-threshold",
 title: "KPI thresholds & RAG status",
 blurb: "Drag the metric and watch it cross red/amber/green bands.",
 html: () =>
 widgetDoc(
 `<div class="w-title">Turning a number into a decision</div>
 <div class="w-sub">a raw metric means little. Thresholds turn it into Red / Amber / Green, what executives actually scan for.</div>
 <div class="w-row"><span class="w-label">on-time %</span><input id="m" type="range" min="60" max="100" value="88"><span class="w-val" id="mv">88</span></div>
 <div id="gauge" style="height:26px;border-radius:13px;display:flex;overflow:hidden;border:1px solid var(--border)">
 <div style="flex:1;background:rgba(239,68,68,.4)"></div><div style="flex:1;background:rgba(251,191,36,.4)"></div><div style="flex:1;background:rgba(34,197,94,.4)"></div></div>
 <div id="status" style="text-align:center;margin-top:12px;font-size:18px;font-weight:700"></div>
 <div class="w-note" id="lab"></div>`,
 `
function draw(){
 var m=+document.getElementById("m").value;document.getElementById("mv").textContent=m;
 var st,col,msg;
 if(m<80){st="RED";col="#ef4444";msg="Below 80%, breaching SLA. Escalate now.";}
 else if(m<92){st="AMBER";col="#fbbf24";msg="80, 92%, watch closely, trending toward risk.";}
 else{st="GREEN";col="#22c55e";msg="Above 92%, healthy, no action needed.";}
 document.getElementById("status").innerHTML="<span style='color:"+col+"'>● "+st+"</span>";
 document.getElementById("lab").innerHTML="<b>"+m+"%</b> → "+msg+" The thresholds, not the number, drive the action.";
}
document.getElementById("m").addEventListener("input",draw);
draw();
`,
 {
 question: "On-time delivery reads 88%. Is that good?",
 options: ["Yes, it's a high number", "It depends entirely on where the thresholds sit", "No, anything below 100% is bad"],
 answer: 1,
 reveal: "A raw number means little. <b>Thresholds</b> turn it into Red / Amber / Green, 88% might be amber here but green elsewhere. The bands, not the number, drive the action.",
 },
 ),
 bridge: "Pick one KPI you care about, set explicit red/amber/green cutoffs, then colour last month's values against them, the colour tells the story faster than the digits.",
};

/** Cohort retention heatmap. */
const cohortRetention: ConceptWidgetDef = {
 id: "cohort-retention",
 title: "Reading a cohort retention heatmap",
 blurb: "Hover cells to see how each signup month decays over time.",
 html: () =>
 widgetDoc(
 `<div class="w-title">Cohort retention</div>
 <div class="w-sub">each row is a signup month; each column is how many stuck around N months later. Darker green = better retention.</div>
 <div id="grid"></div>
 <div class="w-note" id="lab">Hover a cell. Read <b>down a column</b> to compare cohorts at the same age, that's how you tell if a product change improved retention.</div>`,
 `
var cohorts=["Jan","Feb","Mar","Apr"];
var data=[[100,62,48,40,35],[100,68,55,47,0],[100,75,63,0,0],[100,80,0,0,0]];
function col(v){if(v===0)return "transparent";var t=v/100;return "rgba(34,197,94,"+(0.12+t*0.7)+")";}
function draw(){
 var h="<table style='border-collapse:separate;border-spacing:3px'><tr><th style='border:none'></th>";
 for(var m=0;m<5;m++)h+="<th style='border:none;color:#8a7c63;font-size:9px'>M"+m+"</th>";
 h+="</tr>";
 data.forEach(function(row,i){h+="<tr><th style='border:none;color:#8a7c63'>"+cohorts[i]+"</th>";
 row.forEach(function(v){h+="<td data-v='"+v+"' style='border:none;width:38px;text-align:center;border-radius:5px;background:"+col(v)+";color:"+(v?"#f4ede0":"transparent")+";cursor:pointer'>"+(v||"")+"</td>";});
 h+="</tr>";});
 document.getElementById("grid").innerHTML=h+"</table>";
}
document.getElementById("grid").addEventListener("mouseover",function(e){var v=e.target.getAttribute&&e.target.getAttribute("data-v");if(v&&+v>0)document.getElementById("lab").innerHTML="<b>"+v+"%</b> of that cohort were still active. Falling fast across a row = leaky retention; a later cohort holding higher than an earlier one at the same M = you improved something.";});
draw();
`,
 {
 question: "To tell whether a product change improved retention, how do you read a cohort heatmap?",
 options: ["Across a row, left to right", "Down a column, compare cohorts at the same age", "Just the top-left cell"],
 answer: 1,
 reveal: "Read <b>down a column</b>: it compares different signup cohorts at the <i>same</i> age (M2 vs M2). A later cohort holding higher than an earlier one at the same month means something you changed worked.",
 },
 ),
 bridge: "Build a cohort table from real signups (rows = signup month, columns = months-since), then scan one column top-to-bottom to see if newer cohorts retain better.",
};

export const biWidgets: ConceptWidgetDef[] = [
 dashboardFilter,
 starSchema,
 kpiThreshold,
 cohortRetention,
];
