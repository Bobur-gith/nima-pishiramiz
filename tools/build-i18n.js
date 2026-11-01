// Builds data/i18n.js from the tr/*.txt translation tables.
// Usage: node tools/build-i18n.js  (run from the repo root)
const fs = require('fs');
const rd = f => fs.readFileSync('tr/' + f, 'utf8').split('\n').filter(l => l.trim()).map(l => l.split('\t'));

// countries: idx uz ru en
const C = {};
for (const [uz, ru, en] of rd('countries.txt')) C[uz] = [ru, en];

// ingredients: uz ru en
const I = {};
for (const [uz, ru, en] of rd('ings_tr.txt')) I[uz] = [ru, en];

// quantity words: uz ru en
const W = {};
for (const [uz, ru, en] of rd('qty_tr.txt')) W[uz] = [ru, en];

// steps: id ru en  (+ steps.txt id uz)
const st = {};
for (const [id, ru, en] of rd('steps_tr.txt')) st[id] = [ru, en];
const S = {};
for (const [id, uz] of rd('steps.txt')) { if (!st[id]) throw new Error('step ' + id); S[uz] = st[id]; }

// dish names
const ru = {}, en = {};
for (const f of ['ru1.txt', 'ru2.txt', 'ru3.txt', 'ru4.txt']) for (const [i, n] of rd(f)) ru[i] = n;
for (const [i, n] of rd('en1.txt')) en[i] = n;
Object.assign(ru, { 1359: 'Точитура по-молдавски', 1687: 'Гань-фань' });
const cyr = s => /[а-яё]/i.test(s);
const N = {};
const rows = rd('names.txt');
const out = [];
for (const [i, uz, q, c] of rows) {
  let r, e;
  if (cyr(q)) { r = q.replace(/\s*рецепт$/i, '').trim(); e = en[i]; }
  else { e = q.replace(/\s*recipe$/i, '').trim(); r = ru[i]; }
  if (!r || !e) throw new Error('name ' + i);
  r = r[0].toUpperCase() + r.slice(1); e = e[0].toUpperCase() + e.slice(1);
  out.push({ key: c + '|' + uz, c, r, e });
}
// disambiguate duplicate names across dishes by appending the country
for (const [li, f] of [[1, 'r'], [2, 'e']]) {
  const cnt = {};
  out.forEach(o => { const k = o[f].toLowerCase(); cnt[k] = (cnt[k] || 0) + 1; });
  out.forEach(o => { if (cnt[o[f].toLowerCase()] > 1) o[f] += ' (' + C[o.c][li - 1] + ')'; });
}
for (const o of out) N[o.key] = [o.r, o.e];

const js = 'window.I18N=' + JSON.stringify({ C, I, W, S, N }) + ';\n';
fs.writeFileSync('data/i18n.js', js);
console.log('countries', Object.keys(C).length, 'ings', Object.keys(I).length, 'words', Object.keys(W).length,
  'steps', Object.keys(S).length, 'names', Object.keys(N).length, 'bytes', js.length);
