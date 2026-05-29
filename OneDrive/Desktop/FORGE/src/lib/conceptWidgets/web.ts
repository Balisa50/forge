import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** Flexbox playground: change justify/align/direction, see boxes move + the CSS. */
const flexboxPlayground: ConceptWidgetDef = {
  id: "flexbox-playground",
  title: "Flexbox, felt not memorised",
  blurb: "Flip the flex properties and watch the boxes — and the CSS — react.",
  html: () =>
    widgetDoc(
      `<div class="w-title">justify-content vs align-items</div>
       <div class="w-sub">the #1 confusion: justify works along the main axis, align works across it. Flip direction and they swap.</div>
       <div class="w-row"><span class="w-label">direction</span><select id="dir" class="w-btn alt"><option value="row">row</option><option value="column">column</option></select></div>
       <div class="w-row"><span class="w-label">justify</span><select id="jc" class="w-btn alt"><option>flex-start</option><option>center</option><option>flex-end</option><option>space-between</option><option>space-around</option></select></div>
       <div class="w-row"><span class="w-label">align</span><select id="ai" class="w-btn alt"><option>stretch</option><option>flex-start</option><option>center</option><option>flex-end</option></select></div>
       <div id="box" style="margin-top:10px;border:1px dashed var(--border);border-radius:8px;height:140px;display:flex;gap:8px;padding:8px;background:rgba(0,0,0,.2)"></div>
       <pre id="css" class="mono" style="margin-top:10px;background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:11.5px;color:var(--accent-soft);white-space:pre-wrap"></pre>`,
      `
var cols=["#60a5fa","#22c55e","#fb7185"];
var box=document.getElementById("box");
box.innerHTML=cols.map(function(c,i){return "<div style='background:"+c+";border-radius:6px;width:46px;height:"+(i===1?64:46)+"px;display:grid;place-items:center;color:#15110d;font-weight:700;font-family:monospace'>"+(i+1)+"</div>";}).join("");
function apply(){
  var dir=document.getElementById("dir").value,jc=document.getElementById("jc").value,ai=document.getElementById("ai").value;
  box.style.flexDirection=dir;box.style.justifyContent=jc;box.style.alignItems=ai;
  document.getElementById("css").textContent=".parent {\\n  display: flex;\\n  flex-direction: "+dir+";\\n  justify-content: "+jc+";\\n  align-items: "+ai+";\\n}";
}
["dir","jc","ai"].forEach(function(id){document.getElementById(id).addEventListener("change",apply);});
apply();
`
    ),
};

/** HTTP request/response inspector: click a method, see the full exchange. */
const httpInspector: ConceptWidgetDef = {
  id: "http-inspector",
  title: "What a request actually contains",
  blurb: "Pick a method and read the real request and response, line by line.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Anatomy of an HTTP exchange</div>
       <div class="w-sub">a request is just text: a line, some headers, maybe a body. The response is the same shape back.</div>
       <div class="w-row" id="mbtns"></div>
       <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px"><div class="w-sub">&uarr; request (browser → server)</div><pre id="req" class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:11px;color:#60a5fa;white-space:pre-wrap"></pre></div>
        <div style="flex:1;min-width:200px"><div class="w-sub">&darr; response (server → browser)</div><pre id="res" class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:11px;color:#22c55e;white-space:pre-wrap"></pre></div>
       </div>
       <div class="w-note" id="lab"></div>`,
      `
var ex={
  GET:{req:"GET /api/users/7 HTTP/1.1\\nHost: forge.app\\nAccept: application/json",res:"200 OK\\nContent-Type: application/json\\n\\n{ \\"id\\": 7, \\"name\\": \\"Awa\\" }",why:"<b>GET</b> reads. No body sent. 200 = here it is. GETs should never change data — safe to retry."},
  POST:{req:"POST /api/users HTTP/1.1\\nHost: forge.app\\nContent-Type: application/json\\n\\n{ \\"name\\": \\"Lamin\\" }",res:"201 Created\\nLocation: /api/users/8\\n\\n{ \\"id\\": 8, \\"name\\": \\"Lamin\\" }",why:"<b>POST</b> creates. Body carries the new data. 201 = created, and Location points to the new thing."},
  DELETE:{req:"DELETE /api/users/8 HTTP/1.1\\nHost: forge.app",res:"204 No Content",why:"<b>DELETE</b> removes. 204 = done, nothing to return. The status code IS the answer."},
  "404":{req:"GET /api/users/999 HTTP/1.1\\nHost: forge.app",res:"404 Not Found\\n\\n{ \\"error\\": \\"no such user\\" }",why:"<b>404</b> = the server understood you fine, that resource just doesn't exist. (Different from 500 = the server itself broke.)"}
};
var keys=Object.keys(ex),cur="GET";
function draw(){
  document.getElementById("req").textContent=ex[cur].req;
  document.getElementById("res").textContent=ex[cur].res;
  document.getElementById("lab").innerHTML=ex[cur].why;
}
var bw=document.getElementById("mbtns");
keys.forEach(function(k){var b=document.createElement("button");b.className="w-btn"+(k===cur?"":" alt");b.textContent=k;
  b.onclick=function(){cur=k;[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(keys[i]===cur?"":" alt");});draw();};bw.appendChild(b);});
draw();
`
    ),
};

/** Box model: slide margin/border/padding and watch the layers. */
const boxModel: ConceptWidgetDef = {
  id: "box-model",
  title: "The CSS box model",
  blurb: "Slide margin, border, and padding to see the four nested layers.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Every element is four nested boxes</div>
       <div class="w-sub">content → padding → border → margin. Width is the content box; padding and border add to the space it eats.</div>
       <div style="display:grid;place-items:center;padding:12px;background:rgba(0,0,0,.2);border-radius:8px">
         <div id="margin" style="background:rgba(251,146,60,.18);transition:all .15s">
          <div id="border" style="background:#D4AF37;transition:all .15s">
           <div id="padding" style="background:rgba(96,165,250,.25);transition:all .15s">
            <div style="background:#1c1711;color:var(--text);font-family:monospace;font-size:11px;padding:6px 10px;white-space:nowrap">content</div>
           </div>
          </div>
         </div>
       </div>
       <div class="w-row"><span class="w-label">margin</span><input id="m" type="range" min="0" max="30" value="12"><span class="w-val" id="mv">12</span></div>
       <div class="w-row"><span class="w-label">border</span><input id="b" type="range" min="0" max="16" value="4"><span class="w-val" id="bv">4</span></div>
       <div class="w-row"><span class="w-label">padding</span><input id="p" type="range" min="0" max="30" value="10"><span class="w-val" id="pv">10</span></div>
       <div class="w-note" id="lab"></div>`,
      `
function draw(){
  var m=+document.getElementById("m").value,b=+document.getElementById("b").value,p=+document.getElementById("p").value;
  document.getElementById("mv").textContent=m;document.getElementById("bv").textContent=b;document.getElementById("pv").textContent=p;
  document.getElementById("margin").style.padding=m+"px";
  document.getElementById("border").style.padding=b+"px";
  document.getElementById("padding").style.padding=p+"px";
  document.getElementById("lab").innerHTML="Total horizontal footprint = content + 2&times;("+p+" padding + "+b+" border + "+m+" margin). <b>margin</b> pushes neighbours away; <b>padding</b> grows the element's own background.";
}
["m","b","p"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
draw();
`
    ),
};

/** React state: click to setState, see re-render flash + render count. */
const reactStateFlow: ConceptWidgetDef = {
  id: "react-state-flow",
  title: "State change → re-render",
  blurb: "Change state and watch exactly which parts of the UI re-run.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Why the UI updates on its own</div>
       <div class="w-sub">you never touch the DOM. You change state; React re-runs the component and paints the difference.</div>
       <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:stretch">
        <div style="flex:1;min-width:150px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div class="w-sub">state</div>
          <div style="font-family:var(--mono);font-size:13px;color:var(--accent)">count = <span id="sval">0</span></div>
          <div class="w-row" style="justify-content:center"><button class="w-btn" id="inc">setCount(c+1)</button></div>
        </div>
        <div style="align-self:center;color:var(--accent)">&rarr;</div>
        <div id="render" style="flex:1;min-width:150px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
          <div class="w-sub">rendered UI</div>
          <div style="font-size:22px;font-weight:700" id="ui">0</div>
          <div class="w-sub" style="margin-top:6px">render #<span id="rc">1</span></div>
        </div>
       </div>
       <div class="w-note">Each click calls <code>setCount</code>, which marks the component dirty. React re-runs the function (render # ticks up), gets new JSX, and updates only what changed. No manual <code>document.getElementById</code> — that's the whole pitch.</div>`,
      `
var count=0,renders=1;
document.getElementById("inc").onclick=function(){
  count++;renders++;
  document.getElementById("sval").textContent=count;
  document.getElementById("ui").textContent=count;
  document.getElementById("rc").textContent=renders;
  var r=document.getElementById("render");r.classList.remove("flash");void r.offsetWidth;r.classList.add("flash");
};
`
    ),
};

/** SQL query builder: toggle clauses, see the result table filter/sort. */
const sqlQuery: ConceptWidgetDef = {
  id: "sql-query",
  title: "Build a SQL query, see the rows",
  blurb: "Toggle WHERE, ORDER BY and LIMIT and watch the result set change.",
  html: () =>
    widgetDoc(
      `<div class="w-title">SELECT … FROM orders</div>
       <div class="w-sub">each clause does one job — toggle them and watch the result, and the query, update</div>
       <div class="w-row" id="cl"></div>
       <pre id="q" class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:12px;color:var(--accent-soft);white-space:pre-wrap"></pre>
       <div id="out"></div>`,
      `
var rows=[{id:1,city:"Banjul",total:40},{id:2,city:"Serrekunda",total:120},{id:3,city:"Banjul",total:15},{id:4,city:"Brikama",total:90},{id:5,city:"Serrekunda",total:60}];
var st={where:false,order:false,limit:false};
function compute(){
  var r=rows.slice();
  if(st.where)r=r.filter(function(x){return x.total>50;});
  if(st.order)r.sort(function(a,b){return b.total-a.total;});
  if(st.limit)r=r.slice(0,2);
  return r;
}
function draw(){
  var q="SELECT id, city, total\\nFROM orders";
  if(st.where)q+="\\nWHERE total > 50";
  if(st.order)q+="\\nORDER BY total DESC";
  if(st.limit)q+="\\nLIMIT 2";
  q+=";";
  document.getElementById("q").textContent=q;
  var r=compute(),h="<table><tr><th>id</th><th>city</th><th>total</th></tr>";
  r.forEach(function(x){h+="<tr class=hit><td>"+x.id+"</td><td>"+x.city+"</td><td>"+x.total+"</td></tr>";});
  document.getElementById("out").innerHTML=h+"</table>";
}
var clauses=[{k:"where",l:"WHERE total>50"},{k:"order",l:"ORDER BY"},{k:"limit",l:"LIMIT 2"}];
var bw=document.getElementById("cl");
clauses.forEach(function(c){var b=document.createElement("button");b.className="w-btn alt";b.textContent="+ "+c.l;
  b.onclick=function(){st[c.k]=!st[c.k];b.className="w-btn"+(st[c.k]?"":" alt");b.textContent=(st[c.k]?"− ":"+ ")+c.l;draw();};bw.appendChild(b);});
draw();
`
    ),
};

export const webWidgets: ConceptWidgetDef[] = [
  flexboxPlayground,
  httpInspector,
  boxModel,
  reactStateFlow,
  sqlQuery,
];
