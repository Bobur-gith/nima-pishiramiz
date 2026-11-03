const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;const res={};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
function css(c){return "(()=>{const add=()=>{const s=document.createElement('style');s.textContent="+JSON.stringify(c)+";(document.head||document.documentElement).appendChild(s)};if(document.documentElement)add();else document.addEventListener('DOMContentLoaded',add)})();"}
const BASE="window.__t=0;setInterval(()=>window.__t++,500);";
const V={
 base:"",
 nobalance:css("*{text-wrap:wrap!important}"),
 textadjust:css("html,body{-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}"),
 nofonts:"",
 nogrid:css("#vRecipes .cover{display:none!important}"),
 nohas:css(".cover::after{display:none!important}"),
 both:css("*{text-wrap:wrap!important}html,body{-webkit-text-size-adjust:100%!important}"),
};
(async()=>{const b=await pw.webkit.launch();res.version=b.version();
for(const [vn,init] of Object.entries(V)){
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await ctx.addInitScript(BASE+init);const p=await ctx.newPage();let req=0;p.on('request',r=>{if(/wikimedia/.test(r.url()))req++});
 if(vn==="nofonts")await p.route(/fonts\.g/,r=>r.abort());
 await p.goto("https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
 await p.waitForTimeout(6000);
 const r=await Promise.race([new Promise(z=>setTimeout(()=>z('evalTimeout'),8000)),p.evaluate(()=>({t:window.__t,filled:document.querySelectorAll('.cover[data-filled]').length,imgs:document.querySelectorAll('.cover img').length,loaded:[...document.querySelectorAll('.cover img')].filter(i=>i.complete&&i.naturalWidth).length}))]);
 res[vn]={...(typeof r==='object'?r:{r}),req};save();console.log(vn,JSON.stringify(res[vn]));await ctx.close().catch(()=>{})}
await b.close()})();
