const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;const res={};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
const css=c=>`(()=>{const add=()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(c)};(document.head||document.documentElement).appendChild(s)};if(document.documentElement)add();else document.addEventListener('DOMContentLoaded',add)})();`;
const BASE=`window.__t=0;setInterval(()=>window.__t++,500);`;
const V={
 base:"",
 nosnap:css("*{scroll-snap-type:none!important}"),
 nooverscroll:css("*{overscroll-behavior:auto!important}"),
 noscrollTo:"window.scrollTo=function(){};",
 nobackdrop:css("*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}"),
 noanim:css("*,*::before,*::after{animation:none!important;transition:none!important}"),
 nofixed:css(".hdr,#tabbar,.tabbar,#fab,.fab,#ftip{position:absolute!important}"),
 noauth:"",
 nochef:"",
};
(async()=>{const b=await pw.webkit.launch();res.version=b.version();
for(const [vn,init] of Object.entries(V)){
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await ctx.addInitScript(BASE+init);const p=await ctx.newPage();let req=0;p.on('request',r=>{if(/wikimedia/.test(r.url()))req++});
 if(vn==="noauth")await p.route(/auth\.js|firebase|gstatic\.com\/firebasejs|googleapis\.com\/(identitytoolkit|securetoken)/,r=>r.abort());
 if(vn==="nochef")await p.route(/chef\.js|puter/,r=>r.abort());
 await p.goto("https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
 await p.waitForTimeout(6000);
 const r=await Promise.race([new Promise(z=>setTimeout(()=>z('evalTimeout'),8000)),p.evaluate(()=>({t:window.__t,filled:document.querySelectorAll('.cover[data-filled]').length,imgs:document.querySelectorAll('.cover img').length,loaded:[...document.querySelectorAll('.cover img')].filter(i=>i.complete&&i.naturalWidth).length}))]);
 res[vn]={...r,req};save();console.log(vn,JSON.stringify(res[vn]));await ctx.close().catch(()=>{})}
// also live in same mode
for(const [vn,url] of [["live","https://bobur-gith.github.io/nima-pishiramiz/"],["preview-home","https://bobur-gith.github.io/nima-pishiramiz/preview/#/"],["preview-menu","https://bobur-gith.github.io/nima-pishiramiz/preview/#/menyu"]]){
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(BASE);const p=await ctx.newPage();
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});await p.waitForTimeout(6000);
 res[vn]=await p.evaluate(()=>({t:window.__t})).catch(e=>String(e));save();console.log(vn,JSON.stringify(res[vn]));await ctx.close().catch(()=>{})}
await b.close()})();
