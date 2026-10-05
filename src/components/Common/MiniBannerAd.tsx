import React, { useState } from 'react';
import { Sparkles, Zap, ExternalLink, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { openAdWithStrictTimer } from './AdVisitTimerModal';

interface MiniBannerProps {
  slotId?: string;
  category?: 'finance' | 'gaming' | 'shopping' | 'travel';
  className?: string;
}

export const MiniBannerAd: React.FC<MiniBannerProps> = ({ slotId = 'default', className = '' }) => {
  const { showToast, settings } = useApp();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const clicksToday = user?.lastAdClickDate === todayStr ? (user?.adClicksToday || 0) : 0;
  const maxClicks = 10;
  const isLimitReached = clicksToday >= maxClicks;

  const adsterraLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const hilltopAdsLink = settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c';
  
  // Dynamic rotation: alternates between Adsterra & HilltopAds for double earnings
  const directLink = (clicksToday % 2 === 0) ? hilltopAdsLink : adsterraLink;

  // Rich Authentic Bangladesh Sponsor Campaigns (Matches Image 2 exactly)
  const ADS = [
    {
      tag: 'SPONSORED CAMPAIGN',
      sponsor: 'Daraz Bangladesh 🛍️',
      title: 'দারাজ গ্র্যান্ড বৈশাখী মেলা! ৮০% পর্যন্ত ক্যাশ ছাড়',
      desc: 'ফ্রি হোম ডেলিভারিতে সেরা স্মার্টফোন ও গ্যাজেট কিনুন ঘরে বসেই।',
      cta: 'শপ করুন (+১০ কয়েন)',
      bgImg: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80'
    },
    {
      tag: 'PREMIUM PARTNER',
      sponsor: 'Nagad Official Promo 🇧🇩',
      title: 'নগদ মেগা রিওয়ার্ড বোনাস! নিশ্চিত ক্যাশব্যাক অফার',
      desc: 'বিজ্ঞাপনে ক্লিক করে অফার দেখুন এবং জিতে নিন বিশেষ ক্যাশ রিওয়ার্ড।',
      cta: 'অফার দেখুন (+১০ কয়েন)',
      bgImg: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80'
    },
    {
      tag: 'VERIFIED SPONSOR',
      sponsor: 'bKash Payments 📲',
      title: 'বিকাশ সেন্ড মানি সম্পূর্ণ ফ্রি ও পেমেন্ট বোনাস!',
      desc: 'প্রিয় নাম্বারে ফ্রিতে টাকা পাঠান ও জিতে নিন আকর্ষণীয় ভাউচার।',
      cta: 'বিস্তারিত দেখুন (+১০ কয়েন)',
      bgImg: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const adIndex = Math.abs((slotId.charCodeAt(0) || 0) + slotId.length) % ADS.length;
  const currentAd = ADS[adIndex];

  const handleAdClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isLimitReached) {
      showToast(
        '🔒 আজকের সীমা পূর্ণ!',
        'আপনি আজকে সর্বোচ্চ ১০টি বিজ্ঞাপনে ক্লিক করেছেন। অ্যাকাউন্ট সুরক্ষার জন্য আগামীকাল আবার চালু হবে।',
        'info'
      );
      return;
    }

    // Launch 20s strict countdown verification modal
    openAdWithStrictTimer(directLink, `স্পন্সর ব্যানার (${currentAd.sponsor})`, 10, 20);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`w-full my-2 ${className}`}>
      {/* 🌟 2-Picture Exact Style: Compact, High-converting Rich Sponsor Banner */}
      <div
        onClick={handleAdClick}
        className="w-full relative overflow-hidden rounded-2xl border-2 border-amber-500/70 bg-[#0d1322] shadow-xl group transition-all duration-300 hover:border-amber-400 cursor-pointer active:scale-[0.99]"
      >
        {/* Full-bleed background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-25"
          style={{ backgroundImage: `url(${currentAd.bgImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-[#0b101c]/90 to-black/80" />

        {/* Banner Content Container */}
        <div className="relative z-10 p-3 sm:p-3.5 flex flex-col justify-between space-y-2">
          {/* Top Row: Sponsor Badges & Completed Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] tracking-wider uppercase flex items-center gap-1 shadow">
                <Sparkles className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                {currentAd.tag}
              </span>
              <span className="text-[11px] font-bold text-slate-200">
                {currentAd.sponsor}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/40">
                +{clicksToday}/{maxClicks} সম্পন্ন
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
                title="বিজ্ঞাপন বন্ধ করুন"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
              {currentAd.title}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              {currentAd.desc}
            </p>
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
            <div className="flex items-center gap-1 text-xs font-black text-amber-300 animate-pulse">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>👉 ক্লিক করে অফার দেখুন ও ১০ কয়েন নিন</span>
            </div>

            <button
              type="button"
              onClick={handleAdClick}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition border border-white shrink-0 cursor-pointer"
            >
              <span>{currentAd.cta}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdsterraBannerUnit = MiniBannerAd;
