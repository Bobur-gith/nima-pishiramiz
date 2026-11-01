const fs=require('fs');const L=[];global.DB={add(c,f,l,r){L.push([c,l])}};
for(const f of fs.readdirSync('data'))if(f.endsWith('.js'))require('../data/'+f);
const steps=new Map(),ings=new Map(),qty=new Set();const names=[];
for(const[c,l]of L)for(const d of l){names.push([d[0],d[1],c]);d[7].split('|').forEach(s=>{if(!steps.has(s))steps.set(s,steps.size)});
 d[6].split(';').forEach(x=>{const[a,...b]=x.replace(/^\?/,'').split(':');const k=a.trim();if(!ings.has(k))ings.set(k,ings.size);qty.add(b.join(':').trim())})}
fs.writeFileSync('tr/ings.txt',[...ings.keys()].map((k,i)=>i+'\t'+k).join('\n'));
fs.writeFileSync('tr/steps.txt',[...steps.keys()].map((k,i)=>i+'\t'+k).join('\n'));
fs.writeFileSync('tr/names.txt',names.map((n,i)=>i+'\t'+n[0]+'\t'+n[1]+'\t'+n[2]).join('\n'));
fs.writeFileSync('tr/qty.txt',[...qty].join('\n'));
console.log(ings.size,steps.size,names.length,qty.size);
