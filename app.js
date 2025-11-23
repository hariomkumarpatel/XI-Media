// app.js - simplified full project logic (client-side)
// NOTE: replace placeholders in firebase.js and enable Firestore/Storage/Auth in your Firebase project.
import { auth, db, storage } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const $ = id => document.getElementById(id);
function E(tag, cls, html){ const d=document.createElement(tag); if(cls) d.className=cls; if(html) d.innerHTML=html; return d; }
function esc(s){ return s? String(s).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : ''; }

// Auth quick prompts
async function promptLogin(){
  const email = prompt('Email:'); if(!email) return;
  const pwd = prompt('Password:'); if(!pwd) return;
  await signInWithEmailAndPassword(auth, email, pwd);
}
$('btnLogin')?.addEventListener('click', promptLogin);
$('btnLogout')?.addEventListener('click', ()=> signOut(auth));

// Auth state
onAuthStateChanged(auth, async user => {
  if(user){
    $('btnLogin') && $('btnLogin').classList.add('hidden');
    $('btnLogout') && $('btnLogout').classList.remove('hidden');
    // ensure public profile exists
    const uref = doc(db,'users',user.uid);
    const udoc = await getDoc(uref);
    if(!udoc.exists()){
      await setDoc(uref, { name: user.displayName||user.email.split('@')[0], userId: user.email.split('@')[0], role:'user', createdAt: serverTimestamp() });
    }
    // show admin link if role is admin
    const profile = (await getDoc(uref)).data();
    if(profile && profile.role === 'admin') $('adminLink') && $('adminLink').classList.remove('hidden');
  } else {
    $('btnLogin') && $('btnLogin').classList.remove('hidden');
    $('btnLogout') && $('btnLogout').classList.add('hidden');
  }
});

// Feed realtime
const feed = $('feed');
const postsQ = query(collection(db,'posts'), orderBy('createdAt','desc'));
onSnapshot(postsQ, snap => {
  if(!feed) return;
  feed.innerHTML = '';
  snap.forEach(async d => {
    const p = d.data();
    const card = E('div','bg-slate-800 rounded shadow overflow-hidden');
    card.innerHTML = `
      <div class="p-3 flex items-center gap-3">
        <img class="w-10 h-10 rounded" src="${esc(p.authorPhoto||'assets/avatar.png')}">
        <div><div class="font-semibold">${esc(p.authorName||p.authorId||'user')}</div><div class="text-xs text-slate-400">${new Date(p.createdAt?.toMillis? p.createdAt.toMillis(): p.createdAt||0).toLocaleString()}</div></div>
      </div>
      <img src="${esc(p.image)}" class="w-full object-cover h-64">
      <div class="p-3"><div class="text-slate-200">${esc(p.caption)}</div></div>
    `;
    feed.appendChild(card);
  });
});

// Upload post (simple flow asking for image URL or upload)
$('btnUpload')?.addEventListener('click', async ()=>{
  const user = auth.currentUser; if(!user) return alert('Login first');
  const mode = prompt('Type UPLOAD to upload local file, or URL to paste an image URL');
  if(!mode) return;
  if(mode === 'UPLOAD'){
    const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.onchange = async e => {
      const f = e.target.files[0]; const path = `posts/${user.uid}/${Date.now()}_${f.name}`; const sref = ref(storage, path);
      const task = uploadBytesResumable(sref, f);
      task.on('state_changed', null, err => alert(err.message), async ()=> {
        const url = await getDownloadURL(task.snapshot.ref);
        const udoc = (await getDoc(doc(db,'users',user.uid))).data();
        await addDoc(collection(db,'posts'), { uid: user.uid, image: url, caption: prompt('Caption?')||'', createdAt: serverTimestamp(), authorName: udoc.name, authorId: udoc.userId });
        alert('Posted');
      });
    };
    inp.click(); return;
  } else {
    const url = mode;
    const udoc = (await getDoc(doc(db,'users',user.uid))).data();
    await addDoc(collection(db,'posts'), { uid: user.uid, image: url, caption: prompt('Caption?')||'', createdAt: serverTimestamp(), authorName: udoc.name, authorId: udoc.userId });
    alert('Posted');
  }
});

// stories simple listener
onSnapshot(collection(db,'stories'), snap => {
  const sEl = $('stories'); if(!sEl) return; sEl.innerHTML = '';
  const now = Date.now();
  snap.forEach(d => {
    const s = d.data();
    if(now - s.createdAt > 24*60*60*1000) return;
    const item = E('div','flex flex-col items-center w-20'); item.innerHTML = `<img class="w-16 h-16 rounded-full border-2 border-rose-400 object-cover" src="${esc(s.image)}"><div class="text-xs mt-1">${esc(s.authorId||s.uid)}</div>`; sEl.appendChild(item);
    item.onclick = ()=> window.open(s.image,'_blank');
  });
});
