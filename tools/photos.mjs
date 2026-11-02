// Builds data/photos.js: for every dish, up to 3 Wikimedia Commons photos that show that exact dish.
// Runs in GitHub Actions (needs internet access to Wikipedia/Wikidata/Commons).
// Usage: node tools/photos.mjs
import fs from 'node:fs';

const UA = 'NimaPishiramizBot/1.0 (https://github.com/Bobur-gith/nima-pishiramiz)';
const dishes = JSON.parse(fs.readFileSync('tools/dishes.json', 'utf8'));
const log = [];
fs.writeFileSync('tools/photo-log.txt', '');
const say = (...a) => { const s = new Date().toISOString().slice(11, 19) + ' ' + a.join(' '); console.log(s); log.push(s); fs.appendFileSync('tools/photo-log.txt', s + '\n'); };

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  for (let i = 0; i < 6; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (i + 1)); continue; }
      const j = await r.json();
      if (j.error && j.error.code === 'maxlag') { await sleep(3000); continue; }
      return j;
    } catch (e) { await sleep(1500 * (i + 1)); }
  }
  say('FAILED', url.slice(0, 200));
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
const tokens = s => norm(s).split(/[^a-z0-9а-я]+/).filter(t => t.length >= 4 && !STOP.has(t));

// ---------- 1. articles: lead image + Wikidata item ----------
const byLang = {};
for (const d of dishes) if (d.wiki) {
  const [lg, t] = d.wiki.includes(':') ? d.wiki.split(/:(.+)/) : ['en', d.wiki];
  (byLang[lg] = byLang[lg] || new Set()).add(t);
}
const art = {}; // "lg:title" -> {qid, lead}
for (const [lg, set] of Object.entries(byLang)) {
  await pool(chunks([...set], 50), 3, async titles => {
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
const qids = [...new Set(Object.values(art).filter(Boolean).map(a => a.qid).filter(Boolean))];
const wd = {};
await pool(chunks(qids, 50), 3, async ids => {
  const j = await api('www.wikidata.org', { action: 'wbgetentities', ids: ids.join('|'), props: 'claims|labels', languages: 'en' });
  for (const [id, e] of Object.entries(j.entities || {})) {
    const c = e.claims || {};
    const val = p => (c[p] || []).map(x => x.mainsnak && x.mainsnak.datavalue && x.mainsnak.datavalue.value).filter(Boolean);
    wd[id] = { p18: val('P18'), p373: val('P373')[0] || null, p31: val('P31').map(v => v.id), taxon: !!(c.P171 || c.P225), label: (e.labels && e.labels.en && e.labels.en.value) || '' };
  }
});
const NOTDISH = new Set(['Q1968435', 'Q1778821', 'Q6256', 'Q3624078', 'Q41710', 'Q515', 'Q5', 'Q16521', 'Q11004', 'Q10884', 'Q506']); // cuisine, country, ethnic group, city, human, taxon, vegetable, tree, flower
function articleInfo(wiki) {
  const a = art[wiki.includes(':') ? wiki : 'en:' + wiki];
  if (!a) return null;
  const w = a.qid ? wd[a.qid] : null;
  const generic = /cuisine|culture|food of|dishes of|list of/i.test(a.title) || (w && (w.taxon || w.p31.some(x => NOTDISH.has(x))));
  return { ...a, w, generic };
}

// ---------- 3. candidate photos ----------
const fileInfo = {}; // "Name.jpg" -> {w,h,mime}
function addInfo(p) { const ii = (p.imageinfo || [])[0]; if (ii) fileInfo[p.title.replace(/^File:/, '')] = { w: ii.width, h: ii.height, mime: ii.mime }; }
const goodFile = n => { const f = fileInfo[n]; return f && OKMIME.test(f.mime) && f.w >= 400 && f.h >= 280 && f.w / f.h < 3 && f.h / f.w < 2.2 && !BAD.test(n.replace(/_/g, ' ')); };

const searchCache = {};
async function search(name) {
  const key = norm(name); if (key.length < 4) return [];
  if (searchCache[key]) return searchCache[key];
  const j = await api('commons.wikimedia.org', { action: 'query', generator: 'search', gsrsearch: `intitle:"${clean(name)}" filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20', prop: 'imageinfo', iiprop: 'size|mime' });
  const pages = ((j.query || {}).pages || []).sort((a, b) => (a.index || 0) - (b.index || 0));
  pages.forEach(addInfo);
  return searchCache[key] = pages.map(p => p.title.replace(/^File:/, ''));
}
const catCache = {};
async function category(cat) {
  if (catCache[cat]) return catCache[cat];
  const j = await api('commons.wikimedia.org', { action: 'query', generator: 'categorymembers', gcmtitle: 'Category:' + cat, gcmtype: 'file', gcmlimit: '100', prop: 'imageinfo', iiprop: 'size|mime' });
  const pages = (j.query || {}).pages || [];
  pages.forEach(addInfo);
  return catCache[cat] = pages.map(p => p.title.replace(/^File:/, ''));
}

// which dish "owns" an article's lead image: the one whose name matches the article title best
const groups = {};
dishes.forEach((d, i) => { if (d.wiki) (groups[d.wiki] = groups[d.wiki] || []).push(i); });
const owner = {};
for (const [wiki, idx] of Object.entries(groups)) {
  const a = art[wiki.includes(':') ? wiki : 'en:' + wiki]; const t = norm(a ? a.title : wiki.split(':').pop());
  let best = idx[0], bs = -1;
  for (const i of idx) { const d = dishes[i]; const s = [d.en, d.name, d.ru, d.q].map(norm).some(x => x === t) ? 2 : [d.en, d.name].map(norm).some(x => x.includes(t) || t.includes(x)) ? 1 : 0; if (s > bs) { bs = s; best = i; } }
  owner[wiki] = best;
}

const cand = new Array(dishes.length);
await pool(dishes.map((d, i) => i), 8, async i => {
  const d = dishes[i]; const out = { lead: [], name: [], cat: [] };
  const info = d.wiki ? articleInfo(d.wiki) : null;
  const specific = info && !info.generic;
  if (specific && owner[d.wiki] === i) {
    if (info.lead) out.lead.push(info.lead.replace(/_/g, ' '));
    if (info.w) out.lead.push(...info.w.p18);
  }
  const names = [...new Set([d.en, specific ? info.title : '', d.name, d.ru].map(clean).filter(x => x && norm(x).length >= 4))];
  for (const [ni, n] of names.entries()) {
    if (ni >= 2 && out.lead.length + out.name.filter(goodFile).length >= 4) break;
    out.name.push(...await search(n));
  }
  if (specific && info.w && info.w.p373) {
    const toks = new Set([...tokens(info.title), ...tokens(d.en), ...tokens(d.name), ...tokens(info.w.label)]);
    const files = await category(info.w.p373);
    out.cat = files.filter(f => tokens(f.replace(/\.[a-z]+$/i, '')).some(t => toks.has(t)));
  }
  cand[i] = out;
  if (i % 200 === 0) say('candidates', i);
});

// ---------- 4. verify lead/P18 files on Commons (size, mime) ----------
const unknown = [...new Set(cand.flatMap(c => c.lead).filter(n => !fileInfo[n]))];
await pool(chunks(unknown, 50), 3, async names => {
  const j = await api('commons.wikimedia.org', { action: 'query', titles: names.map(n => 'File:' + n).join('|'), prop: 'imageinfo', iiprop: 'size|mime' });
  for (const p of (j.query || {}).pages || []) if (!p.missing) addInfo(p);
});

// ---------- 5. assign, never reusing a photo ----------
const used = new Map(); const PH = {};
const order = dishes.map((d, i) => i).sort((a, b) => {
  const la = cand[a].lead.length ? 0 : 1, lb = cand[b].lead.length ? 0 : 1;
  if (la !== lb) return la - lb;
  const na = cand[a].name.length + cand[a].cat.length, nb = cand[b].name.length + cand[b].cat.length;
  return na - nb;
});
for (const i of order) {
  const c = cand[i]; const pick = [];
  for (const n of [...c.lead, ...c.name, ...c.cat]) {
    if (pick.length >= 3) break;
    const k = n.replace(/_/g, ' ');
    if (used.has(k) || pick.includes(k) || !goodFile(k)) continue;
    pick.push(k);
  }
  pick.forEach(k => used.set(k, i));
  if (pick.length) PH[dishes[i].k] = pick;
}

fs.writeFileSync('data/photos.js', 'window.PH=' + JSON.stringify(PH) + ';\n');
const none = dishes.filter(d => !PH[d.k]), few = dishes.filter(d => PH[d.k] && PH[d.k].length < 3);
say('with photos', Object.keys(PH).length, 'none', none.length, 'fewer than 3', few.length);
fs.writeFileSync('tools/photo-report.json', JSON.stringify({ none: none.map(d => [d.c, d.name, d.en]), few: few.map(d => [d.c, d.name, d.en, PH[d.k].length]) }, null, 1));

