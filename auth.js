// Google orqali kirish + admin ruxsati (Firebase Auth + Firestore)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,updateDoc,onSnapshot,collection,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ADMIN="bob220396@gmail.com";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const getLang=()=>{try{const v=JSON.parse(localStorage.getItem("np:lang"));if(["uz","ru","en"].includes(v))return v}catch(e){}const n=(navigator.language||"").slice(0,2);return n==="ru"?"ru":n==="en"?"en":"uz"};
const setLang=l=>{try{localStorage.setItem("np:lang",JSON.stringify(l))}catch(e){}};

const G={
 uz:{title:"Nima pishiramiz?",tag:"195 davlatdan 2148 ta taom — uyingizdagi masalliqlar bilan.",google:"Google orqali kirish",
  wait:"Yuklanmoqda…",pendT:"So'rovingiz yuborildi",pend:"Admin ruxsat berishi bilan ilova shu yerda o'zi ochiladi.",
  blockT:"Kirishga ruxsat berilmagan",block:"Admin bu akkauntga ruxsat bermadi.",other:"Boshqa akkaunt bilan kirish",out:"Chiqish",
  setupT:"Kirish tizimi sozlanmoqda",setup:"Tez orada ilova ochiladi.",err:"Kirishda xatolik. Qaytadan urinib ko'ring.",
  admin:"Admin panel",pending:"Kutayotganlar",approved:"Ruxsat berilgan",blocked:"Bloklangan",approve:"Ruxsat berish",revoke:"Bekor qilish",blockB:"Bloklash",
  empty:"Bu yerda hech kim yo'q",you:"siz",close:"Yopish",privacy:"Faqat ismingiz, emailingiz va rasmingiz saqlanadi."},
 ru:{title:"Что приготовить?",tag:"2148 блюд из 195 стран — из того, что есть у вас дома.",google:"Войти через Google",
  wait:"Загрузка…",pendT:"Заявка отправлена",pend:"Как только администратор даст доступ, приложение откроется здесь само.",
  blockT:"Доступ не разрешён",block:"Администратор не дал доступ этому аккаунту.",other:"Войти с другого аккаунта",out:"Выйти",
  setupT:"Вход настраивается",setup:"Приложение скоро откроется.",err:"Ошибка входа. Попробуйте ещё раз.",
  admin:"Админ-панель",pending:"Ожидают",approved:"С доступом",blocked:"Заблокированы",approve:"Дать доступ",revoke:"Отозвать",blockB:"Заблокировать",
  empty:"Здесь никого нет",you:"вы",close:"Закрыть",privacy:"Сохраняются только имя, email и фото."},
 en:{title:"What to cook?",tag:"2,148 dishes from 195 countries — with what you have at home.",google:"Sign in with Google",
  wait:"Loading…",pendT:"Request sent",pend:"As soon as the admin approves you, the app will open right here.",
  blockT:"Access not granted",block:"The admin hasn't allowed this account.",other:"Use another account",out:"Sign out",
  setupT:"Sign-in is being set up",setup:"The app will open soon.",err:"Sign-in failed. Please try again.",
  admin:"Admin panel",pending:"Pending",approved:"Approved",blocked:"Blocked",approve:"Approve",revoke:"Revoke",blockB:"Block",
  empty:"Nobody here",you:"you",close:"Close",privacy:"Only your name, email and photo are stored."}
};
const g=()=>G[getLang()];
const GICON='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

let gateState="wait",user=null,isAdmin=false,started=false,users=[],tab="pending",unsubMe=null,unsubAll=null,errMsg="";

/* ---------- gate screen ---------- */
function langSw(){const l=getLang();return `<div class="lang" role="group">${["uz","ru","en"].map(x=>`<button data-glang="${x}" aria-pressed="${x===l}">${x.toUpperCase()}</button>`).join("")}</div>`}
function renderGate(state){if(state)gateState=state;const t=g();const el=$("#gate");if(!el)return;
  let body="";
  if(gateState==="out")body=`<button class="gbtn" id="gIn">${GICON}<span>${t.google}</span></button><p class="gsm">${t.privacy}</p>${errMsg?`<p class="gerr">${esc(errMsg)}</p>`:""}`;
  else if(gateState==="pending")body=`<div class="gst"><span class="gic">⏳</span><b>${t.pendT}</b><p>${t.pend}</p><div class="gme">${user&&user.photoURL?`<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">`:""}<span>${esc(user&&user.email)}</span></div></div><button class="glink" data-gout>${t.other}</button>`;
  else if(gateState==="blocked")body=`<div class="gst"><span class="gic">🚫</span><b>${t.blockT}</b><p>${t.block}</p><div class="gme"><span>${esc(user&&user.email)}</span></div></div><button class="glink" data-gout>${t.other}</button>`;
  else if(gateState==="setup")body=`<div class="gst"><span class="gic">🛠️</span><b>${t.setupT}</b><p>${t.setup}</p></div>`;
  else body=`<div class="gspin" aria-label="${t.wait}"></div>`;
  el.innerHTML=`<div class="gtop">${langSw()}</div><div class="gcard"><div class="mark gmark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#2b1d00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18"/><path d="M5 11v5a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-5"/><path d="M2 11h2M20 11h2"/><path d="M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5"/></svg></div><h1>${t.title}</h1><p class="gtag">${t.tag}</p>${body}</div><div class="gfood" aria-hidden="true">🍲 🥟 🍝 🥘 🍣 🌮 🥗 🍰</div>`;
  document.title=t.title;
}
function lock(){document.body.classList.add("locked");$("#gate").hidden=false}
function unlock(){document.body.classList.remove("locked");$("#gate").hidden=true;
  if(!started){started=true;window.startApp&&window.startApp()}renderAcct()}

/* ---------- account chip + admin ---------- */
function renderAcct(){const el=$("#acct");if(!el||!user)return;const n=users.filter(u=>u.status==="pending").length;
  el.hidden=false;el.innerHTML=`<button class="av" id="avBtn" aria-haspopup="menu" aria-label="${esc(user.email)}">${user.photoURL?`<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">`:`<span>${esc((user.displayName||user.email||"?")[0].toUpperCase())}</span>`}${isAdmin&&n?`<i class="dot">${n}</i>`:""}</button>
  <div class="amenu" id="amenu" hidden role="menu"><div class="aw"><b>${esc(user.displayName||"")}</b><small>${esc(user.email)}</small></div>
  ${isAdmin?`<button role="menuitem" data-gadmin>🛡️ ${g().admin}${n?` <i class="cnt">${n}</i>`:""}</button>`:""}<button role="menuitem" data-gout>↩︎ ${g().out}</button></div>`}
function fmtDate(ts){try{const d=ts&&ts.toDate?ts.toDate():null;return d?d.toLocaleDateString(getLang()==="en"?"en-GB":getLang()==="ru"?"ru-RU":"uz-UZ",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""}catch(e){return ""}}
function renderAdmin(){const p=$("#admin");if(!p||p.hidden)return;const t=g();
  const cnt=s=>users.filter(u=>u.status===s).length;
  $("#adTitle").textContent=t.admin;$("#adClose").setAttribute("aria-label",t.close);
  $("#adTabs").innerHTML=["pending","approved","blocked"].map(s=>`<button class="chip sm" data-atab="${s}" aria-pressed="${tab===s}">${t[s]} <small>${cnt(s)}</small></button>`).join("");
  const list=users.filter(u=>u.status===tab).sort((a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0));
  $("#adList").innerHTML=list.length?list.map(u=>{const me=u.email===ADMIN;
    const btns=me?`<span class="ame">${t.you}</span>`:tab==="pending"?`<button class="ab ok" data-aset="approved" data-uid="${esc(u.id)}">✓ ${t.approve}</button><button class="ab no" data-aset="blocked" data-uid="${esc(u.id)}" aria-label="${t.blockB}">✕</button>`
      :tab==="approved"?`<button class="ab no" data-aset="pending" data-uid="${esc(u.id)}">${t.revoke}</button>`
      :`<button class="ab ok" data-aset="approved" data-uid="${esc(u.id)}">✓ ${t.approve}</button>`;
    return `<div class="urow">${u.photo?`<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">`:`<span class="ui">${esc((u.name||u.email||"?")[0].toUpperCase())}</span>`}<div class="un"><b>${esc(u.name||u.email)}</b><small>${esc(u.email)}${u.createdAt?" · "+fmtDate(u.createdAt):""}</small></div><div class="ua">${btns}</div></div>`}).join("")
    :`<div class="empty">${t.empty}</div>`;
}
function openAdmin(){const p=$("#admin");$("#aov").hidden=false;p.hidden=false;renderAdmin();requestAnimationFrame(()=>{$("#aov").classList.add("on");p.classList.add("on")});document.body.style.overflow="hidden"}
function closeAdmin(){$("#aov").classList.remove("on");$("#admin").classList.remove("on");document.body.style.overflow="";setTimeout(()=>{if(!$("#admin").classList.contains("on")){$("#aov").hidden=true;$("#admin").hidden=true}},300)}

/* ---------- firebase ---------- */
const cfg=window.FIREBASE_CONFIG;
if(!cfg||!cfg.apiKey){/* kirish hali sozlanmagan — ilova ochiq ishlaydi */document.body.classList.remove("locked");$("#gate").hidden=true;window.startApp&&window.startApp()}
else{
  lock();
  renderGate("wait");
  const app=initializeApp(cfg),auth=getAuth(app),db=getFirestore(app);
  const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:"select_account"});
  getRedirectResult(auth).catch(e=>{errMsg=g().err;console.warn(e)});
  async function signIn(){errMsg="";try{await signInWithPopup(auth,provider)}catch(e){
    if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/web-storage-unsupported"].includes(e.code))return signInWithRedirect(auth,provider);
    if(e.code!=="auth/popup-closed-by-user"&&e.code!=="auth/cancelled-popup-request"){errMsg=g().err;console.warn(e)}renderGate("out")}}
  async function out(){unsubMe&&unsubMe();unsubAll&&unsubAll();await signOut(auth);location.reload()}
  async function setStatus(uid,status){try{await updateDoc(doc(db,"users",uid),{status,decidedAt:serverTimestamp()})}catch(e){console.warn(e)}}
  onAuthStateChanged(auth,async u=>{
    unsubMe&&unsubMe();unsubAll&&unsubAll();unsubMe=unsubAll=null;user=u;
    if(!u){if(started)location.reload();else renderGate("out");return}
    isAdmin=(u.email||"").toLowerCase()===ADMIN;
    const ref=doc(db,"users",u.uid);
    const base={email:u.email||"",name:u.displayName||"",photo:u.photoURL||""};
    try{
      if(isAdmin){
        await setDoc(ref,{...base,status:"approved",admin:true,lastSeen:serverTimestamp()},{merge:true});
        unlock();
        unsubAll=onSnapshot(collection(db,"users"),s=>{users=s.docs.map(d=>({id:d.id,...d.data()}));renderAcct();renderAdmin()});
        return;
      }
      const snap=await getDoc(ref);
      if(!snap.exists())await setDoc(ref,{...base,status:"pending",createdAt:serverTimestamp()});
      unsubMe=onSnapshot(ref,s=>{const st=(s.data()||{}).status;
        if(st==="approved")unlock();
        else{if(started){location.reload();return}renderGate(st==="blocked"?"blocked":"pending")}});
    }catch(e){console.warn(e);errMsg=g().err;renderGate("out")}
  });
  document.addEventListener("click",e=>{const b=e.target.closest("button");
    if(!e.target.closest("#acct")){const m=$("#amenu");m&&(m.hidden=true)}
    if(e.target.id==="aov"){closeAdmin();return}
    if(!b)return;const d=b.dataset;
    if(b.id==="gIn")signIn();
    else if(d.gout!==undefined)out();
    else if(d.glang){setLang(d.glang);renderGate()}
    else if(b.id==="avBtn"){const m=$("#amenu");m.hidden=!m.hidden}
    else if(d.gadmin!==undefined){$("#amenu").hidden=true;openAdmin()}
    else if(b.id==="adClose")closeAdmin();
    else if(d.atab){tab=d.atab;renderAdmin()}
    else if(d.aset&&isAdmin){b.disabled=true;setStatus(d.uid,d.aset)}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#admin").hidden)closeAdmin()});
}
window.addEventListener("np-lang",()=>{renderAcct();renderAdmin()});
document.addEventListener("click",e=>{const b=e.target.closest("[data-glang]");if(b&&(!cfg||!cfg.apiKey)){setLang(b.dataset.glang);renderGate()}});
