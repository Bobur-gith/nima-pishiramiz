window.startApp=function(){
"use strict";
if(window.__npStarted)return;window.__npStarted=true;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s).toLowerCase().replace(/[ʻʼ‘’`´]/g,"'").replace(/ё/g,"е").replace(/\s+/g," ").trim();
const store={get(k,d){try{const v=localStorage.getItem("np:"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("np:"+k,JSON.stringify(v))}catch(e){}}};
const T=window.I18N||{C:{},I:{},W:{},S:{},N:{}};
{const X=DB.x||{};for(const k of ["C","I","S","N"])T[k]=Object.assign({},T[k]||{},X[k]||{})}

/* ---------- language ---------- */
const LANGS=["uz","ru","en"];
let lang=store.get("lang",null);
if(!LANGS.includes(lang)){const nl=(navigator.language||"uz").slice(0,2);lang=nl==="ru"?"ru":nl==="en"?"en":"uz"}
const LI=()=>lang==="ru"?0:1;
const UI={
 uz:{title:"Nima pishiramiz?",stat:(a,b,c)=>`${a} ta taom · ${b} davlat`+(c?` · ${c} avtonomiya`:""),
  q1:"Qaysi davlat taomini yemoqchisiz?",q2:"Qaysi vaqt uchun taom kerak?",q3:"Quyuq taommi yoki suyuq?",q4:"Uyingizda nimalar bor?",
  world:"Butun dunyo",anyMeal:"Istalgan",anyType:"Farqi yo'q",quyuq:"Quyuq",suyuq:"Suyuq",
  meals:{nonushta:"Nonushta",tushlik:"Tushlik",kechki:"Kechki ovqat",shirinlik:"Shirinlik",ichimlik:"Ichimlik"},
  regions:{"MDH":"MDH","Avtonomiyalar":"Avtonomiyalar","Yevropa":"Yevropa","Osiyo":"Osiyo","Yaqin Sharq":"Yaqin Sharq","Afrika":"Afrika","Amerika":"Amerika","Okeaniya":"Okeaniya"},
  allOf:r=>`Butun ${r}`,search:"Davlatni qidiring…",dishes:n=>`${n} ta taom`,
  ph:"masalan: tuxum, kartoshka, piyoz",add:"Qo'shish",clear:"Tozalash",remove:"olib tashlash",
  note:"Tuz, suv, yog' va murch doim bor deb hisoblanadi.",
  now:"Hozir pishiring",near:"1–2 tasi yetishmaydi",all:"Hammasi",
  tNow:"Hozir pishirsa bo'ladi",tNear:"Ozgina yetishmaydi",tAll:"Barcha mos taomlar",tDef:"Taomlar",tOf:n=>`${n} taomlari`,
  cnt:n=>`${n} ta`,ingN:n=>`${n} ta masalliq`,allHave:"✓ Hammasi bor",lack:"Yetishmaydi",
  none:"Hech narsa topilmadi",noneNow:"Yana bir-ikkita masalliq qo'shing yoki «1–2 tasi yetishmaydi»ni oching.",noneF:"Filtrlarni o'zgartirib ko'ring.",
  more:n=>`Yana ko'rsatish (${n})`,video:"Tayyorlanish videosi",ings:"Masalliqlar",have:(a,b)=>`${a}/${b} bor`,opt:"ixtiyoriy",
  cook:"Tayyorlash",steps:n=>`${n} qadam`,allOk:"✓ Hammasi bor — pishiravering!",timer:m=>`${m} daqiqa taymer`,ready:"Tayyor!",timeUp:"⏰ Vaqt tugadi!",
  close:"Yopish",photos:"Suratlar: Wikimedia Commons",stepDone:n=>`${n}-qadam bajarildi`,photoN:n=>`${n}-surat`,
  filters:"Filtrlar",change:"O'zgartirish",
  foot:"Suratlar avtomatik ravishda Wikipedia va Wikimedia Commons'dan (erkin litsenziya) olinadi. «Tayyorlanish videosi» tugmasi YouTube'da shu taom retseptlarini ochadi.",
  min:"daq",hr:"soat",day:"kun",yt:" retsepti",desc:"Uyda bor masalliqlarni yozing — 195 davlatdan 2100 dan ortiq taomdan qaysi birini pishirish mumkinligini ko'ring."},
 ru:{title:"Что приготовить?",stat:(a,b,c)=>`${a} блюд · ${b} стран`+(c?` · ${c} автономий`:""),
  q1:"Блюдо какой страны хотите?",q2:"На какое время нужно блюдо?",q3:"Густое блюдо или жидкое?",q4:"Что у вас есть дома?",
  world:"Весь мир",anyMeal:"Любое",anyType:"Неважно",quyuq:"Густое",suyuq:"Жидкое",
  meals:{nonushta:"Завтрак",tushlik:"Обед",kechki:"Ужин",shirinlik:"Десерт",ichimlik:"Напиток"},
  regions:{"MDH":"СНГ","Avtonomiyalar":"Автономии","Yevropa":"Европа","Osiyo":"Азия","Yaqin Sharq":"Ближний Восток","Afrika":"Африка","Amerika":"Америка","Okeaniya":"Океания"},
  allOf:r=>`Вся ${r}`,search:"Найти страну…",dishes:n=>`${n} блюд`,
  ph:"например: яйца, картошка, лук",add:"Добавить",clear:"Очистить",remove:"убрать",
  note:"Соль, вода, масло и перец считаются всегда в наличии.",
  now:"Можно сейчас",near:"Не хватает 1–2",all:"Все",
  tNow:"Можно приготовить сейчас",tNear:"Чуть-чуть не хватает",tAll:"Все подходящие блюда",tDef:"Блюда",tOf:n=>`Блюда: ${n}`,
  cnt:n=>`${n}`,ingN:n=>`${n} ингредиентов`,allHave:"✓ Всё есть",lack:"Не хватает",
  none:"Ничего не найдено",noneNow:"Добавьте ещё пару продуктов или откройте «Не хватает 1–2».",noneF:"Попробуйте изменить фильтры.",
  more:n=>`Показать ещё (${n})`,video:"Видео рецепта",ings:"Ингредиенты",have:(a,b)=>`есть ${a}/${b}`,opt:"по желанию",
  cook:"Приготовление",steps:n=>`${n} шагов`,allOk:"✓ Всё есть — готовьте!",timer:m=>`таймер ${m} мин`,ready:"Готово!",timeUp:"⏰ Время вышло!",
  close:"Закрыть",photos:"Фото: Wikimedia Commons",stepDone:n=>`Шаг ${n} выполнен`,photoN:n=>`Фото ${n}`,
  filters:"Фильтры",change:"Изменить",
  foot:"Фото подгружаются автоматически из Википедии и Wikimedia Commons (свободные лицензии). Кнопка «Видео рецепта» открывает рецепты этого блюда на YouTube.",
  min:"мин",hr:"ч",day:"дн",yt:" рецепт",desc:"Напишите, какие продукты есть дома, — и узнайте, какие из 2100+ блюд 195 стран можно приготовить."},
 en:{title:"What to cook?",stat:(a,b,c)=>`${a} dishes · ${b} countries`+(c?` · ${c} autonomies`:""),
  q1:"Which country's food do you want?",q2:"What meal is it for?",q3:"Thick dish or soupy?",q4:"What do you have at home?",
  world:"Whole world",anyMeal:"Any",anyType:"Either",quyuq:"Thick",suyuq:"Soupy",
  meals:{nonushta:"Breakfast",tushlik:"Lunch",kechki:"Dinner",shirinlik:"Dessert",ichimlik:"Drink"},
  regions:{"MDH":"CIS","Avtonomiyalar":"Autonomies","Yevropa":"Europe","Osiyo":"Asia","Yaqin Sharq":"Middle East","Afrika":"Africa","Amerika":"Americas","Okeaniya":"Oceania"},
  allOf:r=>`All of ${r}`,search:"Search country…",dishes:n=>`${n} dishes`,
  ph:"e.g. eggs, potatoes, onion",add:"Add",clear:"Clear",remove:"remove",
  note:"Salt, water, oil and pepper are assumed to be at hand.",
  now:"Cook now",near:"Missing 1–2",all:"All",
  tNow:"You can cook these now",tNear:"Just a little missing",tAll:"All matching dishes",tDef:"Dishes",tOf:n=>`${n} dishes`,
  cnt:n=>`${n}`,ingN:n=>`${n} ingredients`,allHave:"✓ You have it all",lack:"Missing",
  none:"Nothing found",noneNow:"Add a couple more ingredients or open “Missing 1–2”.",noneF:"Try changing the filters.",
  more:n=>`Show more (${n})`,video:"Video recipe",ings:"Ingredients",have:(a,b)=>`${a}/${b} at hand`,opt:"optional",
  cook:"Method",steps:n=>`${n} steps`,allOk:"✓ You have everything — start cooking!",timer:m=>`${m} min timer`,ready:"Done!",timeUp:"⏰ Time's up!",
  close:"Close",photos:"Photos: Wikimedia Commons",stepDone:n=>`Step ${n} done`,photoN:n=>`Photo ${n}`,
  filters:"Filters",change:"Change",
  foot:"Photos load automatically from Wikipedia and Wikimedia Commons (free licences). The “Video recipe” button opens recipes for the dish on YouTube.",
  min:"min",hr:"h",day:"d",yt:" recipe",desc:"Type what you have at home and see which of 2,100+ dishes from 195 countries you can cook."}
};
const t=()=>UI[lang];
const trC=c=>lang==="uz"?c:((T.C[c]||[])[LI()]||c);
const trI=n=>{if(lang==="uz")return n;const v=T.I[n]||T.I[norm(n)];return v?v[LI()]:n};
const trS=s=>lang==="uz"?s:((T.S[s]||[])[LI()]||s);
const trW=w=>lang==="uz"?w:((T.W[w]||[])[LI()]||w);
const UNIT={ta:["шт.",["pc","pcs"]],dona:["шт.",["pc","pcs"]],g:["г","g"],kg:["кг","kg"],ml:["мл","ml"],l:["л","l"],sm:["см","cm"],m:["м","m"],
 "osh qoshiq":["ст. л.","tbsp"],"choy qoshiq":["ч. л.","tsp"],stakan:["стак.",["cup","cups"]],"bo'lak":["кус.",["piece","pieces"]],varaq:["лист.",["sheet","sheets"]],
 bosh:["гол.",["head","heads"]],dasta:["пуч.",["bunch","bunches"]],tilim:["ломт.",["slice","slices"]],tayoqcha:["палоч.",["stick","sticks"]],banka:["банк.",["can","cans"]],
 barg:["лист",["leaf","leaves"]],shox:["вет.",["sprig","sprigs"]],poya:["стеб.",["stalk","stalks"]],paket:["пакет",["packet","packets"]],baton:["батон",["loaf","loaves"]],qatlam:["пласт",["sheet","sheets"]],espresso:["эспрессо","espresso"],
 "porsiya espresso":["порц. эспрессо","shot espresso"],"bir dasta":["1 пучок","1 bunch"],"dasta ukrop":["пучок укропа","bunch of dill"],chimdim:["щепотка","pinch"],
 "bir oz":["немного","a little"],ozgina:["немного","a little"],"sepish uchun":["для посыпки","for sprinkling"],dasturxonga:["для подачи","to serve"],"ta'bga":["по вкусу","to taste"],
 "po'stlog'i":["цедра","zest"],quruq:["сухой","dry"],kashnich:["кинза","coriander"],petrushka:["петрушка","parsley"],"kashnich, petrushka":["кинза, петрушка","coriander, parsley"]};
function trQ(q){if(lang==="uz"||!q)return q;
  const m=q.match(/^([\d.,\/–\-½¼¾]+)?\s*([^()]*?)\s*(?:\((.*)\))?$/);if(!m)return q;
  const num=m[1]||"",u=m[2],p=m[3];let us=u;
  if(u){const e=UNIT[u];if(e){let v=e[LI()];if(Array.isArray(v))v=(num&&/^1$/.test(num))?v[0]:v[1];us=v}else us=trW(u)}
  const n=lang==="ru"?num.replace(".",","):num;
  return [n,us].filter(Boolean).join(" ")+(p?` (${p.split(", ").map(trW).join(", ")})`:"")}

/* ---------- data ---------- */
const slug=s=>norm(s).replace(/'/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const MEALMAP={n:"nonushta",t:"tushlik",k:"kechki",s:"shirinlik",i:"ichimlik"};
const ALL=[];const used=new Set();
const OLDREG={"O'zbekiston":"MDH","Qozog'iston":"MDH","Qirg'iziston":"MDH","Tojikiston":"MDH","Turkmaniston":"MDH","Rossiya":"MDH","Ukraina":"MDH","Belarus":"MDH","Ozarbayjon":"MDH","Gruziya":"MDH","Armaniston":"MDH","Moldova":"MDH","Turkiya":"Yaqin Sharq","Arab davlatlari":"Yaqin Sharq","Xitoy":"Osiyo","Koreya":"Osiyo","Yaponiya":"Osiyo","Hindiston":"Osiyo","Italiya":"Yevropa","Fransiya":"Yevropa","Ispaniya":"Yevropa","Germaniya":"Yevropa","Gretsiya":"Yevropa","Meksika":"Amerika","AQSh":"Amerika"};
const REGIONS=["MDH","Avtonomiyalar","Yevropa","Osiyo","Yaqin Sharq","Afrika","Amerika","Okeaniya"];
const REGION={};DB.list.forEach(([c,,,r])=>REGION[c]=OLDREG[c]||r||"Osiyo");
DB.list.sort((a,b)=>REGIONS.indexOf(REGION[a[0]])-REGIONS.indexOf(REGION[b[0]]));
for(const [country,flag,list] of DB.list){
  for(const r of list){
    let id=slug(r[0]);if(used.has(id))id=slug(country).slice(0,3)+"-"+id;used.add(id);
    const nm=T.N[country+"|"+r[0]]||[];
    ALL.push({id,name:r[0],nru:nm[0]||"",nen:nm[1]||"",q:r[1],meals:[...r[2]].map(c=>MEALMAP[c]),type:r[3]==="s"?"suyuq":"quyuq",time:r[4],wiki:r[5],
      ing:r[6].split(";").map(x=>{const opt=x.startsWith("?");const [n,...q]=(opt?x.slice(1):x).split(":");return [n.trim(),q.join(":").trim(),opt?1:0]}),
      steps:r[7].split("|"),country,flag});
  }
}
const BYID=new Map(ALL.map(d=>[d.id,d]));
const dn=d=>lang==="ru"&&d.nru?d.nru:lang==="en"&&d.nen?d.nen:d.name;
const FLAG={};DB.list.forEach(([c,f])=>FLAG[c]=f);
const COUNTRIES=DB.list.map(x=>x[0]);
const CNT={};ALL.forEach(d=>CNT[d.country]=(CNT[d.country]||0)+1);
const isCountry=c=>COUNTRIES.includes(c);
const MEALS=["nonushta","tushlik","kechki","shirinlik","ichimlik"];
const MEAL_IC={"":"✨",nonushta:"🍳",tushlik:"🍲",kechki:"🌙",shirinlik:"🍰",ichimlik:"🥤"};
const STAPLE=new Set(["tuz","suv","yog'","murch","qora murch"]);
const SYN={"go'sht":["gosht","gusht","mol go'shti","qo'y go'shti","mol","qo'y","мясо","говядина","баранина","ot go'shti","meat","beef","lamb"],"tovuq":["kurinka","курица","tovuq go'shti","chicken"],"kartoshka":["kartofel","картошка","картофель","potato","potatoes"],"piyoz":["лук","onion"],"sabzi":["морковь","morkov","carrot"],"pomidor":["помидор","томат","tomat","tomato"],"tuxum":["яйцо","яйца","tuhum","egg","eggs"],"guruch":["рис","ris","rice"],"un":["мука","flour"],"sut":["молоко","milk"],"qatiq":["kefir","yogurt","кефир","йогурт"],"sariyog'":["сливочное масло","maslo","butter"],"pishloq":["сыр","brinza","syr","mozzarella","parmezan","cheese"],"qiyma":["фарш","farsh","mince"],"bodring":["огурец","cucumber"],"karam":["капуста","cabbage"],"sarimsoq":["чеснок","garlic"],"shakar":["сахар","sugar"],"non":["хлеб","xleb","bread"],"lapsha":["лапша","noodle","noodles"],"makaron":["макароны","spagetti","vermishel","pasta"],"ko'kat":["ukrop","petrushka","kashnich","shivit","зелень","укроп","herbs"],"smetana":["сметана","sour cream"],"tvorog":["творог","suzma","paneer"],"qaymoq":["сливки","slivki","cream"],"limon":["лимон","lemon"],"olma":["яблоко","apple"],"choy":["чай","tea"],"baliq":["рыба","fish"],"yasmiq":["чечевица","lentils"],"no'xat":["нут","noxat","chickpeas"],"loviya":["фасоль","beans"],"baqlajon":["баклажан","eggplant"],"bolgar qalampir":["болгарский перец","qalampir","bell pepper"],"kolbasa":["колбаса","sosiska","vetchina","sausage"]};
const ALIAS=new Map();for(const[k,vs]of Object.entries(SYN)){ALIAS.set(norm(k),norm(k));vs.forEach(v=>ALIAS.set(norm(v),norm(k)))}
const base=s=>norm(s).replace(/\s*\(.*\)$/,"");
const canon0=s=>ALIAS.get(base(s))||base(s);
for(const [uz,[r,e]] of Object.entries(T.I)){const c=canon0(uz);[r,e].forEach(x=>{const k=base(x);if(k&&!ALIAS.has(k))ALIAS.set(k,c)})}
const canon=canon0;
const ALSO={"qiyma":["go'sht"],"go'sht":["qiyma"],"lapsha":["makaron"],"makaron":["lapsha"],"lavash":["non","tortilla"],"tortilla":["lavash"],"non":["lavash"],"ko'k piyoz":["ko'kat"],"yer yong'oq":["yong'oq"],"qaymoq":["smetana"],"smetana":["qaymoq","qatiq"],"kunjut pastasi":["kunjut"],"sosiska":["kolbasa"],"jigar":["go'sht"],"ismaloq":["ko'kat"]};
const VOCAB=[...new Set([...ALL.flatMap(d=>d.ing.map(i=>canon(i[0]))).filter(x=>!STAPLE.has(x)),...Object.keys(SYN).map(norm)])].sort((a,b)=>a.localeCompare(b));

/* ---------- state ---------- */
let pantry=store.get("pantry",[]);
let fR=store.get("fR",""),fC=store.get("fC",""),fM=store.get("fM",""),fT=store.get("fT",""),seg="auto",limit=48;
if(fC&&!isCountry(fC))fC="";if(fR&&!REGIONS.includes(fR))fR="";

function has(name){const c=canon(name);return pantry.includes(c)||(ALSO[c]||[]).some(a=>pantry.includes(a))}
function match(d){const need=d.ing.filter(i=>!i[2]&&!STAPLE.has(canon(i[0])));const miss=need.filter(i=>!has(i[0])).map(i=>trI(base(i[0])));return {need:need.length,have:need.length-miss.length,miss}}
function fmtTime(m){const u=t();if(m>=1440)return Math.round(m/1440)+" "+u.day;const h=Math.floor(m/60),r=m%60;return h?(r?`${h} ${u.hr} ${r} ${u.min}`:`${h} ${u.hr}`):`${r} ${u.min}`}
const PAL={quyuq:["#f0a53a","#c4572b"],suyuq:["#3a9a77","#1f5f6b"],shirin:["#e07a9a","#a43d64"],ichim:["#5a9be0","#2b5c9a"]};
const kind=d=>d.meals.includes("ichimlik")?"ichim":d.meals.includes("shirinlik")?"shirin":d.type;
function tile(d){const p=PAL[kind(d)];return `<div class="tile" style="--c1:${p[0]};--c2:${p[1]}"><span class="fl">${d.flag}</span><b>${esc(dn(d))}</b><i>${t()[d.type]} · ${fmtTime(d.time)}</i></div>`}

/* ---------- photos: checked in advance (tools/photos.mjs), each photo belongs to one dish only ---------- */
const PH=window.PH||{};
const fileUrl=(f,w)=>"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(f)+"?width="+(w||640);
const memo={};
function photosFor(d){if(memo[d.id])return memo[d.id];const l=(PH[d.country+"|"+d.name]||[]).map(f=>fileUrl(f));return memo[d.id]=Promise.resolve(l)}
const io=("IntersectionObserver" in window)?new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);fillCover(e.target)})},{rootMargin:"300px"}):null;
function fillCover(el){const d=BYID.get(el.dataset.cid);if(!d)return;
  photosFor(d).then(ph=>{if(!el.isConnected)return;const ld=el.querySelector(".ld");if(!ph.length){if(ld)ld.outerHTML=tile(d);return}
    const img=new Image();img.alt=dn(d);img.loading="lazy";img.onload=()=>{ld&&ld.remove()};img.onerror=()=>{img.remove();ld&&(ld.outerHTML=tile(d))};img.src=ph[0];el.prepend(img)})}

/* ---------- static text ---------- */
function renderStatic(){const u=t();
  document.documentElement.lang=lang;document.title=u.title;
  const md=document.querySelector('meta[name="description"]');md&&md.setAttribute("content",u.desc);
  $("#h1").textContent=u.title;
  $("#stat").textContent=u.stat(ALL.length,COUNTRIES.filter(c=>c!=="Arab davlatlari"&&REGION[c]!=="Avtonomiyalar").length,COUNTRIES.filter(c=>REGION[c]==="Avtonomiyalar").length);
  $("#q1").textContent=u.q1;$("#q2").textContent=u.q2;$("#q3").textContent=u.q3;$("#q4").textContent=u.q4;
  $("#q").placeholder=u.ph;$("#q").setAttribute("aria-label",u.q4);$("#add").textContent=u.add;$("#clr").textContent=u.clear;$("#note").textContent=u.note;
  $("#foot").textContent=u.foot;$("#pkTitle").textContent=u.q1;$("#pkSearch").placeholder=u.search;$("#pkClose").setAttribute("aria-label",u.close);
  document.querySelectorAll("#lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===lang));
}

/* ---------- filters ---------- */
function countryLabel(){const u=t();if(fC)return `<span class="fx">${FLAG[fC]}</span><span>${esc(trC(fC))}</span>`;if(fR)return `<span class="fx">🧭</span><span>${esc(u.regions[fR])}</span>`;return `<span class="fx">🌍</span><span>${esc(u.world)}</span>`}
function renderFilters(){const u=t();
  const n=ALL.filter(d=>(!fR||REGION[d.country]===fR)&&(!fC||d.country===fC)).length;
  $("#pickC").innerHTML=`${countryLabel()}<small>${u.dishes(n)}</small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
  $("#fM").innerHTML=[["",u.anyMeal],...MEALS.map(m=>[m,u.meals[m]])].map(([v,l])=>`<button class="chip" data-m="${v}" aria-pressed="${fM===v}"><span aria-hidden="true">${MEAL_IC[v]}</span>${esc(l)}</button>`).join("");
  $("#fT").innerHTML=[["",u.anyType,"⚖️"],["quyuq",u.quyuq,"🍛"],["suyuq",u.suyuq,"🍜"]].map(([v,l,ic])=>`<button data-t="${v}" aria-pressed="${fT===v}"><span aria-hidden="true">${ic}</span>${esc(l)}</button>`).join("");
  renderMini();
}
function renderMini(){const u=t();const parts=[fC?`${FLAG[fC]} ${esc(trC(fC))}`:fR?`🧭 ${esc(u.regions[fR])}`:`🌍 ${esc(u.world)}`];
  if(fM)parts.push(`${MEAL_IC[fM]} ${esc(u.meals[fM])}`);if(fT)parts.push(esc(u[fT]));if(pantry.length)parts.push(`🧺 ${pantry.length}`);
  $("#mini").innerHTML=`<span class="mp">${parts.map(p=>`<span>${p}</span>`).join("")}</span><b>${esc(u.change)}</b>`}

/* country picker */
let pkR="";
function renderPicker(){const u=t();const q=norm($("#pkSearch").value);
  $("#pkTabs").innerHTML=[["",u.world],...REGIONS.map(r=>[r,u.regions[r]])].map(([v,l])=>`<button class="chip sm" data-pr="${v}" aria-pressed="${pkR===v}">${esc(l)}</button>`).join("");
  let list=COUNTRIES.filter(c=>(!pkR||REGION[c]===pkR));
  if(q)list=COUNTRIES.filter(c=>[c,...(T.C[c]||[])].some(x=>norm(x).includes(q)));
  list=list.slice().sort((a,b)=>(b==="O'zbekiston")-(a==="O'zbekiston")||trC(a).localeCompare(trC(b),lang));
  const top=q?"":`<button class="pc all" data-pc="" data-prr="${pkR}" aria-pressed="${!fC&&fR===pkR}"><span class="fx">${pkR?"🧭":"🌍"}</span><span class="pn">${esc(pkR?u.allOf(u.regions[pkR]):u.world)}</span><small>${pkR?ALL.filter(d=>REGION[d.country]===pkR).length:ALL.length}</small></button>`;
  $("#pkList").innerHTML=top+list.map(c=>`<button class="pc" data-pc="${esc(c)}" aria-pressed="${fC===c}"><span class="fx">${FLAG[c]}</span><span class="pn">${esc(trC(c))}</span><small>${CNT[c]}</small></button>`).join("")||`<div class="empty">${esc(u.none)}</div>`;
}
function openPicker(){pkR=fC?REGION[fC]:fR;$("#pkSearch").value="";renderPicker();$("#pov").hidden=false;$("#picker").hidden=false;
  requestAnimationFrame(()=>{$("#pov").classList.add("on");$("#picker").classList.add("on")});document.body.style.overflow="hidden";
  const sel=$("#pkList [aria-pressed=true]");sel&&sel.scrollIntoView({block:"center"})}
function closePicker(){$("#pov").classList.remove("on");$("#picker").classList.remove("on");if(!openId)document.body.style.overflow="";setTimeout(()=>{if(!$("#picker").classList.contains("on")){$("#pov").hidden=true;$("#picker").hidden=true}},300)}

/* ---------- pantry ---------- */
const QUICK=["tuxum","kartoshka","piyoz","sabzi","pomidor","go'sht","tovuq","qiyma","guruch","un","sut","qatiq","non","pishloq","lapsha","shakar","bodring","karam"];
function renderPantry(){const u=t();
  $("#mine").innerHTML=pantry.map(p=>`<span class="tag">${esc(trI(p))}<button data-rm="${esc(p)}" aria-label="${esc(trI(p))} — ${u.remove}">×</button></span>`).join("");
  $("#quick").innerHTML=QUICK.filter(q=>!pantry.includes(q)).map(q=>`<button class="q" data-qa="${esc(q)}">+ ${esc(trI(q))}</button>`).join("");
  $("#clr").hidden=!pantry.length;renderMini();
}
function addItems(raw){const items=raw.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean).map(canon);let n=0;items.forEach(i=>{if(!pantry.includes(i)){pantry.push(i);n++}});if(n){store.set("pantry",pantry);seg="auto";limit=48;renderPantry();renderResults()}}
let sugL=[],sugI=0;
function renderSug(){const q=norm($("#q").value.split(/[,;]/).pop());const box=$("#sug");if(!q){box.hidden=true;return}
  const lab=v=>norm(trI(v));
  const viaAlias=[...ALIAS.entries()].filter(([a])=>a.startsWith(q)).map(([,c])=>c);
  sugL=[...new Set([...VOCAB.filter(v=>lab(v).startsWith(q)||v.startsWith(q)),...viaAlias,...VOCAB.filter(v=>lab(v).includes(q))])].filter(v=>!pantry.includes(v)).slice(0,6);
  if(!sugL.length){box.hidden=true;return}sugI=Math.min(sugI,sugL.length-1);
  box.innerHTML=sugL.map((s,i)=>`<button data-sg="${esc(s)}" aria-selected="${i===sugI}">${esc(trI(s))}</button>`).join("");box.hidden=false}
function submit(){const v=$("#q").value;if(!v.trim())return;if(!/[,;]/.test(v)&&sugL.length&&!$("#sug").hidden&&!VOCAB.includes(canon(v)))addItems(sugL[sugI]);else addItems(v);$("#q").value="";$("#sug").hidden=true}

/* ---------- results ---------- */
function renderResults(){const u=t();
  let list=ALL.filter(d=>(!fR||REGION[d.country]===fR)&&(!fC||d.country===fC)&&(!fM||d.meals.includes(fM))&&(!fT||d.type===fT)).map(d=>({d,m:match(d)}));
  const P=pantry.length>0;
  if(P)list.sort((a,b)=>a.m.miss.length-b.m.miss.length||(b.m.have/(b.m.need||1))-(a.m.have/(a.m.need||1))||a.d.time-b.d.time);
  const now=list.filter(x=>!x.m.miss.length),near=list.filter(x=>x.m.miss.length>0&&x.m.miss.length<=2);
  let s=seg;if(s==="auto")s=!P?"all":now.length?"now":near.length?"near":"all";
  const sg=$("#seg");sg.hidden=!P;
  if(P)sg.innerHTML=[["now",u.now,now.length],["near",u.near,near.length],["all",u.all,null]].map(([k,l,n])=>`<button data-sg2="${k}" aria-pressed="${s===k}">${esc(l)}${n!=null?` <small>${n}</small>`:""}</button>`).join("");
  const shown=s==="now"?now:s==="near"?near:list;
  $("#rt").textContent=!P?(fC?`${FLAG[fC]} ${u.tOf(trC(fC))}`:fR?u.tOf(u.regions[fR]):u.tDef):s==="now"?u.tNow:s==="near"?u.tNear:u.tAll;
  $("#rc").textContent=u.cnt(shown.length);
  const g=$("#grid");
  if(!shown.length){g.innerHTML=`<div class="empty"><b>${esc(u.none)}</b>${esc(s==="now"?u.noneNow:u.noneF)}</div>`;$("#more").hidden=true;return}
  g.innerHTML=shown.slice(0,limit).map(({d,m})=>{
    const line=!P?`<div class="ml n">${u.ingN(m.need)}</div>`:!m.miss.length?`<div class="ml ok">${u.allHave}</div>`:`<div class="ml">${u.lack}: ${esc(m.miss.slice(0,3).join(", "))}${m.miss.length>3?` +${m.miss.length-3}`:""}</div>`;
    return `<button class="card" data-open="${d.id}"><div class="cover" data-cid="${d.id}"><div class="ld"></div>${P?`<span class="badge ${m.miss.length?"":"ok"}">${m.have}/${m.need}</span>`:""}<span class="cflag" aria-hidden="true">${d.flag}</span></div>
      <div class="cb"><h3>${esc(dn(d))}</h3><div class="cm">${esc(trC(d.country))} · ${fmtTime(d.time)}</div>${line}</div></button>`}).join("");
  g.querySelectorAll(".cover").forEach(el=>io?io.observe(el):fillCover(el));
  const mb=$("#more");mb.hidden=shown.length<=limit;mb.textContent=u.more(shown.length-limit);
}
function renderAll(){renderStatic();renderFilters();renderPantry();renderResults();if(openId)openDish(openId,true)}

/* ---------- detail ---------- */
let openId=null;const timers={};
const ytIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.7 15.1V8.9L15.5 12z"/></svg>';
function ytQuery(d){if(lang==="en"&&d.nen)return d.nen.replace(/\s*\(.*\)$/,"")+" recipe";if(lang==="ru"&&d.nru)return d.nru.replace(/\s*\(.*\)$/,"")+" рецепт";
  return /[а-яё]/i.test(d.q)&&!/рецепт/i.test(d.q)?d.q+" рецепт":d.q}
function openDish(id,keep){
  const d=BYID.get(id);if(!d)return;openId=id;const m=match(d);const u=t();
  const ing=d.ing.map(([n,q,o])=>{const st=STAPLE.has(canon(n)),ok=st||has(n);const cls=st?"base":ok?"have":o?"opt":"lack";
    return `<li class="${cls}"><span class="st">${ok?"✓":o?"–":"✕"}</span><span class="nm">${esc(trI(n))}${o?`<em>${u.opt}</em>`:""}</span><span class="qt">${esc(trQ(q))}</span></li>`}).join("");
  const steps=d.steps.map((s,i)=>{const tm=(s.match(/(\d+)\s*daqiqa/)||[])[1];const k=id+":"+i;
    return `<li><button class="n" data-dn="${i}" aria-label="${u.stepDone(i+1)}">${i+1}</button><div class="tx">${esc(trS(s))}${tm?`<div><button class="tm" data-tm="${k}" data-min="${tm}">⏱ <span>${u.timer(tm)}</span></button></div>`:""}</div></li>`}).join("");
  const sc=$("#sheet .sc"),y=keep&&sc?sc.scrollTop:0;
  $("#sheet").innerHTML=`<div class="sc">
    <div class="gal"><span class="grab"></span><button class="close" id="cls" aria-label="${u.close}">×</button>
      <div class="track" id="track"><div class="slide"><div class="ld cover" style="position:absolute;inset:0"></div></div></div><div class="dots" id="dots"></div></div>
    <div class="credit" id="credit"></div>
    <div class="sb">
      <div><h2>${esc(dn(d))}</h2>${lang!=="uz"?`<div class="alt">${esc(d.name)}</div>`:""}<div class="sub">${d.flag} ${esc(trC(d.country))} · ${fmtTime(d.time)}</div>
        <div class="pills">${d.meals.map(x=>`<span class="pill">${MEAL_IC[x]} ${u.meals[x]}</span>`).join("")}<span class="pill g">${u[d.type]}</span></div></div>
      <div class="acts"><a class="yt" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery(d))}" target="_blank" rel="noopener">${ytIcon}${u.video}</a></div>
      <section><div class="sh"><h3>${u.ings}</h3><span>${pantry.length?u.have(m.have,m.need):u.cnt(d.ing.length)}</span></div><ul class="ings">${ing}</ul>
        ${pantry.length?(m.miss.length?`<div class="miss">${u.lack}: ${esc(m.miss.join(", "))}</div>`:`<div class="miss ok">${u.allOk}</div>`):""}</section>
      <section><div class="sh"><h3>${u.cook}</h3><span>${u.steps(d.steps.length)}</span></div><ol class="steps">${steps}</ol></section>
    </div></div>`;
  Object.keys(timers).forEach(updTm);
  if(y)$("#sheet .sc").scrollTop=y;
  photosFor(d).then(ph=>{if(openId!==id)return;const tr=$("#track");if(!tr)return;
    if(!ph.length){tr.innerHTML=`<div class="slide">${tile(d)}</div>`;return}
    tr.innerHTML=ph.map(s=>`<div class="slide"><img src="${s.replace("width=640","width=1000")}" alt="${esc(dn(d))}"></div>`).join("");
    $("#credit").textContent=u.photos;
    if(ph.length>1){$("#dots").innerHTML=ph.map((_,i)=>`<button data-dot="${i}" aria-label="${u.photoN(i+1)}" aria-current="${i===0}"></button>`).join("");
      tr.addEventListener("scroll",()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);document.querySelectorAll("#dots button").forEach((b,j)=>b.setAttribute("aria-current",i===j))},{passive:true})}
    tr.querySelectorAll("img").forEach(im=>im.onerror=()=>{const s=im.parentNode;s.remove();if(!tr.children.length)tr.innerHTML=`<div class="slide">${tile(d)}</div>`});
  });
  if(keep)return;
  $("#ov").hidden=false;$("#sheet").hidden=false;requestAnimationFrame(()=>{$("#ov").classList.add("on");$("#sheet").classList.add("on")});
  document.body.style.overflow="hidden";try{history.replaceState(null,"","#"+id)}catch(e){}
}
function closeDish(){$("#ov").classList.remove("on");$("#sheet").classList.remove("on");document.body.style.overflow="";openId=null;
  setTimeout(()=>{if(!openId){$("#ov").hidden=true;$("#sheet").hidden=true}},320);try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(x=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;o.connect(g);g.connect(a.destination);g.gain.value=.2;o.start(a.currentTime+x);o.stop(a.currentTime+x+.25)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([250,120,250])}catch(e){}}
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function updTm(k){const b=document.querySelector(`[data-tm="${k}"]`);if(!b)return;const tm=timers[k];b.className="tm"+(tm?(tm.left<=0?" end":" run"):"");b.querySelector("span").textContent=tm?(tm.left<=0?t().ready:fmt(tm.left)):t().timer(b.dataset.min)}
function toggleTm(k,min){if(timers[k]){clearInterval(timers[k].iv);delete timers[k];updTm(k);return}
  const tm={end:Date.now()+min*60000,left:min*60};tm.iv=setInterval(()=>{tm.left=Math.max(0,Math.round((tm.end-Date.now())/1000));updTm(k);if(!tm.left){clearInterval(tm.iv);beep();toast(t().timeUp)}},500);timers[k]=tm;updTm(k)}
let tt;function toast(m){const el=$("#toast");el.textContent=m;el.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>el.classList.remove("on"),2200)}

/* ---------- events ---------- */
const resetList=()=>{seg="auto";limit=48};
$("#q").addEventListener("input",()=>{sugI=0;const v=$("#q").value;if(/[,;]\s*$/.test(v)){addItems(v);$("#q").value="";$("#sug").hidden=true;return}renderSug()});
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();submit()}else if(e.key==="ArrowDown"&&sugL.length){e.preventDefault();sugI=(sugI+1)%sugL.length;renderSug()}else if(e.key==="ArrowUp"&&sugL.length){e.preventDefault();sugI=(sugI-1+sugL.length)%sugL.length;renderSug()}else if(e.key==="Escape")$("#sug").hidden=true});
$("#add").addEventListener("click",submit);
$("#pkSearch").addEventListener("input",renderPicker);
$("#more").addEventListener("click",()=>{limit+=48;renderResults()});
document.addEventListener("click",e=>{
  if(!e.target.closest(".field"))$("#sug").hidden=true;
  if(e.target.id==="ov"){closeDish();return}
  if(e.target.id==="pov"){closePicker();return}
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.lang){if(lang!==d.lang){lang=d.lang;store.set("lang",lang);renderAll();window.dispatchEvent(new Event("np-lang"));if(!$("#picker").hidden)renderPicker()}}
  else if(b.id==="pickC")openPicker();
  else if(b.id==="pkClose")closePicker();
  else if(d.pr!==undefined){pkR=d.pr;$("#pkSearch").value="";renderPicker();$("#pkList").scrollTop=0}
  else if(d.pc!==undefined){if(d.pc){fC=d.pc;fR=""}else{fC="";fR=d.prr||""}store.set("fC",fC);store.set("fR",fR);resetList();closePicker();renderFilters();renderResults()}
  else if(d.m!==undefined){fM=d.m;store.set("fM",fM);resetList();renderFilters();renderResults()}
  else if(d.t!==undefined){fT=d.t;store.set("fT",fT);resetList();renderFilters();renderResults()}
  else if(b.id==="mini")$("#qs").scrollIntoView({behavior:"smooth",block:"start"});
  else if(d.qa)addItems(d.qa);
  else if(d.rm){pantry=pantry.filter(x=>x!==d.rm);store.set("pantry",pantry);resetList();renderPantry();renderResults()}
  else if(d.sg){addItems(d.sg);$("#q").value="";$("#sug").hidden=true;$("#q").focus()}
  else if(d.sg2){seg=d.sg2;limit=48;renderResults()}
  else if(d.open)openDish(d.open);
  else if(d.dot){const tr=$("#track");tr.scrollTo({left:+d.dot*tr.clientWidth,behavior:"smooth"})}
  else if(d.dn!==undefined){const li=b.closest("li");li.classList.toggle("done");b.textContent=li.classList.contains("done")?"✓":(+d.dn+1)}
  else if(d.tm)toggleTm(d.tm,+d.min);
  else if(b.id==="cls")closeDish();
  else if(b.id==="clr"){pantry=[];store.set("pantry",pantry);resetList();renderPantry();renderResults()}
});
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(!$("#picker").hidden)closePicker();else if(openId)closeDish()});
function swipe(sh,inner,close){let y0=null;sh.addEventListener("touchstart",e=>{const sc=sh.querySelector(inner);y0=sc&&sc.scrollTop>0?null:e.touches[0].clientY},{passive:true});
 sh.addEventListener("touchmove",e=>{if(y0==null)return;const dy=e.touches[0].clientY-y0;if(dy>0){sh.style.transition="none";sh.style.transform=`translateY(${dy}px)`}},{passive:true});
 sh.addEventListener("touchend",e=>{if(y0==null)return;const dy=e.changedTouches[0].clientY-y0;sh.style.transition="";sh.style.transform="";if(dy>110)close();y0=null})}
swipe($("#sheet"),".sc",closeDish);swipe($("#picker"),"#pkList",closePicker);
if("IntersectionObserver" in window){new IntersectionObserver(([e])=>{$("#mini").classList.toggle("on",!e.isIntersecting&&e.boundingClientRect.top<0)}).observe($("#qs"))}
window.addEventListener("hashchange",()=>{const h=location.hash.slice(1);if(h&&BYID.has(h)){if(openId!==h)openDish(h)}else if(openId)closeDish()});
renderAll();
const h0=location.hash.slice(1);if(h0&&BYID.has(h0))openDish(h0);
};
