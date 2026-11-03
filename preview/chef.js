/* AI oshpaz: animatsion oshpaz bilan doimiy suhbat.
   1) Retsept qidirish (masalliqlar, davlat, vaqt, sho'rva/quyuq, taom nomi) — ilovaning o'zida, AI'siz, darhol.
   2) Ovqatga oid boshqa savollar — AI (ai-config.js: o'z server yoki Puter.js). */
(function(){
"use strict";
function boot(){
if(boot.done||!window.NP)return;boot.done=true;
const NP=window.NP,$=s=>document.querySelector(s),esc=NP.esc,N=NP.norm;
const CFG=window.AI_CONFIG||{endpoint:"",models:[]};

/* ---------------- texts ---------------- */
const L={
 uz:{name:"Oshpaz AI",online:"onlayn · har doim shu yerda",typing:"yozmoqda…",thinking:"o'ylayapti…",
  hero:"Assalomu alaykum! Men AI oshpazman. Uyingizda nima borligini, nima yemoqchiligingizni yoki ovqat haqidagi istalgan savolingizni yozing — birga topamiz.",
  ask:"Masalan: tuxum va kartoshkam bor, tez nima qilsam bo'ladi?",go:"So'rash",fab:"AI oshpaz",ph:"Oshpazga yozing…",
  tip:"Nima pishirishni bilmayapsizmi? Menga yozing! 👨‍🍳",
  greet:"Salom! Bugun nima pishiramiz? 😊 Uyingizda qanday masalliqlar borligini yoki qaysi taomni xohlayotganingizni yozing.",
  back:"Yana xush kelibsiz! Davom etamizmi? Nima pishirmoqchisiz?",
  cleared:"Yangi suhbat boshlandi. Qanday yordam beray?",
  sug:["Tuxum, kartoshka, piyozim bor","Tez tayyorlanadigan nonushta","Mazali sho'rva tavsiya qil","Palov qanday damlanadi?","Go'shtsiz kechki ovqat","Italyancha taom"],
  found:x=>`Sizda ${x} bor ekan. Mana shulardan pishsa bo'ladigan taomlar:`,
  foundF:x=>`Mana ${x} taomlar:`,foundAny:"Mana sizga bir nechta taklif:",
  none:"Afsuski, bunday taom topilmadi 😔 Boshqacha so'rab ko'ring yoki uyingizdagi masalliqlarni yozing.",
  recipe:x=>`${x} — ajoyib tanlov! Bosib, masalliqlar va tayyorlash qadamlarini ko'ring:`,recipeN:"Shu nomli bir nechta taom bor:",
  more:"Yana ko'rsat",noMore:"Boshqa mos taom qolmadi. Boshqa masalliq yoki davlatni sinab ko'ring.",
  askIngs:"Uyingizda qanday masalliqlar bor? Yozing — mos taomlarni topaman.",
  aiOff:"Bu savolga to'liq javob berishim uchun AI rejimini bir marta yoqing. Bepul Puter akkauntiga kirish so'raladi (yangi akkauntlarga bepul limit beriladi).",
  aiBtn:"✨ AI'ni yoqish",aiOk:"AI yoqildi! Endi istalgan savolingizni bering.",
  aiFail:"AI hozir javob bera olmadi 😔 Internetni tekshirib, qayta urinib ko'ring. Retsept qidirishda baribir yordam beraman!",
  thanks:"Arzimaydi! Yana savol bo'lsa — shu yerdaman. Yoqimli ishtaha! 😊",
  newChat:"Yangi suhbat",close:"Yopish",mic:"Ovoz bilan yozish",send:"Yuborish",listening:"Eshityapman…",
  meals:{nonushta:"nonushtaga",tushlik:"tushlikka",kechki:"kechki ovqatga",shirinlik:"shirinlik",ichimlik:"ichimlik"},
  types:{suyuq:"suyuq",quyuq:"quyuq"},upTo:m=>`${m} daqiqagacha`,without:x=>`${x}siz`,
  chips:{more:"Yana ko'rsat",veg:"Go'shtsiz",fast:"Tezroq",soup:"Sho'rva",sweet:"Shirinlik"},
  sys:"Uzbek (Latin script)"},
 ru:{name:"Повар AI",online:"онлайн · всегда рядом",typing:"печатает…",thinking:"думает…",
  hero:"Здравствуйте! Я AI-повар. Напишите, что у вас есть дома, что хотите поесть, или задайте любой вопрос о еде — найдём вместе.",
  ask:"Например: есть яйца и картошка, что быстро приготовить?",go:"Спросить",fab:"AI-повар",ph:"Напишите повару…",
  tip:"Не знаете, что приготовить? Напишите мне! 👨‍🍳",
  greet:"Привет! Что сегодня приготовим? 😊 Напишите, какие продукты есть дома или какое блюдо хотите.",
  back:"С возвращением! Продолжим? Что хотите приготовить?",
  cleared:"Новый разговор. Чем помочь?",
  sug:["Есть яйца, картошка и лук","Быстрый завтрак","Посоветуй вкусный суп","Как приготовить плов?","Ужин без мяса","Итальянское блюдо"],
  found:x=>`У вас есть ${x}. Вот что из этого можно приготовить:`,
  foundF:x=>`Вот блюда: ${x}`,foundAny:"Вот несколько идей:",
  none:"К сожалению, ничего не нашлось 😔 Спросите по-другому или напишите, какие продукты есть дома.",
  recipe:x=>`${x} — отличный выбор! Нажмите, чтобы увидеть ингредиенты и шаги:`,recipeN:"Есть несколько блюд с таким названием:",
  more:"Показать ещё",noMore:"Больше подходящих блюд нет. Попробуйте другие продукты или страну.",
  askIngs:"Какие продукты есть дома? Напишите — подберу блюда.",
  aiOff:"Чтобы ответить на такой вопрос, включите AI-режим один раз. Нужно войти в бесплатный аккаунт Puter (новым аккаунтам даётся бесплатный лимит).",
  aiBtn:"✨ Включить AI",aiOk:"AI включён! Задавайте любые вопросы.",
  aiFail:"AI сейчас не ответил 😔 Проверьте интернет и попробуйте ещё раз. С поиском рецептов я всё равно помогу!",
  thanks:"Пожалуйста! Если будут вопросы — я здесь. Приятного аппетита! 😊",
  newChat:"Новый разговор",close:"Закрыть",mic:"Голосовой ввод",send:"Отправить",listening:"Слушаю…",
  meals:{nonushta:"на завтрак",tushlik:"на обед",kechki:"на ужин",shirinlik:"десерты",ichimlik:"напитки"},
  types:{suyuq:"жидкие",quyuq:"густые"},upTo:m=>`до ${m} мин`,without:x=>`без: ${x}`,
  chips:{more:"Показать ещё",veg:"Без мяса",fast:"Побыстрее",soup:"Суп",sweet:"Десерт"},
  sys:"Russian"},
 en:{name:"Chef AI",online:"online · always here",typing:"typing…",thinking:"thinking…",
  hero:"Hello! I'm your AI chef. Tell me what you have at home, what you feel like eating, or ask me anything about food — we'll figure it out together.",
  ask:"e.g. I have eggs and potatoes, what can I make quickly?",go:"Ask",fab:"AI chef",ph:"Message the chef…",
  tip:"Not sure what to cook? Ask me! 👨‍🍳",
  greet:"Hi! What are we cooking today? 😊 Tell me what's in your kitchen or which dish you'd like.",
  back:"Welcome back! Shall we carry on? What would you like to cook?",
  cleared:"New chat started. How can I help?",
  sug:["I have eggs, potatoes and onion","Quick breakfast","Suggest a tasty soup","How do I cook plov?","Dinner without meat","Something Italian"],
  found:x=>`You have ${x}. Here's what you can make:`,
  foundF:x=>`Here are dishes: ${x}`,foundAny:"Here are a few ideas:",
  none:"Sorry, nothing matched 😔 Try asking differently or tell me what ingredients you have.",
  recipe:x=>`${x} — great choice! Tap to see the ingredients and steps:`,recipeN:"There are several dishes with that name:",
  more:"Show more",noMore:"No more matching dishes. Try other ingredients or another country.",
  askIngs:"What ingredients do you have? Tell me and I'll find dishes.",
  aiOff:"To answer this fully, switch on AI mode once. It asks you to sign in to a free Puter account (new accounts get free credits).",
  aiBtn:"✨ Turn on AI",aiOk:"AI is on! Ask me anything.",
  aiFail:"The AI couldn't answer right now 😔 Check your connection and try again. I can still help you find recipes!",
  thanks:"You're welcome! I'm here if you need anything. Enjoy your meal! 😊",
  newChat:"New chat",close:"Close",mic:"Voice input",send:"Send",listening:"Listening…",
  meals:{nonushta:"breakfast",tushlik:"lunch",kechki:"dinner",shirinlik:"desserts",ichimlik:"drinks"},
  types:{suyuq:"soupy",quyuq:"thick"},upTo:m=>`up to ${m} min`,without:x=>`without ${x}`,
  chips:{more:"Show more",veg:"No meat",fast:"Quicker",soup:"Soup",sweet:"Dessert"},
  sys:"English"}
};
const u=()=>L[NP.lang()]||L.uz;

/* ---------------- the chef (original SVG character) ---------------- */
function chefSVG(head){
  return `<svg class="chef" viewBox="${head?"21 24 78 78":"0 0 120 150"}" aria-hidden="true">
  <g class="c-all">
   <g class="c-body"><path d="M18 150c2-28 18-44 42-44s40 16 42 44z" fill="#fff" stroke="#e3d9c8" stroke-width="2"/>
    <path d="M60 110v40" stroke="#e3d9c8" stroke-width="2"/><circle cx="52" cy="124" r="2.4" fill="#d9c9ae"/><circle cx="52" cy="138" r="2.4" fill="#d9c9ae"/><circle cx="68" cy="124" r="2.4" fill="#d9c9ae"/><circle cx="68" cy="138" r="2.4" fill="#d9c9ae"/>
    <path d="M44 104l16 15 16-15z" fill="#d9472b"/><circle cx="60" cy="112" r="4" fill="#b8361d"/></g>
   <g class="c-hand"><path d="M100 132l9-46" stroke="#9a6b3f" stroke-width="4" stroke-linecap="round"/><path d="M101 84a10 7 0 1 0 17 4" fill="none" stroke="#9a6b3f" stroke-width="4" stroke-linecap="round"/><circle cx="99" cy="134" r="7" fill="#f2c39a"/></g>
   <g class="c-head">
    <circle cx="33" cy="74" r="6" fill="#ebb48a"/><circle cx="87" cy="74" r="6" fill="#ebb48a"/>
    <ellipse cx="60" cy="74" rx="27" ry="28" fill="#f5c9a0"/>
    <g class="c-hat"><path d="M33 47c-9-2-11-17-1-21 0-13 17-17 24-9 6-11 25-8 25 5 13 0 15 17 6 25z" fill="#fff" stroke="#e3d9c8" stroke-width="2"/><rect x="34" y="42" width="52" height="13" rx="5" fill="#fff" stroke="#e3d9c8" stroke-width="2"/><path d="M47 30c2-4 6-6 10-5M68 23c4 0 7 3 8 6" stroke="#ece4d6" stroke-width="2" fill="none" stroke-linecap="round"/></g>
    <ellipse cx="44" cy="83" rx="6" ry="3.6" fill="#f08f78" opacity=".45"/><ellipse cx="76" cy="83" rx="6" ry="3.6" fill="#f08f78" opacity=".45"/>
    <path class="c-brow" d="M44 63q5-4 10 0M66 63q5-4 10 0" stroke="#5a3a22" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <g class="c-eyes"><ellipse class="c-eye" cx="50" cy="71" rx="3.4" ry="4.3" fill="#2b1d12"/><ellipse class="c-eye" cx="70" cy="71" rx="3.4" ry="4.3" fill="#2b1d12"/><circle cx="51.2" cy="69.4" r="1.1" fill="#fff"/><circle cx="71.2" cy="69.4" r="1.1" fill="#fff"/></g>
    <ellipse cx="60" cy="80" rx="5" ry="4" fill="#e9a77c"/>
    <ellipse class="c-mouth" cx="60" cy="93" rx="5.5" ry="2.4" fill="#8a2f22"/>
    <path class="c-mus" d="M60 86c-6-5-17-4-21 4 7-2 13 2 21-1 8 3 14-1 21 1-4-8-15-9-21-4z" fill="#5a3a22"/>
   </g>
   <g class="c-think"><circle cx="98" cy="40" r="3"/><circle cx="105" cy="30" r="4"/><circle cx="114" cy="18" r="5.5"/></g>
  </g></svg>`}
const setMood=(m)=>document.querySelectorAll(".chef").forEach(c=>{c.classList.toggle("talk",m==="talk");c.classList.toggle("think",m==="think")});

/* ---------------- understanding the user (no AI needed) ---------------- */
const STAPLE=NP.STAPLE;
const MEATS=new Set(["go'sht","tovuq","qiyma","baliq","kolbasa","jigar","sosiska","mol go'shti","qo'y go'shti","cho'chqa go'shti","kurka","o'rdak","bekon","vetchina","krevetka","qisqichbaqa"].map(N));
const KEYS=[];
const NOTING=new Set(["ham","va","bor","kerak","men","bir","yana","juda","eng","oz","ko'p","tez","bu","shu"]);
{const seen=new Set();const add=(k,c)=>{k=N(k).replace(/\s*\(.*\)$/,"").trim();if(!k||k.length<2||seen.has(k)||NOTING.has(k))return;seen.add(k);KEYS.push([k,c])};
 for(const [k,c] of NP.ALIAS)add(k,c);NP.VOCAB.forEach(v=>add(v,v));
 KEYS.sort((a,b)=>b[0].length-a[0].length)}
const rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const UZSUF="(?:lar)?(?:im|imiz|ing|ingiz|i|si|m|miz)?(?:ni|ning|ga|da|dan|li|dek)?";
function keyRe(k){const e=rx(k);
  if(/[а-я]/.test(k)){const st=k.length>=5&&/[аяоеыиьйу]$/.test(k)?rx(k.slice(0,-1)):e;return new RegExp("(?:^|[\\s,-])("+st+"[а-я]{0,3})(?=$|[\\s,.!?-])")}
  if(k.length<=2)return new RegExp("(?:^|[\\s,-])("+e+")(?=$|[\\s,.!?-])");
  if(k.length===3)return new RegExp("(?:^|[\\s,-])("+e+"(?:lar)?(?:im|imiz|ing|m)?)(?=$|[\\s,.!?-])");
  return new RegExp("(?:^|[\\s,-])("+e+UZSUF+"(?:s|es)?(?:siz)?)(?=$|[\\s,.!?-])")}
const KRE=KEYS.map(([k,c])=>[k,c,keyRe(k)]);
const NEG=/(?:^|\s)(yo'q|yoq|emas|нет|без|no|not|without|don't|dont)(?=$|\s)/;
function findIngs(text){
  const has=[],without=[],words=[];
  const clauses=N(text).split(/[.;!?\n,]|\s(?:lekin|ammo|но|but)\s/);
  for(let cl of clauses){cl=" "+cl+" ";const neg=NEG.test(cl);
    for(const [k,c,re] of KRE){const m=cl.match(re);if(!m)continue;
      const w=m[1];words.push(w.trim());cl=cl.replace(m[1]," ".repeat(m[1].length));
      if(neg||/siz$/.test(w)&&!/siz$/.test(k))without.push(c);else has.push(c)}}
  return {has:[...new Set(has)],without:[...new Set(without)],words}}
// countries: stems of uz/ru/en names + common adjectives
const IRR={"O'zbekiston":["uzbek","узбек"],"Rossiya":["rus","русск","russian"],"Fransiya":["french","француз","fransuz"],"Germaniya":["nemis","немецк"],"Xitoy":["chinese","китайск"],"Yaponiya":["японск"],"Turkiya":["turk","турецк","turkish"],
 "Buyuk Britaniya":["ingliz","англий","english","british"],"AQSh":["amerika","american","американ","usa","сша"],"Arab davlatlari":["arab","араб"],"Ispaniya":["spanish","испанск"],"Gretsiya":["grek","greek","греческ"],
 "Hindiston":["hind","indian","индийск"],"Koreya":["koreys","korean","корейск"],"Italiya":["italyan","italian","итальян"],"Ukraina":["ukrain","украинск"],"Gruziya":["gruzin","грузинск","georgian"],"Armaniston":["arman","армянск","armenian"],
 "Ozarbayjon":["ozarbayjon","azerbaijan","азербайджан"],"Qozog'iston":["qozoq","kazakh","казахск"],"Qirg'iziston":["qirg'iz","kyrgyz","киргизск","кыргыз"],"Tojikiston":["tojik","tajik","таджикск"],"Turkmaniston":["turkman","turkmen","туркменск"],
 "Meksika":["mexican","мексиканск"],"Tatariston":["tatar","татарск"],"Shinjon":["uyg'ur","uyghur","уйгурск"],"Polsha":["polyak","polish","польск"],"Vyetnam":["vietnamese","вьетнамск"],"Tailand":["thai","тайск"],"Eron":["fors","persian","iranian","персидск","иранск"]};
const CK=[];
for(const c of NP.COUNTRIES){const names=[c,...(NP.T.C[c]||[])].filter(Boolean);const st=new Set();
  for(const nm of names){const n=N(nm).replace(/\s*\(.*\)$/,"");if(n.length<4)continue;st.add(n);
    if(!/\s/.test(n)&&n.length>5){const s2=n.replace(/(iston|istan|ston|stan|iya|ija|ия|ая|ия|ы|а|я|ia|y)$/,"");if(s2.length>=4)st.add(s2)}}
  (IRR[c]||[]).forEach(x=>st.add(N(x)));
  for(const s of st)CK.push([s,c])}
CK.sort((a,b)=>b[0].length-a[0].length);
function findCountries(text){const t=" "+N(text).replace(/[^a-zа-я'\s]/g," ")+" ";const out=[];let rest=t;
  for(const [s,c] of CK){const re=new RegExp("\\s"+rx(s)+(s.length<=5?"[a-zа-я']{0,4}":"[a-zа-я']{0,8}")+"(?=\\s)");const m=rest.match(re);
    if(m){out.push(c);rest=rest.replace(m[0]," ")}}
  return [...new Set(out)]}
const REGRE=[["MDH",/\b(mdh|снг|cis|sng)\b/],["Yevropa",/(yevropa|европ|europe)/],["Osiyo",/(osiyo|азиат|азии|asia)/],["Afrika",/(afrika|африк|africa)/],["Yaqin Sharq",/(yaqin sharq|ближн\S* восток|middle east)/],["Okeaniya",/(okeaniya|океани|oceania|pacific)/],["Amerika",/(lotin amerika|латин|latin america)/]];
const MEALRE=[["nonushta",/(nonushta|ertalab|завтрак|утр|breakfast|morning)/],["tushlik",/(tushlik|обед|lunch)/],["kechki",/(kechki|kechqurun|ужин|вечер|dinner|supper|evening)/],["shirinlik",/(shirinlik|desert|десерт|сладк|dessert|sweet|tort|торт|cake)/],["ichimlik",/(ichimlik|напит|drink|beverage|kokteyl|коктейл)/]];
const SOUP=/(suyuq|sho'?rva|shurva|\bsoup|\bсуп|жидк|бульон)/,THICK=/(quyuq|густ|thick)/;
const QUICK=/(\btez\b|tezda|tezroq|быстр|quick|fast|\beasy\b|oson|легк|просто)/;
const RECIPE=/(qanday (pishir|tayyorla|qilin|qil|dam)|retsept|resept|как (приготов|готов|сделать|варить|жарить)|рецепт|how (to|do i|do you|can i) (make|cook|prepare)|recipe)/;
const SUGGEST=/(nima (pishir|qil|ovqat|yesa|yeyish|tayyorla)|taklif|tavsiya|maslahat|что (приготов|поесть|сготов|съесть)|посовет|предлож|what (should|can|to)\b.*\b(cook|make|eat)|suggest|recommend|\bidea)/;
const MORE=/^(yana|boshqa|yana ko'rsat|ещ[её]|другие|more|another|show more|others?)\b/;
const GREET=/^(salom|assalom|ассалом|салом|привет|здравств|добр\S* (утро|день|вечер)|hello|hi|hey)\b/;
const THANKS=/(rahmat|raxmat|спасибо|благодар|thank)/;
const HAVE=/(\bbor\b|bor edi|bormi|\bqoldi|есть|у меня|осталось|\bhave\b|\bgot\b|left)/;
const VEG=/(go'shtsiz|gushtsiz|vegetarian|вегетариан|без мяса|meatless|no meat|vegan|веган)/;
// dish names
const DN=new Map();
const addDN=(k,id)=>{if(k.length<3)return;if(!DN.has(k))DN.set(k,[]);if(!DN.get(k).includes(id))DN.get(k).push(id)};
for(const d of NP.ALL)for(const n of [d.name,d.nru,d.nen]){if(!n)continue;const nn=N(n);addDN(nn.replace(/\s*\(.*\)$/,"").trim(),d.id);
  const br=(nn.match(/\(([^)]+)\)/)||[])[1];if(br&&br.length>=4&&!/(cha|ча|ский|ская|ian|ese|ish)$/.test(br)&&!/[.,]/.test(br))addDN(br.trim(),d.id)}
const DNK=[...DN.keys()].sort((a,b)=>b.length-a.length);
function findDishes(text,keys){const t=" "+N(text).replace(/[^a-z0-9а-я'\s-]/g," ").replace(/\s+/g," ")+" ";const out=[];let rest=t;
  for(const k of DNK){if(rest.length<k.length+2)continue;const i=rest.indexOf(" "+k);if(i<0)continue;
    const after=rest.slice(i+1+k.length);const m=after.match(/^([a-zа-я']{0,4})(?=\s|-)/);if(!m)continue;
    if(m[1]&&!/^(ni|ning|ga|da|dan|ni|lar|i|si|ini|a|у|ом|ой|ы|и|е|ю|s)$/.test(m[1]))continue;
    out.push(...DN.get(k));keys&&keys.push(k);rest=rest.slice(0,i)+" ".repeat(k.length+1+m[1].length)+after.slice(m[1].length)}
  return [...new Set(out)]}
const WCNT=new Map(),DW=new Map();
for(const d of NP.ALL){const ws=new Set();for(const n of [d.name,d.nru,d.nen])if(n)N(n).replace(/\s*\(.*\)$/,"").split(/[^a-zа-я']+/).forEach(w=>{if(w.length>=4)ws.add(w)});DW.set(d.id,[...ws]);ws.forEach(w=>WCNT.set(w,(WCNT.get(w)||0)+1))}
const STOPW=/^(taom|taomlar|ovqat|ovqatlar|blyud|блюд|еда|food|dish|dishes|meal|nima|qanday|qilsam|pishir|tayyorla|tavsiya|taklif|kerak|bilan|uchun|uyda|uyimda|menda|bormi|what|with|have|some|that|this|please|iltimos|хочу|можно|есть|дома|приготов|посовет|что|какое|какой|qil|bering|ber|xohlayman|istayman|want|like|make|cook)/;
const sameW=(a,b)=>a===b||(a.length>=4&&b.startsWith(a)&&b.length-a.length<=3)||(b.length>=4&&a.startsWith(b)&&a.length-b.length<=3);
// the same dish word in other languages / spellings
const KSYN=[["palov","plov","pilaf","pilav","palaw","pulao","polo","oshi","плов"],["sho'rva","shurpa","shorpo","sorpa","chorba","çorba","шурпа"],["somsa","samsa","samosa","самса"],
 ["manti","mantu","манты"],["lag'mon","lagman","laghman","лагман"],["kabob","kebab","kabab","shashlik","кебаб","шашлык"],["chuchvara","pelmeni","пельмени","dumplings","pierogi","vareniki","вареники"],
 ["salat","salad","salata","салат"],["tort","cake","торт"],["choy","tea","чай"],["qahva","coffee","кофе"],["pirog","pie","пирог","пирожки"],["sho'rva","soup","суп"],["kotlet","cutlet","котлет"],["non","bread","хлеб","lepyoshka","лепёшка"]].map(g=>g.map(N));
function findKinds(text,skip){const out=new Set();
  for(const tok of N(text).split(/[^a-zа-я'ç]+/)){if(tok.length<4||STOPW.test(tok)||skip.some(re=>re.test(tok)))continue;
    for(const g of KSYN)if(g.some(w=>sameW(tok,w)))g.forEach(w=>{if(WCNT.get(w)||[...WCNT.keys()].some(x=>sameW(w,x)))out.add(w)});
    for(const [w,n] of WCNT)if(n>=2&&sameW(tok,w)){out.add(w)}}
  return [...out]}
function analyze(text){const t=N(text);const ing=findIngs(text);let dk;
  // "salat", "somsa", "kartoshka somsa": a word that names many dishes is a kind of dish, unless the user says they HAVE it
  if(!HAVE.test(t))ing.has=ing.has.filter(c=>{const w=N(c);if((WCNT.get(w)||0)>=4){ing.kind=(ing.kind||[]).concat(w);return false}return true});
  const a={text,ings:ing.has.filter(x=>!STAPLE.has(x)),without:ing.without,countries:findCountries(text),region:"",meal:"",type:"",maxTime:0,
    dishes:findDishes(text,dk=[]),recipe:RECIPE.test(t),suggest:SUGGEST.test(t),more:MORE.test(t),greet:GREET.test(t),thanks:THANKS.test(t)};
  for(const [r,re] of REGRE)if(re.test(t)){a.region=r;break}
  for(const [m,re] of MEALRE)if(re.test(t)){a.meal=m;break}
  if(SOUP.test(t))a.type="suyuq";else if(THICK.test(t))a.type="quyuq";
  const tm=t.match(/(\d+)\s*(daqiqa|daq|min|минут|мин)/);if(tm)a.maxTime=+tm[1];else if(QUICK.test(t))a.maxTime=30;
  const hm=t.match(/(\d+)\s*(soat|час|hour)/);if(hm)a.maxTime=+hm[1]*60;
  if(VEG.test(t))a.without=[...new Set([...a.without,...MEATS])];
  // a dish name that is also an ingredient ("choy") counts as a dish only when asked for a recipe
  if(a.dishes.length&&a.ings.length&&!a.recipe){a.dishes=a.dishes.filter(id=>{const d=NP.BYID.get(id);return !a.ings.includes(NP.canon(d.name))})}
  const ingRe=[...a.ings,...a.without,...ing.words.filter(w=>!(ing.kind||[]).includes(N(w)))].map(c=>new RegExp("^"+rx(N(c).slice(0,Math.max(3,N(c).length-1)))));
  const cRe=CK.filter(([,c])=>a.countries.includes(c)).map(([k])=>new RegExp("^"+rx(k)));
  a.kinds=a.dishes.length?[]:[...new Set([...(ing.kind||[]),...findKinds(text,[...ingRe,...cRe,...MEALRE.map(x=>x[1]),SOUP,THICK,QUICK,VEG,RECIPE,SUGGEST,GREET,THANKS,...REGRE.map(x=>x[1])])])];
  // "somsa", "manti", "shashlik" alone: show the whole family (Uzbek ones first), not one dish that happens to be called just that
  if(a.dishes.length&&dk.length&&dk.every(k=>!/\s/.test(k)&&(WCNT.get(k)||0)>=3)){a.kinds=findKinds(dk.join(" "),[]);if(a.kinds.length)a.dishes=[]}
  a.filters=!!(a.countries.length||a.region||a.meal||a.type||a.maxTime||a.without.length||a.kinds.length);
  return a}

/* ---------------- searching the catalogue ---------------- */
let last=null; // last search: {a, ids, shown}
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function search(a){
  if(a.ings.length)NP.setPantry(a.ings);
  let list=NP.ALL.filter(d=>(!a.countries.length||a.countries.includes(d.country))&&(!a.region||NP.REGION[d.country]===a.region)&&(!a.meal||d.meals.includes(a.meal))&&(!a.type||d.type===a.type)&&(!a.maxTime||d.time<=a.maxTime)
    &&!(a.without.length&&d.ing.some(i=>!i[2]&&a.without.includes(NP.canon(i[0]))))
    &&(!a.kinds||!a.kinds.length||DW.get(d.id).some(w=>a.kinds.some(k=>sameW(k,w)))));
  if(a.ings.length){
    const sc=list.map(d=>{const need=d.ing.filter(i=>!i[2]&&!STAPLE.has(NP.canon(i[0])));const hit=need.filter(i=>a.ings.includes(NP.canon(i[0]))).length;const m=NP.match(d);
      return {d,hit,miss:m.miss.length,score:hit*3-m.miss.length*2}}).filter(x=>x.hit>=Math.min(2,a.ings.length));
    sc.sort((x,y)=>y.score-x.score||x.miss-y.miss||x.d.time-y.d.time);list=sc.map(x=>x.d)}
  else if(a.kinds&&a.kinds.length){const st=d=>DW.get(d.id).some((w,i)=>i===0&&a.kinds.some(k=>sameW(k,w)))?0:1;
    list.sort((x,y)=>(x.country==="O'zbekiston"?0:1)-(y.country==="O'zbekiston"?0:1)||st(x)-st(y)||x.time-y.time)}
  else{const seed=hash(a.text+new Date().toDateString());list=list.map(d=>[d,hash(d.id+seed)]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);
    const uz=list.filter(d=>d.country==="O'zbekiston");if(!a.countries.length&&!a.region&&uz.length)list=[...uz.slice(0,2),...list.filter(d=>!uz.slice(0,2).includes(d))]}
  return list.map(d=>d.id)}
function describe(a){const x=u(),parts=[];
  (a.kinds||[]).slice(0,1).forEach(k=>parts.push(k));
  a.countries.forEach(c=>parts.push(NP.trC(c)));if(a.region)parts.push(NP.t().regions[a.region]);
  if(a.meal)parts.push(x.meals[a.meal]);if(a.type)parts.push(x.types[a.type]);if(a.maxTime)parts.push(x.upTo(a.maxTime));
  const veg=[...MEATS].every(v=>a.without.includes(v));if(veg)parts.push(x.chips.veg.toLowerCase());
  a.without.filter(v=>!(veg&&MEATS.has(v))).forEach(v=>parts.push(x.without(NP.trI(v))));
  return parts.join(", ")}

/* ---------------- chat state ---------------- */
const KEY="chat",MAX=60;
let msgs=NP.store.get(KEY,[]);if(!Array.isArray(msgs))msgs=[];
let aiOn=!!CFG.endpoint||NP.store.get("aiOn",false),busy=false,pending=null;
const save=()=>NP.store.set(KEY,msgs.slice(-MAX).map(m=>({...m,live:undefined})));
function push(m){m.t=Date.now();msgs.push(m);if(msgs.length>MAX)msgs=msgs.slice(-MAX);save();render();return m}

/* tiny, safe markdown: **bold**, lists, line breaks */
function md(s){return esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^\s*[-•*]\s+(.*)$/gm,"<li>$1</li>").replace(/^\s*(\d+)[.)]\s+(.*)$/gm,"<li value=\"$1\">$2</li>")
  .replace(/(<li[^>]*>.*<\/li>\n?)+/g,m=>`<ul>${m.replace(/\n/g,"")}</ul>`).replace(/\n{2,}/g,"<br><br>").replace(/\n/g,"<br>")}
function msgHTML(m,i){
  if(m.role==="user")return `<div class="mg me"><div class="bb">${esc(m.text)}</div></div>`;
  const cards=(m.ids||[]).slice(0,m.shown||6).map(id=>NP.BYID.get(id)).filter(Boolean);
  const moreN=(m.ids||[]).length-(m.shown||6);
  return `<div class="mg ch"><span class="av">${chefSVG(true)}</span><div class="bw">
    ${m.text?`<div class="bb${m.live?" live":""}">${md(m.text)}</div>`:""}
    ${cards.length?`<div class="crow">${cards.map(d=>NP.cardHTML(d)).join("")}</div>`:""}
    ${moreN>0?`<button class="mact" data-cmore="${i}">${esc(u().more)} (${moreN})</button>`:""}
    ${m.act==="ai"&&!aiOn?`<button class="mact ai" data-cai="1">${esc(u().aiBtn)}</button>`:""}
  </div></div>`}
function render(){const box=$("#msgs");if(!box)return;
  box.innerHTML=msgs.map(msgHTML).join("")+(busy&&!msgs.some(m=>m.live)?`<div class="mg ch"><span class="av">${chefSVG(true)}</span><div class="bw"><div class="bb dots"><i></i><i></i><i></i></div></div></div>`:"");
  NP.observeCovers(box);box.scrollTop=box.scrollHeight;
  $("#chSt").textContent=busy?u().thinking:u().online}
function chips(list){$("#cSug").innerHTML=list.map(s=>`<button class="chip sm" data-csay="${esc(s)}">${esc(s)}</button>`).join("")}
function followChips(a){const x=u(),c=[];
  if(last&&last.ids.length>last.shown)c.push(x.chips.more);
  if(!a||!a.without.length)c.push(x.chips.veg);if(!a||!a.maxTime)c.push(x.chips.fast);if(!a||a.type!=="suyuq")c.push(x.chips.soup);if(!a||a.meal!=="shirinlik")c.push(x.chips.sweet);
  chips(c.slice(0,4))}

/* ---------------- answering ---------------- */
function reply(text,ids,extra){const m={role:"chef",text,ids:ids||[],shown:Math.min(6,(ids||[]).length),...extra};push(m);speak(m);return m}
function answerLocal(a){const x=u();
  if(a.greet&&!a.ings.length&&!a.dishes.length&&!a.filters){reply(x.greet);chips(x.sug.slice(0,4));return true}
  if(a.thanks&&!a.ings.length&&!a.dishes.length&&!a.filters&&a.text.length<40){reply(x.thanks);return true}
  if(a.more&&last&&!a.ings.length&&!a.dishes.length&&!a.filters){const next=last.ids.slice(last.shown,last.shown+6);
    if(!next.length){reply(x.noMore);return true}last.shown+=next.length;reply("",next);followChips(last.a);return true}
  if(a.dishes.length&&(a.recipe||(!a.ings.length&&!a.suggest))){const ids=a.dishes.slice(0,12);const d=NP.BYID.get(ids[0]);
    reply(ids.length===1||new Set(ids.map(i=>NP.dn(NP.BYID.get(i)))).size===1&&ids.length<=2?x.recipe(NP.dn(d)):x.recipeN,ids);chips([x.chips.fast,x.chips.soup,x.chips.sweet]);return true}
  // modifiers only ("go'shtsiz", "tezroq", "sho'rva") continue the previous search
  if(!a.ings.length&&!a.dishes.length&&a.filters&&last&&!a.countries.length&&!a.kinds.length&&!a.region&&!a.recipe&&!a.suggest&&a.text.split(/\s+/).length<=2){const p=last.a;
    const m={...p,text:a.text,meal:a.meal||p.meal,type:a.type||p.type,maxTime:a.maxTime||p.maxTime,without:[...new Set([...p.without,...a.without])],filters:true};
    if(search(m).length)a=m}
  if(a.ings.length||a.filters||a.suggest){
    const ids=search(a);last={a,ids,shown:Math.min(6,ids.length)};
    if(!ids.length){reply(x.none);chips(x.sug.slice(0,4));return true}
    const desc=describe(a);
    reply(a.ings.length?x.found(a.ings.map(NP.trI).join(", ")+(desc?` (${desc})`:"")):a.recipe&&a.kinds.length?x.recipeN:desc?x.foundF(desc):x.foundAny,ids);
    followChips(a);return true}
  return false}
function systemPrompt(ctxIds){const x=u();
  const cat=ctxIds.slice(0,12).map(id=>{const d=NP.BYID.get(id);return `- ${NP.dn(d)} (${NP.trC(d.country)}, ${NP.fmtTime(d.time)})`}).join("\n");
  return `You are "${x.name}", a warm, cheerful chef living inside the recipe app "Nima pishiramiz?" (2,900+ dishes from 195 countries and 19 autonomous regions).
Answer ONLY questions about food: cooking methods, recipes, ingredients and substitutions, kitchen tools, food storage and safety, nutrition basics, meal planning, food culture, drinks, table customs.
If the user asks about anything else, kindly say you only help with food and offer a food idea instead.
Always reply in ${x.sys}, whatever language the question is in, unless the user clearly writes in another language — then use that language.
Be concise and practical: 2–6 short sentences or a short list. Use **bold** sparingly. No medical diagnoses; for illness-related diets or allergies, suggest asking a doctor.
${cat?`Dishes from the app that fit this question (recommend them by their exact names when useful; do not claim the app has other dishes):\n${cat}`:""}`}
async function answerAI(text,a){
  const ctx=a?search({...a,text}).slice(0,12):[];
  const hist=msgs.filter(m=>m.text&&!m.live).slice(-12).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
  const messages=[{role:"system",content:systemPrompt(ctx)},...hist];
  const m=reply("",[],{live:true});setMood("talk");
  let out="";
  try{out=await streamAI(messages,s=>{m.text=s;const el=document.querySelector("#msgs .mg:last-child .bb");if(el)el.innerHTML=md(s);else render();const b=$("#msgs");b.scrollTop=b.scrollHeight})}
  catch(e){console.warn("AI",e);m.live=false;m.text=u().aiFail;save();render();setMood("");return}
  m.live=false;m.text=out.trim();
  const said=N(out);m.ids=ctx.filter(id=>{const d=NP.BYID.get(id);return [d.name,d.nru,d.nen].some(n=>n&&said.includes(N(n).replace(/\s*\(.*\)$/,"")))}).slice(0,6);m.shown=m.ids.length;
  save();render();setMood("");speak(m)}

/* ---------------- AI providers ---------------- */
let puterP=null;
function loadPuter(){if(window.puter)return Promise.resolve(window.puter);if(puterP)return puterP;
  puterP=new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://js.puter.com/v2/";s.async=true;s.onload=()=>window.puter?ok(window.puter):no(new Error("puter"));s.onerror=()=>{puterP=null;no(new Error("puter load"))};document.head.appendChild(s)});
  return puterP}
async function streamAI(messages,onText){
  if(CFG.endpoint){
    const r=await fetch(CFG.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages})});
    if(!r.ok||!r.body)throw new Error("HTTP "+r.status);
    const rd=r.body.getReader(),dec=new TextDecoder();let out="";
    for(;;){const {done,value}=await rd.read();if(done)break;out+=dec.decode(value,{stream:true});onText(out)}
    return out}
  const p=await loadPuter();let err;
  for(const model of (CFG.models&&CFG.models.length?CFG.models:[undefined])){
    try{const res=await p.ai.chat(messages,false,model?{model,stream:true}:{stream:true});let out="";
      if(res&&typeof res[Symbol.asyncIterator]==="function"){for await(const part of res){const tx=part&&(part.text||(part.message&&part.message.content))||"";if(tx){out+=tx;onText(out)}}}
      else{out=typeof res==="string"?res:(res&&res.message&&(typeof res.message.content==="string"?res.message.content:(res.message.content||[]).map(c=>c.text||"").join("")))||String(res||"");onText(out)}
      if(out.trim())return out}
    catch(e){err=e;if(/auth|sign|login|401|403|insufficient|funds|credit/i.test(String(e&&(e.message||e.error||e))))throw e}}
  throw err||new Error("empty")}
async function enableAI(){
  try{const p=await loadPuter();if(p.auth&&p.auth.isSignedIn&&!p.auth.isSignedIn())await p.auth.signIn();
    aiOn=true;NP.store.set("aiOn",true);reply(u().aiOk);
    if(pending){const q=pending;pending=null;busy=true;render();await answerAI(q.text,q.a);busy=false;render()}}
  catch(e){console.warn(e);reply(u().aiFail)}}

async function send(text){text=String(text||"").trim();if(!text||busy)return;
  stopListen();push({role:"user",text});const a=analyze(text);
  busy=true;setMood("think");render();
  await new Promise(r=>setTimeout(r,350+Math.random()*350));
  if(!answerLocal(a)){
    if(aiOn){await answerAI(text,a)}
    else{pending={text,a};reply(u().aiOff,[],{act:"ai"});if(!CFG.endpoint)loadPuter().catch(()=>{})}}
  busy=false;setMood("");render()}

/* ---------------- voice ---------------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
function stopListen(){if(rec){try{rec.stop()}catch(e){}rec=null;$("#mic").classList.remove("on")}}
function listen(){if(!SR)return;if(rec){stopListen();return}
  rec=new SR();rec.lang={uz:"uz-UZ",ru:"ru-RU",en:"en-US"}[NP.lang()];rec.interimResults=true;rec.maxAlternatives=1;
  $("#mic").classList.add("on");$("#cIn").placeholder=u().listening;
  rec.onresult=e=>{let s="";for(const r of e.results)s+=r[0].transcript;$("#cIn").value=s;grow();if(e.results[e.results.length-1].isFinal){const v=s;stopListen();$("#cIn").value="";grow();send(v)}};
  rec.onend=()=>{rec=null;$("#mic").classList.remove("on");$("#cIn").placeholder=u().ph};rec.onerror=rec.onend;
  try{rec.start()}catch(e){stopListen()}}
function speak(){/* reserved: browsers rarely have Uzbek voices, so replies are text for now */}

/* ---------------- panel ---------------- */
function paintChefs(){$("#hchef").innerHTML=chefSVG(false);$("#fchef").innerHTML=chefSVG(true);$("#chav").innerHTML=chefSVG(true)}
function texts(){const x=u();
  $("#heroT").textContent=x.hero;$("#askIn").placeholder=x.ask;$("#askIn").setAttribute("aria-label",x.go);$("#askGoT").textContent=x.go;
  $("#hSug").innerHTML=x.sug.map(s=>`<button class="chip sm" data-csay="${esc(s)}">${esc(s)}</button>`).join("");
  $("#fabT").textContent=x.fab;$("#fab").setAttribute("aria-label",x.fab);$("#chName").textContent=x.name;$("#chSt").textContent=x.online;
  $("#cIn").placeholder=x.ph;$("#cIn").setAttribute("aria-label",x.ph);$("#cSend").setAttribute("aria-label",x.send);$("#mic").setAttribute("aria-label",x.mic);
  $("#chNew").setAttribute("aria-label",x.newChat);$("#chNew").title=x.newChat;$("#chX").setAttribute("aria-label",x.close);$("#ftip").textContent=x.tip}
let isOpen=false;
function open(first){if(isOpen)return;isOpen=true;$("#ftip").hidden=true;NP.store.set("tipSeen",1);
  const c=$("#chat");$("#cov").hidden=false;c.hidden=false;requestAnimationFrame(()=>{$("#cov").classList.add("on");c.classList.add("on")});
  document.body.classList.add("chatting");
  if(!msgs.length)reply(u().greet);else if(!first&&Date.now()-(msgs[msgs.length-1].t||0)>3*3600e3)reply(u().back);
  render();if(!$("#cSug").innerHTML)chips(u().sug.slice(0,4));
  document.querySelectorAll(".chef").forEach(e=>{e.classList.remove("wave");void e.getBoundingClientRect();e.classList.add("wave")});
  if(!first&&matchMedia("(pointer:fine)").matches)setTimeout(()=>$("#cIn").focus(),250);
  if(aiOn&&!CFG.endpoint)loadPuter().catch(()=>{})}
function close(){if(!isOpen)return;isOpen=false;stopListen();$("#cov").classList.remove("on");$("#chat").classList.remove("on");document.body.classList.remove("chatting");
  setTimeout(()=>{if(!isOpen){$("#cov").hidden=true;$("#chat").hidden=true}},300)}
function grow(){const t=$("#cIn");t.style.height="auto";t.style.height=Math.min(120,t.scrollHeight)+"px"}

paintChefs();texts();render();
if(!SR)$("#mic").hidden=true;else $("#mic").hidden=false;
$("#fab").addEventListener("click",()=>open());
$("#cov").addEventListener("click",close);
$("#chX").addEventListener("click",close);
$("#chNew").addEventListener("click",()=>{msgs=[];last=null;save();NP.setPantry([]);reply(u().cleared);chips(u().sug.slice(0,4))});
$("#askForm").addEventListener("submit",e=>{e.preventDefault();const v=$("#askIn").value;$("#askIn").value="";open(true);send(v)});
$("#comp").addEventListener("submit",e=>{e.preventDefault();const v=$("#cIn").value;$("#cIn").value="";grow();send(v)});
$("#cIn").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();$("#comp").requestSubmit()}});
$("#cIn").addEventListener("input",grow);
$("#mic").addEventListener("click",listen);
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.csay){if(!isOpen)open(true);send(d.csay)}
  else if(d.cmore!==undefined){const m=msgs[+d.cmore];if(m){m.shown=Math.min((m.shown||6)+6,m.ids.length);if(last&&last.ids===m.ids)last.shown=m.shown;save();render()}}
  else if(d.cai)enableAI()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&isOpen&&$("#sheet").hidden)close()});
window.addEventListener("np-lang",()=>{texts();render();chips(u().sug.slice(0,4))});
// a gentle nudge on the first visit
if(!NP.store.get("tipSeen",0))setTimeout(()=>{if(!isOpen){$("#ftip").hidden=false;setTimeout(()=>$("#ftip").hidden=true,9000)}},5000);
$("#ftip").addEventListener("click",()=>open());
// hero bubble types itself out once
{const el=$("#heroT"),full=el.textContent;if(!matchMedia("(prefers-reduced-motion:reduce)").matches&&full){el.textContent="";let i=0;setMood("talk");
  const iv=setInterval(()=>{i+=2;el.textContent=full.slice(0,i);if(i>=full.length){clearInterval(iv);setMood("");el.textContent=u().hero}},28)}}
window.NPChef={open,close,send,analyze};
}
if(window.NP)boot();else window.addEventListener("np-ready",boot);
})();
