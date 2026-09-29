import React, { useState } from 'react';
import { ExternalLink, Sparkles, X, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';

interface MiniBannerProps {
  slotId?: string;
  category?: 'finance' | 'gaming' | 'shopping' | 'travel';
}

export const MiniBannerAd: React.FC<MiniBannerProps> = ({ slotId = 'default', category = 'finance' }) => {
  const { showToast, triggerConfetti } = useApp();
  const { refreshUser } = useAuth();
  const [clicked, setClicked] = useState(false);

  const ads = [
    {
      title: 'Nagad Mega Offer! ৫০ টাকা ক্যাশব্যাক',
      desc: 'আজই রিচার্জে উপভোগ করুন নিশ্চিত ক্যাশব্যাক অফার।',
      sponsor: 'Nagad Bangladesh',
      tag: 'Ad 320x50',
      cta: 'অফার নিন',
      link: 'https://nagad.com.bd',
      gradient: 'from-amber-950/60 via-slate-900 to-orange-950/60',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Daraz Grand Sale! ৮০% পর্যন্ত ছাড়',
      desc: 'সেরা ব্র্যান্ডের গ্যাজেট কিনুন ফ্রি ডেলিভারিতে!',
      sponsor: 'Daraz BD Mall',
      tag: 'Sponsored Ad',
      cta: 'শপ করুন',
      link: 'https://daraz.com.bd',
      gradient: 'from-orange-950/60 via-slate-900 to-red-950/60',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    {
      title: 'Bkash Send Money সম্পূর্ণ ফ্রি!',
      desc: 'প্রিয় ৫টি নাম্বারে পাঠান কোনো চার্জ ছাড়াই।',
      sponsor: 'bKash Limited',
      tag: 'Ad Banner',
      cta: 'বিস্তারিত',
      link: 'https://bkash.com',
      gradient: 'from-pink-950/60 via-slate-900 to-rose-950/60',
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    },
    {
      title: 'Chaldal Grocery! ১ ঘণ্টায় ডেলিভারি',
      desc: 'তাজা শাকসবজি ও মুদি সামগ্রী পান ঘরে বসেই।',
      sponsor: 'Chaldal BD',
      tag: 'Sponsored',
      cta: 'অর্ডার দিন',
      link: 'https://chaldal.com',
      gradient: 'from-emerald-950/60 via-slate-900 to-teal-950/60',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
  ];

  // Pick ad based on slotId
  const adIndex = Math.abs((slotId.charCodeAt(0) || 0) + slotId.length) % ads.length;
  const currentAd = ads[adIndex];

  const handleAdClick = () => {
    soundService.playCoinReward();
    showToast('🎁 স্পনসর ব্যানারে ক্লিক করার জন্য ধন্যবাদ!', '+৫ কয়েন বোনাস বিবেচনাধীন', 'coin');
    window.open(currentAd.link, '_blank');
    setClicked(true);
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

        <div className="flex items-center gap-1 text-[8px] text-slate-500">
          <Info className="w-2.5 h-2.5" />
          <span>Google Ads by Partner</span>
        </div>
      </div>

      {/* Main Banner Content */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h5 className="text-[11px] font-black text-white truncate leading-snug">
            {currentAd.title}
          </h5>
          <p className="text-[9px] text-slate-300 truncate mt-0.5">
            {currentAd.desc}
          </p>
        </div>

        <button
          onClick={handleAdClick}
          className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-[10px] rounded-xl shadow-md active:scale-95 transition flex items-center gap-1"
        >
          <span>{currentAd.cta}</span>
          <ExternalLink className="w-2.5 h-2.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
