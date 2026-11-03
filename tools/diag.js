const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;
const V={
 base:{},
 eager:{init:`Object.defineProperty(HTMLImageElement.prototype,'loading',{configurable:true,get(){return 'eager'},set(v){}})`},
 nosrcset:{init:`for(const k of ['srcset','sizes'])Object.defineProperty(HTMLImageElement.prototype,k,{configurable:true,get(){return ''},set(v){}})`},
 eager_nosrcset:{init:`Object.defineProperty(HTMLImageElement.prototype,'loading',{configurable:true,get(){return 'eager'},set(v){}});for(const k of ['srcset','sizes'])Object.defineProperty(HTMLImageElement.prototype,k,{configurable:true,get(){return ''},set(v){}})`},
 nobackdrop:{css:`*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`},
 noanim:{css:`*,*::before,*::after{animation:none!important;transition:none!important}`},
 nofixed:{css:`.hdr,#tabbar,#fab,#ftip{position:static!important}`},
};
(async()=>{const res={};const b=await pw.webkit.launch();res.version=b.version();
for(const route of ["#/retseptlar","#/"]){
 for(const [vn,v] of Object.entries(V)){
  if(route==="#/"&&!["base","eager","nobackdrop"].includes(vn))continue;
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  if(v.init)await ctx.addInitScript(v.init);
  const p=await ctx.newPage();const log={req:0,resp:{},failed:[],console:[],errors:[]};
  p.on('request',r=>{if(/wikimedia/.test(r.url()))log.req++});
  p.on('response',r=>{if(/wikimedia/.test(r.url())){const k=r.status();log.resp[k]=(log.resp[k]||0)+1}});
  p.on('requestfailed',r=>{if(log.failed.length<5)log.failed.push([r.url().slice(0,120),r.failure()&&r.failure().errorText])});
  p.on('console',m=>{if(log.console.length<10&&m.type()!=="log")log.console.push(m.type()+": "+m.text().slice(0,200))});
  p.on('pageerror',e=>log.errors.push(String(e).slice(0,300)));
  try{await p.goto("https://bobur-gith.github.io/nima-pishiramiz/preview/"+route,{waitUntil:'load',timeout:60000})}catch(e){log.errors.push("goto "+e)}
  if(v.css)await p.addStyleTag({content:v.css});
  await p.waitForTimeout(9000);
  const r=await p.evaluate(()=>{const im=[...document.querySelectorAll('.cover img')];
    return {covers:document.querySelectorAll('.cover').length,seen:document.querySelectorAll('.cover[data-seen]').length,coversIn:document.querySelectorAll('.cover.in').length,tiles:document.querySelectorAll('.cover .tile').length,
     imgs:im.length,loaded:im.filter(i=>i.complete&&i.naturalWidth>0).length,
     detail:im.slice(0,3).map(i=>({cur:(i.currentSrc||'').slice(-60),src:i.src.slice(-40),complete:i.complete,nw:i.naturalWidth,loading:i.getAttribute('loading'),op:getComputedStyle(i).opacity,h:Math.round(i.getBoundingClientRect().height),top:Math.round(i.getBoundingClientRect().top)})),
     bodyH:document.body.scrollHeight,bg:getComputedStyle(document.body).backgroundColor,ua:navigator.userAgent}});
  res[route+"|"+vn]={...r,...log};
  await p.screenshot({path:`${OUT}/${route.replace(/[#/]/g,'')||'home'}-${vn}.png`});
  await ctx.close()}}
await b.close();fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));console.log(JSON.stringify(res,null,1))})();
