
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function migrate() {
  try {
    const rawData = fs.readFileSync('database_data.json', 'utf-8');
    const data = JSON.parse(rawData);

    console.log('Starting migration...');

    // Migrate Users
    if (data.users) {
        for (const user of data.users) {
            if (user.uid) {
                await setDoc(doc(db, 'users', user.uid), user);
                console.log(`Migrated user: ${user.uid}`);
            }
        }
    }

    // Migrate Videos
    if (data.videos) {
        for (const video of data.videos) {
            if (video.id) {
                await setDoc(doc(db, 'videos', video.id), video);
                console.log(`Migrated video: ${video.id}`);
            }
        }
    }

    // Migrate Transactions
    if (data.transactions) {
        for (const trx of data.transactions) {
            const id = trx.transactionId || trx.id;
            if (id) {
                await setDoc(doc(db, 'transactions', id), trx);
                console.log(`Migrated transaction: ${id}`);
            } else {
                console.warn('Skipping transaction without ID:', trx);
            }
        }
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();
