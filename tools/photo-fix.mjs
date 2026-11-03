// One-off clean-up of data/photos.js with the newer rules (so we don't need a full 1-hour rebuild):
// drop hand-blocked files and file names that are clearly not food photos.
import fs from 'node:fs';
const src = fs.readFileSync('data/photos.js', 'utf8'); const PH = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const dishes = Object.fromEntries(JSON.parse(fs.readFileSync('tools/dishes.json', 'utf8')).map(d => [d.k, d]));
const why = JSON.parse(fs.readFileSync('tools/photo-why.json', 'utf8'));
const BLOCK = new Set(JSON.parse(fs.readFileSync('tools/photo-block.json', 'utf8')));
const BAD = /\b(still life|painting|sculpture|nypl|engraving|illustration|drawing|cliff|motor show|hotel|packers|mrd|advertisement|vendor|selling)\b/i;
const clean = s => String(s || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ʻʼ‘’`´']/g, '');
const words = s => norm(s).split(/[^a-z0-9а-я]+/).filter(t => t.length >= 4);
const nameOf = f => f.replace(/_/g, ' ').replace(/\.[a-z]+$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
const same = (a, b) => { if (a === b) return true; const [s, l] = a.length <= b.length ? [a, b] : [b, a]; return s.length >= 4 && l.startsWith(s) && l.length - s.length <= 3; };
const places = JSON.parse(fs.readFileSync('tools/places.json', 'utf8')).flatMap(words).flatMap(t => [t, t.replace(/(istan|stan)$/, '')]).filter(t => t.length >= 4);
const isNat = t => /.{4}cha$/.test(t) || places.some(p => t === p || (t.startsWith(p) && t.length - p.length <= 4));
let removed = 0;
for (const [k, files] of Object.entries(PH)) {
  const d = dishes[k], w = why[k];
  let keep = files.filter(f => !BLOCK.has(f) && !BAD.test(f));
  removed += files.length - keep.length;
  if (keep.length) PH[k] = keep; else delete PH[k];
}
fs.writeFileSync('data/photos.js', 'window.PH=' + JSON.stringify(PH) + ';\n');
const all = Object.values(dishes); const none = all.filter(d => !PH[d.k]), few = all.filter(d => PH[d.k] && PH[d.k].length < 3);
const rep = JSON.parse(fs.readFileSync('tools/photo-report.json', 'utf8'));
fs.writeFileSync('tools/photo-report.json', JSON.stringify({ failed: rep.failed, none: none.map(d => [d.c, d.name, d.en]), few: few.map(d => [d.c, d.name, d.en, PH[d.k].length]) }, null, 1));
console.log('removed files', removed, 'with photos', Object.keys(PH).length, 'none', none.length);
