import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** SQL injection: type input, watch it mutate the query (safe demo). */
const sqlInjection: ConceptWidgetDef = {
  id: "sql-injection",
  title: "How SQL injection works",
  blurb: "Type into a login field and watch unsanitised input rewrite the query.",
  html: () =>
    widgetDoc(
      `<div class="w-title">String-built queries are a trap</div>
       <div class="w-sub">type a username. When the app glues your text straight into SQL, you can change what the query <i>means</i>. (Safe sandbox — nothing runs.)</div>
       <div class="w-row"><span class="w-label">username</span><input id="u" type="text" value="awa" style="flex:1;font-family:var(--mono);font-size:12px;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:7px;color:var(--text)"></div>
       <div class="w-row"><button class="w-btn alt" id="attack">Insert attack payload</button></div>
       <div class="w-sub" style="margin-top:6px">resulting query:</div>
       <pre id="q" class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;font-size:11.5px;white-space:pre-wrap"></pre>
       <div class="w-note" id="lab"></div>`,
      `
function draw(){
  var u=document.getElementById("u").value;
  var q="SELECT * FROM users\\nWHERE name = '"+u+"' AND active = 1;";
  // crude injection detection for the demo
  var injected=/'|--|or +1=1|;/i.test(u);
  var el=document.getElementById("q");
  el.innerHTML=q.replace(/('"+u.replace(/[.*+?^\${}()|[\\]\\\\]/g,"\\\\$&")+"')/, function(m){return m;});
  // highlight the user portion
  el.innerHTML="SELECT * FROM users\\nWHERE name = <span style='color:"+(injected?"#fb7185":"#22c55e")+";background:"+(injected?"rgba(239,68,68,.15)":"rgba(34,197,94,.12)")+"'>'"+u.replace(/</g,"&lt;")+"'</span> AND active = 1;";
  document.getElementById("lab").innerHTML=injected?"<b style='color:#fb7185'>Injected.</b> The quote closes the string early and <code>OR 1=1</code> / <code>--</code> changes the logic — now it can match every row or comment out the password check. <b>Fix:</b> parameterised queries (<code>WHERE name = ?</code>) keep input as <i>data</i>, never code.":"Looks like plain data. Now click the attack button to see it break.";
}
document.getElementById("u").addEventListener("input",draw);
document.getElementById("attack").onclick=function(){document.getElementById("u").value="' OR 1=1 --";draw();};
draw();
`,
      {
        question: "An app glues the username straight into its SQL string. A user types: ' OR 1=1 --  . What happens?",
        options: ["The login is rejected as invalid", "The quote closes the string early and the logic is rewritten to match everyone", "Nothing — it's treated as plain text"],
        answer: 1,
        reveal: "The lone quote ends the string early and <code>OR 1=1 --</code> rewrites the logic, matching every row and commenting out the rest. <b>Fix:</b> parameterised queries keep input as <i>data</i>, never code.",
      },
    ),
  bridge: "In your language of choice, run the same payload against a parameterised query (WHERE name = ?) and a string-concatenated one — only the concatenated version breaks.",
};

/** XSS sandbox: safe demo of escaped vs unescaped rendering. */
const xssSandbox: ConceptWidgetDef = {
  id: "xss-sandbox",
  title: "XSS: why you escape output",
  blurb: "Toggle escaping and see why raw HTML insertion is dangerous.",
  html: () =>
    widgetDoc(
      `<div class="w-title">The same comment, rendered two ways</div>
       <div class="w-sub">a user submitted a comment containing HTML. Toggle how the app renders it. (Demo is inert — no script executes.)</div>
       <div class="w-sub" style="margin-top:6px">user input:</div>
       <pre class="mono" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:9px;font-size:11.5px;color:#fbbf24;white-space:pre-wrap">Nice post! &lt;img src=x onerror="steal(cookies)"&gt;</pre>
       <div class="w-row" id="btns"></div>
       <div class="w-sub">rendered comment:</div>
       <div id="render" style="background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;min-height:40px;font-size:13px"></div>
       <div class="w-note" id="lab"></div>`,
      `
var raw="Nice post! <img src=x onerror=\\"steal(cookies)\\">";
var safe="Nice post! &lt;img src=x onerror=&quot;steal(cookies)&quot;&gt;";
var escaped=true;
function draw(){
  document.getElementById("render").innerHTML=escaped?safe:"Nice post! <span style='display:inline-block;border:1px dashed #fb7185;color:#fb7185;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:11px'>&lt;img onerror&gt; — would FIRE here</span>";
  document.getElementById("lab").innerHTML=escaped?"<b style='color:#22c55e'>Escaped.</b> The browser shows the angle brackets as <i>text</i>. The img tag is harmless characters, not an element.":"<b style='color:#fb7185'>Unescaped.</b> The browser parses the input as real HTML, so the malicious <code>onerror</code> would execute in every visitor's session. <b>Fix:</b> escape on output (frameworks like React do this by default).";
}
var bw=document.getElementById("btns");
[["esc","Escape output (safe)",true],["raw","Insert as raw HTML",false]].forEach(function(m){var b=document.createElement("button");b.className="w-btn"+(m[2]===escaped?"":" alt");b.textContent=m[1];
  b.onclick=function(){escaped=m[2];[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(([true,false][i])===escaped?"":" alt");});draw();};bw.appendChild(b);});
draw();
`,
      {
        question: "A comment contains <img src=x onerror=...>. The app inserts it as raw HTML. What runs?",
        options: ["Nothing — browsers ignore broken images", "The onerror script fires in every visitor's session", "Only the image tries to load"],
        answer: 1,
        reveal: "Inserted as raw HTML, the browser parses it as a real element and the <code>onerror</code> handler <b>executes</b> for every visitor. <b>Fix:</b> escape on output — frameworks like React do it by default.",
      },
    ),
  bridge: "In a scratch HTML file, set an element's innerHTML to text containing a tag, then set textContent to the same string — only innerHTML parses it as live markup.",
};

/** Hashing vs encryption. */
const hashingVsEncryption: ConceptWidgetDef = {
  id: "hashing-vs-encryption",
  title: "Hashing vs encryption",
  blurb: "Type a secret and see why one is reversible and one isn't.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Two one-way... or are they?</div>
       <div class="w-sub">type a password. Encryption can be undone with a key; a hash cannot — that's why passwords are hashed, never encrypted.</div>
       <div class="w-row"><span class="w-label">input</span><input id="in" type="text" value="hunter2" style="flex:1;font-family:var(--mono);font-size:12px;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:7px;color:var(--text)"></div>
       <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
         <div style="flex:1;min-width:180px;background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px">
           <div class="w-sub" style="color:#60a5fa">ENCRYPTED (reversible)</div>
           <div class="mono" id="enc" style="font-size:11px;color:var(--text-2);word-break:break-all"></div>
           <div class="w-sub" style="margin-top:6px;color:#22c55e">decrypt with key → <span id="dec" style="color:var(--text)"></span></div>
         </div>
         <div style="flex:1;min-width:180px;background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px">
           <div class="w-sub" style="color:#fb7185">HASHED (one-way)</div>
           <div class="mono" id="hash" style="font-size:11px;color:var(--text-2);word-break:break-all"></div>
           <div class="w-sub" style="margin-top:6px">decrypt → <span style="color:#fb7185">impossible</span></div>
         </div>
       </div>
       <div class="w-note">Same input → same hash every time (that's how login checks work: hash what they typed, compare). But you can't run a hash backwards, so a stolen hash database doesn't hand over the passwords.</div>`,
      `
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,"0")+(s.length*2654435761>>>0).toString(16).padStart(8,"0");}
function enc(s){return s.split("").map(function(c){return ((c.charCodeAt(0)+7)%256).toString(16).padStart(2,"0");}).join("");}
function draw(){
  var s=document.getElementById("in").value;
  document.getElementById("enc").textContent=enc(s)||"—";
  document.getElementById("dec").textContent=s||"—";
  document.getElementById("hash").textContent=s?hash(s):"—";
}
document.getElementById("in").addEventListener("input",draw);
draw();
`,
      {
        question: "A site stores your password. If their database is stolen, which method keeps it unrecoverable?",
        options: ["Encryption", "Hashing", "Both equally"],
        answer: 1,
        reveal: "<b>Hashing</b> is one-way — there's no key to run it backwards, so a stolen hash database doesn't hand over passwords. Encryption is reversible with the key, which is exactly why passwords are hashed, not encrypted.",
      },
    ),
  bridge: "Hash the same string twice with bcrypt or argon2 in a notebook — note that verifying a login means hashing the input and comparing, never decrypting the stored value.",
};

/** TLS handshake stepper. */
const tlsHandshake: ConceptWidgetDef = {
  id: "tls-handshake",
  title: "The TLS handshake",
  blurb: "Step through how two strangers agree on a secret over an open wire.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Establishing https://</div>
       <div class="w-sub">before any data flows, client and server negotiate trust and a shared key — in the open, yet eavesdroppers learn nothing useful.</div>
       <div class="w-row"><button class="w-btn" id="step">Next</button><button class="w-btn alt" id="reset">Reset</button></div>
       <div id="steps" style="margin-top:10px"></div>`,
      `
var steps=[
  ["Client → Server","ClientHello: here are the ciphers I support","#60a5fa"],
  ["Server → Client","ServerHello + certificate (signed by a CA)","#22c55e"],
  ["Client","Verifies the cert chains to a trusted CA → server is who it claims","#fbbf24"],
  ["Client → Server","Key exchange (e.g. ECDHE) — derive a shared secret no eavesdropper can compute","#c084fc"],
  ["Both","Switch to symmetric encryption with the shared key","#D4AF37"],
  ["Secure","Application data flows, encrypted. The padlock appears.","#22c55e"]
];
var i=0;
function draw(){
  var h="";for(var j=0;j<i;j++){var s=steps[j];
    h+="<div style='border-left:3px solid "+s[2]+";padding:7px 12px;margin:5px 0;background:rgba(255,255,255,.02);border-radius:0 7px 7px 0'><div style='font-family:var(--mono);font-size:11px;color:"+s[2]+"'>"+s[0]+"</div><div style='font-size:12.5px;color:var(--text)'>"+s[1]+"</div></div>";}
  document.getElementById("steps").innerHTML=h||"<span class='w-sub'>click Next</span>";
  document.getElementById("step").disabled=i>=steps.length;
}
document.getElementById("step").onclick=function(){if(i<steps.length)i++;draw();};
document.getElementById("reset").onclick=function(){i=0;draw();};
draw();
`,
      {
        question: "Client and server agree on a shared key over a wire an eavesdropper can read. How does the watcher NOT learn the key?",
        options: ["The whole handshake is encrypted from the very start", "A key exchange (e.g. ECDHE) lets both sides derive a secret the watcher can't compute", "The server hides its IP address"],
        answer: 1,
        reveal: "A <b>key exchange</b> like ECDHE lets the two sides derive a shared secret from public messages — an eavesdropper sees the exchange but can't compute the result. The certificate proves the server is who it claims.",
      },
    ),
  bridge: "Run `openssl s_client -connect example.com:443` and read the handshake — you'll see the cipher chosen, the certificate chain, and the negotiated key parameters.",
};

/** CIA triad risk explorer. */
const ciaTriad: ConceptWidgetDef = {
  id: "cia-triad",
  title: "The CIA triad in practice",
  blurb: "Pick a breach and see which security pillar it actually violates.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Confidentiality · Integrity · Availability</div>
       <div class="w-sub">every security control protects one of these three. Click a scenario — which pillar broke?</div>
       <div id="scen"></div>
       <div style="display:flex;gap:8px;margin-top:12px">
         <div id="C" class="pill" style="flex:1;text-align:center;padding:10px;border-radius:8px;border:1px solid var(--border);transition:all .2s"><div style="font-weight:700">Confidentiality</div><div class="w-sub">secrets stay secret</div></div>
         <div id="I" class="pill" style="flex:1;text-align:center;padding:10px;border-radius:8px;border:1px solid var(--border);transition:all .2s"><div style="font-weight:700">Integrity</div><div class="w-sub">data isn't tampered</div></div>
         <div id="A" class="pill" style="flex:1;text-align:center;padding:10px;border-radius:8px;border:1px solid var(--border);transition:all .2s"><div style="font-weight:700">Availability</div><div class="w-sub">service stays up</div></div>
       </div>
       <div class="w-note" id="lab">Pick a scenario above.</div>`,
      `
var scen=[
  {t:"A laptop with the customer database is stolen and the data is leaked online",p:"C",why:"Secrets were exposed → <b>Confidentiality</b>. Mitigation: full-disk encryption."},
  {t:"An attacker silently edits prices in your store's database",p:"I",why:"Data was tampered with → <b>Integrity</b>. Mitigation: audit logs, checksums, access control."},
  {t:"A DDoS flood knocks your site offline for an hour",p:"A",why:"Legit users can't reach the service → <b>Availability</b>. Mitigation: rate limiting, CDN, autoscaling."},
  {t:"A bug lets anyone read other users' private messages",p:"C",why:"Unauthorised disclosure → <b>Confidentiality</b>. Mitigation: authorization checks on every read."}
];
var cur=0;
function pillReset(){["C","I","A"].forEach(function(k){var e=document.getElementById(k);e.style.borderColor="var(--border)";e.style.background="transparent";});}
function draw(){
  document.getElementById("scen").innerHTML=scen.map(function(s,i){
    return "<div data-i='"+i+"' style='cursor:pointer;padding:8px 10px;margin:4px 0;border-radius:7px;border:1px solid "+(i===cur?"var(--accent)":"var(--border)")+";background:"+(i===cur?"rgba(212,175,55,.1)":"var(--card)")+";font-size:12.5px;color:var(--text)'>"+s.t+"</div>";
  }).join("");
  pillReset();
  var p=scen[cur].p,col=p==="C"?"#60a5fa":p==="I"?"#fbbf24":"#fb7185";
  var e=document.getElementById(p);e.style.borderColor=col;e.style.background=col+"22";
  document.getElementById("lab").innerHTML=scen[cur].why;
}
document.getElementById("scen").addEventListener("click",function(e){var el=e.target.closest("[data-i]");if(!el)return;cur=+el.getAttribute("data-i");draw();});
draw();
`,
      {
        question: "A DDoS flood knocks your site offline for an hour. Which pillar of the CIA triad broke?",
        options: ["Confidentiality", "Integrity", "Availability"],
        answer: 2,
        reveal: "Legit users can't reach the service → <b>Availability</b>. Confidentiality is about secrets staying secret; Integrity is about data not being tampered with. Each control defends one pillar.",
      },
    ),
  bridge: "Take three recent breach headlines and sort each into C, I, or A — most map cleanly to one pillar, which tells you which control failed.",
};

export const securityWidgets: ConceptWidgetDef[] = [
  sqlInjection,
  xssSandbox,
  hashingVsEncryption,
  tlsHandshake,
  ciaTriad,
];
