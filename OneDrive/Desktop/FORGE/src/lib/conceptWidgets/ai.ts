import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** Type text, see it split into tokens with ids. */
const tokenizer: ConceptWidgetDef = {
  id: "tokenizer",
  title: "Text becomes tokens",
  blurb: "Type anything and watch it split into the chunks a model actually sees.",
  html: () =>
    widgetDoc(
      `<div class="w-title">A model never sees letters — it sees tokens</div>
       <div class="w-sub">type below. Each coloured chunk is one token (≈ a common word-piece). This is what you pay for and what fills the context window.</div>
       <input id="in" type="text" value="Tokenization isn't magic — it's chunks!" style="width:100%;font-family:var(--mono);font-size:13px;background:var(--card);border:1px solid var(--border);border-radius:7px;padding:9px;color:var(--text)">
       <div id="toks" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:5px"></div>
       <div class="w-row" style="gap:16px"><span class="w-chip" id="tc"></span><span class="w-chip" id="cc"></span></div>
       <div class="w-note">Notice: spaces usually attach to the <i>next</i> word, rare words split into pieces, and "isn't" becomes more than one token. That's why token count ≠ word count.</div>`,
      `
var cols=["#60a5fa","#22c55e","#fb7185","#c084fc","#fbbf24","#2dd4bf"];
function tokenize(s){
  // toy BPE-ish: split on word boundaries, attach leading space, break long words
  var raw=s.match(/\\s*[A-Za-z]+|\\s*[0-9]+|\\s*[^A-Za-z0-9\\s]|\\s+$/g)||[];
  var out=[];
  raw.forEach(function(t){
    var w=t.replace(/^\\s+/,""),lead=t.length-w.length?" ":"";
    if(w.length>6){out.push(lead+w.slice(0,4));out.push(w.slice(4));}
    else out.push(lead+w);
  });
  return out.filter(function(t){return t.length;});
}
function render(){
  var s=document.getElementById("in").value;
  var toks=tokenize(s),html="";
  toks.forEach(function(t,i){
    var disp=t.replace(/ /g,"·");
    html+="<span style='background:"+cols[i%cols.length]+"22;border:1px solid "+cols[i%cols.length]+"66;color:"+cols[i%cols.length]+";padding:3px 7px;border-radius:5px;font-family:var(--mono);font-size:12px'>"+disp+"<span style='opacity:.5;font-size:9px'> "+(1000+i)+"</span></span>";
  });
  document.getElementById("toks").innerHTML=html;
  document.getElementById("tc").textContent=toks.length+" tokens";
  document.getElementById("cc").textContent=s.length+" characters";
}
document.getElementById("in").addEventListener("input",render);
render();
`,
      {
        question: "Does the word \"isn't\" count as a single token?",
        options: ["Yes — one word, one token", "No — it usually splits into several tokens", "Only when the text is long"],
        answer: 1,
        reveal: "Tokenizers split on common word-pieces, so contractions, rare words, and even spaces become separate tokens. That's why token count ≠ word count — and why you're billed per token, not per word.",
      },
    ),
  bridge: "Paste a paragraph into a real tokenizer (tiktoken in Python, or the OpenAI/Anthropic web tool) and compare token count to word count — the ratio is usually ~1.3 tokens per word.",
};

/** Slide temperature; the next-token probability bars sharpen or flatten. */
const temperatureSampling: ConceptWidgetDef = {
  id: "temperature-sampling",
  title: "Temperature reshapes the dice",
  blurb: "Slide temperature and watch the model go from confident to chaotic.",
  html: () =>
    widgetDoc(
      `<div class="w-title">"The weather today is ___"</div>
       <div class="w-sub">the model has a probability for every next token. Temperature rescales them before it rolls the dice.</div>
       <div id="bars"></div>
       <div class="w-row"><span class="w-label">temperature</span><input id="t" type="range" min="0.1" max="2" step="0.05" value="0.7"><span class="w-val" id="tv">0.70</span></div>
       <div class="w-note" id="lab"></div>`,
      `
var toks=["sunny","cloudy","rainy","cold","windy","perfect"];
var logits=[2.4,1.8,1.2,0.6,0.2,-0.4];
function soft(T){
  var e=logits.map(function(l){return Math.exp(l/T);});
  var z=e.reduce(function(a,b){return a+b;},0);
  return e.map(function(x){return x/z;});
}
function draw(){
  var T=+document.getElementById("t").value;document.getElementById("tv").textContent=T.toFixed(2);
  var p=soft(T),html="";
  toks.forEach(function(tk,i){
    var w=(p[i]*100);
    html+="<div class='w-row' style='margin:5px 0'><span class='w-label' style='min-width:60px'>"+tk+"</span><div style='flex:1;background:var(--card);border-radius:4px;height:16px;overflow:hidden'><div style='width:"+w.toFixed(1)+"%;height:100%;background:linear-gradient(90deg,#D4AF37,#f0c75c);transition:width .15s'></div></div><span class='w-val'>"+w.toFixed(0)+"%</span></div>";
  });
  document.getElementById("bars").innerHTML=html;
  var lab=T<0.4?"<b>Low temp:</b> bars sharpen — it almost always picks the top token. Repetitive but safe. Use for code, extraction, classification.":T>1.3?"<b>High temp:</b> bars flatten — unlikely tokens get a real shot. Creative, but it goes off the rails. Use for brainstorming.":"<b>Mid temp:</b> mostly sensible with some variety. Good default for chat.";
  document.getElementById("lab").innerHTML=lab;
}
document.getElementById("t").addEventListener("input",draw);
draw();
`,
      {
        question: "You set temperature near 0. What does the output look like?",
        options: ["Wild and creative", "Almost always the single most likely token — repetitive but safe", "Completely random noise"],
        answer: 1,
        reveal: "Low temp sharpens the probabilities so the top token wins nearly every time — great for code and extraction. High temp flattens them, giving unlikely tokens a real shot.",
      },
    ),
  bridge: "Call the same prompt twice at temperature 0 and twice at 1.5 — the low-temp pair comes back near-identical, the high-temp pair won't.",
};

/** Embedding 2D space: hover words, see cosine similarity. */
const embeddingSpace: ConceptWidgetDef = {
  id: "embedding-space",
  title: "Meaning becomes geometry",
  blurb: "Click two words and see how 'closeness' is literally distance.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Embeddings: similar meaning, nearby points</div>
       <div class="w-sub">click any two words — we'll draw the line between them and compute their cosine similarity</div>
       <svg id="sv" viewBox="0 0 260 200" width="100%" style="background:rgba(0,0,0,.2);border-radius:8px"></svg>
       <div class="w-note" id="lab">Pick a first word.</div>`,
      `
var words=[
  {w:"king",x:0.7,y:0.8},{w:"queen",x:0.78,y:0.7},{w:"man",x:0.55,y:0.85},{w:"woman",x:0.62,y:0.72},
  {w:"dog",x:0.2,y:0.3},{w:"cat",x:0.28,y:0.25},{w:"puppy",x:0.15,y:0.38},
  {w:"car",x:0.8,y:0.15},{w:"truck",x:0.88,y:0.2},{w:"banana",x:0.35,y:0.6}
];
var W=260,H=200,sel=[];
function px(x){return 16+x*(W-32);}function py(y){return H-16-y*(H-32);}
function cos(a,b){var d=a.x*b.x+a.y*b.y,ma=Math.hypot(a.x,a.y),mb=Math.hypot(b.x,b.y);return d/(ma*mb);}
function draw(){
  var s="";
  if(sel.length===2)s+="<line x1="+px(sel[0].x)+" y1="+py(sel[0].y)+" x2="+px(sel[1].x)+" y2="+py(sel[1].y)+" stroke='#D4AF37' stroke-width='1.5'/>";
  words.forEach(function(o){
    var on=sel.indexOf(o)>=0;
    s+="<circle cx="+px(o.x)+" cy="+py(o.y)+" r='"+(on?5:3.5)+"' fill='"+(on?"#D4AF37":"#60a5fa")+"' style='cursor:pointer' data-w='"+o.w+"'/>";
    s+="<text x="+(px(o.x)+6)+" y="+(py(o.y)+3)+" fill='"+(on?"#f0c75c":"#c8bda9")+"' font-size='9' font-family='monospace' style='cursor:pointer' data-w='"+o.w+"'>"+o.w+"</text>";
  });
  document.getElementById("sv").innerHTML=s;
}
document.getElementById("sv").addEventListener("click",function(e){
  var w=e.target.getAttribute&&e.target.getAttribute("data-w");if(!w)return;
  var o=words.filter(function(x){return x.w===w;})[0];
  if(sel.length===2)sel=[];
  sel.push(o);
  if(sel.length===2){
    var c=cos(sel[0],sel[1]);
    document.getElementById("lab").innerHTML="<b>"+sel[0].w+"</b> &harr; <b>"+sel[1].w+"</b>: cosine similarity <b>"+c.toFixed(2)+"</b>. "+(c>0.95?"Nearly the same direction — closely related.":c>0.8?"Fairly related.":"Different regions of meaning.");
  } else {
    document.getElementById("lab").innerHTML="Selected <b>"+sel[0].w+"</b> — pick a second word.";
  }
  draw();
});
draw();
`,
      {
        question: "Two words sit very close together in embedding space. That means…",
        options: ["They're spelled similarly", "They have similar meaning", "They appear equally often in text"],
        answer: 1,
        reveal: "Distance in embedding space encodes <b>meaning</b>, not spelling. 'king' and 'queen' land near each other; 'king' and 'banana' don't — which is exactly what powers semantic search.",
      },
    ),
  bridge: "Embed a handful of sentences with a real model (sentence-transformers) and compute cosine similarity — the closest pair should be the ones that mean the same thing.",
};

/** RAG flow: a query retrieves the top chunks and stuffs the prompt. */
const ragFlow: ConceptWidgetDef = {
  id: "rag-flow",
  title: "How RAG finds the right chunk",
  blurb: "Ask a question; watch retrieval rank chunks and feed only the best into the prompt.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Retrieval-augmented generation</div>
       <div class="w-sub">the model doesn't read your whole knowledge base — it retrieves the few most relevant chunks first</div>
       <div class="w-row" id="qbtns"></div>
       <div class="w-sub" style="margin:6px 0 4px">chunks, ranked by similarity to your question:</div>
       <div id="chunks"></div>
       <div class="w-note" id="lab"></div>`,
      `
var chunks=[
  {t:"Refunds are processed within 5 business days to the original card.",tags:["refund","money","card","days"]},
  {t:"Our office hours are 9am to 5pm GMT, Monday to Friday.",tags:["hours","office","time"]},
  {t:"To reset your password, click 'Forgot password' on the login page.",tags:["password","reset","login"]},
  {t:"Premium plans include priority support and unlimited projects.",tags:["premium","plan","support","projects"]},
  {t:"You can cancel any time; your refund is prorated for the unused period.",tags:["cancel","refund","prorated","money"]}
];
var queries=[
  {q:"How do I get my money back?",tags:["refund","money","cancel","card"]},
  {q:"I forgot my password",tags:["password","reset","login"]},
  {q:"When are you open?",tags:["hours","office","time"]}
];
var cur=0;
function score(c,q){var s=0;c.tags.forEach(function(t){if(q.tags.indexOf(t)>=0)s++;});return s;}
function draw(){
  var q=queries[cur];
  var ranked=chunks.map(function(c){return{c:c,s:score(c,q)};}).sort(function(a,b){return b.s-a.s;});
  var html="";
  ranked.forEach(function(r,i){
    var top=i<2&&r.s>0;
    html+="<div style='display:flex;gap:8px;align-items:center;margin:5px 0;opacity:"+(top?1:0.45)+"'>"+
      "<span class='w-chip' style='min-width:54px;justify-content:center;"+(top?"background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.4);color:#22c55e":"")+"'>"+(r.s>0?r.s+" match"+(r.s>1?"es":""):"0")+"</span>"+
      "<span style='font-size:12.5px;color:"+(top?"var(--text)":"var(--dim)")+"'>"+r.c.t+(top?" &nbsp;<b style='color:#22c55e'>&larr; sent to model</b>":"")+"</span></div>";
  });
  document.getElementById("chunks").innerHTML=html;
  document.getElementById("lab").innerHTML="Only the <b>top-2</b> chunks get pasted into the prompt as context. The model answers from <i>those</i>, not from memory — that's why RAG cuts hallucination and lets you cite sources.";
}
var bw=document.getElementById("qbtns");
queries.forEach(function(q,i){var b=document.createElement("button");b.className="w-btn"+(i===cur?"":" alt");b.textContent=q.q;
  b.onclick=function(){cur=i;[].forEach.call(bw.children,function(c,j){c.className="w-btn"+(j===cur?"":" alt");});draw();};bw.appendChild(b);});
draw();
`,
      {
        question: "In RAG, how much of your knowledge base does the model actually read to answer?",
        options: ["The entire knowledge base", "Only the top few retrieved chunks", "Nothing — it answers from memory"],
        answer: 1,
        reveal: "Retrieval ranks chunks by similarity and pastes only the <b>top few</b> into the prompt. The model answers from those — which is why RAG cuts hallucination and lets you cite sources.",
      },
    ),
  bridge: "Build a tiny RAG loop: embed 5 docs, embed a question, retrieve the top-2 by cosine, paste only those into the prompt — confirm the answer comes from the retrieved text.",
};

/** Context window budget: add messages, watch the window fill and evict. */
const contextWindow: ConceptWidgetDef = {
  id: "context-window",
  title: "The context window is a budget",
  blurb: "Add turns to a chat and watch old messages fall out of the window.",
  html: () =>
    widgetDoc(
      `<div class="w-title">A fixed token budget (this toy model: 40 tokens)</div>
       <div class="w-sub">every message costs tokens. When you blow the budget, the oldest messages are dropped — the model literally forgets them.</div>
       <div class="w-row"><button class="w-btn" id="add">Add a turn</button><button class="w-btn alt" id="reset">Reset</button><span class="w-chip" id="usage"></span></div>
       <div style="margin-top:10px;height:18px;border-radius:9px;background:var(--card);overflow:hidden;border:1px solid var(--border)"><div id="meter" style="height:100%;background:linear-gradient(90deg,#22c55e,#fbbf24);transition:width .25s"></div></div>
       <div id="msgs" style="margin-top:12px"></div>
       <div class="w-note">This is why long chats "lose the plot" and why the system prompt is usually pinned first — so it's the last thing evicted.</div>`,
      `
var LIMIT=40;
var pool=[["system: be concise",6],["you: hi",3],["ai: hello! how can I help?",8],["you: explain RAG",5],["ai: RAG retrieves chunks then generates...",10],["you: and embeddings?",5],["ai: embeddings map meaning to vectors...",9],["you: thanks",3]];
var idx=0,msgs=[];
function draw(){
  var total=msgs.reduce(function(s,m){return s+m[1];},0);
  // evict oldest until under limit, but keep system (index 0 of pool, label starts 'system')
  while(total>LIMIT&&msgs.length>1){
    var rm=-1;for(var i=0;i<msgs.length;i++){if(msgs[i][0].indexOf("system")!==0){rm=i;break;}}
    if(rm<0)break;msgs.splice(rm,1);total=msgs.reduce(function(s,m){return s+m[1];},0);
  }
  document.getElementById("meter").style.width=Math.min(100,total/LIMIT*100)+"%";
  document.getElementById("usage").textContent=total+" / "+LIMIT+" tokens";
  var html="";
  msgs.forEach(function(m){var sys=m[0].indexOf("system")===0;
    html+="<div style='font-family:var(--mono);font-size:11.5px;color:"+(sys?"#D4AF37":"var(--text-2)")+";padding:3px 0'>"+(sys?"📌 ":"")+m[0]+" <span style='color:var(--dim)'>("+m[1]+")</span></div>";});
  document.getElementById("msgs").innerHTML=html||"<span class='w-sub'>empty — add a turn</span>";
}
document.getElementById("add").onclick=function(){if(idx<pool.length){msgs.push(pool[idx++]);draw();}};
document.getElementById("reset").onclick=function(){idx=0;msgs=[];draw();};
draw();
`,
      {
        question: "A chat grows longer than the context window. What happens to the earliest messages?",
        options: ["The model summarises them automatically", "They're dropped — the model can't see them anymore", "They're saved to disk and reloaded later"],
        answer: 1,
        reveal: "The window is a fixed token budget. Once it's full, the oldest messages fall out and the model literally can't see them — that's why long chats 'lose the plot' and why the system prompt is pinned first.",
      },
    ),
  bridge: "Count the tokens in a long conversation and compare to the model's context limit — anything past the limit is invisible to the model on the next turn.",
};

export const aiWidgets: ConceptWidgetDef[] = [
  tokenizer,
  temperatureSampling,
  embeddingSpace,
  ragFlow,
  contextWindow,
];
