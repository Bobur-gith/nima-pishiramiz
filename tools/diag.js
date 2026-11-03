const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;const res={};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
const P="https://bobur-gith.github.io/nima-pishiramiz/";
const PAGES=[["live",P],["prev-home",P+"preview/#/"],["prev-recipes",P+"preview/#/retseptlar"],["prev-uz",P+"preview/#/retseptlar?c=O%CA%BBzbekiston"]];
(async()=>{for(const eng of ["webkit","chromium"]){const b=await pw[eng].launch();res[eng]=b.version();
for(const mobile of [true,false])for(const [name,url] of PAGES){
 const key=`${eng}|${mobile?"mob":"desk"}|${name}`;
 const ctx=await b.newContext(mobile?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1280,height:900}});
 await ctx.addInitScript("window.__t=0;setInterval(()=>window.__t++,500);");const p=await ctx.newPage();
 await p.goto(url+(url.includes('?')?'&':(url.includes('#')?'':''))+'',{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
 await p.waitForTimeout(3000);await p.evaluate(()=>window.scrollBy(0,700)).catch(()=>{});await p.waitForTimeout(5000);
 const r=await Promise.race([new Promise(z=>setTimeout(()=>z({evalTimeout:1}),8000)),p.evaluate(()=>{const im=[...document.querySelectorAll('.cover img')];const cov=[...document.querySelectorAll('.cover')].filter(c=>{const r=c.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0&&r.height>0});
  return {t:window.__t,coversInView:cov.length,inViewWithPhoto:cov.filter(c=>{const i=c.querySelector('img');return i&&i.complete&&i.naturalWidth&&getComputedStyle(i).opacity>.5}).length,inViewTiles:cov.filter(c=>c.querySelector('.tile')).length,zeroH:[...document.querySelectorAll('.cover')].filter(c=>c.getBoundingClientRect().height===0&&c.offsetParent).length}})]);
 res[key]=r;save();console.log(key,JSON.stringify(r));
 if(mobile)await p.screenshot({path:`${OUT}/${eng}-${name}.png`,timeout:12000}).catch(()=>{});
 await ctx.close().catch(()=>{})}
await b.close()}})();
