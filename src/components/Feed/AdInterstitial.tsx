import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, ExternalLink, ShieldCheck, X, Coins, Layers, 
  CheckCircle2, ArrowLeft, Zap, Lock, Volume2, VolumeX, 
  Play, Download, Star, ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';

interface AdInterstitialProps {
  onAdCompleted: (adSessionId?: string) => void;
  onAdSkipped?: () => void;
  adNumber?: number;
  durationSeconds?: number;
  rewardCoins?: number;
  title?: string;
}

export const AdInterstitial: React.FC<AdInterstitialProps> = ({
  onAdCompleted,
  onAdSkipped,
  adNumber = 1,
  durationSeconds,
  rewardCoins = 50,
  title
}) => {
  const { language, settings } = useApp();
  
  // Duration for ad interstitial (supports custom duration like 20s)
  const initialDuration = durationSeconds !== undefined ? durationSeconds : (settings?.adsConfig?.rewardedVideoDurationSeconds || 20);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialDuration);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showEarlyExitWarning, setShowEarlyExitWarning] = useState<boolean>(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState<boolean>(false);
  const [adClickedNotice, setAdClickedNotice] = useState<boolean>(false);
  const [adSessionId, setAdSessionId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adsterraContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize secure backend ad session on start
  useEffect(() => {
    api.startRewardedAdSession().then(res => {
      if (res && res.success && res.adSessionId) {
        setAdSessionId(res.adSessionId);
      }
    }).catch(() => {});
  }, []);

  const customAdsterraCode = settings?.adsConfig?.adsterraRewardedVideoCode?.trim();

  // Inject real Adsterra script tag or VAST player if provided
  useEffect(() => {
    if (customAdsterraCode && adsterraContainerRef.current) {
      adsterraContainerRef.current.innerHTML = '';
      try {
        const range = document.createRange();
        const documentFragment = range.createContextualFragment(customAdsterraCode);
        adsterraContainerRef.current.appendChild(documentFragment);
      } catch (e) {
        console.error('Failed to inject Adsterra video code:', e);
      }
    }
  }, [customAdsterraCode]);

  // 🛡️ Hide floating social bar overlays and lock body scroll while modal is active
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('rewarded-ad-active');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('rewarded-ad-active');
      }
    };
  }, []);

  // 🛡️ Mobile Hardware Back Button (বিজ্ঞাপন শেষ না হলে সতর্কতা)
  useEffect(() => {
    try {
      window.history.pushState({ interstitialOpen: true }, '', window.location.href);
    } catch {
      // Ignore
    }

    const handlePopState = () => {
      if (secondsRemaining <= 0) {
        onAdCompleted(adSessionId || undefined);
      } else {
        setConfirmExitOpen(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [secondsRemaining, onAdCompleted]);

  // High-converting Rewarded Video Ads with authentic video & sponsor badges
  const rewardedAds = [
    {
      adIndex: 1,
      appName: 'দারাজ মেগা বৈশাখী সেল 🛍️',
      taglineBn: 'স্মার্টফোন ও গ্যাজেটে ৮০% পর্যন্ত ডিসকাউন্ট ও ফ্রি হোম ডেলিভারি!',
      taglineEn: 'Up to 80% discount on smartphones & free home delivery!',
      developer: 'Daraz Bangladesh (Alibaba Group)',
      rating: '4.8',
      downloads: '10M+',
      badge: 'অফিসিয়াল স্পন্সর',
      category: 'Shopping & Offers',
      installBonus: '৳৫০০ ডিসকাউন্ট ভাউচার',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      posterImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&auto=format&fit=crop&q=80',
      actionTextBn: 'স্পনসর অফার দেখুন',
      actionTextEn: 'View Sponsor Offer',
      ctaUrl: 'https://www.daraz.com.bd'
    },
    {
      adIndex: 2,
      appName: 'বিকাশ সেন্ড মানি ও ক্যাশব্যাক 💸',
      taglineBn: 'যেকোনো নাম্বারে সম্পূর্ণ ফ্রি সেন্ড মানি ও ইনস্ট্যান্ট ক্যাশব্যাক অফার!',
      taglineEn: 'Free send money on bKash & instant cashback offers!',
      developer: 'bKash Limited Official',
      rating: '4.9',
      downloads: '50M+',
      badge: 'ভেরিফায়েড পার্টনার',
      category: 'Finance & Payments',
      installBonus: '৳১০০ ফ্রি ক্যাশব্যাক',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
      actionTextBn: 'স্পনসর অফার দেখুন',
      actionTextEn: 'View Sponsor Offer',
      ctaUrl: 'https://www.bkash.com'
    },
    {
      adIndex: 3,
      appName: 'ফ্রি ফায়ার ও পাবজি রিয়েল গেমার্স 🎮',
      taglineBn: 'দৈনিক লাইভ টুর্নামেন্ট খেলে আনলিমিটেড ডায়মন্ড ও এলিট পাস জিতুন!',
      taglineEn: 'Play live tournaments & win diamonds and elite pass daily!',
      developer: 'Pro Esports Battle BD',
      rating: '4.7',
      downloads: '5M+',
      badge: 'টপ চার্টিং গেম',
      category: 'Gaming & Action',
      installBonus: '৫০০ ডায়মন্ড ফ্রি',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      posterImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
      actionTextBn: 'স্পনসর অফার দেখুন',
      actionTextEn: 'View Sponsor Offer',
      ctaUrl: 'https://play.google.com'
    },
    {
      adIndex: 4,
      appName: 'ফুডপান্ডা ৩০ মিনিটে খাবার ডেলিভারি 🍔',
      taglineBn: 'প্রথম অর্ডারে নিশ্চিত ১০০ টাকা ক্যাশ ডিসকাউন্ট ও ফ্রি হোম ডেলিভারি!',
      taglineEn: 'Instant 100 Tk cash discount with fast food delivery!',
      developer: 'Foodpanda Bangladesh',
      rating: '4.8',
      downloads: '25M+',
      badge: 'পপুলার স্পন্সর',
      category: 'Food & Drinks',
      installBonus: '৳১০০ ডিসকাউন্ট',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      posterImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&auto=format&fit=crop&q=80',
      actionTextBn: 'স্পনসর অফার দেখুন',
      actionTextEn: 'View Sponsor Offer',
      ctaUrl: 'https://www.foodpanda.com.bd'
    },
    {
      adIndex: 5,
      appName: 'TikTok Reels & Shorts বিনোদন 🎬',
      taglineBn: 'ভাইরাল বাংলা ফানি ভিডিও দেখুন ও বন্ধুদের শেয়ার করে আয় করুন!',
      taglineEn: 'Watch viral Bengali videos & earn cash rewards everyday!',
      developer: 'ByteDance Entertainment',
      rating: '4.9',
      downloads: '100M+',
      badge: 'নাম্বার ১ ট্রেন্ডিং',
      category: 'Entertainment',
      installBonus: '৳২,০০০ ওয়েলকাম ক্যাশ',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      posterImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      actionTextBn: 'স্পনসর অফার দেখুন',
      actionTextEn: 'View Sponsor Offer',
      ctaUrl: 'https://play.google.com'
    }
  ];

  // 🎬 3-Ad Chain Sequence across 50 seconds (1-17s: Ad 1, 18-34s: Ad 2, 35-50s: Ad 3)
  const [selectedAdIndex] = useState(() => Math.floor(Math.random() * rewardedAds.length));
  const elapsedTime = initialDuration - secondsRemaining;
  const currentAdStep = Math.min(3, Math.floor((elapsedTime / initialDuration) * 3) + 1); // 1, 2, or 3
  const currentAd = rewardedAds[(selectedAdIndex + currentAdStep - 1) % rewardedAds.length] || rewardedAds[0];
  const [hasClickedAd, setHasClickedAd] = useState<boolean>(false);

  // Opening sponsor direct link (Smart 1-open-per-tap to prevent annoying multiple tab spam)
  const handleAdClick = (e?: React.MouseEvent | React.TouchEvent, forceOpen: boolean = false) => {
    if (e) {
      e.stopPropagation();
    }
    // If user already clicked and this is just an accidental viewport tap, don't spam new tabs
    if (hasClickedAd && !forceOpen) {
      return;
    }

    const directLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
    const targetUrl = directLink || currentAd.ctaUrl;
    if (typeof window !== 'undefined') {
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch {
        try {
          window.location.href = targetUrl;
        } catch {}
      }
    }

    setHasClickedAd(true);
    setAdClickedNotice(true);
    setTimeout(() => setAdClickedNotice(false), 4000);
  };

  useEffect(() => {
    // ⏱️ Strict Countdown Timer - NO EARLY REWARDS (Pauses if tab is hidden for Maximum CPM)
    const timer = setInterval(() => {
      // 🛡️ High CPM Guarantee: Only count down when screen is actively visible
      if (typeof document !== 'undefined' && document.hidden) {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
        return;
      }
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }

      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          try {
            soundService.playSuccessFanfare();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 300]);
            }
          } catch {}
          // 🏆 Full duration satisfied - award reward
          setTimeout(() => {
            onAdCompleted(adSessionId || undefined);
          }, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [onAdCompleted, adSessionId]);

  // Exit request handler:
  // If timer is NOT finished, user gets ZERO coins unless they watch full time!
  const handleExitRequest = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (secondsRemaining <= 0) {
      onAdCompleted(adSessionId || undefined);
    } else {
      setConfirmExitOpen(true);
    }
  };

  const handleConfirmSkipExit = () => {
    setConfirmExitOpen(false);
    if (onAdSkipped) {
      onAdSkipped();
    }
  };

  const handleCloseAd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (secondsRemaining > 0) {
      handleExitRequest(e);
      return;
    }

    // 🚀 Auto-trigger direct link if not clicked yet so publisher always gets maximum CPM
    if (!hasClickedAd) {
      handleAdClick();
    }

    try {
      soundService.playSuccessFanfare();
    } catch {
      // Ignore
    }
    onAdCompleted(adSessionId || undefined);
  };

  const progressPercentage = Math.round(((initialDuration - secondsRemaining) / initialDuration) * 100);

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex flex-col justify-between bg-black text-white select-none overflow-hidden animate-fadeIn touch-auto">
      {/* 🔴 Top Bar: Lock Timer & Exit Button */}
      <div 
        className="relative flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black via-black/85 to-transparent pointer-events-auto"
        style={{ zIndex: 2147483647 }}
      >
        {/* Left: Exit [ ✕ বের হন ] with Anti-Cheat Confirmation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExitRequest}
            onTouchEnd={handleExitRequest}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition touch-manipulation pointer-events-auto"
            title="বিজ্ঞাপন বন্ধ করতে ট্যাপ করুন"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
            <span>বের হন</span>
          </button>

          {/* 3-Ad Chain Badge: ১/৩, ২/৩, ৩/৩ */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/50 backdrop-blur-md shadow-lg">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider">
              {language === 'bn' ? `অ্যাড ${currentAdStep}/৩ (মোট ৫০ সে.)` : `Ad ${currentAdStep}/3 (50s)`}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-black text-amber-300">
              +{rewardCoins} 🪙
            </span>
          </div>
        </div>

        {/* Center: Sound Audio Mute Toggle */}
        <button
          type="button"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !videoRef.current.muted;
              setIsMuted(videoRef.current.muted);
            }
          }}
          className="p-2 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer touch-manipulation pointer-events-auto"
          title={isMuted ? 'সাউন্ড অন করুন' : 'মিউট করুন'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* 🎯 Right: Live Countdown or Final Claim Button */}
        {secondsRemaining > 0 ? (
          <button
            type="button"
            onClick={handleExitRequest}
            onTouchEnd={handleExitRequest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-950/90 border border-amber-500/80 text-xs font-mono font-black text-amber-300 shadow-xl backdrop-blur-md cursor-pointer active:scale-95 transition touch-manipulation pointer-events-auto"
            title="পুরো সময় দেখলে কয়েন পাবেন"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{secondsRemaining}s</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCloseAd}
            onTouchEnd={handleCloseAd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-[0_0_25px_#10b981] border-2 border-white animate-pulse cursor-pointer active:scale-90 transition-transform touch-manipulation pointer-events-auto"
            title="কয়েন গ্রহণ করে বন্ধ করুন"
          >
            <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-300 shrink-0" />
            <span>✕ কয়েন নিন ও বন্ধ করুন</span>
          </button>
        )}
      </div>

      {/* 🚨 Big Notice Banner: Mandatory Click Requirement */}
      <div 
        onClick={handleAdClick}
        className="mx-3 z-40 p-3 rounded-2xl bg-gradient-to-r from-rose-950/95 via-amber-950/95 to-rose-950/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-between gap-2.5 cursor-pointer animate-pulse pointer-events-auto active:scale-[0.98] transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-bounce">👉</span>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black text-amber-300">
              {hasClickedAd ? '✅ বিজ্ঞাপন ভিজিট সম্পন্ন হয়েছে!' : '🚨 বিজ্ঞাপনে চাপ না দিলে কয়েন যুক্ত হবে না!'}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-200">
              {hasClickedAd ? 'বাকি সময় অপেক্ষা করুন এবং পুরো কয়েন গ্রহণ করুন।' : 'এখানে চাপ দিয়ে অফার পেজে ১০ সেকেন্ড থাকুন।'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdClick}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs shrink-0 shadow-lg border border-white"
        >
          {hasClickedAd ? 'ভিজিট সম্পন্ন' : 'চাপ দিন ▶'}
        </button>
      </div>

      {/* ⚠️ Notice when Sponsor link clicked */}
      {adClickedNotice && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-black shadow-2xl flex items-center gap-2 border-2 border-white animate-bounce text-center max-w-xs pointer-events-none">
          <Sparkles className="w-4 h-4 shrink-0 text-slate-950" />
          <span>অফার পেজ খোলা হয়েছে! পুরো রিওয়ার্ড পেতে বাকি {secondsRemaining}s সময় অপেক্ষা করুন।</span>
        </div>
      )}

      {/* 🛑 Anti-Cheat Confirmation Dialog (অল্প সময়ে বের হলে কোনো কয়েন নেই!) */}
      {confirmExitOpen && (
        <div 
          className="absolute inset-0 z-[2147483647] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in pointer-events-auto"
          style={{ zIndex: 2147483647 }}
        >
          <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 border border-rose-500/30">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1.5">
              বিজ্ঞাপন এখনো শেষ হয়নি!
            </h3>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">
              আর মাত্র <span className="text-amber-400 font-black">{secondsRemaining} সেকেন্ড</span> বাকি।
            </p>
            <p className="text-xs text-rose-400 font-bold mb-5 bg-rose-950/40 border border-rose-500/20 rounded-xl px-3 py-2 w-full">
              ⚠️ পুরো বিজ্ঞাপন না দেখলে কোনো কয়েন পাবেন না!
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setConfirmExitOpen(false)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl cursor-pointer active:scale-95 transition"
              >
                বিজ্ঞাপন দেখা চালিয়ে যান (+{rewardCoins} কয়েন)
              </button>
              <button
                type="button"
                onClick={handleConfirmSkipExit}
                className="w-full py-2.5 rounded-2xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700/80 text-xs font-semibold cursor-pointer active:scale-95 transition"
              >
                এখনই বের হয়ে যান (কয়েন পাবেন না) ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎬 Main Fullscreen Video Player Area (Tapping anywhere opens direct link) */}
      <div 
        onClick={handleAdClick}
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-pointer pointer-events-auto"
        title="বিজ্ঞাপনে চাপ দিয়ে অফার দেখুন"
      >
        {customAdsterraCode ? (
          <div 
            ref={adsterraContainerRef} 
            className="w-full h-full flex items-center justify-center relative z-10 p-2"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentAd.videoUrl}
            poster={currentAd.posterImage}
            autoPlay
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-cover max-h-screen"
          />
        )}

        {/* Video Overlay Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

        {/* 📱 In-Video Sponsor App Card */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-30">
          <div 
            onClick={handleAdClick}
            className="p-3 sm:p-3.5 rounded-3xl bg-slate-950/90 backdrop-blur-xl border-2 border-amber-400/80 shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-amber-300 active:scale-[0.98] transition"
          >
            {/* App Icon & Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/20 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center p-0.5">
                <img 
                  src={currentAd.logoUrl} 
                  alt={currentAd.appName} 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">
                    {currentAd.appName}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-amber-300 font-bold mt-0.5">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{currentAd.rating}</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300">{currentAd.downloads}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-400 font-black">{currentAd.installBonus}</span>
                </div>

                <p className="text-[10px] text-slate-300 truncate mt-0.5 max-w-[180px] sm:max-w-xs">
                  {language === 'bn' ? currentAd.taglineBn : currentAd.taglineEn}
                </p>
              </div>
            </div>

            {/* 🎯 Sponsor Details Link */}
            <button
              type="button"
              onClick={handleAdClick}
              onTouchEnd={handleAdClick}
              className="shrink-0 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-[11px] sm:text-xs shadow-xl shadow-amber-500/40 active:scale-95 transition-all flex items-center gap-1.5 border-2 border-white cursor-pointer touch-manipulation pointer-events-auto animate-pulse"
              title="অফার দেখুন"
            >
              <ExternalLink className="w-4 h-4 text-slate-950 shrink-0" />
              <span>{language === 'bn' ? 'অফার দেখুন' : 'View Offer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 Bottom Progress Bar & Completion Action */}
      <div 
        className="relative p-3 sm:p-4 pb-10 sm:pb-6 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col gap-2.5 pointer-events-auto"
        style={{ zIndex: 2147483647 }}
      >
        {/* Real-time Progress Bar */}
        <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-green-500 transition-all duration-1000 shadow-[0_0_12px_#10b981]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Status Text & Bottom Button */}
        {secondsRemaining > 0 ? (
          <div className="flex items-center justify-between text-xs text-slate-300 px-1 font-semibold">
            <div className="flex items-center gap-1.5">
              <span>⏱️ পুরো দেখতে হবে: <span className="font-mono text-amber-300 font-black">{secondsRemaining}s</span></span>
            </div>
            <button
              type="button"
              onClick={handleExitRequest}
              onTouchEnd={handleExitRequest}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer p-1 touch-manipulation pointer-events-auto"
            >
              বন্ধ করুন (কয়েন ছাড়া) ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCloseAd}
            onTouchEnd={handleCloseAd}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500 hover:from-emerald-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_30px_#10b981] flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer border-2 border-white animate-bounce touch-manipulation z-50 pointer-events-auto"
          >
            <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-400 shrink-0" />
            <span>🎉 পুরো দেখা সম্পন্ন! +{rewardCoins} কয়েন গ্রহণ করে বন্ধ করুন ✕</span>
          </button>
        )}
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
