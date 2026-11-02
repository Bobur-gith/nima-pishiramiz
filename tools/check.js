// Validates data: ingredients translated, steps translated, unique keys, ≥10 dishes per country.
const fs=require('fs');global.window=global;require('../data/_db.js');const AR=[];const o2=DB.add2.bind(DB);DB.add2=(c,f,l,r,cn)=>{for(const d of l){if(d.length!==11)AR.push('len '+c+'|'+d[0]);else{const a=d[8].split('|').length,b=d[9].split('|').length,e=d[10].split('|').length;if(a!==b||a!==e)AR.push('arity '+c+'|'+d[0])}}o2(c,f,l,r,cn)};
const html=fs.readFileSync('index.html','utf8');
for(const f of [...html.matchAll(/src="(data\/[^"?]+\.js)/g)].map(m=>m[1]).filter(f=>!/_db|i18n|photos/.test(f)))require('../'+f);
require('../data/i18n.js');const T=window.I18N;const X=DB.x;
const I={...T.I,...X.I},S={...T.S,...X.S},N={...T.N,...X.N},C={...T.C,...X.C};
const err=[];const keys=new Set();const cnt={};
for(const[c,f,l,r]of DB.list){if(!C[c])err.push('country '+c);cnt[c]=l.length;
 for(const d of l){const k=c+'|'+d[0];if(keys.has(k))err.push('dup '+k);keys.add(k);if(!N[k])err.push('name '+k);
  if(!/^[ntksi]+$/.test(d[2]))err.push('meals '+k);if(!/^[qs]$/.test(d[3]))err.push('type '+k);
  for(const x of d[6].split(';')){const n=x.replace(/^\?/,'').split(':')[0].trim();if(!I[n])err.push('ing '+n+' @'+k);if(!x.includes(':'))err.push('qty '+x+' @'+k)}
  for(const s of d[7].split('|'))if(!S[s])err.push('step '+s+' @'+k)}}
const X2=new Set();for(const[c,f,l]of DB.list)for(const d of l){/* check add2 step arity */}
err.push(...AR);console.log([...new Set(err)].slice(0,60).join('\n')||'OK');
const low=Object.entries(cnt).filter(([c,n])=>n<10);console.log('countries',DB.list.length,'dishes',keys.size,'below10',low.length);
if(process.argv[2])console.log(low.map(x=>x.join(':')).join(', '));
