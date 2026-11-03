const pw=require('playwright');const fs=require('fs');
const FIX={none:"",A:".cover{height:0!important;padding-top:75%!important;aspect-ratio:auto!important}",B:".cover{width:100%}",C:"button.card{display:block}"};
(async()=>{const res={};
for(const eng of ["chromium","webkit","firefox"]){const b=await pw[eng].launch();res[eng+"_version"]=b.version();
 for(const [name,url,fixes] of [["live","https://bobur-gith.github.io/nima-pishiramiz/",["none","A","B","C"]],["preview","https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",["none"]]]){
  for(const fx of fixes){
   const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:eng!=="firefox",hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
   try{await p.goto(url,{waitUntil:'networkidle',timeout:60000})}catch(e){errs.push("goto "+e)}
   if(FIX[fx])await p.addStyleTag({content:FIX[fx]});
   await p.evaluate(()=>window.scrollTo(0,500));await p.waitForTimeout(5000);
   const r=await p.evaluate(()=>{const cs=[...document.querySelectorAll('.card')].slice(0,6).map(c=>{const v=c.querySelector('.cover');return v?Math.round(v.getBoundingClientRect().height):-1});
     const im=[...document.images].filter(i=>/wikimedia/.test(i.currentSrc||i.src));
     const vis=im.filter(i=>{const r=i.getBoundingClientRect();return r.height>20&&getComputedStyle(i).opacity>0.5}).length;
     return {coverH:cs,imgs:im.length,loaded:im.filter(i=>i.complete&&i.naturalWidth>0).length,visible:vis,ua:navigator.userAgent.slice(0,140)}});
   r.errors=errs;res[`${eng}|${name}|${fx}`]=r;
   if(fx==="none"||fx==="A")await p.screenshot({path:`${process.env.OUT}/${eng}-${name}-${fx}.png`});
   await ctx.close()}}
 await b.close()}
fs.writeFileSync(process.env.OUT+'/diag.json',JSON.stringify(res,null,1));console.log(JSON.stringify(res,null,1))})();
