(function(){
"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s).toLowerCase().replace(/[ʻʼ‘’`´]/g,"'").replace(/ё/g,"е").replace(/\s+/g," ").trim();
const store={get(k,d){try{const v=localStorage.getItem("np:"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("np:"+k,JSON.stringify(v))}catch(e){}}};

/* ---------- data ---------- */
const slug=s=>norm(s).replace(/'/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const MEALMAP={n:"nonushta",t:"tushlik",k:"kechki",s:"shirinlik",i:"ichimlik"};
const ALL=[];const used=new Set();
for(const [country,flag,list] of DB.list){
  for(const r of list){
    let id=slug(r[0]);if(used.has(id))id=slug(country).slice(0,3)+"-"+id;used.add(id);
    ALL.push({id,name:r[0],ru:r[1],meals:[...r[2]].map(c=>MEALMAP[c]),type:r[3]==="s"?"suyuq":"quyuq",time:r[4],wiki:r[5],
      ing:r[6].split(";").map(x=>{const opt=x.startsWith("?");const [n,...q]=(opt?x.slice(1):x).split(":");return [n.trim(),q.join(":").trim(),opt?1:0]}),
      steps:r[7].split("|"),country,flag});
  }
}
const FLAG={};DB.list.forEach(([c,f])=>FLAG[c]=f);
const COUNTRIES=DB.list.map(x=>x[0]);
const MEALS=[["nonushta","Nonushta"],["tushlik","Tushlik"],["kechki","Kechki ovqat"],["shirinlik","Shirinlik"],["ichimlik","Ichimlik"]];
const STAPLE=new Set(["tuz","suv","yog'","murch","qora murch"]);
const SYN={"go'sht":["gosht","gusht","mol go'shti","qo'y go'shti","mol","qo'y","мясо","говядина","баранина","ot go'shti"],"tovuq":["kurinka","курица","tovuq go'shti"],"kartoshka":["kartofel","картошка","картофель"],"piyoz":["лук"],"sabzi":["морковь","morkov"],"pomidor":["помидор","томат","tomat"],"tuxum":["яйцо","яйца","tuhum"],"guruch":["рис","ris"],"un":["мука"],"sut":["молоко"],"qatiq":["kefir","yogurt","кефир","йогурт"],"sariyog'":["сливочное масло","maslo"],"pishloq":["сыр","brinza","syr","mozzarella","parmezan"],"qiyma":["фарш","farsh"],"bodring":["огурец"],"karam":["капуста"],"sarimsoq":["чеснок"],"shakar":["сахар"],"non":["хлеб","xleb"],"lapsha":["лапша","noodle"],"makaron":["макароны","spagetti","vermishel"],"ko'kat":["ukrop","petrushka","kashnich","shivit","зелень","укроп"],"smetana":["сметана"],"tvorog":["творог","suzma","paneer"],"qaymoq":["сливки","slivki"],"limon":["лимон"],"olma":["яблоко"],"choy":["чай"],"baliq":["рыба"],"yasmiq":["чечевица"],"no'xat":["нут","noxat"],"loviya":["фасоль"],"baqlajon":["баклажан"],"bolgar qalampir":["болгарский перец","qalampir"],"kolbasa":["колбаса","sosiska","vetchina"]};
const ALIAS=new Map();for(const[k,vs]of Object.entries(SYN)){ALIAS.set(norm(k),norm(k));vs.forEach(v=>ALIAS.set(norm(v),norm(k)))}
const base=s=>norm(s).replace(/\s*\(.*\)$/,"");
const canon=s=>ALIAS.get(base(s))||base(s);
const ALSO={"qiyma":["go'sht"],"go'sht":["qiyma"],"lapsha":["makaron"],"makaron":["lapsha"],"lavash":["non","tortilla"],"tortilla":["lavash"],"non":["lavash"],"ko'k piyoz":["ko'kat"],"yer yong'oq":["yong'oq"],"qaymoq":["smetana"],"smetana":["qaymoq","qatiq"],"kunjut pastasi":["kunjut"],"sosiska":["kolbasa"],"jigar":["go'sht"],"ismaloq":["ko'kat"]};
const VOCAB=[...new Set([...ALL.flatMap(d=>d.ing.map(i=>canon(i[0]))).filter(x=>!STAPLE.has(x)),...Object.keys(SYN).map(norm)])].sort((a,b)=>a.localeCompare(b));

/* ---------- state ---------- */
let pantry=store.get("pantry",[]);
let fC=store.get("fC",""),fM=store.get("fM",""),fT=store.get("fT",""),seg="auto",limit=48;

function has(name){const c=canon(name);return pantry.includes(c)||(ALSO[c]||[]).some(a=>pantry.includes(a))}
function match(d){const need=d.ing.filter(i=>!i[2]&&!STAPLE.has(canon(i[0])));const miss=need.filter(i=>!has(i[0])).map(i=>base(i[0]));return {need:need.length,have:need.length-miss.length,miss}}
function fmtTime(m){if(m>=1440)return Math.round(m/1440)+" kun";const h=Math.floor(m/60),r=m%60;return h?(r?`${h} soat ${r} daq`:`${h} soat`):`${r} daq`}
const PAL={quyuq:["#f0a53a","#c4572b"],suyuq:["#3a9a77","#1f5f6b"],shirin:["#e07a9a","#a43d64"],ichim:["#5a9be0","#2b5c9a"]};
const kind=d=>d.meals.includes("ichimlik")?"ichim":d.meals.includes("shirinlik")?"shirin":d.type;
function tile(d){const p=PAL[kind(d)];return `<div class="tile" style="--c1:${p[0]};--c2:${p[1]}"><span class="fl">${d.flag}</span><b>${esc(d.name)}</b><i>${d.type==="suyuq"?"Suyuq":"Quyuq"} · ${fmtTime(d.time)}</i></div>`}

/* ---------- photos (Wikipedia / Wikimedia Commons) ---------- */
const BAD=/\.svg|map|flag|logo|icon|coat_of|locator|diagram|emblem|signature|portrait|stamp|seal_of|banknote|coin/i;
const memo={};let active=0;const queue=[];
function pump(){while(active<4&&queue.length){const j=queue.shift();active++;j().finally(()=>{active--;pump()})}}
function photosFor(d){
  if(memo[d.id])return memo[d.id];
  const ck="ph3:"+d.id,c=store.get(ck,null);
  if(c)return memo[d.id]=Promise.resolve(c);
  return memo[d.id]=new Promise(res=>{queue.push(async()=>{let out=[];
    try{
      if(d.wiki){const [lang,title]=d.wiki.includes(":")?d.wiki.split(/:(.+)/):["en",d.wiki];
        const r=await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title.replace(/ /g,"_"))}`);
        if(r.ok){const j=await r.json();for(const it of j.items||[]){if(it.type!=="image"||BAD.test(it.title||""))continue;const s=(it.srcset||[]).slice(-1)[0];if(s&&s.src){out.push(s.src.startsWith("//")?"https:"+s.src:s.src)}if(out.length>=3)break}}
      }
      if(out.length<3){const q=(d.wiki?d.wiki.split(/:(.+)/)[1]||d.wiki:d.ru)+" food";
        const r=await fetch("https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch="+encodeURIComponent(q+" filetype:bitmap")+"&prop=imageinfo&iiprop=url|mime&iiurlwidth=800");
        if(r.ok){const j=await r.json();const pages=Object.values((j.query||{}).pages||{}).sort((a,b)=>(a.index||0)-(b.index||0));
          for(const p of pages){if(BAD.test(p.title))continue;const ii=(p.imageinfo||[])[0];if(ii&&/jpe?g|png|webp/.test(ii.mime)&&ii.thumburl&&!out.includes(ii.thumburl))out.push(ii.thumburl);if(out.length>=3)break}}
      }
    }catch(e){}
    out=out.slice(0,3);if(out.length)store.set(ck,out);res(out)});pump()});
}
const io=("IntersectionObserver" in window)?new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);fillCover(e.target)})},{rootMargin:"300px"}):null;
function fillCover(el){const d=ALL.find(x=>x.id===el.dataset.cid);if(!d)return;
  photosFor(d).then(ph=>{const ld=el.querySelector(".ld");if(!ph.length){if(ld)ld.outerHTML=tile(d);return}
    const img=new Image();img.alt=d.name;img.loading="lazy";img.onload=()=>{ld&&ld.remove()};img.onerror=()=>{img.remove();ld&&(ld.outerHTML=tile(d))};img.src=ph[0];el.prepend(img)})}

/* ---------- render ---------- */
function chipRow(el,items,val,key){el.innerHTML=items.map(([v,l,n])=>`<button class="chip" data-${key}="${esc(v)}" aria-pressed="${val===v}">${l}${n!=null?` <small>${n}</small>`:""}</button>`).join("")}
function renderFilters(){
  const cnt=c=>ALL.filter(d=>d.country===c).length;
  chipRow($("#fC"),[["","Barchasi",ALL.length],...COUNTRIES.map(c=>[c,`${FLAG[c]} ${esc(c)}`,cnt(c)])],fC,"c");
  chipRow($("#fM"),[["","Barchasi"],...MEALS],fM,"m");
  chipRow($("#fT"),[["","Barchasi"],["quyuq","Quyuq"],["suyuq","Suyuq"]],fT,"t");
}
const QUICK=["tuxum","kartoshka","piyoz","sabzi","pomidor","go'sht","tovuq","qiyma","guruch","un","sut","qatiq","non","pishloq","lapsha","shakar","bodring","karam"];
function renderPantry(){
  $("#mine").innerHTML=pantry.map(p=>`<span class="tag">${esc(p)}<button data-rm="${esc(p)}" aria-label="${esc(p)} — olib tashlash">×</button></span>`).join("");
  $("#quick").innerHTML=QUICK.filter(q=>!pantry.includes(q)).map(q=>`<button class="q" data-qa="${esc(q)}">+ ${esc(q)}</button>`).join("");
  $("#clr").hidden=!pantry.length;
}
function addItems(raw){const items=raw.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean).map(canon);let n=0;items.forEach(i=>{if(!pantry.includes(i)){pantry.push(i);n++}});if(n){store.set("pantry",pantry);seg="auto";limit=48;renderAll()}}
let sugL=[],sugI=0;
function renderSug(){const q=norm($("#q").value.split(/[,;]/).pop());const box=$("#sug");if(!q){box.hidden=true;return}
  const viaAlias=[...ALIAS.entries()].filter(([a])=>a.startsWith(q)).map(([,c])=>c);
  sugL=[...new Set([...VOCAB.filter(v=>v.startsWith(q)),...viaAlias,...VOCAB.filter(v=>v.includes(q))])].filter(v=>!pantry.includes(v)).slice(0,6);
  if(!sugL.length){box.hidden=true;return}sugI=Math.min(sugI,sugL.length-1);
  box.innerHTML=sugL.map((s,i)=>`<button data-sg="${esc(s)}" aria-selected="${i===sugI}">${esc(s)}</button>`).join("");box.hidden=false}
function submit(){const v=$("#q").value;if(!v.trim())return;if(!/[,;]/.test(v)&&sugL.length&&!$("#sug").hidden&&!VOCAB.includes(canon(v)))addItems(sugL[sugI]);else addItems(v);$("#q").value="";$("#sug").hidden=true}

function renderResults(){
  let list=ALL.filter(d=>(!fC||d.country===fC)&&(!fM||d.meals.includes(fM))&&(!fT||d.type===fT)).map(d=>({d,m:match(d)}));
  const P=pantry.length>0;
  if(P)list.sort((a,b)=>a.m.miss.length-b.m.miss.length||(b.m.have/(b.m.need||1))-(a.m.have/(a.m.need||1))||a.d.time-b.d.time);
  const now=list.filter(x=>!x.m.miss.length),near=list.filter(x=>x.m.miss.length>0&&x.m.miss.length<=2);
  let s=seg;if(s==="auto")s=!P?"all":now.length?"now":near.length?"near":"all";
  const sg=$("#seg");sg.hidden=!P;
  if(P)sg.innerHTML=[["now",`Hozir pishiring · ${now.length}`],["near",`1–2 tasi yetishmaydi · ${near.length}`],["all","Hammasi"]].map(([k,l])=>`<button data-sg2="${k}" aria-pressed="${s===k}">${l}</button>`).join("");
  const shown=s==="now"?now:s==="near"?near:list;
  $("#rt").textContent=!P?(fC?`${FLAG[fC]} ${fC} taomlari`:"Taomlar"):s==="now"?"Hozir pishirsa bo‘ladi":s==="near"?"Ozgina yetishmaydi":"Barcha mos taomlar";
  $("#rc").textContent=`${shown.length} ta`;
  const g=$("#grid");
  if(!shown.length){g.innerHTML=`<div class="empty"><b>Hech narsa topilmadi</b>${s==="now"?"Yana bir-ikkita masalliq qo‘shing yoki «1–2 tasi yetishmaydi»ni oching.":"Filtrlarni o‘zgartirib ko‘ring."}</div>`;$("#more").hidden=true;return}
  g.innerHTML=shown.slice(0,limit).map(({d,m})=>{
    const line=!P?`<div class="ml n">${m.need} ta masalliq</div>`:!m.miss.length?`<div class="ml ok">✓ Hammasi bor</div>`:`<div class="ml">Yetishmaydi: ${esc(m.miss.slice(0,3).join(", "))}${m.miss.length>3?` +${m.miss.length-3}`:""}</div>`;
    return `<button class="card" data-open="${d.id}"><div class="cover" data-cid="${d.id}"><div class="ld"></div>${P?`<span class="badge ${m.miss.length?"":"ok"}">${m.have}/${m.need}</span>`:""}</div>
      <div class="cb"><h3>${esc(d.name)}</h3><div class="cm">${d.flag} ${esc(d.country)} · ${fmtTime(d.time)}</div>${line}</div></button>`}).join("");
  g.querySelectorAll(".cover").forEach(el=>io?io.observe(el):fillCover(el));
  const mb=$("#more");mb.hidden=shown.length<=limit;mb.textContent=`Yana ko‘rsatish (${shown.length-limit})`;
}
function renderAll(){$("#stat").textContent=`${ALL.length} ta taom · ${COUNTRIES.length} davlat`;renderFilters();renderPantry();renderResults()}

/* ---------- detail ---------- */
let openId=null;const timers={};
const ytIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.7 15.1V8.9L15.5 12z"/></svg>';
function openDish(id){
  const d=ALL.find(x=>x.id===id);if(!d)return;openId=id;const m=match(d);
  const ing=d.ing.map(([n,q,o])=>{const st=STAPLE.has(canon(n)),ok=st||has(n);const cls=st?"base":ok?"have":o?"opt":"lack";
    return `<li class="${cls}"><span class="st">${ok?"✓":o?"–":"✕"}</span><span class="nm">${esc(n)}${o?"<em>ixtiyoriy</em>":""}</span><span class="qt">${esc(q)}</span></li>`}).join("");
  const steps=d.steps.map((s,i)=>{const t=(s.match(/(\d+)\s*daqiqa/)||[])[1];return `<li><button class="n" data-dn="${i}" aria-label="${i+1}-qadam bajarildi">${i+1}</button><div class="tx">${esc(s)}${t?`<div><button class="tm" data-tm="${id}:${i}" data-min="${t}">⏱ <span>${t} daqiqa taymer</span></button></div>`:""}</div></li>`}).join("");
  $("#sheet").innerHTML=`<div class="sc">
    <div class="gal"><span class="grab"></span><button class="close" id="cls" aria-label="Yopish">×</button>
      <div class="track" id="track"><div class="slide"><div class="ld cover" style="position:absolute;inset:0"></div></div></div><div class="dots" id="dots"></div></div>
    <div class="credit" id="credit"></div>
    <div class="sb">
      <div><h2>${esc(d.name)}</h2><div class="sub">${d.flag} ${esc(d.country)} · ${fmtTime(d.time)}</div>
        <div class="pills">${d.meals.map(x=>`<span class="pill">${MEALS.find(z=>z[0]===x)[1]}</span>`).join("")}<span class="pill g">${d.type==="suyuq"?"Suyuq":"Quyuq"}</span></div></div>
      <div class="acts"><a class="yt" href="https://www.youtube.com/results?search_query=${encodeURIComponent(d.ru+" рецепт")}" target="_blank" rel="noopener">${ytIcon}Tayyorlanish videosi</a></div>
      <section><div class="sh"><h3>Masalliqlar</h3><span>${pantry.length?`${m.have}/${m.need} bor`:`${d.ing.length} ta`}</span></div><ul class="ings">${ing}</ul>
        ${pantry.length?(m.miss.length?`<div class="miss">Yetishmaydi: ${esc(m.miss.join(", "))}</div>`:`<div class="miss ok">✓ Hammasi bor — pishiravering!</div>`):""}</section>
      <section><div class="sh"><h3>Tayyorlash</h3><span>${d.steps.length} qadam</span></div><ol class="steps">${steps}</ol></section>
    </div></div>`;
  photosFor(d).then(ph=>{if(openId!==id)return;const tr=$("#track");
    if(!ph.length){tr.innerHTML=`<div class="slide">${tile(d)}</div>`;return}
    tr.innerHTML=ph.map(u=>`<div class="slide"><img src="${u}" alt="${esc(d.name)}"></div>`).join("");
    $("#credit").textContent="Suratlar: Wikimedia Commons";
    if(ph.length>1){$("#dots").innerHTML=ph.map((_,i)=>`<button data-dot="${i}" aria-label="${i+1}-surat" aria-current="${i===0}"></button>`).join("");
      tr.addEventListener("scroll",()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);document.querySelectorAll("#dots button").forEach((b,j)=>b.setAttribute("aria-current",i===j))},{passive:true})}
    tr.querySelectorAll("img").forEach(im=>im.onerror=()=>im.parentNode.remove());
  });
  $("#ov").hidden=false;$("#sheet").hidden=false;requestAnimationFrame(()=>{$("#ov").classList.add("on");$("#sheet").classList.add("on")});
  document.body.style.overflow="hidden";try{history.replaceState(null,"","#"+id)}catch(e){}
}
function closeDish(){$("#ov").classList.remove("on");$("#sheet").classList.remove("on");document.body.style.overflow="";openId=null;
  setTimeout(()=>{if(!openId){$("#ov").hidden=true;$("#sheet").hidden=true}},320);try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(t=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;o.connect(g);g.connect(a.destination);g.gain.value=.2;o.start(a.currentTime+t);o.stop(a.currentTime+t+.25)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([250,120,250])}catch(e){}}
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function updTm(k){const b=document.querySelector(`[data-tm="${k}"]`);if(!b)return;const t=timers[k];b.className="tm"+(t?(t.left<=0?" end":" run"):"");b.querySelector("span").textContent=t?(t.left<=0?"Tayyor!":fmt(t.left)):b.dataset.min+" daqiqa taymer"}
function toggleTm(k,min){if(timers[k]){clearInterval(timers[k].iv);delete timers[k];updTm(k);return}
  const t={end:Date.now()+min*60000,left:min*60};t.iv=setInterval(()=>{t.left=Math.max(0,Math.round((t.end-Date.now())/1000));updTm(k);if(!t.left){clearInterval(t.iv);beep();toast("⏰ Vaqt tugadi!")}},500);timers[k]=t;updTm(k)}
let tt;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2200)}

/* ---------- events ---------- */
$("#q").addEventListener("input",()=>{sugI=0;const v=$("#q").value;if(/[,;]\s*$/.test(v)){addItems(v);$("#q").value="";$("#sug").hidden=true;return}renderSug()});
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();submit()}else if(e.key==="ArrowDown"&&sugL.length){e.preventDefault();sugI=(sugI+1)%sugL.length;renderSug()}else if(e.key==="ArrowUp"&&sugL.length){e.preventDefault();sugI=(sugI-1+sugL.length)%sugL.length;renderSug()}else if(e.key==="Escape")$("#sug").hidden=true});
$("#add").addEventListener("click",submit);
$("#more").addEventListener("click",()=>{limit+=48;renderResults()});
document.addEventListener("click",e=>{
  if(!e.target.closest(".field"))$("#sug").hidden=true;
  if(e.target.id==="ov"){closeDish();return}
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.c!==undefined){fC=d.c;store.set("fC",fC);seg="auto";limit=48;renderFilters();renderResults()}
  else if(d.m!==undefined){fM=d.m;store.set("fM",fM);seg="auto";limit=48;renderFilters();renderResults()}
  else if(d.t!==undefined){fT=d.t;store.set("fT",fT);seg="auto";limit=48;renderFilters();renderResults()}
  else if(d.qa)addItems(d.qa);
  else if(d.rm){pantry=pantry.filter(x=>x!==d.rm);store.set("pantry",pantry);seg="auto";renderAll()}
  else if(d.sg){addItems(d.sg);$("#q").value="";$("#sug").hidden=true;$("#q").focus()}
  else if(d.sg2){seg=d.sg2;limit=48;renderResults()}
  else if(d.open)openDish(d.open);
  else if(d.dot){const tr=$("#track");tr.scrollTo({left:+d.dot*tr.clientWidth,behavior:"smooth"})}
  else if(d.dn!==undefined){const li=b.closest("li");li.classList.toggle("done");b.textContent=li.classList.contains("done")?"✓":(+d.dn+1)}
  else if(d.tm)toggleTm(d.tm,+d.min);
  else if(b.id==="cls")closeDish();
  else if(b.id==="clr"){pantry=[];store.set("pantry",pantry);seg="auto";renderAll()}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&openId)closeDish()});
(function(){let y0=null;const sh=$("#sheet");sh.addEventListener("touchstart",e=>{const sc=sh.querySelector(".sc");y0=sc&&sc.scrollTop>0?null:e.touches[0].clientY},{passive:true});
 sh.addEventListener("touchmove",e=>{if(y0==null)return;const dy=e.touches[0].clientY-y0;if(dy>0){sh.style.transition="none";sh.style.transform=`translateY(${dy}px)`}},{passive:true});
 sh.addEventListener("touchend",e=>{if(y0==null)return;const dy=e.changedTouches[0].clientY-y0;sh.style.transition="";sh.style.transform="";if(dy>110)closeDish();y0=null})})();
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(h&&ALL.some(d=>d.id===h)){if(openId!==h)openDish(h)}else if(openId)closeDish()});
renderAll();
const h0=location.hash.slice(1);if(h0&&ALL.some(d=>d.id===h0))openDish(h0);
})();
