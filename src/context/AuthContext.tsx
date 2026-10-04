import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setApiUserId } from '../services/api';
import { cloudDb } from '../services/cloudDb';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginDemo: (uid?: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string; fallbackRequired?: boolean }>;
  loginWithGoogleDirect: (data: { email: string; displayName?: string; photoURL?: string }) => Promise<{ success: boolean; message: string }>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string; otpCode?: string }>;
  registerUser: (data: { displayName: string; phone: string; password?: string; otpCode?: string; email?: string; referralCodeInput?: string; biometricType?: 'fingerprint' | 'face' | 'none'; biometricEnrolled?: boolean; biometricPhoto?: string; webAuthnCredentialId?: string; photoURL?: string }) => Promise<{ success: boolean; message: string; bonusAdded?: number }>;
  loginUser: (identifier: string, password?: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: { displayName?: string; phone?: string; photoURL?: string; biometricType?: 'fingerprint' | 'face' | 'none'; biometricEnrolled?: boolean; biometricPhoto?: string; webAuthnCredentialId?: string }) => Promise<void>;
  toggleAdminRole: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  awardCoinsLocally: (coins: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const activeUid = localStorage.getItem('we_user_id');
      if (!activeUid) return;

      const savedPhoto = localStorage.getItem(`we_user_photo_${activeUid}`);
      const u = await api.getProfile();
      if (u) {
        // 🛡️ Prevent Coin Decreases / Rollback across sessions or server restarts
        let highestCoins = u.coins;
        const currentCached = localStorage.getItem('we_user_cached_profile');
        if (currentCached) {
          try {
            const parsed = JSON.parse(currentCached);
            if (parsed.coins && parsed.coins > highestCoins) highestCoins = parsed.coins;
          } catch {}
        }
        if (user && user.coins > highestCoins) highestCoins = user.coins;

        const finalUser: User = {
          ...u,
          coins: highestCoins,
          photoURL: (savedPhoto && savedPhoto.startsWith('data:')) ? savedPhoto : (u.photoURL || savedPhoto || u.photoURL)
        };
        setUser(finalUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        if (highestCoins > u.coins) {
          api.syncCoins(highestCoins);
        }
      } else {
        const cloudUser = await cloudDb.getUser(activeUid);
        if (cloudUser) {
          const finalUser: User = {
            ...cloudUser,
            photoURL: savedPhoto || cloudUser.photoURL
          };
          setUser(finalUser);
          localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        }
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  const loginWithGoogleDirect = async (data: { email: string; displayName?: string; photoURL?: string }): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const cleanEmail = (data.email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('অনুগ্রহ করে সঠিক গুগল/জিমেইল অ্যাড্রেস লিখুন।');
      }

      let cachedCoins = 0;
      const currentCached = localStorage.getItem('we_user_cached_profile');
      if (currentCached) {
        try {
          const parsed = JSON.parse(currentCached);
          if (parsed.coins) cachedCoins = parsed.coins;
        } catch {}
      }
      if (user && user.coins > cachedCoins) cachedCoins = user.coins;

      const baseName = data.displayName?.trim() || cleanEmail.split('@')[0];
      const autoPhoto = data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(baseName)}&background=0284c7&color=fff&bold=true`;
      const generatedUid = 'usr_g_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

      const res = await api.googleLogin({
        uid: generatedUid,
        email: cleanEmail,
        displayName: baseName,
        photoURL: autoPhoto,
        cachedCoins
      });

      if (res.success && res.user) {
        const finalUser = res.user;
        setApiUserId(finalUser.uid);
        localStorage.setItem('we_user_id', finalUser.uid);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        setUser(finalUser);
        cloudDb.saveUser(finalUser).catch(() => {});
        return { success: true, message: res.message || 'গুগল অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে!' };
      } else {
        throw new Error(res.message || 'গুগল লগইন সম্পন্ন করা যায়নি');
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'গুগল লগইন সম্পন্ন করা যায়নি।' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string; fallbackRequired?: boolean }> => {
    setLoading(true);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { auth } = await import('../services/firebase');

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      let googleUser: any = null;
      try {
        const result = await signInWithPopup(auth, provider);
        googleUser = result.user;
      } catch (popupErr: any) {
        console.warn('Firebase Popup Login Notice:', popupErr);
        // Fallback required if browser blocks popup or domain isn't authorized
        return {
          success: false,
          fallbackRequired: true,
          message: popupErr.code === 'auth/popup-blocked'
            ? 'ব্রাউজারে পপ-আপ ব্লক থাকায় বিকল্প উপায়ে গুগল অ্যাকাউন্ট নির্বাচন করুন।'
            : 'গুগল অ্যাকাউন্ট নির্বাচন করে ১ ক্লিকে লগইন করুন।'
        };
      }

      if (!googleUser || !googleUser.uid) {
        return { success: false, fallbackRequired: true, message: 'গুগল তথ্য পাওয়া যায়নি' };
      }

      // Collect any cached guest coins so they are NOT lost!
      let cachedCoins = 0;
      const currentCached = localStorage.getItem('we_user_cached_profile');
      if (currentCached) {
        try {
          const parsed = JSON.parse(currentCached);
          if (parsed?.coins) cachedCoins = parsed.coins;
        } catch {}
      }
      if (user && user.coins > cachedCoins) cachedCoins = user.coins;

      const res = await api.googleLogin({
        uid: googleUser.uid,
        email: googleUser.email || '',
        displayName: googleUser.displayName || 'গুগল মেম্বার',
        photoURL: googleUser.photoURL || '',
        cachedCoins
      });

      if (res?.success && res?.user && res.user.uid) {
        const finalUser = res.user;
        setApiUserId(finalUser.uid);
        localStorage.setItem('we_user_id', finalUser.uid);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        setUser(finalUser);
        cloudDb.saveUser(finalUser).catch(() => {});
        return { success: true, message: res.message || 'গুগল লগইন সফল হয়েছে!' };
      } else {
        throw new Error(res?.message || 'গুগল লগইন সম্পন্ন করা যায়নি');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      return { 
        success: false,
        fallbackRequired: true,
        message: err.message || 'গুগল সাইন-ইন সম্পন্ন করতে নিচে ইমেইল নির্বাচন করুন।' 
      };
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (uid?: string) => {
    setLoading(true);
    let effectiveUid = uid || (typeof window !== 'undefined' ? localStorage.getItem('we_user_id') : null);
    
    // If no existing UID (e.g. 1-click Guest login on another phone), initialize guest user!
    if (!effectiveUid) {
      try {
        const guestRes = await api.guestLogin();
        if (guestRes.success && guestRes.user) {
          effectiveUid = guestRes.user.uid;
          setApiUserId(effectiveUid);
          localStorage.setItem('we_user_id', effectiveUid);
          setUser(guestRes.user);
          localStorage.setItem('we_user_cached_profile', JSON.stringify(guestRes.user));
          cloudDb.saveUser(guestRes.user).catch(() => {});
          setLoading(false);
          return;
        }
      } catch (e) {
        effectiveUid = 'usr_guest_' + Date.now();
      }
    }

    if (!effectiveUid) {
      setUser(null);
      setLoading(false);
      return;
    }

    setApiUserId(effectiveUid);
    localStorage.setItem('we_user_id', effectiveUid);
    const savedPhoto = localStorage.getItem(`we_user_photo_${effectiveUid}`);
    try {
      const u = await api.getProfile();
      if (u) {
        // 🛡️ Prevent Coin Decreases
        let highestCoins = u.coins;
        const currentCached = localStorage.getItem('we_user_cached_profile');
        if (currentCached) {
          try {
            const parsed = JSON.parse(currentCached);
            if (parsed.coins && parsed.coins > highestCoins) highestCoins = parsed.coins;
          } catch {}
        }
        if (user && user.coins > highestCoins) highestCoins = user.coins;

        const finalUser: User = {
          ...u,
          coins: highestCoins,
          photoURL: savedPhoto || u.photoURL
        };
        setUser(finalUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        if (highestCoins > u.coins) {
          api.syncCoins(highestCoins);
        }
      } else {
        // Fetch from Cloud DB directly if server just restarted
        const cloudUser = await cloudDb.getUser(effectiveUid);
        if (cloudUser) {
          const finalUser: User = {
            ...cloudUser,
            photoURL: savedPhoto || cloudUser.photoURL
          };
          setUser(finalUser);
          localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        } else {
          // If neither server nor cloud has it, create guest profile
          const guestRes = await api.guestLogin(effectiveUid);
          if (guestRes.success && guestRes.user) {
            setUser(guestRes.user);
            localStorage.setItem('we_user_cached_profile', JSON.stringify(guestRes.user));
            cloudDb.saveUser(guestRes.user).catch(() => {});
          } else {
            setUser(null);
          }
        }
      }
    } catch (err) {
      console.error('Login error', err);
      // Fallback to cloud db
      const cloudUser = await cloudDb.getUser(effectiveUid);
      if (cloudUser) {
        const finalUser: User = {
          ...cloudUser,
          photoURL: savedPhoto || cloudUser.photoURL
        };
        setUser(finalUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    try {
      const res = await api.sendOtp(phone);
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'পিন পাঠাতে সমস্যা হয়েছে।' };
    }
  };

  const registerUser = async (data: { displayName: string; phone: string; password?: string; otpCode?: string; email?: string; referralCodeInput?: string }) => {
    try {
      const res = await api.register(data);
      if (res?.success && res?.user && res.user.uid) {
        setApiUserId(res.user.uid);
        localStorage.setItem('we_user_id', res.user.uid);
        setUser(res.user);
        // Save permanently in Firestore cloud database
        cloudDb.saveUser(res.user).catch(() => {});
        return { success: true, message: res.message, bonusAdded: res.bonusAdded };
      }
      return { success: false, message: res?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err.message || 'নেটওয়ার্ক সমস্যা।' };
    }
  };

  const loginUser = async (identifier: string, password?: string) => {
    try {
      const res = await api.login(identifier, password);
      if (res?.success && res?.user && res.user.uid) {
        setApiUserId(res.user.uid);
        localStorage.setItem('we_user_id', res.user.uid);
        setUser(res.user);
        // Save permanently in Cloud DB
        cloudDb.saveUser(res.user).catch(() => {});
        return { success: true, message: res.message };
      }

      // If server lost state due to Render restart, check Cloud Firestore directly!
      const clean = (identifier || '').replace(/\s+/g, '');
      const cloudUser = await cloudDb.findUserByPhone(clean);
      if (cloudUser && cloudUser.uid) {
        if (cloudUser.password && password && cloudUser.password !== password.trim()) {
          return { success: false, message: 'ভুল পাসওয়ার্ড! আপনার সঠিক পাসওয়ার্ডটি লিখুন।' };
        }
        setApiUserId(cloudUser.uid);
        localStorage.setItem('we_user_id', cloudUser.uid);
        setUser(cloudUser);
        // Re-sync user back to server API
        try {
          await api.register({
            displayName: cloudUser.displayName,
            phone: cloudUser.phone || '',
            password: cloudUser.password,
            otpCode: 'bypass_synced'
          });
        } catch (e) {}
        return { success: true, message: 'লগইন সফল হয়েছে (ক্লাউড ডাটাবেস থেকে পুনরুদ্ধার করা হয়েছে)!' };
      }

      return { success: false, message: res?.message || 'লগইন ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      // Cloud fallback on network error
      const clean = (identifier || '').replace(/\s+/g, '');
      const cloudUser = await cloudDb.findUserByPhone(clean);
      if (cloudUser && cloudUser.uid) {
        if (cloudUser.password && password && cloudUser.password !== password.trim()) {
          return { success: false, message: 'ভুল পাসওয়ার্ড! আপনার সঠিক পাসওয়ার্ডটি লিখুন।' };
        }
        setApiUserId(cloudUser.uid);
        localStorage.setItem('we_user_id', cloudUser.uid);
        setUser(cloudUser);
        return { success: true, message: 'লগইন সফল হয়েছে!' };
      }
      return { success: false, message: err.message || 'লগইন করতে সমস্যা হচ্ছে।' };
    }
  };

  const updateProfile = async (data: { displayName?: string; phone?: string; photoURL?: string; biometricType?: 'fingerprint' | 'face' | 'none'; biometricEnrolled?: boolean; biometricPhoto?: string; webAuthnCredentialId?: string }) => {
    try {
      if (user && user.uid) {
        const mergedUser: User = {
          ...user,
          ...data,
          updatedAt: new Date().toISOString()
        };
        setUser(mergedUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(mergedUser));
        if (data.photoURL && user.uid) {
          localStorage.setItem(`we_user_photo_${user.uid}`, data.photoURL);
        }
        cloudDb.saveUser(mergedUser).catch(() => {});
      }

      const updated = await api.updateProfile(data);
      if (updated && updated.uid) {
        const finalUser: User = {
          ...updated,
          photoURL: data.photoURL || updated.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
        setUser(finalUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        cloudDb.saveUser(finalUser).catch(() => {});
      }
    } catch (err) {
      console.error('Update profile error', err);
      // Even on API error, maintain local & cloud Firestore persist
      if (user && user.uid) {
        const fallbackUser: User = {
          ...user,
          ...data,
          updatedAt: new Date().toISOString()
        };
        setUser(fallbackUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(fallbackUser));
        if (data.photoURL && user.uid) {
          localStorage.setItem(`we_user_photo_${user.uid}`, data.photoURL);
        }
        cloudDb.saveUser(fallbackUser).catch(() => {});
      }
    }
  };

  const toggleAdminRole = async () => {
    if (!user) return;
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const updated = await api.switchRole(nextRole);
      setUser(updated);
    } catch (err) {
      console.error('Role toggle error', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('we_user_id');
    sessionStorage.removeItem('we_admin_unlocked');
    setUser(null);
  };

  const awardCoinsLocally = (coins: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedCoins = (prev.coins || 0) + coins;
      const updated: User = {
        ...prev,
        coins: updatedCoins,
        lifetimeCoins: ((prev.lifetimeCoins || prev.coins || 0) + coins),
        todayCoins: ((prev.todayCoins || 0) + coins),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('we_user_cached_profile', JSON.stringify(updated));
      api.syncCoins(updatedCoins);
      return updated;
    });
  };

  useEffect(() => {
    const savedUid = localStorage.getItem('we_user_id');
    if (savedUid) {
      loginDemo(savedUid);
    } else {
      // 🌟 Frictionless Auto-Onboarding for new devices / other mobiles!
      // Instantly gives them an active account with 100 welcome coins so they can earn immediately!
      loginDemo();
    }

    // 🔄 Dynamic User Profile Polling every 12 seconds to reflect realtime earnings without overloading network
    const userPollTimer = setInterval(() => {
      const activeUid = localStorage.getItem('we_user_id');
      if (activeUid) {
        refreshUser();
      }
    }, 12000);

    return () => clearInterval(userPollTimer);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginDemo, loginWithGoogle, loginWithGoogleDirect, sendPhoneOtp, registerUser, loginUser, updateProfile, toggleAdminRole, logout, refreshUser, awardCoinsLocally }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
