const pw=require('playwright');const fs=require('fs');const OUT=process.env.OUT;const res={};const save=()=>fs.writeFileSync(OUT+'/diag.json',JSON.stringify(res,null,1));
const NB=`*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`;
const CASES=[
 ["preview-base","https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{}],
 ["preview-nobackdrop","https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{css:NB}],
 ["preview-home","https://bobur-gith.github.io/nima-pishiramiz/preview/#/",{}],
 ["live","https://bobur-gith.github.io/nima-pishiramiz/",{}],
 ["preview-mobile2x","https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar",{mobile:true}],
];
(async()=>{for(const eng of (process.env.ENGINES||"webkit").split(",")){const b=await pw[eng].launch();res[eng+"_version"]=b.version();save();
for(const [name,url,o] of CASES){const t0=Date.now();const key=eng+"|"+name;res[key]={};
 const ctx=await b.newContext(o.mobile?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:eng!=="firefox",hasTouch:true}:{viewport:{width:390,height:844}});
 const p=await ctx.newPage();const L={req:0,resp:{},failed:[],errors:[]};
 p.on('request',r=>{if(/wikimedia/.test(r.url()))L.req++});
 p.on('response',r=>{if(/wikimedia/.test(r.url())){const k=r.status();L.resp[k]=(L.resp[k]||0)+1}});
 p.on('requestfailed',r=>{if(L.failed.length<4)L.failed.push([r.url().slice(-70),r.failure()&&r.failure().errorText])});
 p.on('pageerror',e=>L.errors.push(String(e).slice(0,200)));
 try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000})}catch(e){L.errors.push("goto "+String(e).slice(0,100))}
 if(o.css)await p.addStyleTag({content:o.css}).catch(()=>{});
 const series=[];
 for(let i=0;i<10;i++){await p.waitForTimeout(2000);
  const r=await Promise.race([new Promise(z=>setTimeout(()=>z(null),8000)),p.evaluate(()=>{const im=[...document.querySelectorAll('.cover img')];return [document.querySelectorAll('.cover').length,im.length,im.filter(i=>i.complete&&i.naturalWidth>0).length,document.querySelectorAll('.cover.in').length,document.querySelectorAll('.cover .tile').length]})]);
  series.push(r);res[key]={ms:Date.now()-t0,series,...L};save();if(r&&r[1]>0&&r[2]===r[1])break}
 await p.screenshot({path:`${OUT}/${eng}-${name}.png`,timeout:12000}).catch(e=>res[key].shot=String(e).slice(0,80));
 res[key].ms=Date.now()-t0;save();await ctx.close().catch(()=>{})}
await b.close()}console.log(JSON.stringify(res))})();
