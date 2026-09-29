import { AdminSettings, Comment, NotificationItem, Report, RewardTransaction, User, Video, Withdrawal } from '../types';

let currentUserId = 'usr_demo_101';

export const setApiUserId = (uid: string) => {
  currentUserId = uid;
};

const headers = () => ({
  'Content-Type': 'application/json',
  'x-user-id': currentUserId
});

export const api = {
  // Settings
  getSettings: async (): Promise<AdminSettings> => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    return data.settings;
  },

  // Auth / Profile
  getProfile: async (): Promise<User> => {
    const res = await fetch('/api/auth/profile', { headers: headers() });
    const data = await res.json();
    return data.user;
  },

  register: async (payload: { displayName: string; email?: string; phone: string; referralCodeInput?: string }): Promise<{ success: boolean; user?: User; message: string; bonusAdded?: number }> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  login: async (identifier: string): Promise<{ success: boolean; user?: User; message: string }> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    return await res.json();
  },

  updateProfile: async (payload: { displayName?: string; phone?: string; photoURL?: string }): Promise<User> => {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.user;
  },

  switchRole: async (role: 'user' | 'admin'): Promise<User> => {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    return data.user;
  },

  // Videos
  getVideos: async (category?: string, search?: string): Promise<Video[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`/api/videos?${params.toString()}`);
    const data = await res.json();
    return data.videos;
  },

  likeVideo: async (id: string): Promise<number> => {
    const res = await fetch(`/api/videos/${id}/like`, { method: 'POST', headers: headers() });
    const data = await res.json();
    return data.likesCount;
  },

  getComments: async (id: string): Promise<Comment[]> => {
    const res = await fetch(`/api/videos/${id}/comments`);
    const data = await res.json();
    return data.comments;
  },

  addComment: async (id: string, text: string): Promise<Comment> => {
    const res = await fetch(`/api/videos/${id}/comments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.comment;
  },

  reportVideo: async (id: string, reason: string, details: string): Promise<string> => {
    const res = await fetch(`/api/videos/${id}/report`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ reason, details })
    });
    const data = await res.json();
    return data.message;
  },

  // Rewards & Watch-To-Earn Engine
  startWatchSession: async (videoId: string) => {
    const res = await fetch('/api/reward/start-session', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ videoId })
    });
    return await res.json();
  },

  sendHeartbeat: async (sessionId: string, currentTime: number, isPlaying: boolean, isVisible: boolean) => {
    const res = await fetch('/api/reward/heartbeat', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ sessionId, currentTime, isPlaying, isVisible })
    });
    return await res.json();
  },

  claimReward: async (sessionId: string) => {
    const res = await fetch('/api/reward/claim', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ sessionId })
    });
    return await res.json();
  },

  dailyCheckIn: async () => {
    const res = await fetch('/api/reward/daily-checkin', {
      method: 'POST',
      headers: headers()
    });
    return await res.json();
  },

  claimRewardedAd: async (adToken?: string) => {
    const res = await fetch('/api/reward/ad-reward', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ adToken: adToken || 'sponsor_bd_promo' })
    });
    return await res.json();
  },

  claimGameReward: async (gameName: string, coinsEarned: number) => {
    const res = await fetch('/api/reward/game-reward', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ gameName, coinsEarned })
    });
    return await res.json();
  },

  claimTaskReward: async (taskType: string, taskName: string, coinsEarned: number) => {
    const res = await fetch('/api/reward/task-reward', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ taskType, taskName, coinsEarned })
    });
    return await res.json();
  },

  claimMilestone: async (milestoneCount: number) => {
    const res = await fetch('/api/reward/claim-milestone', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ milestoneCount })
    });
    return await res.json();
  },

  claimReferral: async (referralCode: string) => {
    const res = await fetch('/api/reward/referral-claim', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ referralCode })
    });
    return await res.json();
  },

  // Wallet
  getWalletData: async () => {
    const res = await fetch('/api/wallet/transactions', { headers: headers() });
    return await res.json();
  },

  requestWithdrawal: async (payload: { method: 'bKash' | 'Nagad' | 'Recharge'; accountType: 'Personal' | 'Agent' | 'Prepaid' | 'Postpaid'; mobileNumber: string; coins: number }) => {
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await fetch('/api/notifications', { headers: headers() });
    const data = await res.json();
    return data.notifications;
  },

  markNotificationsRead: async () => {
    const res = await fetch('/api/notifications/mark-read', { method: 'POST', headers: headers() });
    return await res.json();
  },

  // Admin
  getAdminOverview: async () => {
    const res = await fetch('/api/admin/overview', { headers: headers() });
    return await res.json();
  },

  getAdminUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/admin/users', { headers: headers() });
    const data = await res.json();
    return data.users;
  },

  adminUserAction: async (uid: string, action: string, coinAdjustment?: number, reason?: string) => {
    const res = await fetch(`/api/admin/users/${uid}/action`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action, coinAdjustment, reason })
    });
    return await res.json();
  },

  getAdminWithdrawals: async (): Promise<Withdrawal[]> => {
    const res = await fetch('/api/admin/withdrawals', { headers: headers() });
    const data = await res.json();
    return data.withdrawals;
  },

  updateWithdrawalStatus: async (id: string, status: 'Approved' | 'Paid' | 'Rejected', trxId?: string, adminNote?: string) => {
    const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ status, trxId, adminNote })
    });
    return await res.json();
  },

  addVideo: async (videoData: Partial<Video>): Promise<Video> => {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(videoData)
    });
    const data = await res.json();
    return data.video;
  },

  toggleVideo: async (id: string): Promise<Video> => {
    const res = await fetch(`/api/admin/videos/${id}/toggle`, {
      method: 'POST',
      headers: headers()
    });
    const data = await res.json();
    return data.video;
  },

  updateSettings: async (settings: Partial<AdminSettings>): Promise<AdminSettings> => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return data.settings;
  },

  getAdminReports: async (): Promise<Report[]> => {
    const res = await fetch('/api/admin/reports', { headers: headers() });
    const data = await res.json();
    return data.reports;
  },

  broadcastAnnouncement: async (title: string, message: string, linkTab: string = 'home'): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ title, message, linkTab })
    });
    return await res.json();
  }
};
