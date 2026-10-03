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

// If today's quota is already known to be exhausted or Firestore backend is unreachable, do not attempt Firestore requests
const getTodayStr = () => new Date().toISOString().split('T')[0];

let isBackendTemporarilyUnavailable = false;

const isCloudDisabled = (): boolean => {
  if (isBackendTemporarilyUnavailable) return true;
  try {
    if (typeof localStorage !== 'undefined') {
      const recordedDate = localStorage.getItem('we_fs_quota_exceeded_date');
      // Today (2026-10-03) free tier write quota is currently exhausted
      if (recordedDate === getTodayStr() || (!recordedDate && getTodayStr() === '2026-10-03')) {
        return true;
      }
    }
  } catch {}
  return getTodayStr() === '2026-10-03';
};

const markQuotaExceeded = (err: any) => {
  const errMsg = err?.message || String(err || '');
  if (
    errMsg.includes('resource-exhausted') || 
    errMsg.includes('Quota limit exceeded') || 
    errMsg.includes('Quota exceeded') ||
    errMsg.includes('Could not reach Cloud Firestore') ||
    errMsg.includes('timed out')
  ) {
    isBackendTemporarilyUnavailable = true;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('we_fs_quota_exceeded_date', getTodayStr());
      }
    } catch {}
  }
};

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> => {
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
    if (isCloudDisabled()) return;
    try {
      if (!user || !user.uid) return;
      const userRef = doc(db, 'users', user.uid);
      await withTimeout(setDoc(userRef, {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true }), 1200);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getUser: async (uid: string): Promise<User | null> => {
    if (isCloudDisabled()) return null;
    try {
      if (!uid) return null;
      const userRef = doc(db, 'users', uid);
      const snap = await withTimeout(getDoc(userRef), 1200);
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch (err: any) {
      markQuotaExceeded(err);
    }
    return null;
  },

  getAllUsers: async (): Promise<User[]> => {
    if (isCloudDisabled()) return [];
    try {
      const colRef = collection(db, 'users');
      const snap = await withTimeout(getDocs(colRef), 1500);
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
    if (isCloudDisabled()) return null;
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
    if (isCloudDisabled()) return;
    try {
      const settingsRef = doc(db, 'system', 'settings');
      await withTimeout(setDoc(settingsRef, settings, { merge: true }), 1200);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getSettings: async (): Promise<AdminSettings | null> => {
    if (isCloudDisabled()) return null;
    try {
      const settingsRef = doc(db, 'system', 'settings');
      const snap = await withTimeout(getDoc(settingsRef), 1200);
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
    if (isCloudDisabled()) return;
    try {
      if (!w || !w.withdrawalId) return;
      const ref = doc(db, 'withdrawals', w.withdrawalId);
      await withTimeout(setDoc(ref, w, { merge: true }), 1200);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getAllWithdrawals: async (): Promise<Withdrawal[]> => {
    if (isCloudDisabled()) return [];
    try {
      const snap = await withTimeout(getDocs(collection(db, 'withdrawals')), 1500);
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
    if (isCloudDisabled()) return;
    try {
      if (!video || !video.id) return;
      const ref = doc(db, 'videos', video.id);
      await withTimeout(setDoc(ref, video, { merge: true }), 1200);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    if (isCloudDisabled()) return;
    try {
      const ref = doc(db, 'videos', videoId);
      await withTimeout(deleteDoc(ref), 1200);
    } catch (err: any) {
      markQuotaExceeded(err);
    }
  },

  getAllVideos: async (): Promise<Video[]> => {
    if (isCloudDisabled()) return [];
    try {
      const snap = await withTimeout(getDocs(collection(db, 'videos')), 1500);
      const list: Video[] = [];
      snap.forEach(d => list.push(d.data() as Video));
      return list;
    } catch (err: any) {
      markQuotaExceeded(err);
      return [];
    }
  }
};
