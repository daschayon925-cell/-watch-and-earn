import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// 🔇 Silence internal Firestore network & quota warnings so they do not crash or pollute console
try {
  setLogLevel('silent');
} catch {}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

let firestoreDb: any;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  }, dbId);
} catch {
  try {
    firestoreDb = getFirestore(app, dbId);
  } catch (err) {
    firestoreDb = getFirestore(app);
  }
}

export const db = firestoreDb;
export const auth = getAuth(app);
export default app;
