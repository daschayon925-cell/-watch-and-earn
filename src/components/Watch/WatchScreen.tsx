import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Coins, 
  Sparkles, 
  Gift, 
  Wallet, 
  Volume2, 
  VolumeX, 
  Zap, 
  ArrowRight, 
  Flame, 
  Heart, 
  ExternalLink, 
  Clock, 
  BellRing, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  Smartphone, 
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Youtube,
  Share2,
  MessageCircle,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { AdInterstitial } from '../Feed/AdInterstitial';
import { MiniBannerAd } from '../Common/MiniBannerAd';
import { getDailyYouTubeShorts, YouTubeReelItem } from '../../services/youtubeReelsService';
import { sanitizeAdDirectLink } from '../../utils/adLinkSanitizer';

export const WatchScreen: React.FC = () => {
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { setActiveTab, language, showToast, triggerConfetti, settings } = useApp();

  // Dynamic reward coins based on admin settings (syncs with videoReward and rewardedAdBonus)
  const currentRewardCoins = settings?.videoReward ?? settings?.rewardedAdBonus ?? 25;

  // 🔄 Daily Auto-Rotating YouTube Feed (250 Real YouTube Videos per day, automatically replaced at midnight)
  const [dailyReels, setDailyReels] = useState<YouTubeReelItem[]>(() => getDailyYouTubeShorts(250));

  // Mode Selection: 'feed' (In-App YouTube Reels) vs 'app_task' (Open YouTube App)
  const [viewMode, setViewMode] = useState<'feed' | 'app_task'>('feed');

  // Video State
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Cycle Configuration: Default 60s (1 min) or fast 15s test mode for rapid coin earnings
  const [targetWatchSeconds, setTargetWatchSeconds] = useState<number>(60);
  const [watchSeconds, setWatchSeconds] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);

  // 🔒 HARD LOCK STATE: When 4 minutes complete, video FREEZES until user completes Ad!
  const [isVideoLocked, setIsVideoLocked] = useState<boolean>(false);
  const pausedVideoTimeRef = useRef<number>(0);

  // 🔔 Video Start Message Banner (ভিডিও শুরুতে মেসেজ)
  const [showStartMessage, setShowStartMessage] = useState<boolean>(true);

  // Auto-hide start banner after 6 seconds & trigger sound & notification on video start
  useEffect(() => {
    // 🔊 Play pleasant welcome chime when video starts
    try {
      soundService.playLikePop();
    } catch (e) {}

    // 📩 Send push notification on video start
    const triggerStartPush = async () => {
      if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }
      const title = '🎬 ভিডিও চালু হয়েছে!';
      const opts = {
        body: 'আপনার ভিডিও দেখার সময় গণনা শুরু হয়েছে। নির্ধারিত সময় শেষ হলে আপনাকে রিমাইন্ডার দেওয়া হবে।',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        tag: 'watch-video-start'
      };
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification && Notification.permission === 'granted') {
            await reg.showNotification(title, opts);
            return;
          }
        }
      } catch (e) {}
      try { new Notification(title, opts); } catch (e) {}
    };
    triggerStartPush();

    const timer = setTimeout(() => {
      setShowStartMessage(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // 📱 External App Floating Bubble State
  const [appTaskRunning, setAppTaskRunning] = useState<boolean>(false);
  const [appTaskPlatform, setAppTaskPlatform] = useState<'tiktok' | 'youtube'>('tiktok');
  const [showFloatingPip, setShowFloatingPip] = useState<boolean>(false);

  // 📢 Ad State (45 Seconds)
  const [showAd, setShowAd] = useState<boolean>(false);
  const [adCycleCount, setAdCycleCount] = useState<number>(1);
  const [totalEarnedSession, setTotalEarnedSession] = useState<number>(0);

  // ⏱️ 2-3 Hour Interval between Sponsored Ads
  const sponsorIntervalMinutes = settings?.sponsorAdIntervalMinutes || 150;
  const sponsorIntervalMs = sponsorIntervalMinutes * 60 * 1000;
  const [sponsorCooldownSeconds, setSponsorCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    const checkCooldown = () => {
      if (!user?.lastSponsoredAdTimestamp) {
        setSponsorCooldownSeconds(0);
        return;
      }
      const lastTime = new Date(user.lastSponsoredAdTimestamp).getTime();
      const elapsed = Date.now() - lastTime;
      if (elapsed < sponsorIntervalMs) {
        setSponsorCooldownSeconds(Math.ceil((sponsorIntervalMs - elapsed) / 1000));
      } else {
        setSponsorCooldownSeconds(0);
      }
    };
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [user?.lastSponsoredAdTimestamp, sponsorIntervalMs]);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentReel = dailyReels[currentReelIndex] || dailyReels[0];

  // =========================================================
  // ⏱️ WALL-CLOCK ACCURATE WATCH TIMER
  // =========================================================
  useEffect(() => {
    // Listen for tab focus/visibility when user returns from TikTok/YouTube
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User came back to the website!
        if (isVideoLocked) {
          soundService.stopPersistentAlarm();
          setShowAd(true);
        }
      }
    };

    // Listen for Service Worker message if user clicked notification
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AUTO_OPEN_REWARD_AD') {
        soundService.stopPersistentAlarm();
        setIsVideoLocked(true);
        setShowAd(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
      soundService.stopPersistentAlarm();
    };
  }, [isVideoLocked]);

  useEffect(() => {
    // If video is locked, ad is showing, or user paused -> do NOT increment
    if (isVideoLocked || showAd) {
      startTimeRef.current = null;
      return;
    }

    const isActive = (viewMode === 'feed' && isPlaying) || (viewMode === 'app_task' && appTaskRunning);

    if (!isActive) {
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

      // 🛑 TIME REACHED (4 MINUTES OR 30s TEST):
      // 1. FREEZE VIDEO IMMEDIATELY
      // 2. AUTO POPUP AD DIRECTLY (No click needed)
      // 3. SOUND ALARM & VIBRATE & MOBILE NOTIFICATION
      if (elapsed >= targetWatchSeconds) {
        clearInterval(interval);
        startTimeRef.current = null;
        triggerVideoLockdown();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [viewMode, isPlaying, appTaskRunning, showAd, isVideoLocked, targetWatchSeconds]);

  // 🔒 Lock the video & stop playback until Ad is viewed
  const triggerVideoLockdown = () => {
    // If sponsor ad is still on 2-3 hour cooldown, do not lock user out of video reels
    if (sponsorCooldownSeconds > 0) {
      setWatchSeconds(0);
      startTimeRef.current = Date.now();
      return;
    }

    setIsVideoLocked(true);
    setIsPlaying(false);
    setShowAd(true);

    // Save exact position where video stopped
    if (videoRef.current) {
      pausedVideoTimeRef.current = videoRef.current.currentTime || 0;
      videoRef.current.pause();
    }

    // Play loud alert beep + success fanfare + continuous persistent alarm
    soundService.ensureUnlocked();
    soundService.startPersistentAlarm();
    soundService.playSuccessFanfare();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { 
        navigator.vibrate([500, 200, 500, 200, 500, 200, 1000]); 
      } catch (e) {}
    }

    // 📩 MOBILE PUSH NOTIFICATION (হুবহু ইউজারের চাওয়া মেসেজ গুগল ও অ্যাডসেন্স পলিসি অনুযায়ী)
    const sendNotification = async () => {
      // If notification permission is default, ask for it immediately
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {}
      }

      if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      const notifTitle = `🚨 সময় শেষ! ${currentRewardCoins} কয়েন যোগ করুন`;
      const notifOptions = {
        body: `আপনার ৪ মিনিট দেখা শেষ হয়েছে। ওয়ালেটে টাকা বা কয়েন যোগ করতে এখনই এখানে ট্যাপ করুন! নাহলে রিওয়ার্ড বাতিল হতে পারে।`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        tag: 'watch-timer-reward',
        requireInteraction: true,
        vibrate: [500, 200, 500, 200, 1000]
      };

      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification && Notification.permission === 'granted') {
            await reg.showNotification(notifTitle, notifOptions as any);
            return;
          }
        }
      } catch (err) {}

      try {
        const notif = new Notification(notifTitle, notifOptions);
        notif.onclick = () => {
          window.focus();
          soundService.stopPersistentAlarm();
          setShowAd(true);
          notif.close();
        };
      } catch (e) {}
    };
    sendNotification();

    // If user is on phone / backgrounded, change document title to alert them!
    try {
      document.title = '🚨 সময় শেষ! ওয়ালেটে টাকা বা কয়েন যোগ করতে এখনই ট্যাপ করুন';
    } catch (e) {}

    showToast(
      language === 'bn' 
        ? '🚨 সময় শেষ! আপনার ৪ মিনিট দেখা শেষ হয়েছে। ওয়ালেটে টাকা/কয়েন নিতে এখনই ট্যাপ করুন!' 
        : '🚨 Time up! 4 minutes complete. Tap now to claim coins!',
      language === 'bn' ? 'অ্যাড দেখার পর ঠিক এই মুহূর্ত থেকেই ভিডিও আবার চালু হবে।' : 'Video will resume from this exact second after ad.',
      'info'
    );
  };

  // ---------------------------------------------------------
  // 📱 OPTION 2: OPEN TIKTOK / YOUTUBE WITH NOTIFICATION PERMISSION
  // ---------------------------------------------------------
  const startExternalAppTask = async (platform: 'tiktok' | 'youtube') => {
    // Unmute & unlock web audio engine so background alarm will play!
    soundService.ensureUnlocked();
    soundService.stopPersistentAlarm();

    // Request push notification permission first so phone gets notification popup!
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (e) {}
    }

    // 📢 শুরুর প্রথম মেসেজ (ইউজারের চাওয়া অনুযায়ী)
    const sendStartNotif = async () => {
      if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      const title = '🎬 ভিডিও দেখা শুরু হয়েছে!';
      const opts = {
        body: 'আপনার ভিডিও দেখার সময় শুরু হয়েছে। নির্ধারিত সময় শেষ হলে আপনাকে রিমাইন্ডার দেওয়া হবে।',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        tag: 'watch-start-notif'
      };
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification && Notification.permission === 'granted') {
            await reg.showNotification(title, opts);
            return;
          }
        }
      } catch (e) {}
      try { new Notification(title, opts); } catch (e) {}
    };
    sendStartNotif();

    setAppTaskPlatform(platform);
    setAppTaskRunning(true);
    setIsVideoLocked(false);
    setShowFloatingPip(true);
    setWatchSeconds(0);
    startTimeRef.current = Date.now();

    showToast(
      platform === 'tiktok' 
        ? '🎬 আপনার ভিডিও দেখার সময় শুরু হচ্ছে! টিকটক ওপেন হচ্ছে...' 
        : '🎬 আপনার ভিডিও দেখার সময় শুরু হচ্ছে! ইউটিউব ওপেন হচ্ছে...',
      'সময় শেষ হওয়া মাত্রই ফোনে অ্যালার্ম ও মেসেজ আসবে।',
      'info'
    );

    const targetUrl = platform === 'tiktok' 
      ? 'https://www.tiktok.com' 
      : 'https://www.youtube.com/shorts';

    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Could not open popup', e);
    }
  };

  // ---------------------------------------------------------
  // 🔓 WHEN 25s AD FINISHES -> VERIFY ON SERVER -> RESUME EXACTLY WHERE IT STOPPED
  // ---------------------------------------------------------
  const handleAdFinished = async (adSessionId?: string) => {
    soundService.stopPersistentAlarm();
    setShowAd(false);
    setIsVideoLocked(false);
    setWatchSeconds(0);
    startTimeRef.current = null;

    try {
      const res = await api.claimRewardedAd('reel_auto_loop', adSessionId);
      if (res && res.success && res.earnedCoins) {
        setTotalEarnedSession(prev => prev + res.earnedCoins);
        awardCoinsLocally(res.earnedCoins);
        soundService.playCoinReward();
        triggerConfetti();
        showToast(
          language === 'bn' 
            ? `🎉 দারুণ! +${res.earnedCoins} কয়েন বিকাশ/নগদ ওয়ালেটে জমা হয়েছে!` 
            : `🎉 Success! +${res.earnedCoins} coins added to your wallet!`,
          language === 'bn' ? 'ভিডিও যেখানে থেমেছিল ঠিক সেখান থেকেই নিজে নিজে চালু হয়েছে।' : 'Video resumed from exact point.',
          'coin'
        );
        await refreshUser();
      } else {
        // 🛡️ Resilient fallback: ensure user ALWAYS gets rewarded for their time!
        const fallbackRes = await api.claimInstantAdBonus('রিল ভিডিও ওয়াচ রিওয়ার্ড', currentRewardCoins);
        if (fallbackRes && fallbackRes.success && fallbackRes.earnedCoins) {
          setTotalEarnedSession(prev => prev + fallbackRes.earnedCoins);
          awardCoinsLocally(fallbackRes.earnedCoins);
          soundService.playCoinReward();
          triggerConfetti();
          showToast(
            language === 'bn' 
              ? `🎉 দারুণ! +${fallbackRes.earnedCoins} কয়েন ওয়ালেটে যুক্ত হয়েছে!` 
              : `🎉 Success! +${fallbackRes.earnedCoins} coins added to your wallet!`,
            language === 'bn' ? 'ভিডিও আবার চালু হয়েছে।' : 'Video resumed.',
            'coin'
          );
          await refreshUser();
        } else {
          showToast(
            res?.message || (language === 'bn' ? '⚠️ আজকের ভিডিও দেখার দৈনিক সীমা পূর্ণ হয়েছে।' : 'Daily reward limit reached.'),
            '',
            'error'
          );
        }
      }
    } catch (e) {
      console.error('Ad reward sync error', e);
      try {
        const fallbackRes = await api.claimInstantAdBonus('রিল ভিডিও ব্যাকআপ রিওয়ার্ড', currentRewardCoins);
        if (fallbackRes && fallbackRes.success) {
          awardCoinsLocally(currentRewardCoins);
          soundService.playCoinReward();
          await refreshUser();
        }
      } catch {}
    }

    // Resume video playback EXACTLY at the timestamp where it paused!
    setAdCycleCount(prev => prev + 1);
    setIsPlaying(true);
    if (videoRef.current) {
      if (pausedVideoTimeRef.current > 0) {
        videoRef.current.currentTime = pausedVideoTimeRef.current;
      }
      videoRef.current.play().catch(() => {});
    }

    if (viewMode === 'app_task') {
      setAppTaskRunning(false);
      setShowFloatingPip(false);
    }
  };

  const handleAdSkipped = () => {
    soundService.stopPersistentAlarm();
    setShowAd(false);
    setIsVideoLocked(false);
    showToast(
      language === 'bn' ? '⚠️ বিজ্ঞাপন স্কিপ করা হয়েছে, কোনো কয়েন যোগ করা হয়নি।' : 'Ad skipped. No coins earned.',
      '',
      'error'
    );
    setIsPlaying(true);
    if (videoRef.current) {
      if (pausedVideoTimeRef.current > 0) {
        videoRef.current.currentTime = pausedVideoTimeRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  };

  // Feed Navigation
  const handleNextReel = () => {
    if (isVideoLocked) {
      showToast('⚠️ ভিডিও লক রয়েছে! অ্যাড দেখা শেষ করুন।', '', 'error');
      return;
    }
    soundService.playLikePop();
    setCurrentReelIndex(prev => (prev + 1) % dailyReels.length);
    setIsPlaying(true);
  };

  const handlePrevReel = () => {
    if (isVideoLocked) {
      showToast('⚠️ ভিডিও লক রয়েছে! অ্যাড দেখা শেষ করুন।', '', 'error');
      return;
    }
    soundService.playLikePop();
    setCurrentReelIndex(prev => (prev - 1 + dailyReels.length) % dailyReels.length);
    setIsPlaying(true);
  };

  // 📱 Mobile Touch Swipe Handling (Swipe up for next reel, swipe down for prev)
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    touchStartY.current = null;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped UP -> Next video
        handleNextReel();
      } else {
        // Swiped DOWN -> Previous video
        handlePrevReel();
      }
    }
  };

  const togglePlay = () => {
    if (isVideoLocked) {
      // Prompt user to watch Ad to unlock
      setShowAd(true);
      return;
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const progressPercentage = Math.min(100, Math.round((watchSeconds / targetWatchSeconds) * 100));
  const remainingSeconds = Math.max(0, targetWatchSeconds - watchSeconds);

  const formatMinSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-black text-white h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden select-none">
      
      {/* 🟢 TOP FLOATING BAR: COMPACT & PRO-LEVEL */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/60 to-transparent px-3 pt-2 pb-4 backdrop-blur-[2px]">
        <div className="flex items-center justify-between mb-1.5">
          {/* User Balance */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-black text-amber-300 font-mono">
              {user?.coins || 0} কয়েন
            </span>
          </div>

          {/* Dual Mode Switcher & Quick Ad Test */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setTargetWatchSeconds(prev => prev === 60 ? 15 : prev === 15 ? 120 : 60);
                setWatchSeconds(0);
                showToast(
                  targetWatchSeconds === 60 
                    ? '⚡ ১৫ সেকেন্ড সুপার ফাস্ট রিওয়ার্ড সক্রিয়!' 
                    : targetWatchSeconds === 15 
                      ? '⏱️ ২ মিনিট স্ট্যান্ডার্ড রিওয়ার্ড সক্রিয়' 
                      : '⏱️ ১ মিনিট রেগুলার রিওয়ার্ড সক্রিয়', 
                  '', 
                  'info'
                );
              }}
              className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition ${
                targetWatchSeconds === 15
                  ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                  : 'bg-black/60 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {targetWatchSeconds === 15 ? '⚡ ফাস্ট (15s)' : targetWatchSeconds === 60 ? '⏱️ ১ মিনিট' : '⏱️ ২ মিনিট'}
            </button>

            <div className="flex items-center bg-black/70 p-0.5 rounded-full border border-white/15 backdrop-blur-md">
              <button
                onClick={() => {
                  setViewMode('feed');
                  setIsVideoLocked(false);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition flex items-center gap-1 ${
                  viewMode === 'feed'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-white" />
                <span>শর্টস ফিড</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('app_task');
                  setIsVideoLocked(false);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition flex items-center gap-1 ${
                  viewMode === 'app_task'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>অ্যাপ টাস্ক</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('wallet')}
            className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow flex items-center gap-1 active:scale-95 transition"
          >
            <Wallet className="w-3 h-3" />
            <span>টাকা তুলুন</span>
          </button>
        </div>

        {/* ⏱️ AUTO PROGRESS & DURATION SELECTOR */}
        <div className="px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isVideoLocked ? (
              <Lock className="w-3.5 h-3.5 text-red-500 shrink-0 animate-bounce" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-200">
                {isVideoLocked ? (
                  <span className="text-red-400 font-black animate-pulse">🔒 ৪ মিনিট শেষ! অ্যাড দেখতে ট্যাপ করুন</span>
                ) : (
                  <span>⏱️ {formatMinSec(remainingSeconds)} পর বিজ্ঞাপন আসবে</span>
                )}
                <span className="text-amber-400 font-mono font-black">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isVideoLocked 
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' 
                      : 'bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_8px_#eab308]'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🎬 MODE 1: FULL-SCREEN YOUTUBE SHORTS VIEWER (TIKTOK STYLE) */}
      {/* ========================================================= */}
      {viewMode === 'feed' && (
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group touch-pan-y"
        >
          {/* Edge-to-Edge Real YouTube Player */}
          {!isVideoLocked ? (
            <iframe
              key={currentReel.youtubeId}
              src={`https://www.youtube.com/embed/${currentReel.youtubeId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${currentReel.youtubeId}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
              title={currentReel.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full object-cover border-0"
            />
          ) : (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-16 h-16 text-red-500 animate-bounce mb-3" />
              <p className="text-white font-black text-sm">ইউটিউব ভিডিও দেখা সাময়িকভাবে লক হয়েছে!</p>
            </div>
          )}

          {/* 🛑 HARD LOCK OVERLAY */}
          {isVideoLocked && (
            <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center space-y-3 animate-in fade-in zoom-in">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-bounce">
                <Lock className="w-8 h-8 text-red-500" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">
                  সময় শেষ! ৫০ সেকেন্ড বিজ্ঞাপন দেখুন
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                  আপনার নির্ধারিত সময় পূর্ণ হয়েছে। ৩টি স্পন্সর বিজ্ঞাপন সমাপ্ত হলে ওয়ালেটে <strong className="text-amber-400">+{currentRewardCoins} কয়েন</strong> জমা হবে এবং ভিডিও আবার চালু হবে।
                </p>
              </div>

              <button
                onClick={() => setShowAd(true)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition animate-pulse"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>বিজ্ঞাপন দেখুন ও কয়েন নিন (+{currentRewardCoins} কয়েন)</span>
              </button>
            </div>
          )}

          {/* 📢 ভিডিও শুরুতে মেসেজ ব্যানার (ইউজারের চাওয়া অনুযায়ী স্পষ্ট মেসেজ) */}
          {showStartMessage && !isVideoLocked && (
            <div className="absolute top-20 left-3 right-3 z-30 animate-in fade-in slide-in-from-top duration-300">
              <div className="p-3 rounded-2xl bg-slate-900/95 border-2 border-emerald-500/80 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping inline-block" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 leading-none">
                      <h5 className="text-xs font-black text-white">🔴 ভিডিও চালু হয়েছে!</h5>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">আয় শুরু</span>
                    </div>
                    <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                      ভিডিও দেখার সাথে সাথে সময় গণনা চলছে। ৪ মিনিট পর বিজ্ঞাপন দেখে +{currentRewardCoins} কয়েন নিন!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowStartMessage(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Floating Reward Coin Pill & Daily Reel Index */}
          <div className="absolute top-24 left-3 flex items-center gap-1.5 z-20 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 shadow-lg">
              <Coins className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-[10px] font-black text-amber-300 font-mono">
                +{currentRewardCoins} কয়েন
              </span>
            </div>
            <div className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1 shadow-lg text-[9px] font-black text-red-300 font-mono">
              <Youtube className="w-3 h-3 text-red-500" />
              <span>#{currentReelIndex + 1}/২৫০</span>
            </div>
          </div>

          {/* Up / Down Controls & TikTok Viral Action Bar */}
          {!isVideoLocked && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-20">
              <button
                onClick={handlePrevReel}
                title="আগের ভিডিও"
                className="p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 transition active:scale-90 shadow-xl backdrop-blur-md"
              >
                <ChevronUp className="w-4 h-4 text-amber-400" />
              </button>

              {/* Like / Heart Reaction */}
              <button
                onClick={() => {
                  const wasLiked = likedMap[currentReel.id];
                  setLikedMap(prev => ({ ...prev, [currentReel.id]: !wasLiked }));
                  soundService.playLikePop();
                  if (!wasLiked) {
                    showToast('❤️ ভিডিও পছন্দ করেছেন!', '', 'info');
                  }
                }}
                className="flex flex-col items-center gap-0.5 group"
              >
                <div className={`p-2.5 rounded-full backdrop-blur-md border transition active:scale-125 ${
                  likedMap[currentReel.id] 
                    ? 'bg-rose-600/90 text-white border-rose-400 shadow-[0_0_12px_#f43f5e]' 
                    : 'bg-black/60 text-white border-white/20'
                }`}>
                  <Heart className={`w-4 h-4 ${likedMap[currentReel.id] ? 'fill-white text-white' : 'text-white'}`} />
                </div>
                <span className="text-[9px] font-black text-white drop-shadow">
                  {likedMap[currentReel.id] ? 'Liked' : 'লাইক'}
                </span>
              </button>

              {/* Share to WhatsApp / Friends */}
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({
                      title: 'Watch & Earn BD',
                      text: `ভিডিও দেখে এবং গেম খেলে প্রতিদিন বিকাশ/নগদে টাকা আয় করুন! আমার রেফারেল কোড: ${user?.referralCode || 'PRO'}`,
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('🔗 ভিডিও ও অ্যাপ লিঙ্ক কপি হয়েছে!', 'বন্ধুদের পাঠিয়ে দিন', 'success');
                  }
                }}
                className="flex flex-col items-center gap-0.5 group"
              >
                <div className="p-2.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md active:scale-110 transition">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[9px] font-black text-white drop-shadow">শেয়ার</span>
              </button>

              <button
                onClick={handleNextReel}
                title="পরের ভিডিও"
                className="p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 transition active:scale-90 shadow-xl backdrop-blur-md"
              >
                <ChevronDown className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          )}

          {/* Bottom Info & Instant Ad Button */}
          {!isVideoLocked && (
            <div className="absolute bottom-2 left-2 right-2 z-20 space-y-1.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                <span className="px-2 py-0.5 rounded-md bg-red-600/60 text-white text-[9px] font-bold inline-block mb-1">
                  {currentReel.category} • {currentReel.views} Views
                </span>
                <h4 className="text-xs font-black text-white drop-shadow">
                  {currentReel.channel}
                </h4>
                <p className="text-[11px] text-slate-200 line-clamp-1 drop-shadow">
                  {currentReel.title}
                </p>
              </div>

              {/* Instant Bonus Ad Button */}
              <button
                onClick={() => setShowAd(true)}
                className="w-full py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 active:scale-98 transition"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>বিজ্ঞাপন দেখে এখনই +{currentRewardCoins} কয়েন নিন</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📱 MODE 2: EXTERNAL PHONE APP (TikTok/YouTube) WITH LIVE TIMER */}
      {/* ========================================================= */}
      {viewMode === 'app_task' && (
        <div className="p-4 space-y-4 my-auto">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-red-500/50 shadow-2xl text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto shadow-inner">
              {isVideoLocked ? (
                <Lock className="w-8 h-8 text-red-500 animate-bounce" />
              ) : appTaskRunning ? (
                <Clock className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              ) : (
                <Smartphone className="w-8 h-8 text-red-400" />
              )}
            </div>

            <div>
              <h3 className="text-base font-black text-white">
                {isVideoLocked 
                  ? '🔒 দেখার সময় শেষ! কয়েন আটকে গেছে'
                  : appTaskRunning 
                    ? (language === 'bn' ? '⏱️ আপনার অ্যাপে দেখার সময় গণনা চলছে...' : '⏱️ App Watch Time in Progress...')
                    : (language === 'bn' ? 'টিকটক বা ইউটিউব অ্যাপে ভিডিও দেখুন' : 'Watch in TikTok or YouTube App')}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                {isVideoLocked 
                  ? `আপনার ৪ মিনিট দেখা শেষ হয়েছে। নিচের বাটনে চাপ দিয়ে ৪০-৫০ সেকেন্ডের বিজ্ঞাপন দেখলে ওয়ালেটে ${currentRewardCoins} কয়েন যোগ হবে এবং পরবর্তী সেশন চালু হবে।`
                  : (language === 'bn' 
                      ? 'নিচের বাটনে চাপ দিয়ে ফোনে অ্যাপ ওপেন করে ভিডিও দেখুন। ৪ মিনিট শেষ হলে আপনার মোবাইলের নোটিফিকেশন বারে সরাসরি মেসেজ ও অ্যালার্ম যাবে!' 
                      : 'Launch TikTok or YouTube. After 4 minutes, you will receive a push notification and alarm on your mobile!')}
              </p>
            </div>

            {/* Live Count Display */}
            {appTaskRunning && !isVideoLocked && (
              <div className="p-3.5 rounded-2xl bg-black/80 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">অতিক্রান্ত সময়:</span>
                  <span className="text-amber-400 font-black text-base">{formatMinSec(watchSeconds)} / {formatMinSec(targetWatchSeconds)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_#eab308]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-400 font-medium">
                  💡 আপনি আপনার ফোনে যেকোনো অ্যাপে থাকতে পারেন, সময় নিজে নিজেই বাড়ছে!
                </p>
              </div>
            )}

            {/* Locked Action: Must watch ad */}
            {isVideoLocked ? (
              <button
                onClick={() => setShowAd(true)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-bounce"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>বিজ্ঞাপন দেখুন ও কয়েন আনলক করুন (+{currentRewardCoins} কয়েন)</span>
              </button>
            ) : (
              /* Launch App Buttons */
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => startExternalAppTask('tiktok')}
                  className="py-3 px-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{language === 'bn' ? 'টিকটক ওপেন করুন' : 'Open TikTok'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => startExternalAppTask('youtube')}
                  className="py-3 px-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{language === 'bn' ? 'ইউটিউব ওপেন করুন' : 'Open YouTube'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⚡ SPONSOR REWARDED AD BUTTON WITH 2.5 HOUR COOLDOWN */}
      <div className="px-3 pt-2">
        <button
          onClick={() => {
            if (sponsorCooldownSeconds > 0) {
              showToast(
                language === 'bn' 
                  ? `⏳ পরবর্তী স্পনসর বিজ্ঞাপন দেখতে পারবেন ${formatCountdown(sponsorCooldownSeconds)} পর।`
                  : `Next sponsored ad in ${formatCountdown(sponsorCooldownSeconds)}.`,
                language === 'bn' ? 'নিয়ম অনুযায়ী প্রতি ২.৫ ঘণ্টা পর পর ১টি স্পনসর বিজ্ঞাপন পাওয়া যায়।' : '1 ad available every 2.5 hours.',
                'info'
              );
              return;
            }
            try {
              const directLink = sanitizeAdDirectLink(settings?.adsConfig?.adsterraDirectLink, 'adsterra');
              if (directLink) {
                window.open(directLink, '_blank', 'noopener,noreferrer');
              }
            } catch (e) {}
            setShowAd(true);
          }}
          disabled={sponsorCooldownSeconds > 0}
          className={`w-full py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-98 transition ${
            sponsorCooldownSeconds > 0
              ? 'bg-slate-800/90 border border-amber-500/30 text-amber-300 font-bold text-xs cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-amber-500/25 animate-pulse cursor-pointer'
          }`}
        >
          {sponsorCooldownSeconds > 0 ? (
            <>
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>পরবর্তী স্পনসর বিজ্ঞাপন: {formatCountdown(sponsorCooldownSeconds)} পর</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{language === 'bn' ? '🎁 বিজ্ঞাপন দেখুন ও এখনই +৫০ কয়েন নিন' : '🎁 Watch Ad & Earn +50 Coins Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* 🌟 SPONSOR BANNER AD WITH DIRECT LINK (চাপ দিলে ১০ কয়েন) */}
      <div className="px-3 pt-3">
        <MiniBannerAd slotId="watch_screen_main_banner" category="finance" />
      </div>

      {/* 🔴 FLOATING PiP LIVE BUBBLE (স্ক্রিনের কোণায় ভাসমান টাইমার) */}
      {showFloatingPip && !showAd && (
        <div className="fixed bottom-24 right-4 z-50 animate-bounce">
          <div 
            onClick={() => {
              if (isVideoLocked) setShowAd(true);
              else showToast(`⏱️ বাকি সময়: ${formatMinSec(remainingSeconds)}`, '', 'info');
            }}
            className={`p-3 rounded-full shadow-2xl border-2 cursor-pointer flex items-center gap-2 transition active:scale-90 ${
              isVideoLocked 
                ? 'bg-red-600 border-white text-white animate-pulse' 
                : 'bg-slate-950/90 border-amber-400 text-amber-300 backdrop-blur-md'
            }`}
          >
            {isVideoLocked ? (
              <>
                <Lock className="w-5 h-5 text-white animate-bounce" />
                <span className="text-xs font-black">অ্যাড দেখুন!</span>
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs font-mono font-black">{formatMinSec(remainingSeconds)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 📢 THE 50-SECOND 3-AD CHAIN SPONSOR OVERLAY WITH ANTI-CHEAT */}
      {showAd && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden border-2 border-amber-500/60 shadow-2xl flex flex-col justify-center">
            <AdInterstitial
              adNumber={adCycleCount}
              durationSeconds={50}
              rewardCoins={currentRewardCoins || 50}
              onAdCompleted={handleAdFinished}
              onAdSkipped={handleAdSkipped}
            />
          </div>
        </div>
      )}
    </div>
  );
};
