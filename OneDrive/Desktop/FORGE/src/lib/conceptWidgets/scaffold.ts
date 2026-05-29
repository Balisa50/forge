/**
 * Shared scaffold for every concept widget.
 *
 * A widget author writes only a `body` (HTML) and a `script` (vanilla JS that
 * wires it up). `widgetDoc()` wraps both in a complete, self-contained HTML
 * document with:
 *   - Forge's dark/gold theme tokens (no external CSS, no fonts loaded over
 *     the network — system stacks only, so it paints instantly offline)
 *   - reusable control styles (.w-row, .w-label, sliders, buttons, chips)
 *   - a height reporter that postMessages its scrollHeight to the parent on
 *     load, on resize, and on any DOM mutation, so the iframe never scrolls
 *
 * The document is dropped into an `<iframe sandbox="allow-scripts">` with NO
 * `allow-same-origin` — full isolation. It cannot touch cookies, storage, the
 * parent DOM, or the network. The only channel out is the height postMessage.
 */

export type WidgetParams = Record<string, string | number | boolean>;

export interface ConceptWidgetDef {
  /** Registry key referenced from roadmap JSON. */
  id: string;
  /** Human title shown above the frame. */
  title: string;
  /** One-liner describing what the learner manipulates. */
  blurb: string;
  /** Builds the full HTML document for the given params. */
  html: (params?: WidgetParams) => string;
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

export function widgetDoc(body: string, script: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${THEME}</style></head>
<body><div class="w-stage">${body}</div>
<script>${HEIGHT_REPORTER}</script>
<script>(function(){try{${script}}catch(e){
  document.body.innerHTML='<div class="w-stage" style="color:var(--red)">Widget error: '+(e&&e.message||e)+'</div>';
}})();</script>
</body></html>`;
}

/** Small helper for safe numeric param reads with a default. */
export function num(params: WidgetParams | undefined, key: string, def: number): number {
  const v = params?.[key];
  return typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)) ? Number(v) : def;
}
