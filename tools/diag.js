const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;const res={};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
const INIT=`window.__io={created:0,observed:0,cb:0,inter:0};(()=>{const O=window.IntersectionObserver;if(!O)return;window.IntersectionObserver=function(cb,opt){__io.created++;const o=new O((es,ob)=>{__io.cb++;__io.inter+=es.filter(e=>e.isIntersecting).length;cb(es,ob)},opt);const ob=o.observe.bind(o);o.observe=el=>{__io.observed++;ob(el)};return o}})();
window.__t={set:0,fired:0};setInterval(()=>__t.fired++,500);`;
(async()=>{const b=await pw.webkit.launch();res.version=b.version();
for(const [name,mobile] of [["recipes-m2x",true],["recipes-desk",false]]){
 const ctx=await b.newContext(mobile?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:390,height:844}});
 await ctx.addInitScript(INIT);const p=await ctx.newPage();const L={req:0,errors:[],console:[]};
 p.on('request',r=>{if(/wikimedia/.test(r.url()))L.req++});p.on('pageerror',e=>L.errors.push(String(e).slice(0,200)));
 p.on('console',m=>{if(L.console.length<8)L.console.push(m.type()+": "+m.text().slice(0,160))});
 await p.goto("https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{waitUntil:'domcontentloaded',timeout:30000}).catch(e=>L.errors.push(String(e).slice(0,100)));
 const snaps=[];
 for(let i=0;i<6;i++){await p.waitForTimeout(2500);
  snaps.push(await Promise.race([new Promise(z=>setTimeout(()=>z('evalTimeout'),8000)),p.evaluate(()=>{const c=document.querySelector('.cover');const r=c&&c.getBoundingClientRect();
   return {io:{...window.__io},t:window.__t.fired,seen:document.querySelectorAll('.cover[data-seen]').length,filled:document.querySelectorAll('.cover[data-filled]').length,imgs:document.querySelectorAll('.cover img').length,
   r0:r&&[Math.round(r.top),Math.round(r.left),Math.round(r.width),Math.round(r.height)],ih:innerHeight,ch:document.documentElement.clientHeight,sy:scrollY,vv:window.visualViewport&&[visualViewport.width,visualViewport.height,visualViewport.scale],vis:document.visibilityState,raf:0}})]));
  res[name]={snaps,...L};save()}
 // manual: does a plain image load in this mode?
 const man=await Promise.race([new Promise(z=>setTimeout(()=>z('timeout'),12000)),p.evaluate(()=>new Promise(z=>{const im=new Image();im.onload=()=>z('load '+im.naturalWidth);im.onerror=()=>z('error');im.src='https://commons.wikimedia.org/wiki/Special:FilePath/Plov.jpg?width=320'}))]);
 const raf=await Promise.race([new Promise(z=>setTimeout(()=>z('no-raf'),5000)),p.evaluate(()=>new Promise(z=>requestAnimationFrame(()=>z('raf ok'))))]);
 await p.evaluate(()=>window.scrollBy(0,300)).catch(()=>{});await p.waitForTimeout(3000);
 const after=await p.evaluate(()=>({io:{...window.__io},filled:document.querySelectorAll('.cover[data-filled]').length,imgs:document.querySelectorAll('.cover img').length})).catch(e=>String(e));
 res[name].manual=man;res[name].raf=raf;res[name].afterScroll=after;res[name].req2=L.req;save();
 await p.screenshot({path:`${OUT}/${name}.png`,timeout:12000}).catch(e=>res[name].shot=String(e).slice(0,80));save();await ctx.close().catch(()=>{})}
await b.close();console.log(JSON.stringify(res))})();
