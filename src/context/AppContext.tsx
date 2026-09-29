import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AdminSettings, NotificationItem } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/audio';

export type TabType = 'home' | 'watch' | 'games' | 'tasks' | 'wallet' | 'rewards' | 'profile' | 'admin';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'coin';
  title: string;
  message: string;
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  settings: AdminSettings | null;
  refreshSettings: () => Promise<void>;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toasts: Toast[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'coin') => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
  targetVideoId: string | null;
  setTargetVideoId: (id: string | null) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isMuted, setIsMutedState] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [targetVideoId, setTargetVideoId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const setIsMuted = (muted: boolean) => {
    setIsMutedState(muted);
    soundService.isMuted = muted;
  };

  const refreshSettings = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch (err) {
      console.error('Settings load error', err);
    }
  };

  const refreshNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Notifications load error', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark read error', err);
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'coin' = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);

    // 🔊 Sound & Haptic Vibration Feedback on Toast Notification
    try {
      if (type === 'coin' || type === 'success') {
        soundService.playCoinReward();
      } else if (type === 'error') {
        soundService.playAlarmBeep();
      } else {
        soundService.playLikePop();
      }
    } catch (e) {}

    // 📳 Phone Vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'coin') {
          navigator.vibrate([100, 50, 100]);
        } else if (type === 'error') {
          navigator.vibrate([200, 100, 200]);
        } else {
          navigator.vibrate(80);
        }
      } catch (e) {}
    }

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#22C55E', '#00D4FF', '#EAB308', '#F8FAFC']
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshSettings();
    refreshNotifications();

    // 🔄 Auto Dynamic Polling every 5 seconds to keep data live and self-updating
    const pollTimer = setInterval(() => {
      refreshNotifications();
      refreshSettings();
    }, 5000);

    return () => clearInterval(pollTimer);
  }, []);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        settings,
        refreshSettings,
        notifications,
        unreadNotificationCount,
        refreshNotifications,
        markAllNotificationsRead,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isMuted,
        setIsMuted,
        toasts,
        showToast,
        removeToast,
        triggerConfetti,
        targetVideoId,
        setTargetVideoId,
        selectedCategory,
        setSelectedCategory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
