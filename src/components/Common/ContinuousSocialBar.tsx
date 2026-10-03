import React, { useState, useEffect } from 'react';
import { Gift, MessageSquare, Sparkles, X, ChevronRight, Zap, Bell, Coins } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { triggerAdReward } from '../../services/adBonus';

interface SocialAdItem {
  id: string;
  type: 'gift' | 'message' | 'alert' | 'bonus';
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  iconBg: string;
}

const SOCIAL_ADS: SocialAdItem[] = [
  {
    id: 'ad_gift_1',
    type: 'gift',
    title: '🎁 বিশেষ ক্যাশ অফার উপলব্ধ!',
    subtitle: 'স্পন্সর সাইট ভিজিট করে রিওয়ার্ড বোনাস ক্লেইম করুন',
    badge: 'হট বোনাস',
    ctaText: 'ক্লেইম করুন',
    iconBg: 'from-amber-500 to-orange-500'
  },
  {
    id: 'ad_msg_1',
    type: 'message',
    title: '💬 নতুন স্পন্সর মেসেজ',
    subtitle: 'আপনার জন্য ১টি বিশেষ প্রমোশন অপেক্ষা করছে',
    badge: 'মেসেজ',
    ctaText: 'দেখুন',
    iconBg: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ad_bonus_1',
    type: 'bonus',
    title: '⚡ সুপার স্পিন জ্যাকপট!',
    subtitle: 'অফারে চাপ দিয়ে অতিরিক্ত কয়েন সংগ্রহ করুন',
    badge: '৫০ কয়েন',
    ctaText: 'সংগ্রহ করুন',
    iconBg: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'ad_alert_1',
    type: 'alert',
    title: '🔥 দৈনিক লাকি ড্র ড্রপ',
    subtitle: 'সীমিত সময়ের জন্য হাই-সিপিএম স্পনসর সক্রিয়',
    badge: 'সীমিত অফার',
    ctaText: 'ওপেন করুন',
    iconBg: 'from-purple-500 to-pink-500'
  }
];

export const ContinuousSocialBar: React.FC = () => {
  const { settings, showToast } = useApp();
  const { awardCoinsLocally } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const directLink =
    settings?.adsConfig?.adsterraDirectLink?.trim() ||
    'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';

  // 🔄 Continuous 1-after-another display cycle (every 18 seconds)
  useEffect(() => {
    // Initial delay before first social bar appears
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    const rotationTimer = setInterval(() => {
      // Hide current, switch to next, then show next
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SOCIAL_ADS.length);
        setIsDismissed(false);
        setIsVisible(true);
      }, 1500);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(rotationTimer);
    };
  }, []);

  const handleOpenAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 🪙 Award +10 coins instantly on every Social Bar interaction!
    triggerAdReward('সোশ্যাল বার বিজ্ঞাপন', awardCoinsLocally, showToast);
    try {
      window.open(directLink, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = directLink;
    }
    // Temporarily hide, will cycle to next automatically
    setIsVisible(false);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
    // Re-appear with next ad after 8 seconds
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SOCIAL_ADS.length);
      setIsDismissed(false);
      setIsVisible(true);
    }, 8000);
  };

  if (!isVisible || isDismissed) return null;

  const current = SOCIAL_ADS[currentIndex];

  return (
    <aside 
      aria-label="Sponsored Notification"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 z-40 animate-in slide-in-from-bottom duration-300 pointer-events-auto"
    >
      <div 
        onClick={handleOpenAd}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#090E17]/95 border border-amber-500/40 p-3 shadow-2xl backdrop-blur-md transition-all hover:border-amber-400 hover:shadow-amber-500/20 active:scale-[0.98]"
      >
        {/* Glow ambient */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />

        <div className="flex items-center gap-3">
          {/* Animated Icon Avatar */}
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${current.iconBg} p-0.5 shadow-md flex-shrink-0 flex items-center justify-center text-slate-950 font-bold`}>
            {current.type === 'gift' && <Gift className="w-5 h-5 text-white animate-bounce" />}
            {current.type === 'message' && <MessageSquare className="w-5 h-5 text-white animate-pulse" />}
            {current.type === 'bonus' && <Zap className="w-5 h-5 text-white animate-pulse" />}
            {current.type === 'alert' && <Bell className="w-5 h-5 text-white animate-bounce" />}
          </div>

          {/* Ad Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                {current.badge}
              </span>
              <span className="text-[9px] text-slate-400">স্পনসর</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">
              {current.title}
            </h4>
            <p className="text-[10px] text-slate-300 truncate">
              {current.subtitle}
            </p>
          </div>

          {/* Action CTA Button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-0.5">
              {current.ctaText}
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="বিজ্ঞাপন বন্ধ করুন"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
