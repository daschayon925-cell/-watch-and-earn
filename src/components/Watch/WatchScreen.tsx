import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Coins, 
  Sparkles, 
  Gift, 
  Wallet, 
  Zap, 
  Heart, 
  ExternalLink, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  Smartphone, 
  RotateCcw,
  Youtube,
  Share2,
  X,
  Volume2,
  VolumeX,
  Download,
  Eye,
  EyeOff,
  BellRing,
  Film,
  Music,
  Laugh,
  Flame,
  Award,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { AdInterstitial } from '../Feed/AdInterstitial';
import { sanitizeAdDirectLink } from '../../utils/adLinkSanitizer';
import { generateDaily200Videos } from '../../services/dailyVideoFeeder';

// Video item structure for the feed
export interface ShortVideoItem {
  id: string;
  type: 'mp4' | 'youtube' | 'dailymotion' | 'loottv';
  videoUrl?: string;
  youtubeId?: string;
  dailymotionId?: string;
  thumbnailUrl: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  audioTitle: string;
  rewardCoins: number;
  category: 'comedy' | 'dance' | 'sports' | 'pets' | 'music' | 'magic' | 'cartoon' | 'dailymotion' | 'all';
  categoryLabelBn: string;
  isOwnerSponsored?: boolean;
}

// 🎯 Extract YouTube Video ID from any standard or Shorts URL
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

// 🎥 Extract Dailymotion Video ID from standard or shortened URLs
export function extractDailymotionId(url?: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const match = clean.match(/(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// 🎬 Real engaging vertical short videos (9:16) matching viral TikTok, Bangla comedy, sports, music & funny clips
const VIRAL_ENTERTAINMENT_SHORTS: ShortVideoItem[] = [
  {
    id: 'vid_yt_shorts_01',
    type: 'youtube',
    youtubeId: 'kJQP7kiw5Fk',
    videoUrl: 'https://www.youtube.com/shorts/kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    title: 'বাংলা সেরা হাসির ফানি শর্টস ও ফানি মোমেন্ট 😂 [১০০% স্মুথ এইচডি প্লে]',
    creatorName: 'বাংলা শর্টস হাব (Natok Hub BD)',
    creatorHandle: '@natok_hub_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    caption: 'চরম হাসির নাটক সিন ও ফানি ভিডিও! দেখুন আর বন্ধুদের সাথে শেয়ার করুন 😂🔥 ১ মিনিট দেখলে বিজ্ঞাপনের বোনাস পাবেন! #shorts #natok #comedy',
    likesCount: 650000,
    commentsCount: 22400,
    audioTitle: 'Bangla Natok Comedy Beat 😂',
    rewardCoins: 50,
    category: 'comedy',
    categoryLabelBn: '🔥 সেরা শর্টস',
    isOwnerSponsored: true
  },
  {
    id: 'vid_comedy_01',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/52033/52033-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    title: 'মোশাররফ করিম ও চঞ্চল চৌধুরীর সেরা হাসির ডায়লগ 😂',
    creatorName: 'বাংলা নাটক কমেডি (Natok Hub BD)',
    creatorHandle: '@bangla_natok_comedy',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    caption: 'চরম হাসির নাটক সিন ও সেরা কমেডি মুহূর্ত! দেখুন আর বন্ধুদের সাথে শেয়ার করুন 😂🔥 #natok #comedy #bangla #shorts',
    likesCount: 184500,
    commentsCount: 6420,
    audioTitle: 'Bangla Natok Comedy Beat 😂',
    rewardCoins: 30,
    category: 'comedy',
    categoryLabelBn: '😂 কমেডি নাটক',
    isOwnerSponsored: true
  },
  {
    id: 'vid_dm_official_01',
    type: 'dailymotion',
    dailymotionId: 'x8y6g9l',
    videoUrl: 'https://www.dailymotion.com/video/x8y6g9l',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    title: 'ডেইলিমোশন অফিশিয়াল পার্টনার কমেডি ভিডিও 🎬 [Dailymotion]',
    creatorName: 'Dailymotion Partner BD',
    creatorHandle: '@dailymotion_partner',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    caption: 'ডেইলিমোশন পার্টনার ভিডিও। ১ মিনিট দেখলেই ভিডিও ও স্পন্সর বিজ্ঞাপন থেকে কয়েন পাবেন! 💎 #dailymotion #viral',
    likesCount: 410000,
    commentsCount: 12400,
    audioTitle: 'Dailymotion Beats 🎵',
    rewardCoins: 35,
    category: 'dailymotion',
    categoryLabelBn: '🎥 ডেইলিমোশন',
    isOwnerSponsored: true
  },
  {
    id: 'vid_dance_01',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/49258/49258-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    title: 'ভাইরাল টিকটক ড্যান্স ও ট্রেন্ডিং গানের সেরা স্টেপস 💃',
    creatorName: 'টিকটক রিলস বাংলাদেশ (TikTok BD)',
    creatorHandle: '@tiktok_reels_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    caption: 'ট্রেন্ডিং বিটে সুপার এনার্জেটিক ভাইরাল ড্যান্স! লাইক ও ফলো করুন 🎵✨ #tiktok #viral #dance #reels',
    likesCount: 245000,
    commentsCount: 9100,
    audioTitle: 'Viral Dance Remix 🎵',
    rewardCoins: 25,
    category: 'dance',
    categoryLabelBn: '💃 টিকটক ড্যান্স'
  },
  {
    id: 'vid_pets_01',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/41662/41662-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    title: 'কিউট বিড়াল ও কুকুরের চরম হাসির অদ্ভুত কাণ্ড 🐶🐱',
    creatorName: 'ফানি পেট জোন (Funny Pets BD)',
    creatorHandle: '@funny_pets_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80',
    caption: 'বিড়ালের দুষ্টুমি ও কিউট রিঅ্যাকশন দেখলে হাসতেই হবে! 😂🐾 #pets #cat #comedy #funnypets',
    likesCount: 312000,
    commentsCount: 12400,
    audioTitle: 'Funny Meme Sound Effect 🐱',
    rewardCoins: 25,
    category: 'pets',
    categoryLabelBn: '🐱 ফানি প্রাণী'
  },
  {
    id: 'vid_sports_01',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/40260/40260-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
    title: 'অবিশ্বাস্য স্ট্রিট ট্রিক শট ও বাস্কেটবল স্কিলস 🔥',
    creatorName: 'ট্রিক মাস্টার বিডি (TrickMaster BD)',
    creatorHandle: '@trickmaster_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    caption: 'চোখের পলকে অবিশ্বাস্য স্টান্ট! আপনি কি এটা করতে পারবেন? 😱🏀 #skills #viral #shorts #stunts',
    likesCount: 198000,
    commentsCount: 7800,
    audioTitle: 'Fast Beat Remix ⚡',
    rewardCoins: 25,
    category: 'sports',
    categoryLabelBn: '🏏 খেলাধুলা'
  },
  {
    id: 'vid_sports_02',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/49260/49260-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
    title: 'বাংলাদেশ ক্রিকেটের শেষ ওভারে রুদ্ধশ্বাস ছক্কা ও জয়ের উল্লাস! 🏏',
    creatorName: 'টাইগার্স ক্রিকেট লাইভ (Tigers BD)',
    creatorHandle: '@tigers_cricket_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    caption: 'টাইগারদের গর্জন ও শেষ বলে চার-ছক্কার রোমাঞ্চকর জয়! 🐅🇧🇩 #cricket #tigers #bangladesh #sports',
    likesCount: 285000,
    commentsCount: 14200,
    audioTitle: 'Cricket Match Excitement 🏏',
    rewardCoins: 25,
    category: 'sports',
    categoryLabelBn: '🏏 খেলাধুলা'
  },
  {
    id: 'vid_music_01',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/43527/43527-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    title: 'লাইভ ডিজে কনসার্ট পার্টি ও এনার্জেটিক মিউজিক বিট 🎧',
    creatorName: 'কনসার্ট ও মিউজিক লাইভ (Live Music BD)',
    creatorHandle: '@live_music_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    caption: 'ভাইরাল ট্রেন্ডিং লাইভ পার্টি কনসার্ট! হেডফোনে শুনুন 🎶⚡ #music #concert #party #shorts',
    likesCount: 167300,
    commentsCount: 4920,
    audioTitle: 'Party Concert Electronic Beat ⚡',
    rewardCoins: 25,
    category: 'music',
    categoryLabelBn: '🎵 গান ও কনসার্ট'
  },
  {
    id: 'vid_magic_01',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/52028/52028-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    title: 'অবিশ্বাস্য সাইন্স ট্রিকস ও চোখের পলকে ম্যাজিক ⚡',
    creatorName: 'সায়েন্স ও ম্যাজিক বাংলা (Science BD)',
    creatorHandle: '@science_hacks_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    caption: 'মজার ট্রিকস যা দেখলে আপনি চমকে যাবেন! ঘরেই চেষ্টা করে দেখুন 💡✨ #magic #science #lifehacks',
    likesCount: 142000,
    commentsCount: 3890,
    audioTitle: 'Cyber Trap Beat 🎧',
    rewardCoins: 25,
    category: 'magic',
    categoryLabelBn: '✨ ম্যাজিক ট্রিকস'
  },
  {
    id: 'vid_cartoon_01',
    type: 'mp4',
    videoUrl: 'https://assets.mixkit.co/videos/52089/52089-720.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    title: 'মীনা ও রাজু কার্টুন কমেডি পর্ব 👶 Meena Animation',
    creatorName: 'মীনা কার্টুন বিডি (Meena Stories BD)',
    creatorHandle: '@meena_stories_bd',
    creatorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    caption: 'মীনা রাজুর মিষ্টি দুষ্টুমি ও হাসির দৃশ্য! সবার প্রিয় কার্টুন ❤️🎨 #meena #cartoon #bangla #animation',
    likesCount: 220000,
    commentsCount: 8900,
    audioTitle: 'Meena Cartoon Theme 👶',
    rewardCoins: 25,
    category: 'cartoon',
    categoryLabelBn: '🎨 কার্টুন'
  }
];

export const WatchScreen: React.FC = () => {
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { setActiveTab, showToast, triggerConfetti, settings } = useApp();

  const currentRewardCoins = settings?.videoReward ?? settings?.rewardedAdBonus ?? 25;

  // Active Mode: 'shorts' (Website Shorts Player) or 'app_task' (Direct TikTok / YouTube Open with Alarm)
  const [watchMode, setWatchMode] = useState<'shorts' | 'app_task'>('shorts');
  const [showUiOverlays, setShowUiOverlays] = useState<boolean>(true);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(true);

  // Filter Category in Shorts
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Autoplay & 1-per-ad feature ("নিজে নিজে চলবে" ও "১ পর পর অ্যাড আসবে")
  const [autoNext, setAutoNext] = useState<boolean>(true);
  const [adEveryVideo, setAdEveryVideo] = useState<boolean>(true); // After every 1 video show ad!

  // External App Watch Task Settings
  const [externalAppDuration, setExternalAppDuration] = useState<number>(60); // 30s, 60s, 120s, 240s
  const [externalAppPlatform, setExternalAppPlatform] = useState<'youtube' | 'tiktok'>('youtube');
  const [isExternalWatchActive, setIsExternalWatchActive] = useState<boolean>(false);
  const [externalWatchRemaining, setExternalWatchRemaining] = useState<number>(0);
  const [externalWatchTargetDuration, setExternalWatchTargetDuration] = useState<number>(60);

  // Alarm Ringing State ("অ্যালাম বাজবে")
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [alarmRewardCoins, setAlarmRewardCoins] = useState<number>(50);
  const [alarmReason, setAlarmReason] = useState<string>('ভিডিও দেখার সময় শেষ হয়েছে!');

  // Video feed list (Automated 200 Daily Viral Videos Engine)
  const [videoList, setVideoList] = useState<ShortVideoItem[]>(() => {
    try {
      return generateDaily200Videos();
    } catch {
      return VIRAL_ENTERTAINMENT_SHORTS;
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Like & Share
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const lastTapRef = useRef<number>(0);

  // 1-minute (60 seconds) video watch cycle before 15-second Monetag/Adsterra ad
  const targetWatchSeconds = settings?.adsConfig?.videoWatchSeconds || 60;
  const [watchSeconds, setWatchSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  // Floating Coin Fly-up Animation
  const [floatingCoinReward, setFloatingCoinReward] = useState<{ show: boolean; coins: number }>({ show: false, coins: 0 });

  // Ad & Rewarded View (15-second ad cycle)
  const [showAd, setShowAd] = useState<boolean>(false);
  const [adCycleCount, setAdCycleCount] = useState<number>(1);
  const [activeAdDuration, setActiveAdDuration] = useState<number>(15);
  const [activeAdCoins, setActiveAdCoins] = useState<number>(currentRewardCoins);
  const [selectedAdTitle, setSelectedAdTitle] = useState<string>('স্পন্সর বিজ্ঞাপন');

  // Touch swipe handling
  const touchStartY = useRef<number | null>(null);

  // Filtered videos based on category with guaranteed fallback
  const rawFiltered = activeCategory === 'all' 
    ? videoList 
    : activeCategory === 'dailymotion'
      ? videoList.filter(v => v.type === 'dailymotion' || !!v.dailymotionId || !!extractDailymotionId(v.videoUrl))
      : videoList.filter(v => v.category === activeCategory);

  const fallbackFiltered = activeCategory === 'all'
    ? VIRAL_ENTERTAINMENT_SHORTS
    : activeCategory === 'dailymotion'
      ? VIRAL_ENTERTAINMENT_SHORTS.filter(v => v.type === 'dailymotion' || !!v.dailymotionId)
      : VIRAL_ENTERTAINMENT_SHORTS.filter(v => v.category === activeCategory);

  const filteredVideos = rawFiltered.length > 0 ? rawFiltered : (fallbackFiltered.length > 0 ? fallbackFiltered : VIRAL_ENTERTAINMENT_SHORTS);

  const validIndex = currentIndex < filteredVideos.length ? currentIndex : 0;
  const currentVideo: ShortVideoItem = filteredVideos[validIndex] || VIRAL_ENTERTAINMENT_SHORTS[0];

  const effectiveYouTubeId = currentVideo.youtubeId || (currentVideo.videoUrl ? extractYouTubeId(currentVideo.videoUrl) : null);
  const effectiveDailymotionId = currentVideo.dailymotionId || (currentVideo.videoUrl ? extractDailymotionId(currentVideo.videoUrl) : null);
  const isYouTubeVideo = currentVideo.type === 'youtube' || !!effectiveYouTubeId;
  const isDailymotionVideo = currentVideo.type === 'dailymotion' || !!effectiveDailymotionId;

  // Initialize like counts
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    videoList.forEach(v => {
      initialCounts[v.id] = v.likesCount;
    });
    setLikeCountMap(initialCounts);
  }, [videoList]);

  // Load server-saved videos if any exist
  useEffect(() => {
    const loadServerVideos = async () => {
      try {
        const serverVideos = await api.getVideos();
        if (Array.isArray(serverVideos) && serverVideos.length > 0) {
          const mapped: ShortVideoItem[] = serverVideos
            .filter(sv => sv && (sv.videoUrl || sv.title))
            .map(sv => {
              const ytId = extractYouTubeId(sv.videoUrl);
              const dmId = extractDailymotionId(sv.videoUrl);
              const vType = dmId ? 'dailymotion' : ytId ? 'youtube' : 'mp4';
              return {
                id: sv.id || `srv_${Math.random()}`,
                type: vType,
                videoUrl: sv.videoUrl || 'https://assets.mixkit.co/videos/52033/52033-720.mp4',
                youtubeId: ytId || undefined,
                dailymotionId: dmId || undefined,
                thumbnailUrl: sv.thumbnailUrl || (dmId ? `https://www.dailymotion.com/thumbnail/video/${dmId}` : ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'),
                title: sv.title || (dmId ? 'ডেইলিমোশন পার্টনার ভিডিও' : 'ভাইরাল কমেডি ভিডিও'),
                creatorName: sv.creatorName || (dmId ? 'Dailymotion Partner BD' : ytId ? 'মালিকের ইউটিউব চ্যানেল' : 'জনপ্রিয় ক্রিয়েটর'),
                creatorHandle: sv.creatorHandle || (dmId ? '@dailymotion_bd' : '@owner_video'),
                creatorAvatar: sv.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                caption: sv.description || sv.title || 'ভিডিও দেখুন এবং প্রতি ১৫ সেকেন্ডে কয়েন আয় করুন!',
                likesCount: sv.likesCount || 65200,
                commentsCount: sv.commentsCount || 1250,
                audioTitle: 'original sound 🎵',
                rewardCoins: sv.rewardCoins || 25,
                category: (sv.category as any) || (dmId ? 'comedy' : 'comedy'),
                categoryLabelBn: dmId ? '🎥 ডেইলিমোশন পার্টনার' : ytId ? '🌟 ওনারের ইউটিউব' : '🔥 স্পেশাল',
                isOwnerSponsored: true
              };
            });
          if (mapped.length > 0) {
            setVideoList(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newOnes = mapped.filter(m => !existingIds.has(m.id));
              // Prioritize owner videos at the very front
              return [...newOnes, ...prev];
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load server videos', err);
      }
    };
    loadServerVideos();
  }, []);

  // Video Autoplay & Reset when video changes
  useEffect(() => {
    if (watchMode === 'shorts' && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
    setWatchSeconds(0);
    startTimeRef.current = Date.now();
  }, [currentIndex, activeCategory, watchMode]);

  // -------------------------------------------------------------
  // 🔄 1-PER-VIDEO AD & AUTOPLAY ENGINE ("নিজে নিজে চলবে" ও "১ পর পর অ্যাড আসবে")
  // -------------------------------------------------------------
  useEffect(() => {
    if (watchMode !== 'shorts' || showAd || !isPlaying) {
      startTimeRef.current = null;
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now() - (watchSeconds * 1000);
    }

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setWatchSeconds(elapsed);

      // Rewarded Cycle Complete (1 minute / 60 seconds video watch reached)
      if (elapsed >= targetWatchSeconds) {
        clearInterval(interval);
        startTimeRef.current = Date.now();
        setWatchSeconds(0);

        const nextCycle = adCycleCount + 1;
        setAdCycleCount(nextCycle);

        // "ভিডিও চলবে ১ মিনিট ধরে তার পর ১৫ সেকেন্ড পর পর Monetag / Adsterra বিজ্ঞাপন স্বয়ংক্রিয়ভাবে আসবে এবং অ্যাড দেখলে ইউজার কয়েন পাবে"
        if (adEveryVideo) {
          startRewardedAd(15, currentRewardCoins, `১ মিনিট ভিডিও দেখা সম্পন্ন! ১৫ সেকেন্ডের বিজ্ঞাপন #${nextCycle}`);
        } else if (autoNext) {
          handleNextVideo();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, showAd, watchSeconds, targetWatchSeconds, adCycleCount, autoNext, adEveryVideo, watchMode]);

  // -------------------------------------------------------------
  // ⏰ EXTERNAL YOUTUBE / TIKTOK WATCH TIMER & ALARM ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isExternalWatchActive || externalWatchRemaining <= 0) return;

    const timer = setInterval(() => {
      setExternalWatchRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            triggerExternalAlarm();
          }, 0);
          return 0;
        }
        const updated = prev - 1;
        // Update tab title so user sees remaining time while in another tab/app
        try {
          document.title = `(${updated}s) ⏱️ ভিডিও দেখা হচ্ছে... | WATCH&EARN BD`;
        } catch {}
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExternalWatchActive, externalWatchRemaining]);

  // Trigger Loud Alarm & Notification when external watch time finishes
  const triggerExternalAlarm = () => {
    setIsExternalWatchActive(false);
    setIsAlarmActive(true);

    const bonus = externalWatchTargetDuration >= 240 ? 100 
      : externalWatchTargetDuration >= 120 ? 50 
      : externalWatchTargetDuration >= 60 ? 30 : 20;

    setAlarmRewardCoins(bonus);
    setAlarmReason(`${Math.floor(externalWatchTargetDuration / 60) > 0 ? `${Math.floor(externalWatchTargetDuration / 60)} মিনিট` : `${externalWatchTargetDuration} সেকেন্ড`} ভিডিও দেখা সফলভাবে শেষ হয়েছে!`);

    // 1. Play continuous loud alarm buzzer chime
    try {
      soundService.startPersistentAlarm();
    } catch {}

    // 2. Send Browser / Device Notification ("মেসেজ আসে")
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('WATCH & EARN BD 🇧🇩', {
          body: `🎉 সময় শেষ! অ্যালার্ম বাজছে! অ্যাপে ফিরে বিজ্ঞাপন দেখে +${bonus} কয়েন সংগ্রহ করুন!`,
          icon: '/favicon.ico'
        });
      } catch {}
    }

    // 3. Flashing Tab Title
    try {
      document.title = `🔔 [সময় শেষ! অ্যালার্ম বাজছে] কয়েন সংগ্রহ করুন!`;
    } catch {}

    // 4. Mobile Vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([400, 200, 400, 200, 800]);
      } catch {}
    }

    setTimeout(() => {
      showToast('⏰ সময় শেষ! অ্যালার্ম বাজছে', 'স্পন্সর বিজ্ঞাপন দেখে কয়েন সংগ্রহ করুন', 'coin');
    }, 0);
  };

  // Launch External App (TikTok or YouTube) with user selected duration
  const handleOpenExternalAppWithTopic = (platform: 'youtube' | 'tiktok', query = 'bangla comedy natok shorts') => {
    soundService.playLikePop();
    soundService.ensureUnlocked();

    // Request notification permission if not yet decided
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission();
      } catch {}
    }

    setExternalAppPlatform(platform);
    setExternalWatchTargetDuration(externalAppDuration);
    setExternalWatchRemaining(externalAppDuration);
    setIsExternalWatchActive(true);

    // Open target platform URL
    let targetUrl = '';
    if (platform === 'youtube') {
      targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    } else {
      targetUrl = `https://www.tiktok.com/tag/${encodeURIComponent(query.replace(/\s+/g, ''))}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    showToast(
      `📱 ${platform === 'youtube' ? 'ইউটিউব' : 'টিকটক'} ওপেন হয়েছে!`,
      `⏱️ ${externalAppDuration} সেকেন্ড পর আপনার ফোনে সরাসরি অ্যালার্ম ও মেসেজ আসবে!`,
      'info'
    );
  };

  // -------------------------------------------------------------
  // 🎬 NAVIGATION & AUTOPLAY HANDLERS ("নিজে নিজে চলবে")
  // -------------------------------------------------------------
  const handleNextVideo = () => {
    soundService.playLikePop();
    const count = filteredVideos.length;
    if (count > 0) {
      setCurrentIndex(prev => (prev + 1) % count);
    }
    setIsPlaying(true);
    setWatchSeconds(0);
    startTimeRef.current = Date.now();
  };

  const handlePrevVideo = () => {
    soundService.playLikePop();
    const count = filteredVideos.length;
    if (count > 0) {
      setCurrentIndex(prev => (prev - 1 + count) % count);
    }
    setIsPlaying(true);
    setWatchSeconds(0);
    startTimeRef.current = Date.now();
  };

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNextVideo(); // Swiped Up -> Next
      else handlePrevVideo(); // Swiped Down -> Prev
    }
  };

  // Double Tap handler for Heart burst
  const handleVideoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLike();
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    } else {
      togglePlayPause();
    }
    lastTapRef.current = now;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleLike = () => {
    const vidId = currentVideo.id;
    const isLiked = likedMap[vidId];
    setLikedMap(prev => ({ ...prev, [vidId]: !isLiked }));
    setLikeCountMap(prev => ({
      ...prev,
      [vidId]: (prev[vidId] || currentVideo.likesCount) + (isLiked ? -1 : 1)
    }));
    soundService.playLikePop();
    if (!isLiked) {
      showToast('❤️ ভিডিও পছন্দ করেছেন!', '', 'info');
    }
  };

  // -------------------------------------------------------------
  // 📢 REWARDED AD FLOW ("অ্যাড আসবে")
  // -------------------------------------------------------------
  const startRewardedAd = (duration = 15, coins = currentRewardCoins, title = 'রিওয়ার্ডেড বিজ্ঞাপন') => {
    soundService.ensureUnlocked();
    setActiveAdDuration(duration);
    setActiveAdCoins(coins);
    setSelectedAdTitle(title);
    try {
      const targetLink = settings?.adsConfig?.monetagDirectLink || settings?.adsConfig?.adsterraDirectLink;
      const directLink = sanitizeAdDirectLink(targetLink, 'adsterra');
      if (directLink) {
        window.open(directLink, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {}
    setShowAd(true);
  };

  const handleAdFinished = async () => {
    setShowAd(false);
    awardCoinsLocally(activeAdCoins || currentRewardCoins);
    soundService.playCoinReward();
    triggerConfetti();
    showToast(`🎉 দারুণ! ১৫ সেকেন্ড বিজ্ঞাপন সফলভাবে দেখেছেন! +${activeAdCoins || currentRewardCoins} কয়েন জমা হয়েছে!`, '', 'coin');
    try {
      await refreshUser();
    } catch {}
    setIsPlaying(true);
    // "নিজে নিজে চলবে": After ad is finished, automatically advance to next 1-minute video!
    if (autoNext) {
      handleNextVideo();
    }
  };

  const handleAdSkipped = () => {
    setShowAd(false);
    showToast('⚠️ বিজ্ঞাপন স্কিপ হয়েছে, পরবর্তী ভিডিও চালু হচ্ছে...', '', 'info');
    setIsPlaying(true);
    // "নিজে নিজে চলবে": After skipping ad, automatically advance to next video!
    if (autoNext) {
      handleNextVideo();
    }
  };

  const userCoins = user?.coins || 2185;
  const userTk = (userCoins * 0.015).toFixed(1);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden'
      }}
      className="relative w-full h-full bg-black text-white select-none overflow-hidden flex flex-col justify-between"
    >
      {/* ========================================================= */}
      {/* 🔝 TOP HEADER BAR */}
      {/* ========================================================= */}
      <div className="w-full bg-[#05070c]/95 backdrop-blur-md border-b border-white/10 px-3 py-2 z-40 shrink-0">
        
        {/* ROW 1: BRAND LOGO, EYE, MUTE, APP INSTALL, COINS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shadow-[0_0_12px_#10b981]">
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400 translate-x-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-black tracking-wide text-white font-['Outfit']">WATCH&EARN</span>
                <span className="text-[9px] font-black px-1 py-0.2 bg-emerald-500 text-slate-950 rounded">BD</span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="text-amber-400">★</span> ভিডিও দেখুন • প্রতিদিন আয় করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Eye toggle button (Clean screen) */}
            <button 
              onClick={() => {
                soundService.playLikePop();
                setShowUiOverlays(!showUiOverlays);
              }}
              className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-white/10 text-xs active:scale-95 transition"
              title="স্ক্রিন পরিষ্কার করুন"
            >
              {showUiOverlays ? <Eye className="w-3.5 h-3.5 text-slate-300" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* Speaker Mute/Unmute */}
            <button 
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                }
                setIsMuted(!isMuted);
                soundService.playLikePop();
              }}
              className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-white/10 text-xs active:scale-95 transition"
              title={isMuted ? 'সাউন্ড চালু করুন' : 'সাউন্ড বন্ধ করুন'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Install App Button */}
            <button 
              onClick={() => {
                soundService.playLikePop();
                setShowPwaBanner(true);
                showToast('📱 অ্যাপ ইনস্টল ব্যানার', 'হোম স্ক্রিনে যুক্ত করে দ্রুত ব্যবহার করুন', 'info');
              }}
              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-[10px] font-black flex items-center gap-1 active:scale-95 transition"
            >
              <Download className="w-3 h-3" />
              <span>অ্যাপ</span>
            </button>

            {/* Coin Balance Badge */}
            <div 
              onClick={() => {
                soundService.playLikePop();
                setActiveTab('wallet');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 cursor-pointer hover:bg-amber-500/30 active:scale-95 transition"
              title="ওয়ালেটে যান"
            >
              <span className="text-xs">🪙</span>
              <div className="text-right">
                <span className="text-[11px] font-black text-amber-400 font-mono block leading-none">
                  {userCoins.toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-400 block leading-none mt-0.5">
                  ≈ ৳{userTk}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: TABS & CONTROLS */}
        <div className="flex items-center justify-between gap-1.5 mt-2">
          {/* Watch Status Capsule: "নিজে নিজে চলবে" & "১ মিনিট ভিডিও পর ১৫ সেকেন্ডের অ্যাড" */}
          <div 
            onClick={() => {
              setAdEveryVideo(!adEveryVideo);
              soundService.playLikePop();
              showToast(
                !adEveryVideo ? '✅ প্রতি ১ মিনিট ভিডিও পর ১৫ সেকেন্ড বিজ্ঞাপন চালু' : 'ℹ️ সাধারণ মোড সক্রিয়',
                'নিজে নিজে পরবর্তী ভিডিও চলবে',
                'info'
              );
            }}
            className="px-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[9px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
            title="ক্লিক করে অ্যাড ফ্রিকোয়েন্সি পরিবর্তন করুন"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>🔄 অটোপ্লে: ১ মি ভিডিও ➔ ১৫ সে অ্যাড (+কয়েন)</span>
          </div>

          {/* Mode Switcher: [▶️ শর্টস ফিড] & [📱 অ্যাপ টাস্ক (অ্যালার্ম সহ)] */}
          <div className="flex items-center bg-black/80 p-0.5 rounded-full border border-white/15 shrink-0">
            <button
              onClick={() => {
                soundService.playLikePop();
                setWatchMode('shorts');
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition flex items-center gap-1 cursor-pointer ${
                watchMode === 'shorts'
                  ? 'bg-red-600 text-white shadow-[0_0_12px_#ef4444]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>শর্টস ফিড</span>
            </button>

            <button
              onClick={() => {
                soundService.playLikePop();
                setWatchMode('app_task');
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition flex items-center gap-1 cursor-pointer ${
                watchMode === 'app_task'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_#f59e0b]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-2.5 h-2.5" />
              <span>অ্যাপ টাস্ক</span>
            </button>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={() => {
              soundService.playLikePop();
              setActiveTab('wallet');
            }}
            className="px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] shadow-md flex items-center gap-1 shrink-0 active:scale-95 transition cursor-pointer"
          >
            <Wallet className="w-3 h-3" />
            <span>টাকা তুলুন</span>
          </button>
        </div>

        {/* ROW 2.5: LIVE 1-MINUTE VIDEO WATCH & 15-SECOND AD TIMER PROGRESS BAR */}
        {watchMode === 'shorts' && (
          <div className="mt-2 px-0.5">
            <div className="w-full bg-slate-900/90 rounded-full h-5 border border-emerald-500/40 overflow-hidden relative flex items-center px-2.5 shadow-inner">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((watchSeconds / targetWatchSeconds) * 100))}%` }}
              />
              <div className="relative z-10 w-full flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-white drop-shadow">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>
                    ⏱️ {Math.max(0, targetWatchSeconds - watchSeconds) > 0 
                      ? `${Math.floor(Math.max(0, targetWatchSeconds - watchSeconds) / 60) > 0 ? `${Math.floor(Math.max(0, targetWatchSeconds - watchSeconds) / 60)} মি ` : ''}${Math.max(0, targetWatchSeconds - watchSeconds) % 60} সে পর ১৫ সে অ্যাড আসবে` 
                      : '১৫ সেকেন্ডের বিজ্ঞাপন চালু হচ্ছে...'}
                  </span>
                </span>
                <span className="text-amber-300 font-mono font-black drop-shadow">
                  {Math.min(100, Math.round((watchSeconds / targetWatchSeconds) * 100))}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ROW 3: CATEGORY PILLS (কমেডি নাটক, টিকটক ড্যান্স, খেলাধুলা, ইত্যাদি) */}
        {watchMode === 'shorts' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 mt-1 border-t border-white/5">
            {[
              { id: 'all', label: '🔥 দৈনিক ২০০+ ভিডিও' },
              { id: 'dailymotion', label: '🎥 ডেইলিমোশন (৫০% রেভিনিউ)' },
              { id: 'comedy', label: '😂 কমেডি নাটক' },
              { id: 'dance', label: '💃 টিকটক ড্যান্স' },
              { id: 'sports', label: '🏏 ক্রিকেট ও স্পোর্টস' },
              { id: 'pets', label: '🐱 ফানি প্রাণী' },
              { id: 'music', label: '🎵 গান ও কনসার্ট' },
              { id: 'magic', label: '✨ ম্যাজিক' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  soundService.playLikePop();
                  setActiveCategory(cat.id);
                  setCurrentIndex(0);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white text-black font-black shadow'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 📱 VIEW 1: APP TASK (DIRECT TIKTOK / YOUTUBE WITH TIMER & ALARM) */}
      {/* ========================================================= */}
      {watchMode === 'app_task' ? (
        <div className="flex-1 w-full flex flex-col items-center justify-start px-3 py-3 overflow-y-auto space-y-4">
          
          {/* Main App Task Card */}
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0e1626] to-[#070b14] border border-rose-600/30 p-5 shadow-2xl text-center space-y-4 relative overflow-hidden">
            
            {/* Top Icon Badge */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-[0_0_25px_#f43f5e]">
              <Youtube className="w-8 h-8 fill-white text-white" />
            </div>

            <div>
              <h2 className="text-base font-black text-white">
                ইউটিউব বা টিকটক অ্যাপে ভিডিও দেখুন
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                অ্যাপে গিয়ে ভিডিও উপভোগ করুন। নির্বাচিত সময় শেষ হলে আপনার ফোনে <strong className="text-amber-400">মেসেজ ও অ্যালার্ম বাজবে</strong> এবং স্পন্সর বিজ্ঞাপন দেখে কয়েন পেয়ে যাবেন!
              </p>
            </div>

            {/* Duration Selector: ৩০ সে, ১ মি, ২ মি, ৪ মি */}
            <div className="space-y-1.5 text-left">
              <span className="text-[11px] font-bold text-slate-300">ভিডিও দেখার সময় নির্বাচন করুন:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { sec: 30, label: '৩০ সেকেন্ড', bonus: '+১৫' },
                  { sec: 60, label: '১ মিনিট', bonus: '+২৫', tag: 'সেরা' },
                  { sec: 120, label: '২ মিনিট', bonus: '+৫০' },
                  { sec: 240, label: '৪ মিনিট', bonus: '+১০০', tag: 'মেগা' }
                ].map(item => (
                  <button
                    key={item.sec}
                    onClick={() => {
                      soundService.playLikePop();
                      setExternalAppDuration(item.sec);
                    }}
                    className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer relative ${
                      externalAppDuration === item.sec
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-[0_0_12px_#f59e0b]'
                        : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {item.tag && (
                      <span className="absolute -top-1.5 right-1 px-1 text-[8px] font-black bg-rose-600 text-white rounded">
                        {item.tag}
                      </span>
                    )}
                    <div className="text-[10px] leading-tight font-black">{item.label}</div>
                    <div className="text-[9px] text-amber-300 font-bold mt-0.5">{item.bonus} কয়েন</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Topics to Watch on YouTube / TikTok */}
            <div className="space-y-2 text-left pt-1">
              <span className="text-[11px] font-bold text-slate-300">কোন ধরনের ভিডিও দেখতে চান?</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: '😂 কমেডি নাটক', query: 'bangla comedy natok funny shorts' },
                  { name: '💃 টিকটক ড্যান্স', query: 'viral bangla tiktok dance reels' },
                  { name: '🏏 ক্রিকেট হাইলাইটস', query: 'bangladesh cricket thrilling sixes' },
                  { name: '🎵 নতুন বাংলা গান', query: 'trending bangla romantic song shorts' }
                ].map(topic => (
                  <button
                    key={topic.name}
                    onClick={() => handleOpenExternalAppWithTopic('youtube', topic.query)}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400 text-left transition flex items-center justify-between group active:scale-95 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">{topic.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* 🌟 OWNER MONETIZED YOUTUBE CHANNEL / VIDEO BUTTON */}
              <button
                onClick={() => {
                  const ownerChannelUrl = settings?.adsConfig?.sponsorChannelUrl || 'https://www.youtube.com';
                  handleOpenExternalAppWithTopic('youtube', 'মালিকের ইউটিউব ভিডিও');
                  window.open(ownerChannelUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-[0_0_20px_#f59e0b] flex items-center justify-between active:scale-95 transition cursor-pointer border-2 border-white/60"
              >
                <div className="flex items-center gap-2 text-left">
                  <Youtube className="w-5 h-5 fill-red-600 text-red-600 shrink-0" />
                  <div>
                    <span className="block text-xs font-black">🌟 মালিকের ইউটিউব ভিডিও দেখুন ({externalAppDuration} সে)</span>
                    <span className="text-[10px] text-slate-900 font-bold block">সময় শেষ হলে মেসেজ ও অ্যালার্ম বাজবে এবং বোনাস পাবেন</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-950 shrink-0" />
              </button>

              <button
                onClick={() => handleOpenExternalAppWithTopic('youtube', 'bangla viral comedy shorts')}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 text-white font-black text-xs shadow-[0_0_15px_#ef4444] flex items-center justify-between active:scale-95 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 fill-white" />
                  <span>অন্যান্য ট্রেন্ডিং ইউটিউব ভিডিও ({externalAppDuration} সে)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </button>

              <button
                onClick={() => handleOpenExternalAppWithTopic('tiktok', 'banglafunny')}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 text-white font-black text-xs shadow-md flex items-center justify-between active:scale-95 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>টিকটক ওপেন করুন ({externalAppDuration} সে)</span>
                </div>
                <ExternalLink className="w-4 h-4 text-white/80" />
              </button>
            </div>

            {/* Live Active Countdown Status if external watch is active */}
            {isExternalWatchActive && (
              <div className="p-3 rounded-2xl bg-black/80 border border-amber-400/50 flex items-center justify-between text-xs animate-pulse">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-[11px] font-bold text-white block">টাইমার চলছে (ব্যাকগ্রাউন্ডে):</span>
                    <span className="text-xs text-amber-300 font-mono font-black">
                      বাকি সময়: {externalWatchRemaining} সেকেন্ড
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => triggerExternalAlarm()}
                  className="px-2 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg"
                >
                  টেস্ট অ্যালার্ম
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 🎬 VIEW 2: SHORTS FEED (নিজে নিজে চলবে ও ১ পর পর অ্যাড আসবে) */
        /* ========================================================= */
        <div className="relative flex-1 w-full h-full overflow-hidden">
          
          {/* Main Video View Container */}
          <div 
            onClick={handleVideoTap}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden cursor-pointer"
          >
            {isDailymotionVideo && effectiveDailymotionId ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-black pointer-events-auto">
                <iframe
                  key={`dm_${currentVideo.id}_${effectiveDailymotionId}`}
                  src={
                    settings?.adsConfig?.dailymotionPlayerId
                      ? `https://geo.dailymotion.com/player/${settings.adsConfig.dailymotionPlayerId}.html?video=${effectiveDailymotionId}&autoplay=1&mute=${isMuted ? 1 : 0}`
                      : `https://www.dailymotion.com/embed/video/${effectiveDailymotionId}?autoplay=1&mute=${isMuted ? 1 : 0}&ui-logo=0&sharing-enable=0&queue-enable=0`
                  }
                  title={currentVideo.title}
                  className="w-full h-full max-h-[82vh] aspect-[9/16] object-cover rounded-none border-0 shadow-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                
                {/* 🛡️ Dailymotion Fallback / Direct Watch Button in case Dailymotion returns 'Forbidden' due to country/uploader restrictions */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.dailymotion.com/video/${effectiveDailymotionId}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3 py-1 rounded-full bg-black/80 hover:bg-black border border-amber-400/60 text-amber-300 text-[10px] font-black shadow-lg flex items-center gap-1.5 backdrop-blur-md active:scale-95 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                    <span>Dailymotion এ দেখুন</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextVideo();
                    }}
                    className="px-3 py-1 rounded-full bg-rose-600/90 hover:bg-rose-500 border border-white/30 text-white text-[10px] font-black shadow-lg flex items-center gap-1 active:scale-95 transition cursor-pointer"
                  >
                    <span>পরবর্তী ভিডিও ⬇️</span>
                  </button>
                </div>
              </div>
            ) : isYouTubeVideo && effectiveYouTubeId ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-black pointer-events-auto">
                <iframe
                  key={`yt_${currentVideo.id}_${effectiveYouTubeId}`}
                  src={`https://www.youtube.com/embed/${effectiveYouTubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&enablejsapi=1&controls=1&rel=0&modestbranding=1&loop=1&playlist=${effectiveYouTubeId}`}
                  title={currentVideo.title}
                  className="w-full h-full max-h-[82vh] aspect-[9/16] object-cover rounded-none border-0 shadow-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                
                {/* 🛡️ Direct Watch Button for YouTube */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.youtube.com/shorts/${effectiveYouTubeId}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3 py-1 rounded-full bg-black/80 hover:bg-black border border-red-500/60 text-white text-[10px] font-black shadow-lg flex items-center gap-1.5 backdrop-blur-md active:scale-95 transition cursor-pointer"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
                    <span>ইউটিউবে অপশন</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextVideo();
                    }}
                    className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 border border-white/30 text-white text-[10px] font-black shadow-lg flex items-center gap-1 active:scale-95 transition cursor-pointer"
                  >
                    <span>পরবর্তী ভিডিও ⬇️</span>
                  </button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                key={`vid_${currentVideo.id}`}
                src={currentVideo.videoUrl}
                poster={currentVideo.thumbnailUrl}
                loop={!autoNext}
                playsInline
                autoPlay
                muted={isMuted}
                onClick={togglePlayPause}
                onEnded={() => {
                  // "১ পর পর অ্যাড আসবে নিজে নিজে চলবে"
                  if (adEveryVideo) {
                    startRewardedAd(20, 30, 'ভিডিও দেখা সম্পন্ন! স্পন্সর বিজ্ঞাপন');
                  } else if (autoNext) {
                    handleNextVideo();
                  }
                }}
                className="w-full h-full object-cover pointer-events-auto cursor-pointer"
              />
            )}

            {/* Play/Pause indicator overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 bg-black/30 backdrop-blur-[1px]">
                <div className="w-16 h-16 rounded-full bg-black/70 border-2 border-white/40 flex items-center justify-center text-white shadow-2xl animate-in zoom-in">
                  <Play className="w-8 h-8 fill-white translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Heart Burst on Double Tap */}
            {showHeartBurst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-out duration-700">
                <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_35px_#f43f5e] animate-bounce" />
              </div>
            )}

            {/* Floating Instant Coin Reward Flyup */}
            {floatingCoinReward.show && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in zoom-in slide-out-to-top duration-700">
                <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-[0_0_25px_#f59e0b] flex items-center gap-2 border-2 border-white">
                  <Coins className="w-5 h-5 text-amber-900 animate-spin" />
                  <span>+{floatingCoinReward.coins} কয়েন জমা হয়েছে!</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Floating Action Controls */}
          {showUiOverlays && (
            <div className="absolute right-2.5 bottom-24 z-40 flex flex-col items-center gap-3 pointer-events-auto">
              
              {/* 1. UP CHEVRON (PREVIOUS VIDEO) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevVideo();
                }}
                className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition active:scale-90 shadow-lg"
                title="পূর্ববর্তী ভিডিও"
              >
                <ChevronUp className="w-6 h-6 text-slate-200" />
              </button>

              {/* 2. LIKE BUTTON WITH 'লাইক' LABEL */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className="flex flex-col items-center gap-0.5 group active:scale-125 transition"
              >
                <div className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition ${
                  likedMap[currentVideo.id] 
                    ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_#f43f5e]' 
                    : 'bg-black/60 text-white border-white/20 hover:bg-black'
                }`}>
                  <Heart className={`w-5 h-5 ${likedMap[currentVideo.id] ? 'fill-white text-white' : 'text-white'}`} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow">লাইক</span>
              </button>

              {/* 3. SHARE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundService.playLikePop();
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({
                      title: 'Watch & Earn BD',
                      text: `ভিডিও দেখে এবং কয়েন জমিয়ে টাকা তুলুন!`,
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('🔗 ভিডিও ও অ্যাপ লিংক কপি হয়েছে!', '', 'success');
                  }
                }}
                className="flex flex-col items-center gap-0.5 group active:scale-110 transition"
              >
                <div className="w-11 h-11 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow">শেয়ার</span>
              </button>

              {/* 4. DOWN CHEVRON (NEXT VIDEO) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextVideo();
                }}
                className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition active:scale-90 shadow-lg"
                title="পরবর্তী ভিডিও"
              >
                <ChevronDown className="w-6 h-6 text-slate-200" />
              </button>
            </div>
          )}

          {/* Bottom Video Meta & Big Yellow Ad Button */}
          {showUiOverlays && (
            <div className="absolute bottom-2 left-3 right-3 z-40 space-y-2 pointer-events-auto">
              
              {/* Category Pill, Creator & Dynamic Title */}
              <div className="space-y-1 max-w-[78%]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentVideo.isOwnerSponsored && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[10px] font-black shadow flex items-center gap-1 border border-white">
                      <span>👑 ওনারের ভিডিও</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-black shadow inline-block">
                    {currentVideo.categoryLabelBn || '🔥 ট্রেন্ডিং'} • {Math.floor((currentVideo.likesCount || 100000) / 1000)}K Views
                  </span>
                </div>
                <h3 className="text-sm font-black text-white drop-shadow leading-tight">
                  {currentVideo.creatorName}
                </h3>
                <p className="text-xs text-slate-200 drop-shadow line-clamp-1">
                  {currentVideo.title}
                </p>
              </div>

              {/* Action Buttons Row: Big Ad Button + YouTube/TikTok Open Button */}
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundService.playLikePop();
                    startRewardedAd(15, currentRewardCoins, '১৫ সেকেন্ড স্পন্সর বিজ্ঞাপন');
                  }}
                  className="col-span-3 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-[0_0_20px_#f59e0b] flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
                  <span className="truncate">১৫ সে বিজ্ঞাপন দেখে +{currentRewardCoins} কয়েন</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundService.playLikePop();
                    setWatchMode('app_task');
                  }}
                  className="col-span-2 py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
                  title="ইউটিউব বা টিকটক অ্যাপে দেখুন"
                >
                  <Youtube className="w-4 h-4 fill-white shrink-0" />
                  <span className="truncate">অ্যাপে দেখুন ⏰</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📥 BOTTOM PWA INSTALL BANNER */}
      {/* ========================================================= */}
      {showPwaBanner && (
        <aside 
          aria-label="PWA Installation Banner"
          className="w-full px-3 py-2 z-40 bg-gradient-to-r from-[#07131e] via-[#081822] to-[#041c14] border-t border-emerald-500/40 flex items-center justify-between gap-2.5 shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <h4 className="text-xs font-black text-white font-['Outfit'] truncate">
                  WATCH & EARN BD
                </h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-300 truncate mt-0.5">
                হোম স্ক্রিন থেকে সহজে ভিডিও দেখুন ও দ্রুত কয়েন আয় করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                soundService.playLikePop();
                showToast('📱 অ্যাপ ইনস্টল করুন', 'ব্রাউজার মেনু থেকে Add to Home Screen চাপুন', 'info');
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ইনস্টল</span>
            </button>
            <button
              onClick={() => setShowPwaBanner(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* ========================================================= */}
      {/* 🚨 ALARM RINGING & AD REWARD MODAL ("অ্যালাম বাজবে অ্যাড আসবে") */}
      {/* ========================================================= */}
      {isAlarmActive && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-xs bg-gradient-to-b from-slate-900 to-black rounded-3xl p-6 border-2 border-amber-400 shadow-[0_0_50px_#f59e0b] text-center space-y-4">
            
            {/* Blinking Ringing Bell */}
            <div className="w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <BellRing className="w-10 h-10 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/40 inline-block mb-1">
                ভিডিও সম্পন্ন!
              </span>
              <h3 className="text-lg font-black text-white">
                🎉 সময় শেষ! অ্যালার্ম বাজছে
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {alarmReason} স্পন্সর বিজ্ঞাপন দেখে এখনই <strong className="text-amber-400">+{alarmRewardCoins} কয়েন</strong> সংগ্রহ করুন!
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  soundService.stopPersistentAlarm();
                  setIsAlarmActive(false);
                  startRewardedAd(20, alarmRewardCoins, 'সময় সম্পন্ন স্পন্সর বিজ্ঞাপন');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>বিজ্ঞাপন দেখুন ও +{alarmRewardCoins} কয়েন নিন</span>
              </button>

              <button
                onClick={() => {
                  soundService.stopPersistentAlarm();
                  setIsAlarmActive(false);
                }}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                🔕 অ্যালার্ম বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📢 REWARDED VIDEO SPONSOR OVERLAY */}
      {/* ========================================================= */}
      {showAd && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden border-2 border-amber-500/60 shadow-2xl flex flex-col justify-center">
            <AdInterstitial
              adNumber={adCycleCount}
              durationSeconds={activeAdDuration || 20}
              rewardCoins={activeAdCoins || currentRewardCoins || 50}
              title={selectedAdTitle}
              onAdCompleted={handleAdFinished}
              onAdSkipped={handleAdSkipped}
            />
          </div>
        </div>
      )}
    </div>
  );
};
