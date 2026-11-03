const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;const res={};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
function css(c){return "(()=>{const add=()=>{const s=document.createElement('style');s.textContent="+JSON.stringify(c)+";(document.head||document.documentElement).appendChild(s)};if(document.documentElement)add();else document.addEventListener('DOMContentLoaded',add)})();"}
const V={base:"",nobackdrop:css("*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}"),noafter:css(".cover::after,.card::after,.card::before{display:none!important}"),noshadow:css("*{box-shadow:none!important}")};
const probe=()=>{const v=document.querySelector('#app>.view:not([hidden])');const el=document.elementFromPoint(195,450);const im=[...document.querySelectorAll('.cover img')];
 return {css:[...document.styleSheets].map(s=>s.href||'').filter(h=>/style/.test(h)).map(h=>h.split('/').pop()),t:window.__t,vop:v&&getComputedStyle(v).opacity,vanim:v&&getComputedStyle(v).animationName,at:el&&(el.className||el.tagName).toString().slice(0,40),sy:scrollY,imgs:im.length,loaded:im.filter(i=>i.complete&&i.naturalWidth).length,vis:im.filter(i=>getComputedStyle(i).opacity>.5).length}};
(async()=>{const b=await pw.webkit.launch();res.version=b.version();
for(const [vn,init] of Object.entries(V)){
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await ctx.addInitScript("window.__t=0;setInterval(()=>window.__t++,500);"+init);const p=await ctx.newPage();
 await p.goto("https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
 await p.waitForTimeout(8000);const a=await p.evaluate(probe).catch(e=>String(e));
 await p.screenshot({path:`${OUT}/${vn}-top.png`,timeout:12000}).catch(()=>{});
 await p.mouse.wheel(0,700).catch(()=>{});await p.evaluate(()=>window.scrollBy(0,700)).catch(()=>{});await p.waitForTimeout(8000);
 const c=await p.evaluate(probe).catch(e=>String(e));
 await p.screenshot({path:`${OUT}/${vn}-scrolled.png`,timeout:12000}).catch(()=>{});
 res[vn]={top:a,scrolled:c};save();console.log(vn,JSON.stringify(res[vn]));await ctx.close().catch(()=>{})}
await b.close()})();
