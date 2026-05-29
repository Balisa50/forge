import { widgetDoc, type ConceptWidgetDef } from "./scaffold";

/** RN flexbox: defaults differ from web (column, flex:1). */
const rnFlexbox: ConceptWidgetDef = {
  id: "rn-flexbox",
  title: "React Native layout (flex by default)",
  blurb: "See why RN stacks vertically by default and what flex:1 really does.",
  html: () =>
    widgetDoc(
      `<div class="w-title">RN's flexbox isn't quite the web's</div>
       <div class="w-sub">on the web default is row; in React Native default is <b>column</b>. flex:1 means "take all the leftover space".</div>
       <div class="w-row"><span class="w-label">flexDirection</span><select id="dir" class="w-btn alt"><option value="column">column (RN default)</option><option value="row">row</option></select></div>
       <div class="w-row"><span class="w-label">box 2 flex</span><input id="f" type="range" min="0" max="3" step="1" value="0"><span class="w-val" id="fv">0</span></div>
       <div id="phone" style="margin:10px auto;width:150px;height:200px;border:3px solid var(--border);border-radius:18px;padding:8px;display:flex;gap:6px;background:rgba(0,0,0,.25)"></div>
       <div class="w-note" id="lab"></div>`,
      `
var phone=document.getElementById("phone");
var cols=["#60a5fa","#22c55e","#fb7185"];
function draw(){
  var dir=document.getElementById("dir").value,f=+document.getElementById("f").value;
  document.getElementById("fv").textContent=f;
  phone.style.flexDirection=dir;
  phone.innerHTML=cols.map(function(c,i){
    var flex=i===1?f:0;
    return "<div style='background:"+c+";border-radius:6px;flex:"+flex+";"+(flex?"":(dir==="column"?"height:34px":"width:34px"))+";min-height:20px;min-width:20px;display:grid;place-items:center;color:#15110d;font-weight:700;font-family:monospace'>"+(i+1)+"</div>";
  }).join("");
  document.getElementById("lab").innerHTML=f>0?"Box 2 has <b>flex:"+f+"</b> so it grabs the free space; boxes 1 &amp; 3 stay their content size. Higher flex = bigger share.":"With <b>flex:0</b> every box is just its content size. Turn box 2's flex up to make it fill the gap.";
}
["dir","f"].forEach(function(id){document.getElementById(id).addEventListener("change",draw);document.getElementById(id).addEventListener("input",draw);});
draw();
`
    ),
};

/** Component lifecycle: mount → update → unmount with effect timing. */
const componentLifecycle: ConceptWidgetDef = {
  id: "component-lifecycle",
  title: "Mount, update, unmount",
  blurb: "Drive a component through its lifecycle and see when effects fire.",
  html: () =>
    widgetDoc(
      `<div class="w-title">When does useEffect actually run?</div>
       <div class="w-sub">drive the component and watch the log — effects run after paint; cleanup runs before the next effect and on unmount</div>
       <div class="w-row"><button class="w-btn" id="mount">Mount</button><button class="w-btn alt" id="update">Update prop</button><button class="w-btn alt" id="unmount">Unmount</button></div>
       <div id="log" style="margin-top:10px;background:var(--card);border:1px solid var(--border);border-radius:7px;padding:10px;min-height:80px;font-family:var(--mono);font-size:11.5px"></div>`,
      `
var mounted=false,lines=[];
function log(t,c){lines.push("<div style='color:"+c+"'>"+t+"</div>");if(lines.length>8)lines.shift();document.getElementById("log").innerHTML=lines.join("");}
document.getElementById("mount").onclick=function(){if(mounted){log("already mounted","#8a7c63");return;}mounted=true;log("→ render()","#60a5fa");log("→ useEffect(()=>{...}, []) runs once","#22c55e");};
document.getElementById("update").onclick=function(){if(!mounted){log("mount it first","#8a7c63");return;}log("→ re-render() (prop changed)","#60a5fa");log("→ cleanup of previous effect","#fbbf24");log("→ useEffect runs again (dep changed)","#22c55e");};
document.getElementById("unmount").onclick=function(){if(!mounted){log("nothing mounted","#8a7c63");return;}mounted=false;log("→ cleanup runs (cancel timers, unsubscribe)","#fb7185");log("→ component removed","#8a7c63");};
log("idle — click Mount","#8a7c63");
`
    ),
};

/** Navigation stack: push/pop screens. */
const navStack: ConceptWidgetDef = {
  id: "nav-stack",
  title: "The navigation stack",
  blurb: "Push and pop screens to feel how back-navigation is just a stack.",
  html: () =>
    widgetDoc(
      `<div class="w-title">Screens are a stack of cards</div>
       <div class="w-sub">push adds a screen on top; back/pop removes the top one. The visible screen is always the top of the stack.</div>
       <div class="w-row"><button class="w-btn" id="push">push(Details)</button><button class="w-btn" id="push2">push(Profile)</button><button class="w-btn alt" id="pop">&larr; back / pop</button></div>
       <div id="stack" style="margin-top:12px;position:relative;height:150px"></div>
       <div class="w-note" id="lab"></div>`,
      `
var stack=["Home"];
function draw(){
  var el=document.getElementById("stack"),h="";
  stack.forEach(function(s,i){
    var off=i*10,top=i===stack.length-1;
    h+="<div style='position:absolute;left:"+off+"px;top:"+off+"px;width:calc(100% - 60px);height:90px;border-radius:10px;border:1px solid "+(top?"var(--accent)":"var(--border)")+";background:"+(top?"rgba(212,175,55,.12)":"var(--card)")+";display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:13px;color:"+(top?"var(--accent)":"var(--dim)")+";box-shadow:0 4px 12px rgba(0,0,0,.3)'>"+s+(top?" (visible)":"")+"</div>";
  });
  el.innerHTML=h;
  document.getElementById("lab").innerHTML="Stack: <b>["+stack.join(", ")+"]</b>. The hardware/header back button just pops the top — that's why it feels automatic.";
  document.getElementById("pop").disabled=stack.length<=1;
}
document.getElementById("push").onclick=function(){stack.push("Details");draw();};
document.getElementById("push2").onclick=function(){stack.push("Profile");draw();};
document.getElementById("pop").onclick=function(){if(stack.length>1)stack.pop();draw();};
draw();
`
    ),
};

export const mobileWidgets: ConceptWidgetDef[] = [rnFlexbox, componentLifecycle, navStack];
