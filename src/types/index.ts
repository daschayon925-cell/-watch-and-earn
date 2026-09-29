export type ContentLicense = 'owned' | 'licensed' | 'creator_permission' | 'official_embed';
export type CopyrightStatus = 'verified' | 'pending' | 'reported';
export type VideoCategory = 'entertainment' | 'food' | 'travel' | 'tech' | 'comedy' | 'music' | 'culture' | 'tiktok' | 'cartoon' | 'news' | 'natok' | 'sports' | 'dance' | 'shorts';

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  category: VideoCategory;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  creatorVerified: boolean;
  rewardCoins: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  contentLicense: ContentLicense;
  licenseAttribution: string;
  copyrightStatus: CopyrightStatus;
  isActive: boolean;
  createdAt: string;
  tags: string[];
}

export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'flagged' | 'suspended';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  password?: string;
  phoneVerified?: boolean;
  photoURL: string;
  coins: number;
  pendingWithdrawalCoins: number;
  lifetimeCoins: number;
  todayCoins: number;
  todayVideosCount: number;
  streakDays: number;
  lastCheckInDate: string;
  role: UserRole;
  accountStatus: AccountStatus;
  riskScore: number; // 0 (safe) to 100 (high risk)
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 
  | 'WATCH_REWARD' 
  | 'AD_REWARD' 
  | 'DAILY_BONUS' 
  | 'MILESTONE_REWARD' 
  | 'REFERRAL_BONUS' 
  | 'GAME_REWARD'
  | 'TASK_REWARD'
  | 'WITHDRAWAL' 
  | 'ADMIN_ADJUSTMENT';

export interface RewardTransaction {
  transactionId: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive or negative
  bdtEquivalent: number;
  source: string;
  videoId?: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  note?: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Recharge';
export type AccountType = 'Personal' | 'Agent' | 'Prepaid' | 'Postpaid';
export type WithdrawalStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';

export interface Withdrawal {
  withdrawalId: string;
  userId: string;
  userName: string;
  method: PaymentMethod;
  accountType: AccountType;
  mobileNumber: string;
  coins: number;
  bdtAmount: number;
  status: WithdrawalStatus;
  trxId?: string;
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface AdminSettings {
  coinToBDTRate: number; // 0.015 (1000 coins = 15 BDT)
  minWithdrawalCoins: number; // default min coins
  minRechargeBDT: number; // 30 BDT (2000 coins)
  minBkashNagadBDT: number; // 100 BDT (6667 coins)
  userRevenueSharePercent: number; // 40% revenue share to users
  videoReward: number; // e.g. 25
  minWatchPercentage: number; // e.g. 90%
  minWatchSeconds: number; // e.g. 8s
  dailyRewardLimit: number; // e.g. 500 coins
  dailyMaxVideos: number; // e.g. 50
  rewardedAdBonus: number; // e.g. 30
  dailyRewardedAdLimit: number; // e.g. 10
  referralBonus: number; // e.g. 50
  isDemoMode: boolean;
  adsConfig: {
    feedAdsEnabled: boolean;
    bannerEnabled: boolean;
    rewardedAdsEnabled: boolean;
    interstitialEnabled: boolean;
    feedAdFrequency: number; // Show ad every N videos
    adPublisherId?: string;
    adSlotBanner?: string;
    adSlotRewarded?: string;
    adsterraDirectLink?: string; // Adsterra Smartlink / Direct Link URL
    adsterraBannerCode?: string; // Adsterra Banner Script / iFrame code
    adsterraPopunderCode?: string; // Adsterra Popunder Script
  };
  activeNotice?: {
    enabled: boolean;
    title: string;
    message: string;
    type?: string;
    updatedAt?: string;
  };
  adminSecurity?: {
    adminName: string;
    adminPhone: string;
    adminPin: string;
  };
}

export interface Report {
  id: string;
  videoId: string;
  userId: string;
  userEmail: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'action_taken';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reward' | 'withdrawal' | 'system' | 'streak';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likesCount: number;
  createdAt: string;
}
