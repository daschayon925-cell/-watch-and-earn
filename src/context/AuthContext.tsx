import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setApiUserId } from '../services/api';
import { cloudDb } from '../services/cloudDb';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginDemo: (uid?: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string; otpCode?: string }>;
  registerUser: (data: { displayName: string; phone: string; password?: string; otpCode?: string; email?: string; referralCodeInput?: string; biometricType?: 'fingerprint' | 'face' | 'none'; biometricEnrolled?: boolean; biometricPhoto?: string; webAuthnCredentialId?: string; photoURL?: string }) => Promise<{ success: boolean; message: string; bonusAdded?: number }>;
  loginUser: (identifier: string, password?: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: { displayName?: string; phone?: string; photoURL?: string; biometricType?: 'fingerprint' | 'face' | 'none'; biometricEnrolled?: boolean; biometricPhoto?: string; webAuthnCredentialId?: string }) => Promise<void>;
  toggleAdminRole: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
        const finalUser: User = {
          ...u,
          photoURL: (savedPhoto && savedPhoto.startsWith('data:')) ? savedPhoto : (u.photoURL || savedPhoto || u.photoURL)
        };
        setUser(finalUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        cloudDb.saveUser(finalUser);
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

  const loginDemo = async (uid?: string) => {
    if (!uid) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setApiUserId(uid);
    localStorage.setItem('we_user_id', uid);
    const savedPhoto = localStorage.getItem(`we_user_photo_${uid}`);
    try {
      const u = await api.getProfile();
      if (u) {
        const finalUser: User = {
          ...u,
          photoURL: savedPhoto || u.photoURL
        };
        setUser(finalUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        cloudDb.saveUser(finalUser);
      } else {
        // Fetch from Cloud DB directly if server just restarted
        const cloudUser = await cloudDb.getUser(uid);
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
      }
    } catch (err) {
      console.error('Login error', err);
      // Fallback to cloud db
      const cloudUser = await cloudDb.getUser(uid);
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
      if (res.success && res.user) {
        setApiUserId(res.user.uid);
        localStorage.setItem('we_user_id', res.user.uid);
        setUser(res.user);
        // Save permanently in Firestore cloud database
        await cloudDb.saveUser(res.user);
        return { success: true, message: res.message, bonusAdded: res.bonusAdded };
      }
      return { success: false, message: res.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err.message || 'নেটওয়ার্ক সমস্যা।' };
    }
  };

  const loginUser = async (identifier: string, password?: string) => {
    try {
      const res = await api.login(identifier, password);
      if (res.success && res.user) {
        setApiUserId(res.user.uid);
        localStorage.setItem('we_user_id', res.user.uid);
        setUser(res.user);
        // Save permanently in Cloud DB
        await cloudDb.saveUser(res.user);
        return { success: true, message: res.message };
      }

      // If server lost state due to Render restart, check Cloud Firestore directly!
      const clean = (identifier || '').replace(/\s+/g, '');
      const cloudUser = await cloudDb.findUserByPhone(clean);
      if (cloudUser) {
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

      return { success: false, message: res.message || 'লগইন ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      // Cloud fallback on network error
      const clean = (identifier || '').replace(/\s+/g, '');
      const cloudUser = await cloudDb.findUserByPhone(clean);
      if (cloudUser) {
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
      if (user) {
        const mergedUser: User = {
          ...user,
          ...data,
          updatedAt: new Date().toISOString()
        };
        setUser(mergedUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(mergedUser));
        if (data.photoURL) {
          localStorage.setItem(`we_user_photo_${user.uid}`, data.photoURL);
        }
        await cloudDb.saveUser(mergedUser);
      }

      const updated = await api.updateProfile(data);
      if (updated) {
        const finalUser: User = {
          ...updated,
          photoURL: data.photoURL || updated.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
        setUser(finalUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(finalUser));
        await cloudDb.saveUser(finalUser);
      }
    } catch (err) {
      console.error('Update profile error', err);
      // Even on API error, maintain local & cloud Firestore persist
      if (user) {
        const fallbackUser: User = {
          ...user,
          ...data,
          updatedAt: new Date().toISOString()
        };
        setUser(fallbackUser);
        localStorage.setItem('we_user_cached_profile', JSON.stringify(fallbackUser));
        if (data.photoURL) {
          localStorage.setItem(`we_user_photo_${user.uid}`, data.photoURL);
        }
        await cloudDb.saveUser(fallbackUser);
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

  useEffect(() => {
    const savedUid = localStorage.getItem('we_user_id');
    if (savedUid) {
      loginDemo(savedUid);
    } else {
      setLoading(false);
      setUser(null);
    }

    // 🔄 Auto Dynamic User Profile Polling every 4 seconds to reflect realtime earnings
    const userPollTimer = setInterval(() => {
      const activeUid = localStorage.getItem('we_user_id');
      if (activeUid) {
        refreshUser();
      }
    }, 4000);

    return () => clearInterval(userPollTimer);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginDemo, sendPhoneOtp, registerUser, loginUser, updateProfile, toggleAdminRole, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
