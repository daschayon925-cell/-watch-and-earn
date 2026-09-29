import React, { useState } from 'react';
import { ExternalLink, Sparkles, X, Info, Coins } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';

interface MiniBannerProps {
  slotId?: string;
  category?: 'finance' | 'gaming' | 'shopping' | 'travel';
}

export const MiniBannerAd: React.FC<MiniBannerProps> = ({ slotId = 'default', category = 'finance' }) => {
  const { showToast, triggerConfetti, settings } = useApp();
  const { refreshUser } = useAuth();
  const [clicked, setClicked] = useState(false);

  const ads = [
    {
      title: 'Nagad Mega Offer! ৫০ টাকা ক্যাশব্যাক',
      desc: 'বিজ্ঞাপনে ক্লিক করে পেয়ে যান আকর্ষণীয় ক্যাশব্যাক অফার।',
      sponsor: 'Nagad Promo',
      tag: 'Ad • 320x50',
      cta: 'অফার নিন (+১৫ কয়েন)',
      link: 'https://nagad.com.bd',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
      gradient: 'from-amber-950/80 via-slate-900 to-orange-950/80',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Daraz Grand Sale! ৮০% পর্যন্ত ছাড়',
      desc: 'সেরা গ্যাজেট কিনুন ফ্রি ডেলিভারিতে!',
      sponsor: 'Daraz BD',
      tag: 'Sponsored Ad',
      cta: 'শপ করুন (+১৫ কয়েন)',
      link: 'https://daraz.com.bd',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&auto=format&fit=crop&q=80',
      gradient: 'from-orange-950/80 via-slate-900 to-red-950/80',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    {
      title: 'Bkash Send Money সম্পূর্ণ ফ্রি!',
      desc: 'প্রিয় ৫টি নাম্বারে ক্যাশআউট চার্জ ছাড়া পাঠান।',
      sponsor: 'bKash Limited',
      tag: 'Ad Banner',
      cta: 'বিস্তারিত (+১৫ কয়েন)',
      link: 'https://bkash.com',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&auto=format&fit=crop&q=80',
      gradient: 'from-pink-950/80 via-slate-900 to-rose-950/80',
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    },
    {
      title: 'Chaldal Grocery! ১ ঘণ্টায় ডেলিভারি',
      desc: 'তাজা শাকসবজি ও মুদি সামগ্রী পান ঘরে বসেই।',
      sponsor: 'Chaldal Online',
      tag: 'Sponsored',
      cta: 'অর্ডার দিন (+১৫ কয়েন)',
      link: 'https://chaldal.com',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
      gradient: 'from-emerald-950/80 via-slate-900 to-teal-950/80',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
  ];

  // Pick ad based on slotId
  const adIndex = Math.abs((slotId.charCodeAt(0) || 0) + slotId.length) % ads.length;
  const currentAd = ads[adIndex];

  const handleAdClick = async () => {
    // Primary monetize via Adsterra Direct Link if configured
    const targetUrl = settings?.adsConfig?.adsterraDirectLink?.trim() || currentAd.link;
    window.open(targetUrl, '_blank');
    setClicked(true);

    try {
      const res = await api.claimAdClick();
      if (res?.success) {
        soundService.playCoinReward();
        triggerConfetti();
        await refreshUser();
        showToast(`🎁 +${res.earnedCoins || 15} কয়েন বোনাস পেয়ে গেছেন!`, `আজ আর ${res.remainingClicks || 0} টি অ্যাডে ক্লিক করে কয়েন নিতে পারবেন।`, 'coin');
      } else if (res?.limitReached) {
        showToast('আজকের বিজ্ঞাপনের ক্লিকের সীমা শেষ!', res.message || 'আগামীকাল আবার ক্লিক করে কয়েন নিন।', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`w-full rounded-2xl bg-gradient-to-r ${currentAd.gradient} border border-amber-500/30 p-2.5 shadow-lg relative overflow-hidden transition-all hover:border-amber-400/60`}>
      {/* Tiny Google/Network Ad Marker */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider border ${currentAd.badgeColor}`}>
            {currentAd.tag}
          </span>
          <span className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">
            {currentAd.sponsor}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[8px] text-amber-400/90 font-semibold">
          <Coins className="w-2.5 h-2.5 text-amber-400" />
          <span>ক্লিক করলেই +১৫ কয়েন</span>
        </div>
      </div>

      {/* Main Banner Content */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {currentAd.image && (
            <img 
              src={currentAd.image} 
              alt={currentAd.sponsor} 
              className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0 shadow-sm"
            />
          )}
          <div className="min-w-0 flex-1">
            <h5 className="text-[11px] font-black text-white truncate leading-snug">
              {currentAd.title}
            </h5>
            <p className="text-[9px] text-slate-300 truncate mt-0.5">
              {currentAd.desc}
            </p>
          </div>
        </div>

        <button
          onClick={handleAdClick}
          className="shrink-0 px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-[10px] rounded-xl shadow-md active:scale-95 transition flex items-center gap-1 cursor-pointer"
        >
          <span>{currentAd.cta}</span>
          <ExternalLink className="w-2.5 h-2.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
