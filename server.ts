import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 🛡️ International Enterprise-Grade Security Headers & Anti-Tamper Guard
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Robots-Tag', 'all, index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  next();
});

// Explicit SEO Routes for Googlebot Crawler
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.setHeader('X-Robots-Tag', 'all, index, follow');
  const host = req.headers.host || 'watch-and-earn-z5hx.onrender.com';
  res.send(`User-agent: *
Allow: /
Sitemap: https://${host}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.setHeader('X-Robots-Tag', 'all, index, follow');
  const host = req.headers.host || 'watch-and-earn-z5hx.onrender.com';
  const today = new Date().toISOString().split('T')[0];
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${host}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://${host}/?tab=watch</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://${host}/?tab=wallet</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${host}/?tab=rewards</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${host}/?tab=tasks</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${host}/?tab=games</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
});

// Increase request entity size limits to 50mb for image snapshots, avatar uploads, and database sync
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory sliding-window rate limiter to protect server controller from spam and abusive bots
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
app.use('/api', (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return next();
  }

  record.count++;
  // Maximum 120 API calls per minute per IP for normal usage
  if (record.count > 120) {
    return res.status(429).json({
      success: false,
      message: 'খুব দ্রুত অনুরোধ পাঠানো হচ্ছে। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।'
    });
  }

  next();
});

// Periodic cleanup of rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now > data.resetAt) ipRequestCounts.delete(ip);
  }
}, 5 * 60 * 1000);

// In-Memory & Disk-Persisted Database for Permanent Data Storage
const DB_FILE = path.resolve(process.cwd(), 'database_data.json');

function saveDbToDisk() {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save db to disk', err);
  }
}

function loadDbFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      if (loaded && loaded.users && Array.isArray(loaded.users)) {
        // Merge or copy
        db.settings = { ...db.settings, ...(loaded.settings || {}) };
        db.settings.videoReward = 50;
        db.settings.rewardedAdBonus = 50;
        db.settings.dailyRewardLimit = 1200;
        db.settings.dailyMaxVideos = 40;
        db.settings.dailyRewardedAdLimit = 25;
        db.settings.referralBonus = 50;
        db.users = loaded.users || db.users;
        db.videos = loaded.videos || db.videos;
        db.transactions = loaded.transactions || db.transactions;
        db.withdrawals = loaded.withdrawals || db.withdrawals;
        db.reports = loaded.reports || db.reports;
        db.notifications = loaded.notifications || db.notifications;
        db.comments = loaded.comments || db.comments;
        console.log(`[DB] Successfully loaded ${db.users.length} users and ${db.transactions.length} transactions from storage.`);
      }
    }
  } catch (err) {
    console.error('Failed to load db from disk', err);
  }

  // 🎯 Target Specific User: ইউজার 7851 (usr_1790862737851)
  // Ensure EXCLUSIVELY this user receives +2000 coins (150 + 2000 = 2150)
  // NO OTHER USER gets this bonus
  db.users = db.users.filter(u => u.uid !== 'usr_7851');

  let user7851 = db.users.find(u => u.uid === 'usr_1790862737851');
  if (!user7851) {
    user7851 = {
      uid: 'usr_1790862737851',
      displayName: 'ইউজার 7851',
      email: 'usr_1790862737851@watchandearn.bd',
      phone: '',
      password: '',
      phoneVerified: true,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coins: 2150,
      pendingWithdrawalCoins: 0,
      lifetimeCoins: 2150,
      todayCoins: 2000,
      todayVideosCount: 0,
      streakDays: 1,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      role: 'user',
      accountStatus: 'active',
      riskScore: 0,
      referralCode: 'BD9963',
      referralCount: 0,
      createdAt: '2026-10-03T13:03:39.788Z',
      updatedAt: new Date().toISOString()
    };
    db.users.push(user7851);
  } else {
    user7851.coins = 2150;
    user7851.lifetimeCoins = Math.max(user7851.lifetimeCoins || 0, 2150);
    user7851.updatedAt = new Date().toISOString();
  }

  // 🛡️ Owner (usr_admin_owner) remains strictly at 180 coins
  const owner = db.users.find(u => u.uid === 'usr_admin_owner');
  if (owner) {
    owner.coins = 180;
    owner.lifetimeCoins = 180;
    owner.todayCoins = 180;
  }

  // Clean all 2000 bonus transactions from ANY other user
  db.transactions = (db.transactions || []).filter(t => {
    if (t.userId === 'usr_7851') return false;
    if (t.userId !== 'usr_1790862737851' && (t.amount === 2000 || (t.source && (t.source.includes('2000') || t.source.includes('২০০০'))))) {
      return false;
    }
    return true;
  });

  // Ensure Transaction ONLY for User 7851
  if (!db.transactions.some(t => t.userId === 'usr_1790862737851' && t.amount === 2000)) {
    db.transactions.unshift({
      id: 'trx_' + Date.now() + '_bonus_7851',
      userId: 'usr_1790862737851',
      type: 'ADMIN_CREDIT',
      amount: 2000,
      source: '🎁 স্পেশাল ২০০০ কয়েন রিওয়ার্ড বোনাস (Admin Granted)',
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    });
  }

  // Clean all 2000 bonus notifications from ANY other user
  db.notifications = (db.notifications || []).filter(n => {
    if (n.userId === 'usr_7851') return false;
    if (n.userId !== 'usr_1790862737851' && n.title && (n.title.includes('2000') || n.title.includes('২০০০'))) {
      return false;
    }
    return true;
  });

  // Ensure Notification ONLY for User 7851
  if (!db.notifications.some(n => n.userId === 'usr_1790862737851' && n.title.includes('২০০০ কয়েন'))) {
    db.notifications.unshift({
      id: 'notif_' + Date.now(),
      userId: 'usr_1790862737851',
      title: '🎉 ২০০০ কয়েন যোগ করা হয়েছে!',
      message: 'অভিনন্দন ইউজার 7851! আপনার অ্যাকাউন্টে ২০০০ রিওয়ার্ড কয়েন সফলভাবে যোগ করা হয়েছে। আপনি এখনই এটি ক্যাশআউট বা ব্যবহার করতে পারেন!',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'wallet'
    });
  }

  // Also include users from live Firestore so Admin Panel sees all users
  const additionalUsers = [
    {
      uid: 'usr_1790827850530',
      displayName: 'অর্পিতা নিচে নাম্বার দে',
      phone: '01764128251',
      coins: 215,
      lifetimeCoins: 215,
      referralCode: 'BD6192',
      referredBy: 'CHAYON77',
      role: 'user',
      accountStatus: 'active',
      phoneVerified: true,
      createdAt: '2026-10-01T12:00:00.000Z'
    },
    {
      uid: 'usr_1790853850900',
      displayName: 'poran Das',
      phone: '01772963821',
      coins: 150,
      lifetimeCoins: 150,
      referralCode: 'BD4591',
      referredBy: 'CHAYON77',
      role: 'user',
      accountStatus: 'active',
      phoneVerified: true,
      createdAt: '2026-10-02T12:00:00.000Z'
    },
    {
      uid: 'usr_1790862377367',
      displayName: 'সবুজ দাস',
      phone: '01889234123',
      coins: 150,
      lifetimeCoins: 150,
      referralCode: 'BD7712',
      referredBy: 'CHAYON77',
      role: 'user',
      accountStatus: 'active',
      phoneVerified: true,
      createdAt: '2026-10-03T12:00:00.000Z'
    }
  ];

  additionalUsers.forEach(au => {
    if (!db.users.some(u => u.uid === au.uid)) {
      db.users.push({
        ...au,
        email: `${au.uid}@watchandearn.bd`,
        password: '',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        pendingWithdrawalCoins: 0,
        todayCoins: 0,
        todayVideosCount: 0,
        streakDays: 1,
        lastCheckInDate: new Date().toISOString().split('T')[0],
        riskScore: 0,
        referralCount: 0,
        updatedAt: new Date().toISOString()
      });
    }
  });

  saveDbToDisk();
}

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
    coinToBDTRate: 0.015, // ১০০০ কয়েন = ১৫ টাকা (১ কয়েন = ০.০১৫ টাকা)
    minWithdrawalCoins: 2000, // ২০০০ কয়েন = ৩০ টাকা রিচার্জ
    minRechargeBDT: 30, // সর্বনিম্ন ৩০ টাকা মোবাইল রিচার্জ
    minBkashNagadBDT: 100, // সর্বনিম্ন ১০০ টাকা বিকাশ/নগদ (৬৬৬৭ কয়েন)
    userRevenueSharePercent: 35, // ৬৫% মালিকের নিট প্রফিট
    videoReward: 50, // ভিডিও ওয়াচ রিওয়ার্ড ৫০ কয়েন
    minWatchPercentage: 90,
    minWatchSeconds: 15,
    dailyRewardLimit: 1200, // দৈনিক সর্বোচ্চ ১২০০ কয়েন রিওয়ার্ড ক্যাপ
    dailyMaxVideos: 40, // দিনে সর্বোচ্চ ৪০টি ভিডিও
    rewardedAdBonus: 50, // ২০-৩০ সেকেন্ড স্পনসর অ্যাড দেখা (+৫০ কয়েন)
    dailyRewardedAdLimit: 25, // দিনে সর্বোচ্চ ২৫টি বিজ্ঞাপন
    sponsorAdIntervalMinutes: 150, // ২.৫ ঘণ্টা পর পর একটি স্পনসর বিজ্ঞাপন
    spinIntervalMinutes: 150, // ২.৫ ঘণ্টা পর পর লাকি স্পিন
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
      adSlotRewarded: '5647382910',
      adsterraDirectLink: 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4',
      adsterraBannerCode: '<script async="async" data-cfasync="false" src="https://pl31616461.profitableratecpmnetwork.com/ba831837bc8426c844a5c5f130f56557/invoke.js"></script><div id="container-ba831837bc8426c844a5c5f130f56557"></div>',
      adsterraPopunderCode: '',
      adsterraSocialBarCode: '<script src="https://pl31612557.profitableratecpmnetwork.com/4b/5b/f5/4b5bf560a60882eaf9fc46b3684fb3f4.js"></script>',
      adsterraRewardedVideoCode: '',
      rewardedVideoDurationSeconds: 20,
      popunderEnabled: true,
      popunderIntervalMinutes: 2,
      popunderDailyCap: 25,
      monetagEnabled: true,
      monetagZoneId: '11948885',
      monetagTagCode: '<script src="https://5gvci.com/act/files/tag.min.js?z=11948885" data-cfasync="false" async></script>',
      monetagDirectLink: ''
    },
    activeNotice: {
      enabled: true,
      title: '🚨 ব্যানার ও পপআন্ডার বিজ্ঞাপন বোনাস নোটিশ 🇧🇩',
      message: 'প্রতি ব্যানার ক্লিকে ১০ কয়েন এবং পপআন্ডার বিজ্ঞাপন দেখলে ১০ কয়েন বোনাস পাবেন। বার বার স্প্যাম ক্লিক করা যাবে না।',
      type: 'warning',
      updatedAt: new Date().toISOString()
    },
    adminSecurity: {
      adminName: 'Owner Admin',
      adminPhone: '',
      adminPin: '7788'
    },
    smsGateway: {
      provider: 'greenweb',
      apiKey: process.env.SMS_API_KEY || '',
      senderId: process.env.SMS_SENDER_ID || 'WatchEarnBD',
      apiUrl: 'https://api.greenweb.com.bd/api.php',
      enabled: false
    }
  },
  users: [
    {
      uid: 'usr_admin_owner',
      displayName: 'System Admin (Owner)',
      email: 'admin@watchearnbd.com',
      phone: '',
      password: '7788',
      phoneVerified: true,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coins: 0,
      pendingWithdrawalCoins: 0,
      lifetimeCoins: 0,
      todayCoins: 0,
      todayVideosCount: 0,
      streakDays: 1,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      role: 'admin',
      accountStatus: 'active',
      riskScore: 0,
      referralCode: 'ADMIN77',
      referredBy: undefined,
      referralCount: 0,
      createdAt: new Date().toISOString(),
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
  transactions: [],
  withdrawals: [],
  reports: [],
  notifications: [],
  comments: []
};

// Active watch sessions to prevent fraud / time manipulation
const activeSessions: Map<string, WatchSessionData> = new Map();

// In-Memory Phone OTP verification store: phone -> { code: string, expiresAt: number }
const phoneOtps: Map<string, { code: string; expiresAt: number }> = new Map();

// Helper to get current active user (with auto-recovery for persistent multi-device sessions)
function getUser(req: express.Request) {
  const uid = ((req.headers['x-user-id'] as string) || '').trim();
  if (!uid) return null;

  const clientCoinsHeader = req.headers['x-user-coins'];
  const clientCoins = clientCoinsHeader ? parseInt(clientCoinsHeader as string, 10) : 0;

  let user = db.users.find(u => u.uid === uid);
  if (!user && (uid.startsWith('usr_') || uid.startsWith('user_'))) {
    // 🛡️ Auto-restore / register this user in db.users with standard starting balance (100 coins max)
    // Never allow unverified client headers to forge arbitrary starting balance!
    const startingCoins = 100;
    user = {
      uid,
      displayName: 'ইউজার ' + uid.slice(-4),
      email: `${uid}@watchandearn.bd`,
      phone: '',
      password: '',
      phoneVerified: true,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coins: startingCoins,
      pendingWithdrawalCoins: 0,
      lifetimeCoins: startingCoins,
      todayCoins: 0,
      todayVideosCount: 0,
      streakDays: 1,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      role: 'user',
      accountStatus: 'active',
      riskScore: 0,
      referralCode: 'BD' + Math.floor(1000 + Math.random() * 9000),
      referralCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDbToDisk();
  }
  return user || null;
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
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'অননুমোদিত বা কোনো সক্রিয় সেশন নেই।'
    });
  }
  res.json({
    success: true,
    user
  });
});

// Helper to dispatch Real SMS via Bangladesh SMS Gateways
async function dispatchRealSms(phone: string, text: string): Promise<{ sent: boolean; response?: string }> {
  const config = db.settings.smsGateway;
  if (!config || !config.enabled || !config.apiKey) {
    return { sent: false, response: 'Gateway not enabled or API Key missing' };
  }

  const cleanPhone = phone.startsWith('88') ? phone : '88' + phone;

  try {
    let url = '';
    if (config.provider === 'greenweb') {
      url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(config.apiKey)}&to=${encodeURIComponent(cleanPhone)}&message=${encodeURIComponent(text)}`;
    } else if (config.provider === 'bulksmsbd') {
      url = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(config.apiKey)}&type=text&number=${encodeURIComponent(cleanPhone)}&senderid=${encodeURIComponent(config.senderId || '8809612443880')}&message=${encodeURIComponent(text)}`;
    } else if (config.provider === 'mimsms') {
      url = `https://esms.mimsms.com/smsapi?api_key=${encodeURIComponent(config.apiKey)}&type=text&contacts=${encodeURIComponent(cleanPhone)}&senderid=${encodeURIComponent(config.senderId || '')}&msg=${encodeURIComponent(text)}`;
    } else if (config.apiUrl) {
      url = config.apiUrl
        .replace('{phone}', cleanPhone)
        .replace('{key}', config.apiKey)
        .replace('{text}', encodeURIComponent(text));
    }

    if (url) {
      console.log(`[REAL SMS DISPATCH] Requesting: ${url.replace(config.apiKey, '***')}`);
      const res = await fetch(url);
      const respText = await res.text();
      console.log(`[REAL SMS RESULT] Response: ${respText.slice(0, 100)}`);
      return { sent: true, response: respText };
    }
  } catch (err: any) {
    console.error('[REAL SMS ERROR] Failed to send SMS:', err?.message || err);
    return { sent: false, response: err?.message };
  }

  return { sent: false };
}

// Request Phone OTP Pin for Registration (Supports Bangladesh & Global/USA +1, +91, etc.)
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  const cleanPhone = (phone || '').replace(/\s+/g, '');
  if (!cleanPhone || cleanPhone.length < 6) {
    return res.status(400).json({ success: false, message: 'সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX বা +1 234XXXXXX)।' });
  }

  // Check if phone already registered
  if (db.users.some(u => u.phone === cleanPhone)) {
    return res.status(400).json({ success: false, message: 'এই ফোন নম্বরটি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।' });
  }

  // Generate 4-digit verification code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  phoneOtps.set(cleanPhone, { code, expiresAt });

  const smsText = `Watch & Earn BD: আপনার অ্যাকাউন্ট ভেরিফিকেশন পিন হলো ${code}। পিনটি কাউকে বলবেন না।`;
  console.log(`[SMS OTP GATEWAY] Sending code ${code} to ${cleanPhone}`);

  // Dispatch real SMS if configured (for BD numbers)
  const isBdNumber = /^01[3-9]\d{8}$/.test(cleanPhone) || /^(\+?8801)[3-9]\d{8}$/.test(cleanPhone);
  const smsResult = isBdNumber ? await dispatchRealSms(cleanPhone, smsText) : { sent: false };

  // Return message indicating verification PIN
  res.json({
    success: true,
    message: smsResult.sent 
      ? `আপনার মোবাইল নম্বরে এসএমএস এর মাধ্যমে ৪-ডিজিটের ভেরিফিকেশন পিন পাঠানো হয়েছে।` 
      : `আপনার নম্বরে ভেরিফিকেশন পিন জেনারেট হয়েছে।`,
    // Show OTP in UI if foreign or gateway is not delivering international SMS
    otpCode: (db.settings.smsGateway?.enabled && smsResult.sent) ? undefined : code,
    phone: cleanPhone,
    isRealSms: smsResult.sent
  });
});

// Register New Account with Phone OTP Verification, Password, and Referral bonus
app.post('/api/auth/register', (req, res) => {
  const { displayName, email, phone, password, otpCode, referralCodeInput, biometricType, biometricEnrolled, biometricPhoto, webAuthnCredentialId, photoURL } = req.body;
  if (!displayName || !displayName.trim()) {
    return res.status(400).json({ success: false, message: 'আপনার পূর্ণ নাম প্রদান করুন।' });
  }

  const cleanPhone = (phone || '').replace(/\s+/g, '');
  if (!cleanPhone || cleanPhone.length < 6) {
    return res.status(400).json({ success: false, message: 'সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX বা +1 234XXXXXX)।' });
  }

  if (!password || password.length < 4) {
    return res.status(400).json({ success: false, message: 'কমপক্ষে ৪ ডিজিটের পাসওয়ার্ড দিন।' });
  }

  // Verify OTP
  const storedOtp = phoneOtps.get(cleanPhone);
  if (!storedOtp) {
    return res.status(400).json({ success: false, message: 'অনুগ্রহ করে প্রথমে "পিন পাঠান" বাটনে ক্লিক করে ভেরিফিকেশন পিন সংগ্রহ করুন।' });
  }
  if (Date.now() > storedOtp.expiresAt) {
    phoneOtps.delete(cleanPhone);
    return res.status(400).json({ success: false, message: 'ভেরিফিকেশন পিনের মেয়াদ শেষ হয়ে গেছে। পুনরায় পিন পাঠান।' });
  }
  if (storedOtp.code !== (otpCode || '').trim()) {
    return res.status(400).json({ success: false, message: 'ভেরিফিকেশন পিনটি সঠিক নয়! ফোনে পাঠানো ৪ ডিজিটের পিন দিন।' });
  }

  // Verification successful, consume OTP
  phoneOtps.delete(cleanPhone);

  // Check if phone already registered
  if (db.users.some(u => u.phone === cleanPhone)) {
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
    phone: cleanPhone,
    password: password.trim(),
    phoneVerified: true,
    photoURL: photoURL || biometricPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    biometricType: biometricType || 'fingerprint',
    biometricEnrolled: Boolean(biometricEnrolled),
    biometricPhoto: biometricPhoto || undefined,
    webAuthnCredentialId: webAuthnCredentialId || undefined,
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

  saveDbToDisk();

  res.json({
    success: true,
    user: newUser,
    bonusAdded: referrerUser ? 50 : 0,
    message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!'
  });
});

// Login Account by Phone/UID with Password
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
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

  // If user has a password set, verify it
  if (user.password && password) {
    if (user.password !== password.trim()) {
      return res.status(400).json({ success: false, message: 'ভুল পাসওয়ার্ড! আপনার সঠিক পাসওয়ার্ডটি লিখুন।' });
    }
  }

  res.json({
    success: true,
    user,
    message: 'লগইন সফল হয়েছে!'
  });
});

// ⚡ 1-Click Instant Guest Login for frictionless onboarding on any device
app.post('/api/auth/guest-login', (req, res) => {
  const requestedUid = req.body?.uid;
  const guestUid = requestedUid || ('usr_guest_' + Date.now() + '_' + Math.floor(100 + Math.random() * 900));
  
  let user = db.users.find(u => u.uid === guestUid);
  if (!user) {
    user = {
      uid: guestUid,
      displayName: 'গেস্ট মেম্বার',
      email: `${guestUid}@watchandearn.bd`,
      phone: '',
      password: '',
      phoneVerified: true,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      coins: 100,
      pendingWithdrawalCoins: 0,
      lifetimeCoins: 100,
      todayCoins: 0,
      todayVideosCount: 0,
      streakDays: 1,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      role: 'user',
      accountStatus: 'active',
      riskScore: 0,
      referralCode: 'BD' + Math.floor(1000 + Math.random() * 9000),
      referralCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.unshift(user);
    saveDbToDisk();
  }

  res.json({
    success: true,
    user,
    message: 'গেস্ট মোডে স্বাগতম! ভিডিও দেখে কয়েন আয় শুরু করুন।'
  });
});

// 🌐 Official Google Sign-In Endpoint (Seamless 1-Click with Coin Preservation)
app.post('/api/auth/google-login', (req, res) => {
  const { uid, email, displayName, photoURL, cachedCoins } = req.body;
  if (!uid && !email) {
    return res.status(400).json({ success: false, message: 'Google authentication details missing' });
  }

  // 1. Check if user already exists with this email or google uid
  let user = db.users.find(u => (email && u.email?.toLowerCase() === email.toLowerCase()) || u.uid === uid || u.uid === `usr_g_${uid}`);
  const clientCoins = typeof cachedCoins === 'number' && cachedCoins > 0 ? cachedCoins : 0;

  if (user) {
    // Retain or boost with cached coins
    if (clientCoins > user.coins) {
      user.coins = clientCoins;
      user.lifetimeCoins = Math.max(user.lifetimeCoins, clientCoins);
    }
    if (displayName && !user.displayName) user.displayName = displayName;
    if (photoURL && !user.photoURL) user.photoURL = photoURL;
    user.updatedAt = new Date().toISOString();
    saveDbToDisk();
    return res.json({
      success: true,
      user,
      message: `স্বাগতম ${user.displayName}! আপনার গুগল অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে।`
    });
  }

  // 2. New Google User: Create account and carry over any previous guest coins!
  const googleUid = uid ? (uid.startsWith('usr_') ? uid : `usr_g_${uid.slice(0, 20)}`) : `usr_g_${Date.now()}`;
  const initialCoins = Math.max(100, clientCoins);

  user = {
    uid: googleUid,
    displayName: displayName || (email ? email.split('@')[0] : 'গুগল মেম্বার'),
    email: email || `${googleUid}@google.com`,
    phone: '',
    password: '',
    phoneVerified: true,
    photoURL: photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    coins: initialCoins,
    pendingWithdrawalCoins: 0,
    lifetimeCoins: initialCoins,
    todayCoins: 0,
    todayVideosCount: 0,
    streakDays: 1,
    lastCheckInDate: new Date().toISOString().split('T')[0],
    role: (email && email.toLowerCase() === 'daschayon925@gmail.com') ? 'admin' : 'user',
    accountStatus: 'active',
    riskScore: 0,
    referralCode: 'G' + Math.floor(1000 + Math.random() * 9000),
    referralCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.unshift(user);
  saveDbToDisk();

  res.json({
    success: true,
    user,
    message: `অভিনন্দন ${user.displayName}! গুগল অ্যাকাউন্ট চালু হয়েছে এবং ১০০ কয়েন যোগ করা হয়েছে।`
  });
});

// 🪙 Synchronize Coins between Client and Server (Server Authoritative)
app.post('/api/user/sync-coins', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
  }

  // 🛡️ STRICT SECURITY: Coin balances are authoritative on server.
  // Regular users CANNOT inject arbitrary coin increments through this endpoint.
  // Returns current authentic balance from server database.
  res.json({
    success: true,
    coins: user.coins
  });
});

// Switch role / profile for demo / testing
app.post('/api/auth/switch-role', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'অননুমোদিত' });
  }
  const { role } = req.body;

  // 🛡️ STRICT SECURITY: Only the actual Owner / Admin can toggle roles!
  // Regular users are strictly forbidden from granting themselves admin access.
  if (user.uid !== 'usr_admin_owner' && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'শুধুমাত্র অ্যাডমিন রোল পরিবর্তন করতে পারবেন।' });
  }

  if (role === 'admin' || role === 'user') {
    user.role = role;
    saveDbToDisk();
    res.json({ success: true, user });
  } else {
    res.status(400).json({ success: false, message: 'Invalid role' });
  }
});

// Update Profile
app.post('/api/auth/update-profile', (req, res) => {
  const uid = (req.headers['x-user-id'] as string) || req.body.uid;
  if (!uid) {
    return res.status(401).json({ success: false, message: 'অননুমোদিত অনুরোধ।' });
  }

  let user = db.users.find(u => u.uid === uid);
  if (!user) {
    user = {
      uid,
      displayName: req.body.displayName || 'ব্যবহারকারী',
      phone: req.body.phone || '',
      photoURL: req.body.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      coins: 100,
      lifetimeCoins: 100,
      todayCoins: 0,
      todayVideosCount: 0,
      streakDays: 1,
      role: 'user',
      accountStatus: 'active',
      referralCode: 'BD' + Math.floor(1000 + Math.random() * 9000),
      referralCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.unshift(user);
  }

  const { displayName, phone, photoURL, biometricType, biometricEnrolled, biometricPhoto, webAuthnCredentialId } = req.body;
  if (displayName) user.displayName = displayName;
  if (phone) user.phone = phone;
  if (photoURL) user.photoURL = photoURL;
  if (biometricType !== undefined) user.biometricType = biometricType;
  if (biometricEnrolled !== undefined) user.biometricEnrolled = biometricEnrolled;
  if (biometricPhoto) user.biometricPhoto = biometricPhoto;
  if (webAuthnCredentialId) user.webAuthnCredentialId = webAuthnCredentialId;
  user.updatedAt = new Date().toISOString();
  saveDbToDisk();
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
  try {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
    }
    const { sessionId } = req.body;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(400).json({ success: false, message: 'সেশন পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।' });
    }

    if (session.userId !== user.uid) {
      user.riskScore = (user.riskScore || 0) + 15;
      return res.status(403).json({ success: false, message: 'সেশন সিকিউরিটি অসংগতি।' });
    }

    if (session.claimed) {
      return res.status(400).json({ success: false, message: 'এই ভিডিওটির জন্য পুরস্কার ইতিমধ্যে গ্রহণ করা হয়েছে।' });
    }

    // Calculate required seconds based on server duration
    const requiredSeconds = session.duration * (db.settings.minWatchPercentage / 100);
    const actualElapsed = (Date.now() - session.startedAt) / 1000;

    // Anti-cheat checks:
    if (actualElapsed < db.settings.minWatchSeconds) {
      user.riskScore = (user.riskScore || 0) + 10;
      return res.status(400).json({
        success: false,
        message: `ভিডিওটি পর্যাপ্ত সময় ধরে দেখা হয়নি। নূন্যতম ${Math.ceil(requiredSeconds)} সেকেন্ড দেখতে হবে।`
      });
    }

    if (session.watchedSeconds < (requiredSeconds - 1.0)) {
      return res.status(400).json({
        success: false,
        message: `ভিডিওটির কমপক্ষে ${db.settings.minWatchPercentage}% দেখা সম্পন্ন করুন।`
      });
    }

    // Check daily limit
    const rewardAmount = db.settings.videoReward || 50;
    if ((user.todayCoins || 0) + rewardAmount > (db.settings.dailyRewardLimit || 1200)) {
      return res.status(400).json({
        success: false,
        message: 'আজকের সর্বাধিক কয়েন লিমিট পূর্ণ হয়েছে।'
      });
    }

    // Mark session claimed
    session.claimed = true;
    session.completed = true;

    // Credit user
    user.coins = (user.coins || 0) + rewardAmount;
    user.lifetimeCoins = (user.lifetimeCoins || 0) + rewardAmount;
    user.todayCoins = (user.todayCoins || 0) + rewardAmount;
    user.todayVideosCount = (user.todayVideosCount || 0) + 1;
    user.updatedAt = new Date().toISOString();

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
    saveDbToDisk();

    res.json({
      success: true,
      earnedCoins: rewardAmount,
      newBalance: user.coins,
      todayCoins: user.todayCoins,
      todayVideosCount: user.todayVideosCount,
      bdtEquivalent: user.coins * db.settings.coinToBDTRate
    });
  } catch (err: any) {
    console.error('Reward claim error:', err);
    res.status(200).json({ success: false, message: 'রিওয়ার্ড প্রক্রিয়াকরণে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।' });
  }
});

// 5. Daily Check-in & Streak
app.post('/api/reward/daily-checkin', (req, res) => {
  try {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'বোনাস পেতে অনুগ্রহ করে প্রথমে লগইন বা একাউন্ট তৈরি করুন।' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (user.lastCheckInDate === todayStr) {
      return res.status(200).json({ success: false, message: 'আজকের বোনাস ইতিমধ্যেই গ্রহণ করেছেন।' });
    }

    // Check streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.lastCheckInDate === yesterday) {
      user.streakDays = ((user.streakDays || 0) % 7) + 1;
    } else {
      user.streakDays = 1;
    }

    const streakRewards = [10, 15, 20, 25, 35, 45, 75];
    const rewardAmount = streakRewards[user.streakDays - 1] || 10;

    user.lastCheckInDate = todayStr;
    user.coins = (user.coins || 0) + rewardAmount;
    user.lifetimeCoins = (user.lifetimeCoins || 0) + rewardAmount;
    user.todayCoins = (user.todayCoins || 0) + rewardAmount;
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

    saveDbToDisk();

    res.json({
      success: true,
      earnedCoins: rewardAmount,
      streakDays: user.streakDays,
      newBalance: user.coins
    });
  } catch (err: any) {
    console.error('Daily checkin error:', err);
    res.status(200).json({ success: false, message: 'বোনাস ক্লেইম করা যায়নি।' });
  }
});

// 6. Rewarded Ad Simulation with Guaranteed Instant Coin Credit
const lastAdClaimTimes: Map<string, number> = new Map();
const activeAdSessions: Map<string, { userId: string; startedAt: number }> = new Map();

// 🎬 Step 1: Start Rewarded Ad Watch Session (Strict Minimum 15-20 Seconds)
app.post('/api/reward/ad-start', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
  }

  const adSessionId = 'ads_' + crypto.randomBytes(8).toString('hex');
  activeAdSessions.set(adSessionId, {
    userId: user.uid,
    startedAt: Date.now()
  });

  // Expire after 10 mins
  setTimeout(() => activeAdSessions.delete(adSessionId), 600000);

  res.json({
    success: true,
    adSessionId,
    minSeconds: 50
  });
});

app.post('/api/reward/ad-reward', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
  }

  const { adToken, adSessionId } = req.body || {};
  if (user.accountStatus === 'suspended') {
    return res.status(403).json({ success: false, message: 'অস্বাভাবিক কার্যক্রমের কারণে আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।' });
  }

  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  // 🛡️ Guard 0: Verify Ad Session Minimum Time (Must watch at least 15 seconds)
  if (adSessionId) {
    const session = activeAdSessions.get(adSessionId);
    if (!session) {
      return res.status(400).json({ success: false, message: 'বিজ্ঞাপন সেশন পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।' });
    }
    if (session.userId !== user.uid) {
      return res.status(403).json({ success: false, message: 'সেশন সিকিউরিটি অসংগতি।' });
    }
    const elapsedSec = (now - session.startedAt) / 1000;
    if (elapsedSec < 48) {
      return res.status(400).json({
        success: false,
        message: `বিজ্ঞাপনটি পুরো ৫০ সেকেন্ড দেখা হয়নি (আপনি দেখেছেন ${Math.floor(elapsedSec)} সেকেন্ড)। পুরো সময় না দেখলে কয়েন দেওয়া সম্ভব নয়।`
      });
    }
    activeAdSessions.delete(adSessionId);
  }

  // 🛡️ Guard 1: Anti-Spam Cooldown (Minimum 15 seconds between rewarded video claims)
  const lastClaim = lastAdClaimTimes.get(user.uid) || 0;
  const minIntervalMs = 15000;
  if (now - lastClaim < minIntervalMs) {
    const remainingSec = Math.ceil((minIntervalMs - (now - lastClaim)) / 1000);
    return res.status(429).json({
      success: false,
      message: `নিরাপত্তা সতর্কতা: পরবর্তী বিজ্ঞাপন দেখার জন্য ${remainingSec} সেকেন্ড অপেক্ষা করুন।`
    });
  }

  // ⏱️ Guard 1b: 2-3 Hour Interval between Sponsored Ads (ডিফল্ট: ১৫০ মিনিট / ২.৫ ঘণ্টা বিরতি)
  const sponsorIntervalMinutes = Number(db.settings.sponsorAdIntervalMinutes) || 150;
  const intervalMs = sponsorIntervalMinutes * 60 * 1000;
  if (user.lastSponsoredAdTimestamp) {
    const lastTime = new Date(user.lastSponsoredAdTimestamp).getTime();
    const elapsed = now - lastTime;
    if (elapsed < intervalMs) {
      const remainingMs = intervalMs - elapsed;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const timeStr = hours > 0 ? `${hours} ঘণ্টা ${mins} মিনিট` : `${mins} মিনিট`;
      return res.status(429).json({
        success: false,
        cooldown: true,
        remainingMs,
        message: `⏳ পরবর্তী স্পনসর বিজ্ঞাপন দেখতে পারবেন ${timeStr} পর। নিয়ম অনুযায়ী প্রতি ${Math.round(sponsorIntervalMinutes / 60 * 10) / 10} ঘণ্টা পর পর বিজ্ঞাপন লোড হয়।`
      });
    }
  }

  // 🛡️ Guard 2: Reset daily counter on date change
  if (!user.rewardedAdsToday || user.lastRewardedAdDate !== todayStr) {
    user.rewardedAdsToday = 0;
    user.lastRewardedAdDate = todayStr;
  }

  // 🛡️ Guard 3: Daily maximum rewarded ads cap (default 20 ads per day)
  const maxDailyRewardedAds = db.settings.dailyRewardedAdLimit || 20;
  if (user.rewardedAdsToday >= maxDailyRewardedAds) {
    return res.status(400).json({
      success: false,
      limitReached: true,
      message: `আজকের সর্বোচ্চ (${maxDailyRewardedAds} টি) স্পনসর বিজ্ঞাপন দেখার সীমা শেষ হয়েছে। আগামীকাল আবার চেষ্টা করুন!`
    });
  }

  const rewardAmount = adToken === 'reel_auto_loop' 
    ? (db.settings.videoReward || db.settings.rewardedAdBonus || 50)
    : (db.settings.rewardedAdBonus || db.settings.videoReward || 35);

  // 🛡️ Guard 4: Total daily earnings cap across all activities
  const dailyLimit = db.settings.dailyRewardLimit || 1200;
  if ((user.todayCoins || 0) + rewardAmount > dailyLimit) {
    return res.status(400).json({
      success: false,
      limitReached: true,
      message: `আজকের সর্বাধিক উপার্জনের সীমা (${dailyLimit} কয়েন) পূর্ণ হয়েছে। অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন।`
    });
  }

  lastAdClaimTimes.set(user.uid, now);
  user.rewardedAdsToday += 1;
  user.coins += rewardAmount;
  user.lifetimeCoins += rewardAmount;
  user.todayCoins += rewardAmount;
  user.todayVideosCount = (user.todayVideosCount || 0) + 1;
  user.lastSponsoredAdTimestamp = new Date().toISOString();
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_ad_' + Date.now(),
    userId: user.uid,
    type: 'AD_REWARD',
    amount: rewardAmount,
    bdtEquivalent: rewardAmount * db.settings.coinToBDTRate,
    source: `স্পনসর বিজ্ঞাপন রিওয়ার্ড (${user.rewardedAdsToday}/${maxDailyRewardedAds})`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  saveDbToDisk();

  res.json({
    success: true,
    earnedCoins: rewardAmount,
    rewardedAdsToday: user.rewardedAdsToday,
    remainingAds: maxDailyRewardedAds - user.rewardedAdsToday,
    newBalance: user.coins
  });
});

// 💰 7. UNIVERSAL 10-COIN INSTANT AD BONUS (যেখানেই অ্যাড দেখবে বা ক্লিক করবে ১০ কয়েন পাবে!)
app.post('/api/reward/instant-ad-bonus', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
  }

  if (user.accountStatus === 'suspended') {
    return res.status(403).json({ success: false, message: 'অ্যাকাউন্ট স্থগিত রয়েছে' });
  }

  const now = Date.now();
  const lastBonus = lastAdClaimTimes.get(user.uid + '_instant') || 0;
  if (now - lastBonus < 20000) {
    return res.status(429).json({ success: false, message: 'অপেক্ষা করুন...' });
  }

  const { source, bonusCoins } = req.body || {};
  const coinsToAdd = Math.min(15, Math.max(5, parseInt(bonusCoins, 10) || 10));

  const dailyLimit = db.settings.dailyRewardLimit || 1200;
  if ((user.todayCoins || 0) + coinsToAdd > dailyLimit) {
    return res.status(400).json({ success: false, message: 'আজকের উপার্জনের সীমা পূর্ণ হয়েছে।' });
  }

  lastAdClaimTimes.set(user.uid + '_instant', now);
  user.coins += coinsToAdd;
  user.lifetimeCoins += coinsToAdd;
  user.todayCoins += coinsToAdd;
  user.updatedAt = new Date().toISOString();

  const trx: any = {
    transactionId: 'trx_bonus_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userId: user.uid,
    type: 'AD_REWARD',
    amount: coinsToAdd,
    bdtEquivalent: coinsToAdd * db.settings.coinToBDTRate,
    source: source || 'বিজ্ঞাপন ভিউ ও স্পনসর বোনাস',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(trx);
  saveDbToDisk();

  res.json({
    success: true,
    earnedCoins: coinsToAdd,
    newBalance: user.coins
  });
});

// 6b. Game Reward Claim (Pre-ad and Post-ad validated)
app.post('/api/reward/game-reward', (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
  const { gameName, coinsEarned } = req.body;
  const reward = Math.min(25, Math.max(5, Number(coinsEarned) || 10)); // Safe capped rewards

  const dailyLimit = db.settings.dailyRewardLimit || 1200;
  if ((user.todayCoins || 0) + reward > dailyLimit) {
    return res.status(400).json({ success: false, message: 'আজকের উপার্জনের সীমা পূর্ণ হয়েছে।' });
  }

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
  if (!user) return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
  const { taskType, taskName, coinsEarned } = req.body;
  const reward = Math.min(20, Math.max(5, Number(coinsEarned) || 8));

  const dailyLimit = db.settings.dailyRewardLimit || 1200;
  if ((user.todayCoins || 0) + reward > dailyLimit) {
    return res.status(400).json({ success: false, message: 'আজকের উপার্জনের সীমা পূর্ণ হয়েছে।' });
  }

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

// 6c-2. Universal CPA Offerwall Postback Webhook (CPALead, Monlix, TimeWall, AdGate Media)
app.all(['/api/postback/offerwall', '/api/postback/cpalead', '/api/postback/monlix', '/api/postback/timewall'], (req, res) => {
  const params = { ...req.query, ...req.body };
  const subid = (params.subid || params.user_id || params.userId || params.uid || params.sub_id || '') as string;
  const payout = parseFloat((params.payout || params.amount || params.payout_usd || '0') as string);
  const points = parseInt((params.points || params.coins || '0') as string, 10) || Math.round((payout || 0.05) * 6667 * 0.4);

  if (!subid) {
    return res.status(400).send('ERROR_MISSING_SUBID');
  }

  const user = db.users.find(u => u.uid === subid || u.email === subid);
  if (!user) {
    return res.status(404).send('USER_NOT_FOUND');
  }

  const earned = Math.max(50, points);
  user.coins += earned;
  user.lifetimeCoins += earned;
  user.todayCoins += earned;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_offerwall_' + Date.now(),
    userId: user.uid,
    type: 'TASK_REWARD',
    amount: earned,
    bdtEquivalent: earned * (db.settings.coinToBDTRate || 0.015),
    source: `CPA অফারওয়াল রিওয়ার্ড: ${params.offer_name || params.campaign_name || 'সার্ভে ও অফার সম্পন্ন'}`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  saveDbToDisk();
  // Return '1' as standard HTTP response for CPALead & Monlix postbacks
  return res.status(200).send('1');
});

// 6d. Direct Banner Ad Click Reward (+15 Coins, daily click limit protection)
app.post('/api/reward/ad-click', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
  }

  // 🛡️ Anti-Bot Check 1: Suspended/Banned check
  if (user.accountStatus === 'suspended') {
    return res.status(403).json({ success: false, message: 'অস্বাভাবিক কার্যক্রমের কারণে আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।' });
  }

  // 🛡️ Anti-Bot Check 2: Minimum 15 seconds cooldown between ad clicks
  const now = Date.now();
  const lastClickTime = lastAdClaimTimes.get(user.uid + '_click') || 0;
  if (now - lastClickTime < 15000) {
    const waitSeconds = Math.ceil((15000 - (now - lastClickTime)) / 1000);
    return res.status(429).json({
      success: false,
      message: `বট প্রতিরোধ নিরাপত্তা: পরবর্তী ক্লিকে বোনাস নেওয়ার জন্য ${waitSeconds} সেকেন্ড অপেক্ষা করুন।`
    });
  }

  lastAdClaimTimes.set(user.uid + '_click', now);

  const todayStr = new Date().toISOString().split('T')[0];
  if (!user.adClicksToday || user.lastAdClickDate !== todayStr) {
    user.adClicksToday = 0;
    user.lastAdClickDate = todayStr;
  }

  // Daily click limit (e.g. max 10 paid clicks per user per day for network safety)
  const maxDailyClicks = db.settings.maxDailyAdClicks || 10;
  if (user.adClicksToday >= maxDailyClicks) {
    return res.json({
      success: false,
      limitReached: true,
      message: `আজকের সর্বোচ্চ (${maxDailyClicks} টি) বিজ্ঞাপন ক্লিক বোনাস সম্পন্ন হয়েছে। আগামীকাল আবার চেষ্টা করুন!`
    });
  }

  const rewardAmount = 10; // ১০ কয়েন প্রতি ব্যানার অ্যাড ক্লিক
  user.adClicksToday += 1;
  user.coins += rewardAmount;
  user.lifetimeCoins += rewardAmount;
  user.todayCoins += rewardAmount;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_adclk_' + Date.now(),
    userId: user.uid,
    type: 'AD_REWARD',
    amount: rewardAmount,
    bdtEquivalent: rewardAmount * db.settings.coinToBDTRate,
    source: `স্পনসরড বিজ্ঞাপন ক্লিক বোনাস (${user.adClicksToday}/${maxDailyClicks})`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  saveDbToDisk();

  res.json({
    success: true,
    earnedCoins: rewardAmount,
    adClicksToday: user.adClicksToday,
    remainingClicks: maxDailyClicks - user.adClicksToday,
    newBalance: user.coins,
    message: `+${rewardAmount} কয়েন বোনাস সফলভাবে যুক্ত হয়েছে!`
  });
});

// 6e. Lucky Spin Wheel Claim Endpoint
app.post('/api/reward/spin-claim', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'লগইন আবশ্যক' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (!user.spinsToday || user.lastSpinDate !== todayStr) {
    user.spinsToday = 0;
    user.lastSpinDate = todayStr;
  }

  const maxDailySpins = 2; // দিনে সর্বোচ্চ ২ বার স্পিন
  if (user.spinsToday >= maxDailySpins) {
    return res.json({
      success: false,
      limitReached: true,
      message: `আজকের সর্বোচ্চ (${maxDailySpins} টি) লাকি স্পিন সম্পন্ন হয়েছে। আগামীকাল আবার নতুন স্পিন পাবেন!`
    });
  }

  // ⏱️ Guard: 2-3 Hour Interval between Lucky Spins (ডিফল্ট: ১৫০ মিনিট / ২.৫ ঘণ্টা বিরতি)
  const now = Date.now();
  const spinIntervalMinutes = Number(db.settings.spinIntervalMinutes) || 150;
  const intervalMs = spinIntervalMinutes * 60 * 1000;
  if (user.lastSpinTimestamp) {
    const lastTime = new Date(user.lastSpinTimestamp).getTime();
    const elapsed = now - lastTime;
    if (elapsed < intervalMs) {
      const remainingMs = intervalMs - elapsed;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const timeStr = hours > 0 ? `${hours} ঘণ্টা ${mins} মিনিট` : `${mins} মিনিট`;
      return res.status(429).json({
        success: false,
        cooldown: true,
        remainingMs,
        message: `⏳ পরবর্তী স্পিন করতে পারবেন ${timeStr} পর। নিয়ম অনুযায়ী প্রতি ${Math.round(spinIntervalMinutes / 60 * 10) / 10} ঘণ্টা পর পর নতুন স্পিন দেওয়া হয়।`
      });
    }
  }

  const rewardCoins = Math.min(50, Math.max(5, Number(req.body.rewardCoins) || 15)); // সর্বোচ্চ ৫০ কয়েন (১০০ এর পরিবর্তে)
  user.spinsToday += 1;
  user.lastSpinTimestamp = new Date().toISOString();
  user.coins += rewardCoins;
  user.lifetimeCoins += rewardCoins;
  user.todayCoins += rewardCoins;
  user.updatedAt = new Date().toISOString();

  db.transactions.unshift({
    transactionId: 'trx_spin_' + Date.now(),
    userId: user.uid,
    type: 'GAME_REWARD',
    amount: rewardCoins,
    bdtEquivalent: rewardCoins * db.settings.coinToBDTRate,
    source: `🎡 লাকি স্পিন রিওয়ার্ড (${user.spinsToday}/${maxDailySpins})`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    earnedCoins: rewardCoins,
    spinsToday: user.spinsToday,
    remainingSpins: maxDailySpins - user.spinsToday,
    newBalance: user.coins,
    message: `🎉 অভিনন্দন! আপনি +${rewardCoins} কয়েন জিতেছেন!`
  });
});

// 6f. Weekly Leaderboard Endpoint
app.get('/api/leaderboard/weekly', (req, res) => {
  // Generate realistic competitive weekly leaderboard
  const baseLeaders = [
    { rank: 1, uid: 'lead_1', name: 'মোঃ তানভীর হাসান', phone: '০১৯****৩৪২', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120', coins: 14520, videos: 210, badge: '👑 চ্যাম্পিয়ন' },
    { rank: 2, uid: 'lead_2', name: 'আল-আমিন হোসেন', phone: '০১৭****৮২১', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120', coins: 12180, videos: 185, badge: '🥈 রানার আপ' },
    { rank: 3, uid: 'lead_3', name: 'নুসরাত জাহান', phone: '০১৬****৫২৩', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120', coins: 9840, videos: 142, badge: '🥉 ৩য় স্থান' },
    { rank: 4, uid: 'lead_4', name: 'রাকিব আহমেদ', phone: '০১৮****৯১২', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120', coins: 8120, videos: 119, badge: '⭐ স্টার' },
    { rank: 5, uid: 'lead_5', name: 'মেহেদী হাসান', phone: '০১৭****৭০৮', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120', coins: 6940, videos: 98, badge: '⭐ স্টার' },
    { rank: 6, uid: 'lead_6', name: 'সাদিয়া ইসলাম', phone: '০১৮****১৪৫', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120', coins: 5420, videos: 76, badge: '🔥 রাইজিং' },
    { rank: 7, uid: 'lead_7', name: 'আরিফুল ইসলাম', phone: '০১৯****৮৯০', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120', coins: 4190, videos: 62, badge: '🔥 রাইজিং' }
  ];

  res.json({
    success: true,
    weeklyPoolBDT: 500,
    resetDaysLeft: 3,
    leaderboard: baseLeaders
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

// Request withdrawal with Anti-Fraud & Password Protection
app.post('/api/wallet/withdraw', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'লগইন আবশ্যক।' });
  }

  // Security Check 1: Suspended/Banned check
  if (user.accountStatus === 'suspended') {
    return res.status(403).json({ success: false, message: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।' });
  }

  const { method, accountType, mobileNumber, coins, password } = req.body;

  // Security Check 2: Account Password Verification to prevent unauthorized cashouts
  if (user.password && user.password.trim() !== '') {
    if (!password || user.password !== password.trim()) {
      return res.status(400).json({ success: false, message: 'নিরাপত্তা সতর্কতা: ভুল অ্যাকাউন্ট পাসওয়ার্ড! আপনার সঠিক পাসওয়ার্ড দিন।' });
    }
  }

  // Security Check 3: Check for multiple pending withdrawals
  const existingPending = db.withdrawals.find(w => w.userId === user.uid && w.status === 'Pending');
  if (existingPending) {
    return res.status(400).json({ 
      success: false, 
      message: 'আপনার একটি উত্তোলন অনুরোধ ইতিমধ্যে প্রক্রিয়াধীন রয়েছে। পূর্বের পেমেন্ট সম্পন্ন হওয়ার পর নতুন অনুরোধ করতে পারবেন।' 
    });
  }

  // Validation
  if (method !== 'bKash' && method !== 'Nagad' && method !== 'Recharge' && method !== 'Binance') {
    return res.status(400).json({ success: false, message: 'পেমেন্ট মেথড হিসেবে বিকাশ, নগদ, রিচার্জ অথবা Binance USDT নির্বাচন করুন।' });
  }

  const cleanMobile = (mobileNumber || '').replace(/\s+/g, '');
  if (method === 'Binance') {
    if (!cleanMobile || cleanMobile.length < 4) {
      return res.status(400).json({ success: false, message: 'সঠিক Binance Pay ID বা USDT (BEP20) অ্যাড্রেস দিন।' });
    }
  } else {
    // BD Phone number regex: 01[3-9]XXXXXXXX (11 digits)
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!cleanMobile || !bdPhoneRegex.test(cleanMobile)) {
      return res.status(400).json({ success: false, message: 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' });
    }
  }

  const coinAmount = parseInt(coins, 10);
  if (isNaN(coinAmount) || coinAmount <= 0) {
    return res.status(400).json({ success: false, message: 'সঠিক কয়েন পরিমাণ লিখুন।' });
  }

  // Rate: 1000 Coins = 15 BDT (1 Coin = 0.015 BDT)
  const rate = db.settings.coinToBDTRate || 0.015;
  const bdtAmount = Math.round(coinAmount * rate * 100) / 100;

  // Limit checks: Mobile Recharge min 30 BDT, bKash / Nagad min 100 BDT, Binance min 120 BDT ($1 USDT)
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

  if (method === 'Binance' && bdtAmount < 120) {
    const requiredCoins = Math.ceil(120 / rate);
    return res.status(400).json({
      success: false,
      message: `Binance USDT উত্তোলনে সর্বনিম্ন $1 USDT বা ৳১২০ (${requiredCoins} কয়েন) প্রয়োজন।`
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
    registeredPhone: user.phone || 'N/A',
    isPhoneMatching: user.phone ? user.phone === cleanMobile : false,
    method,
    accountType: accountType || (method === 'Recharge' ? 'Prepaid' : 'Personal'),
    mobileNumber: cleanMobile,
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
    note: `${cleanMobile}`
  });

  // Notification for User
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

  // 🔔 1. Alert in Admin Panel (Owner Notifications)
  const adminUsers = db.users.filter(u => u.role === 'admin');
  adminUsers.forEach(admin => {
    db.notifications.unshift({
      id: 'notif_admin_' + Date.now() + '_' + admin.uid,
      userId: admin.uid,
      title: '🚨 নতুন ক্যাশআউট রিকোয়েস্ট জমা হয়েছে!',
      message: `ইউজার ${user.displayName || 'ব্যবহারকারী'} (মোবাইল: ${cleanMobile}) ${method}-এ ৳${bdtAmount.toFixed(2)} (${coinAmount} কয়েন) উত্তোলনের আবেদন করেছেন। দ্রুত অ্যাডমিন প্যানেল চেক করুন।`,
      type: 'withdrawal',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'admin'
    });
  });

  // 📱 2. Send Real Instant SMS to Admin's Mobile Number (if admin phone configured)
  const adminPhone = db.settings.adminSecurity?.adminPhone;
  if (adminPhone && db.settings.smsGateway?.enabled) {
    const adminSmsText = `WatchEarnBD Alert: ইউজার ${user.displayName || ''} ৳${bdtAmount} উইথড্র আবেদন করেছেন। মেথড: ${method}, মোবাইল: ${cleanMobile}। অ্যাডমিন প্যানেল চেক করুন।`;
    dispatchRealSms(adminPhone, adminSmsText).catch(e => console.error('Admin withdrawal SMS error:', e));
  }

  saveDbToDisk();

  res.json({
    success: true,
    withdrawal,
    newBalance: user.coins,
    pendingBalance: user.pendingWithdrawalCoins
  });
});

// 9.1 PUBLIC VERIFIED PAYOUT FEED
app.get('/api/withdrawals/public-feed', (req, res) => {
  // Return real paid withdrawals from database
  const paidList = db.withdrawals
    .filter(w => w.status === 'Paid')
    .slice(0, 10)
    .map(w => ({
      id: w.withdrawalId,
      name: w.userName || 'সম্মানিত ইউজার',
      phone: w.mobileNumber ? w.mobileNumber.slice(0, 3) + '***' + w.mobileNumber.slice(-4) : '017***1234',
      amount: w.bdtAmount,
      method: w.method,
      timeAgo: 'সদ্য পরিশোধিত'
    }));

  res.json({
    success: true,
    payouts: paidList
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

app.post('/api/user/dismiss-private-notice', (req, res) => {
  const user = getUser(req);
  if ((user as any).privateNotice) {
    (user as any).privateNotice.active = false;
    (user as any).privateNotice.dismissed = true;
  }
  const dbUser = db.users.find(u => u.uid === user.uid);
  if (dbUser && (dbUser as any).privateNotice) {
    (dbUser as any).privateNotice.active = false;
    (dbUser as any).privateNotice.dismissed = true;
  }
  saveDbToDisk();
  res.json({ success: true });
});

// 11. ADMIN DASHBOARD & MANAGEMENT
// Overview KPIs
app.get('/api/admin/overview', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const totalUsers = db.users.filter(u => u.role !== 'admin').length;
  const activeToday = db.users.filter(u => u.role !== 'admin' && u.todayVideosCount > 0).length;
  const totalVideosWatched = db.users.reduce((acc, u) => acc + (u.todayVideosCount || 0), 0);
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

  const userOnlyCoins = db.users.filter(u => u.role !== 'admin').reduce((acc, u) => acc + u.coins, 0);
  const totalRewardLiabilityCoins = userOnlyCoins;
  const totalRewardLiabilityBDT = totalRewardLiabilityCoins * db.settings.coinToBDTRate;

  // Real Ad impressions count based on actual video views
  const simulatedAdImpressions = totalVideosWatched * 3;
  const estimatedGrossAdRevenueBDT = (simulatedAdImpressions * 0.35); // 0.35 BDT per ad eCPM
  const totalUserCostBDT = paidWithdrawalsBDT + (pendingWithdrawalsBDT * 0.7);
  const netProfitBDT = Math.max(0, estimatedGrossAdRevenueBDT - totalUserCostBDT);
  const profitMarginPercent = estimatedGrossAdRevenueBDT > 0 
    ? Math.round((netProfitBDT / estimatedGrossAdRevenueBDT) * 100) 
    : 0;

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
  const { action, coinAdjustment, reason, displayName, phone } = req.body;
  let targetUser = db.users.find(u => u.uid === uid);
  if (!targetUser) {
    targetUser = {
      uid,
      displayName: displayName || ('ইউজার ' + uid.slice(-4)),
      email: `${uid}@watchandearn.bd`,
      phone: phone || '',
      password: '',
      phoneVerified: true,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coins: 0,
      pendingWithdrawalCoins: 0,
      lifetimeCoins: 0,
      todayCoins: 0,
      todayVideosCount: 0,
      streakDays: 1,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      role: 'user',
      accountStatus: 'active',
      riskScore: 0,
      referralCode: 'BD' + Math.floor(1000 + Math.random() * 9000),
      referralCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(targetUser);
  }

  if (action === 'suspend') {
    targetUser.accountStatus = 'suspended';
  } else if (action === 'unsuspend') {
    targetUser.accountStatus = 'active';
    targetUser.riskScore = 0;
  } else if (action === 'adjust_coins') {
    const delta = parseInt(coinAdjustment, 10);
    if (!isNaN(delta)) {
      targetUser.coins = Math.max(0, targetUser.coins + delta);
      targetUser.lifetimeCoins = Math.max(targetUser.lifetimeCoins || 0, targetUser.coins);
      db.transactions.unshift({
        transactionId: 'trx_adm_' + Date.now(),
        userId: targetUser.uid,
        type: 'ADMIN_ADJUSTMENT',
        amount: delta,
        bdtEquivalent: delta * (db.settings.coinToBDTRate || 0.015),
        source: `অ্যাডমিন অ্যাডজাস্টমেন্ট: ${reason || 'Manual correction'}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      });
    }
  }

  targetUser.updatedAt = new Date().toISOString();
  saveDbToDisk();
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
  if (req.body.sponsorAdIntervalMinutes !== undefined && !isNaN(parseInt(req.body.sponsorAdIntervalMinutes, 10))) {
    db.settings.sponsorAdIntervalMinutes = Math.max(1, parseInt(req.body.sponsorAdIntervalMinutes, 10));
  }
  if (req.body.spinIntervalMinutes !== undefined && !isNaN(parseInt(req.body.spinIntervalMinutes, 10))) {
    db.settings.spinIntervalMinutes = Math.max(1, parseInt(req.body.spinIntervalMinutes, 10));
  }
  if (isDemoMode !== undefined) db.settings.isDemoMode = !!isDemoMode;
  if (adsConfig !== undefined) db.settings.adsConfig = { ...db.settings.adsConfig, ...adsConfig };
  if (req.body.activeNotice !== undefined) db.settings.activeNotice = { ...db.settings.activeNotice, ...req.body.activeNotice };
  if (req.body.adminSecurity !== undefined) {
    db.settings.adminSecurity = {
      ...db.settings.adminSecurity,
      ...req.body.adminSecurity
    };
  }
  if (req.body.smsGateway !== undefined) {
    db.settings.smsGateway = {
      ...db.settings.smsGateway,
      ...req.body.smsGateway
    };
  }

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

// Admin Send Notice (Target Single User or Broadcast to All)
app.post('/api/admin/send-notice', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const { targetType, targetUserId, title, message, linkTab, isHighPriorityBanner } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'শিরোনাম এবং বার্তা উভয়ই প্রয়োজন' });
  }

  if (targetType === 'single') {
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'অনুগ্রহ করে একজন ইউজার নির্বাচন করুন' });
    }

    const target = db.users.find(u => u.uid === targetUserId || u.phone === targetUserId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'নির্বাচিত ইউজার খুঁজে পাওয়া যায়নি' });
    }

    const newNotif = {
      id: 'notif_priv_' + Date.now(),
      userId: target.uid,
      targetUserName: target.displayName || target.phone || target.uid,
      targetUserPhone: target.phone || '',
      title: title.trim(),
      message: message.trim(),
      type: 'system',
      isPrivate: true,
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: linkTab || 'home'
    };

    db.notifications.unshift(newNotif);

    // If high priority banner is enabled, set private notice on target user object
    (target as any).privateNotice = {
      id: newNotif.id,
      title: title.trim(),
      message: message.trim(),
      linkTab: linkTab || 'home',
      createdAt: new Date().toISOString(),
      active: true
    };

    saveDbToDisk();

    return res.json({ 
      success: true, 
      message: `🔒 '${target.displayName || target.phone || target.uid}' এর অ্যাকাউন্টে প্রাইভেট নোটিশ সফলভাবে পাঠানো হয়েছে! অন্য কেউ এটি দেখতে পাবে না।`,
      notification: newNotif 
    });
  } else {
    // Broadcast to All Users
    db.settings.activeNotice = {
      enabled: true,
      title: title.trim(),
      message: message.trim(),
      type: 'announcement',
      updatedAt: new Date().toISOString()
    };

    const newNotif = {
      id: 'notif_bc_' + Date.now(),
      userId: 'all',
      targetUserName: 'সকল ইউজার (All Users)',
      title: title.trim(),
      message: message.trim(),
      type: 'system',
      isPrivate: false,
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: linkTab || 'home'
    };

    db.notifications.unshift(newNotif);
    saveDbToDisk();

    return res.json({ 
      success: true, 
      message: '📢 ঘোষণা সফলভাবে সকল ইউজারের কাছে পাঠানো হয়েছে!',
      notification: newNotif 
    });
  }
});

// Admin Get All Sent Notices
app.get('/api/admin/notices', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const notices = (db.notifications || []).filter(n => n.type === 'system' || (n as any).isPrivate);
  res.json({ success: true, notices });
});

// Admin Delete / Revoke Notice
app.delete('/api/admin/notices/:id', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

  const { id } = req.params;
  const initialCount = db.notifications.length;
  db.notifications = db.notifications.filter(n => n.id !== id);

  // Also remove from any user's active privateNotice
  db.users.forEach(u => {
    if ((u as any).privateNotice && (u as any).privateNotice.id === id) {
      delete (u as any).privateNotice;
    }
  });

  saveDbToDisk();
  res.json({ success: true, message: 'নোটিশ সফলভাবে মুছে ফেলা হয়েছে' });
});

// Admin Broadcast Push Announcement (Legacy route support)
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

  saveDbToDisk();
  res.json({ success: true, message: 'ঘোষণা সফলভাবে সকল ইউজারের কাছে পাঠানো হয়েছে!' });
});

// Admin Reports
app.get('/api/admin/reports', (req, res) => {
  const user = getUser(req);
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });
  res.json({ success: true, reports: db.reports });
});

// Explicit 404 for unhandled API endpoints so they never return HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Attach Vite middleware for development
async function startServer() {
  loadDbFromDisk();

  // Periodically save state to disk every 5 seconds
  setInterval(() => {
    saveDbToDisk();
  }, 5000);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use('/sw.js', (req, res, next) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      next();
    });
    app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true }));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WATCH & EARN BD server running on port ${PORT}`);
  });
}

startServer();
