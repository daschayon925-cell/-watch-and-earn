import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setApiUserId } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginDemo: (uid?: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string; otpCode?: string }>;
  registerUser: (data: { displayName: string; phone: string; password?: string; otpCode?: string; email?: string; referralCodeInput?: string }) => Promise<{ success: boolean; message: string; bonusAdded?: number }>;
  loginUser: (identifier: string, password?: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: { displayName?: string; phone?: string; photoURL?: string }) => Promise<void>;
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
      const u = await api.getProfile();
      setUser(u);
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  const loginDemo = async (uid: string = 'usr_demo_101') => {
    setLoading(true);
    setApiUserId(uid);
    localStorage.setItem('we_user_id', uid);
    try {
      const u = await api.getProfile();
      setUser(u);
    } catch (err) {
      console.error('Login error', err);
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
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'লগইন ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err.message || 'লগইন করতে সমস্যা হচ্ছে।' };
    }
  };

  const updateProfile = async (data: { displayName?: string; phone?: string; photoURL?: string }) => {
    try {
      const updated = await api.updateProfile(data);
      setUser(updated);
    } catch (err) {
      console.error('Update profile error', err);
      throw err;
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
    setUser(null);
  };

  useEffect(() => {
    const savedUid = localStorage.getItem('we_user_id') || 'usr_demo_101';
    loginDemo(savedUid);
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
