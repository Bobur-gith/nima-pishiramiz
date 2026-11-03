// Ilova ekranlarini 1080x1920 (360x640 @3x) suratga olish — reklama videosi uchun
const {chromium}=require('playwright');const fs=require('fs');
const BASE="https://bobur-gith.github.io/nima-pishiramiz/preview/?b="+Date.now();
const OUT="out/shots";const meta={};const log=[];
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:360,height:640},deviceScaleFactor:3,isMobile:true,hasTouch:true,locale:"uz-UZ"});
await ctx.addInitScript(()=>{try{localStorage.setItem("np:lang",JSON.stringify("uz"))}catch(e){}});
const p=await ctx.newPage();p.on('pageerror',e=>log.push("err "+String(e).slice(0,200)));
const box=async sel=>{try{const r=await p.locator(sel).first().boundingBox();return r?{x:Math.round((r.x+r.width/2)*3),y:Math.round((r.y+r.height/2)*3)}:null}catch(e){return null}};
const waitImgs=async(ms=9000)=>{const t0=Date.now();while(Date.now()-t0<ms){const ok=await p.evaluate(()=>{const im=[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>20&&/wikimedia/.test(i.currentSrc||i.src)});return im.every(i=>i.complete)}).catch(()=>true);if(ok)break;await p.waitForTimeout(400)}await p.waitForTimeout(700)};
let n=0;const shot=async(name,tap)=>{n++;const f=`${String(n).padStart(2,"0")}-${name}.png`;await p.screenshot({path:`${OUT}/${f}`});meta[f]={tap:tap||null};fs.writeFileSync(`${OUT}/meta.json`,JSON.stringify({meta,log},null,1));console.log("shot",f,JSON.stringify(tap))};
const go=async h=>{await p.evaluate(h=>{location.hash=h},h);await p.waitForTimeout(900)};
try{
 await p.goto(BASE+"#/",{waitUntil:"domcontentloaded",timeout:45000});await p.waitForTimeout(2500);await waitImgs();
 await shot("home");
 await p.evaluate(()=>document.querySelector("#tToday").scrollIntoView({block:"start"}));await p.evaluate(()=>scrollBy(0,-70));await p.waitForTimeout(600);await waitImgs();await shot("home-today");
 await p.evaluate(()=>document.querySelector("#tUz").scrollIntoView({block:"start"}));await p.evaluate(()=>scrollBy(0,-70));await p.waitForTimeout(600);await waitImgs();await shot("home-uz");
 // Uyda nimalar bor?
 await go("#/uyda");await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(800);
 await shot("pantry",await box('[data-pg="dairy"]'));
 await p.click('[data-pg="dairy"]');await p.waitForTimeout(500);await shot("pantry-dairy",await box('[data-ing="tuxum"]'));
 await p.click('[data-ing="tuxum"]');await p.waitForTimeout(500);await shot("pantry-egg",await box('[data-pg="veg"]'));
 await p.click('[data-pg="veg"]');await p.waitForTimeout(500);await shot("pantry-veg",await box('[data-ing="kartoshka"]'));
 await p.click('[data-ing="kartoshka"]');await p.waitForTimeout(500);await shot("pantry-potato",await box('[data-ing="piyoz"]'));
 await p.click('[data-ing="piyoz"]');await p.waitForTimeout(700);await shot("pantry-onion",null);
 await p.evaluate(()=>document.querySelector("#pRes").scrollIntoView({block:"start"}));await p.evaluate(()=>scrollBy(0,-60));await p.waitForTimeout(800);await waitImgs();await shot("pantry-results");
 await p.evaluate(()=>scrollBy(0,330));await p.waitForTimeout(800);await waitImgs();await shot("pantry-results2");
 // AI oshpaz
 await go("#/");await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(600);
 const fab=await box("#fab");await shot("home-fab",fab);
 await p.click("#fab");await p.waitForTimeout(1500);await shot("chef-open",await box("#cIn"));
 await p.click("#cIn");await p.type("#cIn","Go'shtsiz kechki ovqat",{delay:60});await p.waitForTimeout(300);await shot("chef-typed",await box("#cSend"));
 await p.click("#cSend");await p.waitForTimeout(1800);await shot("chef-thinking");await p.waitForTimeout(5000);await waitImgs(6000);await shot("chef-answer");
 await p.evaluate(()=>{const m=document.querySelector("#msgs");m&&(m.scrollTop=m.scrollHeight)});await p.waitForTimeout(800);await waitImgs(6000);await shot("chef-answer2");
 log.push("chef: "+(await p.evaluate(()=>document.querySelector("#msgs").innerText.slice(-600))));
 await p.click("#chX").catch(()=>{});await p.waitForTimeout(800);
 // Retseptlar, davlatlar
 await go("#/retseptlar");await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(800);await waitImgs();await shot("recipes",await box("#pickC"));
 await p.click("#pickC");await p.waitForTimeout(1200);await shot("picker");
 const uz=await p.locator('#pkList [data-pc]').filter({hasText:"O"}).first();
 const pcs=await p.evaluate(()=>[...document.querySelectorAll('#pkList [data-pc]')].slice(0,40).map(b=>b.dataset.pc));log.push("pcs "+pcs.join("|"));
 const uzSel='#pkList [data-pc^="O"][data-pc$="zbekiston"]';const uzb=await box(uzSel);
 if(uzb){await shot("picker-uz",uzb);await p.click(uzSel)}else{await p.click("#pkClose").catch(()=>{})}
 await p.waitForTimeout(1200);await waitImgs();await shot("recipes-uz");
 // Retsept sahifasi
 await p.click("#grid .card[data-open]");await p.waitForTimeout(2500);await waitImgs();await shot("dish");
 for(const k of [1,2,3]){await p.evaluate(()=>{const s=document.querySelector("#sheet .sc");s&&s.scrollBy(0,520)});await p.waitForTimeout(900);await shot("dish-"+k)}
 await p.keyboard.press("Escape");await p.waitForTimeout(800);
 // Haftalik menyu va xarid ro'yxati
 await go("#/menyu");await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(1000);await waitImgs();await shot("menu");
 await p.evaluate(()=>scrollBy(0,420));await p.waitForTimeout(800);await waitImgs();await shot("menu2");
 await p.evaluate(()=>document.querySelector("#mShopT").scrollIntoView({block:"start"}));await p.evaluate(()=>scrollBy(0,-70));await p.waitForTimeout(700);
 const cb=p.locator('#mShop input[type=checkbox]');await shot("shop",await box('#mShop li:nth-child(1) label'));
 await cb.nth(0).check().catch(()=>{});await p.waitForTimeout(400);await shot("shop-1",await box('#mShop li:nth-child(2) label'));
 await cb.nth(1).check().catch(()=>{});await p.waitForTimeout(400);await shot("shop-2",await box('#mShop li:nth-child(3) label'));
 await cb.nth(2).check().catch(()=>{});await p.waitForTimeout(400);await shot("shop-3");
}catch(e){log.push("FAIL "+String(e).slice(0,300));console.log("FAIL",e)}
fs.writeFileSync(`${OUT}/meta.json`,JSON.stringify({meta,log},null,1));await b.close()})();
