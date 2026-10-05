import React, { useState, useEffect } from 'react';
import { Gift, MessageSquare, Sparkles, X, ChevronRight, Zap, Bell, Coins, Flame, ExternalLink, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { triggerAdReward } from '../../services/adBonus';
import { openAdWithStrictTimer } from './AdVisitTimerModal';

interface TopSocialPushItem {
  id: string;
  sender: string;
  message: string;
  badge: string;
  avatarBg: string;
  timeAgo: string;
}

interface BottomDirectLinkItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  gradient: string;
}

// 💬 1. TOP BAR: Dedicated Social Bar (Authentic VPN, Facebook Messenger, and Push Alert Styles)
const TOP_SOCIAL_PUSH_ADS: TopSocialPushItem[] = [
  {
    id: 'sb_vpn_1',
    sender: '🛡️ Turbo Super Fast VPN',
    message: '⚡ আপনার ইন্টারনেট স্পিড বাড়াতে ও সিকিউর করতে VPN কানেক্ট করুন!',
    badge: 'VPN প্রোটেকশন',
    avatarBg: 'from-emerald-500 via-teal-600 to-cyan-600',
    timeAgo: 'এখনই'
  },
  {
    id: 'sb_fb_1',
    sender: '💬 Facebook Messenger Alert',
    message: '📩 আপনার প্রোফাইলে ১টি নতুন মেসেজ ও নোটিফিকেশন এসেছে!',
    badge: 'ফেসবুক অ্যালার্ট',
    avatarBg: 'from-blue-600 to-indigo-700',
    timeAgo: '১ মি. আগে'
  },
  {
    id: 'sb_booster_1',
    sender: '⚡ ফোন বুস্টার ও ব্যাটারি সেভার',
    message: '🚀 মেমরি পরিষ্কার করে মোবাইল ১০০% ফাস্ট ও কুল করুন!',
    badge: 'সিস্টেম বুস্ট',
    avatarBg: 'from-amber-500 to-orange-600',
    timeAgo: 'এখনই'
  },
  {
    id: 'sb_gift_1',
    sender: '🎁 বিকাশ ও নগদ রিওয়ার্ড নোটিশ',
    message: '💸 ৫০ টাকা পর্যন্ত ক্যাশব্যাক ও ফ্রি রিচার্জ অফার চালু হয়েছে!',
    badge: 'ক্যাশব্যাক গিফট',
    avatarBg: 'from-pink-500 to-rose-600',
    timeAgo: '২ মি. আগে'
  }
];

// ⚡ 2. BOTTOM BAR: Dedicated Direct Link Ad (High-CPM Direct Link Converter)
const BOTTOM_DIRECT_LINK_ADS: BottomDirectLinkItem[] = [
  {
    id: 'dl_ad_1',
    title: '👉 ডিরেক্ট লিংক বিজ্ঞাপনে চাপ দিলে পাবেন ১০ কয়েন!',
    subtitle: 'লিংকে চাপ দিয়ে অফার পেজ ১০ সেকেন্ড ভিজিট করুন ও কয়েন নিশ্চিত করুন।',
    badge: 'ডিরেক্ট লিংক অ্যাড',
    ctaText: 'চাপ দিন (+১০)',
    gradient: 'from-amber-500/20 via-yellow-500/25 to-amber-500/20 border-amber-400'
  },
  {
    id: 'dl_ad_2',
    title: '🔥 স্পেশাল ডিরেক্ট লিংক অফার – ইনস্ট্যান্ট কয়েন রিওয়ার্ড',
    subtitle: 'এখানে চাপ দিন এবং যেকোনো অফার দেখে বাড়তি ১০ পয়েন্ট জিতে নিন!',
    badge: 'ডিরেক্ট লিংক অফার',
    ctaText: 'ক্লেইম (+১০)',
    gradient: 'from-rose-500/20 via-amber-500/25 to-rose-500/20 border-rose-400'
  },
  {
    id: 'dl_ad_3',
    title: '🛍️ দারাজ ও বিকাশ মেগা প্রমোশন ডিরেক্ট লিংক',
    subtitle: 'বিজ্ঞাপনে ১টি ক্লিক করলেই একাউন্টে সরাসরি ১০ কয়েন বোনাস জমা হবে।',
    badge: 'স্পনসর ডিরেক্ট লিংক',
    ctaText: 'ওপেন (+১০)',
    gradient: 'from-emerald-500/20 via-teal-500/25 to-emerald-500/20 border-emerald-400'
  }
];

export const ContinuousSocialBar: React.FC = () => {
  const { settings, showToast, activeTab } = useApp();
  const { user, awardCoinsLocally } = useAuth();

  // Top Social Bar State (Push / Chat style)
  const [topIndex, setTopIndex] = useState(0);
  const [isTopVisible, setIsTopVisible] = useState(false);
  const [isTopDismissed, setIsTopDismissed] = useState(false);

  // Bottom Direct Link State
  const [bottomIndex, setBottomIndex] = useState(0);
  const [isBottomVisible, setIsBottomVisible] = useState(false);
  const [isBottomDismissed, setIsBottomDismissed] = useState(false);

  // 🛡️ Completely disable all social bar ads in admin panel and during auth modal
  if (!user || (activeTab as string) === 'admin') {
    return null;
  }

  const adsterraLink =
    settings?.adsConfig?.adsterraDirectLink?.trim() ||
    'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const hilltopAdsLink =
    settings?.adsConfig?.hilltopAdsDirectLink?.trim() ||
    'https://affectionatestorage.com/Ah6g5c';
  const monetagLink =
    settings?.adsConfig?.monetagDirectLink?.trim() ||
    'https://5gvci.com/act/files/tag.min.js?z=11948885';

  const randVal = Math.random();
  const directLink = randVal < 0.33 ? adsterraLink : randVal < 0.66 ? hilltopAdsLink : monetagLink;

  // 💬 Top Social Bar Lifecycle (Cycles smoothly)
  useEffect(() => {
    const topInitial = setTimeout(() => {
      setIsTopVisible(true);
    }, 1000);

    const topInterval = setInterval(() => {
      setIsTopVisible(false);
      setTimeout(() => {
        setTopIndex((prev) => (prev + 1) % TOP_SOCIAL_PUSH_ADS.length);
        setIsTopDismissed(false);
        setIsTopVisible(true);
      }, 2000);
    }, 20000);

    return () => {
      clearTimeout(topInitial);
      clearInterval(topInterval);
    };
  }, []);

  // ⚡ Bottom Direct Link Bar Lifecycle (Shows intermittently with delay)
  useEffect(() => {
    const bottomInitial = setTimeout(() => {
      setIsBottomVisible(true);
    }, 12000);

    const bottomInterval = setInterval(() => {
      setIsBottomVisible(false);
      setTimeout(() => {
        setBottomIndex((prev) => (prev + 1) % BOTTOM_DIRECT_LINK_ADS.length);
        setIsBottomDismissed(false);
        setIsBottomVisible(true);
      }, 3000);
    }, 25000);

    return () => {
      clearTimeout(bottomInitial);
      clearInterval(bottomInterval);
    };
  }, []);

  const handleOpenAd = (e: React.MouseEvent, typeLabel: string) => {
    e.stopPropagation();
    // 🛡️ Enforce strict 20-second ad visit verification modal
    openAdWithStrictTimer(directLink, typeLabel, 10, 20);
  };

  const handleDismissTop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTopDismissed(true);
    setIsTopVisible(false);
    setTimeout(() => {
      setTopIndex((prev) => (prev + 1) % TOP_SOCIAL_PUSH_ADS.length);
      setIsTopDismissed(false);
      setIsTopVisible(true);
    }, 10000);
  };

  const handleDismissBottom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBottomDismissed(true);
    setIsBottomVisible(false);
    setTimeout(() => {
      setBottomIndex((prev) => (prev + 1) % BOTTOM_DIRECT_LINK_ADS.length);
      setIsBottomDismissed(false);
      setIsBottomVisible(true);
    }, 8000);
  };

  const topPush = TOP_SOCIAL_PUSH_ADS[topIndex];
  const bottomDL = BOTTOM_DIRECT_LINK_ADS[bottomIndex];

  return (
    <>
      {/* ⚡ SINGLE BOTTOM FLOATING SPONSOR & SOCIAL BAR NOTIFICATION (Above Bottom Nav, Never Blocking Top Buttons) */}
      {(isTopVisible && !isTopDismissed) ? (
        <aside 
          aria-label="Social Bar Alert"
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:w-88 z-40 animate-in slide-in-from-bottom duration-300 pointer-events-auto shadow-2xl"
        >
          <div 
            onClick={(e) => {
              handleOpenAd(e, 'সোশ্যাল বার বিজ্ঞাপন');
              setIsTopVisible(false);
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0d1527]/98 border border-blue-500/60 p-2.5 sm:p-3 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all hover:border-blue-400 active:scale-[0.98]"
          >
            {/* Ambient Blue Glow */}
            <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

            <div className="flex items-center gap-2.5">
              {/* Chat Avatar */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${topPush.avatarBg} p-0.5 shadow-md flex-shrink-0 flex items-center justify-center text-white font-bold relative`}>
                <MessageSquare className="w-5 h-5 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900" />
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/40 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 fill-blue-300 text-blue-300" />
                    {topPush.badge}
                  </span>
                  <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                    +১০ কয়েন 🪙
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition">
                  {topPush.sender}
                </h4>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">
                  {topPush.message}
                </p>
                <div className="text-[10px] font-black text-emerald-400 mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>👉 চাপ দিলে ১০ কয়েন পাবেন (২০ সে. ভিজিট)</span>
                </div>
              </div>

              {/* CTA Action */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] font-black bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 text-white px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition border border-white/20">
                  <span>ওপেন</span>
                  <Send className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismissTop}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="বিজ্ঞাপন বন্ধ করুন"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </aside>
      ) : (isBottomVisible && !isBottomDismissed) ? (
        <aside 
          aria-label="Sponsored Notification"
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:w-88 z-40 animate-in slide-in-from-bottom duration-300 pointer-events-auto shadow-2xl"
        >
          <div 
            onClick={(e) => {
              handleOpenAd(e, 'স্পনসর মেসেজ বিজ্ঞাপন');
              setIsBottomVisible(false);
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0d1627]/98 border border-cyan-500/40 p-2.5 sm:p-3 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all hover:border-cyan-400 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              {/* Messenger Icon Box */}
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 p-1 shadow flex-shrink-0 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-5 h-5 fill-cyan-400 text-cyan-400 animate-pulse" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[9px] border border-amber-500/30">
                    মেসেজ
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    স্পনসর
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>💬 নতুন স্পনসর মেসেজ</span>
                </h4>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">
                  আপনার জন্য ১টি বিশেষ প্রমোশন অপেক্ষা করছে (চাপ দিলে ১০ কয়েন)
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition">
                  <span>দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismissBottom}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="বিজ্ঞাপন বন্ধ করুন"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
};
