const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const res={};
for(const [name,url] of [["live","https://bobur-gith.github.io/nima-pishiramiz/"],["preview","https://bobur-gith.github.io/nima-pishiramiz/preview/#/retseptlar"]]){
  const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  const st={};p.on('response',r=>{const u=r.url();if(/wikimedia/.test(u)){const k=r.status();st[k]=(st[k]||0)+1;if(k>=400&&!st.ex)st.ex=[u,k]}});
  await p.goto(url,{waitUntil:'networkidle',timeout:60000}).catch(e=>res[name+"_err"]=String(e));
  await p.waitForTimeout(6000);
  res[name]=await p.evaluate(()=>{const im=[...document.images].filter(i=>/wikimedia/.test(i.currentSrc||i.src));return {total:im.length,loaded:im.filter(i=>i.complete&&i.naturalWidth>0).length,broken:im.filter(i=>i.complete&&i.naturalWidth===0).length,sample:im.slice(0,3).map(i=>[i.currentSrc||i.src,i.naturalWidth]),tiles:document.querySelectorAll('.tile').length}});
  res[name+"_status"]=st;
  await p.screenshot({path:`out/${name}.png`});await p.close()}
fs.writeFileSync('out/diag.json',JSON.stringify(res,null,1));console.log(JSON.stringify(res,null,1));await b.close()})();
