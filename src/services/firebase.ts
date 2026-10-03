import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId);
} catch {
  try {
    firestoreDb = getFirestore(app, dbId);
  } catch (err) {
    console.warn('[Firebase] Fallback getFirestore:', err);
    firestoreDb = getFirestore(app);
  }
}

export const db = firestoreDb;
export default app;
