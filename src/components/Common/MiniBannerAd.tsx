import React, { useState } from 'react';
import { ExternalLink, Sparkles, Coins, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';
import { AdViewerModal } from './AdViewerModal';
import { AdsterraBannerUnit } from './AdsterraBannerUnit';

interface MiniBannerProps {
  slotId?: string;
  category?: 'finance' | 'gaming' | 'shopping' | 'travel';
}

export const MiniBannerAd: React.FC<MiniBannerProps> = ({ slotId = 'default', category = 'finance' }) => {
  const { showToast, triggerConfetti, settings } = useApp();
  const { user, refreshUser } = useAuth();
  const [clicked, setClicked] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [pendingAdUrl, setPendingAdUrl] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const clicksToday = user?.lastAdClickDate === todayStr ? (user?.adClicksToday || 0) : 0;
  const maxClicks = 10;
  const isLimitReached = clicksToday >= maxClicks;

  // High-fidelity full-bleed responsive banner graphics
  const ads = [
    {
      title: 'নগদ মেগা বোনাস! ৫০ টাকা নিশ্চিত ক্যাশব্যাক',
      desc: 'বিজ্ঞাপনে এক ক্লিকেই অফার পেজ দেখুন এবং জিতে নিন বিশেষ ছাড়!',
      sponsor: 'Nagad Official Promo 🇧🇩',
      tag: 'AD • 320x100 SPONSOR',
      cta: 'অফার নিন (+১৫ কয়েন)',
      link: 'https://nagad.com.bd',
      bannerBg: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      badgeGradient: 'from-amber-500 to-orange-500 text-slate-950',
      highlightBadge: 'স্পেশাল বোনাস অফার'
    },
    {
      title: 'দারাজ গ্র্যান্ড বৈশাখী মেলা! ৮০% পর্যন্ত ক্যাশ ছাড়',
      desc: 'ফ্রি হোম ডেলিভারিতে সেরা স্মার্টফোন ও গ্যাজেট কিনুন ঘরে বসেই।',
      sponsor: 'Daraz Bangladesh 🛍️',
      tag: 'SPONSORED CAMPAIGN',
      cta: 'শপ করুন (+১৫ কয়েন)',
      link: 'https://daraz.com.bd',
      bannerBg: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
      badgeGradient: 'from-orange-500 to-red-500 text-white',
      highlightBadge: 'লিমিটেড টাইম মেগা সেল'
    },
    {
      title: 'বিকাশ সেন্ড মানি সম্পূর্ণ ফ্রি ও ক্যাশআউট বোনাস!',
      desc: 'প্রিয় ৫টি নাম্বারে ০% খরচে টাকা পাঠান ও আকর্ষণীয় ভাউচার পান।',
      sponsor: 'bKash Payments 📲',
      tag: 'AD • PREMIUM OFFER',
      cta: 'বিস্তারিত দেখুন (+১৫ কয়েন)',
      link: 'https://bkash.com',
      bannerBg: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80',
      badgeGradient: 'from-pink-500 to-rose-600 text-white',
      highlightBadge: '১০০% ফ্রি অফার'
    },
    {
      title: 'চালডাল তাজা গ্রোসারি! ঘরে বসেই ১ ঘণ্টায় ডেলিভারি',
      desc: 'প্রথম অর্ডারে বিশেষ ডিসকাউন্ট এবং ফ্রি এক্সপ্রেস হোম ডেলিভারি!',
      sponsor: 'Chaldal BD Groceries 🛒',
      tag: 'SPONSORED PARTNER',
      cta: 'অর্ডার করুন (+১৫ কয়েন)',
      link: 'https://chaldal.com',
      bannerBg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      badgeGradient: 'from-emerald-500 to-teal-500 text-slate-950',
      highlightBadge: 'দ্রুত হোম ডেলিভারি'
    }
  ];

  // Pick ad based on slotId
  const adIndex = Math.abs((slotId.charCodeAt(0) || 0) + slotId.length) % ads.length;
  const currentAd = ads[adIndex];

  const handleAdClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isLimitReached) {
      showToast('🔒 আজকের সীমা শেষ!', 'আপনি আজকে সর্বোচ্চ ১০টি বিজ্ঞাপনে ক্লিক করেছেন। অ্যাকাউন্ট সুরক্ষার জন্য আগামীকাল আবার চালু হবে।', 'info');
      return;
    }

    const targetUrl = settings?.adsConfig?.adsterraDirectLink?.trim() || currentAd.link;
    setPendingAdUrl(targetUrl);
    setShowViewerModal(true);
  };

  const handleClaimAdReward = async () => {
    setClicked(true);
    try {
      const res = await api.claimAdClick();
      if (res?.success) {
        soundService.playCoinReward();
        triggerConfetti();
        await refreshUser();
        showToast(
          `🎁 +${res.earnedCoins || 15} কয়েন আপনার অ্যাকাউন্টে সফলভাবে যোগ হয়েছে!`,
          `আজকের বাকি বিজ্ঞাপন: ${res.remainingClicks ?? (maxClicks - clicksToday - 1)}টি।`,
          'coin'
        );
      } else if (res?.limitReached) {
        showToast('🔒 আজকের সীমা সম্পন্ন হয়েছে!', res.message || '১০টি ক্লিক পূর্ণ হয়েছে। আগামীকাল আবার নতুন ক্লিক চালু হবে।', 'info');
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* 🌟 1. Real Official Adsterra 300x250 Banner */}
      {settings?.adsConfig?.bannerEnabled !== false && (
        <AdsterraBannerUnit />
      )}

      {/* 🌟 2. Interactive Rewarded Sponsor Offer Banner */}
      <div 
        onClick={() => handleAdClick()}
        className="w-full relative overflow-hidden rounded-2xl border-2 border-amber-500/50 shadow-xl group transition-all duration-300 hover:border-amber-400 cursor-pointer active:scale-[0.99]"
      >
        {/* Full-bleed background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${currentAd.bannerBg})` }}
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-slate-950/85 to-black/70 backdrop-blur-[1px]" />

        {/* Banner Content */}
        <div className="relative z-10 p-3.5 sm:p-4 flex flex-col justify-between min-h-[110px] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] tracking-wider uppercase flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                {currentAd.tag}
              </span>
              <span className="text-[10px] font-bold text-slate-300">
                {currentAd.sponsor}
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
              +{clicksToday}/{maxClicks} সম্পন্ন
            </span>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-md">
              {currentAd.title}
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              {currentAd.desc}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-amber-300 font-medium">
              ⚡ ট্যাপ করে অফার দেখুন ও কয়েন নিন
            </span>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{currentAd.cta}</span>
            </button>
          </div>
        </div>
      </div>

      {/* In-App Safe Ad Modal with prominent close button */}
      <AdViewerModal
        isOpen={showViewerModal}
        adUrl={pendingAdUrl}
        durationSeconds={8}
        rewardCoins={15}
        onCompleted={handleClaimAdReward}
        onClose={() => setShowViewerModal(false)}
      />
    </div>
  );
};
