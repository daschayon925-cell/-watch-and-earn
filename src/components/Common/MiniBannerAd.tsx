import React, { useState } from 'react';
import { Sparkles, Zap, ExternalLink, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { openAdWithStrictTimer } from './AdVisitTimerModal';
import { getRandomSafeDirectLink } from '../../utils/adLinkSanitizer';

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
  const maxClicks = settings?.maxDailyAdClicks || 15;
  const isLimitReached = clicksToday >= maxClicks;

  // 🛡️ Verified rotation across Monetag, HilltopAds, and Adsterra
  const directLink = getRandomSafeDirectLink(settings?.adsConfig);

  // Rich Authentic Bangladesh Sponsor Campaigns (Matches Image 2 exactly)
  const ADS = [
    {
      tag: 'SPONSORED CAMPAIGN',
      sponsor: 'Daraz Bangladesh 🛍️',
      title: 'দারাজ গ্র্যান্ড মেগা মেলা! ৮০% পর্যন্ত ক্যাশ ছাড়',
      desc: 'ফ্রি হোম ডেলিভারিতে সেরা স্মার্টফোন ও গ্যাজেট কিনুন ঘরে বসেই।',
      cta: 'শপ করুন (+১৫ কয়েন)',
      bgImg: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80'
    },
    {
      tag: 'PREMIUM PARTNER',
      sponsor: 'Nagad Official Promo 🇧🇩',
      title: 'নগদ মেগা রিওয়ার্ড বোনাস! নিশ্চিত ক্যাশব্যাক অফার',
      desc: 'বিজ্ঞাপনে ক্লিক করে অফার দেখুন এবং জিতে নিন বিশেষ ক্যাশ রিওয়ার্ড।',
      cta: 'অফার দেখুন (+১৫ কয়েন)',
      bgImg: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80'
    },
    {
      tag: 'VERIFIED SPONSOR',
      sponsor: 'bKash Payments 📲',
      title: 'বিকাশ সেন্ড মানি সম্পূর্ণ ফ্রি ও পেমেন্ট বোনাস!',
      desc: 'প্রিয় নাম্বারে ফ্রিতে টাকা পাঠান ও জিতে নিন আকর্ষণীয় ভাউচার।',
      cta: 'বিস্তারিত দেখুন (+১৫ কয়েন)',
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
        `আপনি আজকে সর্বোচ্চ ${maxClicks}টি বিজ্ঞাপনে ক্লিক করেছেন। অ্যাকাউন্ট সুরক্ষার জন্য আগামীকাল আবার চালু হবে।`,
        'info'
      );
      return;
    }

    // Launch 20s strict countdown verification modal (+15 coins)
    openAdWithStrictTimer(directLink, `স্পন্সর ব্যানার (${currentAd.sponsor})`, 15, 20);
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

        {/* Banner Content Container (Compact Sleek Layout) */}
        <div className="relative z-10 px-3 py-2 flex flex-col justify-between space-y-1.5">
          {/* Top Row: Sponsor Badges & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] tracking-wider uppercase flex items-center gap-0.5 shadow">
                <Sparkles className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                <span>স্পনসর</span>
              </span>
              <span className="text-[11px] font-bold text-slate-200 truncate max-w-[150px]">
                {currentAd.sponsor}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                +১৫ কয়েন 🪙
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

          {/* Bottom Row: Title + Action Button */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-black text-white truncate flex-1 min-w-0">
              {currentAd.title}
            </h4>

            <button
              type="button"
              onClick={handleAdClick}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-[11px] shadow flex items-center gap-1 active:scale-95 transition shrink-0 cursor-pointer"
            >
              <span>{currentAd.cta}</span>
              <ExternalLink className="w-3 h-3 text-slate-950" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdsterraBannerUnit = MiniBannerAd;
