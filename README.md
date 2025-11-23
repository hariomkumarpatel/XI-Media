# InstaClone Full Project (Fresh Build)

This is a fresh, ready-to-customize InstaClone project using Firebase (Auth, Firestore, Storage).

## Files included
- index.html (feed)
- profile.html
- admin.html
- firebase.js (paste your Firebase config)
- app.js (client logic)
- style.css
- firestore.rules (Firestore security rules)
- storage.rules (Storage rules)
- functions_index.js (Cloud Functions for admin claims & delete)

## How to use
1. Create Firebase project, enable Auth (Email/Password), Firestore, Storage.
2. Copy Firebase config into `firebase.js`.
3. Serve files (Live Server or static hosting).
4. Import Firestore rules and Storage rules in Firebase console.
5. Deploy Cloud Functions if you need admin custom claim utilities.

This is a starter project. Harden rules and review before production.
