import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, X, Coins, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdInterstitialProps {
  onAdCompleted: () => void;
  onAdSkipped?: () => void;
  adNumber?: number;
  durationSeconds?: number; // total duration e.g. 50s
  rewardCoins?: number;
  title?: string;
}

export const AdInterstitial: React.FC<AdInterstitialProps> = ({
  onAdCompleted,
  adNumber = 1,
  durationSeconds = 50,
  rewardCoins = 50,
  title
}) => {
  const { language, settings } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  // 3 distinct ad campaigns that sequentially display during the 50-second timeline (e.g., 0-16s Ad 1, 17-33s Ad 2, 34-50s Ad 3)
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
  const slotDuration = durationSeconds / 3;
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
        if (prev <= 3) {
          setCanSkip(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progressPercentage = Math.round(((durationSeconds - secondsRemaining) / durationSeconds) * 100);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white backdrop-blur-xl animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-400 text-slate-950 shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            স্পন্সরড অ্যাড {currentSlotIndex + 1}/৩
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {currentAd.badge}
          </span>
        </div>

        {/* Countdown / Claim button */}
        <div>
          {canSkip ? (
            <button
              onClick={onAdCompleted}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg active:scale-95 animate-pulse"
            >
              <span>{language === 'bn' ? `বিজ্ঞাপন সমাপ্ত (+${rewardCoins} কয়েন)` : `Complete • +${rewardCoins} Coins`}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-slate-800/90 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 shadow">
              ⏱️ {secondsRemaining}s
            </div>
          )}
        </div>
      </div>

      {/* Multi-Ad Timeline Indicator (৩টি বিজ্ঞাপনের টাইমলাইন বার) */}
      <div className="my-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold mb-1.5">
          <span className="flex items-center gap-1 text-amber-400">
            <Layers className="w-3.5 h-3.5" />
            {language === 'bn' ? 'মাল্টি-অ্যাড স্ট্রীম (৫০ সেকেন্ডে ৩টি স্পন্সর)' : 'Multi-Ad Stream (3 Sponsors in 50s)'}
          </span>
          <span className="text-emerald-400 font-mono">অ্যাড {currentSlotIndex + 1} অফ ৩</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((idx) => {
            const isCompleted = currentSlotIndex > idx;
            const isCurrent = currentSlotIndex === idx;
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
      <div className={`my-auto flex flex-col items-center text-center p-5 rounded-3xl bg-gradient-to-br ${currentAd.bgGradient} border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-700`}>
        {/* Ambient glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Real Ad Banner Image */}
        <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 relative shadow-lg border border-white/20">
          <img 
            src={currentAd.image} 
            alt={currentAd.sponsorName} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1 border border-amber-400/40">
            <Coins className="w-3 h-3 text-amber-400" />
            <span>+{rewardCoins} Coins</span>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[8px] text-white/90">
            Ad by Partner Network
          </div>
        </div>

        <span className="text-xs font-bold text-white/90 uppercase tracking-widest mb-1">
          {currentAd.sponsorName}
        </span>

        <h3 className="text-base md:text-lg font-extrabold text-white mb-1.5 leading-snug">
          {language === 'bn' ? currentAd.headlineBn : currentAd.headlineEn}
        </h3>

        <p className="text-xs text-slate-200 max-w-xs mb-3">
          {language === 'bn' ? currentAd.taglineBn : currentAd.taglineEn}
        </p>

        {/* 50-Second Total Progress */}
        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 mb-4">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_#eab308]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Action Button (High CTR conversion) */}
        {(() => {
          const directLink = settings?.adsConfig?.adsterraDirectLink?.trim();
          const targetUrl = directLink || currentAd.ctaUrl;
          return (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs shadow-xl active:scale-95 transition-all"
            >
              <span>{directLink ? (language === 'bn' ? 'স্পন্সর অফার দেখুন' : 'View Sponsor Offer') : (language === 'bn' ? currentAd.actionTextBn : currentAd.actionTextEn)}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </a>
          );
        })()}

        {/* Revenue sharing text */}
        <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-1.5 text-[10px] text-white/80">
          <span className="text-amber-300 font-bold">💎 স্পন্সর বোনাস:</span>
          <span>৫০ সেকেন্ড শেষ হলেই আপনার অ্যাকাউন্টে রিওয়ার্ড কয়েন জমা হবে</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center z-10">
        <p className="text-[11px] text-slate-400 font-medium">
          {canSkip
            ? '✅ সময় পূর্ণ হয়েছে! কয়েন নিতে উপরের বাটনে ট্যাপ করুন।'
            : `⏳ মাল্টি-অ্যাড স্ট্রীম চলছে... বাকি আছে ${secondsRemaining} সেকেন্ড`}
        </p>
      </div>
    </div>
  );
};
