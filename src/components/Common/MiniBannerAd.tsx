import React, { useState } from 'react';
import { ExternalLink, Sparkles, Coins, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';
import { AdViewerModal } from './AdViewerModal';

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
    <div 
      onClick={() => handleAdClick()}
      className="w-full relative overflow-hidden rounded-2xl border-2 border-amber-500/50 shadow-xl group transition-all duration-300 hover:border-amber-400 cursor-pointer active:scale-[0.99]"
    >
      {/* 🌟 1. FULL-BLEED BACKGROUND BANNER IMAGE (পুরো ঘর জুড়ে ছবি) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${currentAd.bannerBg})` }}
      />

      {/* 🌟 2. DARK GRADIENT OVERLAY (লেখা ও বাটনের স্পষ্টতার জন্য সুন্দর সিনেমাটিক লেয়ার) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-slate-950/85 to-black/70 backdrop-blur-[1px]" />

      {/* 🌟 3. BANNER CONTENT CONTAINER */}
      <div className="relative z-10 p-3.5 flex flex-col justify-between min-h-[110px]">
        {/* Top Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gradient-to-r ${currentAd.badgeGradient} shadow-sm`}>
              {currentAd.tag}
            </span>
            <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 drop-shadow">
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
              {currentAd.highlightBadge}
            </span>
          </div>

          {/* Daily Coin Quota Pill */}
          <div className="flex items-center gap-1 text-[9px] font-black">
            {isLimitReached ? (
              <span className="text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/50">
                🔒 দৈনিক ১০/১০ সম্পন্ন
              </span>
            ) : (
              <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-amber-300">
                <Coins className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>+১৫ কয়েন ({clicksToday}/১০)</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Title & Sponsor Info */}
        <div className="my-auto pr-1">
          <span className="text-[10px] font-semibold text-slate-300 block mb-0.5">
            {currentAd.sponsor}
          </span>
          <h4 className="text-[13px] font-black text-white leading-tight drop-shadow-md">
            {currentAd.title}
          </h4>
          <p className="text-[10px] text-slate-200 mt-1 line-clamp-1 drop-shadow">
            {isLimitReached ? 'আজকের কোটা শেষ। আগামীকাল আবার ক্লিক করে ১৫ কয়েন পাবেন।' : currentAd.desc}
          </p>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-[10px] font-medium text-amber-200/90 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>ক্লিক করলেই সরাসরি ১৫ কয়েন ওয়ালেটে জমা হবে</span>
          </span>

          <button
            onClick={handleAdClick}
            disabled={isLimitReached}
            className={`px-3.5 py-1.5 font-black text-[11px] rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
              isLimitReached
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black shadow-amber-500/25 border border-amber-300'
            }`}
          >
            <span>{isLimitReached ? '🔒 কোটা শেষ' : currentAd.cta}</span>
            {!isLimitReached && <ExternalLink className="w-3 h-3 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* 25-Second Safe In-App Ad Viewer with One-Click Return */}
      <AdViewerModal
        isOpen={showViewerModal}
        adUrl={pendingAdUrl}
        durationSeconds={25}
        rewardCoins={15}
        onCompleted={handleClaimAdReward}
        onClose={() => setShowViewerModal(false)}
      />
    </div>
  );
};
