// Exports every dish (in page order) to tools/dishes.json for the photo builder.
// Usage: node tools/export-dishes.js   (from the repo root)
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const files = [...html.matchAll(/src="(data\/[^"?]+\.js)/g)].map(m => m[1]).filter(f => !/i18n|photos/.test(f));
const L = [];
global.window = global;
global.DB = { list: [], add(c, f, l, r) { L.push([c, f, l, r]); }, tr() {}, ing() {} };
for (const f of files) require('../' + f);
global.I18N = {};
require('../data/i18n.js');
const N = (global.I18N || window.I18N).N || {};
const out = [];
for (const [c, , list] of L) for (const r of list) {
  const k = c + '|' + r[0];
  const nm = N[k] || [];
  out.push({ k, c, name: r[0], ru: nm[0] || '', en: nm[1] || '', q: r[1], wiki: r[5] || '' });
}
fs.writeFileSync('tools/dishes.json', JSON.stringify(out));
console.log('dishes', out.length);
