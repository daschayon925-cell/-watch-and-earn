import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Video, Withdrawal, AdminSettings } from '../types';

/**
 * 🌟 Firebase Cloud Firestore Persistent Storage Layer
 * Includes an intelligent Circuit-Breaker to prevent runtime crashes or console backoff loops
 * when Google Cloud Firestore's free daily write quota (20,000 units/day) is reached.
 */

let quotaExceededState = false;
try {
  if (typeof sessionStorage !== 'undefined') {
    quotaExceededState = sessionStorage.getItem('we_fs_quota_exceeded') === 'true';
  }
} catch {}

const markQuotaExceeded = (err: any) => {
  const errMsg = err?.message || String(err || '');
  if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota limit exceeded') || errMsg.includes('Quota exceeded')) {
    quotaExceededState = true;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('we_fs_quota_exceeded', 'true');
      }
    } catch {}
    console.warn('[CloudDB] Firestore daily quota reached. Pausing cloud writes; relying safely on primary Express backend and local storage.');
  }
};

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> => {
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
    if (quotaExceededState) return;
    try {
      if (!user || !user.uid) return;
      const userRef = doc(db, 'users', user.uid);
      await withTimeout(setDoc(userRef, {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true }), 2500);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getUser: async (uid: string): Promise<User | null> => {
    try {
      if (!uid) return null;
      const userRef = doc(db, 'users', uid);
      const snap = await withTimeout(getDoc(userRef), 2500);
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch (err: any) {
      markQuotaExceeded(err);
    }
    return null;
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const colRef = collection(db, 'users');
      const snap = await withTimeout(getDocs(colRef), 3000);
      const users: User[] = [];
      snap.forEach(docSnap => {
        users.push(docSnap.data() as User);
      });
      return users;
    } catch (err: any) {
      markQuotaExceeded(err);
      return [];
    }
  },

  findUserByPhone: async (phone: string): Promise<User | null> => {
    try {
      const cleanPhone = (phone || '').replace(/\s+/g, '');
      const users = await cloudDb.getAllUsers();
      return users.find(u => (u.phone || '').replace(/\s+/g, '') === cleanPhone) || null;
    } catch (err: any) {
      markQuotaExceeded(err);
      return null;
    }
  },

  // --- SETTINGS COLLECTION ---
  saveSettings: async (settings: AdminSettings): Promise<void> => {
    if (quotaExceededState) return;
    try {
      const settingsRef = doc(db, 'system', 'settings');
      await withTimeout(setDoc(settingsRef, settings, { merge: true }), 2500);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getSettings: async (): Promise<AdminSettings | null> => {
    try {
      const settingsRef = doc(db, 'system', 'settings');
      const snap = await withTimeout(getDoc(settingsRef), 2500);
      if (snap.exists()) {
        return snap.data() as AdminSettings;
      }
    } catch (err: any) {
      markQuotaExceeded(err);
    }
    return null;
  },

  // --- WITHDRAWALS COLLECTION ---
  saveWithdrawal: async (w: Withdrawal): Promise<void> => {
    if (quotaExceededState) return;
    try {
      if (!w || !w.withdrawalId) return;
      const ref = doc(db, 'withdrawals', w.withdrawalId);
      await withTimeout(setDoc(ref, w, { merge: true }), 2500);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getAllWithdrawals: async (): Promise<Withdrawal[]> => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'withdrawals')), 3000);
      const list: Withdrawal[] = [];
      snap.forEach(d => list.push(d.data() as Withdrawal));
      return list;
    } catch (err: any) {
      markQuotaExceeded(err);
      return [];
    }
  },

  // --- VIDEOS COLLECTION ---
  saveVideo: async (video: Video): Promise<void> => {
    if (quotaExceededState) return;
    try {
      if (!video || !video.id) return;
      const ref = doc(db, 'videos', video.id);
      await withTimeout(setDoc(ref, video, { merge: true }), 2500);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    if (quotaExceededState) return;
    try {
      const ref = doc(db, 'videos', videoId);
      await withTimeout(deleteDoc(ref), 2500);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getAllVideos: async (): Promise<Video[]> => {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'videos')), 3000);
      const list: Video[] = [];
      snap.forEach(d => list.push(d.data() as Video));
      return list;
    } catch (err: any) {
      markQuotaExceeded(err);
      return [];
    }
  }
};
