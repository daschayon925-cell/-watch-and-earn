import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ExternalLink, Zap, ShieldCheck, TrendingUp, Gift, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { openAdWithStrictTimer } from './AdVisitTimerModal';

interface AdsterraBannerUnitProps {
  className?: string;
  slotId?: string;
}

export const AdsterraBannerUnit: React.FC<AdsterraBannerUnitProps> = ({ className = '', slotId = 'default' }) => {
  const { settings } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const adsterraLink =
    settings?.adsConfig?.adsterraDirectLink?.trim() ||
    'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const monetagLink = settings?.adsConfig?.monetagDirectLink?.trim();
  const directLink = (monetagLink && Math.random() > 0.5) ? monetagLink : adsterraLink;

  const bannerKey = '026df0717402ab99e2cfeea66cbde373';

  // Dynamic sponsor campaigns to prevent black void
  const BANNERS = [
    {
      title: 'BKash & Nagad ক্যাশব্যাক মেগা অফার! 🎁',
      desc: 'প্রতিটি লেনদেনে পাচ্ছেন নিশ্চিত ক্যাশব্যাক ও বোনাস রিওয়ার্ড।',
      tag: 'HOT PROMOTION',
      img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      cta: 'ক্যাশব্যাক নিন (+১০)',
      brand: 'অফিশিয়াল স্পন্সর'
    },
    {
      title: 'দারাজ মেগা সেল! ৮০% পর্যন্ত ছাড় ও ফ্রি ডেলিভারি 🛍️',
      desc: 'স্মার্টফোন, ইলেকট্রনিক্স ও গ্যাজেট কিনুন আকর্ষণীয় অফারে।',
      tag: 'MEGA DEALS',
      img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
      cta: 'অফার দেখুন (+১০)',
      brand: 'Daraz BD'
    },
    {
      title: 'ফ্রি ফায়ার ও পাবজি গেমারস ডায়মন্ড বোনাস 🎮',
      desc: 'লাইভ গেমিং অফারে অংশ নিন ও ইনস্ট্যান্ট ডায়মন্ড রিওয়ার্ড জিতুন।',
      tag: 'GAMING REWARD',
      img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      cta: 'বোনাস নিন (+১০)',
      brand: 'Gaming Hub'
    }
  ];

  const currentBanner = BANNERS[Math.abs(slotId.charCodeAt(0) || 0) % BANNERS.length];

  // Try injecting Adsterra real script into container safely
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    try {
      // Set options in window scope
      (window as any).atOptions = {
        key: bannerKey,
        format: 'iframe',
        height: 250,
        width: 300,
        params: {}
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.highrevenueformat.com/${bannerKey}/invoke.js`;
      script.async = true;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    } catch (e) {
      console.log('Adsterra script note:', e);
    }
  }, [bannerKey, slotId]);

  const handleBannerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAdWithStrictTimer(directLink, 'ভেরিফায়েড স্পন্সর বিজ্ঞাপন', 10, 20);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`w-full my-2 relative flex flex-col rounded-2xl bg-[#0a101d] border-2 border-emerald-500/50 shadow-2xl overflow-hidden ${className}`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full px-3 py-2 bg-slate-900/90 border-b border-emerald-500/20">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
            ভেরিফায়েড স্পন্সর বিজ্ঞাপন (NON-ADULT)
          </span>
        </div>

        {/* ❌ Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-full transition active:scale-95 border border-slate-700 cursor-pointer"
          title="বিজ্ঞাপন বন্ধ করুন"
        >
          <X className="w-3 h-3" />
          <span>বন্ধ</span>
        </button>
      </div>

      {/* 🌟 100% Guaranteed Clickable Ad Surface (Never Empty / Never Blank) */}
      <div 
        onClick={handleBannerClick}
        className="relative w-full min-h-[170px] sm:min-h-[190px] flex flex-col justify-between p-3.5 cursor-pointer overflow-hidden group"
      >
        {/* Adsterra DOM script hook (invisible/overlay) */}
        <div ref={containerRef} className="absolute inset-0 pointer-events-none opacity-0" />

        {/* Background visual banner with zoom animation */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-30"
          style={{ backgroundImage: `url(${currentBanner.img})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-[#0d1627]/90 to-black/85" />

        {/* Ad Creative Details */}
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[9px] uppercase tracking-wide shadow">
              {currentBanner.tag}
            </span>
            <span className="text-[10px] font-bold text-slate-300">
              {currentBanner.brand}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white group-hover:text-emerald-300 transition leading-snug">
            {currentBanner.title}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2">
            {currentBanner.desc}
          </p>
        </div>

        {/* Bottom CTA Bar with Guaranteed 1-Click Reward */}
        <div className="relative z-10 pt-2.5 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 animate-pulse">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span className="truncate">👉 চাপ দিলে ১০ কয়েন পাবেন (২০ সে. ভিজিট) 🪙</span>
          </div>

          <button
            type="button"
            onClick={handleBannerClick}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition border border-white shrink-0 cursor-pointer"
          >
            <span>{currentBanner.cta}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
