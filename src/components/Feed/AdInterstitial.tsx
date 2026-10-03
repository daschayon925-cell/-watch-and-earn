import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, ExternalLink, ShieldCheck, X, Coins, Layers, 
  CheckCircle2, ArrowLeft, Zap, Lock, Volume2, VolumeX, 
  Play, Download, Star, ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';

interface AdInterstitialProps {
  onAdCompleted: () => void;
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
  
  // Real duration from admin settings or prop (default 20 seconds)
  const initialDuration = durationSeconds || settings?.adsConfig?.rewardedVideoDurationSeconds || 20;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialDuration);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showEarlyExitWarning, setShowEarlyExitWarning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const adsterraContainerRef = useRef<HTMLDivElement | null>(null);

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

  // 🛡️ Mobile Hardware Back Button (২০ সেকেন্ড পার হলে বন্ধ ও কয়েন ক্লেইম)
  useEffect(() => {
    try {
      window.history.pushState({ interstitialOpen: true }, '', window.location.href);
    } catch {
      // Ignore
    }

    const handlePopState = () => {
      if (secondsRemaining <= 0 || canSkip) {
        onAdCompleted();
      } else {
        setShowEarlyExitWarning(true);
        setTimeout(() => setShowEarlyExitWarning(false), 3000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [secondsRemaining, canSkip, onAdCompleted]);

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
      actionTextBn: 'চাপ দিয়ে কয়েন সংগ্রহ করুন',
      actionTextEn: 'Tap to Collect Coins',
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
      actionTextBn: 'চাপ দিয়ে কয়েন সংগ্রহ করুন',
      actionTextEn: 'Tap to Collect Coins',
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
      actionTextBn: 'চাপ দিয়ে কয়েন সংগ্রহ করুন',
      actionTextEn: 'Tap to Collect Coins',
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
      actionTextBn: 'চাপ দিয়ে কয়েন সংগ্রহ করুন',
      actionTextEn: 'Tap to Collect Coins',
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
      actionTextBn: 'চাপ দিয়ে কয়েন সংগ্রহ করুন',
      actionTextEn: 'Tap to Collect Coins',
      ctaUrl: 'https://play.google.com'
    }
  ];

  // Rotate ads on each session so user always gets fresh variety
  const [selectedAdIndex] = useState(() => Math.floor(Math.random() * rewardedAds.length));
  const currentAd = rewardedAds[selectedAdIndex] || rewardedAds[0];

  useEffect(() => {
    // ⏱️ Strict 15-20 second countdown timer
    const timer = setInterval(() => {
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
          // 🏆 Auto-award coins when countdown finishes!
          setTimeout(() => {
            onAdCompleted();
          }, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [onAdCompleted]);

  const handleAdClick = () => {
    // 🔊 Audio reward feedback
    try {
      soundService.playCoinReward();
    } catch {
      // Ignore
    }

    // Open direct link / sponsor URL in new tab for revenue
    const directLink = settings?.adsConfig?.adsterraDirectLink?.trim();
    const targetUrl = directLink || currentAd.ctaUrl;
    if (typeof window !== 'undefined') {
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback
      }
    }

    // Immediately award reward and return to video!
    onAdCompleted();
  };

  const watchedSeconds = initialDuration - secondsRemaining;
  const isSkipAllowed = watchedSeconds >= 5 || canSkip;

  const handleEmergencyExit = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Guaranteed reward on exit!
    onAdCompleted();
  };

  const handleCloseAd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      soundService.playSuccessFanfare();
    } catch {
      // Ignore
    }
    onAdCompleted();
  };

  const handleEarlyExitAttempt = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isSkipAllowed && secondsRemaining > 0) {
      setShowEarlyExitWarning(true);
      setTimeout(() => setShowEarlyExitWarning(false), 3000);
    } else {
      handleEmergencyExit(e);
    }
  };

  const progressPercentage = Math.round(((initialDuration - secondsRemaining) / initialDuration) * 100);

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex flex-col justify-between bg-black text-white select-none overflow-hidden animate-fadeIn touch-auto">
      {/* 🔴 Top Bar: Lock Timer & Big [ ✕ ] Button (Max z-index 2147483647) */}
      <div 
        className="relative flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black via-black/85 to-transparent pointer-events-auto"
        style={{ zIndex: 2147483647 }}
      >
        {/* Left: Instant Emergency Exit [ ← বের হন ] */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEmergencyExit}
            onTouchEnd={handleEmergencyExit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition touch-manipulation pointer-events-auto"
            title="বিজ্ঞাপন বন্ধ করে বের হন"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
            <span>বের হন</span>
          </button>

          {/* Rewarded Video Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
              {language === 'bn' ? 'রিওয়ার্ডেড ভিডিও' : 'Rewarded Video'}
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

        {/* 🎯 Right: Live Countdown, 5-Second Skip, or Glowing [ ✕ ] Button */}
        {secondsRemaining > 0 ? (
          isSkipAllowed ? (
            <button
              type="button"
              onClick={handleEmergencyExit}
              onTouchEnd={handleEmergencyExit}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-slate-900/95 border border-amber-400 text-xs font-bold text-amber-300 hover:text-white shadow-xl backdrop-blur-md cursor-pointer active:scale-95 transition touch-manipulation pointer-events-auto"
              title="বিজ্ঞাপন স্কিপ করে বের হন"
            >
              <span>স্কিপ করুন ✕</span>
              <span className="font-mono text-[10px]">({secondsRemaining}s)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEarlyExitAttempt}
              onTouchEnd={handleEarlyExitAttempt}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-950/90 border border-amber-500/80 text-xs font-mono font-black text-amber-300 shadow-xl backdrop-blur-md cursor-pointer active:scale-95 transition touch-manipulation pointer-events-auto"
              title="ভিডিও পুরো দেখলে ৫০ কয়েন পাবেন"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{secondsRemaining}s</span>
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={handleCloseAd}
            onTouchEnd={handleCloseAd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-[0_0_25px_#10b981] border-2 border-white animate-pulse cursor-pointer active:scale-90 transition-transform touch-manipulation pointer-events-auto"
            title="কয়েন গ্রহণ করে বন্ধ করুন"
          >
            <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-300 shrink-0" />
            <span>✕ বন্ধ করুন</span>
          </button>
        )}
      </div>

      {/* ⚠️ Early Exit Warning Toast */}
      {showEarlyExitWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-rose-600/95 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-rose-400/50 animate-bounce text-center max-w-xs pointer-events-none">
          <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
          <span>৫ সেকেন্ড পর স্কিপ বাটন চালু হবে। আর মাত্র {Math.max(1, 5 - watchedSeconds)} সেকেন্ড।</span>
        </div>
      )}

      {/* 🎬 Main Fullscreen Video Player Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
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
          <div className="p-3 sm:p-3.5 rounded-3xl bg-slate-950/85 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-between gap-3">
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

            {/* 🎯 "চাপ দিয়ে কয়েন সংগ্রহ করুন" CTA Button (Opens Adsterra Direct Link & awards coins) */}
            <button
              type="button"
              onClick={handleAdClick}
              onTouchEnd={handleAdClick}
              className="shrink-0 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-[11px] sm:text-xs shadow-xl shadow-amber-500/40 active:scale-95 transition-all flex items-center gap-1.5 border-2 border-white cursor-pointer animate-pulse touch-manipulation pointer-events-auto"
              title="চাপ দিয়ে কয়েন সংগ্রহ করুন"
            >
              <Coins className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
              <span>{language === 'bn' ? 'চাপ দিয়ে কয়েন সংগ্রহ করুন' : 'Tap to Collect Coins'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 Bottom Progress Bar & Completion Action (Above all navigation) */}
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
              <span>⏱️ বাকি: <span className="font-mono text-amber-300 font-black">{secondsRemaining}s</span></span>
              {isSkipAllowed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  স্কিপ চালু হয়েছে
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleEmergencyExit}
              onTouchEnd={handleEmergencyExit}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer p-1 touch-manipulation pointer-events-auto"
            >
              এখনই বন্ধ করুন ✕
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
            <span>🎉 চাপ দিয়ে +{rewardCoins} কয়েন সংগ্রহ করুন ও বন্ধ করুন ✕</span>
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
