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
  nav:{home:"Bosh sahifa",recipes:"Retseptlar",pantry:"Uyda nima bor?",menu:"Haftalik menyu",chef:"AI Oshpaz",premium:"Premium",saved:"Saqlanganlar"},
  tab:{home:"Bosh sahifa",recipes:"Retseptlar",chef:"AI Oshpaz",menu:"Menyu",saved:"Saqlangan"},
  hEye:(n,c)=>`${n} retsept · ${c} davlat`,hT1:"Bugun nima",hT2:"pishiramiz?",hSub:"Uydagi mahsulotlardan mazali taom toping — 195 davlat va 19 avtonomiya oshxonasi bir joyda.",hCountL:"retsept",
  sPh:"Taom nomi, mahsulot yoki davlat…",sDish:"Taomlar",sIng:"Mahsulotlar",sCountry:"Davlatlar",sAll:q=>`«${q}» bo'yicha barcha taomlar`,sAddIng:"uydagilarga qo'shish",
  qa:{pantry:["Uyda nima bor?","Mahsulotdan retsept topish"],chef:["AI Oshpaz","Sizga mos retseptlar"],menu:["Haftalik menyu","7 kunlik tayyor reja"],premium:["Premium","Qo'shimcha imkoniyatlar"]},
  tCats:"Toifalar",cats:{nonushta:"Nonushta",tushlik:"Tushlik",kechki:"Kechki ovqat",shirinlik:"Shirinliklar",ichimlik:"Ichimliklar",soup:"Sho'rvalar",quick:"Tez taomlar",uz:"O'zbek taomlari"},
  tChef:"AI Oshpaz bilan gaplashing",tToday:"Bugungi tavsiya",seeAll:"Barchasi →",tUz:"O'zbek oshxonasi",tWorld:"Davlatlar bo'yicha",allCountries:"Barcha davlatlar →",tQuick:"30 daqiqada tayyor",
  promo:{menu:["Haftalik menyu","Nonushta, tushlik va kechki ovqat — 7 kunlik tayyor reja va xarid ro'yxati.","Menyuni ochish"],premium:["Premium obuna","Cheksiz AI oshpaz, reklamasiz foydalanish va boshqa qulayliklar.","Batafsil"]},
  rTitle:"Retseptlar",rSub:n=>`${n} ta taom — davlat, vaqt va turi bo'yicha saralang`,nameQ:"Taom nomini qidiring…",anyMeal:"Hammasi",anyType:"Farqi yo'q",quyuq:"Quyuq",suyuq:"Suyuq",
  times:{0:"Istalgan vaqt",15:"15 daq gacha",30:"30 daq gacha",60:"1 soat gacha"},reset:"Tozalash",
  meals:{nonushta:"Nonushta",tushlik:"Tushlik",kechki:"Kechki ovqat",shirinlik:"Shirinlik",ichimlik:"Ichimlik"},
  regions:{"MDH":"MDH","Avtonomiyalar":"Avtonomiyalar","Yevropa":"Yevropa","Osiyo":"Osiyo","Yaqin Sharq":"Yaqin Sharq","Afrika":"Afrika","Amerika":"Amerika","Okeaniya":"Okeaniya"},
  world:"Butun dunyo",allOf:r=>`Butun ${r}`,search:"Davlatni qidiring…",dishes:n=>`${n} ta taom`,q1:"Qaysi davlat taomi?",
  pTitle:"Uyda nimalar bor?",pSub:"Mahsulotlarni tanlang — ulardan nima pishirish mumkinligini ko'rsatamiz.",pPh:"Mahsulot yozing: masalan, tuxum",add:"Qo'shish",clear:"Tozalash",remove:"olib tashlash",
  note:"Tuz, suv, yog' va murch doim bor deb hisoblanadi.",groups:{meat:"Go'sht va baliq",veg:"Sabzavotlar",dairy:"Sut va tuxum",grain:"Don va xamir",fruit:"Meva va shirin",other:"Boshqalar"},
  pEmpty:"Yuqoridan mahsulotlarni tanlang — mos taomlar shu yerda chiqadi.",
  now:"Hozir pishiring",near:"1–2 tasi yetishmaydi",all:"Hammasi",tNow:"Hozir pishirsa bo'ladi",tNear:"Ozgina yetishmaydi",tAll:"Barcha mos taomlar",tDef:"Taomlar",tOf:n=>`${n} taomlari`,
  cnt:n=>`${n} ta`,ingN:n=>`${n} ta masalliq`,allHave:"✓ Hammasi bor",lack:"Yetishmaydi",
  none:"Hech narsa topilmadi",noneNow:"Yana bir-ikkita mahsulot qo'shing yoki «1–2 tasi yetishmaydi»ni oching.",noneF:"Filtrlarni o'zgartirib ko'ring.",
  more:n=>`Yana ko'rsatish (${n})`,
  mTitle:"Haftalik menyu",mSub:"Nonushta, tushlik va kechki ovqat uchun 7 kunlik reja. Yoqmagan taomni almashtiring.",mNew:"↻ Yangi menyu",
  days:["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba","Yakshanba"],mon:["yan","fev","mar","apr","may","iyun","iyul","avg","sen","okt","noy","dek"],slots:{nonushta:"Nonushta",tushlik:"Tushlik",kechki:"Kechki ovqat"},swap:"Almashtirish",
  shopT:"Xarid ro'yxati",shopN:n=>`${n} ta mahsulot`,shopNote:"Haftalik menyudagi taomlar uchun kerakli mahsulotlar (tuz, suv, yog' va murchdan tashqari). Belgilab boring.",inN:n=>`${n} ta taomda`,
  fTitle:"Saqlanganlar",fSub:n=>`${n} ta taom saqlangan`,fEmpty:["Hali hech narsa saqlanmagan","Taom kartochkasidagi ♡ tugmasini bosing — u shu yerda saqlanadi."],save:"Saqlash",savedT:"Saqlandi ♥",unsaved:"Saqlanganlardan olib tashlandi",
  prem:{title:"Premium obuna",sub:"Yanada ko'proq imkoniyatlar va qulayliklar",m:"Oylik",y:"Yillik",off:"-43%",feats:["Cheksiz AI oshpaz savollari","Haftalik menyu va xarid ro'yxati","Reklamasiz foydalanish","2900+ retseptning barchasi","Yangi retseptlar birinchi bo'lib"],
   per:{m:"/ oy",y:"/ yil"},price:{m:"29 000 so'm",y:"199 000 so'm"},cta:"Premiumga o'tish",soon:"Premium tez orada ishga tushadi — hozircha barcha imkoniyatlar bepul!",note:"Hozircha barcha imkoniyatlar bepul."},
  video:"Tayyorlanish videosi",ings:"Masalliqlar",have:(a,b)=>`${a}/${b} bor`,opt:"ixtiyoriy",
  cook:"Tayyorlash",steps:n=>`${n} qadam`,allOk:"✓ Hammasi bor — pishiravering!",timer:m=>`${m} daqiqa taymer`,ready:"Tayyor!",timeUp:"⏰ Vaqt tugadi!",
  close:"Yopish",photos:"Suratlar: Wikimedia Commons",stepDone:n=>`${n}-qadam bajarildi`,photoN:n=>`${n}-surat`,related:"O'xshash taomlar",share:"Ulashish",copied:"Havola nusxalandi",
  foot:"Retseptlar 195 davlat va 19 avtonomiya oshxonasidan. Suratlar Wikipedia va Wikimedia Commons'dan (erkin litsenziya) — har bir surat muallifi taom sahifasida ko'rsatilgan. «Tayyorlanish videosi» tugmasi YouTube'da shu taom retseptlarini ochadi.",
  min:"daq",hr:"soat",day:"kun",yt:" retsepti",desc:"AI oshpazdan so'rang — 195 davlat va 19 avtonomiyadan 2900 dan ortiq taom retsepti, suratlari va tayyorlash usullari."},
 ru:{title:"Что приготовить?",stat:(a,b,c)=>`${a} блюд · ${b} стран`+(c?` · ${c} автономий`:""),
  nav:{home:"Главная",recipes:"Рецепты",pantry:"Что есть дома?",menu:"Меню на неделю",chef:"AI-повар",premium:"Premium",saved:"Сохранённые"},
  tab:{home:"Главная",recipes:"Рецепты",chef:"AI-повар",menu:"Меню",saved:"Сохранено"},
  hEye:(n,c)=>`${n} рецептов · ${c} стран`,hT1:"Что сегодня",hT2:"приготовим?",hSub:"Найдите вкусное блюдо из того, что есть дома, — кухни 195 стран и 19 автономий в одном месте.",hCountL:"рецептов",
  sPh:"Блюдо, продукт или страна…",sDish:"Блюда",sIng:"Продукты",sCountry:"Страны",sAll:q=>`Все блюда по запросу «${q}»`,sAddIng:"добавить к продуктам",
  qa:{pantry:["Что есть дома?","Рецепт из продуктов"],chef:["AI-повар","Подберёт рецепт"],menu:["Меню на неделю","План на 7 дней"],premium:["Premium","Больше возможностей"]},
  tCats:"Категории",cats:{nonushta:"Завтрак",tushlik:"Обед",kechki:"Ужин",shirinlik:"Десерты",ichimlik:"Напитки",soup:"Супы",quick:"Быстрые блюда",uz:"Узбекская кухня"},
  tChef:"Поговорите с AI-поваром",tToday:"Рекомендация дня",seeAll:"Все →",tUz:"Узбекская кухня",tWorld:"По странам",allCountries:"Все страны →",tQuick:"Готово за 30 минут",
  promo:{menu:["Меню на неделю","Завтрак, обед и ужин — готовый план на 7 дней и список покупок.","Открыть меню"],premium:["Premium-подписка","Безлимитный AI-повар, без рекламы и другие удобства.","Подробнее"]},
  rTitle:"Рецепты",rSub:n=>`${n} блюд — фильтруйте по стране, времени и типу`,nameQ:"Найти блюдо по названию…",anyMeal:"Все",anyType:"Неважно",quyuq:"Густое",suyuq:"Жидкое",
  times:{0:"Любое время",15:"до 15 мин",30:"до 30 мин",60:"до 1 часа"},reset:"Сбросить",
  meals:{nonushta:"Завтрак",tushlik:"Обед",kechki:"Ужин",shirinlik:"Десерт",ichimlik:"Напиток"},
  regions:{"MDH":"СНГ","Avtonomiyalar":"Автономии","Yevropa":"Европа","Osiyo":"Азия","Yaqin Sharq":"Ближний Восток","Afrika":"Африка","Amerika":"Америка","Okeaniya":"Океания"},
  world:"Весь мир",allOf:r=>`Вся ${r}`,search:"Найти страну…",dishes:n=>`${n} блюд`,q1:"Кухня какой страны?",
  pTitle:"Что есть дома?",pSub:"Отметьте продукты — покажем, что из них можно приготовить.",pPh:"Напишите продукт: например, яйца",add:"Добавить",clear:"Очистить",remove:"убрать",
  note:"Соль, вода, масло и перец считаются всегда в наличии.",groups:{meat:"Мясо и рыба",veg:"Овощи",dairy:"Молочное и яйца",grain:"Крупы и тесто",fruit:"Фрукты и сладкое",other:"Другое"},
  pEmpty:"Отметьте продукты выше — подходящие блюда появятся здесь.",
  now:"Можно сейчас",near:"Не хватает 1–2",all:"Все",tNow:"Можно приготовить сейчас",tNear:"Чуть-чуть не хватает",tAll:"Все подходящие блюда",tDef:"Блюда",tOf:n=>`Блюда: ${n}`,
  cnt:n=>`${n}`,ingN:n=>`${n} ингредиентов`,allHave:"✓ Всё есть",lack:"Не хватает",
  none:"Ничего не найдено",noneNow:"Добавьте ещё пару продуктов или откройте «Не хватает 1–2».",noneF:"Попробуйте изменить фильтры.",
  more:n=>`Показать ещё (${n})`,
  mTitle:"Меню на неделю",mSub:"План завтраков, обедов и ужинов на 7 дней. Замените блюдо, если не нравится.",mNew:"↻ Новое меню",
  days:["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"],mon:["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"],slots:{nonushta:"Завтрак",tushlik:"Обед",kechki:"Ужин"},swap:"Заменить",
  shopT:"Список покупок",shopN:n=>`${n} продуктов`,shopNote:"Продукты для блюд меню на неделю (кроме соли, воды, масла и перца). Отмечайте купленное.",inN:n=>`в ${n} блюдах`,
  fTitle:"Сохранённые",fSub:n=>`Сохранено блюд: ${n}`,fEmpty:["Пока ничего не сохранено","Нажмите ♡ на карточке блюда — оно появится здесь."],save:"Сохранить",savedT:"Сохранено ♥",unsaved:"Удалено из сохранённых",
  prem:{title:"Premium-подписка",sub:"Ещё больше возможностей и удобства",m:"Месяц",y:"Год",off:"-43%",feats:["Безлимитные вопросы AI-повару","Меню на неделю и список покупок","Без рекламы","Все 2900+ рецептов","Новые рецепты первыми"],
   per:{m:"/ мес",y:"/ год"},price:{m:"29 000 сум",y:"199 000 сум"},cta:"Перейти на Premium",soon:"Premium скоро заработает — пока все возможности бесплатны!",note:"Пока все возможности бесплатны."},
  video:"Видео рецепта",ings:"Ингредиенты",have:(a,b)=>`есть ${a}/${b}`,opt:"по желанию",
  cook:"Приготовление",steps:n=>`${n} шагов`,allOk:"✓ Всё есть — готовьте!",timer:m=>`таймер ${m} мин`,ready:"Готово!",timeUp:"⏰ Время вышло!",
  close:"Закрыть",photos:"Фото: Wikimedia Commons",stepDone:n=>`Шаг ${n} выполнен`,photoN:n=>`Фото ${n}`,related:"Похожие блюда",share:"Поделиться",copied:"Ссылка скопирована",
  foot:"Рецепты кухонь 195 стран и 19 автономий. Фото — из Википедии и Wikimedia Commons (свободные лицензии), автор каждого фото указан на странице блюда. Кнопка «Видео рецепта» открывает рецепты на YouTube.",
  min:"мин",hr:"ч",day:"дн",yt:" рецепт",desc:"Спросите AI-повара — 2900+ рецептов блюд 195 стран и 19 автономий с фото и пошаговым приготовлением."},
 en:{title:"What to cook?",stat:(a,b,c)=>`${a} dishes · ${b} countries`+(c?` · ${c} autonomies`:""),
  nav:{home:"Home",recipes:"Recipes",pantry:"What's at home?",menu:"Weekly menu",chef:"AI Chef",premium:"Premium",saved:"Saved"},
  tab:{home:"Home",recipes:"Recipes",chef:"AI Chef",menu:"Menu",saved:"Saved"},
  hEye:(n,c)=>`${n} recipes · ${c} countries`,hT1:"What shall we",hT2:"cook today?",hSub:"Find a tasty dish from what's in your kitchen — cuisines of 195 countries and 19 autonomies in one place.",hCountL:"recipes",
  sPh:"Dish, ingredient or country…",sDish:"Dishes",sIng:"Ingredients",sCountry:"Countries",sAll:q=>`All dishes for “${q}”`,sAddIng:"add to my kitchen",
  qa:{pantry:["What's at home?","Recipes from ingredients"],chef:["AI Chef","Recipes picked for you"],menu:["Weekly menu","A 7-day plan"],premium:["Premium","More features"]},
  tCats:"Categories",cats:{nonushta:"Breakfast",tushlik:"Lunch",kechki:"Dinner",shirinlik:"Desserts",ichimlik:"Drinks",soup:"Soups",quick:"Quick meals",uz:"Uzbek dishes"},
  tChef:"Talk to the AI Chef",tToday:"Today's picks",seeAll:"See all →",tUz:"Uzbek cuisine",tWorld:"By country",allCountries:"All countries →",tQuick:"Ready in 30 minutes",
  promo:{menu:["Weekly menu","Breakfast, lunch and dinner — a ready 7-day plan and shopping list.","Open the menu"],premium:["Premium","Unlimited AI chef, no ads and more.","Learn more"]},
  rTitle:"Recipes",rSub:n=>`${n} dishes — filter by country, time and type`,nameQ:"Search dishes by name…",anyMeal:"All",anyType:"Either",quyuq:"Thick",suyuq:"Soupy",
  times:{0:"Any time",15:"up to 15 min",30:"up to 30 min",60:"up to 1 hour"},reset:"Reset",
  meals:{nonushta:"Breakfast",tushlik:"Lunch",kechki:"Dinner",shirinlik:"Dessert",ichimlik:"Drink"},
  regions:{"MDH":"CIS","Avtonomiyalar":"Autonomies","Yevropa":"Europe","Osiyo":"Asia","Yaqin Sharq":"Middle East","Afrika":"Africa","Amerika":"Americas","Okeaniya":"Oceania"},
  world:"Whole world",allOf:r=>`All of ${r}`,search:"Search country…",dishes:n=>`${n} dishes`,q1:"Which country's food?",
  pTitle:"What's at home?",pSub:"Pick your ingredients — we'll show what you can cook with them.",pPh:"Type an ingredient, e.g. eggs",add:"Add",clear:"Clear",remove:"remove",
  note:"Salt, water, oil and pepper are assumed to be at hand.",groups:{meat:"Meat & fish",veg:"Vegetables",dairy:"Dairy & eggs",grain:"Grains & dough",fruit:"Fruit & sweet",other:"Other"},
  pEmpty:"Pick ingredients above — matching dishes will appear here.",
  now:"Cook now",near:"Missing 1–2",all:"All",tNow:"You can cook these now",tNear:"Just a little missing",tAll:"All matching dishes",tDef:"Dishes",tOf:n=>`${n} dishes`,
  cnt:n=>`${n}`,ingN:n=>`${n} ingredients`,allHave:"✓ You have it all",lack:"Missing",
  none:"Nothing found",noneNow:"Add a couple more ingredients or open “Missing 1–2”.",noneF:"Try changing the filters.",
  more:n=>`Show more (${n})`,
  mTitle:"Weekly menu",mSub:"A 7-day plan for breakfast, lunch and dinner. Swap any dish you don't like.",mNew:"↻ New menu",
  days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],mon:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],slots:{nonushta:"Breakfast",tushlik:"Lunch",kechki:"Dinner"},swap:"Swap",
  shopT:"Shopping list",shopN:n=>`${n} items`,shopNote:"Ingredients for this week's dishes (salt, water, oil and pepper left out). Tick them off as you shop.",inN:n=>`in ${n} dishes`,
  fTitle:"Saved",fSub:n=>`${n} saved dishes`,fEmpty:["Nothing saved yet","Tap ♡ on a dish card and it will be kept here."],save:"Save",savedT:"Saved ♥",unsaved:"Removed from saved",
  prem:{title:"Premium",sub:"More features, more comfort",m:"Monthly",y:"Yearly",off:"-43%",feats:["Unlimited AI chef questions","Weekly menu and shopping list","No ads","All 2,900+ recipes","New recipes first"],
   per:{m:"/ month",y:"/ year"},price:{m:"29,000 UZS",y:"199,000 UZS"},cta:"Go Premium",soon:"Premium is coming soon — for now everything is free!",note:"For now every feature is free."},
  video:"Video recipe",ings:"Ingredients",have:(a,b)=>`${a}/${b} at hand`,opt:"optional",
  cook:"Method",steps:n=>`${n} steps`,allOk:"✓ You have everything — start cooking!",timer:m=>`${m} min timer`,ready:"Done!",timeUp:"⏰ Time's up!",
  close:"Close",photos:"Photos: Wikimedia Commons",stepDone:n=>`Step ${n} done`,photoN:n=>`Photo ${n}`,related:"Similar dishes",share:"Share",copied:"Link copied",
  foot:"Recipes from the cuisines of 195 countries and 19 autonomies. Photos come from Wikipedia and Wikimedia Commons (free licences); each photo's author is linked on the dish page. The “Video recipe” button opens recipes on YouTube.",
  min:"min",hr:"h",day:"d",yt:" recipe",desc:"Ask the AI chef — 2,900+ recipes from 195 countries and 19 autonomies, with photos and step-by-step methods."}
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
let favs=store.get("favs",[]);if(!Array.isArray(favs))favs=[];
let fR=store.get("fR",""),fC=store.get("fC",""),fM="",fT="",fTime=0,nameQ="",limit=48;
if(fC&&!isCountry(fC))fC="";if(fR&&!REGIONS.includes(fR))fR="";
let view="home",pSeg="auto",pLimit=24,pGroup="meat";

function has(name){const c=canon(name);return pantry.includes(c)||(ALSO[c]||[]).some(a=>pantry.includes(a))}
function match(d){const need=d.ing.filter(i=>!i[2]&&!STAPLE.has(canon(i[0])));const miss=need.filter(i=>!has(i[0])).map(i=>trI(base(i[0])));return {need:need.length,have:need.length-miss.length,miss}}
function fmtTime(m){const u=t();if(m>=1440)return Math.round(m/1440)+" "+u.day;const h=Math.floor(m/60),r=m%60;return h?(r?`${h} ${u.hr} ${r} ${u.min}`:`${h} ${u.hr}`):`${r} ${u.min}`}
const PAL={quyuq:["#f0a53a","#c4572b"],suyuq:["#3a9a77","#1f5f6b"],shirin:["#e07a9a","#a43d64"],ichim:["#5a9be0","#2b5c9a"]};
const kind=d=>d.meals.includes("ichimlik")?"ichim":d.meals.includes("shirinlik")?"shirin":d.type;
function tile(d){const p=PAL[kind(d)];return `<div class="tile" style="--c1:${p[0]};--c2:${p[1]}"><span class="fl">${d.flag}</span><b>${esc(dn(d))}</b><i>${t()[d.type]} · ${fmtTime(d.time)}</i></div>`}

/* ---------- photos: checked in advance (tools/photos.mjs), each photo belongs to one dish only ----------
   The dish → photo mapping comes only from data/photos.js and is never changed here; only the display size varies. */
const PH=window.PH||{};
const fileUrl=(f,w)=>"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(f)+"?width="+(w||640);
const memo={};
const filesOf=d=>PH[d.country+"|"+d.name]||[];
const hasPh=d=>filesOf(d).length>0;
function photosFor(d){if(memo[d.id])return memo[d.id];const l=filesOf(d).map(f=>fileUrl(f));return memo[d.id]=Promise.resolve(l)}
const io=("IntersectionObserver" in window)?new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);fillCover(e.target)})},{rootMargin:"400px"}):null;
function fillCover(el){const d=BYID.get(el.dataset.cid);if(!d)return;
  const f=filesOf(d)[0];const ld=el.querySelector(".ld");
  if(!f){if(ld)ld.outerHTML=tile(d);return}
  const img=new Image();img.alt=dn(d);img.decoding="async";img.loading="lazy";
  img.sizes=el.dataset.sizes||"(max-width:560px) 50vw, (max-width:1100px) 33vw, 280px";
  img.srcset=[320,480,640,960].map(w=>`${fileUrl(f,w)} ${w}w`).join(", ");img.src=fileUrl(f,640);
  img.onload=()=>{ld&&ld.remove();el.classList.add("in")};img.onerror=()=>{img.remove();ld&&(ld.outerHTML=tile(d))};el.prepend(img)}
function observeCovers(root){(root||document).querySelectorAll(".cover[data-cid]:not([data-seen])").forEach(el=>{el.dataset.seen=1;io?io.observe(el):fillCover(el)})}

/* ---------- icons ---------- */
const I=(p,cls)=>`<svg class="ic${cls?" "+cls:""}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC={
 home:'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7M8 11h5"/>',
 basket:'<path d="M3 10h18l-2 10H5z"/><path d="m8 10 4-6 4 6M9 14v3M12 14v3M15 14v3"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3M8 17h6"/>',
 heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 crown:'<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 19h14"/>',
 chef:'<path d="M7 14.5c-2.6-.4-4.3-2.4-3.9-4.9.4-2.2 2.6-3.7 4.8-3.3C8.9 4.3 10.4 3 12 3s3.1 1.3 4.1 3.3c2.2-.4 4.4 1.1 4.8 3.3.4 2.5-1.3 4.5-3.9 4.9V19H7z"/><path d="M7 19h10v2H7z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
 swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
 check:'<path d="m5 12 4.5 4.5L19 7"/>'
};

/* ---------- dish card ---------- */
const isFav=id=>favs.includes(id);
function cardHTML(d,opt){const u=t();const m=match(d);const P=opt&&opt.pantry&&pantry.length>0;
  const line=P?(!m.miss.length?`<div class="ml ok">${u.allHave}</div>`:`<div class="ml">${u.lack}: ${esc(m.miss.slice(0,3).join(", "))}${m.miss.length>3?` +${m.miss.length-3}`:""}</div>`)
    :`<div class="ml n">${esc(u[d.type])} · ${u.ingN(m.need)}</div>`;
  return `<div class="card" data-open="${d.id}" role="button" tabindex="0" aria-label="${esc(dn(d))}">
    <div class="cover" data-cid="${d.id}"${opt&&opt.sizes?` data-sizes="${opt.sizes}"`:""}><div class="ld"></div>
      ${P?`<span class="badge ${m.miss.length?"":"ok"}">${m.have}/${m.need}</span>`:""}
      <span class="ctime">${I(IC.clock)}${fmtTime(d.time)}</span>
      <button class="fav" data-fav="${d.id}" aria-pressed="${isFav(d.id)}" aria-label="${esc(u.save)}">${I(IC.heart)}</button></div>
    <div class="cb"><h3>${esc(dn(d))}</h3><div class="cm"><span class="cf">${d.flag}</span>${esc(trC(d.country))}</div>${line}</div></div>`}
function rowHTML(list,opt){return list.map(d=>cardHTML(d,opt)).join("")}

/* ---------- header, tab bar, footer ---------- */
const ROUTES={home:"#/",recipes:"#/retseptlar",pantry:"#/uyda",menu:"#/menyu",saved:"#/saqlangan",premium:"#/premium"};
function renderChrome(){const u=t();
  document.documentElement.lang=lang;document.title=(view==="home"?"":u.nav[view==="saved"?"saved":view]+" · ")+u.title;
  const md=document.querySelector('meta[name="description"]');md&&md.setAttribute("content",u.desc);
  $("#bname").innerHTML=esc(u.title).replace(" ","<br>");
  $("#nav").innerHTML=[["home",IC.home],["recipes",IC.book],["pantry",IC.basket],["menu",IC.cal]].map(([k,ic])=>`<a href="${ROUTES[k]}" aria-current="${view===k?"page":"false"}">${esc(u.nav[k])}</a>`).join("")
    +`<button type="button" class="navchef" data-chef="1">${I(IC.chef)}${esc(u.nav.chef)}</button><a href="${ROUTES.premium}" class="navprem" aria-current="${view==="premium"?"page":"false"}">${I(IC.crown)}${esc(u.nav.premium)}</a>`;
  $("#tabbar").innerHTML=[["home",IC.home,"#/"],["recipes",IC.book,ROUTES.recipes],["chef",IC.chef,""],["menu",IC.cal,ROUTES.menu],["saved",IC.heart,ROUTES.saved]].map(([k,ic,h])=>k==="chef"
    ?`<button type="button" class="tb mid" data-chef="1"><span class="tbc">${I(ic)}</span><span>${esc(u.tab.chef)}</span></button>`
    :`<a class="tb" href="${h}" aria-current="${view===k?"page":"false"}">${I(ic)}<span>${esc(u.tab[k])}</span></a>`).join("");
  $("#hSaved").setAttribute("aria-label",u.nav.saved);const fn=$("#favN");fn.hidden=!favs.length;fn.textContent=favs.length;
  document.querySelectorAll("#lang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===lang));
  $("#foot").innerHTML=`<div class="wrap fin"><div class="fb"><span class="logo">${$(".brand .logo").innerHTML}</span><b>${esc(u.title)}</b><p>${esc(u.stat(ALL.length,COUNTRIES.filter(c=>c!=="Arab davlatlari"&&REGION[c]!=="Avtonomiyalar").length,COUNTRIES.filter(c=>REGION[c]==="Avtonomiyalar").length))}</p></div>
    <nav class="fl">${["home","recipes","pantry","menu","saved","premium"].map(k=>`<a href="${ROUTES[k]}">${esc(u.nav[k])}</a>`).join("")}</nav><p class="fsm">${esc(u.foot)}</p><p class="fsm">© 2026 ${esc(u.title)}</p></div>`;
}

/* ---------- router ---------- */
function parseHash(){const h=decodeURIComponent(location.hash.slice(1));
  if(h&&!h.startsWith("/")&&BYID.has(h))return {v:null,dish:h};
  const [path,qs]=h.split("?");const p=(path||"/").replace(/\/+$/,"")||"/";
  const q=new URLSearchParams(qs||"");
  const m=p.match(/^\/taom\/(.+)$/);if(m&&BYID.has(m[1]))return {v:null,dish:m[1]};
  const v={"/":"home","/retseptlar":"recipes","/uyda":"pantry","/menyu":"menu","/saqlangan":"saved","/premium":"premium"}[p]||"home";
  return {v,q}}
let lastDishFrom=null,pushed=false,rendered=false;
function route(){const r=parseHash();
  if(r.dish){if(!rendered)show("home");if(openId!==r.dish)openDish(r.dish);return}
  if(openId){pushed=false;closeDish(true)}
  if(r.v==="recipes"&&r.q&&[...r.q.keys()].length){fC=r.q.get("c")||"";fR=r.q.get("r")||"";fM=r.q.get("m")||"";fT=r.q.get("k")||"";fTime=+(r.q.get("t")||0);nameQ=r.q.get("q")||"";
    if(fC&&!isCountry(fC))fC="";if(fR&&!REGIONS.includes(fR))fR="";limit=48}
  show(r.v)}
function show(v){const prev=view;view=v;rendered=true;
  document.querySelectorAll("#app>.view").forEach(s=>{s.hidden=s.dataset.view!==v});
  renderChrome();
  ({home:renderHome,recipes:renderRecipes,pantry:renderPantry,menu:renderMenu,saved:renderSaved,premium:renderPremium})[v]();
  if(prev!==v)window.scrollTo({top:0,behavior:"instant"in window?"instant":"auto"})}
function go(hash){if(location.hash===hash)route();else location.hash=hash}

/* ---------- home ---------- */
const hash32=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const daySeed=()=>{const d=new Date();return d.getFullYear()*1000+Math.floor((d-new Date(d.getFullYear(),0,1))/864e5)};
function pick(list,n,seed){return list.map(d=>[d,hash32(d.id+":"+seed)]).sort((a,b)=>a[1]-b[1]).slice(0,n).map(x=>x[0])}
const CATS=[["nonushta",d=>d.meals.includes("nonushta"),"m=nonushta"],["tushlik",d=>d.meals.includes("tushlik"),"m=tushlik"],["kechki",d=>d.meals.includes("kechki"),"m=kechki"],
  ["soup",d=>d.type==="suyuq"&&!d.meals.includes("ichimlik"),"k=suyuq"],["shirinlik",d=>d.meals.includes("shirinlik"),"m=shirinlik"],["ichimlik",d=>d.meals.includes("ichimlik"),"m=ichimlik"],
  ["quick",d=>d.time<=30&&!d.meals.includes("ichimlik"),"t=30"],["uz",d=>d.country==="O'zbekiston","c=O'zbekiston"]];
const CAT_COVER={nonushta:"Quymoq",tushlik:"Lag'mon",kechki:"Manti",soup:"Mastava",shirinlik:"Chak-chak",ichimlik:"Ayron",quick:"Shakarob",uz:"Toshkent oshi"};
function catCover(key,test){const pref=ALL.find(d=>d.name===CAT_COVER[key]&&test(d)&&hasPh(d));if(pref)return pref;
  const l=ALL.filter(d=>test(d)&&hasPh(d));return pick(l.filter(d=>d.country==="O'zbekiston").length?l.filter(d=>d.country==="O'zbekiston"):l,1,key)[0]}
function thumb(d,w){const f=d&&filesOf(d)[0];return f?`<img src="${fileUrl(f,w||320)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:""}
let homeDone="";
function renderHome(){const u=t();const key=lang+daySeed()+favs.join();
  $("#hEye").textContent=u.hEye(ALL.length.toLocaleString("ru-RU").replace(/,/g," "),195);
  $("#hTitle").innerHTML=`${esc(u.hT1)} <em>${esc(u.hT2)}</em>`;$("#hSub").textContent=u.hSub;
  $("#sIn").placeholder=u.sPh;$("#sIn").setAttribute("aria-label",u.sPh);$("#hCountL").textContent=u.hCountL;
  $("#qa").innerHTML=[["pantry",IC.basket,ROUTES.pantry],["chef",IC.chef,""],["menu",IC.cal,ROUTES.menu],["premium",IC.crown,ROUTES.premium]].map(([k,ic,h])=>{const [a,b]=u.qa[k];
    return h?`<a class="qb q-${k}" href="${h}"><span class="qi">${I(ic)}</span><span class="qt"><b>${esc(a)}</b><small>${esc(b)}</small></span>${I(IC.arrow,"qar")}</a>`
      :`<button type="button" class="qb q-${k}" data-chef="1"><span class="qi">${I(ic)}</span><span class="qt"><b>${esc(a)}</b><small>${esc(b)}</small></span>${I(IC.arrow,"qar")}</button>`}).join("");
  if(!$("#heroImg").dataset.done){const d=ALL.find(x=>x.name==="Toshkent oshi"&&x.country==="O'zbekiston");const f=d&&filesOf(d)[0];
    if(f){$("#heroImg").innerHTML=`<img src="${fileUrl(f,960)}" srcset="${fileUrl(f,640)} 640w, ${fileUrl(f,960)} 960w, ${fileUrl(f,1280)} 1280w" sizes="(max-width:900px) 70vw, 520px" alt="${esc(dn(d))}" fetchpriority="high" decoding="async" onerror="this.remove()">`;
      $("#heroImg").dataset.open=d.id}$("#heroImg").dataset.done=1}
  $("#tCats").textContent=u.tCats;$("#tChef").textContent=u.tChef;$("#tToday").textContent=u.tToday;$("#tUz").textContent=u.tUz;$("#tWorld").textContent=u.tWorld;$("#tQuick").textContent=u.tQuick;
  ["aToday","aUz","aQuick"].forEach(i=>$("#"+i).textContent=u.seeAll);$("#aWorld").textContent=u.allCountries;
  $("#cats").innerHTML=CATS.map(([k,test,q])=>{const d=catCover(k,test);const n=ALL.filter(test).length;
    return `<a class="cat" href="${ROUTES.recipes}?${q}"><span class="cimg">${thumb(d,320)}</span><b>${esc(u.cats[k])}</b><small>${u.dishes(n)}</small></a>`}).join("");
  if(homeDone!==key){homeDone=key;const seed=daySeed();
    $("#rToday").innerHTML=rowHTML(pick(ALL.filter(d=>hasPh(d)&&!d.meals.includes("ichimlik")),10,seed),{sizes:"240px"});
    $("#rUz").innerHTML=rowHTML(pick(ALL.filter(d=>d.country==="O'zbekiston"&&hasPh(d)),10,seed+1),{sizes:"240px"});
    $("#rQuick").innerHTML=rowHTML(pick(ALL.filter(d=>d.time<=30&&hasPh(d)&&!d.meals.includes("ichimlik")),10,seed+2),{sizes:"240px"});
    observeCovers($("#vHome"))}
  else document.querySelectorAll("#vHome .card").forEach(c=>{const d=BYID.get(c.dataset.open);c.querySelector("h3").textContent=dn(d);c.querySelector(".cm").innerHTML=`<span class="cf">${d.flag}</span>${esc(trC(d.country))}`;c.querySelector(".ml").textContent=`${u[d.type]} · ${u.ingN(match(d).need)}`;c.querySelector(".ctime").innerHTML=`${I(IC.clock)}${fmtTime(d.time)}`})
  renderWorld();
  $("#promos").innerHTML=[["menu",IC.cal,ROUTES.menu],["premium",IC.crown,ROUTES.premium]].map(([k,ic,h])=>{const [a,b,c]=u.promo[k];
    return `<a class="promo p-${k}" href="${h}"><span class="pic">${I(ic)}</span><span class="ptx"><b>${esc(a)}</b><small>${esc(b)}</small><span class="btn ${k==="premium"?"gold":"line"}">${esc(c)} ${I(IC.arrow)}</span></span></a>`}).join("");
}
let wTab="MDH";
function renderWorld(){const u=t();
  $("#wTabs").innerHTML=REGIONS.map(r=>`<button class="chip sm" data-wtab="${r}" aria-pressed="${wTab===r}">${esc(u.regions[r])}</button>`).join("");
  const list=COUNTRIES.filter(c=>REGION[c]===wTab).sort((a,b)=>(b==="O'zbekiston")-(a==="O'zbekiston")||CNT[b]-CNT[a]);
  $("#wList").innerHTML=list.map(c=>`<a class="cc" href="${ROUTES.recipes}?c=${encodeURIComponent(c)}"><span class="ccf">${FLAG[c]}</span><span class="ccn">${esc(trC(c))}</span><small>${CNT[c]}</small></a>`).join("")}

/* ---------- hero search ---------- */
let sItems=[],sIdx=-1;
function renderDrop(){const u=t();const raw=$("#sIn").value.trim(),q=norm(raw);const box=$("#sDrop");if(q.length<2){box.hidden=true;sItems=[];return}
  const dishes=ALL.filter(d=>[d.name,d.nru,d.nen].some(x=>x&&norm(x).includes(q))).sort((a,b)=>{const s=d=>[d.name,d.nru,d.nen].some(x=>x&&norm(x).startsWith(q))?0:1;return s(a)-s(b)||(b.country==="O'zbekiston")-(a.country==="O'zbekiston")||(hasPh(b)-hasPh(a))}).slice(0,6);
  const ings=[...new Set([...ALIAS.entries()].filter(([a])=>a.startsWith(q)).map(([,c])=>c).concat(VOCAB.filter(v=>norm(trI(v)).startsWith(q))))].filter(v=>!STAPLE.has(v)).slice(0,4);
  const cs=COUNTRIES.filter(c=>[c,...(T.C[c]||[])].some(x=>norm(x).includes(q))).slice(0,3);
  sItems=[...dishes.map(d=>({k:"d",v:d.id})),...ings.map(v=>({k:"i",v})),...cs.map(v=>({k:"c",v})),{k:"q",v:raw}];sIdx=-1;
  let i=0;const it=(html,cls)=>`<button type="button" class="si ${cls}" data-si="${i++}">${html}</button>`;
  box.innerHTML=(dishes.length?`<div class="sg">${esc(u.sDish)}</div>`+dishes.map(d=>it(`<span class="sth">${thumb(d,160)||d.flag}</span><span class="stx"><b>${esc(dn(d))}</b><small>${d.flag} ${esc(trC(d.country))} · ${fmtTime(d.time)}</small></span>`,"sd")).join(""):"")
    +(ings.length?`<div class="sg">${esc(u.sIng)}</div>`+ings.map(v=>it(`<span class="sth em">${ING_EMO[v]||"🧺"}</span><span class="stx"><b>${esc(trI(v))}</b><small>+ ${esc(u.sAddIng)}</small></span>`,"sing")).join(""):"")
    +(cs.length?`<div class="sg">${esc(u.sCountry)}</div>`+cs.map(c=>it(`<span class="sth em">${FLAG[c]}</span><span class="stx"><b>${esc(trC(c))}</b><small>${u.dishes(CNT[c])}</small></span>`,"sc")).join(""):"")
    +it(`<span class="sth em">${I(IC.search)}</span><span class="stx"><b>${esc(u.sAll(raw))}</b></span>`,"sq");
  box.hidden=false}
function choose(n){const x=sItems[n];if(!x)return;$("#sDrop").hidden=true;
  if(x.k==="d")openDish(x.v);else if(x.k==="i"){addPantry([x.v]);$("#sIn").value="";go(ROUTES.pantry)}
  else if(x.k==="c"){$("#sIn").value="";go(`${ROUTES.recipes}?c=${encodeURIComponent(x.v)}`)}else{nameQ=x.v;fC="";fR="";fM="";fT="";fTime=0;go(`${ROUTES.recipes}?q=${encodeURIComponent(x.v)}`)}}

/* ---------- recipes ---------- */
function filtered(){const q=norm(nameQ);
  return ALL.filter(d=>(!fR||REGION[d.country]===fR)&&(!fC||d.country===fC)&&(!fM||d.meals.includes(fM))&&(!fT||d.type===fT)&&(!fTime||d.time<=fTime)
    &&(!q||[d.name,d.nru,d.nen,trC(d.country)].some(x=>x&&norm(x).includes(q))))}
function syncQuery(){if(view!=="recipes")return;const p=new URLSearchParams();if(fC)p.set("c",fC);if(fR)p.set("r",fR);if(fM)p.set("m",fM);if(fT)p.set("k",fT);if(fTime)p.set("t",fTime);if(nameQ)p.set("q",nameQ);
  const h=ROUTES.recipes+(p.toString()?"?"+p:"");try{history.replaceState(null,"",h)}catch(e){}}
function countryLabel(){const u=t();if(fC)return `<span class="fx">${FLAG[fC]}</span><span>${esc(trC(fC))}</span>`;if(fR)return `<span class="fx">🧭</span><span>${esc(u.regions[fR])}</span>`;return `<span class="fx">🌍</span><span>${esc(u.world)}</span>`}
function renderRecipes(){const u=t();
  $("#rTitle").textContent=u.rTitle;$("#rSub").textContent=u.rSub(ALL.length);
  const ni=$("#nameQ");ni.placeholder=u.nameQ;ni.setAttribute("aria-label",u.nameQ);if(document.activeElement!==ni)ni.value=nameQ;
  const n=ALL.filter(d=>(!fR||REGION[d.country]===fR)&&(!fC||d.country===fC)).length;
  $("#pickC").innerHTML=`${countryLabel()}<small>${u.dishes(n)}</small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
  $("#fMeal").innerHTML=[["",u.anyMeal,"✨"],...MEALS.map(m=>[m,u.meals[m],MEAL_IC[m]])].map(([v,l,ic])=>`<button class="chip" data-m="${v}" aria-pressed="${fM===v}"><span aria-hidden="true">${ic}</span>${esc(l)}</button>`).join("");
  $("#fType").innerHTML=[["",u.anyType,"⚖️"],["quyuq",u.quyuq,"🍛"],["suyuq",u.suyuq,"🍜"]].map(([v,l,ic])=>`<button data-k="${v}" aria-pressed="${fT===v}"><span aria-hidden="true">${ic}</span>${esc(l)}</button>`).join("");
  $("#fTime").innerHTML=[0,15,30,60].map(v=>`<button class="chip sm" data-tt="${v}" aria-pressed="${fTime===v}">${v?I(IC.clock):""}${esc(u.times[v])}</button>`).join("");
  const list=filtered();
  $("#rt").textContent=fC?`${FLAG[fC]} ${u.tOf(trC(fC))}`:fR?u.tOf(u.regions[fR]):fM?u.meals[fM]:u.tDef;
  $("#rc").textContent=u.cnt(list.length);
  const fr=$("#fReset");fr.hidden=!(fC||fR||fM||fT||fTime||nameQ);fr.textContent=u.reset;
  const g=$("#grid");
  if(!list.length){g.innerHTML=`<div class="empty"><b>${esc(u.none)}</b>${esc(u.noneF)}</div>`;$("#more").hidden=true;return}
  g.innerHTML=rowHTML(list.slice(0,limit));observeCovers(g);
  const mb=$("#more");mb.hidden=list.length<=limit;mb.textContent=u.more(list.length-limit);syncQuery()}

/* country picker */
let pkR="";
function renderPicker(){const u=t();const q=norm($("#pkSearch").value);
  $("#pkTitle").textContent=u.q1;$("#pkSearch").placeholder=u.search;$("#pkClose").setAttribute("aria-label",u.close);
  $("#pkTabs").innerHTML=[["",u.world],...REGIONS.map(r=>[r,u.regions[r]])].map(([v,l])=>`<button class="chip sm" data-pr="${v}" aria-pressed="${pkR===v}">${esc(l)}</button>`).join("");
  let list=COUNTRIES.filter(c=>(!pkR||REGION[c]===pkR));
  if(q)list=COUNTRIES.filter(c=>[c,...(T.C[c]||[])].some(x=>norm(x).includes(q)));
  list=list.slice().sort((a,b)=>(b==="O'zbekiston")-(a==="O'zbekiston")||trC(a).localeCompare(trC(b),lang));
  const top=q?"":`<button class="pc all" data-pc="" data-prr="${pkR}" aria-pressed="${!fC&&fR===pkR}"><span class="fx">${pkR?"🧭":"🌍"}</span><span class="pn">${esc(pkR?u.allOf(u.regions[pkR]):u.world)}</span><small>${pkR?ALL.filter(d=>REGION[d.country]===pkR).length:ALL.length}</small></button>`;
  $("#pkList").innerHTML=top+list.map(c=>`<button class="pc" data-pc="${esc(c)}" aria-pressed="${fC===c}"><span class="fx">${FLAG[c]}</span><span class="pn">${esc(trC(c))}</span><small>${CNT[c]}</small></button>`).join("")||`<div class="empty">${esc(u.none)}</div>`;
}
function openPicker(region){pkR=region!==undefined?region:fC?REGION[fC]:fR;$("#pkSearch").value="";renderPicker();$("#pov").hidden=false;$("#picker").hidden=false;
  requestAnimationFrame(()=>{$("#pov").classList.add("on");$("#picker").classList.add("on")});document.body.style.overflow="hidden";
  const sel=$("#pkList [aria-pressed=true]");sel&&sel.scrollIntoView({block:"center"})}
function closePicker(){$("#pov").classList.remove("on");$("#picker").classList.remove("on");if(!openId)document.body.style.overflow="";setTimeout(()=>{if(!$("#picker").classList.contains("on")){$("#pov").hidden=true;$("#picker").hidden=true}},300)}

/* ---------- pantry: Uyda nimalar bor? ---------- */
const ING_EMO={"go'sht":"🥩","tovuq":"🍗","qiyma":"🥩","baliq":"🐟","kolbasa":"🌭","jigar":"🫀","sosiska":"🌭","krevetka":"🦐",
 "kartoshka":"🥔","piyoz":"🧅","sabzi":"🥕","pomidor":"🍅","bodring":"🥒","karam":"🥬","sarimsoq":"🧄","bolgar qalampir":"🫑","baqlajon":"🍆","qovoq":"🎃","ko'kat":"🌿","qo'ziqorin":"🍄","makkajo'xori":"🌽","ismaloq":"🥬","ko'k piyoz":"🧅","achchiq qalampir":"🌶️","lavlagi":"🟣","turp":"⚪",
 "tuxum":"🥚","sut":"🥛","qatiq":"🥛","pishloq":"🧀","sariyog'":"🧈","smetana":"🥣","tvorog":"🧀","qaymoq":"🍶",
 "guruch":"🍚","un":"🌾","makaron":"🍝","lapsha":"🍜","non":"🍞","grechka":"🌾","no'xat":"🫘","loviya":"🫘","yasmiq":"🫘","mosh":"🫘","lavash":"🫓","bulg'ur":"🌾","suli":"🌾",
 "olma":"🍎","limon":"🍋","banan":"🍌","shakar":"🍬","asal":"🍯","yong'oq":"🥜","mayiz":"🍇","shokolad":"🍫","o'rik":"🍑","apelsin":"🍊","qulupnay":"🍓","kokos":"🥥",
 "choy":"🍵","qahva":"☕","zira":"🌱","pomidor pastasi":"🥫","kunjut":"⚪","zaytun moyi":"🫒"};
const PGROUPS={meat:["go'sht","tovuq","qiyma","baliq","kolbasa","jigar","sosiska","krevetka"],
 veg:["kartoshka","piyoz","sabzi","pomidor","bodring","karam","sarimsoq","bolgar qalampir","baqlajon","qovoq","ko'kat","qo'ziqorin","makkajo'xori","ismaloq","ko'k piyoz","achchiq qalampir","lavlagi","turp"],
 dairy:["tuxum","sut","qatiq","pishloq","sariyog'","smetana","tvorog","qaymoq"],
 grain:["guruch","un","makaron","lapsha","non","grechka","no'xat","loviya","yasmiq","mosh","lavash","bulg'ur","suli"],
 fruit:["olma","limon","banan","shakar","asal","yong'oq","mayiz","shokolad","o'rik","apelsin","qulupnay","kokos"],
 other:["choy","qahva","zira","pomidor pastasi","kunjut","zaytun moyi"]};
for(const k in PGROUPS)PGROUPS[k]=PGROUPS[k].map(canon).filter((v,i,a)=>a.indexOf(v)===i&&(VOCAB.includes(v)||SYN[v]));
function addPantry(items){let n=0;items.map(canon).forEach(i=>{if(i&&!pantry.includes(i)){pantry.push(i);n++}});if(n){store.set("pantry",pantry);pSeg="auto";pLimit=24}return n}
function setPantry(list){pantry=[...new Set((list||[]).map(canon))];store.set("pantry",pantry);if(openId)openDish(openId,true);if(view==="pantry")renderPantry()}
let sugL=[],sugI=0;
function renderSug(){const q=norm($("#pIn").value.split(/[,;]/).pop());const box=$("#pSug");if(!q){box.hidden=true;return}
  const lab=v=>norm(trI(v));const viaAlias=[...ALIAS.entries()].filter(([a])=>a.startsWith(q)).map(([,c])=>c);
  sugL=[...new Set([...VOCAB.filter(v=>lab(v).startsWith(q)||v.startsWith(q)),...viaAlias,...VOCAB.filter(v=>lab(v).includes(q))])].filter(v=>!pantry.includes(v)&&!STAPLE.has(v)).slice(0,6);
  if(!sugL.length){box.hidden=true;return}sugI=Math.min(sugI,sugL.length-1);
  box.innerHTML=sugL.map((s,i)=>`<button data-sg="${esc(s)}" aria-selected="${i===sugI}"><span>${ING_EMO[s]||"🧺"}</span>${esc(trI(s))}</button>`).join("");box.hidden=false}
function pSubmit(){const v=$("#pIn").value;if(!v.trim())return;if(!/[,;]/.test(v)&&sugL.length&&!$("#pSug").hidden&&!VOCAB.includes(canon(v)))addPantry([sugL[sugI]]);else addPantry(v.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean));$("#pIn").value="";$("#pSug").hidden=true;renderPantry()}
function renderPantry(){const u=t();
  $("#pTitle").textContent=u.pTitle;$("#pSub").textContent=u.pSub;$("#pIn").placeholder=u.pPh;$("#pIn").setAttribute("aria-label",u.pTitle);$("#pAdd").textContent=u.add;$("#pNote").textContent=u.note;
  $("#pMine").innerHTML=pantry.map(p=>`<span class="tag"><span>${ING_EMO[p]||"🧺"}</span>${esc(trI(p))}<button data-rm="${esc(p)}" aria-label="${esc(trI(p))} — ${u.remove}">×</button></span>`).join("")
    +(pantry.length?`<button class="clr" data-clr="1">${esc(u.clear)}</button>`:"");
  $("#pTabs").innerHTML=Object.keys(PGROUPS).map(k=>`<button class="chip sm" data-pg="${k}" aria-pressed="${pGroup===k}">${esc(u.groups[k])}</button>`).join("");
  $("#pIngs").innerHTML=PGROUPS[pGroup].map(v=>{const on=pantry.includes(v);return `<button class="ing" data-ing="${esc(v)}" aria-pressed="${on}"><span class="ie">${ING_EMO[v]||"🧺"}</span><span class="il">${esc(trI(v))}</span>${on?`<span class="ick">${I(IC.check)}</span>`:""}</button>`}).join("");
  const g=$("#pGrid");
  if(!pantry.length){$("#pSeg").hidden=true;$("#prt").textContent="";$("#prc").textContent="";g.innerHTML=`<div class="empty">${esc(u.pEmpty)}</div>`;$("#pMore").hidden=true;return}
  const list=ALL.map(d=>({d,m:match(d)})).filter(x=>x.m.have>0);
  list.sort((a,b)=>a.m.miss.length-b.m.miss.length||(b.m.have/(b.m.need||1))-(a.m.have/(a.m.need||1))||hasPh(b.d)-hasPh(a.d)||a.d.time-b.d.time);
  const now=list.filter(x=>!x.m.miss.length),near=list.filter(x=>x.m.miss.length>0&&x.m.miss.length<=2);
  let s=pSeg;if(s==="auto")s=now.length?"now":near.length?"near":"all";
  const sg=$("#pSeg");sg.hidden=false;
  sg.innerHTML=[["now",u.now,now.length],["near",u.near,near.length],["all",u.all,list.length]].map(([k,l,n])=>`<button data-ps="${k}" aria-pressed="${s===k}">${esc(l)} <small>${n}</small></button>`).join("");
  const shown=s==="now"?now:s==="near"?near:list;
  $("#prt").textContent=s==="now"?u.tNow:s==="near"?u.tNear:u.tAll;$("#prc").textContent=u.cnt(shown.length);
  if(!shown.length){g.innerHTML=`<div class="empty"><b>${esc(u.none)}</b>${esc(u.noneNow)}</div>`;$("#pMore").hidden=true;return}
  g.innerHTML=shown.slice(0,pLimit).map(x=>cardHTML(x.d,{pantry:1})).join("");observeCovers(g);
  const mb=$("#pMore");mb.hidden=shown.length<=pLimit;mb.textContent=u.more(shown.length-pLimit)}

/* ---------- weekly menu (built from the existing dishes, kept on this device) ---------- */
let menu=store.get("menu",{seed:1,swaps:{}});if(!menu||typeof menu!=="object")menu={seed:1,swaps:{}};
let wOff=0;
const SLOTS=["nonushta","tushlik","kechki"];
const POOL={};SLOTS.forEach(s=>{const l=ALL.filter(d=>d.meals.includes(s)&&!d.meals.includes("ichimlik"));POOL[s]=[...l.filter(hasPh),...l.filter(d=>!hasPh(d))]});
function monday(off){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7)+off*7);return d}
function weekKey(off){const m=monday(off);return m.getFullYear()+"-"+(m.getMonth()+1)+"-"+m.getDate()}
function weekPlan(off){const wk=weekKey(off),used=new Set(),plan=[];
  for(let i=0;i<7;i++){const day={};for(const s of SLOTS){const pool=POOL[s];const top=Math.min(pool.length,Math.max(60,pool.filter(hasPh).length));
    let k=(hash32(wk+":"+menu.seed+":"+i+":"+s)+(menu.swaps[wk+":"+i+":"+s]||0)*7919)%top;let tries=0;
    while(used.has(pool[k].id)&&tries++<top)k=(k+1)%top;used.add(pool[k].id);day[s]=pool[k]}plan.push(day)}
  return plan}
function renderMenu(){const u=t();
  $("#mTitle").textContent=u.mTitle;$("#mSub").textContent=u.mSub;$("#mNew").textContent=u.mNew;
  const m0=monday(wOff),m6=new Date(m0);m6.setDate(m0.getDate()+6);
  const fd=d=>`${d.getDate()} ${u.mon[d.getMonth()]}`;
  $("#mWeek").textContent=`${fd(m0)} – ${fd(m6)}`;
  const plan=weekPlan(wOff);const today=(new Date().getDay()+6)%7;
  $("#mDays").innerHTML=plan.map((day,i)=>`<article class="day${wOff===0&&i===today?" today":""}"><header><b>${esc(u.days[i])}</b><small>${fd(new Date(m0.getFullYear(),m0.getMonth(),m0.getDate()+i))}</small></header>
    ${SLOTS.map(s=>{const d=day[s];return `<div class="slot"><button class="sopen" data-open="${d.id}"><span class="sth">${thumb(d,200)||`<span class="sfl">${d.flag}</span>`}</span><span class="stx"><small>${esc(u.slots[s])}</small><b>${esc(dn(d))}</b><i>${d.flag} ${fmtTime(d.time)}</i></span></button>
      <button class="sw" data-swap="${i}:${s}" aria-label="${esc(u.swap)}" title="${esc(u.swap)}">${I(IC.swap)}</button></div>`}).join("")}</article>`).join("");
  // shopping list
  const cnt=new Map();plan.forEach(day=>SLOTS.forEach(s=>{const seen=new Set();day[s].ing.forEach(([n,,o])=>{const c=canon(n);if(o||STAPLE.has(c)||seen.has(c))return;seen.add(c);cnt.set(c,(cnt.get(c)||0)+1)})}));
  const got=store.get("shop:"+weekKey(wOff),[]);
  const items=[...cnt.entries()].sort((a,b)=>b[1]-a[1]||trI(a[0]).localeCompare(trI(b[0])));
  $("#mShopT").textContent=u.shopT;$("#mShopN").textContent=u.shopN(items.length);$("#mShopNote").textContent=u.shopNote;
  $("#mShop").innerHTML=items.map(([c,n])=>`<li><label><input type="checkbox" data-shop="${esc(c)}"${got.includes(c)?" checked":""}><span class="se">${ING_EMO[c]||"🧺"}</span><span class="sn">${esc(trI(c))}</span><small>${esc(u.inN(n))}</small></label></li>`).join("")}

/* ---------- saved ---------- */
function toggleFav(id){const u=t();if(isFav(id)){favs=favs.filter(x=>x!==id);toast(u.unsaved)}else{favs.unshift(id);toast(u.savedT)}store.set("favs",favs);
  document.querySelectorAll(`[data-fav="${CSS.escape(id)}"]`).forEach(b=>b.setAttribute("aria-pressed",isFav(id)));
  const fn=$("#favN");fn.hidden=!favs.length;fn.textContent=favs.length;if(view==="saved")renderSaved()}
function renderSaved(){const u=t();const list=favs.map(id=>BYID.get(id)).filter(Boolean);
  $("#fTitle").textContent=u.fTitle;$("#fSub").textContent=list.length?u.fSub(list.length):"";
  const g=$("#fGrid");if(!list.length){g.innerHTML=`<div class="empty"><span class="eh">${I(IC.heart)}</span><b>${esc(u.fEmpty[0])}</b>${esc(u.fEmpty[1])}</div>`;return}
  g.innerHTML=rowHTML(list);observeCovers(g)}

/* ---------- premium (design only; payments are not connected yet) ---------- */
let premPlan="y";
function renderPremium(){const u=t(),p=u.prem;
  $("#prem").innerHTML=`<div class="pcrown">${I(IC.crown)}</div><h1>${esc(p.title)}</h1><p class="psub">${esc(p.sub)}</p>
    <div class="ptog" role="group"><button data-plan="m" aria-pressed="${premPlan==="m"}">${esc(p.m)}</button><button data-plan="y" aria-pressed="${premPlan==="y"}">${esc(p.y)} <span class="off">${esc(p.off)}</span></button></div>
    <ul class="pfeat">${p.feats.map(f=>`<li><span>${I(IC.check)}</span>${esc(f)}</li>`).join("")}</ul>
    <div class="pprice"><b>${esc(p.price[premPlan])}</b><span>${esc(p.per[premPlan])}</span></div>
    <button class="btn gold big" data-premcta="1">${esc(p.cta)}</button><p class="pnote">${esc(p.note)}</p>`}

/* ---------- detail ---------- */
let openId=null;const timers={};
const ytIcon='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.7 15.1V8.9L15.5 12z"/></svg>';
function ytQuery(d){if(lang==="en"&&d.nen)return d.nen.replace(/\s*\(.*\)$/,"")+" recipe";if(lang==="ru"&&d.nru)return d.nru.replace(/\s*\(.*\)$/,"")+" рецепт";
  return /[а-яё]/i.test(d.q)&&!/рецепт/i.test(d.q)?d.q+" рецепт":d.q}
function related(d){const same=ALL.filter(x=>x.id!==d.id&&x.country===d.country);
  const k=kind(d);const like=ALL.filter(x=>x.id!==d.id&&x.country!==d.country&&kind(x)===k&&x.meals.some(m=>d.meals.includes(m)));
  const a=pick(same.filter(hasPh),6,d.id);if(a.length<6)a.push(...pick(same.filter(x=>!hasPh(x)),6-a.length,d.id));
  return [...a.slice(0,4),...pick(like.filter(hasPh),8-Math.min(4,a.length),d.id)].slice(0,8)}
function openDish(id,keep){
  const d=BYID.get(id);if(!d)return;openId=id;const m=match(d);const u=t();
  const ing=d.ing.map(([n,q,o])=>{const st=STAPLE.has(canon(n)),ok=st||has(n);const cls=st?"base":ok?"have":o?"opt":"lack";
    return `<li class="${cls}"><span class="st">${ok?"✓":o?"–":"✕"}</span><span class="nm">${esc(trI(n))}${o?`<em>${u.opt}</em>`:""}</span><span class="qt">${esc(trQ(q))}</span></li>`}).join("");
  const steps=d.steps.map((s,i)=>{const tm=(s.match(/(\d+)\s*daqiqa/)||[])[1];const k=id+":"+i;
    return `<li><button class="n" data-dn="${i}" aria-label="${u.stepDone(i+1)}">${i+1}</button><div class="tx">${esc(trS(s))}${tm?`<div><button class="tm" data-tm="${k}" data-min="${tm}">⏱ <span>${u.timer(tm)}</span></button></div>`:""}</div></li>`}).join("");
  const sc=$("#sheet .sc"),y=keep&&sc?sc.scrollTop:0;
  $("#sheet").innerHTML=`<div class="sc">
    <div class="dgrid">
      <div class="dgal"><div class="gal"><span class="grab"></span><button class="close" id="cls" aria-label="${u.close}">×</button>
        <div class="track" id="track"><div class="slide"><div class="ld cover" style="position:absolute;inset:0"></div></div></div><div class="dots" id="dots"></div></div>
        <div class="credit" id="credit"></div></div>
      <div class="sb">
        <div class="dtop"><span class="dflag">${d.flag}</span><span>${esc(trC(d.country))}</span><span class="dreg">${esc(u.regions[REGION[d.country]]||"")}</span></div>
        <h2>${esc(dn(d))}</h2>${lang!=="uz"?`<div class="alt">${esc(d.name)}</div>`:""}
        <div class="facts"><div><span>${I(IC.clock)}</span><b>${fmtTime(d.time)}</b></div><div><span>🥕</span><b>${u.ingN(d.ing.length)}</b></div><div><span>👣</span><b>${u.steps(d.steps.length)}</b></div></div>
        <div class="pills">${d.meals.map(x=>`<span class="pill">${MEAL_IC[x]} ${u.meals[x]}</span>`).join("")}<span class="pill g">${u[d.type]}</span></div>
        <div class="acts"><a class="yt" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery(d))}" target="_blank" rel="noopener">${ytIcon}${u.video}</a>
          <button class="ab2 fav" data-fav="${d.id}" aria-pressed="${isFav(d.id)}" aria-label="${esc(u.save)}">${I(IC.heart)}</button><button class="ab2" data-share="${d.id}" aria-label="${esc(u.share)}">${I(IC.share)}</button></div>
        <section><div class="sh2"><h3>${u.ings}</h3><span>${pantry.length?u.have(m.have,m.need):u.cnt(d.ing.length)}</span></div><ul class="ings">${ing}</ul>
          ${pantry.length?(m.miss.length?`<div class="miss">${u.lack}: ${esc(m.miss.join(", "))}</div>`:`<div class="miss ok">${u.allOk}</div>`):""}</section>
        <section><div class="sh2"><h3>${u.cook}</h3><span>${u.steps(d.steps.length)}</span></div><ol class="steps">${steps}</ol></section>
      </div>
    </div>
    <section class="rel"><h3>${esc(u.related)}</h3><div class="row" id="relRow">${rowHTML(related(d),{sizes:"220px"})}</div></section>
  </div>`;
  Object.keys(timers).forEach(updTm);
  if(y)$("#sheet .sc").scrollTop=y;
  observeCovers($("#relRow"));
  photosFor(d).then(ph=>{if(openId!==id)return;const tr=$("#track");if(!tr)return;
    if(!ph.length){tr.innerHTML=`<div class="slide">${tile(d)}</div>`;return}
    const files=filesOf(d);
    tr.innerHTML=files.map((f,i)=>`<div class="slide"><img src="${fileUrl(f,1000)}" srcset="${fileUrl(f,640)} 640w, ${fileUrl(f,1000)} 1000w, ${fileUrl(f,1400)} 1400w" sizes="(max-width:900px) 100vw, 560px" alt="${esc(dn(d))}"${i?' loading="lazy"':""} decoding="async"></div>`).join("");
    const cr=$("#credit");
    const credit=i=>{if(files[i])cr.innerHTML=`<a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(files[i].replace(/ /g,"_"))}" target="_blank" rel="noopener">${u.photos}</a>`};credit(0);
    if(ph.length>1){$("#dots").innerHTML=ph.map((_,i)=>`<button data-dot="${i}" aria-label="${u.photoN(i+1)}" aria-current="${i===0}"></button>`).join("");
      tr.addEventListener("scroll",()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);credit(i);document.querySelectorAll("#dots button").forEach((b,j)=>b.setAttribute("aria-current",i===j))},{passive:true})}
    tr.querySelectorAll("img").forEach(im=>im.onerror=()=>{const s=im.parentNode;s.remove();if(!tr.children.length)tr.innerHTML=`<div class="slide">${tile(d)}</div>`});
  });
  if(keep)return;
  $("#ov").hidden=false;$("#sheet").hidden=false;requestAnimationFrame(()=>{$("#ov").classList.add("on");$("#sheet").classList.add("on")});
  document.body.style.overflow="hidden";
  const want="#/taom/"+id,cur=decodeURIComponent(location.hash);
  if(cur!==want){try{if(parseHash().dish){lastDishFrom=lastDishFrom||ROUTES[view]||"#/";history.replaceState(null,"",want)}else{lastDishFrom=location.hash||"#/";history.pushState(null,"",want);pushed=true}}catch(e){}}
  else if(!lastDishFrom)lastDishFrom=ROUTES[view]||"#/";
}
function closeDish(fromRoute){$("#ov").classList.remove("on");$("#sheet").classList.remove("on");document.body.style.overflow="";openId=null;
  setTimeout(()=>{if(!openId){$("#ov").hidden=true;$("#sheet").hidden=true}},320);
  if(!fromRoute){if(pushed){pushed=false;history.back()}else{const back=lastDishFrom||ROUTES[view]||"#/";try{history.replaceState(null,"",back)}catch(e){}}}
  lastDishFrom=null}
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(x=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=880;o.connect(g);g.connect(a.destination);g.gain.value=.2;o.start(a.currentTime+x);o.stop(a.currentTime+x+.25)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([250,120,250])}catch(e){}}
const fmt=s=>Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
function updTm(k){const b=document.querySelector(`[data-tm="${k}"]`);if(!b)return;const tm=timers[k];b.className="tm"+(tm?(tm.left<=0?" end":" run"):"");b.querySelector("span").textContent=tm?(tm.left<=0?t().ready:fmt(tm.left)):t().timer(b.dataset.min)}
function toggleTm(k,min){if(timers[k]){clearInterval(timers[k].iv);delete timers[k];updTm(k);return}
  const tm={end:Date.now()+min*60000,left:min*60};tm.iv=setInterval(()=>{tm.left=Math.max(0,Math.round((tm.end-Date.now())/1000));updTm(k);if(!tm.left){clearInterval(tm.iv);beep();toast(t().timeUp)}},500);timers[k]=tm;updTm(k)}
let tt;function toast(m){const el=$("#toast");el.textContent=m;el.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>el.classList.remove("on"),2200)}
async function share(id){const d=BYID.get(id);const url=location.origin+location.pathname+"#/taom/"+id;
  try{if(navigator.share){await navigator.share({title:dn(d),url});return}}catch(e){return}
  try{await navigator.clipboard.writeText(url);toast(t().copied)}catch(e){prompt("",url)}}

/* ---------- events ---------- */
const resetList=()=>{limit=48};
let nqT;$("#nameQ").addEventListener("input",()=>{clearTimeout(nqT);nqT=setTimeout(()=>{nameQ=$("#nameQ").value;resetList();renderRecipes()},150)});
$("#sIn").addEventListener("input",renderDrop);
$("#sIn").addEventListener("keydown",e=>{const n=sItems.length;if(e.key==="ArrowDown"&&n){e.preventDefault();sIdx=(sIdx+1)%n}else if(e.key==="ArrowUp"&&n){e.preventDefault();sIdx=(sIdx-1+n)%n}else if(e.key==="Escape"){$("#sDrop").hidden=true;return}else return;
  document.querySelectorAll("#sDrop .si").forEach((b,i)=>b.setAttribute("aria-selected",i===sIdx))});
$("#sForm").addEventListener("submit",e=>{e.preventDefault();const v=$("#sIn").value.trim();if(!v)return;if(sIdx>=0)choose(sIdx);else{renderDrop();choose(sItems.length-1)}});
$("#pIn").addEventListener("input",()=>{sugI=0;const v=$("#pIn").value;if(/[,;]\s*$/.test(v)){addPantry(v.split(/[,;]+/).map(s=>s.trim()).filter(Boolean));$("#pIn").value="";$("#pSug").hidden=true;renderPantry();return}renderSug()});
$("#pIn").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();pSubmit()}else if(e.key==="ArrowDown"&&sugL.length){e.preventDefault();sugI=(sugI+1)%sugL.length;renderSug()}else if(e.key==="ArrowUp"&&sugL.length){e.preventDefault();sugI=(sugI-1+sugL.length)%sugL.length;renderSug()}else if(e.key==="Escape")$("#pSug").hidden=true});
$("#pAdd").addEventListener("click",pSubmit);
$("#pkSearch").addEventListener("input",renderPicker);
$("#more").addEventListener("click",()=>{limit+=48;renderRecipes()});
$("#pMore").addEventListener("click",()=>{pLimit+=24;renderPantry()});
$("#mShop").addEventListener("change",e=>{const c=e.target.dataset.shop;if(!c)return;const k="shop:"+weekKey(wOff);let got=store.get(k,[]);got=e.target.checked?[...new Set([...got,c])]:got.filter(x=>x!==c);store.set(k,got)});
document.addEventListener("click",e=>{
  if(!e.target.closest(".field"))$("#pSug").hidden=true;
  if(!e.target.closest("#sForm"))$("#sDrop").hidden=true;
  if(e.target.id==="ov"){closeDish();return}
  if(e.target.id==="pov"){closePicker();return}
  const fav=e.target.closest("[data-fav]");if(fav){e.preventDefault();e.stopPropagation();toggleFav(fav.dataset.fav);return}
  const card=e.target.closest("[data-open]");if(card&&!e.target.closest("a")){openDish(card.dataset.open);return}
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.lang){if(lang!==d.lang){lang=d.lang;store.set("lang",lang);renderAll();window.dispatchEvent(new Event("np-lang"));if(!$("#picker").hidden)renderPicker()}}
  else if(d.chef){window.NPChef&&window.NPChef.open()}
  else if(d.si!==undefined)choose(+d.si);
  else if(b.id==="pickC")openPicker();
  else if(b.id==="aWorld")openPicker(wTab);
  else if(b.id==="pkClose")closePicker();
  else if(d.pr!==undefined){pkR=d.pr;$("#pkSearch").value="";renderPicker();$("#pkList").scrollTop=0}
  else if(d.pc!==undefined){if(d.pc){fC=d.pc;fR=""}else{fC="";fR=d.prr||""}store.set("fC",fC);store.set("fR",fR);resetList();closePicker();if(view!=="recipes")go(ROUTES.recipes+(fC?"?c="+encodeURIComponent(fC):fR?"?r="+encodeURIComponent(fR):""));else renderRecipes()}
  else if(d.m!==undefined){fM=d.m;resetList();renderRecipes()}
  else if(d.k!==undefined){fT=d.k;resetList();renderRecipes()}
  else if(d.tt!==undefined){fTime=+d.tt;resetList();renderRecipes()}
  else if(b.id==="fReset"){fC="";fR="";fM="";fT="";fTime=0;nameQ="";$("#nameQ").value="";store.set("fC","");store.set("fR","");resetList();renderRecipes()}
  else if(d.wtab){wTab=d.wtab;renderWorld()}
  else if(d.pg){pGroup=d.pg;renderPantry()}
  else if(d.ing){const v=d.ing;if(pantry.includes(v))pantry=pantry.filter(x=>x!==v);else pantry.push(v);store.set("pantry",pantry);pSeg="auto";pLimit=24;renderPantry()}
  else if(d.rm){pantry=pantry.filter(x=>x!==d.rm);store.set("pantry",pantry);pSeg="auto";renderPantry()}
  else if(d.clr){pantry=[];store.set("pantry",pantry);renderPantry()}
  else if(d.sg){addPantry([d.sg]);$("#pIn").value="";$("#pSug").hidden=true;renderPantry();$("#pIn").focus()}
  else if(d.ps){pSeg=d.ps;pLimit=24;renderPantry()}
  else if(d.swap){const [i,s]=d.swap.split(":");const k=weekKey(wOff)+":"+i+":"+s;menu.swaps[k]=(menu.swaps[k]||0)+1;store.set("menu",menu);renderMenu()}
  else if(b.id==="mNew"){menu={seed:(menu.seed||1)+1,swaps:{}};store.set("menu",menu);renderMenu()}
  else if(b.id==="mPrev"){wOff--;renderMenu()}else if(b.id==="mNext"){wOff++;renderMenu()}
  else if(d.plan){premPlan=d.plan;renderPremium()}
  else if(d.premcta)toast(t().prem.soon);
  else if(d.share)share(d.share);
  else if(d.dot){const tr=$("#track");tr.scrollTo({left:+d.dot*tr.clientWidth,behavior:"smooth"})}
  else if(d.dn!==undefined){const li=b.closest("li");li.classList.toggle("done");b.textContent=li.classList.contains("done")?"✓":(+d.dn+1)}
  else if(d.tm)toggleTm(d.tm,+d.min);
  else if(b.id==="cls")closeDish();
});
document.addEventListener("keydown",e=>{
  if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".card[data-open]")){e.preventDefault();openDish(e.target.dataset.open);return}
  if(e.key!=="Escape")return;if(!$("#picker").hidden)closePicker();else if(openId)closeDish()});
$("#heroImg").addEventListener("click",()=>{const id=$("#heroImg").dataset.open;id&&openDish(id)});
function swipe(sh,inner,close){let y0=null;sh.addEventListener("touchstart",e=>{const sc=sh.querySelector(inner);y0=sc&&sc.scrollTop>0?null:e.touches[0].clientY},{passive:true});
 sh.addEventListener("touchmove",e=>{if(y0==null)return;const dy=e.touches[0].clientY-y0;if(dy>0){sh.style.transition="none";sh.style.transform=`translateY(${dy}px)`}},{passive:true});
 sh.addEventListener("touchend",e=>{if(y0==null)return;const dy=e.changedTouches[0].clientY-y0;sh.style.transition="";sh.style.transform="";if(dy>110)close();y0=null})}
swipe($("#sheet"),".sc",()=>closeDish());swipe($("#picker"),"#pkList",closePicker);
window.addEventListener("hashchange",route);
window.addEventListener("popstate",route);
const hdr=$("#hdr");window.addEventListener("scroll",()=>hdr.classList.toggle("sc",window.scrollY>8),{passive:true});
function renderAll(){homeDone="";show(view);if(openId)openDish(openId,true)}

/* API for the AI chef (chef.js) */
window.NP={ALL,BYID,REGION,REGIONS,COUNTRIES,FLAG,CNT,MEALS,STAPLE,SYN,ALIAS,VOCAB,T,
  lang:()=>lang,t,trC,trI,trS,dn,norm,canon,base,fmtTime,match,has,setPantry,pantry:()=>pantry,cardHTML,observeCovers,openDish,esc,store,
  showCountry(c){go(ROUTES.recipes+(c?"?c="+encodeURIComponent(c):""))}};
window.dispatchEvent(new Event("np-ready"));
route();
};
