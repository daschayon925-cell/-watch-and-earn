import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Database for Fast, Rich State and Verification Engine
interface WatchSessionData {
  sessionId: string;
  userId: string;
  videoId: string;
  startedAt: number;
  lastHeartbeatAt: number;
  watchedSeconds: number;
  duration: number;
  completed: boolean;
  claimed: boolean;
  ip: string;
}

const db: {
  settings: any;
  users: any[];
  videos: any[];
  transactions: any[];
  withdrawals: any[];
  reports: any[];
  notifications: any[];
  comments: any[];
} = {
  settings: {
    coinToBDTRate: 0.015, // ১০০০ কয়েন = ১৫ টাকা (১ কয়েন = ০.০১৫ টাকা) - ইউজারের জন্য অত্যন্ত আকর্ষণীয়
    minWithdrawalCoins: 2000, // ২০০০ কয়েন = ৩০ টাকা রিচার্জ
    minRechargeBDT: 30, // সর্বনিম্ন ৩০ টাকা মোবাইল রিচার্জ
    minBkashNagadBDT: 100, // সর্বনিম্ন ১০০ টাকা বিকাশ/নগদ (৬৬৬৭ কয়েন)
    userRevenueSharePercent: 35, // ৬৫% মালিকের নিট প্রফিট
    videoReward: 50, // ভিডিও ওয়াচ রিওয়ার্ড ৫০ কয়েন
    minWatchPercentage: 90,
    minWatchSeconds: 12,
    dailyRewardLimit: 1200, // দৈনিক সর্বোচ্চ রিওয়ার্ড ক্যাপ
    dailyMaxVideos: 40,
    rewardedAdBonus: 50, // ৫০ সেকেন্ড স্পনসর মাল্টি-অ্যাড দেখা (+৫০ কয়েন)
    dailyRewardedAdLimit: 25,
    referralBonus: 50, // রেফারেল বোনাস ৫০ কয়েন
    isDemoMode: false,
    adsConfig: {
      feedAdsEnabled: true,
      bannerEnabled: true,
      rewardedAdsEnabled: true,
      interstitialEnabled: true,
      feedAdFrequency: 2, // প্রতি ২টি ভিডিও অন্তর অ্যাড
      adPublisherId: 'ca-pub-9842103859218491',
      adSlotBanner: '1092837465',
      adSlotRewarded: '5647382910'
    },
    activeNotice: {
      enabled: true,
      title: 'বিজ্ঞাপন দেখে আয় করুন প্রতিদিন! 🇧🇩',
      message: 'নিয়মিত ভিডিও দেখুন, কয়েন জমান এবং সরাসরি বিকাশ, নগদ ও মোবাইল রিচার্জে ক্যাশআউট করুন।',
      type: 'info',
      updatedAt: new Date().toISOString()
    }
  },
  users: [
    {
      uid: 'usr_demo_101',
      displayName: 'তানভীর আহমেদ (Tanvir)',
      email: 'daschayon925@gmail.com', // Logged in user email
      phone: '01712345678',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coins: 450,
      pendingWithdrawalCoins: 0,
      lifetimeCoins: 1250,
      todayCoins: 75,
      todayVideosCount: 3,
      streakDays: 4,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      role: 'admin', // Admin access for app owner
      accountStatus: 'active',
      riskScore: 5,
      referralCode: 'BD7788',
      referredBy: undefined,
      referralCount: 6,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uid: 'usr_demo_102',
      displayName: 'সাদিয়া ইসলাম',
      email: 'sadia.bd@example.com',
      phone: '01898765432',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      coins: 1200,
      pendingWithdrawalCoins: 1000,
      lifetimeCoins: 2200,
      todayCoins: 50,
      todayVideosCount: 2,
      streakDays: 6,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      role: 'user',
      accountStatus: 'active',
      riskScore: 12,
      referralCode: 'BD9921',
      referredBy: 'BD7788',
      referralCount: 2,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  videos: [
    {
      id: 'vid_cartoon_01',
      title: 'জনপ্রিয় মীনা কার্টুন পর্ব ও ফানি মুহূর্ত 👶 Meena Cartoon Bangla',
      description: 'ছোটবেলার সবচেয়ে প্রিয় মীনা কার্টুনের চমৎকার শিক্ষণীয় ও হাসির মুহূর্ত! #MeenaCartoon #BanglaCartoon #Kids #Animation',
      videoUrl: 'https://assets.mixkit.co/videos/52089/52089-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      duration: 20,
      category: 'cartoon',
      creatorName: 'কার্টুন ওয়ার্ল্ড বিডি (Cartoon World)',
      creatorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@cartoon_world_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 94200,
      commentsCount: 5210,
      sharesCount: 18400,
      savesCount: 8900,
      contentLicense: 'official_embed',
      licenseAttribution: 'Official Cartoon Animation Shorts',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date().toISOString(),
      tags: ['Cartoon', 'Animation', 'Meena', 'Kids']
    },
    {
      id: 'vid_cartoon_02',
      title: 'টম এন্ড জেরি ক্লাসিক ফানি হাসির দৃশ্য 🐱🐭 Tom & Jerry Comedy Clip',
      description: 'টম আর জেরির হাসির দৌড়ঝাঁপ ও দুষ্টুমি! মন ভালো করার সেরা দৃশ্য। #TomAndJerry #Cartoon #Comedy #Shorts',
      videoUrl: 'https://assets.mixkit.co/videos/52028/52028-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      duration: 18,
      category: 'cartoon',
      creatorName: 'টুনস কমেডি জোন (Toons Comedy)',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@toons_comedy',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 142000,
      commentsCount: 8400,
      sharesCount: 35100,
      savesCount: 16500,
      contentLicense: 'official_embed',
      licenseAttribution: 'Classic Animation Shorts',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      tags: ['Cartoon', 'Animation', 'TomAndJerry', 'Comedy']
    },
    {
      id: 'vid_music_01',
      title: 'ভাইরাল ট্রেন্ডিং বাংলা গান ও মধুর সুর 🎵 Coke Studio & Viral Bangla Music',
      description: 'অসাধারণ মিউজিক সুর ও সেরা বাংলা গানের মুহূর্ত! হেডফোনে শুনুন। #BanglaSong #Music #CokeStudio #Trending',
      videoUrl: 'https://assets.mixkit.co/videos/42828/42828-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: 25,
      category: 'music',
      creatorName: 'সুর ও মিউজিক বাংলা (Sangeet BD)',
      creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@sangeet_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 88700,
      commentsCount: 4320,
      sharesCount: 22100,
      savesCount: 12400,
      contentLicense: 'official_embed',
      licenseAttribution: 'Official Music Shorts',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      tags: ['Music', 'Song', 'BanglaSong', 'Viral']
    },
    {
      id: 'vid_music_02',
      title: 'জনপ্রিয় রোমান্টিক বাংলা গানের সেরা লিরিক্স ও সুর 🎶 Romantic Bangla Beats',
      description: 'হৃদয় ছোঁয়া বাংলা গানের মিষ্টি সুর! দেখুন ও কয়েন আয় করুন। #Music #BanglaGaan #Romance #Shorts',
      videoUrl: 'https://assets.mixkit.co/videos/51950/51950-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      duration: 20,
      category: 'music',
      creatorName: 'গান বাংলা ক্লাব (Gaan Bangla)',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@gaan_bangla_club',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 65100,
      commentsCount: 3100,
      sharesCount: 14200,
      savesCount: 7800,
      contentLicense: 'official_embed',
      licenseAttribution: 'Melody Tunes Network',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      tags: ['Music', 'Gaan', 'Audio', 'Shorts']
    },
    {
      id: 'vid_news_01',
      title: 'তাজা সংবাদ বুলেটিন ও আজকের শীর্ষ খবর 📰 Somoy News & Top Headlines',
      description: 'দেশ ও বিদেশের আজকের সবচেয়ে গুরুত্বপূর্ণ ও ব্রেকিং সংবাদের হাইলাইটস! #News #SomoyNews #Bangladesh #Headlines',
      videoUrl: 'https://assets.mixkit.co/videos/52033/52033-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
      duration: 25,
      category: 'news',
      creatorName: 'সময় ও খবর লাইভ (Daily News BD)',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@daily_news_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 41200,
      commentsCount: 2980,
      sharesCount: 10400,
      savesCount: 4500,
      contentLicense: 'official_embed',
      licenseAttribution: 'Verified News Broadcast',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      tags: ['News', 'Khabar', 'Headlines', 'Bangladesh']
    },
    {
      id: 'vid_shorts_01',
      title: 'ইউটিউব ভাইরাল ম্যাজিক ও সাইন্স ট্রিকস ⚡ Amazing Science & Life Hacks',
      description: 'অবিশ্বাস্য ও মজার সায়েন্স ট্রিকস যা দেখলে আপনি চমকে যাবেন! #Shorts #LifeHacks #Magic #Viral',
      videoUrl: 'https://assets.mixkit.co/videos/52028/52028-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      duration: 18,
      category: 'shorts',
      creatorName: 'ফ্যাক্টস ও শর্টস বিডি (Facts BD)',
      creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@facts_shorts_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 189000,
      commentsCount: 12400,
      sharesCount: 45000,
      savesCount: 22000,
      contentLicense: 'official_embed',
      licenseAttribution: 'Popular Shorts Stream',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date().toISOString(),
      tags: ['Shorts', 'Viral', 'Facts', 'YouTube']
    },
    {
      id: 'vid_natok_01',
      title: 'মোশাররফ করিমের হাসির নাটক ক্লিপ 😂 Bangla Comedy Natok Scene',
      description: 'চরম হাসির ডায়লগ ও কমেডি সিন! দেখুন আর বন্ধুদের সাথে শেয়ার করুন। #Natok #BanglaComedy #MosharrafKarim',
      videoUrl: 'https://assets.mixkit.co/videos/49258/49258-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      duration: 15,
      category: 'natok',
      creatorName: 'বাংলা নাটক এক্সপ্রেস (Natok Express)',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@natok_express_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 38400,
      commentsCount: 2450,
      sharesCount: 8900,
      savesCount: 3410,
      contentLicense: 'official_embed',
      licenseAttribution: 'Official YouTube Shorts Natok Highlights',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date().toISOString(),
      tags: ['Natok', 'Comedy', 'Bangla', 'Shorts']
    },
    {
      id: 'vid_sports_01',
      title: 'বাংলাদেশ ক্রিকেটের সেরা রোমাঞ্চকর ছক্কা ও ম্যাচ উইনিং মুহূর্ত! 🏏 Tigers Victory',
      description: 'শেষ ওভারে রুদ্ধশ্বাস ছক্কা ও জয়ের উল্লাস! টাইগারদের গর্জন। #Cricket #Bangladesh #Tigers #Shorts',
      videoUrl: 'https://assets.mixkit.co/videos/42828/42828-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
      duration: 16,
      category: 'sports',
      creatorName: 'ক্রিকেট ও স্পোর্টস লাইভ (Tigers 71)',
      creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@tigers_sports_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 54200,
      commentsCount: 4120,
      sharesCount: 12400,
      savesCount: 5120,
      contentLicense: 'official_embed',
      licenseAttribution: 'Sports Highlights & Shorts Feed',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      tags: ['Cricket', 'Sports', 'Khela', 'Bangladesh']
    },
    {
      id: 'vid_dance_01',
      title: 'ট্রেন্ডিং বাংলা ও ভাইরাল গানের নাচ 💃 Trending Bangla Dance Reel',
      description: 'ভাইরাল ট্রেন্ডিং মিউজিক বীটে চমৎকার ড্যান্স পারফর্মেন্স! #Dance #Nach #Trending #Viral',
      videoUrl: 'https://assets.mixkit.co/videos/52089/52089-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop&q=80',
      duration: 18,
      category: 'dance',
      creatorName: 'ড্যান্স স্টার বিডি (Dance Star)',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@dancestar_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 42100,
      commentsCount: 3180,
      sharesCount: 9700,
      savesCount: 4100,
      contentLicense: 'official_embed',
      licenseAttribution: 'Viral Dance Creators Network',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      tags: ['Dance', 'Nach', 'Music', 'Trending']
    },
    {
      id: 'vid_tiktok_01',
      title: 'টিকটক ভাইরাল ট্রেন্ডিং ভিডিও ও ফানি মুহূর্ত 🔥 TikTok Official BD',
      description: 'সরাসরি টিকটকের সেরা ট্রেন্ডিং রিল ও ফানি ভিডিও! দেখুন ও কয়েন জিতুন। #TikTok #Viral #Trending #Reels',
      videoUrl: 'https://assets.mixkit.co/videos/52089/52089-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      duration: 15,
      category: 'tiktok',
      creatorName: 'টিকটক বাংলাদেশ (TikTok Official BD)',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@tiktok_official_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 125400,
      commentsCount: 9420,
      sharesCount: 31200,
      savesCount: 14200,
      contentLicense: 'official_embed',
      licenseAttribution: 'Official Direct Stream Video',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date().toISOString(),
      tags: ['TikTok', 'Viral', 'Trending', 'Reels']
    },
    {
      id: 'vid_natok_02',
      title: 'জনপ্রিয় নাটকের সেরা রোমান্টিক ও আবেগী দৃশ্য 🎭 Romantic Natok Scene',
      description: 'মন ছুঁয়ে যাওয়া একটি সুন্দর দৃশ্য ও ডায়লগ। শেয়ার করুন সবার সাথে। #Natok #Drama #BanglaDrama',
      videoUrl: 'https://assets.mixkit.co/videos/49258/49258-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
      duration: 15,
      category: 'natok',
      creatorName: 'নাটক ড্রামা জোন (Drama Zone)',
      creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@dramazone_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 29500,
      commentsCount: 1890,
      sharesCount: 6200,
      savesCount: 3100,
      contentLicense: 'creator_permission',
      licenseAttribution: 'Entertainment Guild Certified Drama Clip',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      tags: ['Natok', 'Drama', 'Bangla', 'Emotional']
    },
    {
      id: 'vid_sports_02',
      title: 'মেসি ও রোনালদোর অবিশ্বাস্য জাদুকরী গোল ও স্কিল ⚽ Football Magic Skills',
      description: 'মাঠে অসাধারণ ড্রিবলিং ও গোল! ফুটবল প্রেমিরা লাইক দিন। #Football #Messi #Ronaldo #Khela',
      videoUrl: 'https://assets.mixkit.co/videos/42828/42828-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80',
      duration: 16,
      category: 'sports',
      creatorName: 'ফুটবল উন্মাদনা (Football Mania)',
      creatorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@football_khela_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 88100,
      commentsCount: 6700,
      sharesCount: 21300,
      savesCount: 9400,
      contentLicense: 'creator_permission',
      licenseAttribution: 'Sports Fan Guild Global Stream',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 18000000).toISOString(),
      tags: ['Football', 'Khela', 'Sports', 'Skills']
    },
    {
      id: 'vid_dance_02',
      title: 'স্ট্রিট ড্যান্স ও হিপহপ ফায়ার স্টাইল 🔥 Viral HipHop Dance Beats',
      description: 'অবিশ্বাস্য ব্রেকড্যান্স ও এনার্জেটিক মুভস! পুরো ভিডিও দেখে কয়েন নিন। #StreetDance #Dance #Viral',
      videoUrl: 'https://assets.mixkit.co/videos/52089/52089-720.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      duration: 14,
      category: 'dance',
      creatorName: 'হিপহপ বিডি (HipHop Beats BD)',
      creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      creatorHandle: '@hiphop_beats_bd',
      creatorVerified: true,
      rewardCoins: 25,
      likesCount: 35400,
      commentsCount: 2120,
      sharesCount: 8400,
      savesCount: 3750,
      contentLicense: 'licensed',
      licenseAttribution: 'Licensed Street Art Performance',
      copyrightStatus: 'verified',
      isActive: true,
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      tags: ['Dance', 'HipHop', 'Nach', 'Viral']
    }
  ],
  transactions: [
    {
      transactionId: 'trx_init_01',
      userId: 'usr_demo_101',
      type: 'DAILY_BONUS',
      amount: 25,
      bdtEquivalent: 0.25,
      source: 'Day 4 Streak Check-In',
      status: 'COMPLETED',
      note: 'Bonus',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      transactionId: 'trx_init_02',
      userId: 'usr_demo_101',
      type: 'WATCH_REWARD',
      amount: 25,
      bdtEquivalent: 0.25,
      source: 'ভিডিও দেখেছেন: মেঘের রাজ্য সাজেক ভ্যালি',
      videoId: 'vid_bd_01',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
    },
    {
      transactionId: 'trx_init_03',
      userId: 'usr_demo_101',
      type: 'WATCH_REWARD',
      amount: 25,
      bdtEquivalent: 0.25,
      source: 'ভিডিও দেখেছেন: পুরান ঢাকার শাহী বিরিয়ানি',
      videoId: 'vid_bd_02',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ],
  withdrawals: [
    {
      withdrawalId: 'wth_demo_882',
      userId: 'usr_demo_102',
      userName: 'সাদিয়া ইসলাম',
      method: 'bKash',
      accountType: 'Personal',
      mobileNumber: '01898765432',
      coins: 1000,
      bdtAmount: 10.00,
      status: 'Pending',
      requestedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      adminNote: 'Processing through bKash disbursement portal'
    },
    {
      withdrawalId: 'wth_demo_881',
      userId: 'usr_demo_101',
      userName: 'তানভীর আহমেদ',
      method: 'Nagad',
      accountType: 'Personal',
      mobileNumber: '01712345678',
      coins: 1000,
      bdtAmount: 10.00,
      status: 'Paid',
      trxId: 'NAG78239011BD',
      requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      processedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      adminNote: 'Disbursed successfully'
    }
  ],
  reports: [
    {
      id: 'rep_01',
      videoId: 'vid_bd_05',
      userId: 'usr_demo_102',
      userEmail: 'sadia.bd@example.com',
      reason: 'Audio attribution check',
      details: 'Please ensure comedy background track author attribution is updated.',
      status: 'reviewed',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_01',
      userId: 'usr_demo_101',
      title: 'কয়েন যুক্ত হয়েছে! 🪙',
      message: 'ভিডিও দেখে আপনি ২৫ কয়েন অর্জন করেছেন। চালিয়ে যান!',
      type: 'reward',
      read: false,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      linkTab: 'wallet'
    },
    {
      id: 'notif_02',
      userId: 'usr_demo_101',
      title: 'নগদ ক্যাশআউট সফল 🇧🇩',
      message: 'আপনার ১০০০ কয়েন (৳১০.০০) নগদ অ্যাকাউন্টে সফলভাবে পরিশোধ করা হয়েছে। TrxID: NAG78239011BD',
      type: 'withdrawal',
      read: true,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      linkTab: 'wallet'
    }
  ],
  comments: [
    {
      id: 'cmt_01',
      videoId: 'vid_bd_01',
      userId: 'usr_demo_102',
      userName: 'সাদিয়া ইসলাম',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'সাজেক ভ্যালির দৃশ্য অসাধারণ! এই শীতে অবশ্যই যাবো ইনশাআল্লাহ। ❤️',
      likesCount: 18,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'cmt_02',
      videoId: 'vid_bd_02',
      userId: 'usr_demo_101',
      userName: 'তানভীর আহমেদ',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'পুরান ঢাকার বিরিয়ানির সাথে অন্য কিছুর তুলনা চলে না! দারুণ ভিডিও 😋',
      likesCount: 9,
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
    }
  ]
};

// Active watch sessions to prevent fraud / time manipulation
const activeSessions: Map<string, WatchSessionData> = new Map();

// Helper to get current active user
function getUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  const uid = req.headers['x-user-id'] as string || 'usr_demo_101';
  let user = db.users.find(u => u.uid === uid);
  if (!user) {
    user = db.users[0];
  }
  return user;
}

// ---------------- API ENDPOINTS ---------------- //

// 1. App Configuration & Settings
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    settings: db.settings
  });
});

// 2. User Profile & Auth
app.get('/api/auth/profile', (req, res) => {
  const user = getUser(req);
  res.json({
    success: true,
    user
  });
});

// Register New Account with Referral bonus (New user gets 50 coins, Referrer gets 25 coins)
app.post('/api/auth/register', (req, res) => {
  const { displayName, email, phone, referralCodeInput } = req.body;
  if (!displayName || !displayName.trim()) {
    return res.status(400).json({ success: false, message: 'আপনার পূর্ণ নাম প্রদান করুন।' });
  }

  const cleanPhone = (phone || '').replace(/\s+/g, '');
  if (cleanPhone && !/^01[3-9]\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ success: false, message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' });
  }

  // Check if phone or email already registered
  if (cleanPhone && db.users.some(u => u.phone === cleanPhone)) {
    return res.status(400).json({ success: false, message: 'এই ফোন নম্বরটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।' });
  }

  const newUid = 'usr_' + Date.now();
  const myRefCode = 'BD' + Math.floor(1000 + Math.random() * 9000);

  let initialCoins = 100; // Standard welcome bonus
  let referrerUser: any = null;

  // Check if user entered someone's referral code
  if (referralCodeInput && referralCodeInput.trim()) {
    const code = referralCodeInput.trim().toUpperCase();
    referrerUser = db.users.find(u => u.referralCode.toUpperCase() === code);
    if (referrerUser) {
      // New user gets +50 referral welcome coins
      initialCoins += 50;
      
      // Referrer gets +25 coins immediately
      const referrerBonus = 25;
      referrerUser.coins += referrerBonus;
      referrerUser.lifetimeCoins += referrerBonus;
      referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
      referrerUser.updatedAt = new Date().toISOString();

      // Record transaction for referrer
      db.transactions.unshift({
        transactionId: 'trx_ref_' + Date.now(),
        userId: referrerUser.uid,
        type: 'REFERRAL_BONUS',
        amount: referrerBonus,
        bdtEquivalent: referrerBonus * db.settings.coinToBDTRate,
        source: `নতুন ফ্রেন্ড রেফারেল বোনাস (+২৫ কয়েন) - ${displayName}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      });

      // Notify referrer
      db.notifications.unshift({
        id: 'notif_ref_' + Date.now(),
        userId: referrerUser.uid,
        title: 'নতুন রেফারেল বোনাস! 🎁',
        message: `${displayName} আপনার রেফারেল কোড ব্যবহার করেছে। আপনি ২৫ কয়েন পেয়েছেন এবং ভবিষ্যতে তার প্রতিটি উইথড্র থেকে ১% আজীবন কমিশন পাবেন!`,
        type: 'reward',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'wallet'
      });
    }
  }

  const newUser: any = {
    uid: newUid,
    displayName: displayName.trim(),
    email: email ? email.trim() : `${newUid}@watchandearn.bd`,
    phone: cleanPhone || '017' + Math.floor(10000000 + Math.random() * 90000000),
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coins: initialCoins,
    pendingWithdrawalCoins: 0,
    lifetimeCoins: initialCoins,
    todayCoins: initialCoins,
    todayVideosCount: 0,
    streakDays: 1,
    lastCheckInDate: new Date().toISOString().split('T')[0],
    role: 'user',
    accountStatus: 'active',
    riskScore: 0,
    referralCode: myRefCode,
    referredBy: referrerUser ? referrerUser.referralCode : undefined,
    referralCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.unshift(newUser);

  // Welcome transaction
  db.transactions.unshift({
    transactionId: 'trx_wel_' + Date.now(),
    userId: newUser.uid,
    type: 'WELCOME_BONUS',
    amount: initialCoins,
    bdtEquivalent: initialCoins * db.settings.coinToBDTRate,
    source: referrerUser 
      ? `রেজিস্ট্রেশন (+১০০) ও রেফারেল ওয়েলকাম বোনাস (+৫০ কয়েন)` 
      : 'নতুন অ্যাকাউন্ট ওয়েলকাম বোনাস',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  // Welcome notification
  db.notifications.unshift({
    id: 'notif_wel_' + Date.now(),
    userId: newUser.uid,
    title: 'ওয়াচ অ্যান্ড আর্ন বিডিতে স্বাগতম! 🇧🇩',
    message: referrerUser 
      ? `আপনার অ্যাকাউন্টে ১০০ কয়েন সাইনআপ এবং ৫০ কয়েন রেফারেল বোনাস মোট ১৫০ কয়েন যুক্ত হয়েছে!` 
      : `আপনার অ্যাকাউন্টে ১০০ কয়েন সাইনআপ বোনাস যুক্ত হয়েছে! ভিডিও দেখে আয় শুরু করুন।`,
    type: 'reward',
    read: false,
    createdAt: new Date().toISOString(),
    linkTab: 'home'
  });

  res.json({
    success: true,
    user: newUser,
    bonusAdded: referrerUser ? 50 : 0,
    message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!'
  });
});

// Login Account by Phone/UID
app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body;
  if (!identifier || !identifier.trim()) {
    return res.status(400).json({ success: false, message: 'আপনার মোবাইল নম্বর বা ইউজার আইডি দিন।' });
  }

  const clean = identifier.trim();
  const user = db.users.find(u => 
    u.uid === clean || 
    (u.phone && u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')) || 
    (u.email && u.email.toLowerCase() === clean.toLowerCase())
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'এই নম্বর বা আইডিতে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। দয়া করে নতুন অ্যাকাউন্ট তৈরি করুন।' });
  }

  res.json({
    success: true,
    user,
    message: 'লগইন সফল হয়েছে!'
  });
});

// Switch role / profile for demo / testing
app.post('/api/auth/switch-role', (req, res) => {
  const user = getUser(req);
  const { role } = req.body;
  if (role === 'admin' || role === 'user') {
    user.role = role;
    res.json({ success: true, user });
  } else {
    res.status(400).json({ success: false, message: 'Invalid role' });
  }
});

// Update Profile
app.post('/api/auth/update-profile', (req, res) => {
  const user = getUser(req);
  const { displayName, phone, photoURL } = req.body;
  if (displayName) user.displayName = displayName;
  if (phone) user.phone = phone;
  if (photoURL) user.photoURL = photoURL;
  user.updatedAt = new Date().toISOString();
  res.json({ success: true, user });
});

// 3. Videos Feed
app.get('/api/videos', (req, res) => {
  const { category, search } = req.query;
  let list = db.videos.filter(v => v.isActive);
  if (category && category !== 'all') {
    list = list.filter(v => v.category === category);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(v => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
  }
  res.json({ success: true, videos: list });
});

// Like video
app.post('/api/videos/:id/like', (req, res) => {
  const { id } = req.params;
  const video = db.videos.find(v => v.id === id);
  if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
  video.likesCount += 1;
  res.json({ success: true, likesCount: video.likesCount });
});

// Get comments
app.get('/api/videos/:id/comments', (req, res) => {
  const { id } = req.params;
  const list = db.comments.filter(c => c.videoId === id);
  res.json({ success: true, comments: list });
});

// Post comment
app.post('/api/videos/:id/comments', (req, res) => {
  const { id } = req.params;
  const user = getUser(req);
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }
  const comment = {
    id: 'cmt_' + Date.now(),
    videoId: id,
    userId: user.uid,
    userName: user.displayName,
    userAvatar: user.photoURL,
    text: text.trim(),
    likesCount: 0,
    createdAt: new Date().toISOString()
  };
  db.comments.unshift(comment);
  const video = db.videos.find(v => v.id === id);
  if (video) video.commentsCount += 1;
  res.json({ success: true, comment });
});

// Report video
app.post('/api/videos/:id/report', (req, res) => {
  const { id } = req.params;
  const user = getUser(req);
  const { reason, details } = req.body;
  const report = {
    id: 'rep_' + Date.now(),
    videoId: id,
    userId: user.uid,
    userEmail: user.email,
    reason: reason || 'Copyright or Inappropriate content',
    details: details || '',
    status: 'pending' as const,
    createdAt: new Date().toISOString()
  };
  db.reports.unshift(report);
  res.json({ success: true, message: 'অভিযোগ জমা নেওয়া হয়েছে। অ্যাডমিন টিম দ্রুত যাচাই করবে।' });
});

// 4. WATCH-TO-EARN SECURE VERIFICATION ENGINE
// Step 1: Start watch session
app.post('/api/reward/start-session', (req, res) => {
  const user = getUser(req);
  const { videoId } = req.body;

  if (user.accountStatus === 'suspended') {
    return res.status(403).json({ success: false, message: 'অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে।' });
  }

  const video = db.videos.find(v => v.id === videoId);
  if (!video) {
    return res.status(404).json({ success: false, message: 'ভিডিও পাওয়া যায়নি' });
  }

  // Daily limit check
  if (user.todayCoins >= db.settings.dailyRewardLimit) {
    return res.json({
      success: true,
      eligible: false,
      message: 'আজকের দৈনিক কয়েন সীমা (' + db.settings.dailyRewardLimit + ' কয়েন) পূর্ণ হয়েছে।'
    });
  }

  if (user.todayVideosCount >= db.settings.dailyMaxVideos) {
    return res.json({
      success: true,
      eligible: false,
      message: 'আজকের সর্বাধিক ভিডিও দেখার সীমা শেষ হয়েছে।'
    });
  }

  const sessionId = 'ses_' + crypto.randomBytes(8).toString('hex');
  const session: WatchSessionData = {
    sessionId,
    userId: user.uid,
    videoId,
    startedAt: Date.now(),
    lastHeartbeatAt: Date.now(),
    watchedSeconds: 0,
    duration: video.duration || 15,
    completed: false,
    claimed: false,
    ip: req.ip || '127.0.0.1'
  };

  activeSessions.set(sessionId, session);

  // Clean old sessions
  if (activeSessions.size > 500) {
    const cutoff = Date.now() - 3600000;
    for (const [sId, s] of activeSessions.entries()) {
      if (s.startedAt < cutoff) activeSessions.delete(sId);
    }
  }

  res.json({
    success: true,
    eligible: true,
    sessionId,
    requiredWatchPercentage: db.settings.minWatchPercentage,
    requiredSeconds: Math.ceil(video.duration * (db.settings.minWatchPercentage / 100)),
    rewardCoins: video.rewardCoins || db.settings.videoReward
  });
});

// Step 2: Heartbeat validation during playback
app.post('/api/reward/heartbeat', (req, res) => {
  const { sessionId, currentTime, isPlaying, isVisible } = req.body;
  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ success: false, message: 'Invalid or expired session' });
  }

  const now = Date.now();
  const timeDelta = (now - session.lastHeartbeatAt) / 1000;

  // If user claims watched time faster than physics allows (e.g. script injection)
  if (isPlaying && isVisible) {
    // Only credit reasonable real-time elapsed (capped at 3s per heartbeat to prevent spoofing)
    const validDelta = Math.min(Math.max(timeDelta, 0), 3.0);
    session.watchedSeconds += validDelta;
  }

  session.lastHeartbeatAt = now;

  const percentage = Math.min(100, Math.round((session.watchedSeconds / session.duration) * 100));
  const isEligible = percentage >= db.settings.minWatchPercentage && session.watchedSeconds >= db.settings.minWatchSeconds;

  res.json({
    success: true,
    watchedSeconds: Math.round(session.watchedSeconds * 10) / 10,
    percentage,
    isEligible
  });
});

// Step 3: Claim reward with anti-abuse validation
app.post('/api/reward/claim', (req, res) => {
  const user = getUser(req);
  const { sessionId } = req.body;
  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.status(400).json({ success: false, message: 'সেশন পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।' });
  }

  if (session.userId !== user.uid) {
    user.riskScore += 15;
    return res.status(403).json({ success: false, message: 'সেশন সিকিউরিটি অসংগতি।' });
  }

  if (session.claimed) {
    return res.status(400).json({ success: false, message: 'এই ভিডিওটির জন্য পুরস্কার ইতিমধ্যে গ্রহণ করা হয়েছে।' });
  }

  // Calculate required seconds based on server duration
  const requiredSeconds = session.duration * (db.settings.minWatchPercentage / 100);
  const actualElapsed = (Date.now() - session.startedAt) / 1000;

  // Anti-cheat checks:
  // 1. Did the user really spend at least minimum physical seconds?
  if (actualElapsed < db.settings.minWatchSeconds) {
    user.riskScore += 10;
    return res.status(400).json({
      success: false,
      message: `ভিডিওটি পর্যাপ্ত সময় ধরে দেখা হয়নি। নূন্যতম ${Math.ceil(requiredSeconds)} সেকেন্ড দেখতে হবে।`
    });
  }

  // 2. Did the heartbeat watch counter reach the minimum percentage?
  if (session.watchedSeconds < (requiredSeconds - 1.0)) {
    return res.status(400).json({
      success: false,
      message: `ভিডিওটির কমপক্ষে ${db.settings.minWatchPercentage}% দেখা সম্পন্ন করুন।`
    });
  }

  // Check daily limit
  const rewardAmount = db.settings.videoReward;
  if (user.todayCoins + rewardAmount > db.settings.dailyRewardLimit) {
    return res.status(400).json({
      success: false,
      message: 'আজকের সর্বাধিক কয়েন লিমিট পূর্ণ হয়েছে।'
    });
  }

  // Mark session claimed
  session.claimed = true;
  session.completed = true;

  // Credit user
  user.coins += rewardAmount;
  user.lifetimeCoins += rewardAmount;
  user.todayCoins += rewardAmount;
  user.todayVideosCount += 1;
  user.updatedAt = new Date().toISOString();

  // Create immutable ledger entry
  const video = db.videos.find(v => v.id === session.videoId);
  const trx: any = {
    transactionId: 'trx_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userId: user.uid,
    type: 'WATCH_REWARD',
    amount: rewardAmount,
    bdtEquivalent: rewardAmount * db.settings.coinToBDTRate,
    source: `ভিডিও রিওয়ার্ড: ${video?.title ? video.title.slice(0, 30) + '...' : 'Shorts'}`,
    videoId: session.videoId,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(trx);

  // Add in-app notification
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId: user.uid,
    title: `+${rewardAmount} কয়েন অর্জিত! 🎉`,
    message: `ভিডিও সফলভাবে দেখার জন্য আপনার ওয়ালেটে ${rewardAmount} কয়েন যোগ হয়েছে।`,
    type: 'reward',
    read: false,
    createdAt: new Date().toISOString(),
    linkTab: 'wallet'
  });

  res.json({
    success: true,
    earnedCoins: rewardAmount,
    newBalance: user.coins,
    todayCoins: user.todayCoins,
    todayVideosCount: user.todayVideosCount,
    bdtEquivalent: user.coins * db.settings.coinToBDTRate
  });
});

// 5. Daily Check-in & Streak
app.post('/api/reward/daily-checkin', (req, res) => {
  const user = getUser(req);
  const todayStr = new Date().toISOString().split('T')[0];

  if (user.lastCheckInDate === todayStr) {
    return res.status(400).json({ success: false, message: 'আজকের বোনাস ইতিমধ্যেই গ্রহণ করেছেন।' });
  }

  // Check streak
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (user.lastCheckInDate === yesterday) {
    user.streakDays = (user.streakDays % 7) + 1;
  } else {
    user.streakDays = 1;
  }

  const streakRewards = [10, 15, 20, 25, 35, 45, 75];
  const rewardAmount = streakRewards[user.streakDays - 1] || 10;

  user.lastCheckInDate = todayStr;
  user.coins += rewardAmount;
  user.lifetimeCoins += rewardAmount;
  user.todayCoins += rewardAmount;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_chk_' + Date.now(),
    userId: user.uid,
    type: 'DAILY_BONUS',
    amount: rewardAmount,
    bdtEquivalent: rewardAmount * db.settings.coinToBDTRate,
    source: `দৈনিক চেক-ইন বোনাস (দিন ${user.streakDays})`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    earnedCoins: rewardAmount,
    streakDays: user.streakDays,
    newBalance: user.coins
  });
});

// 6. Rewarded Ad Simulation with Backend Verification
app.post('/api/reward/ad-reward', (req, res) => {
  const user = getUser(req);
  const { adToken } = req.body;

  if (!db.settings.adsConfig.rewardedAdsEnabled) {
    return res.status(400).json({ success: false, message: 'রিওয়ার্ডেড বিজ্ঞাপন বর্তমানে নিষ্ক্রিয়।' });
  }

  const rewardAmount = db.settings.rewardedAdBonus;
  user.coins += rewardAmount;
  user.lifetimeCoins += rewardAmount;
  user.todayCoins += rewardAmount;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_ad_' + Date.now(),
    userId: user.uid,
    type: 'AD_REWARD',
    amount: rewardAmount,
    bdtEquivalent: rewardAmount * db.settings.coinToBDTRate,
    source: 'স্পনসরড বিজ্ঞাপন বোনাস',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    earnedCoins: rewardAmount,
    newBalance: user.coins
  });
});

// 6b. Game Reward Claim (Pre-ad and Post-ad validated)
app.post('/api/reward/game-reward', (req, res) => {
  const user = getUser(req);
  const { gameName, coinsEarned } = req.body;
  const reward = Math.min(25, Math.max(5, Number(coinsEarned) || 10)); // Safe capped rewards

  user.coins += reward;
  user.lifetimeCoins += reward;
  user.todayCoins += reward;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_game_' + Date.now(),
    userId: user.uid,
    type: 'GAME_REWARD',
    amount: reward,
    bdtEquivalent: reward * db.settings.coinToBDTRate,
    source: `গেম রিওয়ার্ড: ${gameName || 'মিনি গেম'}`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    earnedCoins: reward,
    newBalance: user.coins
  });
});

// 6c. Task / Quiz Reward Claim (Pre-ad and Post-ad validated)
app.post('/api/reward/task-reward', (req, res) => {
  const user = getUser(req);
  const { taskType, taskName, coinsEarned } = req.body;
  const reward = Math.min(20, Math.max(5, Number(coinsEarned) || 8));

  user.coins += reward;
  user.lifetimeCoins += reward;
  user.todayCoins += reward;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_task_' + Date.now(),
    userId: user.uid,
    type: 'TASK_REWARD',
    amount: reward,
    bdtEquivalent: reward * db.settings.coinToBDTRate,
    source: `টাস্ক রিওয়ার্ড: ${taskName || taskType || 'কুইজ ও টাস্ক'}`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    earnedCoins: reward,
    newBalance: user.coins
  });
});

// 7. Watch Milestone Claim
app.post('/api/reward/claim-milestone', (req, res) => {
  const user = getUser(req);
  const { milestoneCount } = req.body;

  const milestoneMap: Record<number, number> = {
    5: 20,
    10: 50,
    25: 150,
    50: 350
  };

  const reward = milestoneMap[milestoneCount];
  if (!reward) {
    return res.status(400).json({ success: false, message: 'Invalid milestone' });
  }

  if (user.todayVideosCount < milestoneCount) {
    return res.status(400).json({ success: false, message: `মাইলস্টোনে পৌঁছাতে আরও ${milestoneCount - user.todayVideosCount} টি ভিডিও দেখুন।` });
  }

  user.coins += reward;
  user.lifetimeCoins += reward;
  user.todayCoins += reward;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_mls_' + Date.now(),
    userId: user.uid,
    type: 'MILESTONE_REWARD',
    amount: reward,
    bdtEquivalent: reward * db.settings.coinToBDTRate,
    source: `${milestoneCount}টি ভিডিও দেখার মাইলস্টোন বোনাস`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    earnedCoins: reward,
    newBalance: user.coins
  });
});

// 8. Referral Code Validation & Claim
app.post('/api/reward/referral-claim', (req, res) => {
  const user = getUser(req);
  const { referralCode } = req.body;

  if (user.referredBy) {
    return res.status(400).json({ success: false, message: 'আপনি ইতিমধ্যেই রেফারেল কোড ব্যবহার করেছেন।' });
  }

  if (referralCode.toUpperCase() === user.referralCode.toUpperCase()) {
    return res.status(400).json({ success: false, message: 'নিজের রেফারেল কোড ব্যবহার করা যাবে না।' });
  }

  const referrer = db.users.find(u => u.referralCode.toUpperCase() === referralCode.toUpperCase());
  if (!referrer) {
    return res.status(404).json({ success: false, message: 'ভুল রেফারেল কোড। অনুগ্রহ করে যাচাই করুন।' });
  }

  const newUserBonus = 50; // নতুন ইউজার পাবে ৫০ কয়েন
  const referrerBonus = 25; // পুরাতন ইউজার পাবে ২৫ কয়েন

  user.referredBy = referrer.referralCode;
  user.coins += newUserBonus;
  user.lifetimeCoins += newUserBonus;

  referrer.coins += referrerBonus;
  referrer.lifetimeCoins += referrerBonus;
  referrer.referralCount = (referrer.referralCount || 0) + 1;

  db.transactions.unshift({
    transactionId: 'trx_ref_user_' + Date.now(),
    userId: user.uid,
    type: 'REFERRAL_BONUS',
    amount: newUserBonus,
    bdtEquivalent: newUserBonus * db.settings.coinToBDTRate,
    source: `রেফারেল কোড ব্যবহারের ওয়েলকাম বোনাস (+৫০ কয়েন)`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  db.transactions.unshift({
    transactionId: 'trx_ref_owner_' + Date.now(),
    userId: referrer.uid,
    type: 'REFERRAL_BONUS',
    amount: referrerBonus,
    bdtEquivalent: referrerBonus * db.settings.coinToBDTRate,
    source: `সফল ফ্রেন্ড রেফারেল বোনাস (+২৫ কয়েন) - ${user.displayName}`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  // Notify referrer
  db.notifications.unshift({
    id: 'notif_ref_' + Date.now(),
    userId: referrer.uid,
    title: 'নতুন রেফারেল যুক্ত হয়েছে! 🎉',
    message: `${user.displayName} আপনার রেফারেল কোড ব্যবহার করেছে। আপনি ২৫ কয়েন পেয়েছেন এবং তার প্রতিটি উইথড্র থেকে ১% আজীবন কমিশন পাবেন!`,
    type: 'reward',
    read: false,
    createdAt: new Date().toISOString(),
    linkTab: 'wallet'
  });

  res.json({
    success: true,
    earnedCoins: newUserBonus,
    newBalance: user.coins
  });
});

// 9. WALLET & WITHDRAWAL (bKash & Nagad)
app.get('/api/wallet/transactions', (req, res) => {
  const user = getUser(req);
  const userTrx = db.transactions.filter(t => t.userId === user.uid);
  const userWithdrawals = db.withdrawals.filter(w => w.userId === user.uid);
  res.json({
    success: true,
    transactions: userTrx,
    withdrawals: userWithdrawals,
    coins: user.coins,
    pendingWithdrawalCoins: user.pendingWithdrawalCoins,
    lifetimeCoins: user.lifetimeCoins,
    bdtEquivalent: user.coins * db.settings.coinToBDTRate
  });
});

// Request withdrawal
app.post('/api/wallet/withdraw', (req, res) => {
  const user = getUser(req);
  const { method, accountType, mobileNumber, coins } = req.body;

  // Validation
  if (method !== 'bKash' && method !== 'Nagad' && method !== 'Recharge') {
    return res.status(400).json({ success: false, message: 'পেমেন্ট মেথড হিসেবে মোবাইল রিচার্জ, bKash অথবা Nagad নির্বাচন করুন।' });
  }

  // BD Phone number regex: 01[3-9]XXXXXXXX (11 digits)
  const bdPhoneRegex = /^01[3-9]\d{8}$/;
  if (!mobileNumber || !bdPhoneRegex.test(mobileNumber.replace(/\s+/g, ''))) {
    return res.status(400).json({ success: false, message: 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' });
  }

  const coinAmount = parseInt(coins, 10);
  if (isNaN(coinAmount) || coinAmount <= 0) {
    return res.status(400).json({ success: false, message: 'সঠিক কয়েন পরিমাণ লিখুন।' });
  }

  // Rate: 1000 Coins = 15 BDT (1 Coin = 0.015 BDT)
  const rate = db.settings.coinToBDTRate || 0.015;
  const bdtAmount = Math.round(coinAmount * rate * 100) / 100;

  // Limit checks: Mobile Recharge min 30 BDT, bKash / Nagad min 100 BDT
  if (method === 'Recharge' && bdtAmount < (db.settings.minRechargeBDT || 30)) {
    const requiredCoins = Math.ceil((db.settings.minRechargeBDT || 30) / rate);
    return res.status(400).json({
      success: false,
      message: `মোবাইল রিচার্জের জন্য সর্বনিম্ন ৩০ টাকা (${requiredCoins} কয়েন) ব্যালেন্স প্রয়োজন।`
    });
  }

  if ((method === 'bKash' || method === 'Nagad') && bdtAmount < (db.settings.minBkashNagadBDT || 100)) {
    const requiredCoins = Math.ceil((db.settings.minBkashNagadBDT || 100) / rate);
    return res.status(400).json({
      success: false,
      message: `${method}-এ ক্যাশআউটের জন্য সর্বনিম্ন ১০০ টাকা (${requiredCoins} কয়েন) ব্যালেন্স প্রয়োজন।`
    });
  }

  if (coinAmount > user.coins) {
    return res.status(400).json({ success: false, message: 'আপনার ওয়ালেটে পর্যাপ্ত কয়েন ব্যালেন্স নেই।' });
  }

  // Move coins into pending withdrawal (not destroyed)
  user.coins -= coinAmount;
  user.pendingWithdrawalCoins = (user.pendingWithdrawalCoins || 0) + coinAmount;
  user.updatedAt = new Date().toISOString();

  const withdrawal: any = {
    withdrawalId: 'wth_' + Date.now(),
    userId: user.uid,
    userName: user.displayName,
    method,
    accountType: accountType || (method === 'Recharge' ? 'Prepaid' : 'Personal'),
    mobileNumber: mobileNumber.replace(/\s+/g, ''),
    coins: coinAmount,
    bdtAmount,
    status: 'Pending',
    requestedAt: new Date().toISOString(),
    adminNote: 'পেমেন্ট প্রক্রিয়াধীন রয়েছে।'
  };

  db.withdrawals.unshift(withdrawal);

  // Add ledger entry
  db.transactions.unshift({
    transactionId: 'trx_wth_' + Date.now(),
    userId: user.uid,
    type: 'WITHDRAWAL',
    amount: -coinAmount,
    bdtEquivalent: -bdtAmount,
    source: `${method === 'Recharge' ? 'মোবাইল রিচার্জ' : method} (${withdrawal.accountType}) ক্যাশআউট রিকোয়েস্ট`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    note: `${mobileNumber}`
  });

  // Notification
  db.notifications.unshift({
    id: 'notif_' + Date.now(),
    userId: user.uid,
    title: 'উত্তোলন রিকোয়েস্ট গৃহীত হয়েছে ⏳',
    message: `${coinAmount} কয়েন (৳${bdtAmount.toFixed(2)}) ${method}-এ পাঠানোর প্রক্রিয়া শুরু হয়েছে। অ্যাডমিন রিভিউ সম্পন্ন হলে টাকা পাঠানো হবে।`,
    type: 'withdrawal',
    read: false,
    createdAt: new Date().toISOString(),
    linkTab: 'wallet'
  });

  res.json({
    success: true,
    withdrawal,
    newBalance: user.coins,
    pendingBalance: user.pendingWithdrawalCoins
  });
});

// 10. NOTIFICATIONS
app.get('/api/notifications', (req, res) => {
  const user = getUser(req);
  const list = db.notifications.filter(n => n.userId === user.uid || n.userId === 'all');
  res.json({ success: true, notifications: list });
});

app.post('/api/notifications/mark-read', (req, res) => {
  const user = getUser(req);
  db.notifications.forEach(n => {
    if (n.userId === user.uid || n.userId === 'all') {
      n.read = true;
    }
  });
  res.json({ success: true });
});

// 11. ADMIN DASHBOARD & MANAGEMENT
// Overview KPIs
app.get('/api/admin/overview', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const totalUsers = db.users.length;
  const activeToday = db.users.filter(u => u.todayVideosCount > 0).length;
  const totalVideosWatched = db.users.reduce((acc, u) => acc + (u.todayVideosCount || 0), 0) + 124;
  const totalCoinsDistributed = db.transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingWithdrawalsCount = db.withdrawals.filter(w => w.status === 'Pending').length;
  const pendingWithdrawalsBDT = db.withdrawals
    .filter(w => w.status === 'Pending')
    .reduce((acc, w) => acc + w.bdtAmount, 0);

  const paidWithdrawalsBDT = db.withdrawals
    .filter(w => w.status === 'Paid')
    .reduce((acc, w) => acc + w.bdtAmount, 0);

  const totalRewardLiabilityCoins = db.users.reduce((acc, u) => acc + u.coins, 0);
  const totalRewardLiabilityBDT = totalRewardLiabilityCoins * db.settings.coinToBDTRate;

  // Ad revenue calculated based on standard real-world Google AdSense/AdMob rates:
  // eCPM ~ $2.20 USD per 1000 video impressions = ~0.26 BDT per impression
  // Each user video cycle generates ~3 impressions (1 rewarded + 1 interstitial + mini banner)
  const simulatedAdImpressions = totalVideosWatched * 3;
  const estimatedGrossAdRevenueBDT = (simulatedAdImpressions * 0.35); // 0.35 BDT per ad eCPM
  const totalUserCostBDT = paidWithdrawalsBDT + (pendingWithdrawalsBDT * 0.7);
  const netProfitBDT = Math.max(0, estimatedGrossAdRevenueBDT - totalUserCostBDT);
  const profitMarginPercent = estimatedGrossAdRevenueBDT > 0 
    ? Math.round((netProfitBDT / estimatedGrossAdRevenueBDT) * 100) 
    : 72;

  res.json({
    success: true,
    kpis: {
      totalUsers,
      activeToday,
      totalVideosWatched,
      totalCoinsDistributed,
      pendingWithdrawalsCount,
      pendingWithdrawalsBDT,
      paidWithdrawalsBDT,
      totalRewardLiabilityBDT,
      totalRewardLiabilityCoins,
      simulatedAdRevenueBDT: estimatedGrossAdRevenueBDT,
      netProfitBDT,
      profitMarginPercent,
      pendingReportsCount: db.reports.filter(r => r.status === 'pending').length
    }
  });
});

// Admin Users List
app.get('/api/admin/users', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });
  res.json({ success: true, users: db.users });
});

// Admin User Action (Suspend/Activate/Adjust)
app.post('/api/admin/users/:uid/action', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const { uid } = req.params;
  const { action, coinAdjustment, reason } = req.body;
  const targetUser = db.users.find(u => u.uid === uid);
  if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

  if (action === 'suspend') {
    targetUser.accountStatus = 'suspended';
  } else if (action === 'unsuspend') {
    targetUser.accountStatus = 'active';
    targetUser.riskScore = 0;
  } else if (action === 'adjust_coins') {
    const delta = parseInt(coinAdjustment, 10);
    if (!isNaN(delta)) {
      targetUser.coins += delta;
      db.transactions.unshift({
        transactionId: 'trx_adm_' + Date.now(),
        userId: targetUser.uid,
        type: 'ADMIN_ADJUSTMENT',
        amount: delta,
        bdtEquivalent: delta * db.settings.coinToBDTRate,
        source: `অ্যাডমিন অ্যাডজাস্টমেন্ট: ${reason || 'Manual correction'}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      });
    }
  }

  targetUser.updatedAt = new Date().toISOString();
  res.json({ success: true, user: targetUser });
});

// Admin Withdrawals List
app.get('/api/admin/withdrawals', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });
  res.json({ success: true, withdrawals: db.withdrawals });
});

// Admin Process Withdrawal (Approve/Paid/Reject)
app.post('/api/admin/withdrawals/:id/status', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const { id } = req.params;
  const { status, trxId, adminNote } = req.body;
  const withdrawal = db.withdrawals.find(w => w.withdrawalId === id);
  if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });

  const targetUser = db.users.find(u => u.uid === withdrawal.userId);

  withdrawal.status = status;
  if (trxId) withdrawal.trxId = trxId;
  if (adminNote) withdrawal.adminNote = adminNote;
  withdrawal.processedAt = new Date().toISOString();

  if (targetUser) {
    if (status === 'Paid') {
      targetUser.pendingWithdrawalCoins = Math.max(0, (targetUser.pendingWithdrawalCoins || 0) - withdrawal.coins);
      db.notifications.unshift({
        id: 'notif_' + Date.now(),
        userId: targetUser.uid,
        title: 'পেমেন্ট সফলভাবে পাঠানো হয়েছে! 💰',
        message: `আপনার ${withdrawal.method} (${withdrawal.mobileNumber})-এ ৳${withdrawal.bdtAmount.toFixed(2)} পাঠানো হয়েছে। TrxID: ${trxId || 'N/A'}`,
        type: 'withdrawal',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'wallet'
      });

      // 🎁 REFERRAL 1% WITHDRAWAL COMMISSION TO REFERRER (নতুন ইউজারের উত্তোলিত টাকার ১% রেফারার পাবে)
      if (targetUser.referredBy) {
        const parentReferrer = db.users.find(u => u.referralCode.toUpperCase() === targetUser.referredBy?.toUpperCase());
        if (parentReferrer) {
          // 1% of withdrawal in BDT converted to Coins:
          const commissionBDT = Math.max(0.5, Math.round(withdrawal.bdtAmount * 0.01 * 100) / 100);
          const commissionCoins = Math.max(1, Math.round(commissionBDT / db.settings.coinToBDTRate));
          
          parentReferrer.coins += commissionCoins;
          parentReferrer.lifetimeCoins += commissionCoins;
          parentReferrer.updatedAt = new Date().toISOString();

          // Add transaction for 1% commission
          db.transactions.unshift({
            transactionId: 'trx_comm_' + Date.now(),
            userId: parentReferrer.uid,
            type: 'REFERRAL_BONUS',
            amount: commissionCoins,
            bdtEquivalent: commissionBDT,
            source: `রেফারেল ১% ক্যাশআউট কমিশন (+৳${commissionBDT.toFixed(2)}) - ${targetUser.displayName}`,
            status: 'COMPLETED',
            createdAt: new Date().toISOString()
          });

          // Send notification to parent referrer
          db.notifications.unshift({
            id: 'notif_comm_' + Date.now(),
            userId: parentReferrer.uid,
            title: '১% রেফারেল ক্যাশআউট কমিশন জমা হয়েছে! 💸',
            message: `আপনার রেফার করা বন্ধু ${targetUser.displayName} ৳${withdrawal.bdtAmount.toFixed(2)} উত্তোলন করায় আপনি ১% আজীবন কমিশন বাবদ ৳${commissionBDT.toFixed(2)} (${commissionCoins} কয়েন) বোনাস পেয়েছেন!`,
            type: 'reward',
            read: false,
            createdAt: new Date().toISOString(),
            linkTab: 'wallet'
          });
        }
      }
    } else if (status === 'Rejected') {
      // Refund coins back to available balance
      targetUser.coins += withdrawal.coins;
      targetUser.pendingWithdrawalCoins = Math.max(0, (targetUser.pendingWithdrawalCoins || 0) - withdrawal.coins);
      db.notifications.unshift({
        id: 'notif_' + Date.now(),
        userId: targetUser.uid,
        title: 'উত্তোলন বাতিল করা হয়েছে ❌',
        message: `আপনার উত্তোলন অনুরোধ বাতিল করা হয়েছে (${adminNote || 'তথ্য সঠিক নয়'})। কয়েন রিফান্ড করা হয়েছে।`,
        type: 'withdrawal',
        read: false,
        createdAt: new Date().toISOString(),
        linkTab: 'wallet'
      });
    }
  }

  res.json({ success: true, withdrawal });
});

// Admin Add Video
app.post('/api/admin/videos', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const {
    title,
    description,
    videoUrl,
    thumbnailUrl,
    duration,
    category,
    creatorName,
    creatorHandle,
    rewardCoins,
    contentLicense,
    licenseAttribution,
    tags
  } = req.body;

  const newVideo = {
    id: 'vid_' + Date.now(),
    title: title || 'New Licensed Video',
    description: description || '',
    videoUrl: videoUrl || 'https://assets.mixkit.co/videos/51950/51950-720.mp4',
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?w=600&auto=format&fit=crop&q=80',
    duration: parseInt(duration, 10) || 15,
    category: category || 'entertainment',
    creatorName: creatorName || 'Creator BD',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    creatorHandle: creatorHandle || '@creator_bd',
    creatorVerified: true,
    rewardCoins: parseInt(rewardCoins, 10) || db.settings.videoReward,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    savesCount: 0,
    contentLicense: contentLicense || 'licensed',
    licenseAttribution: licenseAttribution || 'Licensed by Content Provider',
    copyrightStatus: 'verified' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    tags: Array.isArray(tags) ? tags : ['Trending', 'BD']
  };

  db.videos.unshift(newVideo);
  res.json({ success: true, video: newVideo });
});

// Admin Delete / Toggle Video
app.post('/api/admin/videos/:id/toggle', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const { id } = req.params;
  const video = db.videos.find(v => v.id === id);
  if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

  video.isActive = !video.isActive;
  res.json({ success: true, video });
});

// Admin Update Settings
app.post('/api/admin/settings', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const {
    coinToBDTRate,
    minWithdrawalCoins,
    minRechargeBDT,
    minBkashNagadBDT,
    userRevenueSharePercent,
    videoReward,
    minWatchPercentage,
    minWatchSeconds,
    dailyRewardLimit,
    dailyMaxVideos,
    rewardedAdBonus,
    isDemoMode,
    adsConfig
  } = req.body;

  const oldRate = db.settings.coinToBDTRate;

  if (coinToBDTRate !== undefined && !isNaN(parseFloat(coinToBDTRate))) {
    db.settings.coinToBDTRate = Math.max(0.001, parseFloat(coinToBDTRate));
  }
  if (minRechargeBDT !== undefined && !isNaN(parseInt(minRechargeBDT, 10))) {
    db.settings.minRechargeBDT = Math.max(10, parseInt(minRechargeBDT, 10));
  }
  if (minBkashNagadBDT !== undefined && !isNaN(parseInt(minBkashNagadBDT, 10))) {
    db.settings.minBkashNagadBDT = Math.max(50, parseInt(minBkashNagadBDT, 10));
  }
  if (userRevenueSharePercent !== undefined && !isNaN(parseInt(userRevenueSharePercent, 10))) {
    db.settings.userRevenueSharePercent = parseInt(userRevenueSharePercent, 10);
  }
  if (minWithdrawalCoins !== undefined && !isNaN(parseInt(minWithdrawalCoins, 10))) {
    db.settings.minWithdrawalCoins = parseInt(minWithdrawalCoins, 10);
  }
  if (videoReward !== undefined && !isNaN(parseInt(videoReward, 10))) {
    db.settings.videoReward = parseInt(videoReward, 10);
  }
  if (minWatchPercentage !== undefined && !isNaN(parseInt(minWatchPercentage, 10))) {
    db.settings.minWatchPercentage = parseInt(minWatchPercentage, 10);
  }
  if (minWatchSeconds !== undefined && !isNaN(parseInt(minWatchSeconds, 10))) {
    db.settings.minWatchSeconds = parseInt(minWatchSeconds, 10);
  }
  if (dailyRewardLimit !== undefined && !isNaN(parseInt(dailyRewardLimit, 10))) {
    db.settings.dailyRewardLimit = parseInt(dailyRewardLimit, 10);
  }
  if (dailyMaxVideos !== undefined && !isNaN(parseInt(dailyMaxVideos, 10))) {
    db.settings.dailyMaxVideos = parseInt(dailyMaxVideos, 10);
  }
  if (rewardedAdBonus !== undefined && !isNaN(parseInt(rewardedAdBonus, 10))) {
    db.settings.rewardedAdBonus = parseInt(rewardedAdBonus, 10);
  }
  if (isDemoMode !== undefined) db.settings.isDemoMode = !!isDemoMode;
  if (adsConfig !== undefined) db.settings.adsConfig = { ...db.settings.adsConfig, ...adsConfig };
  if (req.body.activeNotice !== undefined) db.settings.activeNotice = { ...db.settings.activeNotice, ...req.body.activeNotice };

  // If coin rate was changed, broadcast a system notification to users
  if (oldRate !== db.settings.coinToBDTRate) {
    const ratePer1000 = (1000 * db.settings.coinToBDTRate).toFixed(0);
    db.notifications.unshift({
      id: 'notif_rate_' + Date.now(),
      userId: 'all',
      title: 'কয়েন রেট আপডেট নোটিশ 📢',
      message: `বিজ্ঞাপন রেভিনিউ সমন্বয় অনুসারে কয়েন রেট পরিবর্তিত হয়েছে: ১০০০ কয়েন = ৳${ratePer1000} BDT!`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'wallet'
    });
  }

  res.json({ success: true, settings: db.settings });
});

// Admin Broadcast Push Announcement
app.post('/api/admin/broadcast', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const { title, message, linkTab } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required' });
  }

  // Update top banner notice
  db.settings.activeNotice = {
    enabled: true,
    title: title.trim(),
    message: message.trim(),
    type: 'announcement',
    updatedAt: new Date().toISOString()
  };

  // Push to notifications center
  db.notifications.unshift({
    id: 'notif_bc_' + Date.now(),
    userId: 'all',
    title: title.trim(),
    message: message.trim(),
    type: 'system',
    read: false,
    createdAt: new Date().toISOString(),
    linkTab: linkTab || 'home'
  });

  res.json({ success: true, message: 'ঘোষণা সফলভাবে সকল ইউজারের কাছে পাঠানো হয়েছে!' });
});

// Admin Reports
app.get('/api/admin/reports', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });
  res.json({ success: true, reports: db.reports });
});

// Attach Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WATCH & EARN BD server running on port ${PORT}`);
  });
}

startServer();
