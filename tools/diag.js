const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;const res={};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
function css(c){return "(()=>{const add=()=>{const s=document.createElement('style');s.textContent="+JSON.stringify(c)+";(document.head||document.documentElement).appendChild(s)};if(document.documentElement)add();else document.addEventListener('DOMContentLoaded',add)})();"}
const W=s=>css(s+"{white-space:normal!important}");
const V={base:"",all:css("*{text-wrap:wrap!important}"),allws:W("*"),chip:W(".chip"),pick:W(".pick span,.pick small"),tog:W(".tog button"),seg:W(".seg button"),nav:W(".nav a,.nav button"),tb:W(".tb span"),stx:W(".stx b,.stx small"),
 nohdr:css(".hdr,#hdr{display:none!important}"),notab:css("#tabbar,.tabbar{display:none!important}"),nofab:css("#fab,.fab,#ftip,.ftip{display:none!important}"),nofilters:css(".filters{display:none!important}")};
(async()=>{const b=await pw.webkit.launch();res.version=b.version();
for(const [vn,init] of Object.entries(V)){
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await ctx.addInitScript("window.__t=0;setInterval(()=>window.__t++,500);"+init);const p=await ctx.newPage();
 await p.goto("https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
 await p.waitForTimeout(6000);
 res[vn]=await Promise.race([new Promise(z=>setTimeout(()=>z('evalTimeout'),8000)),p.evaluate(()=>({t:window.__t,imgs:document.querySelectorAll('.cover img').length}))]);save();console.log(vn,JSON.stringify(res[vn]));await ctx.close().catch(()=>{})}
await b.close()})();
