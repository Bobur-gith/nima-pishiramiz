/* Taomlar bazasi yuklovchisi. DB.add — eski format, DB.add2 — tarjimalari ichida bo'lgan yangi format. */
window.DB={list:[],x:{C:{},I:{},S:{},N:{}},
 add(c,f,l,r){const e=this.list.find(x=>x[0]===c);if(e)e[2].push(...l);else this.list.push([c,f,l,r])},
 // d = [uz, ru, en, meals, type(q|s), minutes, wiki, ingredients, uzSteps, ruSteps, enSteps]
 add2(c,f,l,r,cn){const X=this.x;if(cn&&cn.ru)X.C[c]=[cn.ru,cn.en];const yt=cn&&cn.yt;
  this.add(c,f,l.map(d=>{const[uz,ru,en,m,t,min,wiki,ing,su,sr,se]=d;X.N[c+"|"+uz]=[ru,en];
   const a=su.split("|"),b=sr.split("|"),e=se.split("|");a.forEach((s,i)=>{if(!X.S[s])X.S[s]=[b[i]||s,e[i]||s]});
   return[uz,yt==="ru"?ru:en+" recipe",m,t,min,wiki,ing,su]}),r)},
 ing(o){Object.assign(this.x.I,o)}};
