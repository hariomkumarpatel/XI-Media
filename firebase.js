// firebase.js - paste your Firebase config values here (FROM FIREBASE CONSOLE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyTs5_LGZJgKlUyPFH_cqLHaIsxHXG4XE",
  authDomain: "hdp-tubee.firebaseapp.com",
  projectId: "hdp-tubee",
  storageBucket: "hdp-tubee.appspot.com",
  messagingSenderId: "1014108236174",
  appId: "1:1014108236174:android:a6bc36a3336a203deddcdf"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
