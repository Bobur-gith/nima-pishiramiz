# Nima pishiramiz? · Что приготовить? · What to cook?

Uyda bor masalliqlarni yozing — 195 davlat va 19 avtonomiyadan 2900 dan ortiq taomdan qaysi birini hozir pishirish mumkinligini ko'ring.

- 3 til: o'zbek, rus, ingliz (tepada UZ / RU / EN)
- 3 savol-filtr: «Qaysi davlat taomini yemoqchisiz?», «Qaysi vaqt uchun taom kerak?», «Quyuq taommi yoki suyuq?»
- «Uyingizda nimalar bor?» — masalliqlarni istalgan tilda yozish mumkin
- Har bir taom: o'ziga xos suratlar (boshqa taomda takrorlanmaydi), YouTube videosi, masalliqlar va qadamlar

Tarjimalar `tr/` papkasida; `node tools/build-i18n.js` ularni `data/i18n.js` ga yig'adi. Yangi taomlar `data/x-*.js` fayllarida tarjimalari bilan birga.

Suratlar: `node tools/export-dishes.js` → `tools/dishes.json`; GitHub Actions (`.github/workflows/photos.yml`) Wikimedia'dan har bir taomga faqat o'ziga tegishli suratlarni tanlab `data/photos.js` ni yozadi; topilmaganlar `tools/photo-report.json` da.


## AI oshpaz

Bosh sahifada va pastki o'ng burchakdagi tugmada animatsion AI oshpaz bor (`chef.js`).
- Retsept qidirish ilovaning o'zida, AI'siz ishlaydi: masalliqlar ("tuxum, kartoshkam bor", "go'shtsiz"), davlat ("italyancha"), vaqt ("tez", "20 daqiqa"), nonushta/tushlik/kechki, sho'rva/quyuq, taom nomi yoki turi ("palov", "somsa", "salat").
- Ovqatga oid boshqa savollarga AI javob beradi (`ai-config.js`): hozir Puter.js orqali bepul. Bunda foydalanuvchi bir marta Puter akkauntiga kiradi. O'z Claude API kalitingiz bo'lsa, `tools/ai-worker.js` ni Cloudflare Worker sifatida joylab, manzilini `endpoint` ga yozing.
