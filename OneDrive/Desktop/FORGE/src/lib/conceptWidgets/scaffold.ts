/**
 * Shared scaffold for every concept widget.
 *
 * A widget author writes only a `body` (HTML) and a `script` (vanilla JS that
 * wires it up), plus optional `predict` (a before-you-look question) and a
 * `bridge` line. `widgetDoc()` wraps body + script in a complete, self-contained
 * HTML document with:
 *   - Forge's dark/gold theme tokens (no external CSS, no fonts loaded over
 *     the network — system stacks only, so it paints instantly offline)
 *   - reusable control styles (.w-row, .w-label, sliders, buttons, chips)
 *   - a height reporter that postMessages its scrollHeight to the parent on
 *     load, on resize, and on any DOM mutation, so the iframe never scrolls
 *
 * Predict-before-reveal: if a widget supplies a `predict` spec, the sim renders
 * BLURRED behind a question the learner must answer first. Committing a guess —
 * even a wrong one — is what turns a passive demo into active recall, which is
 * where the real learning lives. After answering they get a one-line "why" and
 * the sim unlocks. (The sim still initialises underneath while locked, so SVGs
 * and tables that measure themselves on load aren't broken by the gate.)
 *
 * The document is dropped into an `<iframe sandbox="allow-scripts">` with NO
 * `allow-same-origin` — full isolation. It cannot touch cookies, storage, the
 * parent DOM, or the network. The only channel out is the height postMessage.
 */

export type WidgetParams = Record<string, string | number | boolean>;

/** A before-you-look question. The learner must commit a guess before the sim
 *  unlocks — that act of prediction is the point. */
export interface PredictSpec {
  /** The question, e.g. "df["qty"]==2 returns…" */
  question: string;
  /** 2–3 short answer choices. */
  options: string[];
  /** Index into `options` of the correct answer. */
  answer: number;
  /** One-line explanation shown after they pick (may contain <b>). */
  reveal: string;
}

export interface ConceptWidgetDef {
  /** Registry key referenced from roadmap JSON. */
  id: string;
  /** Human title shown above the frame. */
  title: string;
  /** One-liner describing what the learner manipulates. */
  blurb: string;
  /** Builds the full HTML document for the given params. */
  html: (params?: WidgetParams) => string;
  /** "Now do it for real" — the concrete next action in the actual tool.
   *  Rendered by the React wrapper BELOW the iframe, so it reads as a handoff
   *  from the toy sim to the real work in the day's exercises. */
  bridge?: string;
}

const THEME = `
:root{
  --bg:#15110d; --panel:#1c1711; --card:#221b13; --border:#3a2f20;
  --accent:#D4AF37; --accent-soft:#f0c75c; --green:#22c55e; --red:#ef4444;
  --blue:#60a5fa; --purple:#c084fc; --pink:#fb7185; --teal:#2dd4bf;
  --text:#f4ede0; --text-2:#c8bda9; --dim:#8a7c63;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --body:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{
  font-family:var(--body); color:var(--text);
  padding:14px; line-height:1.5; font-size:14px;
  -webkit-font-smoothing:antialiased;
}
.w-stage{
  position:relative;
  background:linear-gradient(180deg,rgba(212,175,55,.05),rgba(212,175,55,.01));
  border:1px solid var(--border); border-radius:12px; padding:16px;
}
.w-title{font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px}
.w-sub{font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;color:var(--dim);margin-bottom:14px}
.w-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0}
.w-label{font-family:var(--mono);font-size:11px;color:var(--text-2);min-width:88px}
.w-val{font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:600;min-width:46px;text-align:right}
input[type=range]{
  -webkit-appearance:none;appearance:none;height:4px;border-radius:3px;
  background:var(--border);flex:1;min-width:120px;cursor:pointer;outline:none;
}
input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none;width:16px;height:16px;border-radius:50%;
  background:var(--accent);border:2px solid var(--bg);cursor:pointer;
  box-shadow:0 0 0 1px var(--accent);
}
input[type=range]::-moz-range-thumb{
  width:16px;height:16px;border-radius:50%;background:var(--accent);
  border:2px solid var(--bg);cursor:pointer;
}
.w-btn{
  font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.04em;
  background:rgba(212,175,55,.12);color:var(--accent);
  border:1px solid rgba(212,175,55,.4);border-radius:7px;
  padding:7px 13px;cursor:pointer;transition:background .15s,transform .08s;
}
.w-btn:hover{background:rgba(212,175,55,.2)}
.w-btn:active{transform:translateY(1px)}
.w-btn:disabled{opacity:.4;cursor:not-allowed}
.w-btn.alt{background:transparent;color:var(--text-2);border-color:var(--border)}
.w-chip{
  display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);
  font-size:10px;letter-spacing:.06em;padding:3px 8px;border-radius:999px;
  background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);color:var(--accent);
}
.w-note{font-size:12.5px;color:var(--text-2);line-height:1.55;margin-top:10px}
.w-note b{color:var(--text)}
code,.mono{font-family:var(--mono)}
table{border-collapse:collapse;font-family:var(--mono);font-size:12px;width:100%}
th,td{border:1px solid var(--border);padding:5px 9px;text-align:left;white-space:nowrap}
th{background:var(--card);color:var(--accent);font-weight:600}
td{color:var(--text-2)}
tr.hit td{background:rgba(34,197,94,.12);color:var(--text)}
svg{display:block;max-width:100%}
.flash{animation:flash .5s ease}
@keyframes flash{from{background:rgba(212,175,55,.25)}to{background:transparent}}

/* predict-before-reveal gate */
.w-sim{transition:filter .35s ease,opacity .35s ease}
.w-sim.locked{filter:blur(7px) saturate(.55);opacity:.5;pointer-events:none;user-select:none}
.w-predict{
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:13px;padding:22px;
  text-align:center;border-radius:12px;
  background:radial-gradient(120% 120% at 50% 40%,rgba(21,17,13,.84),rgba(21,17,13,.96));
}
.w-predict-tag{
  font-family:var(--mono);font-size:9px;letter-spacing:.22em;text-transform:uppercase;
  color:var(--accent);background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);
  border-radius:999px;padding:3px 10px;
}
.w-predict-q{font-size:14.5px;font-weight:600;color:var(--text);max-width:440px;line-height:1.45}
.w-predict-opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.w-pick{
  font-family:var(--body);font-size:12.5px;font-weight:600;
  background:rgba(212,175,55,.1);color:var(--text);
  border:1px solid rgba(212,175,55,.35);border-radius:8px;
  padding:9px 14px;cursor:pointer;transition:background .15s,transform .08s;max-width:240px;
}
.w-pick:hover{background:rgba(212,175,55,.2)}
.w-pick:active{transform:translateY(1px)}
.w-pick:disabled{cursor:default}
.w-pick.right{background:rgba(34,197,94,.18);border-color:var(--green);color:#86efac}
.w-pick.wrong{background:rgba(239,68,68,.15);border-color:var(--red);color:#fca5a5}
.w-pick.muted{opacity:.4}
.w-predict-fb{font-size:12.5px;color:var(--text-2);max-width:460px;line-height:1.55}
.w-predict-fb b{color:var(--text)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

const HEIGHT_REPORTER = `
(function(){
  function report(){
    var h=Math.ceil(document.documentElement.getBoundingClientRect().height);
    parent.postMessage({__forgeWidget:true,type:"height",height:h},"*");
  }
  window.addEventListener("load",report);
  window.addEventListener("resize",report);
  var mo=new MutationObserver(report);
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,characterData:true});
  setTimeout(report,60); setTimeout(report,300);
  document.addEventListener("input",report,true);
  document.addEventListener("click",function(){setTimeout(report,30)},true);
})();
`;

/** Builds the predict-gate script for one widget. Runs AFTER the sim's own
 *  script, so the sim is already initialised (and measured) underneath. */
function predictScript(p: PredictSpec): string {
  return `
var P=${JSON.stringify(p)};
var stage=document.querySelector(".w-stage");
var sim=document.getElementById("w-sim");
if(stage&&sim){
  var ov=document.createElement("div"); ov.className="w-predict";
  var tag=document.createElement("div"); tag.className="w-predict-tag"; tag.textContent="Predict first"; ov.appendChild(tag);
  var q=document.createElement("div"); q.className="w-predict-q"; q.textContent=P.question; ov.appendChild(q);
  var opts=document.createElement("div"); opts.className="w-predict-opts";
  P.options.forEach(function(o,i){
    var b=document.createElement("button"); b.className="w-pick"; b.textContent=o;
    b.addEventListener("click",function(){pick(i);}); opts.appendChild(b);
  });
  ov.appendChild(opts);
  var fb=document.createElement("div"); fb.className="w-predict-fb"; ov.appendChild(fb);
  stage.appendChild(ov);
  function fit(){ stage.style.minHeight=Math.max(sim.offsetHeight,ov.scrollHeight+8)+"px"; }
  fit(); setTimeout(fit,90);
  var done=false;
  function pick(i){
    if(done) return; done=true;
    var bs=opts.querySelectorAll(".w-pick");
    [].forEach.call(bs,function(b,j){ b.disabled=true; b.className="w-pick "+(j===P.answer?"right":(j===i?"wrong":"muted")); });
    fb.innerHTML="<b>"+(i===P.answer?"Right.":"Not quite.")+"</b> "+P.reveal;
    var go=document.createElement("button"); go.className="w-btn"; go.textContent="Explore it \\u2192";
    go.addEventListener("click",function(){ if(ov.parentNode)ov.parentNode.removeChild(ov); sim.className="w-sim"; stage.style.minHeight=""; });
    ov.appendChild(go); fit();
  }
}
`;
}

export function widgetDoc(body: string, script: string, predict?: PredictSpec): string {
  const stageInner = predict ? `<div class="w-sim locked" id="w-sim">${body}</div>` : body;
  const gate = predict
    ? `<script>(function(){try{${predictScript(predict)}}catch(e){}})();</script>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${THEME}</style></head>
<body><div class="w-stage">${stageInner}</div>
<script>${HEIGHT_REPORTER}</script>
<script>(function(){try{${script}}catch(e){
  document.body.innerHTML='<div class="w-stage" style="color:var(--red)">Widget error: '+(e&&e.message||e)+'</div>';
}})();</script>
${gate}
</body></html>`;
}

/** Small helper for safe numeric param reads with a default. */
export function num(params: WidgetParams | undefined, key: string, def: number): number {
  const v = params?.[key];
  return typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)) ? Number(v) : def;
}
