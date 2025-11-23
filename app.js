// app.js
import { auth, db, storage } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

/* DOM references */
const btnLogin = document.getElementById('btnLogin');
const authModal = document.getElementById('authModal');
const closeAuth = document.getElementById('closeAuth');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const switchAuth = document.getElementById('switchAuth');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authInfo = document.getElementById('authInfo');

const btnLogout = document.getElementById('btnLogout');
const btnNew = document.getElementById('btnNew');
const uploadModal = document.getElementById('uploadModal');
const closeUpload = document.getElementById('closeUpload');
const fileInput = document.getElementById('fileInput');
const captionInput = document.getElementById('caption');
const uploadBtn = document.getElementById('uploadBtn');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const uploadMsg = document.getElementById('uploadMsg');

const displayName = document.getElementById('displayName');
const emailText = document.getElementById('emailText');
const avatar = document.getElementById('avatar');

const feed = document.getElementById('feed');

let isSignup = false;

/* Auth modal controls */
btnLogin.addEventListener('click', ()=> { authModal.style.display='flex'; authTitle.textContent='Login'; isSignup=false; authInfo.textContent=''; });
closeAuth.addEventListener('click', ()=> authModal.style.display='none');
switchAuth.addEventListener('click', ()=> {
  isSignup = !isSignup;
  authTitle.textContent = isSignup ? 'Sign up' : 'Login';
  switchAuth.textContent = isSignup ? 'Switch to Login' : 'Switch to Sign up';
});

authSubmit.addEventListener('click', async ()=>{
  const email = authEmail.value.trim();
  const pass = authPassword.value;
  if(!email || !pass) { authInfo.textContent='Enter email & password'; return; }
  try{
    if(isSignup){
      await createUserWithEmailAndPassword(auth, email, pass);
      authInfo.textContent = 'Account created. You are logged in.';
      authModal.style.display='none';
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
      authInfo.textContent = 'Logged in.';
      authModal.style.display='none';
    }
    authEmail.value=''; authPassword.value='';
  }catch(err){
    authInfo.textContent = err.message;
  }
});

/* Upload modal controls */
btnNew.addEventListener('click', ()=> uploadModal.style.display='flex');
closeUpload.addEventListener('click', ()=> uploadModal.style.display='none');

uploadBtn.addEventListener('click', async ()=>{
  const file = fileInput.files[0];
  const caption = captionInput.value.trim().slice(0,300);
  if(!file){ uploadMsg.textContent='Choose an image first'; return; }
  uploadMsg.textContent='Uploading...';
  progressWrap.style.display='block';
  const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed',
    (snapshot) => {
      const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      progressBar.style.width = pct + '%';
    },
    (error) => {
      uploadMsg.textContent = 'Upload failed: ' + error.message;
    },
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      // save post to Firestore
      await addDoc(collection(db, 'posts'), {
        image: url,
        caption: caption,
        createdAt: serverTimestamp(),
        uid: auth.currentUser ? auth.currentUser.uid : null,
        authorEmail: auth.currentUser ? auth.currentUser.email : 'anonymous'
      });
      uploadMsg.textContent = 'Posted!';
      fileInput.value = ''; captionInput.value = '';
      progressBar.style.width = '0%';
      progressWrap.style.display='none';
      setTimeout(()=> uploadModal.style.display='none', 700);
    }
  );
});

/* Logout */
btnLogout.addEventListener('click', ()=> signOut(auth));

/* Auth state */
onAuthStateChanged(auth, async (user)=>{
  if(user){
    btnLogin.style.display='none';
    btnLogout.style.display='inline-block';
    displayName.textContent = user.displayName || 'User';
    emailText.textContent = user.email;
    // if user has a photoURL, show; else placeholder
    avatar.src = user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`;

  } else {
    btnLogin.style.display='inline-block';
    btnLogout.style.display='none';
    displayName.textContent = 'Guest';
    emailText.textContent = 'Not signed in';
    avatar.src = 'https://via.placeholder.com/90';
  }
});

/* Live feed - listens to 'posts' collection ordered by createdAt desc */
const postsCol = collection(db, 'posts');
const q = query(postsCol, orderBy('createdAt','desc'));
onSnapshot(q, snapshot => {
  feed.innerHTML = '';
  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    // createdAt can be a timestamp or null right after adding; handle gracefully
    const timeText = p.createdAt && p.createdAt.toDate ? timeAgo(p.createdAt.toDate()) : '';
    const el = document.createElement('article');
    el.className = 'post';
    el.innerHTML = `
      <div class="meta">
        <img src="https://i.pravatar.cc/80?u=${escapeHtml(p.authorEmail||'anon')}" alt="avatar">
        <div>
          <strong>${escapeHtml(p.authorEmail || 'anon')}</strong>
          <div class="muted small">${timeText}</div>
        </div>
      </div>
      <img class="content" src="${escapeHtml(p.image)}" alt="post image">
      <div class="caption">${escapeHtml(p.caption||'')}</div>
    `;
    feed.appendChild(el);
  });
});

/* Utils */
function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function timeAgo(d){
  const diff = (Date.now() - d.getTime())/1000;
  if(diff < 60) return `${Math.floor(diff)}s`;
  if(diff < 3600) return `${Math.floor(diff/60)}m`;
  if(diff < 86400) return `${Math.floor(diff/3600)}h`;
  return `${Math.floor(diff/86400)}d`;
}
