// Turns tools/photo-report.json into a readable list (tools/rasmsiz-taomlar.md), grouped by country.
// Usage: node tools/report-missing.js
const fs = require('fs');
const r = JSON.parse(fs.readFileSync('tools/photo-report.json', 'utf8'));
const group = rows => { const g = {}; for (const [c, ...rest] of rows) (g[c] = g[c] || []).push(rest); return g; };
const none = group(r.none), few = group(r.few);
let md = '# Surati topilmagan taomlar\n\n';
md += `Jami: ${r.none.length} ta taomning aynan o'ziga tegishli surati topilmadi. Ilovada ularning o'rnida nomi va bayrog'i bilan rangli kartochka chiqadi.\n\n`;
for (const c of Object.keys(none).sort((a, b) => a.localeCompare(b))) {
  md += `**${c}** (${none[c].length}): ` + none[c].map(([n, en]) => en && en !== n ? `${n} (${en})` : n).join(', ') + '\n\n';
}
md += `\n# 3 tadan kam surati bor taomlar\n\nJami: ${r.few.length} ta.\n\n`;
for (const c of Object.keys(few).sort((a, b) => a.localeCompare(b))) {
  md += `**${c}**: ` + few[c].map(([n, , k]) => `${n} — ${k}`).join(', ') + '\n\n';
}
fs.writeFileSync('tools/rasmsiz-taomlar.md', md);
console.log('none', r.none.length, 'few', r.few.length, 'countries without full photos', Object.keys(none).length);
