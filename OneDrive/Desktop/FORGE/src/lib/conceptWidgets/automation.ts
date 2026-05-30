import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** Workflow builder: trigger → action chain runs. */
const workflowBuilder: ConceptWidgetDef = {
  id: "workflow-builder",
  title: "Trigger → action workflows",
  blurb: "Fire a trigger and watch data flow node-to-node down the chain.",
  html: () =>
    widgetDoc(
      `<div class="w-title">A workflow is a chain of nodes</div>
       <div class="w-sub">a trigger starts it; each node transforms the data and passes it on. Click the trigger to run it.</div>
       <div id="flow" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:10px"></div>
       <div class="w-row"><button class="w-btn" id="run">⚡ Fire trigger</button><button class="w-btn alt" id="reset">Reset</button></div>
       <div class="w-sub" style="margin-top:6px">data passing through:</div>
       <pre id="payload" class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:11px;color:var(--accent-soft);white-space:pre-wrap;min-height:40px"></pre>`,
      `
var nodes=[
  {n:"New form submission",c:"#fbbf24",t:function(d){return {name:"awa",email:"AWA@MAIL.COM"};}},
  {n:"Lowercase email",c:"#60a5fa",t:function(d){d.email=d.email.toLowerCase();return d;}},
  {n:"Add to CRM",c:"#22c55e",t:function(d){d.crm_id="c_1041";return d;}},
  {n:"Send welcome email",c:"#c084fc",t:function(d){d.sent=true;return d;}}
];
var active=-1;
function draw(){
  document.getElementById("flow").innerHTML=nodes.map(function(nd,i){
    var on=i<=active;
    return "<div style='flex:1;min-width:78px;text-align:center;border:1px solid "+(on?nd.c:"var(--border)")+";background:"+(on?nd.c+"22":"var(--card)")+";border-radius:7px;padding:8px 4px;transition:all .2s'><div style='font-size:13px'>"+(on?"✓":"·")+"</div><div style='font-family:var(--mono);font-size:9.5px;color:"+(on?nd.c:"var(--dim)")+"'>"+nd.n+"</div></div>"+(i<nodes.length-1?"<span style='color:var(--dim)'>›</span>":"");
  }).join("");
}
function run(){
  active=-1;draw();document.getElementById("payload").textContent="";
  var d={},i=0;
  var t=setInterval(function(){
    if(i>=nodes.length){clearInterval(t);return;}
    d=nodes[i].t(d);active=i;draw();
    document.getElementById("payload").textContent=JSON.stringify(d,null,2);
    i++;
  },550);
}
document.getElementById("run").onclick=run;
document.getElementById("reset").onclick=function(){active=-1;draw();document.getElementById("payload").textContent="";};
draw();
`,
      {
        question: "A node lowercases an email, then passes to 'Add to CRM'. What does the CRM node receive?",
        options: ["The original raw form data", "The data as transformed by every node before it", "Nothing until the workflow finishes"],
        answer: 1,
        reveal: "Each node transforms the payload and <b>passes it on</b>, so the CRM node sees the already-lowercased email. Data flows down the chain, each step building on the last.",
      },
    ),
  bridge: "In n8n or Zapier, chain two steps where the second references the first's output — change the first and watch the second's input update automatically.",
};

/** Webhook payload → transform → output. */
const webhookTransform: ConceptWidgetDef = {
  id: "webhook-transform",
  title: "Webhook in, mapped data out",
  blurb: "Toggle field mappings and watch the output JSON rebuild live.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Mapping one system's shape to another</div>
       <div class="w-sub">a webhook arrives in Stripe's shape; you map fields to your CRM's shape. Toggle mappings to build the output.</div>
       <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:170px"><div class="w-sub">incoming (Stripe)</div><pre class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:10.5px;color:var(--text-2);white-space:pre-wrap">{
  "data": {
    "customer_email": "x@y.com",
    "amount_total": 4900,
    "currency": "usd"
  }
}</pre></div>
        <div style="flex:1;min-width:170px"><div class="w-sub">outgoing (your CRM)</div><pre id="out" class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:10.5px;color:#22c55e;white-space:pre-wrap"></pre></div>
       </div>
       <div class="w-row" id="maps"></div>
       <div class="w-note">No mapping = the data just doesn't arrive. Notice <code>amount_total</code> is in cents (4900) — the transform step is also where you fix units, formats, and names between systems.</div>`,
      `
var maps=[
  {k:"email",on:true,from:"data.customer_email",to:'"email"',val:'"x@y.com"'},
  {k:"price",on:true,from:"data.amount_total/100",to:'"price"',val:"49.00"},
  {k:"cur",on:false,from:"data.currency",to:'"currency"',val:'"usd"'}
];
function draw(){
  var lines=maps.filter(function(m){return m.on;}).map(function(m){return "  "+m.to+": "+m.val;});
  document.getElementById("out").textContent="{\\n"+lines.join(",\\n")+"\\n}";
}
var bw=document.getElementById("maps");
maps.forEach(function(m){var b=document.createElement("button");b.className="w-btn"+(m.on?"":" alt");b.textContent=(m.on?"− ":"+ ")+m.to;
  b.onclick=function(){m.on=!m.on;b.className="w-btn"+(m.on?"":" alt");b.textContent=(m.on?"− ":"+ ")+m.to;draw();};bw.appendChild(b);});
draw();
`,
      {
        question: "A webhook field has no mapping to your output. What happens to that field?",
        options: ["It's passed through unchanged", "It simply doesn't arrive in the output", "It makes the workflow error out"],
        answer: 1,
        reveal: "No mapping = the field <b>just doesn't arrive</b>. The transform step is also where you fix units (cents → dollars), formats, and names between the two systems.",
      },
    ),
  bridge: "Wire a real webhook into a transform node, map only two of its fields, and confirm the unmapped ones vanish — then add a unit conversion on a numeric field.",
};

/** If/else branch simulator. */
const branchSim: ConceptWidgetDef = {
  id: "branch-sim",
  title: "Conditional branches in a workflow",
  blurb: "Change the input and watch the workflow take a different path.",
  html: () =>
    widgetDoc(
      `<div class="w-title">if / else routing</div>
       <div class="w-sub">automations branch on data. Change the order total and watch which path lights up.</div>
       <div class="w-row"><span class="w-label">order total</span><input id="amt" type="range" min="0" max="500" step="10" value="120"><span class="w-val" id="av">$120</span></div>
       <div id="tree" style="margin-top:10px"></div>`,
      `
function draw(){
  var a=+document.getElementById("amt").value;document.getElementById("av").textContent="$"+a;
  var hi=a>=200;
  function node(t,on,col){return "<div style='padding:8px 12px;border-radius:7px;border:1px solid "+(on?col:"var(--border)")+";background:"+(on?col+"22":"var(--card)")+";color:"+(on?col:"var(--dim)")+";font-size:12.5px;margin:4px 0'>"+t+"</div>";}
  var h=node("Trigger: new order ($"+a+")",true,"#fbbf24");
  h+="<div style='padding-left:18px;border-left:2px solid var(--border);margin-left:10px'>";
  h+="<div class='w-sub' style='margin-top:6px'>if total ≥ $200:</div>"+node("→ assign VIP rep + gift card",hi,"#22c55e");
  h+="<div class='w-sub' style='margin-top:6px'>else:</div>"+node("→ standard confirmation email",!hi,"#60a5fa");
  h+="</div>";
  document.getElementById("tree").innerHTML=h;
}
document.getElementById("amt").addEventListener("input",draw);
draw();
`,
      {
        question: "A workflow branches on 'order total ≥ $200'. An $80 order comes in. Which path runs?",
        options: ["The VIP path", "The else / standard path", "Both paths run"],
        answer: 1,
        reveal: "$80 fails the ≥ $200 test, so only the <b>else</b> branch runs — standard confirmation, no VIP. A condition routes each item down exactly one path.",
      },
    ),
  bridge: "Add an if/else (filter or switch) node to a real automation keyed on a numeric field, send two test items either side of the threshold, and confirm each takes a different branch.",
};

export const automationWidgets: ConceptWidgetDef[] = [
  workflowBuilder,
  webhookTransform,
  branchSim,
];
