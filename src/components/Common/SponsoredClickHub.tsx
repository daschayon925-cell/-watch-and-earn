import React, { useState } from 'react';
import { 
  Zap, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Flame, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Globe,
  Smartphone,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { openAdWithStrictTimer } from './AdVisitTimerModal';
import { sanitizeAdDirectLink } from '../../utils/adLinkSanitizer';

interface SponsoredClickHubProps {
  compact?: boolean;
}

export const SponsoredClickHub: React.FC<SponsoredClickHubProps> = ({ compact = false }) => {
  const { settings, language, showToast } = useApp();
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const [loadingNet, setLoadingNet] = useState<string | null>(null);

  const maxClicks = settings?.maxDailyAdClicks || 15;
  const clicksDone = user?.adClicksToday || 0;
  const remainingClicks = Math.max(0, maxClicks - clicksDone);

  const adsterraLink = sanitizeAdDirectLink(settings?.adsConfig?.adsterraDirectLink, 'adsterra');
  const hilltopLink = sanitizeAdDirectLink(settings?.adsConfig?.hilltopAdsDirectLink, 'hilltop');
  const monetagLink = sanitizeAdDirectLink(settings?.adsConfig?.monetagDirectLink, 'monetag');

  const clickNetworks = [
    {
      id: 'monetag',
      name: 'Monetag স্মার্ট লিংক',
      badge: 'মোবাইল হাই-সিপিএম 🔥',
      reward: 15,
      seconds: 20,
      url: monetagLink,
      gradient: 'from-purple-600/20 via-fuchsia-600/20 to-purple-600/10 border-purple-500/50 hover:border-purple-400',
      btnGradient: 'from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-600/30',
      icon: Smartphone,
      iconColor: 'text-purple-400',
      taglineBn: 'স্মার্ট মোবাইল অফার ও বিজ্ঞাপন ২০ সেকেন্ড ভিজিট করুন',
      taglineEn: 'Visit smart mobile ad for 20 seconds to earn coins'
    },
    {
      id: 'hilltop',
      name: 'HilltopAds ডিরেক্ট লিংক',
      badge: 'টপ রেটেড সিপিএম ⚡',
      reward: 15,
      seconds: 20,
      url: hilltopLink,
      gradient: 'from-teal-600/20 via-emerald-600/20 to-teal-600/10 border-teal-500/50 hover:border-teal-400',
      btnGradient: 'from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/30',
      icon: Zap,
      iconColor: 'text-teal-400',
      taglineBn: 'হাই-সিপিএম আন্তর্জাতিক স্পনসর লিংক ভিজিট করুন',
      taglineEn: 'Visit high-CPM international sponsor link'
    },
    {
      id: 'adsterra',
      name: 'Adsterra প্রিমিয়াম লিংক',
      badge: 'অফিসিয়াল স্পনসর 💎',
      reward: 15,
      seconds: 20,
      url: adsterraLink,
      gradient: 'from-amber-600/20 via-yellow-600/20 to-amber-600/10 border-amber-500/50 hover:border-amber-400',
      btnGradient: 'from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30',
      icon: Globe,
      iconColor: 'text-amber-400',
      taglineBn: 'গ্লোবাল ভেরিফায়েড ব্র্যান্ড প্রমোশন ২০ সেকেন্ড দেখুন',
      taglineEn: 'Browse global verified brand promo for 20 seconds'
    }
  ];

  const handleNetworkClick = async (net: typeof clickNetworks[0]) => {
    if (remainingClicks <= 0) {
      showToast(
        language === 'bn' 
          ? `⚠️ আজকের সর্বাধিক ${maxClicks} টি ক্লিক সম্পন্ন হয়েছে! আগামীকাল আবার আসুন।` 
          : 'Daily ad click limit reached. Please come back tomorrow!',
        '',
        'info'
      );
      return;
    }

    setLoadingNet(net.id);
    try {
      soundService.playLikePop();
    } catch {}

    // 🚀 Step 1: Open ad immediately on direct user tap (preserves user activation for popups!)
    openAdWithStrictTimer(net.url, `${net.name} (+${net.reward} কয়েন)`, net.reward, net.seconds);
    setLoadingNet(null);

    // 🚀 Step 2: Track click on backend & refresh user so click meter increases immediately!
    try {
      const clickRes = await api.claimAdClick();
      if (clickRes && clickRes.success) {
        await refreshUser();
      }
    } catch (e) {
      console.warn('Click tracker log:', e);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#0d1629] to-[#141b2d] border-2 border-amber-500/40 p-4 shadow-2xl backdrop-blur-xl">
      {/* Ambient background glows */}
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

      {/* Header with Title and Daily Click Meter */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-black">
            <Flame className="w-5 h-5 fill-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? '💎 স্পনসর ক্লিক ও ভিজিট রিওয়ার্ড' : '💎 Sponsor Click & Visit Rewards'}
              </h3>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-300 animate-pulse">
                +১৫ কয়েন
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              {language === 'bn' 
                ? 'লিংকে ক্লিক করে ২০ সেকেন্ড সাইট ঘুরে নিশ্চিত কয়েন নিন' 
                : 'Visit sponsor link for 20 seconds to claim instant coins'}
            </p>
          </div>
        </div>

        {/* Daily Click Limit Pill */}
        <div className="text-right flex flex-col items-end">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'bn' ? 'দৈনিক বাকি' : 'Remaining'}
          </span>
          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-full border ${
            remainingClicks > 0 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {remainingClicks}/{maxClicks}
          </span>
        </div>
      </div>

      {/* 3 High-CPM Sponsor Click Cards */}
      <div className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'} gap-2.5 mt-2`}>
        {clickNetworks.map((net) => {
          const IconComp = net.icon;
          return (
            <div
              key={net.id}
              onClick={() => handleNetworkClick(net)}
              className={`group relative overflow-hidden rounded-2xl bg-slate-900/90 border p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col justify-between ${net.gradient}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-300 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 flex items-center gap-1">
                    <IconComp className={`w-3 h-3 ${net.iconColor}`} />
                    <span>{net.badge}</span>
                  </span>
                  <div className="flex items-center gap-1 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-black text-amber-300 font-mono">
                      +{net.reward}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition">
                  {net.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  {language === 'bn' ? net.taglineBn : net.taglineEn}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{net.seconds} সে. ভিজিট</span>
                </span>

                <button
                  type="button"
                  disabled={remainingClicks <= 0}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black text-white shadow-md flex items-center gap-1 transition ${net.btnGradient}`}
                >
                  <span>ক্লিক করুন</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & High Revenue Explainer Note */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>১০০% নিরাপদ অফিসিয়াল স্পন্সর পার্টনার</span>
        </span>
        <span className="text-amber-400/90 font-mono font-bold">
          প্রতি ক্লিকে নিশ্চিত রিওয়ার্ড
        </span>
      </div>
    </div>
  );
};
