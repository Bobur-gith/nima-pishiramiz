const pw=require('playwright');const fs=require('fs');const {execSync}=require('child_process');const OUT=process.env.OUT;const res={mem:[]};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
function css(c){return "(()=>{const add=()=>{const s=document.createElement('style');s.textContent="+JSON.stringify(c)+";(document.head||document.documentElement).appendChild(s)};if(document.documentElement)add();else document.addEventListener('DOMContentLoaded',add)})();"}
let cur="";setInterval(()=>{try{const m=execSync("ps -eo rss,comm --sort=-rss | head -4").toString().trim().split('\n').slice(1).map(l=>l.trim()).join(' ; ');const f=execSync("free -m | sed -n 2p").toString().trim();res.mem.push(cur+" | "+m+" | "+f);console.log(cur,"|",m,"|",f);save()}catch(e){}},3000);
const NB=css("*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}");
const CASES=[["nobackdrop",NB],["noafter",css(".cover::after{display:none!important}")],["base",""]];
const probe=()=>{const im=[...document.querySelectorAll('.cover img')];const cov=[...document.querySelectorAll('.cover')].filter(c=>{const r=c.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.height>0});
 return {t:window.__t,sy:scrollY,imgs:im.length,loaded:im.filter(i=>i.complete&&i.naturalWidth).length,inView:cov.length,inViewPhoto:cov.filter(c=>{const i=c.querySelector('img');return i&&i.complete&&i.naturalWidth&&getComputedStyle(i).opacity>.5}).length,inViewIn:cov.filter(c=>c.classList.contains('in')).length,inViewFilled:cov.filter(c=>c.dataset.filled).length,at:(document.elementFromPoint(195,450)||{}).className}};
(async()=>{const b=await pw.webkit.launch();res.version=b.version();
for(const [vn,init] of CASES){cur=vn;
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await ctx.addInitScript("window.__t=0;setInterval(()=>window.__t++,500);"+init);const p=await ctx.newPage();
 await p.goto("https://bobur-gith.github.io/nima-pishiramiz/preview/?b="+Date.now()+"#/retseptlar",{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
 await p.waitForTimeout(6000);const top=await p.evaluate(probe).catch(e=>String(e));res[vn]={top};save();
 await p.screenshot({path:`${OUT}/${vn}-top.png`,timeout:12000}).catch(()=>{});
 await p.evaluate(()=>window.scrollBy(0,700)).catch(()=>{});
 const ser=[];for(let i=0;i<5;i++){await p.waitForTimeout(2000);ser.push(await Promise.race([new Promise(z=>setTimeout(()=>z('evalTimeout'),6000)),p.evaluate(probe)]).catch(e=>String(e)));res[vn].scrolled=ser;save()}
 await p.screenshot({path:`${OUT}/${vn}-scrolled.png`,timeout:12000}).catch(()=>{});save();
 await ctx.close().catch(()=>{})}
await b.close();process.exit(0)})();
