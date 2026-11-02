// Exports every dish (in page order) to tools/dishes.json for the photo builder.
// Usage: node tools/export-dishes.js   (from the repo root)
const fs = require('fs');
global.window = global;
require('../data/_db.js');
const html = fs.readFileSync('index.html', 'utf8');
const files = [...html.matchAll(/src="(data\/[^"?]+\.js)/g)].map(m => m[1]).filter(f => !/_db|i18n|photos/.test(f));
for (const f of files) require('../' + f);
require('../data/i18n.js');
const N = { ...(window.I18N.N || {}), ...DB.x.N };
const out = [];
for (const [c, , list] of DB.list) for (const r of list) {
  const k = c + '|' + r[0];
  const nm = N[k] || [];
  out.push({ k, c, name: r[0], ru: nm[0] || '', en: nm[1] || '', q: r[1], wiki: r[5] || '' });
}
fs.writeFileSync('tools/dishes.json', JSON.stringify(out));
// ingredient words (uz/ru/en) — the photo builder uses them to tell "potato samsa" from plain samsa
const I = { ...(window.I18N.I || {}), ...DB.x.I };
const words = new Set();
for (const [uz, v] of Object.entries(I)) for (const w of [uz, ...(v || [])]) if (w) words.add(w);
words.add('potato'); words.add('liver'); words.add('pumpkin'); words.add('cheese'); words.add('mushroom');
fs.writeFileSync('tools/ingwords.json', JSON.stringify([...words]));
console.log('dishes', out.length, 'ingredient words', words.size);
