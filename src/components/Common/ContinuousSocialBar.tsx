import React, { useState, useEffect } from 'react';
import { Gift, MessageSquare, Sparkles, X, ChevronRight, Zap, Bell, Coins, Flame, ExternalLink, Send, Minimize2, Maximize2, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { openAdWithStrictTimer } from './AdVisitTimerModal';
import { getRandomSafeDirectLink } from '../../utils/adLinkSanitizer';

interface FloatingAdItem {
  id: string;
  badge: string;
  coins: number;
  title: string;
  subtitle: string;
  incentive: string;
  avatarBg: string;
}

// ⚡ HIGH-ENGAGEMENT AUTHENTIC FLOATING ADS (Compact, slim, non-obtrusive)
const FLOATING_ADS_LIST: FloatingAdItem[] = [
  {
    id: 'ad_booster',
    badge: '✨ সিস্টেম বুস্ট',
    coins: 10,
    title: '⚡ ফোন বুস্টার ও ব্যাটারি সেভার',
    subtitle: 'মেমরি পরিষ্কার করে মোবাইল ফাস্ট করুন!',
    incentive: '👉 ২০ সে. ভিজিটে ১০ কয়েন',
    avatarBg: 'from-amber-500 to-orange-600'
  },
  {
    id: 'ad_gift',
    badge: '🎁 বিকাশ ও নগদ রিওয়ার্ড',
    coins: 15,
    title: '💸 বিকাশ ক্যাশব্যাক ও ফ্রি রিচার্জ',
    subtitle: 'বিজ্ঞাপন দেখে বোনাস ক্যাশআউট নিন!',
    incentive: '👉 ২০ সে. ভিজিটে ১৫ কয়েন',
    avatarBg: 'from-pink-500 to-rose-600'
  },
  {
    id: 'ad_vpn',
    badge: '🛡️ VPN প্রোটেকশন',
    coins: 10,
    title: '🛡️ Turbo Super Fast VPN',
    subtitle: 'ইন্টারনেট স্পিড বাড়াতে কানেক্ট করুন!',
    incentive: '👉 ২০ সে. ভিজিটে ১০ কয়েন',
    avatarBg: 'from-emerald-500 via-teal-600 to-cyan-600'
  },
  {
    id: 'ad_fb',
    badge: '💬 ফেসবুক অ্যালার্ট',
    coins: 10,
    title: '💬 Facebook Messenger Alert',
    subtitle: 'প্রোফাইলে নতুন মেসেজ ও অফার এসেছে!',
    incentive: '👉 ২০ সে. ভিজিটে ১০ কয়েন',
    avatarBg: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'ad_sponsor',
    badge: '🔥 হাই-সিপিএম বোনাস',
    coins: 15,
    title: '👉 স্পনসর লিংকে স্পেশাল অফার',
    subtitle: 'অফার পেজ ভিজিট করুন ও কয়েন নিন।',
    incentive: '👉 ২০ সে. ভিজিটে ১৫ কয়েন',
    avatarBg: 'from-purple-600 to-indigo-600'
  }
];

export const ContinuousSocialBar: React.FC = () => {
  const { settings, showToast, activeTab, floatingAdsEnabled } = useApp();
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  // Default to 'top' as requested by user, compact and slim so buttons below are fully visible
  const [position, setPosition] = useState<'top' | 'bottom'>('top');

  // 🛡️ Completely disable simulated social bar if:
  // 1. Admin panel is active
  // 2. User turned off floating ads (Clean view)
  if (!user || (activeTab as string) === 'admin' || !floatingAdsEnabled) {
    return null;
  }

  // 🛡️ Always safe direct landing page
  const directLink = getRandomSafeDirectLink(settings?.adsConfig);

  // 💬 Cycle ads smoothly every 18 seconds
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % FLOATING_ADS_LIST.length);
        setIsDismissed(false);
        setIsVisible(true);
      }, 1500);
    }, 18000);

    return () => clearInterval(cycleInterval);
  }, []);

  const currentAd = FLOATING_ADS_LIST[currentIndex];

  const handleOpenAd = (e: React.MouseEvent, typeLabel: string, coins: number) => {
    e.stopPropagation();
    openAdWithStrictTimer(directLink, typeLabel, coins, 20);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % FLOATING_ADS_LIST.length);
      setIsDismissed(false);
      setIsVisible(true);
    }, 12000);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
    showToast('অ্যাড ছোট করা হয়েছে ✨ বাটনগুলো স্পষ্ট দেখা যাচ্ছে', '', 'info');
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(false);
  };

  const togglePosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPos = position === 'top' ? 'bottom' : 'top';
    setPosition(nextPos);
    showToast(nextPos === 'top' ? '⬆️ অ্যাড উপরে রাখা হয়েছে' : '⬇️ অ্যাড নিচে রাখা হয়েছে', '', 'info');
  };

  // Position class:
  // At 'top': sits right below Navbar (top-14), centered and slim, leaving ALL buttons and video controls unobstructed!
  // At 'bottom': sits above bottom-nav (bottom-20)
  // Position class:
  // At 'top': sits safely below Navbar (top-[68px]), centered and prominent, leaving all page buttons unobstructed!
  // At 'bottom': sits safely above bottom-nav (bottom-20)
  const containerPosClass = position === 'top'
    ? 'fixed top-[68px] left-3 right-3 max-w-md mx-auto z-40'
    : 'fixed bottom-20 left-3 right-3 max-w-md mx-auto z-40';

  return (
    <>
      {/* 🪙 Mini Floating Coin Badge when minimized */}
      {isMinimized && (
        <aside
          aria-label="Sponsored Ad Quick Access"
          className={position === 'top' ? "fixed top-[68px] right-3 z-40 animate-in zoom-in duration-200 pointer-events-auto" : "fixed bottom-20 right-3 z-40 animate-in zoom-in duration-200 pointer-events-auto"}
        >
          <div className="flex items-center gap-1 bg-[#09111F]/98 border border-amber-400 rounded-full px-2.5 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <button
              type="button"
              onClick={(e) => handleOpenAd(e, currentAd.title, currentAd.coins)}
              className="flex items-center gap-1 text-[11px] font-black text-amber-300 hover:text-white transition active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>+{currentAd.coins}🪙</span>
            </button>
            <button
              type="button"
              onClick={togglePosition}
              className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
              title={position === 'top' ? 'নিচে নিন' : 'উপরে নিন'}
            >
              <ArrowUpDown className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={handleExpand}
              className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="বড় করুন"
            >
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
              title="বন্ধ করুন"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </aside>
      )}

      {/* ⚡ PRO FLOATING AD BAR (Height ~38px, placed cleanly at top-[68px] right below header) */}
      {!isMinimized && isVisible && !isDismissed && (
        <aside 
          aria-label="Sponsored Alert"
          className={`${containerPosClass} animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto`}
        >
          <div 
            onClick={(e) => handleOpenAd(e, currentAd.title, currentAd.coins)}
            className="group relative cursor-pointer overflow-hidden rounded-full bg-[#091428]/98 border-2 border-cyan-400/80 px-3 py-1.5 shadow-[0_6px_24px_rgba(0,180,255,0.4)] backdrop-blur-xl transition-all hover:border-cyan-300 active:scale-[0.99] flex items-center justify-between gap-2"
          >
            {/* Left Content (Avatar + Title + Coin Badge) */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${currentAd.avatarBg} p-0.5 shadow flex-shrink-0 flex items-center justify-center text-white relative`}>
                <MessageSquare className="w-3 h-3 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-[#091428]" />
              </div>

              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                <span className="text-[11px] font-black text-white truncate max-w-[140px] sm:max-w-[190px] group-hover:text-cyan-300">
                  {currentAd.title}
                </span>
                <span className="text-[9.5px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-500/50 shrink-0">
                  +{currentAd.coins}🪙
                </span>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => handleOpenAd(e, currentAd.title, currentAd.coins)}
                className="text-[10px] font-black bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 active:scale-95 transition cursor-pointer"
              >
                <span>ওপেন</span>
                <Send className="w-2.5 h-2.5 text-white" />
              </button>

              <button
                type="button"
                onClick={togglePosition}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition"
                title={position === 'top' ? 'নিচে নিন' : 'উপরে নিন'}
              >
                <ArrowUpDown className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleMinimize}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                title="ছোট করুন (Minimize)"
              >
                <Minimize2 className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition"
                title="বিজ্ঞাপন বন্ধ করুন"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
