// functions/index.js - Cloud Functions for admin actions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setAdmin = functions.https.onCall(async (data, context) => {
  if(!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  if(!(context.auth.token && context.auth.token.admin)) throw new functions.https.HttpsError('permission-denied','Only admins can assign admin role');
  const uid = data.uid;
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  await admin.firestore().doc(`users/${uid}`).update({ role: 'admin' });
  return { result: 'ok' };
});

exports.deleteAuthUser = functions.https.onCall(async (data, context) => {
  if(!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  if(!(context.auth.token && context.auth.token.admin)) throw new functions.https.HttpsError('permission-denied','Only admins can delete users');
  const uid = data.uid;
  await admin.auth().deleteUser(uid);
  await admin.firestore().doc(`users/${uid}`).delete();
  const postsSnap = await admin.firestore().collection('posts').where('uid','==',uid).get();
  for(const p of postsSnap.docs) await admin.firestore().doc(`posts/${p.id}`).delete();
  return { result: 'deleted' };
});
