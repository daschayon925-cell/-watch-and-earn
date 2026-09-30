import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Video, Withdrawal, AdminSettings, RewardTransaction, Report, NotificationItem } from '../types';

/**
 * 🌟 Firebase Cloud Firestore Persistent Storage Layer
 * Ensures user accounts, coin balances, withdrawals, and admin settings
 * are stored permanently in the Google Cloud database and NEVER get lost on app/server rebuilds.
 */

export const cloudDb = {
  // --- USERS COLLECTION ---
  saveUser: async (user: User): Promise<void> => {
    try {
      if (!user || !user.uid) return;
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('[Firebase] saveUser error:', e);
    }
  },

  getUser: async (uid: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch (e) {
      console.warn('[Firebase] getUser error:', e);
    }
    return null;
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const colRef = collection(db, 'users');
      const snap = await getDocs(colRef);
      const users: User[] = [];
      snap.forEach(docSnap => {
        users.push(docSnap.data() as User);
      });
      return users;
    } catch (e) {
      console.warn('[Firebase] getAllUsers error:', e);
      return [];
    }
  },

  findUserByPhone: async (phone: string): Promise<User | null> => {
    try {
      const cleanPhone = (phone || '').replace(/\s+/g, '');
      const users = await cloudDb.getAllUsers();
      return users.find(u => (u.phone || '').replace(/\s+/g, '') === cleanPhone) || null;
    } catch (e) {
      console.warn('[Firebase] findUserByPhone error:', e);
      return null;
    }
  },

  // --- SETTINGS COLLECTION ---
  saveSettings: async (settings: AdminSettings): Promise<void> => {
    try {
      const settingsRef = doc(db, 'system', 'settings');
      await setDoc(settingsRef, settings, { merge: true });
    } catch (e) {
      console.warn('[Firebase] saveSettings error:', e);
    }
  },

  getSettings: async (): Promise<AdminSettings | null> => {
    try {
      const settingsRef = doc(db, 'system', 'settings');
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        return snap.data() as AdminSettings;
      }
    } catch (e) {
      console.warn('[Firebase] getSettings error:', e);
    }
    return null;
  },

  // --- WITHDRAWALS COLLECTION ---
  saveWithdrawal: async (w: Withdrawal): Promise<void> => {
    try {
      if (!w || !w.id) return;
      const ref = doc(db, 'withdrawals', w.id);
      await setDoc(ref, w, { merge: true });
    } catch (e) {
      console.warn('[Firebase] saveWithdrawal error:', e);
    }
  },

  getAllWithdrawals: async (): Promise<Withdrawal[]> => {
    try {
      const snap = await getDocs(collection(db, 'withdrawals'));
      const list: Withdrawal[] = [];
      snap.forEach(d => list.push(d.data() as Withdrawal));
      return list;
    } catch (e) {
      console.warn('[Firebase] getAllWithdrawals error:', e);
      return [];
    }
  },

  // --- VIDEOS COLLECTION ---
  saveVideo: async (video: Video): Promise<void> => {
    try {
      if (!video || !video.id) return;
      const ref = doc(db, 'videos', video.id);
      await setDoc(ref, video, { merge: true });
    } catch (e) {
      console.warn('[Firebase] saveVideo error:', e);
    }
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    try {
      const ref = doc(db, 'videos', videoId);
      await deleteDoc(ref);
    } catch (e) {
      console.warn('[Firebase] deleteVideo error:', e);
    }
  },

  getAllVideos: async (): Promise<Video[]> => {
    try {
      const snap = await getDocs(collection(db, 'videos'));
      const list: Video[] = [];
      snap.forEach(d => list.push(d.data() as Video));
      return list;
    } catch (e) {
      console.warn('[Firebase] getAllVideos error:', e);
      return [];
    }
  }
};
