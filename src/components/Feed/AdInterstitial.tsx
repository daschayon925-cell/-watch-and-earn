import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, X, Coins, Layers, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdInterstitialProps {
  onAdCompleted: () => void;
  onAdSkipped?: () => void;
  adNumber?: number;
  durationSeconds?: number; // total duration e.g. 25s
  rewardCoins?: number;
  title?: string;
}

export const AdInterstitial: React.FC<AdInterstitialProps> = ({
  onAdCompleted,
  onAdSkipped,
  adNumber = 1,
  durationSeconds = 25,
  rewardCoins = 50,
  title
}) => {
  const { language, settings } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // 🛡️ Mobile Hardware Back Button Protection (ফোনের ব্যাক বাটন চাপলে সুন্দরভাবে কেটে যাবে)
  useEffect(() => {
    try {
      window.history.pushState({ interstitialOpen: true }, '', window.location.href);
    } catch {
      // Ignore
    }

    const handlePopState = () => {
      if (onAdSkipped) {
        onAdSkipped();
      } else {
        onAdCompleted();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onAdSkipped, onAdCompleted]);

  // 3 distinct ad campaigns that sequentially display
  const multiAds = [
    {
      adIndex: 1,
      sponsorName: 'bKash Send Money & Cashback 💸',
      headlineBn: 'বিকাশ অ্যাপে সেন্ড মানি এখন সম্পূর্ণ ফ্রি!',
      headlineEn: 'Send Money Free on bKash App!',
      taglineBn: 'প্রতি মিনিটে ক্যাশব্যাক ও বোনাস রিওয়ার্ড লুফে নিন।',
      taglineEn: 'Earn cashback and instant reward points every minute.',
      badge: 'Google AdSense Partner',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-pink-600 via-rose-700 to-slate-950',
      actionTextBn: 'বিকাশ অফার দেখুন',
      actionTextEn: 'Explore bKash Offer',
      ctaUrl: 'https://www.bkash.com'
    },
    {
      adIndex: 2,
      sponsorName: 'Daraz BD Mega 11.11 & Daily Deals 🛍️',
      headlineBn: 'দারাজ মেগা সেল: ইলেকট্রনিক্স ও গ্যাজেটে ৮০% পর্যন্ত ছাড়!',
      headlineEn: 'Daraz Mega Sale: Up to 80% Off on Top Gadgets!',
      taglineBn: 'ফ্রি হোম ডেলিভারি ও এক্সক্লুসিভ ভাউচার ডিসকাউন্ট।',
      taglineEn: 'Enjoy Free Home Delivery & Exclusive App Vouchers.',
      badge: 'Unity Ads Commercial',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-orange-600 via-amber-700 to-slate-950',
      actionTextBn: 'দারাজ ভাউচার নিন',
      actionTextEn: 'Collect Voucher',
      ctaUrl: 'https://www.daraz.com.bd'
    },
    {
      adIndex: 3,
      sponsorName: 'Nagad Islamic & Free Bill Pay 🌙',
      headlineBn: 'নগদ ইসলামিক ওয়ালেটে ঝামেলাহীন ফ্রি বিল পরিশোধ!',
      headlineEn: 'Nagad Islamic: Zero Fee Utility Bill Payment!',
      taglineBn: 'লাখো টাকার ক্যাশ রিওয়ার্ড ও মোবাইল রিচার্জ বোনাস।',
      taglineEn: 'Get instant cash reward & mobile recharge bonus.',
      badge: 'AdMob Premium Partner',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-emerald-700 via-teal-900 to-slate-950',
      actionTextBn: 'নগদ একাউন্ট আপডেট',
      actionTextEn: 'Update Nagad Account',
      ctaUrl: 'https://nagad.com.bd'
    }
  ];

  // Calculate which of the 3 ads is active based on time elapsed
  const timeElapsed = durationSeconds - secondsRemaining;
  const slotDuration = Math.max(4, durationSeconds / 3);
  const currentSlotIndex = Math.min(2, Math.floor(timeElapsed / slotDuration));
  const currentAd = multiAds[currentSlotIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        if (prev <= 2) {
          setCanSkip(true);
        }
        return prev - 1;
      });
    }, 1000);

    // If user leaves tab to explore sponsor link and comes back, unlock immediately
    const handleVis = () => {
      if (document.visibilityState === 'visible' && hasInteracted) {
        setCanSkip(true);
        setSecondsRemaining(0);
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [hasInteracted]);

  const handleAdClick = () => {
    setHasInteracted(true);
    setCanSkip(true);
    setSecondsRemaining(0);
    const directLink = settings?.adsConfig?.adsterraDirectLink?.trim();
    const targetUrl = directLink || currentAd.ctaUrl;
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const progressPercentage = Math.round(((durationSeconds - secondsRemaining) / durationSeconds) * 100);

  const handleManualClose = () => {
    if (canSkip || secondsRemaining <= 3) {
      onAdCompleted();
    } else if (onAdSkipped) {
      onAdSkipped();
    } else {
      onAdCompleted();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-3.5 sm:p-5 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white backdrop-blur-xl animate-fadeIn">
      {/* 🔴 Top Header Bar with Big Prominent [ ✕ বন্ধ করুন ] Button */}
      <div className="flex items-center justify-between z-30 gap-2 pb-1">
        {/* Left Side: Back / Cancel Button */}
        <button
          onClick={handleManualClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-600 active:scale-95 transition cursor-pointer shadow-lg"
          title="বিজ্ঞাপন বন্ধ করে অ্যাপে ফিরুন"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300" />
          <span>ব্যাকে ফিরুন</span>
        </button>

        {/* Center: Live Timer Pill */}
        <div className="px-3 py-1 rounded-full bg-black/80 border border-amber-500/60 text-xs font-mono font-black text-amber-300 shadow flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          <span>⏱️ {secondsRemaining > 0 ? `${secondsRemaining}s` : 'সম্পন্ন ✓'}</span>
        </div>

        {/* 🎯 Right Side: Bright Red Prominent ✕ CLOSE BUTTON (ALWAYS VISIBLE!) */}
        <button
          onClick={handleManualClose}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-90 cursor-pointer shadow-2xl border-2 ${
            canSkip 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-white animate-pulse' 
              : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400'
          }`}
          title="বিজ্ঞাপন কেটে দিন"
        >
          <X className="w-4 h-4 stroke-[3]" />
          <span>{canSkip ? 'রিওয়ার্ড নিন ✕' : '✕ বন্ধ করুন'}</span>
        </button>
      </div>

      {/* Multi-Ad Timeline Indicator */}
      <div className="my-1.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold mb-1">
          <span className="flex items-center gap-1 text-amber-400">
            <Layers className="w-3.5 h-3.5" />
            {language === 'bn' ? 'স্পন্সর বিজ্ঞাপন পার্টনার' : 'Sponsor Network Partner'}
          </span>
          <span className="text-emerald-400 font-mono">অ্যাড {currentSlotIndex + 1}/৩</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((idx) => {
            const isCompleted = currentSlotIndex > idx || canSkip;
            const isCurrent = currentSlotIndex === idx && !canSkip;
            return (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500' 
                    : isCurrent 
                      ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]' 
                      : 'bg-slate-700'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Center Ad Billboard */}
      <div className={`my-auto flex flex-col items-center text-center p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br ${currentAd.bgGradient} border border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-700`}>
        {/* Ambient glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Real Ad Banner Image */}
        <div 
          onClick={handleAdClick}
          className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden mb-2.5 relative shadow-lg border border-white/20 block cursor-pointer group"
        >
          <img 
            src={currentAd.image} 
            alt={currentAd.sponsorName} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1 border border-amber-400/40">
            <Coins className="w-3 h-3 text-amber-400" />
            <span>{rewardCoins > 0 ? `+${rewardCoins} Coins` : 'স্পন্সর অফার'}</span>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[8px] text-white/90">
            Ad by Partner Network ↗
          </div>
        </div>

        <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest mb-0.5">
          {currentAd.sponsorName}
        </span>

        <h3 className="text-xs sm:text-sm font-black text-white mb-1 leading-snug">
          {language === 'bn' ? currentAd.headlineBn : currentAd.headlineEn}
        </h3>

        <p className="text-[10px] text-slate-200 max-w-xs mb-2">
          {language === 'bn' ? currentAd.taglineBn : currentAd.taglineEn}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 mb-2.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_#eab308]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleAdClick}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs shadow-xl active:scale-95 transition-all border border-amber-300 cursor-pointer"
        >
          <span>{language === 'bn' ? '🚀 অফার দেখুন ও ভিজিট করুন' : '🚀 Visit & Explore Offer'}</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
        </button>
      </div>

      {/* 🟢 Prominent Bottom Action Bar */}
      <div className="pt-2 z-30 flex flex-col items-center gap-1.5">
        {canSkip ? (
          <button
            onClick={onAdCompleted}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 hover:from-emerald-300 text-slate-950 font-black text-sm shadow-[0_0_20px_#10b981] flex items-center justify-center gap-2 active:scale-95 transition animate-bounce cursor-pointer border-2 border-white"
          >
            <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-400" />
            <span>🎉 সম্পন্ন! বিজ্ঞাপন বন্ধ করুন ও +{rewardCoins} কয়েন নিন ✕</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between gap-2">
            <button
              onClick={handleManualClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-rose-400 shadow-md cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>✕ বিজ্ঞাপন কেটে দিন</span>
            </button>

            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono text-center">
              بাকি {secondsRemaining}s
            </div>
          </div>
        )}

        {/* 1-Tap Return Helper */}
        <button
          onClick={handleManualClose}
          className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer pt-0.5"
        >
          🔙 সরাসরি ভিডিওতে ফিরে যান
        </button>
      </div>
    </div>
  );
};
