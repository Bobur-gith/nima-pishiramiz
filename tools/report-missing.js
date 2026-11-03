// Turns tools/photo-report.json into a readable list (tools/rasmsiz-taomlar.md), grouped by country.
// Usage: node tools/report-missing.js
const fs = require('fs');
const r = JSON.parse(fs.readFileSync('tools/photo-report.json', 'utf8'));
const total = JSON.parse(fs.readFileSync('tools/dishes.json', 'utf8')).length;
const g = {}; for (const [c, n, en] of r.none) (g[c] = g[c] || []).push(en && en.toLowerCase() !== n.toLowerCase() ? `${n} (${en})` : n);
const cs = Object.keys(g).sort((a, b) => g[b].length - g[a].length || a.localeCompare(b));
let md = `# Surati topilmagan taomlar\n\n`;
md += `${total} ta taomdan ${total - r.none.length} tasiga aynan o'sha taomni ko'rsatadigan surat topildi. Quyidagi ${r.none.length} ta taomga erkin litsenziyali, aniq mos surat topilmadi — ilovada ularning o'rnida taom nomi va bayrog'i yozilgan rangli kartochka chiqadi.\n\n`;
md += `Qidirilgan joylar: Vikipediya (57 til), Wikidata, Wikimedia Commons (nom, toifa, "tasvirlangan" belgisi, to'liq matn).\n\n`;
md += `| Davlat | Soni | Taomlar |\n|---|---|---|\n`;
for (const c of cs) md += `| ${c} | ${g[c].length} | ${g[c].join(', ')} |\n`;
fs.writeFileSync('tools/rasmsiz-taomlar.md', md);
console.log('none', r.none.length, 'countries', cs.length);
