import { AdminSettings, Comment, NotificationItem, Report, RewardTransaction, User, Video, Withdrawal } from '../types';

let currentUserId = typeof window !== 'undefined' ? localStorage.getItem('we_user_id') || '' : '';

export const setApiUserId = (uid: string) => {
  currentUserId = uid;
};

const headers = () => ({
  'Content-Type': 'application/json',
  'x-user-id': currentUserId
});

// Helper to safely parse JSON and prevent Unexpected token '<' HTML crashes
async function safeJsonFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.warn(`[API] Expected JSON from ${url}, received HTML or text:`, text.slice(0, 100));
      return { success: false, message: `সার্ভার রেসপন্স মেলেনি (${res.status})` } as unknown as T;
    }
    return await res.json();
  } catch (err: any) {
    console.error(`[API Network Error] ${url}:`, err);
    return { success: false, message: 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে।' } as unknown as T;
  }
}

export const api = {
  // Settings
  getSettings: async (): Promise<AdminSettings> => {
    const data = await safeJsonFetch<{ success: boolean; settings: AdminSettings }>('/api/settings');
    return data?.settings || {
      coinToBDTRate: 0.015,
      minWithdrawalCoins: 2000,
      minRechargeBDT: 30,
      minBkashNagadBDT: 100,
      userRevenueSharePercent: 35,
      videoReward: 50,
      minWatchPercentage: 90,
      minWatchSeconds: 12,
      dailyRewardLimit: 1200,
      dailyMaxVideos: 40,
      rewardedAdBonus: 50,
      dailyRewardedAdLimit: 25,
      referralBonus: 50,
      isDemoMode: false,
      adsConfig: {
        feedAdsEnabled: true,
        bannerEnabled: true,
        rewardedAdsEnabled: true,
        interstitialEnabled: true,
        feedAdFrequency: 2
      }
    };
  },

  // Auth / Profile
  getProfile: async (): Promise<User> => {
    const data = await safeJsonFetch<{ success: boolean; user: User }>('/api/auth/profile', { headers: headers() });
    return data?.user;
  },

  sendOtp: async (phone: string): Promise<{ success: boolean; message: string; otpCode?: string; phone?: string }> => {
    return await safeJsonFetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
  },

  register: async (payload: { displayName: string; email?: string; phone: string; password?: string; otpCode?: string; referralCodeInput?: string }): Promise<{ success: boolean; user?: User; message: string; bonusAdded?: number }> => {
    return await safeJsonFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  login: async (identifier: string, password?: string): Promise<{ success: boolean; user?: User; message: string }> => {
    return await safeJsonFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
  },

  updateProfile: async (payload: { displayName?: string; phone?: string; photoURL?: string }): Promise<User> => {
    const data = await safeJsonFetch<{ success: boolean; user: User }>('/api/auth/update-profile', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    return data?.user;
  },

  switchRole: async (role: 'user' | 'admin'): Promise<User> => {
    const data = await safeJsonFetch<{ success: boolean; user: User }>('/api/auth/switch-role', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ role })
    });
    return data?.user;
  },

  // Videos
  getVideos: async (category?: string, search?: string): Promise<Video[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const data = await safeJsonFetch<{ success: boolean; videos: Video[] }>(`/api/videos?${params.toString()}`);
    return data?.videos || [];
  },

  likeVideo: async (id: string): Promise<number> => {
    const data = await safeJsonFetch<{ success: boolean; likesCount: number }>(`/api/videos/${id}/like`, { method: 'POST', headers: headers() });
    return data?.likesCount || 0;
  },

  getComments: async (id: string): Promise<Comment[]> => {
    const data = await safeJsonFetch<{ success: boolean; comments: Comment[] }>(`/api/videos/${id}/comments`);
    return data?.comments || [];
  },

  addComment: async (id: string, text: string): Promise<Comment> => {
    const data = await safeJsonFetch<{ success: boolean; comment: Comment }>(`/api/videos/${id}/comments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ text })
    });
    return data?.comment;
  },

  reportVideo: async (id: string, reason: string, details: string): Promise<string> => {
    const data = await safeJsonFetch<{ success: boolean; message: string }>(`/api/videos/${id}/report`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ reason, details })
    });
    return data?.message || 'রিপোর্ট গৃহীত হয়েছে';
  },

  // Rewards & Watch-To-Earn Engine
  startWatchSession: async (videoId: string) => {
    return await safeJsonFetch('/api/reward/start-session', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ videoId })
    });
  },

  sendHeartbeat: async (sessionId: string, currentTime: number, isPlaying: boolean, isVisible: boolean) => {
    return await safeJsonFetch('/api/reward/heartbeat', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ sessionId, currentTime, isPlaying, isVisible })
    });
  },

  claimReward: async (sessionId: string) => {
    return await safeJsonFetch('/api/reward/claim', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ sessionId })
    });
  },

  dailyCheckIn: async () => {
    return await safeJsonFetch('/api/reward/daily-checkin', {
      method: 'POST',
      headers: headers()
    });
  },

  claimRewardedAd: async (adToken?: string) => {
    return await safeJsonFetch('/api/reward/ad-reward', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ adToken: adToken || 'sponsor_bd_promo' })
    });
  },

  claimAdClick: async () => {
    return await safeJsonFetch<{ success: boolean; earnedCoins?: number; adClicksToday?: number; remainingClicks?: number; message?: string; limitReached?: boolean }>('/api/reward/ad-click', {
      method: 'POST',
      headers: headers()
    });
  },

  claimGameReward: async (gameName: string, coinsEarned: number) => {
    return await safeJsonFetch('/api/reward/game-reward', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ gameName, coinsEarned })
    });
  },

  claimTaskReward: async (taskType: string, taskName: string, coinsEarned: number) => {
    return await safeJsonFetch('/api/reward/task-reward', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ taskType, taskName, coinsEarned })
    });
  },

  claimMilestone: async (milestoneCount: number) => {
    return await safeJsonFetch('/api/reward/claim-milestone', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ milestoneCount })
    });
  },

  claimSpinWheel: async (rewardCoins: number) => {
    return await safeJsonFetch<{ success: boolean; earnedCoins?: number; spinsToday?: number; remainingSpins?: number; newBalance?: number; message?: string; limitReached?: boolean }>('/api/reward/spin-claim', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ rewardCoins })
    });
  },

  getWeeklyLeaderboard: async () => {
    return await safeJsonFetch<{ success: boolean; weeklyPoolBDT: number; resetDaysLeft: number; leaderboard: any[] }>('/api/leaderboard/weekly');
  },

  claimReferral: async (referralCode: string) => {
    return await safeJsonFetch('/api/reward/referral-claim', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ referralCode })
    });
  },

  // Wallet
  getWalletData: async () => {
    return await safeJsonFetch('/api/wallet/transactions', { headers: headers() });
  },

  getPublicPayoutFeed: async () => {
    const data = await safeJsonFetch<{ success: boolean; payouts: any[] }>('/api/withdrawals/public-feed');
    return data?.payouts || [];
  },

  requestWithdrawal: async (payload: { method: 'bKash' | 'Nagad' | 'Recharge'; accountType: 'Personal' | 'Agent' | 'Prepaid' | 'Postpaid'; mobileNumber: string; coins: number }) => {
    return await safeJsonFetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const data = await safeJsonFetch<{ success: boolean; notifications: NotificationItem[] }>('/api/notifications', { headers: headers() });
    return data?.notifications || [];
  },

  markNotificationsRead: async () => {
    return await safeJsonFetch('/api/notifications/mark-read', { method: 'POST', headers: headers() });
  },

  // Admin
  getAdminOverview: async () => {
    return await safeJsonFetch('/api/admin/overview', { headers: headers() });
  },

  getAdminUsers: async (): Promise<User[]> => {
    const data = await safeJsonFetch<{ success: boolean; users: User[] }>('/api/admin/users', { headers: headers() });
    return data?.users || [];
  },

  adminUserAction: async (uid: string, action: string, coinAdjustment?: number, reason?: string) => {
    return await safeJsonFetch(`/api/admin/users/${uid}/action`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action, coinAdjustment, reason })
    });
  },

  getAdminWithdrawals: async (): Promise<Withdrawal[]> => {
    const data = await safeJsonFetch<{ success: boolean; withdrawals: Withdrawal[] }>('/api/admin/withdrawals', { headers: headers() });
    return data?.withdrawals || [];
  },

  updateWithdrawalStatus: async (id: string, status: 'Approved' | 'Paid' | 'Rejected', trxId?: string, adminNote?: string) => {
    return await safeJsonFetch(`/api/admin/withdrawals/${id}/status`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ status, trxId, adminNote })
    });
  },

  addVideo: async (videoData: Partial<Video>): Promise<Video> => {
    const data = await safeJsonFetch<{ success: boolean; video: Video }>('/api/admin/videos', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(videoData)
    });
    return data?.video;
  },

  toggleVideo: async (id: string): Promise<Video> => {
    const data = await safeJsonFetch<{ success: boolean; video: Video }>(`/api/admin/videos/${id}/toggle`, {
      method: 'POST',
      headers: headers()
    });
    return data?.video;
  },

  updateSettings: async (settings: Partial<AdminSettings>): Promise<AdminSettings> => {
    const data = await safeJsonFetch<{ success: boolean; settings: AdminSettings }>('/api/admin/settings', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(settings)
    });
    return data?.settings;
  },

  getAdminReports: async (): Promise<Report[]> => {
    const data = await safeJsonFetch<{ success: boolean; reports: Report[] }>('/api/admin/reports', { headers: headers() });
    return data?.reports || [];
  },

  broadcastAnnouncement: async (title: string, message: string, linkTab: string = 'home'): Promise<{ success: boolean; message: string }> => {
    return await safeJsonFetch('/api/admin/broadcast', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ title, message, linkTab })
    });
  }
};
