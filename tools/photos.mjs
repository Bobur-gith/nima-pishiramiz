// Builds data/photos.js: for every dish, up to 3 Wikimedia Commons photos that show that exact dish.
// Runs in GitHub Actions (needs internet access to Wikipedia/Wikidata/Commons).
// Usage: node tools/photos.mjs
//
// Where photos come from (in order of trust):
//  1. the main image of the dish's own Wikipedia article (+ Wikidata P18) — only for the dish that "owns" the article
//  2. Commons files tagged "depicts = <the dish's Wikidata item>"
//  3. Commons files whose file name contains the dish name
//  4. files in the dish's Commons category whose file name contains a word of the dish name
// A dish that is a variant of a broader article (e.g. "potato samsa" under "Samsa") only gets photos
// whose file name mentions what makes it different ("potato"), never generic photos of the broader dish.
import fs from 'node:fs';

const UA = 'NimaPishiramizBot/1.1 (https://github.com/Bobur-gith/nima-pishiramiz)';
const dishes = JSON.parse(fs.readFileSync('tools/dishes.json', 'utf8'));
const ingWords = JSON.parse(fs.readFileSync('tools/ingwords.json', 'utf8'));
fs.writeFileSync('tools/photo-log.txt', '');
const say = (...a) => { const s = new Date().toISOString().slice(11, 19) + ' ' + a.join(' '); console.log(s); fs.appendFileSync('tools/photo-log.txt', s + '\n'); };

const sleep = ms => new Promise(r => setTimeout(r, ms));
let pauseUntil = 0, failed = 0, limited = 0;
async function api(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  let last = '';
  for (let i = 0; i < 10; i++) {
    while (Date.now() < pauseUntil) await sleep(pauseUntil - Date.now() + Math.random() * 400);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
      if (r.status === 429 || r.status >= 500) {
        last = 'HTTP ' + r.status;
        const ra = parseInt(r.headers.get('retry-after') || '0', 10) || 0;
        const wait = Math.max(ra * 1000, Math.min(60000, 2000 * 2 ** i));
        if (r.status === 429) { limited++; pauseUntil = Math.max(pauseUntil, Date.now() + wait); } else await sleep(wait);
        continue;
      }
      const j = await r.json();
      if (j.error && j.error.code === 'maxlag') { await sleep(5000); continue; }
      return j;
    } catch (e) { last = String(e && e.message || e); await sleep(Math.min(60000, 2000 * 2 ** i)); }
  }
  failed++;
  say('FAILED', last, url.slice(0, 180));
  return {};
}
async function pool(items, n, fn) {
  let i = 0; const run = async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } };
  await Promise.all(Array.from({ length: n }, run));
}
const chunks = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

// things that are not a photo of food
const BAD = /\b(map|flag|logo|icon|coat of arms|locator|diagram|emblem|signature|portrait|stamp|seal|banknote|coin|menu|restaurant|cafe|shop|store|stall|market|street|building|church|mosque|temple|monument|sign|signboard|poster|label|packag|advert|book|cover|screenshot|plant|tree|field|flower|blossom|seed|harvest|farm|cow|sheep|goat|horse|camel|chicken farm|people|man|woman|girl|boy|family|festival|parade|museum|statue|recipe card|qr code|restorant|spices|ingredients?|ingedients|sheets|souk|plaque|tombeau|congress|sentinel|satellite|vehicle|tank|aircraft|ship)\b|\.svg|\.gif|\.tiff?$|\.pdf|\.djvu/i;
const OKMIME = /image\/(jpeg|png|webp)/;
const clean = s => String(s || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/[«»"“”]/g, '').replace(/\s+/g, ' ').trim();
const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʻʼ‘’`´']/g, '');
const STOP = new Set(['with', 'and', 'the', 'soup', 'salad', 'sauce', 'stew', 'cake', 'bread', 'tea', 'rice', 'meat', 'fish', 'chicken', 'beef', 'lamb', 'pork', 'fried', 'baked', 'grilled', 'style', 'recipe', 'food', 'dish', 'traditional', 'national', 'sweet', 'hot', 'cold', 'green', 'red', 'white', 'black', 'cuisine', 'drink', 'juice', 'pie', 'roll', 'rolls', 'dumplings']);
const words = s => norm(s).split(/[^a-z0-9а-я]+/).filter(t => t.length >= 4);
const tokens = s => words(s).filter(t => !STOP.has(t));
const ING = new Set(ingWords.flat().flatMap(words));
const nameOf = f => f.replace(/_/g, ' ').replace(/\.[a-z]+$/i, '');
const hasAny = (f, set) => words(nameOf(f)).some(t => set.has(t));

// ---------- 1. articles: lead image + Wikidata item ----------
const byLang = {};
for (const d of dishes) if (d.wiki) {
  const [lg, t] = d.wiki.includes(':') ? d.wiki.split(/:(.+)/) : ['en', d.wiki];
  (byLang[lg] = byLang[lg] || new Set()).add(t);
}
const art = {}; // "lg:title" -> {qid, lead, title}
for (const [lg, set] of Object.entries(byLang)) {
  await pool(chunks([...set], 50), 2, async titles => {
    const j = await api(`${lg}.wikipedia.org`, { action: 'query', titles: titles.join('|'), redirects: '1', prop: 'pageimages|pageprops', piprop: 'name', pilicense: 'free', ppprop: 'wikibase_item' });
    const q = j.query || {}; const map = {};
    for (const t of titles) map[t] = t;
    for (const n of q.normalized || []) for (const t of titles) if (map[t] === n.from) map[t] = n.to;
    for (const r of q.redirects || []) for (const t of titles) if (map[t] === r.from) map[t] = r.to;
    const pages = {}; for (const p of q.pages || []) pages[p.title] = p;
    for (const t of titles) { const p = pages[map[t]]; art[lg + ':' + t] = p && !p.missing ? { qid: p.pageprops && p.pageprops.wikibase_item, lead: p.pageimage || null, title: map[t] } : null; }
  });
}
say('articles', Object.keys(art).length, 'missing', Object.values(art).filter(x => !x).length);
// images used inside each article (a cuisine article often shows its dishes: "Ladob.jpg" in "Seychellois cuisine")
const artImgs = {}; // "lg:resolved title" -> [file]
for (const [lg, set] of Object.entries(byLang)) {
  const titles = [...new Set([...set].map(t => art[lg + ':' + t]).filter(Boolean).map(a => a.title))];
  await pool(chunks(titles, 10), 2, async ts => {
    let cont = {};
    for (let k = 0; k < 20; k++) {
      const j = await api(`${lg}.wikipedia.org`, { action: 'query', titles: ts.join('|'), prop: 'images', imlimit: 'max', ...cont });
      for (const p of (j.query || {}).pages || []) for (const im of p.images || []) (artImgs[lg + ':' + p.title] = artImgs[lg + ':' + p.title] || []).push(im.title.replace(/^[^:]+:/, '').replace(/_/g, ' '));
      if (!j.continue || !j.continue.imcontinue) break;
      cont = { imcontinue: j.continue.imcontinue, continue: j.continue.continue };
    }
  });
}
say('article images', Object.values(artImgs).reduce((n, a) => n + a.length, 0));

// ---------- 2. Wikidata: image (P18), Commons category (P373), is it a dish? ----------
const wd = {};
async function loadItems(ids) {
  ids = ids.filter(id => id && !wd[id]);
  await pool(chunks(ids, 50), 2, async part => {
    const j = await api('www.wikidata.org', { action: 'wbgetentities', ids: part.join('|'), props: 'claims|labels|descriptions', languages: 'en|ru|de|fr|es|tr|it|pt|pl' });
    for (const [id, e] of Object.entries(j.entities || {})) {
      const c = e.claims || {};
      const val = p => (c[p] || []).map(x => x.mainsnak && x.mainsnak.datavalue && x.mainsnak.datavalue.value).filter(Boolean);
      wd[id] = { p18: val('P18'), p373: val('P373')[0] || null, p31: val('P31').map(v => v.id), taxon: !!(c.P171 || c.P225), label: (e.labels && e.labels.en && e.labels.en.value) || '', desc: Object.values(e.descriptions || {}).map(x => x.value) };
    }
  });
}
await loadItems([...new Set(Object.values(art).filter(Boolean).map(a => a.qid))]);
const NOTDISH = new Set(['Q1968435', 'Q1778821', 'Q6256', 'Q3624078', 'Q41710', 'Q515', 'Q5', 'Q16521', 'Q11004', 'Q10884', 'Q506']); // cuisine, country, ethnic group, city, human, taxon, vegetable, tree, flower
function articleInfo(wiki) {
  const a = art[wiki.includes(':') ? wiki : 'en:' + wiki];
  if (!a) return null;
  const w = a.qid ? wd[a.qid] : null;
  const generic = /cuisine|culture|food of|dishes of|list of/i.test(a.title) || !!(w && (w.taxon || w.p31.some(x => NOTDISH.has(x))));
  return { ...a, w, generic };
}

// ---------- 3. dishes without their own article: find their Wikidata item by exact name ----------
const FOOD = /\b(dish|dishes|food|soup|stew|bread|flatbread|pastry|pastries|dessert|cake|cookies?|biscuits?|salad|dumplings?|drink|beverage|porridge|pie|confection|confectionery|snack|sausage|cheese|sauce|condiment|noodles?|pancakes?|tea|coffee|liquor|liqueur|beer|wine|cocktail|pudding|sweets?|candy|kebab|meatballs?|fritters?|casserole|jam|curry|buns?|sandwich|delicacy|appetizer|porridge|pilaf|stuffed)\b|блюд|напит|суп|выпеч|пирог|хлеб|десерт|сладост|каша|салат|колбас|сыр|соус|лепёш|лепеш|пельмен|кушань|лакомств|пирож|похл/i;
const NONFOOD = /\b(family name|surname|given name|village|town|city|river|lake|mountain|film|album|song|band|company|species|genus|journal|magazine|restaurant|human settlement|disambiguation)\b|фамилия|село|деревня|город|река|фильм|альбом|песня|компания|^вид |^род /i;
const FOODML = /gericht|speise|getränk|gebäck|suppe|\bplat\b|boisson|soupe|pâtisserie|platillo|\bplato\b|comida|bebida|\bsopa\b|postre|piatto|bevanda|\bdolce\b|zuppa|\bprato\b|\bdoce\b|danie|\bzupa\b|napój|ciasto|yemek|içecek|çorba|tatlı|ekmek/i;
const FOODCLS = new Set(['Q746549', 'Q2095', 'Q19861951', 'Q40050', 'Q41415', 'Q7802', 'Q9266', 'Q182940', 'Q178024']);
const isFoodItem = w => !!w && !w.taxon && !w.p31.some(x => NOTDISH.has(x)) && !w.desc.some(x => NONFOOD.test(x)) && (w.p31.some(x => FOODCLS.has(x)) || w.desc.some(x => FOOD.test(x) || FOODML.test(x)));
const item = new Array(dishes.length).fill(null); // {qid, title, lead, exact, need}
const needWD = [];
dishes.forEach((d, i) => {
  const info = d.wiki ? articleInfo(d.wiki) : null;
  if (info && !info.generic) item[i] = { qid: info.qid, title: info.title, lead: info.lead };
  else needWD.push(i);
});
const wdFound = {};
await pool(needWD, 6, async i => {
  const d = dishes[i];
  for (const [term, lg, via] of [[d.en, 'en', 'en'], [d.ru, 'ru', 'ru'], [d.name, 'en', 'name']]) {
    const t = clean(term); if (norm(t).length < 4) continue;
    const j = await api('www.wikidata.org', { action: 'wbsearchentities', search: t, language: lg, uselang: lg, type: 'item', limit: '7' });
    const hit = (j.search || []).find(r => r.match && norm(r.match.text) === norm(t) && (FOOD.test(r.description || '') || FOODML.test(r.description || '')) && !NONFOOD.test(r.description || ''));
    if (hit) { wdFound[i] = { id: hit.id, via }; break; }
  }
});
await loadItems([...new Set(Object.values(wdFound).map(x => x.id))]);
for (const [i, { id, via }] of Object.entries(wdFound)) {
  const w = wd[id];
  if (!w || w.taxon || w.p31.some(x => NOTDISH.has(x))) continue;
  item[i] = { qid: id, title: w.label || dishes[i].en, lead: null, sure: via !== 'name' };
}
say('dishes without own article', needWD.length, 'matched on Wikidata', Object.keys(wdFound).length);

// ---------- 3b. still nothing? look the exact name up as an article title in other Wikipedias ----------
const CYRW = ['ru', 'uk', 'be', 'kk', 'ky', 'tg', 'tt', 'ba', 'cv', 'ce', 'os', 'bg', 'sr', 'mk', 'mn'];
const LATW = ['en', 'uz', 'tk', 'az', 'tr', 'de', 'fr', 'es', 'it', 'pt', 'ro', 'pl', 'cs', 'sk', 'hu', 'hr', 'sl', 'sq', 'nl', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'id', 'ms', 'tl', 'vi', 'sw', 'af', 'mg', 'ht', 'ca', 'eu', 'gl', 'is', 'mt', 'lb', 'ga', 'cy'];
const local = {}; // dish index -> [{lg, title, qid, lead, via}]
{
  const rest = dishes.map((d, i) => i).filter(i => !item[i]);
  for (const lg of [...CYRW, ...LATW]) {
    const cyr = CYRW.includes(lg);
    const want = {}; // title -> [[i, via]]
    for (const i of rest) {
      const d = dishes[i];
      const terms = cyr ? [[d.ru, 'ru']] : [[d.en, 'en'], [d.name, 'name']];
      for (const [term, via] of terms) { const t = clean(term); if (norm(t).length >= 4) (want[t] = want[t] || []).push([i, via]); }
    }
    await pool(chunks(Object.keys(want), 50), 2, async titles => {
      const j = await api(`${lg}.wikipedia.org`, { action: 'query', titles: titles.join('|'), redirects: '1', prop: 'pageimages|pageprops', piprop: 'name', pilicense: 'free', ppprop: 'wikibase_item|disambiguation' });
      const q = j.query || {}; const map = {};
      for (const t of titles) map[t] = t;
      for (const n of q.normalized || []) for (const t of titles) if (map[t] === n.from) map[t] = n.to;
      for (const r of q.redirects || []) for (const t of titles) if (map[t] === r.from) map[t] = r.to;
      const pages = {}; for (const p of q.pages || []) pages[p.title] = p;
      for (const t of titles) {
        const p = pages[map[t]];
        if (!p || p.missing || !p.pageprops || p.pageprops.disambiguation !== undefined || !p.pageprops.wikibase_item) continue;
        for (const [i, via] of want[t]) (local[i] = local[i] || []).push({ lg, title: p.title, qid: p.pageprops.wikibase_item, lead: p.pageimage || null, via });
      }
    });
  }
  await loadItems([...new Set(Object.values(local).flat().map(x => x.qid))]);
  let n = 0;
  for (const [i, hits] of Object.entries(local)) {
    const h = hits.find(x => isFoodItem(wd[x.qid]));
    if (!h) continue;
    item[i] = { qid: h.qid, title: h.title, lead: h.lead, sure: h.via !== 'name' }; n++;
  }
  say('looked up in other Wikipedias', rest.length, 'found', n);
}

// ---------- 4. what exactly must a photo show? ----------
// "exact": the dish IS the article/item (Ayran (Bulgarian) -> Ayran) -> article photos are fine.
// variant: the dish name has words the article title lacks (Fried lagman -> Lagman, Pancakes with maple syrup -> Maple syrup)
//          -> only photos whose file name contains one of those words.
const MINOR = new Set(['with', 'and', 'the', 'style', 'recipe', 'food', 'dish', 'traditional', 'national', 'homemade', 'classic', 'simple', 'home', 'local', 'typical', 'version', 'from', 'bilan', 'uslubida']);
const NAT_IRREG = ['german', 'somali', 'french', 'dutch', 'swiss', 'welsh', 'scottish', 'scots', 'irish', 'english', 'british', 'greek', 'turkish', 'filipino', 'filipina', 'thai', 'khmer', 'lao', 'malay', 'maori', 'polynesian', 'melanesian', 'arab', 'arabic', 'arabian', 'persian', 'kurdish', 'tatar', 'bashkir', 'chechen', 'ossetian', 'crimean', 'gagauz', 'uyghur', 'uighur', 'tibetan', 'yakut', 'buryat', 'chuvash', 'karelian', 'cypriot', 'czech', 'slovak', 'danish', 'swedish', 'norwegian', 'finnish', 'icelandic', 'spanish', 'portuguese', 'polish', 'burmese', 'myanma', 'creole', 'caribbean', 'african', 'asian', 'european', 'balkan', 'caucasian', 'levantine', 'bedouin', 'swahili', 'zanzibari', 'dagestani', 'kabardian', 'balkar', 'mari', 'dagestan', 'kazan', 'american', 'bengali', 'punjabi', 'kashmiri', 'emirati', 'saudi', 'kiwi', 'aussie', 'catalan', 'basque', 'sicilian', 'neapolitan', 'roman', 'viennese', 'bavarian', 'flemish', 'walloon', 'luxembourgish', 'monegasque', 'sammarinese', 'liechtenstein', 'andorran', 'vatican', 'karakalpak', 'nakhchivan', 'adjarian', 'adjaran', 'yakutian', 'xinjiang', 'zanzibar'].map(norm);
const placeToks = new Set();
for (const n of JSON.parse(fs.readFileSync('tools/places.json', 'utf8'))) for (const t of words(n)) { placeToks.add(t); const st = t.replace(/(istan|stan)$/, ''); if (st.length >= 4) placeToks.add(st); }
const cpl = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };
const lev = (a, b) => { if (Math.abs(a.length - b.length) > 2) return 9; const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
// same word, allowing plural / case endings and one-letter spelling differences (pancake ~ pancakes, голубцы ~ голубці, lagmon ~ lagman)
const same = (a, b) => { if (a === b) return true; const [s, l] = a.length <= b.length ? [a, b] : [b, a]; return (s.length >= 4 && l.startsWith(s) && l.length - s.length <= 2) || cpl(a, b) >= Math.max(5, l.length - 2) || (s.length >= 5 && lev(a, b) <= 1); };
// a country / people word? (Kazakh, Timorese, Chinese …) — careful not to swallow chili (Chile) or samosa (Samoa)
const natPlace = (t, p) => t === p || (t.startsWith(p) && t.length - p.length <= 4) || (cpl(t, p) >= Math.max(4, p.length - 2) && t.length >= p.length && /(an|ian|ean|ese|ish|ic|er|ine|in|ite|ot)$/.test(t));
const natCache = {};
const isNat = (t, uz) => (uz && /.{4}cha$/.test(t)) || NAT_IRREG.includes(t) || (natCache[t] ??= [...placeToks].some(p => natPlace(t, p)));
const distinct = (s, title, uz) => words(s).filter(t => !MINOR.has(t) && !isNat(t, uz) && !title.some(x => same(t, x)));
dishes.forEach((d, i) => {
  const it = item[i]; if (!it) return;
  if (it.sure) { it.exact = true; it.need = null; return; }
  const title = words(it.title);
  const extra = distinct(d.en || d.name, title, !d.en);
  // a one-word name that is just another spelling of the article (Mafe = Maafe, Sahlab = Salep) is the same dish
  const own = words(d.en || d.name).filter(t => !MINOR.has(t) && !isNat(t, !d.en));
  it.exact = extra.length === 0 || (own.length === 1 && extra.length === 1 && title.length <= 2);
  // uz/ru words count only if they are ingredients (tovuq, курица …) and not just the title in another language (karam = sauerkraut)
  const eq = ingWords.filter(tr => words(tr[2]).some(t => title.some(x => same(t, x)))).flat().flatMap(words);
  const ingOnly = ts => ts.filter(t => [...ING].some(x => same(t, x)) && !eq.some(x => same(t, x)));
  it.need = it.exact ? null : [...new Set([...extra, ...ingOnly(distinct(d.name, title, true)), ...ingOnly(distinct(d.ru, title))])];
});
const hasNeed = (f, need) => words(nameOf(f)).some(t => need.some(q => same(t, q)));

// ---------- 5. candidate photos ----------
const fileInfo = {}; // "Name.jpg" -> {w,h,mime,cats}
function addInfo(p) {
  const ii = (p.imageinfo || [])[0]; const k = p.title.replace(/^File:/, '').replace(/_/g, ' ');
  const o = fileInfo[k] || (fileInfo[k] = {});
  if (ii) Object.assign(o, { w: ii.width, h: ii.height, mime: ii.mime });
  if (p.categories) o.cats = (o.cats || []).concat(p.categories.map(c => c.title.replace(/^Category:/, '')));
}
const goodFile = n => { const f = fileInfo[n]; return f && f.w && OKMIME.test(f.mime) && f.w >= 400 && f.h >= 280 && f.w / f.h < 3 && f.h / f.w < 2.2 && !BAD.test(n); };
// a file found by name must also sit in a food category (or in a category named exactly like the dish):
// this drops people, towns, machines … that merely share the dish's name
const FOODCAT = /food|cuisine|dish|soup|stew|bread|pastr|dessert|cake|cookie|biscuit|salad|dumpling|drink|beverage|porridge|\bpies?\b|confection|snack|sausage|chees|sauce|noodle|pancake|\btea\b|coffee|beer|wine|pudding|sweets|kebab|meat|fish|seafood|rice|curry|sandwich|breakfast|lunch|dinner|meal|cooking|cookery|recipe|baked|fried|grill|plov|pilaf|gastronom|culinar|еда|блюд|кухн|суп|хлеб|выпеч|напит|десерт|кулинар|пищ/i;
const foodFile = (n, names) => { const c = (fileInfo[n] || {}).cats || []; return c.some(x => FOODCAT.test(x)) || c.some(x => names.has(norm(x))); };
const fileList = j => { const pages = ((j.query || {}).pages || []).sort((a, b) => (a.index || 0) - (b.index || 0)); pages.forEach(addInfo); return pages.map(p => p.title.replace(/^File:/, '').replace(/_/g, ' ')); };

const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());
const CATS = { clshow: '!hidden', cllimit: 'max' };
const search = name => { const key = norm(name); if (key.length < 4) return Promise.resolve([]); return once('s:' + key, async () => fileList(await api('commons.wikimedia.org', { action: 'query', generator: 'search', gsrsearch: `intitle:"${clean(name)}" filetype:bitmap`, gsrnamespace: '6', gsrlimit: '50', prop: 'imageinfo|categories', iiprop: 'size|mime', ...CATS }))); };
const depicts = qid => once('d:' + qid, async () => fileList(await api('commons.wikimedia.org', { action: 'query', generator: 'search', gsrsearch: `haswbstatement:P180=${qid} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '50', prop: 'imageinfo', iiprop: 'size|mime' })));
const fulltext = name => once('f:' + norm(name), async () => fileList(await api('commons.wikimedia.org', { action: 'query', generator: 'search', gsrsearch: `"${clean(name)}" filetype:bitmap`, gsrnamespace: '6', gsrlimit: '50', prop: 'imageinfo|categories', iiprop: 'size|mime', ...CATS })));
const category = cat => once('c:' + cat, async () => fileList(await api('commons.wikimedia.org', { action: 'query', generator: 'categorymembers', gcmtitle: 'Category:' + cat, gcmtype: 'file', gcmlimit: '100', prop: 'imageinfo', iiprop: 'size|mime' })));

const cand = new Array(dishes.length);
let done = 0;
await pool(dishes.map((d, i) => i), 6, async i => {
  const d = dishes[i]; const it = item[i]; const w = it && it.qid ? wd[it.qid] : null;
  const out = { lead: [], dep: [], name: [], art: [], cat: [], full: [] };
  const phrases = [d.en, d.name, d.ru].map(x => norm(x)).filter(x => x.length >= 4);
  const phraseIn = s => { const n = norm(s); return phrases.some(p => n.includes(p)); };
  const names = new Set([d.en, d.name, d.ru, it ? it.title : '', w ? w.label : ''].filter(Boolean).map(norm));
  const ownToks = new Set([...tokens(d.en), ...tokens(d.name), ...tokens(d.ru), ...(it && it.exact ? [...tokens(it.title), ...tokens(w ? w.label : '')] : [])].filter(t => !isNat(t, true)));
  const fits = f => it && it.need ? hasNeed(f, it.need) : words(nameOf(f)).some(t => [...ownToks].some(q => same(t, q)));
  if (it) {
    const lead = [it.lead && it.lead.replace(/_/g, ' '), ...(w ? w.p18.map(f => f.replace(/_/g, ' ')) : [])].filter(Boolean);
    out.lead = it.exact ? lead : lead.filter(f => hasNeed(f, it.need));
    if (it.qid) out.dep = (await depicts(it.qid)).filter(fits);
  }
  const searchNames = [...new Set([d.en, it && it.exact ? it.title : '', d.name, d.ru].map(clean).filter(x => x && norm(x).length >= 4))];
  for (const [ni, n] of searchNames.entries()) {
    if (ni >= 2 && out.lead.length + out.dep.filter(goodFile).length + out.name.filter(goodFile).length >= 4) break;
    out.name.push(...(await search(n)).filter(f => foodFile(f, names) && (!it || !it.need || hasNeed(f, it.need))));
  }
  if (w && w.p373) out.cat = (await category(w.p373)).filter(fits);
  // pictures inside the dish's Wikipedia article (for a cuisine article: only files named after this very dish)
  if (d.wiki) {
    const key = d.wiki.includes(':') ? d.wiki : 'en:' + d.wiki; const a = art[key];
    const imgs = a ? artImgs[key.split(':')[0] + ':' + a.title] || [] : [];
    const generic = !it || it.title !== a?.title;
    out.art = imgs.filter(f => !BAD.test(f) && (it && it.need && !generic ? hasNeed(f, it.need) : generic ? phraseIn(nameOf(f)) : fits(f)));
  }
  // last resort: Commons full-text search, keeping only files filed in a category named after the dish
  const have = out.lead.length + out.art.length + [...out.dep, ...out.name, ...out.cat].filter(goodFile).length;
  if (have < 3) for (const n of [d.en, d.ru].map(clean).filter(x => x && norm(x).length >= 5)) {
    out.full.push(...(await fulltext(n)).filter(f => foodFile(f, names) && ((fileInfo[f] || {}).cats || []).some(c => phraseIn(c)) && (!it || !it.need || hasNeed(f, it.need))));
    if (out.full.filter(goodFile).length + have >= 3) break;
  }
  cand[i] = out;
  if (++done % 250 === 0) say('candidates', done, 'rate-limited', limited, 'failed', failed);
});

// ---------- 6. check lead/P18 files on Commons (size, mime) ----------
const unknown = [...new Set(cand.flatMap(c => [...c.lead, ...c.art]).filter(n => !fileInfo[n] || !fileInfo[n].w))];
await pool(chunks(unknown, 50), 2, async names => {
  const j = await api('commons.wikimedia.org', { action: 'query', titles: names.map(n => 'File:' + n).join('|'), prop: 'imageinfo', iiprop: 'size|mime' });
  for (const p of (j.query || {}).pages || []) if (!p.missing) addInfo(p);
});

// ---------- 7. assign, never reusing a photo ----------
const used = new Set(); const PH = {};
const nCand = c => c.dep.length + c.name.length + c.art.length + c.cat.length + c.full.length;
// variants first (they can only use photos that name them: "Fried lagman …"), then dishes with an article image, then the rest
const rank = i => item[i] && item[i].need ? 0 : cand[i].lead.length ? 1 : 2;
const order = dishes.map((d, i) => i).sort((a, b) => rank(a) - rank(b) || nCand(cand[a]) - nCand(cand[b]));
for (const i of order) {
  const c = cand[i]; const pick = [];
  for (const k of [...c.lead, ...c.dep, ...c.name, ...c.art, ...c.cat, ...c.full]) {
    if (pick.length >= 3) break;
    if (used.has(k) || pick.includes(k) || !goodFile(k)) continue;
    pick.push(k);
  }
  pick.forEach(k => used.add(k));
  if (pick.length) PH[dishes[i].k] = pick;
}

fs.writeFileSync('tools/photo-why.json', JSON.stringify(Object.fromEntries(dishes.map((d, i) => [d.k, item[i] ? [item[i].title, item[i].need ? item[i].need.join(' ') : '='] : null]))));
fs.writeFileSync('data/photos.js', 'window.PH=' + JSON.stringify(PH) + ';\n');
const none = dishes.filter(d => !PH[d.k]), few = dishes.filter(d => PH[d.k] && PH[d.k].length < 3);
say('with photos', Object.keys(PH).length, 'none', none.length, 'fewer than 3', few.length, 'rate-limited', limited, 'failed requests', failed);
fs.writeFileSync('tools/photo-report.json', JSON.stringify({ failed, none: none.map(d => [d.c, d.name, d.en]), few: few.map(d => [d.c, d.name, d.en, PH[d.k].length]) }, null, 1));
