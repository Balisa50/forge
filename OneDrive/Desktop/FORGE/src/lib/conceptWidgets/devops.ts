import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** Container vs VM: toggle to compare the stack layers. */
const containerVsVm: ConceptWidgetDef = {
  id: "container-vs-vm",
  title: "Container vs virtual machine",
  blurb: "Toggle between the two stacks to see what each one duplicates.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Why containers are lighter than VMs</div>
       <div class="w-sub">toggle and watch what gets duplicated. VMs ship a whole OS each; containers share the host kernel.</div>
       <div class="w-row" id="btns"></div>
       <div id="stack"></div>
       <div class="w-note" id="lab"></div>`,
      `
function layer(t,c,h){return "<div style='background:"+c+";border-radius:6px;padding:7px 10px;margin:4px 0;font-family:var(--mono);font-size:11.5px;color:#15110d;font-weight:600;height:"+(h||"auto")+"'>"+t+"</div>";}
var modes={
  vm:{html:layer("App A",'#fb7185')+layer("Bins/Libs",'#fbbf24')+layer("Guest OS (full)",'#f0c75c',"")+"<div style='display:flex;gap:6px'>"+"</div>"+layer("Hypervisor",'#c084fc')+layer("Host OS",'#60a5fa')+layer("Hardware",'#8a7c63'),why:"Each VM carries its <b>own full guest OS</b> — gigabytes, slow to boot. Strong isolation, heavy price."},
  ctr:{html:"<div style='display:flex;gap:6px'><div style='flex:1'>"+layer("App A",'#fb7185')+layer("Bins/Libs",'#fbbf24')+"</div><div style='flex:1'>"+layer("App B",'#fb7185')+layer("Bins/Libs",'#fbbf24')+"</div></div>"+layer("Container runtime (Docker)",'#22c55e')+layer("Host OS — shared kernel",'#60a5fa')+layer("Hardware",'#8a7c63'),why:"Containers <b>share the host kernel</b> — no guest OS. Megabytes, boot in milliseconds. That's why you can run dozens where you'd run a few VMs."}
};
var cur="ctr";
function draw(){document.getElementById("stack").innerHTML=modes[cur].html;document.getElementById("lab").innerHTML=modes[cur].why;}
var bw=document.getElementById("btns");
[["ctr","Container"],["vm","Virtual Machine"]].forEach(function(m){var b=document.createElement("button");b.className="w-btn"+(m[0]===cur?"":" alt");b.textContent=m[1];
  b.onclick=function(){cur=m[0];[].forEach.call(bw.children,function(c,i){c.className="w-btn"+(([ "ctr","vm"][i])===cur?"":" alt");});draw();};bw.appendChild(b);});
draw();
`,
      {
        question: "Run 10 apps as containers vs 10 as VMs. What's the big difference in what gets duplicated?",
        options: ["Containers each ship a full OS; VMs share one", "VMs each ship a full OS; containers share the host kernel", "They duplicate exactly the same thing"],
        answer: 1,
        reveal: "Each VM carries its <b>own full guest OS</b> — gigabytes, slow to boot. Containers <b>share the host kernel</b>, so they're megabytes and boot in milliseconds. That's why you can pack far more on one box.",
      },
    ),
  bridge: "Run `docker run` on an image and time how fast it starts, then compare to booting a VM of the same app — the container is up in under a second.",
};

/** Load balancer: send requests, see them spread across backends. */
const loadBalancer: ConceptWidgetDef = {
  id: "load-balancer",
  title: "How a load balancer spreads traffic",
  blurb: "Fire requests and watch round-robin fan them across backends — then kill one.",
  html: () =>
    widgetDoc(
      `<div class="w-title">One address, many servers behind it</div>
       <div class="w-sub">send requests — the balancer round-robins them. Click a server to take it offline and watch traffic reroute.</div>
       <div class="w-row"><button class="w-btn" id="send">Send request</button><button class="w-btn" id="burst">Send 10</button><button class="w-btn alt" id="reset">Reset</button></div>
       <div id="servers" style="display:flex;gap:10px;margin-top:12px"></div>
       <div class="w-note">Round-robin = next request goes to the next healthy server in turn. Take one down and the balancer's health check skips it — users never notice. That's horizontal scaling.</div>`,
      `
var servers=[{n:"web-1",c:0,up:true},{n:"web-2",c:0,up:true},{n:"web-3",c:0,up:true}];
var rr=0;
function send(){
  var tries=0;
  while(tries<servers.length){var s=servers[rr%servers.length];rr++;tries++;if(s.up){s.c++;break;}}
  draw();
}
function draw(){
  var mx=Math.max(1,Math.max.apply(null,servers.map(function(s){return s.c;})));
  document.getElementById("servers").innerHTML=servers.map(function(s,i){
    var h=20+s.c/mx*70;
    return "<div data-i='"+i+"' style='flex:1;text-align:center;cursor:pointer'><div style='height:90px;display:flex;align-items:flex-end'><div style='width:100%;height:"+h+"px;border-radius:6px 6px 0 0;background:"+(s.up?"linear-gradient(180deg,#22c55e,#16a34a)":"#3a2f20")+";transition:height .2s'></div></div><div style='font-family:var(--mono);font-size:11px;color:"+(s.up?"var(--text)":"var(--red)")+";margin-top:4px'>"+s.n+"</div><div style='font-family:var(--mono);font-size:10px;color:var(--dim)'>"+(s.up?s.c+" reqs":"OFFLINE")+"</div></div>";
  }).join("");
}
document.getElementById("servers").addEventListener("click",function(e){
  var el=e.target.closest("[data-i]");if(!el)return;var i=+el.getAttribute("data-i");servers[i].up=!servers[i].up;draw();
});
document.getElementById("send").onclick=send;
document.getElementById("burst").onclick=function(){for(var i=0;i<10;i++)send();};
document.getElementById("reset").onclick=function(){servers.forEach(function(s){s.c=0;s.up=true;});rr=0;draw();};
draw();
`,
      {
        question: "A load balancer round-robins traffic, then one backend goes down. What happens to new requests?",
        options: ["They fail until the server is back", "The health check skips it and routes to the healthy ones", "They all pile onto one server"],
        answer: 1,
        reveal: "The balancer's <b>health check</b> takes the dead backend out of rotation, so new requests only hit healthy servers. Users never notice — that's the point of horizontal scaling.",
      },
    ),
  bridge: "Put two app instances behind nginx or a cloud LB, kill one, and curl the endpoint repeatedly — every response still succeeds, served by the survivor.",
};

/** CI/CD pipeline stepper. */
const cicdPipeline: ConceptWidgetDef = {
  id: "cicd-pipeline",
  title: "A CI/CD pipeline, stage by stage",
  blurb: "Run the pipeline and watch a failing test halt the deploy.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Commit → build → test → deploy</div>
       <div class="w-sub">run it. A green stage passes control on; a red stage stops everything — broken code never reaches production.</div>
       <div class="w-row"><button class="w-btn" id="run">Run pipeline</button><button class="w-btn alt" id="break">Inject failing test</button></div>
       <div id="stages" style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap"></div>
       <div class="w-note" id="lab"></div>`,
      `
var stages=["Checkout","Build","Lint","Test","Deploy"];
var willFail=false;
function draw(states){
  document.getElementById("stages").innerHTML=stages.map(function(s,i){
    var st=states[i]||"idle";
    var col=st==="pass"?"#22c55e":st==="fail"?"#fb7185":st==="run"?"#fbbf24":"#3a2f20";
    var arrow=i<stages.length-1?"<span style='align-self:center;color:var(--dim)'>›</span>":"";
    return "<div style='flex:1;min-width:62px;text-align:center;border:1px solid "+col+";border-radius:7px;padding:8px 4px;background:"+col+"22'><div style='font-family:var(--mono);font-size:10.5px;color:"+col+"'>"+s+"</div><div style='font-size:13px'>"+(st==="pass"?"✓":st==="fail"?"✕":st==="run"?"…":"·")+"</div></div>"+arrow;
  }).join("");
}
function run(){
  var states=[],i=0;
  document.getElementById("lab").innerHTML="";
  draw([]);
  var t=setInterval(function(){
    if(i>=stages.length){clearInterval(t);document.getElementById("lab").innerHTML="<b style='color:#22c55e'>Deployed.</b> Every gate passed, so the new version is live.";return;}
    if(willFail&&stages[i]==="Test"){states[i]="fail";draw(states);clearInterval(t);
      document.getElementById("lab").innerHTML="<b style='color:#fb7185'>Pipeline halted at Test.</b> Deploy never runs. This is the point of CI — the broken commit is caught before users ever see it.";return;}
    states[i]="pass";draw(states);i++;
  },420);
}
document.getElementById("run").onclick=function(){willFail=false;run();};
document.getElementById("break").onclick=function(){willFail=true;run();};
draw([]);
`,
      {
        question: "A unit test fails in stage 3 of a 5-stage pipeline. What happens to the deploy stage?",
        options: ["It runs anyway with a warning", "It never runs — the pipeline halts at the failure", "It runs, then rolls back later"],
        answer: 1,
        reveal: "A failing stage <b>halts the pipeline</b> — deploy never executes. That's the entire point of CI: the broken commit is caught before it can reach users.",
      },
    ),
  bridge: "Add a deliberately failing test to a repo with CI and push — watch the pipeline go red and block the merge/deploy in the Actions/CI tab.",
};

/** Autoscaling under load. */
const autoscaling: ConceptWidgetDef = {
  id: "autoscaling",
  title: "Autoscaling under load",
  blurb: "Crank the traffic and watch instances spin up to hold latency steady.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Instances follow demand</div>
       <div class="w-sub">slide traffic up. When average CPU crosses the threshold, the scaler adds instances; when it drops, it removes them.</div>
       <div class="w-row"><span class="w-label">traffic (req/s)</span><input id="t" type="range" min="0" max="100" value="20"><span class="w-val" id="tv">20</span></div>
       <div id="inst" style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0;min-height:40px"></div>
       <div class="w-row" style="gap:16px"><span class="w-chip" id="cpu"></span><span class="w-chip" id="cnt"></span></div>
       <div class="w-note">Each instance handles ~15 req/s comfortably. The scaler aims to keep CPU near 60% — too few instances and latency spikes, too many and you burn money.</div>`,
      `
function draw(){
  var t=+document.getElementById("t").value;document.getElementById("tv").textContent=t;
  var perInstance=15,target=0.6;
  var needed=Math.max(1,Math.ceil(t/(perInstance*target)));
  var cpu=Math.min(100,Math.round(t/(needed*perInstance)*100));
  document.getElementById("inst").innerHTML="";
  for(var i=0;i<needed;i++){
    var d=document.createElement("div");
    d.style.cssText="width:34px;height:34px;border-radius:7px;background:linear-gradient(180deg,#22c55e,#16a34a);display:grid;place-items:center;color:#15110d;font-family:monospace;font-size:10px;font-weight:700";
    d.textContent="i"+(i+1);document.getElementById("inst").appendChild(d);
  }
  document.getElementById("cpu").textContent="avg CPU "+cpu+"%";
  document.getElementById("cpu").style.color=cpu>80?"#fb7185":"#22c55e";
  document.getElementById("cnt").textContent=needed+" instance"+(needed>1?"s":"");
}
document.getElementById("t").addEventListener("input",draw);
draw();
`,
      {
        question: "Traffic doubles past what your instances can handle. What does an autoscaler do?",
        options: ["Drops the extra requests", "Adds instances until CPU drops back to target", "Slows every request equally"],
        answer: 1,
        reveal: "When average CPU crosses the threshold the scaler <b>adds instances</b> to share the load and pull CPU back toward target; when traffic falls it removes them so you stop paying.",
      },
    ),
  bridge: "Set a CPU-based scaling policy on a cloud instance group, run a load test (k6 or hey), and watch the instance count climb then shrink as load rises and falls.",
};

/** DNS resolution walk. */
const dnsResolution: ConceptWidgetDef = {
  id: "dns-resolution",
  title: "How a domain becomes an IP",
  blurb: "Step a lookup through resolver → root → TLD → authoritative.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Resolving forge.app</div>
       <div class="w-sub">your browser doesn't know the IP. Step through who it asks, in order.</div>
       <div class="w-row"><button class="w-btn" id="step">Next step</button><button class="w-btn alt" id="reset">Reset</button></div>
       <div id="steps" style="margin-top:10px"></div>`,
      `
var steps=[
  ["Browser → Resolver","Do you know forge.app?","#60a5fa","Your ISP's resolver is the middleman that does the legwork and caches answers."],
  ["Resolver → Root server","Who handles .app domains?","#c084fc","13 root server clusters worldwide. They don't know forge.app, only who runs each TLD."],
  ["Root → Resolver","Ask the .app TLD server →","#c084fc","The root points down one level."],
  ["Resolver → .app TLD","Who is authoritative for forge.app?","#fbbf24","The TLD server knows which nameserver owns this exact domain."],
  ["TLD → Resolver","It's ns1.forge.app →","#fbbf24","Down one more level."],
  ["Resolver → Authoritative NS","What's the IP for forge.app?","#22c55e","The authoritative server is the source of truth for this domain's records."],
  ["Authoritative → Resolver","A record: 203.0.113.7","#22c55e","Got it. The resolver caches this (TTL) so the next lookup is instant."],
  ["Resolver → Browser","203.0.113.7 — connect!","#D4AF37","Now the browser opens a TCP connection to that IP. Everything above happened in ~milliseconds."]
];
var i=0;
function draw(){
  var h="";
  for(var j=0;j<i;j++){var s=steps[j];
    h+="<div style='border-left:3px solid "+s[2]+";padding:7px 12px;margin:5px 0;background:rgba(255,255,255,.02);border-radius:0 7px 7px 0'><div style='font-family:var(--mono);font-size:11.5px;color:"+s[2]+"'>"+s[0]+"</div><div style='font-size:12.5px;color:var(--text)'>"+s[1]+"</div><div style='font-size:11px;color:var(--dim);margin-top:3px'>"+s[3]+"</div></div>";
  }
  document.getElementById("steps").innerHTML=h||"<span class='w-sub'>click Next step</span>";
  document.getElementById("step").disabled=i>=steps.length;
}
document.getElementById("step").onclick=function(){if(i<steps.length)i++;draw();};
document.getElementById("reset").onclick=function(){i=0;draw();};
draw();
`,
      {
        question: "Your browser needs the IP for forge.app and nothing is cached. Who does the resolver ask FIRST?",
        options: ["The authoritative nameserver directly", "A root server, to find who runs .app", "The website's own server"],
        answer: 1,
        reveal: "With an empty cache the resolver starts at a <b>root server</b> to learn who runs the .app TLD, then asks the TLD server, then the authoritative nameserver — top down, one level at a time.",
      },
    ),
  bridge: "Run `dig +trace forge.app` (or any domain) and read the output — you'll see the exact root → TLD → authoritative walk this sim steps through.",
};

export const devopsWidgets: ConceptWidgetDef[] = [
  containerVsVm,
  loadBalancer,
  cicdPipeline,
  autoscaling,
  dnsResolution,
];
