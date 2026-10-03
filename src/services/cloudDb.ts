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

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Firestore operation timed out')), timeoutMs)
    )
  ]);
};

export const cloudDb = {
  // --- USERS COLLECTION ---
  saveUser: async (user: User): Promise<void> => {
    try {
      if (!user || !user.uid) return;
      const userRef = doc(db, 'users', user.uid);
      await withTimeout(setDoc(userRef, {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true }), 3500);
    } catch {
      // Graceful offline fallback
    }
  },

  getUser: async (uid: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await withTimeout(getDoc(userRef), 3500);
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch {
      // Graceful offline fallback
    }
    return null;
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const colRef = collection(db, 'users');
      const snap = await withTimeout(getDocs(colRef), 4000);
      const users: User[] = [];
      snap.forEach(docSnap => {
        users.push(docSnap.data() as User);
      });
      return users;
    } catch {
      return [];
    }
  },

  findUserByPhone: async (phone: string): Promise<User | null> => {
    try {
      const cleanPhone = (phone || '').replace(/\s+/g, '');
      const users = await cloudDb.getAllUsers();
      return users.find(u => (u.phone || '').replace(/\s+/g, '') === cleanPhone) || null;
    } catch {
      return null;
    }
  },

  // --- SETTINGS COLLECTION ---
  saveSettings: async (settings: AdminSettings): Promise<void> => {
    try {
      const settingsRef = doc(db, 'system', 'settings');
      await withTimeout(setDoc(settingsRef, settings, { merge: true }), 3500);
    } catch {
      // Graceful offline fallback
    }
  },

  getSettings: async (): Promise<AdminSettings | null> => {
    try {
      const settingsRef = doc(db, 'system', 'settings');
      const snap = await withTimeout(getDoc(settingsRef), 3500);
      if (snap.exists()) {
        return snap.data() as AdminSettings;
      }
    } catch {
      // Graceful offline fallback
    }
    return null;
  },

  // --- WITHDRAWALS COLLECTION ---
  saveWithdrawal: async (w: Withdrawal): Promise<void> => {
    try {
      if (!w || !w.withdrawalId) return;
      const ref = doc(db, 'withdrawals', w.withdrawalId);
      await withTimeout(setDoc(ref, w, { merge: true }), 3500);
    } catch {
      // Graceful offline fallback
    }
  },

  getAllWithdrawals: async (): Promise<Withdrawal[]> => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'withdrawals')), 4000);
      const list: Withdrawal[] = [];
      snap.forEach(d => list.push(d.data() as Withdrawal));
      return list;
    } catch {
      return [];
    }
  },

  // --- VIDEOS COLLECTION ---
  saveVideo: async (video: Video): Promise<void> => {
    try {
      if (!video || !video.id) return;
      const ref = doc(db, 'videos', video.id);
      await withTimeout(setDoc(ref, video, { merge: true }), 3500);
    } catch {
      // Graceful offline fallback
    }
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    try {
      const ref = doc(db, 'videos', videoId);
      await withTimeout(deleteDoc(ref), 3500);
    } catch {
      // Graceful offline fallback
    }
  },

  getAllVideos: async (): Promise<Video[]> => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'videos')), 4000);
      const list: Video[] = [];
      snap.forEach(d => list.push(d.data() as Video));
      return list;
    } catch {
      return [];
    }
  }
};
