import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let adminDb: FirebaseFirestore.Firestore | null = null;

try {
  const configFile = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configFile)) {
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const app = !getApps().length
      ? initializeApp({
          projectId: config.projectId,
        })
      : getApp();

    adminDb = getFirestore(app, config.firestoreDatabaseId || '(default)');
    console.log('[Firebase Admin] Connected to Google Cloud Firestore successfully!');
  }
} catch (err) {
  console.warn('[Firebase Admin] Initialization fallback:', err);
}

export { adminDb };
