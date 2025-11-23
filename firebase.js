// firebase.js
// Replace values below only if console shows different ones.
// I used your provided values and corrected authDomain/databaseURL style.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyTs5_LGZJgKlUyPFH_cqLHaIsxHXG4XE",
  authDomain: "hdp-tubee.firebaseapp.com",                 // corrected
  projectId: "hdp-tubee",
  storageBucket: "hdp-tubee.appspot.com",
  messagingSenderId: "SENDER_ID",                         // optional (leave)
  appId: "1:1014108236174:android:a6bc36a3336a203deddcdf",                                        // optional (leave)
  // databaseURL if you want RTDB: "https://hdp-tubee-default-rtdb.firebaseio.com"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
