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
const BAD = /\b(map|flag|logo|icon|coat of arms|locator|diagram|emblem|signature|portrait|stamp|seal|banknote|coin|menu|restaurant|cafe|shop|store|stall|market|street|building|church|mosque|temple|monument|sign|signboard|poster|label|packag|advert|book|cover|screenshot|plant|tree|field|flower|blossom|seed|harvest|farm|cow|sheep|goat|horse|camel|chicken farm|people|man|woman|girl|boy|family|festival|parade|museum|statue|recipe card)\b|\.svg|\.gif|\.tiff?$|\.pdf|\.djvu/i;
const OKMIME = /image\/(jpeg|png|webp)/;
const clean = s => String(s || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/[«»"“”]/g, '').replace(/\s+/g, ' ').trim();
const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʻʼ‘’`´']/g, '');
const STOP = new Set(['with', 'and', 'the', 'soup', 'salad', 'sauce', 'stew', 'cake', 'bread', 'tea', 'rice', 'meat', 'fish', 'chicken', 'beef', 'lamb', 'pork', 'fried', 'baked', 'grilled', 'style', 'recipe', 'food', 'dish', 'traditional', 'national', 'sweet', 'hot', 'cold', 'green', 'red', 'white', 'black', 'cuisine', 'drink', 'juice', 'pie', 'roll', 'rolls', 'dumplings']);
const words = s => norm(s).split(/[^a-z0-9а-я]+/).filter(t => t.length >= 4);
const tokens = s => words(s).filter(t => !STOP.has(t));
const ING = new Set(ingWords.flatMap(words));
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

// ---------- 2. Wikidata: image (P18), Commons category (P373), is it a dish? ----------
const wd = {};
async function loadItems(ids) {
  ids = ids.filter(id => id && !wd[id]);
  await pool(chunks(ids, 50), 2, async part => {
    const j = await api('www.wikidata.org', { action: 'wbgetentities', ids: part.join('|'), props: 'claims|labels', languages: 'en' });
    for (const [id, e] of Object.entries(j.entities || {})) {
      const c = e.claims || {};
      const val = p => (c[p] || []).map(x => x.mainsnak && x.mainsnak.datavalue && x.mainsnak.datavalue.value).filter(Boolean);
      wd[id] = { p18: val('P18'), p373: val('P373')[0] || null, p31: val('P31').map(v => v.id), taxon: !!(c.P171 || c.P225), label: (e.labels && e.labels.en && e.labels.en.value) || '' };
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
const NONFOOD = /\b(cuisine|family name|surname|given name|village|town|city|river|lake|mountain|film|album|song|band|company|species|genus|person|people|ethnic|language|district|region|province|journal|magazine|restaurant)\b|кухня|фамилия|село|деревня|город|река|фильм|альбом|песня|компания|вид |род /i;
const owner = {};
{
  const groups = {};
  dishes.forEach((d, i) => { if (d.wiki) (groups[d.wiki] = groups[d.wiki] || []).push(i); });
  for (const [wiki, idx] of Object.entries(groups)) {
    const a = art[wiki.includes(':') ? wiki : 'en:' + wiki]; const t = norm(a ? a.title : wiki.split(':').pop());
    let best = idx[0], bs = -1;
    for (const i of idx) { const d = dishes[i]; const s = [d.en, d.name, d.ru, d.q].map(norm).some(x => x === t) ? 2 : [d.en, d.name].map(norm).some(x => x.includes(t) || t.includes(x)) ? 1 : 0; if (s > bs) { bs = s; best = i; } }
    owner[wiki] = best;
  }
}
const item = new Array(dishes.length).fill(null); // {qid, title, owner, qual:Set|null}
const needWD = [];
dishes.forEach((d, i) => {
  const info = d.wiki ? articleInfo(d.wiki) : null;
  if (info && !info.generic) item[i] = { qid: info.qid, title: info.title, lead: info.lead, owner: owner[d.wiki] === i };
  else needWD.push(i);
});
const wdFound = {};
await pool(needWD, 6, async i => {
  const d = dishes[i];
  for (const [term, lg] of [[d.en, 'en'], [d.ru, 'ru'], [d.name, 'en']]) {
    const t = clean(term); if (norm(t).length < 4) continue;
    const j = await api('www.wikidata.org', { action: 'wbsearchentities', search: t, language: lg, uselang: lg, type: 'item', limit: '7' });
    const hit = (j.search || []).find(r => r.match && norm(r.match.text) === norm(t) && FOOD.test(r.description || '') && !NONFOOD.test(r.description || ''));
    if (hit) { wdFound[i] = hit.id; break; }
  }
});
await loadItems([...new Set(Object.values(wdFound))]);
for (const [i, id] of Object.entries(wdFound)) {
  const w = wd[id];
  if (!w || w.taxon || w.p31.some(x => NOTDISH.has(x))) continue;
  item[i] = { qid: id, title: w.label || dishes[i].en, lead: null, owner: true };
}
say('dishes without own article', needWD.length, 'matched on Wikidata', Object.keys(wdFound).length);

// variant of a broader article? -> the words that make it different (potato, pumpkin, liver …)
dishes.forEach((d, i) => {
  const it = item[i]; if (!it || it.owner) return;
  const t = new Set(words(it.title));
  const q = [...new Set([...words(d.en), ...words(d.name)])].filter(x => ING.has(x) && !t.has(x));
  it.qual = q.length ? new Set(q) : null;
});

// ---------- 4. candidate photos ----------
const fileInfo = {}; // "Name.jpg" -> {w,h,mime}
function addInfo(p) { const ii = (p.imageinfo || [])[0]; if (ii) fileInfo[p.title.replace(/^File:/, '').replace(/_/g, ' ')] = { w: ii.width, h: ii.height, mime: ii.mime }; }
const goodFile = n => { const f = fileInfo[n]; return f && OKMIME.test(f.mime) && f.w >= 400 && f.h >= 280 && f.w / f.h < 3 && f.h / f.w < 2.2 && !BAD.test(n); };
const fileList = j => { const pages = ((j.query || {}).pages || []).sort((a, b) => (a.index || 0) - (b.index || 0)); pages.forEach(addInfo); return pages.map(p => p.title.replace(/^File:/, '').replace(/_/g, ' ')); };

const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());
const search = name => { const key = norm(name); if (key.length < 4) return Promise.resolve([]); return once('s:' + key, async () => fileList(await api('commons.wikimedia.org', { action: 'query', generator: 'search', gsrsearch: `intitle:"${clean(name)}" filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20', prop: 'imageinfo', iiprop: 'size|mime' }))); };
const depicts = qid => once('d:' + qid, async () => fileList(await api('commons.wikimedia.org', { action: 'query', generator: 'search', gsrsearch: `haswbstatement:P180=${qid} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20', prop: 'imageinfo', iiprop: 'size|mime' })));
const category = cat => once('c:' + cat, async () => fileList(await api('commons.wikimedia.org', { action: 'query', generator: 'categorymembers', gcmtitle: 'Category:' + cat, gcmtype: 'file', gcmlimit: '100', prop: 'imageinfo', iiprop: 'size|mime' })));

const cand = new Array(dishes.length);
let done = 0;
await pool(dishes.map((d, i) => i), 6, async i => {
  const d = dishes[i]; const it = item[i]; const w = it && it.qid ? wd[it.qid] : null;
  const out = { lead: [], dep: [], name: [], cat: [] };
  if (it && it.owner) {
    if (it.lead) out.lead.push(it.lead.replace(/_/g, ' '));
    if (w) out.lead.push(...w.p18.map(f => f.replace(/_/g, ' ')));
  }
  if (it && it.qid) {
    const f = await depicts(it.qid);
    out.dep = it.qual ? f.filter(x => hasAny(x, it.qual)) : f;
  }
  const useTitle = it && (it.owner || !it.qual);
  const names = [...new Set([d.en, useTitle ? it.title : '', d.name, d.ru].map(clean).filter(x => x && norm(x).length >= 4))];
  for (const [ni, n] of names.entries()) {
    if (ni >= 2 && out.lead.length + out.dep.filter(goodFile).length + out.name.filter(goodFile).length >= 4) break;
    out.name.push(...await search(n));
  }
  if (it && w && w.p373) {
    const own = it.qual || new Set([...tokens(d.en), ...tokens(d.name), ...(it.owner || !it.qual ? [...tokens(it.title), ...tokens(w.label)] : [])]);
    out.cat = (await category(w.p373)).filter(f => hasAny(f, own));
  }
  cand[i] = out;
  if (++done % 250 === 0) say('candidates', done, 'rate-limited', limited, 'failed', failed);
});

// ---------- 5. check lead/P18 files on Commons (size, mime) ----------
const unknown = [...new Set(cand.flatMap(c => c.lead).filter(n => !fileInfo[n]))];
await pool(chunks(unknown, 50), 2, async names => {
  const j = await api('commons.wikimedia.org', { action: 'query', titles: names.map(n => 'File:' + n).join('|'), prop: 'imageinfo', iiprop: 'size|mime' });
  for (const p of (j.query || {}).pages || []) if (!p.missing) addInfo(p);
});

// ---------- 6. assign, never reusing a photo ----------
const used = new Set(); const PH = {};
const nCand = c => c.dep.length + c.name.length + c.cat.length;
const order = dishes.map((d, i) => i).sort((a, b) => (cand[a].lead.length ? 0 : 1) - (cand[b].lead.length ? 0 : 1) || nCand(cand[a]) - nCand(cand[b]));
for (const i of order) {
  const c = cand[i]; const pick = [];
  for (const k of [...c.lead, ...c.dep, ...c.name, ...c.cat]) {
    if (pick.length >= 3) break;
    if (used.has(k) || pick.includes(k) || !goodFile(k)) continue;
    pick.push(k);
  }
  pick.forEach(k => used.add(k));
  if (pick.length) PH[dishes[i].k] = pick;
}

fs.writeFileSync('data/photos.js', 'window.PH=' + JSON.stringify(PH) + ';\n');
const none = dishes.filter(d => !PH[d.k]), few = dishes.filter(d => PH[d.k] && PH[d.k].length < 3);
say('with photos', Object.keys(PH).length, 'none', none.length, 'fewer than 3', few.length, 'rate-limited', limited, 'failed requests', failed);
fs.writeFileSync('tools/photo-report.json', JSON.stringify({ failed, none: none.map(d => [d.c, d.name, d.en]), few: few.map(d => [d.c, d.name, d.en, PH[d.k].length]) }, null, 1));
