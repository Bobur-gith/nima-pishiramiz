// Guard: the redesign must show exactly the photos from data/photos.js for every dish, and fallback cards for the rest.
// Usage: serve the backup branch on :8766 and this branch on :8765, then: node tools/guard/photo-guard.js <dir with ph0.jpg>
const {chromium}=require('playwright');const fs=require('fs');const S=process.argv[2];
const img=fs.readFileSync(S+'/ph0.jpg');
(async()=>{const b=await chromium.launch();
const mk=async(url)=>{const p=await b.newPage({viewport:{width:1300,height:900}});
  await p.route(/fonts\.g|gstatic|puter/,r=>r.abort());await p.route(/wikimedia\.org/,r=>r.fulfill({contentType:'image/jpeg',body:img}));
  await p.addInitScript(()=>{localStorage.setItem('np:lang','"uz"');localStorage.setItem('np:tipSeen','1')});await p.goto(url);await p.waitForTimeout(2000);return p};
const old=await mk('http://localhost:8766/');const neu=await mk('http://localhost:8765/');
const ids=async p=>p.evaluate(()=>NP.ALL.map(d=>d.id+"|"+d.country+"|"+d.name));
const a=await ids(old),bb=await ids(neu);
console.log('dishes old/new',a.length,bb.length,'same ids & order:',JSON.stringify(a)===JSON.stringify(bb));
// 1) cards: every dish
const r1=await neu.evaluate(async()=>{const box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;width:260px;height:300px;z-index:99999';document.body.appendChild(box);
  const bad=[];let withPh=0,tiles=0;const ALL=NP.ALL;
  for(let i=0;i<ALL.length;i+=200){const part=ALL.slice(i,i+200);
    box.innerHTML=part.map(d=>`<div style="position:absolute;inset:0">${NP.cardHTML(d)}</div>`).join("");NP.observeCovers(box);
    for(let k=0;k<40&&box.querySelector(".cover .ld");k++)await new Promise(r=>setTimeout(r,100));
    box.querySelectorAll('.cover').forEach(c=>{const d=NP.BYID.get(c.dataset.cid);const files=window.PH[d.country+"|"+d.name]||[];const im=c.querySelector('img');const tile=c.querySelector('.tile');
      if(files.length){withPh++;const exp="Special:FilePath/"+encodeURIComponent(files[0])+"?";if(!im||!im.src.includes(exp)||!im.srcset.split(",").every(x=>x.includes(encodeURIComponent(files[0]))))bad.push(['card',d.id,files[0],im&&im.src])}
      else{tiles++;if(!tile||im)bad.push(['tile',d.id])}})}
  box.remove();return {withPh,tiles,bad:bad.slice(0,10),nbad:bad.length}});
console.log('cards:',JSON.stringify(r1));
// 2) detail: every dish, all its photos in order
const r2=await neu.evaluate(async()=>{const bad=[];let n=0;
  for(const d of NP.ALL){NP.openDish(d.id);await Promise.resolve();await new Promise(r=>setTimeout(r,0));
    const files=window.PH[d.country+"|"+d.name]||[];const ims=[...document.querySelectorAll('#track img')];
    if(files.length){if(ims.length!==files.length||ims.some((im,i)=>!im.src.includes(encodeURIComponent(files[i]))))bad.push([d.id,files.length,ims.length])}
    else if(!document.querySelector('#track .tile'))bad.push([d.id,'no tile']);n++}
  return {checked:n,nbad:bad.length,bad:bad.slice(0,10)}});
console.log('detail:',JSON.stringify(r2));
await b.close()})();
