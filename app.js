// The Hangout app: chats, group chats, friends and video calls, powered by Firebase.
import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, query, where, orderBy, limit,
  onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------- tiny helpers ---------- */
const $=s=>document.querySelector(s);
function el(tag,cls,text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
function toast(t){ const e=$("#toast"); e.textContent=t; e.style.display="block"; clearTimeout(toast.t); toast.t=setTimeout(()=>e.style.display="none",3000); }
function store(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
function ago(ts){ if(!ts) return ""; const s=Math.max(1,(Date.now()-ts)/1000); if(s<60) return "now"; if(s<3600) return Math.floor(s/60)+"m"; if(s<86400) return Math.floor(s/3600)+"h"; if(s<604800) return Math.floor(s/86400)+"d"; return new Date(ts).toLocaleDateString(); }
function timeOf(ts){ return new Date(ts).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}); }
const pairId=(a,b)=>a<b?a+"_"+b:b+"_"+a;
const PALETTE=["#e2603f","#2f8f6a","#3f6fe2","#a24fd0","#d0901f","#d04f7f","#1f9bb0","#6b8e23"];
function colorFor(k){ let h=0; for(const c of String(k)) h=(h*31+c.charCodeAt(0))>>>0; return PALETTE[h%PALETTE.length]; }
const GALLERY=[["🦊","#ff9a56","#ff5e7e"],["🐼","#a8e6cf","#3d8b6d"],["🐨","#c3cfe2","#6b7fa8"],["🐯","#ffd36e","#ff7b39"],["🦁","#fbd786","#f7797d"],["🐸","#b4ec51","#429321"],
 ["🐙","#f093fb","#f5576c"],["🦄","#fbc2eb","#a18cd1"],["🐲","#43e97b","#38b27a"],["🦖","#96e6a1","#2e8b57"],["🐧","#89f7fe","#66a6ff"],["🦉","#d4a373","#8b5e34"],
 ["🐝","#fff176","#f9a825"],["🦋","#a1c4fd","#c2e9fb"],["🐬","#4facfe","#00c6fb"],["🐳","#3a7bd5","#00d2ff"],["👾","#8e2de2","#4a00e0"],["🤖","#bdc3c7","#5c6b7a"],
 ["👻","#e0c3fc","#8ec5fc"],["🎃","#f6d365","#fd7e14"],["🌵","#d4fc79","#56ab2f"],["🍄","#ff6a88","#ff99ac"],["🌈","#ff9a9e","#a18cd1"],["🚀","#232526","#5b6cff"],
 ["⚽","#56ab2f","#a8e063"],["🏀","#f7971e","#ffd200"],["🎮","#654ea3","#eaafc8"],["🎸","#cb2d3e","#ef473a"],["🍕","#ffb347","#ffcc33"],["⭐","#f7b733","#fc4a1a"],["🌙","#0f2027","#2c5364"],["🔥","#f12711","#f5af19"]];
const _gal={};
function galleryUrl(id){ if(_gal[id]) return _gal[id]; const g=GALLERY[parseInt(String(id).slice(1),10)-1]; if(!g) return null;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/></linearGradient></defs><rect width="100" height="100" fill="url(#a)"/><circle cx="18" cy="20" r="6" fill="#fff" opacity=".25"/><circle cx="84" cy="80" r="9" fill="#fff" opacity=".18"/><text x="50" y="54" font-size="58" text-anchor="middle" dominant-baseline="middle">${g[0]}</text></svg>`;
  return _gal[id]="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg); }
const AV_EMOJIS=["😎","🤠","🥳","🤓","😺","🐶","🦊","🐼","🐸","🦄","🐙","🦖","👾","🤖","⚽","🏀","🎮","🎸","🍕","🌈","⭐","🔥","🚀","👑"];
const STATUSES=[["🎮","gaming"],["📚","studying"],["😴","sleeping"],["🍕","eating"],["⚽","playing outside"],["🎵","listening to music"],["📺","watching TV"],["🚗","on the go"],["🎨","drawing"],["📖","reading"],["🔇","busy, chat later"],["🥳","bored, talk to me!"]];
const EMOJI=["😀","😂","🤣","😊","😍","🥰","😘","😎","🤩","🥳","😜","🤪","😏","🤔","🤫","😴","😭","😤","😡","🤯","😱","🥺","😇","🤠","🤓","👻","💀","🤖","👽","💩",
 "❤️","🧡","💛","💚","💙","💜","🖤","💖","💯","👍","👎","👏","🙌","🙏","💪","✌️","🤞","👋","🤝","🫶","👀","🔥","✨","⭐","🎉","🎊","🎁","🎂","🎈","🏆",
 "🎮","🕹️","🎲","⚽","🏀","🏈","⚾","🎾","🛹","🎬","🍿","🎵","🎤","🎸","📚","✏️","💻","🍕","🍔","🍟","🌮","🍣","🍩","🍪","🍫","🍦","🧋","☕","🐶","🐱","🦊","🐸","🦄","🌈","☀️","🌙","⚡","❄️"];
const THEMES=[["auto","Classic","#e2603f","",""],
 ["ocean","Ocean","#1c8bbd","#eef7fb,#fff,#12303d,#5d7a87,#d3e7ef,#1c8bbd,#fff,#dff1f8"],
 ["candy","Candy","#e0458b","#fff0f6,#fff,#3d1f2e,#8a5d72,#f6cfe0,#e0458b,#fff,#ffe0ee"],
 ["forest","Forest","#3b8c4a","#f1f6ee,#fff,#1f2e1f,#5f735c,#d4e4cc,#3b8c4a,#fff,#e0efd9"],
 ["sunset","Sunset","#ff6b35","#fff4ec,#fff,#3a2016,#8a6250,#f5d6c2,#ff6b35,#fff,#ffe3d3"],
 ["mint","Mint","#19b38a","#effcf7,#fff,#103a2e,#5a7f73,#cdeee2,#19b38a,#fff,#dcf7ed"],
 ["lavender","Lavender","#8a63f5","#f7f3ff,#fff,#2b1f4a,#7a6c9a,#e6dcff,#8a63f5,#fff,#efe8ff"],
 ["sky","Sky","#2b8fe0","#f0f8ff,#fff,#123047,#62819a,#d3e8f8,#2b8fe0,#fff,#dff0fd"],
 ["bubblegum","Bubblegum","#ff3fb8","#fff2fb,#fff,#4a1638,#94628a,#fbd3ef,#ff3fb8,#fff,#ffe1f5"],
 ["lemon","Lemon","#d9ad00","#fffce8,#fff,#3b3300,#857a3a,#f4ebb5,#d9ad00,#2b2400,#fff4bf"],
 ["galaxy","Galaxy","#a78bfa","#0f0c29,#1d1a3f,#ecebff,#a6a3d1,#34306a,#a78bfa,#fff,#2c2760"],
 ["midnight","Midnight","#4fb3ff","#111418,#1b2027,#e8edf2,#93a0ad,#2b333d,#4fb3ff,#06121e,#1f2d3b"],
 ["lava","Lava","#ff5a1f","#1a0b08,#2a120d,#ffe9e0,#d9a596,#4a2018,#ff5a1f,#fff,#3d1a12"],
 ["neon","Neon","#39ff88","#07070d,#12121e,#eafff3,#9aa7c0,#25253a,#39ff88,#04120a,#1a1a2e"],
 ["cyber","Cyber","#ff2a6d","#0d0221,#1a0b3b,#f2e9ff,#b49bd9,#33186b,#ff2a6d,#fff,#28104f"],
 ["oled","Pitch Black","#ffffff","#000,#0d0d0d,#f2f2f2,#9a9a9a,#222,#fff,#000,#1a1a1a"]];
(function(){ let css=""; for(const [id,,,v] of THEMES){ if(!v) continue; const [bg,card,ink,muted,line,acc,acci,soft]=v.split(",");
  css+=`body[data-theme=${id}]{--bg:${bg};--card:${card};--ink:${ink};--muted:${muted};--line:${line};--accent:${acc};--accent-ink:${acci};--soft:${soft}} html[data-theme=${id}]{background:${bg}}\n`; }
  const s=document.createElement("style"); s.textContent=css; document.head.append(s); })();
function setTheme(id){ store("hangout-theme",id); for(const n of [document.body,document.documentElement]){ if(id==="auto") delete n.dataset.theme; else n.dataset.theme=id; }
  const t=THEMES.find(x=>x[0]===id); const m=document.querySelector('meta[name=theme-color]'); if(m) m.content=t?t[2]:"#e2603f"; }
setTheme(THEMES.some(t=>t[0]===store("hangout-theme"))?store("hangout-theme"):"auto");

/* ---------- not set up yet? ---------- */
if(!firebaseConfig || !firebaseConfig.apiKey || String(firebaseConfig.apiKey).startsWith("PASTE")){
  $("#loading").replaceChildren(); const box=el("div","auth"); box.append(el("div","logo","🛠️"), el("h1",null,"Almost ready!"));
  const c=el("div","card"); c.append(el("div",null,"The Hangout isn't connected to Firebase yet. Open config.js and paste in your Firebase settings (see SETUP-GUIDE.md), then upload it again."));
  box.append(c); $("#loading").append(box); throw new Error("Firebase config missing");
}

const fbApp=initializeApp(firebaseConfig);
const auth=getAuth(fbApp);
const db=getFirestore(fbApp);

/* ---------- state ---------- */
const U={ me:null, user:null, profile:null, users:{}, userSubs:{}, reqOut:[], reqIn:[], chats:[], blocked:new Set(),
  page:"chats", open:null, msgs:[], msgUnsub:null, subs:[], dismissed:new Set(), setupAv:"g1" };
try{ for(const id of JSON.parse(store("hangout-dismissed")||"[]")) U.dismissed.add(id); }catch(e){}

function watchUser(uid){ if(!uid||U.userSubs[uid]) return; U.userSubs[uid]=onSnapshot(doc(db,"users",uid),s=>{ U.users[uid]=s.exists()?s.data():{name:"Someone"}; scheduleRender(); },()=>{}); }
function who(uid){ return U.users[uid]||{}; }
function nameOf(uid){ return uid===U.me?"You":(who(uid).name||"Someone"); }
function online(uid){ const t=who(uid).lastSeen; return !!t && Date.now()-t<6*60e3; }
function avatar(uid,size){ const m=who(uid); const w=el("span","avwrap"+(uid!==U.me&&online(uid)?" on":"")); const d=el("div","av"+(size?" "+size:""));
  d.style.background=m.color||colorFor(uid);
  if(m.av&&galleryUrl(m.av)){ const im=el("img"); im.src=galleryUrl(m.av); im.alt=""; d.append(im); }
  else if(m.emoji){ d.classList.add("emo"); d.textContent=m.emoji; } else d.textContent=(m.name||"?").trim()[0]||"?";
  w.append(d); w.onclick=e=>{ if(uid!==U.me){ e.stopPropagation(); openProfile(uid); } }; return w; }
const friendsList=()=>U.reqOut.concat(U.reqIn).filter(r=>r.status==="accepted").map(r=>r.from===U.me?r.to:r.from).filter(u=>!U.blocked.has(u));
const isFriend=u=>friendsList().includes(u);
function relation(u){ const r=U.reqOut.concat(U.reqIn).find(x=>x.from===u||x.to===u); if(!r) return ""; if(r.status==="accepted") return "friend"; return r.from===U.me?"sent":"incoming"; }
let renderQueued=false; function scheduleRender(){ if(renderQueued) return; renderQueued=true; requestAnimationFrame(()=>{ renderQueued=false; render(); }); }
function errText(e){ const c=(e&&e.code)||""; return ({"auth/email-already-in-use":"There's already an account with that email. Try logging in.","auth/invalid-email":"That email doesn't look right.",
  "auth/weak-password":"Your password needs at least 6 characters.","auth/invalid-credential":"Wrong email or password.","auth/wrong-password":"Wrong email or password.","auth/user-not-found":"No account with that email. Sign up first!",
  "auth/too-many-requests":"Too many tries. Wait a few minutes and try again.","auth/network-request-failed":"No internet connection. Check your Wi-Fi.","permission-denied":"You're not allowed to do that."})[c]||"Something went wrong. Try again."; }

/* ================= AUTH ================= */
let mode="login";
function setMode(m){ mode=m; $("#tabLogin").classList.toggle("on",m==="login"); $("#tabSignup").classList.toggle("on",m==="signup"); $("#pw2wrap").hidden=m!=="signup";
  $("#authBtn").textContent=m==="login"?"Log in":"Create account"; $("#forgotBtn").hidden=m!=="login"; $("#pw").autocomplete=m==="login"?"current-password":"new-password"; $("#authMsg").textContent=""; }
$("#tabLogin").onclick=()=>setMode("login"); $("#tabSignup").onclick=()=>setMode("signup");
$("#authForm").onsubmit=async e=>{ e.preventDefault(); const email=$("#email").value.trim(), pw=$("#pw").value; const msg=$("#authMsg"); msg.className="msg bad"; msg.textContent="";
  if(mode==="signup" && pw!==$("#pw2").value){ msg.textContent="The two passwords don't match."; return; }
  const b=$("#authBtn"); b.disabled=true;
  try{ if(mode==="signup"){ const cred=await createUserWithEmailAndPassword(auth,email,pw); try{ await sendEmailVerification(cred.user); }catch(_){} }
    else await signInWithEmailAndPassword(auth,email,pw); }
  catch(err){ msg.textContent=errText(err); }
  b.disabled=false; };
$("#forgotBtn").onclick=async()=>{ const email=$("#email").value.trim(); const msg=$("#authMsg");
  if(!email){ msg.className="msg bad"; msg.textContent="Type your email above first, then tap Forgot password."; return; }
  try{ await sendPasswordResetEmail(auth,email); msg.className="msg good"; msg.textContent="Check your email for a link to reset your password. 📧"; }catch(err){ msg.className="msg bad"; msg.textContent=errText(err); } };

function show(which){ $("#loading").hidden=true; $("#authScreen").hidden=which!=="auth"; $("#setupScreen").hidden=which!=="setup"; $("#mainApp").hidden=which!=="main"; if(which!=="main"){ $("#chatView").hidden=true; $("#ringBar").replaceChildren(); } }

onAuthStateChanged(auth,user=>{
  for(const u of U.subs) try{ u(); }catch(e){} U.subs=[]; for(const k in U.userSubs){ try{ U.userSubs[k](); }catch(e){} } U.userSubs={}; if(U.msgUnsub){ U.msgUnsub(); U.msgUnsub=null; }
  U.me=user?user.uid:null; U.user=user; U.profile=null; U.users={}; U.reqIn=[]; U.reqOut=[]; U.chats=[]; U.open=null; U.started=false; U.blocked=new Set(); U.msgs=[]; U.page="chats"; N.chatSeen=null; N.reqSeen=null;
  if(!user){ show("auth"); setMode("login"); return; }
  U.subs.push(onSnapshot(doc(db,"users",U.me),s=>{ U.profile=s.exists()?s.data():null; U.users[U.me]=U.profile||{};
    if(!U.profile||!U.profile.username){ show("setup"); renderSetup(); return; }
    if(!U.started){ startApp(); } scheduleRender(); },err=>{ toast(errText(err)); }));
});

/* ---------- profile setup ---------- */
function renderSetup(){ const g=$("#setGallery"); g.replaceChildren();
  GALLERY.forEach((_,i)=>{ const id="g"+(i+1); const b=el("button","galb"+(U.setupAv===id?" on":"")); b.type="button"; const im=el("img"); im.src=galleryUrl(id); im.alt=""; b.append(im); b.onclick=()=>{ U.setupAv=id; renderSetup(); }; g.append(b); }); }
$("#setName").oninput=()=>{ const u=$("#setUser"); if(!u._touched) u.value=$("#setName").value.toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,16); };
$("#setUser").oninput=()=>{ $("#setUser")._touched=true; };
async function claimUsername(h){ const ref=doc(db,"usernames",h); const s=await getDoc(ref); if(s.exists()) return s.data().uid===U.me;
  try{ await setDoc(ref,{uid:U.me,at:Date.now()}); return true; }catch(e){ return false; } }
$("#setupForm").onsubmit=async e=>{ e.preventDefault(); const name=$("#setName").value.trim().slice(0,40); const h=$("#setUser").value.trim().toLowerCase().replace(/^@/,""); const msg=$("#setupMsg");
  if(!name){ msg.textContent="Type your name."; return; } if(!/^[a-z0-9_]{3,20}$/.test(h)){ msg.textContent="Usernames are 3–20 letters, numbers or _ (no spaces)."; return; }
  msg.textContent="";
  try{ if(!await claimUsername(h)){ msg.textContent="@"+h+" is taken. Try another one!"; return; }
    await setDoc(doc(db,"users",U.me),{name,username:h,av:U.setupAv,emoji:"",color:colorFor(U.me),bio:"",status:null,createdAt:Date.now(),lastSeen:Date.now()});
    toast("Welcome to The Hangout! 🎉"); }catch(err){ msg.textContent=errText(err); } };

/* ================= MAIN APP ================= */
function startApp(){ U.started=true; show("main");
  U.subs.push(onSnapshot(query(collection(db,"friendreqs"),where("from","==",U.me)),s=>{ U.reqOut=s.docs.map(d=>({id:d.id,...d.data()})); U.reqOut.forEach(r=>watchUser(r.to)); scheduleRender(); },()=>{}));
  U.subs.push(onSnapshot(query(collection(db,"friendreqs"),where("to","==",U.me)),s=>{ U.reqIn=s.docs.map(d=>({id:d.id,...d.data()})); U.reqIn.forEach(r=>watchUser(r.from)); checkReqAlerts(); scheduleRender(); },()=>{}));
  U.subs.push(onSnapshot(query(collection(db,"chats"),where("members","array-contains",U.me)),s=>{ U.chats=s.docs.map(d=>({id:d.id,...d.data()})); U.chats.forEach(c=>(c.members||[]).forEach(watchUser)); checkChatAlerts(); scheduleRender(); if(U.open) renderChatHead(); },()=>{}));
  U.subs.push(onSnapshot(doc(db,"users",U.me,"private","settings"),s=>{ U.blocked=new Set((s.exists()&&s.data().blocked)||[]); scheduleRender(); },()=>{}));
  heartbeat(); const hb=setInterval(()=>{ if(!document.hidden) heartbeat(); },4*60e3); U.subs.push(()=>clearInterval(hb));
  const tick=setInterval(()=>scheduleRender(),30000); U.subs.push(()=>clearInterval(tick));
  if(!startApp.vis){ startApp.vis=1; document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&U.me) heartbeat(); }); }
  scheduleRender(); }
async function heartbeat(){ if(!U.me||!U.profile) return; try{ await updateDoc(doc(db,"users",U.me),{lastSeen:Date.now()}); }catch(e){} }

document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{ U.page=b.dataset.pg; render(); window.scrollTo(0,0); });

function render(){ if(!U.me||$("#mainApp").hidden) return;
  document.querySelectorAll("nav.tabs button").forEach(b=>b.classList.toggle("on",b.dataset.pg===U.page));
  for(const p of ["chats","friends","calls","me"]) $("#pg-"+p).hidden=p!==U.page;
  const titles={chats:"Chats",friends:"Friends",calls:"Video Calls",me:"Me"}; $("#pageTitle").textContent=titles[U.page];
  renderVerify();
  if(U.page==="chats") renderChats(); if(U.page==="friends") renderFriends(); if(U.page==="calls") renderCalls(); if(U.page==="me") renderMe();
  // badges
  const unread=visibleChats().filter(isUnread).length; badge("#bChats",unread);
  badge("#bFriends",U.reqIn.filter(r=>r.status==="pending"&&!U.blocked.has(r.from)).length);
  badge("#bCalls",ringing().length);
  renderRing(); $("#installBtn").hidden=!deferredInstall; updateAppBadge(); }
function badge(sel,n){ const b=$(sel); b.hidden=!n; b.textContent=n>9?"9+":n; }
function renderVerify(){ const b=$("#verifyBanner"); const u=auth.currentUser; if(!u||u.emailVerified||store("hangout-verify-hide")){ b.hidden=true; return; }
  b.hidden=false; b.replaceChildren(el("span",null,"📧 Check your email ("+u.email+") and tap the link to verify your account. "));
  const r=el("button","link","Send again"); r.onclick=async()=>{ try{ await sendEmailVerification(u); toast("Sent! Check your inbox and spam folder."); }catch(e){ toast(errText(e)); } };
  const x=el("button","link muted","Hide"); x.onclick=()=>{ store("hangout-verify-hide","1"); renderVerify(); }; b.append(r,x); }

/* ---------- chats ---------- */
function visibleChats(){ return U.chats.filter(c=>!(c.type==="dm" && c.members.some(m=>m!==U.me&&U.blocked.has(m)))); }
function lastRead(id){ return +(store("hangout-read-"+U.me+"-"+id)||0); }
function markRead(id){ store("hangout-read-"+U.me+"-"+id,String(Date.now())); }
function isUnread(c){ return c.lastAt && c.lastBy!==U.me && c.lastAt>lastRead(c.id) && U.open!==c.id; }
function chatTitle(c){ if(c.type==="dm"){ const o=c.members.find(m=>m!==U.me); return who(o).name||"Friend"; } return c.name||"Group chat"; }
function chatIcon(c){ if(c.type==="dm") return avatar(c.members.find(m=>m!==U.me)); return el("div","gem",c.emoji||"👥"); }
function callLive(c){ return c.call && !c.call.ended && Date.now()-c.call.at<2*3600e3; }
function renderChats(){ const pg=$("#pg-chats"); pg.replaceChildren();
  if(deferredInstall||isIOS()&&!isStandalone()) pg.append(installCard());
  if("Notification" in window && Notification.permission==="default" && !store("hangout-notify-asked")){ const n=el("div","install"); n.append(el("span",null,"🔔"), el("div",null,"Get alerts for new messages and calls?"));
    const b=el("button","btn sm","Turn on"); b.onclick=async()=>{ store("hangout-notify-asked","1"); const p=await Notification.requestPermission(); if(p==="granted"){ store("hangout-notify","on"); toast("Notifications on! 🔔"); } render(); };
    const x=el("button","link muted","Not now"); x.onclick=()=>{ store("hangout-notify-asked","1"); render(); }; n.append(el("span","spacer"),b,x); pg.append(n); }
  const top=el("div","row"); top.style.margin="0 0 10px";
  const nb=el("button","btn sm","＋ New group"); nb.onclick=()=>openNewGroup(); top.append(el("span","spacer"),nb); pg.append(top);
  const fr=friendsList(); if(fr.length){ const card=el("div","card"); card.append(el("div","sect","Message a friend")); const row=el("div","row"); row.style.overflowX="auto"; row.style.gap="14px";
    for(const f of fr){ const b=el("button",null); b.style.cssText="border:0;background:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:56px"; b.append(avatar(f), el("span","small",(who(f).name||"Friend").split(" ")[0])); b.onclick=()=>openDM(f); b.querySelector(".avwrap").onclick=null; row.append(b); }
    card.append(row); pg.append(card); }
  const chats=visibleChats().sort((a,b)=>(b.lastAt||b.createdAt||0)-(a.lastAt||a.createdAt||0));
  const list=el("div","card list");
  if(!chats.length){ const e=el("div","empty"); e.append(el("b",null,"No chats yet"), fr.length?"Tap a friend above to start chatting, or make a group!":"Add friends in the 👯 Friends tab, then start chatting!"); list.append(e); }
  for(const c of chats){ const it=el("button","item"); it.type="button"; it.append(chatIcon(c)); const ic=it.firstChild; if(ic.onclick) ic.onclick=null;
    const mid=el("div","mid"); const nm=el("div","name",chatTitle(c)+(callLive(c)?"  📹":"")); mid.append(nm);
    const lastTxt=c.lastText?((c.lastBy===U.me?"You: ":c.type==="group"&&c.lastBy?(who(c.lastBy).name||"")+": ":"")+c.lastText):(c.type==="group"?c.members.length+" people":"Say hi! 👋");
    mid.append(el("div","uh last",lastTxt)); it.append(mid);
    const right=el("div",null); right.style.cssText="display:flex;flex-direction:column;align-items:flex-end;gap:4px"; right.append(el("span","uh",ago(c.lastAt||c.createdAt))); if(isUnread(c)) right.append(el("span","dot")); it.append(right);
    it.onclick=()=>openChat(c.id); list.append(it); }
  pg.append(list); }
async function openDM(f){ const id="dm_"+pairId(U.me,f); const ref=doc(db,"chats",id);
  try{ const s=await getDoc(ref); if(!s.exists()) await setDoc(ref,{type:"dm",members:[U.me,f].sort(),createdBy:U.me,createdAt:Date.now(),lastAt:Date.now(),lastText:"",lastBy:"",call:null,joined:{}}); openChat(id); }
  catch(e){ toast(e&&e.code==="permission-denied"?"You can only message friends.":errText(e)); } }
function openNewGroup(preset){ const fr=friendsList(); const sh=sheet(); sh.append(el("h2",null,"👥 New group chat"));
  if(!fr.length){ sh.append(el("div","muted","You need friends first! Add some in the 👯 Friends tab.")); sh.append(closeRow()); return; }
  const name=el("input","field"); name.placeholder="Group name (e.g. Squad 🔥)"; name.maxLength=30; sh.append(name);
  let emo="👥"; const eg=el("div","emojis"); for(const e of ["👥","🔥","🎮","📚","🍕","🎬","⚽","🎵","😂","💖","🌟","🚀"]){ const b=el("button",e===emo?"on":"",e); b.type="button"; b.onclick=()=>{ emo=e; eg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b)); }; eg.append(b); } sh.append(eg);
  sh.append(el("div","sect","Pick friends")); const picked=new Set(preset||[]);
  for(const f of fr){ const l=el("label","pick"); const cb=el("input"); cb.type="checkbox"; cb.checked=picked.has(f); cb.onchange=()=>cb.checked?picked.add(f):picked.delete(f); l.append(cb,avatar(f,"sm"),el("span",null,who(f).name||"Friend")); l.querySelector(".avwrap").onclick=null; sh.append(l); }
  const msg=el("div","msg bad"); sh.append(msg);
  const r=el("div","row"); r.style.marginTop="10px"; r.append(el("span","spacer")); const c=el("button","ghost","Cancel"); c.onclick=closeSheet; const ok=el("button","btn","Create group");
  ok.onclick=async()=>{ if(!picked.size){ msg.textContent="Pick at least one friend."; return; } ok.disabled=true;
    try{ const ref=await addDoc(collection(db,"chats"),{type:"group",name:name.value.trim().slice(0,30)||"Group chat",emoji:emo,members:[U.me,...picked],createdBy:U.me,createdAt:Date.now(),lastAt:Date.now(),lastText:"Group created",lastBy:U.me,call:null,joined:{}});
      await addDoc(collection(db,"chats",ref.id,"messages"),{by:U.me,type:"sys",text:(U.profile.name||"Someone")+" made the group",at:Date.now()});
      closeSheet(); openChat(ref.id); }catch(e){ msg.textContent=errText(e); ok.disabled=false; } };
  r.append(c,ok); sh.append(r); setTimeout(()=>name.focus(),50); }

/* ---------- chat view ---------- */
function openChat(id){ U.open=id; markRead(id); const v=$("#chatView"); v.hidden=false; v.replaceChildren();
  const head=el("div","chathead"); head.id="chatHead"; const msgs=el("div","msgs"); msgs.id="msgList";
  const comp=el("form","composer"); const emo=el("button","tool","😊"); emo.type="button"; const inp=el("input"); inp.placeholder="Message…"; inp.maxLength=2000; inp.id="msgInput"; inp.autocomplete="off";
  const send=el("button","btn sm","Send"); send.type="submit"; comp.append(emo,inp,send); v.append(head,msgs,comp);
  emo.onclick=()=>toggleEmoji(v,inp);
  comp.onsubmit=async e=>{ e.preventDefault(); const t=inp.value.trim(); if(!t) return; inp.value=""; closeEmoji(); await sendMsg(id,t); inp.focus(); };
  renderChatHead();
  if(U.msgUnsub) U.msgUnsub();
  U.msgUnsub=onSnapshot(query(collection(db,"chats",id,"messages"),orderBy("at","desc"),limit(150)),s=>{ U.msgs=s.docs.map(d=>({id:d.id,...d.data()})).reverse(); markRead(id); renderMsgs(); scheduleRender(); },err=>{ toast(errText(err)); });
  history.pushState({chat:id},""); setTimeout(()=>inp.focus(),100); }
function closeChat(){ if(U.msgUnsub){ U.msgUnsub(); U.msgUnsub=null; } if(U.open) markRead(U.open); U.open=null; U.msgs=[]; $("#chatView").hidden=true; scheduleRender(); }
window.addEventListener("popstate",()=>{ if(U.open) closeChat(); });
function renderChatHead(){ const h=$("#chatHead"); if(!h) return; const c=U.chats.find(x=>x.id===U.open);
  if(!c){ const id=U.open; if(!U.waitOpen||U.waitOpen.id!==id) U.waitOpen={id,at:Date.now()};
    if(Date.now()-U.waitOpen.at<8000){ if(!h.childElementCount){ const bk=el("button","ghost sm","←"); bk.onclick=()=>history.back(); h.append(bk, el("div","name","Opening…")); } setTimeout(()=>{ if(U.open===id) renderChatHead(); },400); return; }
    closeChat(); return; }
  U.waitOpen=null; h.replaceChildren();
  const back=el("button","link","←"); back.style.fontSize="22px"; back.onclick=()=>history.back(); h.append(back, chatIcon(c));
  const mid=el("div","mid"); mid.append(el("div","name",chatTitle(c)));
  if(c.type==="dm"){ const o=c.members.find(m=>m!==U.me); mid.append(el("div","uh",online(o)?"🟢 Online now":who(o).status&&who(o).status.t?(who(o).status.e||"")+" "+who(o).status.t:"@"+(who(o).username||""))); }
  else mid.append(el("div","uh",c.members.map(m=>m===U.me?"you":(who(m).name||"…")).join(", ")));
  h.append(mid);
  if(callLive(c)){ h.append(joinLink(c,"📹 Join","btn sm")); } else { const cb=el("button","tool","📹"); cb.title="Start a video call"; cb.onclick=()=>startCall(c); h.append(cb); }
  const more=el("button","tool","⋯"); more.onclick=()=>chatMenu(c); h.append(more); }
function renderMsgs(){ const box=$("#msgList"); if(!box) return; const near=box.scrollHeight-box.scrollTop-box.clientHeight<120; box.replaceChildren();
  const c=U.chats.find(x=>x.id===U.open);
  if(!U.msgs.length){ const e=el("div","empty"); e.append(el("b",null,"Say hi! 👋"), c&&c.type==="group"?"Only people in this group can see these messages.":"Only you two can see these messages."); box.append(e); }
  let prev=null;
  for(const m of U.msgs){ if(m.type==="sys"){ box.append(el("div","sys",m.text)); prev=null; continue; }
    if(U.blocked.has(m.by)){ box.append(el("div","sys","🚫 Message from someone you blocked")); prev=null; continue; }
    const mine=m.by===U.me; const row=el("div","m"+(mine?" mine":"")); const grouped=prev&&prev.by===m.by&&m.at-prev.at<5*60e3;
    const av=avatar(m.by,"sm"); if(grouped) av.style.visibility="hidden"; row.append(av);
    const col=el("div"); if(!grouped&&c&&c.type==="group") col.append(el("div","who",nameOf(m.by)));
    const big=/^(\p{Extended_Pictographic}|️|‍|\s){1,12}$/u.test(m.text)&&[...m.text.replace(/\s/g,"")].length<=6;
    const b=el("div","b"+(big?" big":""),m.text); b.title=new Date(m.at).toLocaleString(); col.append(b); row.append(col);
    const t=el("span","t",timeOf(m.at)); row.append(t);
    if(mine){ const d=el("button","del","✕"); d.title="Delete"; d.onclick=async()=>{ try{ await deleteDoc(doc(db,"chats",U.open,"messages",m.id)); }catch(e){ toast(errText(e)); } }; row.append(d); }
    box.append(row); prev=m; }
  if(near||U.msgs.length&&U.msgs[U.msgs.length-1].by===U.me) box.scrollTop=box.scrollHeight; }
async function sendMsg(id,text){ const now=Date.now();
  try{ await addDoc(collection(db,"chats",id,"messages"),{by:U.me,type:"text",text:text.slice(0,2000),at:now});
    await updateDoc(doc(db,"chats",id),{lastAt:now,lastText:text.slice(0,80),lastBy:U.me}); }catch(e){ toast(errText(e)); } }
function toggleEmoji(v,inp){ if(v.querySelector(".pop")){ closeEmoji(); return; } const p=el("div","pop"); const g=el("div","grid");
  for(const e of EMOJI){ const b=el("button",null,e); b.type="button"; b.onmousedown=ev=>ev.preventDefault(); b.onclick=()=>{ const s=inp.selectionStart??inp.value.length; inp.value=inp.value.slice(0,s)+e+inp.value.slice(inp.selectionEnd??s); inp.focus(); }; g.append(b); }
  p.append(g); v.append(p); }
function closeEmoji(){ const p=$("#chatView .pop"); if(p) p.remove(); }
function chatMenu(c){ const sh=sheet(); sh.append(el("h2",null,chatTitle(c)));
  if(c.type==="dm"){ const o=c.members.find(m=>m!==U.me);
    const p=el("button","ghost","👤 View profile"); p.onclick=()=>{ closeSheet(); openProfile(o); }; sh.append(p); }
  else {
    sh.append(el("div","sect","People ("+c.members.length+")")); for(const m of c.members){ const r=el("div","row"); r.style.margin="6px 0"; r.append(avatar(m,"sm"), el("span",null,nameOf(m))); sh.append(r); }
    const r=el("div","row rw"); r.style.marginTop="12px";
    const add=el("button","ghost","＋ Add friends"); add.onclick=()=>addPeople(c);
    const ren=el("button","ghost","✏️ Rename"); ren.onclick=()=>renameGroup(c);
    const lv=el("button","ghost","🚪 Leave group"); lv.onclick=async()=>{ if(!lv.dataset.sure){ lv.dataset.sure=1; lv.textContent="Leave? Tap again"; return; }
      try{ await addDoc(collection(db,"chats",c.id,"messages"),{by:U.me,type:"sys",text:(U.profile.name||"Someone")+" left the group",at:Date.now()});
        await updateDoc(doc(db,"chats",c.id),{members:arrayRemove(U.me)}); closeSheet(); history.back(); toast("You left the group."); }catch(e){ toast(errText(e)); } };
    r.append(add,ren,lv); sh.append(r); }
  sh.append(closeRow()); }
function addPeople(c){ const sh=sheet(); sh.append(el("h2",null,"Add friends to "+chatTitle(c))); const fr=friendsList().filter(f=>!c.members.includes(f)); const picked=new Set();
  if(!fr.length) sh.append(el("div","muted","All your friends are already in this group."));
  for(const f of fr){ const l=el("label","pick"); const cb=el("input"); cb.type="checkbox"; cb.onchange=()=>cb.checked?picked.add(f):picked.delete(f); l.append(cb,avatar(f,"sm"),el("span",null,who(f).name||"Friend")); sh.append(l); }
  const r=el("div","row"); r.style.marginTop="10px"; r.append(el("span","spacer")); const c2=el("button","ghost","Cancel"); c2.onclick=closeSheet; const ok=el("button","btn","Add");
  ok.onclick=async()=>{ if(!picked.size){ closeSheet(); return; } try{ await updateDoc(doc(db,"chats",c.id),{members:arrayUnion(...picked)});
      await addDoc(collection(db,"chats",c.id,"messages"),{by:U.me,type:"sys",text:(U.profile.name||"Someone")+" added "+[...picked].map(p=>who(p).name||"a friend").join(", "),at:Date.now()}); closeSheet(); }catch(e){ toast(errText(e)); } };
  r.append(c2,ok); sh.append(r); }
function renameGroup(c){ const sh=sheet(); sh.append(el("h2",null,"Rename group")); const i=el("input","field"); i.value=c.name||""; i.maxLength=30; sh.append(i);
  let emo=c.emoji||"👥"; const eg=el("div","emojis"); for(const e of ["👥","🔥","🎮","📚","🍕","🎬","⚽","🎵","😂","💖","🌟","🚀"]){ const b=el("button",e===emo?"on":"",e); b.type="button"; b.onclick=()=>{ emo=e; eg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b)); }; eg.append(b); } sh.append(eg);
  const r=el("div","row"); r.style.marginTop="10px"; r.append(el("span","spacer")); const ok=el("button","btn","Save");
  ok.onclick=async()=>{ try{ await updateDoc(doc(db,"chats",c.id),{name:i.value.trim().slice(0,30)||"Group chat",emoji:emo}); closeSheet(); }catch(e){ toast(errText(e)); } }; r.append(ok); sh.append(r); }

/* ---------- friends ---------- */
function renderFriends(){ const pg=$("#pg-friends"); pg.replaceChildren();
  const add=el("form","card"); add.append(el("div","name","➕ Add a friend"));
  const r=el("div","row"); r.append(el("b",null,"@")); const i=el("input","field"); i.placeholder="their username"; i.maxLength=20; i.autocapitalize="off"; i.spellcheck=false; r.append(i, Object.assign(el("button","btn sm","Add"),{type:"submit"})); add.append(r);
  const msg=el("div","msg"); add.append(msg);
  add.onsubmit=async e=>{ e.preventDefault(); const h=i.value.trim().toLowerCase().replace(/^@+/,""); if(!h) return; msg.className="msg bad";
    if(h===U.profile.username){ msg.textContent="That's you! 😄"; return; }
    try{ const s=await getDoc(doc(db,"usernames",h)); if(!s.exists()){ msg.textContent="No one called @"+h+". Check the spelling!"; return; }
      const uid=s.data().uid; watchUser(uid); const rel=relation(uid);
      if(rel==="friend"){ msg.className="msg good"; msg.textContent="You're already friends! 🎉"; return; }
      if(rel==="sent"){ msg.className="msg good"; msg.textContent="Request already sent. Waiting for them."; return; }
      if(rel==="incoming"){ await accept(pairId(U.me,uid)); msg.className="msg good"; msg.textContent="They already asked you, so now you're friends! 🎉"; i.value=""; return; }
      await setDoc(doc(db,"friendreqs",pairId(U.me,uid)),{from:U.me,to:uid,status:"pending",at:Date.now()});
      msg.className="msg good"; msg.textContent="Friend request sent to @"+h+"! 📨"; i.value=""; }catch(err){ msg.textContent=errText(err); } };
  pg.append(add);
  const inc=U.reqIn.filter(r=>r.status==="pending"&&!U.blocked.has(r.from));
  if(inc.length){ const c=el("div","card list"); c.prepend(el("div","name","📬 Friend requests")); for(const r of inc){ c.append(personItem(r.from,[["Accept","btn sm",()=>accept(r.id)],["✕","ghost sm",()=>removeReq(r.id)]])); } pg.append(c); }
  const fr=friendsList(); const fc=el("div","card list"); fc.append(el("div","name","👯 Friends ("+fr.length+")"));
  if(!fr.length) fc.append(el("div","muted","No friends yet. Add someone by their @username above!"));
  fr.sort((a,b)=>online(b)-online(a)); for(const f of fr){ const it=personItem(f,[["💬","ghost sm",()=>openDM(f)]]); it.onclick=e=>{ if(!e.target.closest("button.ghost")) openProfile(f); }; fc.append(it); }
  pg.append(fc);
  const sent=U.reqOut.filter(r=>r.status==="pending"); if(sent.length){ const c=el("div","card list"); c.append(el("div","name","⏳ Waiting for them")); for(const r of sent) c.append(personItem(r.to,[["Cancel","ghost sm",()=>removeReq(r.id)]])); pg.append(c); }
  const share=el("div","card"); share.append(el("div","name","📨 Invite friends"), el("div","muted","Send them the link to this app. They sign up with their email, pick a username, then add you: @"+U.profile.username));
  const cp=el("button","ghost sm","📋 Copy invite"); cp.style.marginTop="8px"; cp.onclick=async()=>{ const t="Join me on The Hangout! 💬 "+location.href.split("#")[0]+" Sign up with your email and add me: @"+U.profile.username;
    try{ if(navigator.share) await navigator.share({title:"The Hangout",text:t}); else { await navigator.clipboard.writeText(t); toast("Copied! Paste it in a message."); } }catch(e){} };
  share.append(cp); pg.append(share); }
function personItem(uid,btns){ const it=el("div","item"); const m=who(uid); it.append(avatar(uid)); const mid=el("div","mid"); mid.append(el("div","name",m.name||"…"));
  const st=m.status&&m.status.t?(m.status.e||"")+" "+m.status.t:""; mid.append(el("div","uh",online(uid)?"🟢 Online"+(st?" · "+st:" now"):(st||"@"+(m.username||"")))); it.append(mid);
  for(const [l,c,f] of btns){ const b=el("button",c,l); b.type="button"; b.onclick=e=>{ e.stopPropagation(); f(); }; it.append(b); } return it; }
async function accept(id){ try{ await updateDoc(doc(db,"friendreqs",id),{status:"accepted",acceptedAt:Date.now()}); toast("You're friends now! 🎉"); }catch(e){ toast(errText(e)); } }
async function removeReq(id){ try{ await deleteDoc(doc(db,"friendreqs",id)); }catch(e){ toast(errText(e)); } }
function openProfile(uid){ watchUser(uid); const m=who(uid); const sh=sheet(); const hero=el("div","hero"); const a=avatar(uid,"lg"); a.onclick=null; hero.append(a, el("div","nm",m.name||"…"), el("div","muted","@"+(m.username||"")));
  if(m.status&&m.status.t) hero.append(el("div","stat",(m.status.e||"")+" "+m.status.t));
  hero.append(el("div","muted small",online(uid)?"🟢 Online now":m.lastSeen?"Last seen "+ago(m.lastSeen)+" ago":""));
  if(m.bio){ const b=el("div",null,m.bio); b.style.cssText="margin:10px auto;max-width:320px;white-space:pre-wrap"; hero.append(b); } sh.append(hero);
  const r=el("div","row rw"); r.style.cssText="justify-content:center;margin-top:12px;gap:8px"; const rel=relation(uid);
  if(U.blocked.has(uid)){ const ub=el("button","ghost","Unblock"); ub.onclick=()=>setBlock(uid,false); r.append(ub); }
  else { if(rel==="friend"){ const ms=el("button","btn","💬 Message"); ms.onclick=()=>{ closeSheet(); openDM(uid); }; const cl=el("button","ghost","📹 Call"); cl.onclick=async()=>{ closeSheet(); await callFriend(uid); }; r.append(ms,cl); }
    else if(rel==="incoming"){ const ac=el("button","btn","Accept friend request"); ac.onclick=()=>{ accept(pairId(U.me,uid)); closeSheet(); }; r.append(ac); }
    else if(rel==="sent") r.append(el("span","stat","Request sent"));
    else { const ad=el("button","btn","➕ Add friend"); ad.onclick=async()=>{ try{ await setDoc(doc(db,"friendreqs",pairId(U.me,uid)),{from:U.me,to:uid,status:"pending",at:Date.now()}); toast("Request sent! 📨"); closeSheet(); }catch(e){ toast(errText(e)); } }; r.append(ad); }
    if(rel==="friend"){ const rm=el("button","ghost","Remove friend"); rm.onclick=()=>{ if(!rm.dataset.sure){ rm.dataset.sure=1; rm.textContent="Sure? Tap again"; return; } removeReq(pairId(U.me,uid)); closeSheet(); }; r.append(rm); }
    const bl=el("button","ghost","🚫 Block"); bl.onclick=()=>{ setBlock(uid,true); closeSheet(); }; r.append(bl); }
  sh.append(r, closeRow()); }
async function setBlock(uid,on){ const list=new Set(U.blocked); on?list.add(uid):list.delete(uid);
  try{ await setDoc(doc(db,"users",U.me,"private","settings"),{blocked:[...list]},{merge:true}); toast(on?"Blocked. You won't see their messages.":"Unblocked."); closeSheet(); }catch(e){ toast(errText(e)); } }

/* ---------- video calls (Jitsi Meet) ---------- */
function newRoom(){ const a="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let r="TheHangout-"; const buf=new Uint32Array(18); crypto.getRandomValues(buf); for(const n of buf) r+=a[n%a.length]; return r; }
const callUrl=c=>"https://meet.jit.si/"+encodeURIComponent(c.call.room);
function ringing(){ return U.chats.filter(c=>callLive(c)&&c.call.host!==U.me&&!(c.joined&&c.joined[U.me])&&!U.dismissed.has(c.id+c.call.at)&&!U.blocked.has(c.call.host)); }
async function startCall(c){ try{ await updateDoc(doc(db,"chats",c.id),{call:{room:newRoom(),host:U.me,at:Date.now(),ended:false},joined:{},lastAt:Date.now(),lastText:"📹 Video call started",lastBy:U.me});
    await addDoc(collection(db,"chats",c.id,"messages"),{by:U.me,type:"sys",text:"📹 "+(U.profile.name||"Someone")+" started a video call. Tap Join!",at:Date.now()}); toast("📞 Calling… tap Join to open the call."); }catch(e){ toast(errText(e)); } }
async function callFriend(uid){ const id="dm_"+pairId(U.me,uid); let c=U.chats.find(x=>x.id===id);
  if(!c){ await openDM(uid); closeChat(); await new Promise(r=>setTimeout(r,600)); c=U.chats.find(x=>x.id===id); }
  if(c){ if(callLive(c)) toast("There's already a call going. Tap Join."); else await startCall(c); U.page="calls"; render(); } }
async function endCall(c){ try{ await updateDoc(doc(db,"chats",c.id),{"call.ended":true}); await addDoc(collection(db,"chats",c.id,"messages"),{by:U.me,type:"sys",text:"📴 Call ended",at:Date.now()}); }catch(e){ toast(errText(e)); } }
function joinLink(c,label,cls){ const a=el("a",cls||"btn sm",label||"📹 Join"); a.href=callUrl(c); a.target="_blank"; a.rel="noopener noreferrer";
  a.onclick=()=>{ updateDoc(doc(db,"chats",c.id),{["joined."+U.me]:Date.now()}).catch(()=>{}); }; return a; }
function renderRing(){ const bar=$("#ringBar"); bar.replaceChildren(); if($("#mainApp").hidden) return; const list=ringing(); if(!list.length) return; const c=list[0];
  const r=el("div","ring"); r.append(el("span","ic","📞"), avatar(c.call.host,"sm")); const t=el("div","mid"); t.style.flex="1";
  t.append(el("div","name",c.type==="group"?nameOf(c.call.host)+" started a call in "+chatTitle(c):nameOf(c.call.host)+" is calling you!"), el("div","uh","Video call · "+ago(c.call.at)+(list.length>1?" · +"+(list.length-1)+" more":"")));
  const no=el("button","ghost sm","Not now"); no.onclick=()=>{ U.dismissed.add(c.id+c.call.at); store("hangout-dismissed",JSON.stringify([...U.dismissed].slice(-100))); render(); };
  r.append(t, joinLink(c,"Join","btn sm"), no); bar.append(r); }
function renderCalls(){ const pg=$("#pg-calls"); pg.replaceChildren();
  const live=visibleChats().filter(callLive); const lc=el("div","card list"); lc.append(el("div","name","🟢 Calls happening now"));
  if(!live.length) lc.append(el("div","muted","No calls right now."));
  for(const c of live){ const it=el("div","item"); it.append(chatIcon(c)); const mid=el("div","mid"); mid.append(el("div","name",chatTitle(c)), el("div","uh","Started by "+nameOf(c.call.host)+" · "+ago(c.call.at)+" ago · "+Object.keys(c.joined||{}).length+" joined")); it.append(mid, joinLink(c));
    if(c.call.host===U.me){ const e=el("button","ghost sm","End"); e.onclick=()=>endCall(c); it.append(e); } lc.append(it); }
  pg.append(lc);
  const fc=el("div","card list"); fc.append(el("div","name","📞 Call a friend")); const fr=friendsList();
  if(!fr.length) fc.append(el("div","muted","You can only call friends. Add some in the 👯 Friends tab!"));
  for(const f of fr) fc.append(personItem(f,[["📞 Call","btn sm",()=>callFriend(f)]]));
  pg.append(fc);
  const groups=visibleChats().filter(c=>c.type==="group"); const gc=el("div","card list"); gc.append(el("div","name","👥 Call a group"));
  if(!groups.length) gc.append(el("div","muted","No group chats yet. Make one in 💬 Chats."));
  for(const g of groups){ const it=el("div","item"); it.append(chatIcon(g)); const mid=el("div","mid"); mid.append(el("div","name",chatTitle(g)), el("div","uh",g.members.length+" people")); it.append(mid);
    if(callLive(g)) it.append(joinLink(g)); else { const b=el("button","btn sm","📹 Call"); b.onclick=()=>startCall(g); it.append(b); } gc.append(it); }
  pg.append(gc);
  const how=el("div","card"); how.append(el("div","name","ℹ️ How calls work")); const ol=el("ol","steps");
  for(const t of ["Tap 📞 Call. Your friend gets a \"calling you\" alert in The Hangout.","Everyone taps Join. The call opens in Jitsi Meet (free) in a new tab or the Jitsi app.","Whoever starts the call signs in on Jitsi once (Google, GitHub or Facebook). Everyone else just joins.","Allow your camera and microphone when asked.","Done? Close the call. The person who started it can tap End."]) ol.append(el("li",null,t));
  how.append(ol, el("div","muted small","🛡️ Only join calls from people you know. Each call has a secret link that only that chat can see."));
  pg.append(how); }

/* ---------- me / profile ---------- */
function renderMe(){ const pg=$("#pg-me"); pg.replaceChildren(); const p=U.profile;
  const card=el("div","card hero"); const a=avatar(U.me,"lg"); card.append(a, el("div","nm",p.name), el("div","muted","@"+p.username));
  if(p.status&&p.status.t) card.append(el("div","stat",(p.status.e||"")+" "+p.status.t)); if(p.bio){ const b=el("div",null,p.bio); b.style.cssText="margin-top:8px;white-space:pre-wrap"; card.append(b); }
  const ed=el("button","btn","✏️ Edit profile"); ed.style.marginTop="12px"; ed.onclick=editProfile; card.append(el("div"),ed); pg.append(card);
  const st=el("div","card"); st.append(el("div","name","😀 Status")); const chips=el("div","chips"); chips.style.marginTop="8px";
  for(const [e,t] of STATUSES){ const c=el("button","chip"+(p.status&&p.status.t===t?" on":""),e+" "+t); c.onclick=()=>setStatus(p.status&&p.status.t===t?null:{e,t}); chips.append(c); }
  st.append(chips); const f=el("form","row"); f.style.marginTop="8px"; const si=el("input","field"); si.placeholder="Or type your own…"; si.maxLength=40; f.append(si, Object.assign(el("button","ghost sm","Set"),{type:"submit"}));
  f.onsubmit=e=>{ e.preventDefault(); const v=si.value.trim(); if(v) setStatus({e:"💬",t:v}); }; st.append(f); pg.append(st);
  pg.append(notifyCard());
  const th=el("div","card"); th.append(el("div","name","🎨 Theme (only you see it)")); const tg=el("div","themes"); tg.style.marginTop="8px"; const cur=store("hangout-theme")||"auto";
  for(const [id,name,sw] of THEMES){ const b=el("button","themebtn"+(cur===id?" on":"")); const d=el("span","tsw"); d.style.background=sw; b.append(d, el("span",null,name)); b.onclick=()=>{ setTheme(id); renderMe(); }; tg.append(b); }
  th.append(tg); pg.append(th);
  if(deferredInstall||isIOS()&&!isStandalone()) pg.append(installCard());
  const ac=el("div","card"); ac.append(el("div","name","⚙️ Account"), el("div","muted",auth.currentUser.email+(auth.currentUser.emailVerified?" ✅ verified":" (not verified yet)")));
  const r=el("div","row rw"); r.style.marginTop="10px";
  const cu=el("button","ghost sm","Change @username"); cu.onclick=changeUsername;
  const rp=el("button","ghost sm","Reset password"); rp.onclick=async()=>{ try{ await sendPasswordResetEmail(auth,auth.currentUser.email); toast("Check your email for a reset link. 📧"); }catch(e){ toast(errText(e)); } };
  const so=el("button","ghost sm","🚪 Log out"); so.onclick=()=>signOut(auth);
  r.append(cu,rp,so); ac.append(r);
  if(U.blocked.size){ ac.append(el("div","sect","Blocked")); for(const b of U.blocked) ac.append(personItem(b,[["Unblock","ghost sm",()=>setBlock(b,false)]])); }
  pg.append(ac); }
async function setStatus(s){ try{ await updateDoc(doc(db,"users",U.me),{status:s}); }catch(e){ toast(errText(e)); } }
function editProfile(){ const p=U.profile; const sh=sheet(); sh.append(el("h2",null,"✏️ Edit profile"));
  let av=p.av||"", emo=p.emoji||"", color=p.color||colorFor(U.me);
  sh.append(el("label","lbl","Name")); const nm=el("input","field"); nm.value=p.name; nm.maxLength=40; sh.append(nm);
  sh.append(el("label","lbl","About you")); const bio=el("textarea","field"); bio.rows=3; bio.maxLength=160; bio.value=p.bio||""; bio.placeholder="Favourite games, hobbies…"; sh.append(bio);
  sh.append(el("div","sect","Picture")); const g=el("div","gallery"); const drawG=()=>{ g.replaceChildren(); GALLERY.forEach((_,i)=>{ const id="g"+(i+1); const b=el("button","galb"+(av===id?" on":"")); b.type="button"; const im=el("img"); im.src=galleryUrl(id); b.append(im); b.onclick=()=>{ av=id; emo=""; drawG(); drawE(); }; g.append(b); }); }; sh.append(g);
  sh.append(el("div","sect","Or an emoji")); const eg=el("div","emojis"); const drawE=()=>{ eg.replaceChildren(); for(const e of AV_EMOJIS){ const b=el("button",emo===e?"on":"",e); b.type="button"; b.onclick=()=>{ emo=e; av=""; drawG(); drawE(); }; eg.append(b); } }; sh.append(eg);
  sh.append(el("div","sect","Colour")); const sw=el("div","swatches"); const drawS=()=>{ sw.replaceChildren(); for(const c of PALETTE){ const b=el("button","sw"+(color===c?" on":"")); b.type="button"; b.style.background=c; b.onclick=()=>{ color=c; drawS(); }; sw.append(b); } }; sh.append(sw);
  drawG(); drawE(); drawS();
  const r=el("div","row"); r.style.marginTop="14px"; r.append(el("span","spacer")); const c=el("button","ghost","Cancel"); c.onclick=closeSheet; const ok=el("button","btn","Save");
  ok.onclick=async()=>{ const n=nm.value.trim().slice(0,40); if(!n){ toast("Type your name."); return; }
    try{ await updateDoc(doc(db,"users",U.me),{name:n,bio:bio.value.trim().slice(0,160),av,emoji:emo,color}); closeSheet(); toast("Profile saved!"); }catch(e){ toast(errText(e)); } };
  r.append(c,ok); sh.append(r); }
function changeUsername(){ const sh=sheet(); sh.append(el("h2",null,"Change @username")); const r=el("div","row"); r.append(el("b",null,"@")); const i=el("input","field"); i.value=U.profile.username; i.maxLength=20; i.autocapitalize="off"; r.append(i); sh.append(r);
  const msg=el("div","msg bad"); sh.append(msg); const rr=el("div","row"); rr.style.marginTop="10px"; rr.append(el("span","spacer")); const ok=el("button","btn","Save");
  ok.onclick=async()=>{ const h=i.value.trim().toLowerCase().replace(/^@/,""); if(h===U.profile.username){ closeSheet(); return; } if(!/^[a-z0-9_]{3,20}$/.test(h)){ msg.textContent="3–20 letters, numbers or _"; return; }
    try{ if(!await claimUsername(h)){ msg.textContent="@"+h+" is taken."; return; } const old=U.profile.username; await updateDoc(doc(db,"users",U.me),{username:h}); try{ await deleteDoc(doc(db,"usernames",old)); }catch(_){} closeSheet(); toast("You're now @"+h); }catch(e){ msg.textContent=errText(e); } };
  rr.append(ok); sh.append(rr); }

/* ---------- notification alerts ---------- */
const N={ chatSeen:null, reqSeen:null, ctx:null };
const notifPref=()=>store("hangout-notify")!=="off"; const soundPref=()=>store("hangout-sound")!=="off";
function canNotify(){ return "Notification" in window && Notification.permission==="granted" && notifPref(); }
document.addEventListener("pointerdown",()=>{ if(!N.ctx){ try{ N.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } else if(N.ctx.state==="suspended") N.ctx.resume(); },{passive:true});
function ping(kind){ if(!soundPref()||!N.ctx) return; try{ const ctx=N.ctx, t=ctx.currentTime; const notes=kind==="call"?[660,880,660,880]:kind==="friend"?[523,659,784]:[880,1175];
    notes.forEach((f,i)=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.type="sine"; o.frequency.value=f; g.gain.setValueAtTime(0,t+i*.13); g.gain.linearRampToValueAtTime(.18,t+i*.13+.02); g.gain.exponentialRampToValueAtTime(.001,t+i*.13+.25); o.connect(g).connect(ctx.destination); o.start(t+i*.13); o.stop(t+i*.13+.3); }); }catch(e){} }
async function popup(title,body,tag,opts){ if(!canNotify()) return; const o={body,tag,icon:"icon-192.png",badge:"icon-192.png",renotify:true,...(opts||{})};
  try{ const reg=await navigator.serviceWorker?.getRegistration(); if(reg) await reg.showNotification(title,o); else new Notification(title,o); }catch(e){ try{ new Notification(title,o); }catch(_){} } }
function alertUser(kind,title,body,tag,chatId){ const away=document.hidden||!document.hasFocus();
  ping(kind);
  if(away) popup(title,body,tag,{data:{chat:chatId||null},requireInteraction:kind==="call"});
  else if(!(chatId&&U.open===chatId)) toast((kind==="call"?"📞 ":kind==="friend"?"👯 ":"💬 ")+title+(body?": "+body:"")); }
function checkChatAlerts(){ const first=N.chatSeen===null; const seen=N.chatSeen||{}; const next={};
  for(const c of U.chats){ const key=(c.lastAt||0)+"|"+(c.call&&!c.call.ended?c.call.at:0); next[c.id]=key; if(first) continue;
    const prevKey=seen[c.id]; if(prevKey===key) continue; const muted=c.type==="dm"&&c.members.some(m=>m!==U.me&&U.blocked.has(m));
    if(muted) continue;
    const prevCall=prevKey?+prevKey.split("|")[1]:0;
    if(callLive(c)&&c.call.at!==prevCall&&c.call.host!==U.me&&!U.blocked.has(c.call.host)){ alertUser("call",nameOf(c.call.host)+(c.type==="group"?" started a call in "+chatTitle(c):" is calling you!"),"Tap to open The Hangout and join","call-"+c.id,c.id); continue; }
    if(c.lastBy&&c.lastBy!==U.me&&!U.blocked.has(c.lastBy)&&c.lastAt>(prevKey?+prevKey.split("|")[0]:0)&&!(U.open===c.id&&!document.hidden)){
      alertUser("msg",c.type==="group"?chatTitle(c):nameOf(c.lastBy),(c.type==="group"?nameOf(c.lastBy)+": ":"")+(c.lastText||"sent a message"),"chat-"+c.id,c.id); } }
  N.chatSeen=next; updateAppBadge(); }
function checkReqAlerts(){ const ids=new Set(U.reqIn.filter(r=>r.status==="pending").map(r=>r.id)); if(N.reqSeen===null){ N.reqSeen=ids; return; }
  for(const r of U.reqIn){ if(r.status==="pending"&&!N.reqSeen.has(r.id)&&!U.blocked.has(r.from)){ watchUser(r.from); setTimeout(()=>alertUser("friend","New friend request",(who(r.from).name||"Someone")+" wants to be your friend","req-"+r.id),400); } }
  N.reqSeen=ids; updateAppBadge(); }
function updateAppBadge(){ const n=visibleChats().filter(isUnread).length+U.reqIn.filter(r=>r.status==="pending").length+ringing().length;
  document.title=(n?"("+n+") ":"")+"The Hangout"; try{ if(navigator.setAppBadge){ n?navigator.setAppBadge(n):navigator.clearAppBadge(); } }catch(e){} }
navigator.serviceWorker?.addEventListener("message",e=>{ if(e.data&&e.data.openChat&&U.me){ const c=U.chats.find(x=>x.id===e.data.openChat); if(c) openChat(c.id); } });
function notifyCard(){ const c=el("div","card"); c.append(el("div","name","🔔 Notifications"));
  const supported="Notification" in window;
  const perm=supported?Notification.permission:"unsupported";
  c.append(el("div","muted small",!supported?(isIOS()?"On iPhone/iPad, install the app first (Share ⬆️ → Add to Home Screen), then open it from your home screen to turn on alerts.":"This browser can't show notifications."):
    perm==="denied"?"Notifications are blocked. Turn them on in your browser or phone settings for this site.":
    "Get a pop-up and sound for new messages, friend requests and calls."));
  const r=el("div","row rw"); r.style.marginTop="8px";
  if(supported&&perm==="default"){ const b=el("button","btn sm","🔔 Turn on notifications"); b.onclick=async()=>{ const p=await Notification.requestPermission(); if(p==="granted"){ store("hangout-notify","on"); popup("Notifications are on! 🎉","You'll get alerts for messages, friends and calls.","welcome"); } render(); }; r.append(b); }
  if(supported&&perm==="granted"){ const on=notifPref(); const b=el("button","ghost sm",on?"🔔 Pop-ups: On":"🔕 Pop-ups: Off"); b.onclick=()=>{ store("hangout-notify",on?"off":"on"); render(); }; r.append(b);
    const t=el("button","ghost sm","Send a test"); t.onclick=()=>{ popup("Test alert 👋","This is what a Hangout notification looks like!","test"); ping("msg"); }; r.append(t); }
  const s=soundPref(); const sb=el("button","ghost sm",s?"🔊 Sound: On":"🔇 Sound: Off"); sb.onclick=()=>{ store("hangout-sound",s?"off":"on"); if(!s) ping("msg"); render(); }; r.append(sb);
  c.append(r);
  c.append(el("div","muted small","Alerts work while The Hangout is open, even in the background or another tab. Keep the app open (or minimized) to get them."));
  return c; }

/* ---------- sheet (bottom pop-up) ---------- */
function sheet(){ const m=$("#modal"), s=$("#sheet"); s.replaceChildren(); m.classList.add("open"); return s; }
function closeSheet(){ $("#modal").classList.remove("open"); }
function closeRow(){ const r=el("div","row"); r.style.marginTop="14px"; r.append(el("span","spacer")); const c=el("button","ghost","Close"); c.onclick=closeSheet; r.append(c); return r; }
$("#modal").addEventListener("mousedown",e=>{ if(e.target.id==="modal") closeSheet(); });

/* ---------- install as an app ---------- */
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredInstall=e; scheduleRender(); });
window.addEventListener("appinstalled",()=>{ deferredInstall=null; toast("Installed! 🎉 Find The Hangout on your home screen."); scheduleRender(); });
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const isStandalone=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone;
async function doInstall(){ if(deferredInstall){ deferredInstall.prompt(); try{ await deferredInstall.userChoice; }catch(e){} deferredInstall=null; scheduleRender(); }
  else if(isIOS()){ toast("Tap the Share button ⬆️ then \"Add to Home Screen\""); } }
$("#installBtn").onclick=doInstall;
function installCard(){ const c=el("div","install"); c.append(el("span",null,"📲"), el("div",null,isIOS()&&!deferredInstall?"Get the app: tap Share ⬆️ then \"Add to Home Screen\".":"Install The Hangout as an app on this device!"));
  if(deferredInstall){ const b=el("button","btn sm","Install"); b.onclick=doInstall; c.append(el("span","spacer"),b); } return c; }
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
