import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Award, 
  Coins, 
  Zap, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Globe, 
  X, 
  Smartphone, 
  FileText, 
  Gamepad2, 
  HelpCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Flag,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';

interface OfferwallProvider {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  icon: string;
  descBn: string;
  descEn: string;
  avgReward: string;
  payoutRange: string;
  partnerType: 'CPALead' | 'Monlix' | 'TimeWall' | 'AdGate' | 'SmartTask';
  status: 'active' | 'popular' | 'high_rate';
}

interface CpaTask {
  id: string;
  title: string;
  category: 'bd' | 'usa' | 'app' | 'survey' | 'gaming';
  country: 'BD' | 'USA' | 'GLOBAL';
  icon: string;
  provider: string;
  time: string;
  reward: number;
  estPayoutBDT: string;
  difficulty: string;
  link: string;
  payoutUSD?: string;
}

interface OfferwallHubProps {
  onSwitchToDailyTasks?: () => void;
}

export const OfferwallHub: React.FC<OfferwallHubProps> = ({ onSwitchToDailyTasks }) => {
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { language, showToast, triggerConfetti, settings } = useApp();

  const [activeCountryTab, setActiveCountryTab] = useState<'bd' | 'usa' | 'all'>('bd');
  const [activeOfferwallUrl, setActiveOfferwallUrl] = useState<string | null>(null);
  const [activeWallName, setActiveWallName] = useState<string>('');
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Configured or fallback Offerwall URLs with automatic subid parameter
  const cpaleadBaseUrl = settings?.offerwallsConfig?.cpaleadUrl?.trim() || 'https://www.fastrsrvr.com/view.php?id=5547000&pub=3364429';
  const monlixAppId = settings?.offerwallsConfig?.monlixAppId?.trim() || 'demo_monlix';
  const timewallBaseUrl = settings?.offerwallsConfig?.timewallUrl?.trim() || 'https://timewall.io';

  const providers: OfferwallProvider[] = [
    {
      id: 'cpalead',
      name: 'CPALead Instant Wall',
      badge: 'ইনস্ট্যান্ট ভেরিফাই 🔥',
      badgeColor: 'from-amber-500 to-orange-500',
      icon: '🎯',
      descBn: 'ছোট ছোট ১-৩ মিনিটের অ্যাপ ইনস্টল ও সার্ভে সম্পন্ন করে হাই কয়েন পান',
      descEn: 'Complete quick 1-3 minute app trials & surveys for high coins',
      avgReward: '+১০০ – +৮০০ 🪙',
      payoutRange: '৳১.৫০ – ৳১২.০০+',
      partnerType: 'CPALead',
      status: 'popular'
    },
    {
      id: 'monlix',
      name: 'Monlix Premium Hub',
      badge: 'হাই-সিপিএম রেট 💎',
      badgeColor: 'from-purple-500 to-indigo-600',
      icon: '💎',
      descBn: 'গেমিং লেভেল ও আন্তর্জাতিক সার্ভে টেস্ট—সবচেয়ে বেশি কয়েন রিওয়ার্ড',
      descEn: 'Gaming levels & international surveys with highest coin payout',
      avgReward: '+১৫০ – +৫০০ 🪙',
      payoutRange: '৳২.০০ – ৳৮.০০+',
      partnerType: 'Monlix',
      status: 'high_rate'
    },
    {
      id: 'timewall',
      name: 'TimeWall Micro-Tasks',
      badge: 'সহজ টাস্ক ⚡',
      badgeColor: 'from-emerald-500 to-teal-600',
      icon: '⚡',
      descBn: 'ক্লিক, ভিজিট ও শর্ট ভিডিও দেখে বাংলাদেশি ইউজারদের সহজ ইনকাম',
      descEn: 'Clicks, visits & short videos for quick daily income in Bangladesh',
      avgReward: '+৮০ – +২০০ 🪙',
      payoutRange: '৳১.০০ – ৳৩.০০',
      partnerType: 'TimeWall',
      status: 'active'
    }
  ];

  // 🇧🇩 বাংলাদেশ ও 🇺🇸 USA লাইভ CPALead অফার লিস্ট
  const curatedTasks: CpaTask[] = [
    // 🇧🇩 BANGLADESH OFFERS (Pub ID: 3364429)
    {
      id: 'bd_cpa_5547000',
      title: 'বাংলাদেশ প্রিমিয়াম অ্যাপ টেস্ট ও ইন্সটল 📱',
      category: 'bd',
      country: 'BD',
      icon: '📲',
      provider: 'CPALead BD #1',
      time: '২ মিনিট',
      reward: 120,
      estPayoutBDT: '৳১.৮০',
      difficulty: 'খুব সহজ',
      link: 'https://www.fastrsrvr.com/view.php?id=5547000&pub=3364429'
    },
    {
      id: 'bd_cpa_5547029',
      title: 'দ্রুত মতামত সার্ভে ও বিকাশ কুইজ 📋',
      category: 'bd',
      country: 'BD',
      icon: '📝',
      provider: 'CPALead BD #2',
      time: '২.৫ মিনিট',
      reward: 150,
      estPayoutBDT: '৳২.২৫',
      difficulty: 'সহজ',
      link: 'https://www.fastsvr.com/view.php?id=5547029&pub=3364429'
    },
    {
      id: 'bd_cpa_5546977',
      title: 'ফ্রি রিওয়ার্ড ও গিফট কার্ড সাইন-আপ 🎁',
      category: 'bd',
      country: 'BD',
      icon: '🎁',
      provider: 'CPALead BD #3',
      time: '৩ মিনিট',
      reward: 180,
      estPayoutBDT: '৳২.৭০',
      difficulty: 'সহজ',
      link: 'https://www.cdnflyer.com/view.php?id=5546977&pub=3364429'
    },
    {
      id: 'bd_cpa_5546987',
      title: 'অনলাইন ড্রামা ও শপিং টেস্ট রিওয়ার্ড 🛍️',
      category: 'bd',
      country: 'BD',
      icon: '🛍️',
      provider: 'CPALead BD #4',
      time: '৩ মিনিট',
      reward: 200,
      estPayoutBDT: '৳৩.০০',
      difficulty: 'মাঝারি',
      link: 'https://www.lnksforyou.com/view.php?id=5546987&pub=3364429'
    },

    // 🇺🇸 USA & GLOBAL MEGA HIGH-PAYING OFFERS (Pub ID: 3364429)
    {
      id: 'usa_cpa_5544943',
      title: 'Airwallex: Global Sign Up & Transfer 💰',
      category: 'usa',
      country: 'GLOBAL',
      icon: '💎',
      provider: 'Airwallex Global #46',
      time: '৫ মিনিট',
      reward: 2500,
      estPayoutBDT: '৳৫০.০০+',
      payoutUSD: '$58.50 Mega Payout 🔥',
      difficulty: 'মেগা জ্যাকপট 🏆',
      link: 'https://www.cdnflyer.com/view.php?id=5544943&pub=3364429'
    },
    {
      id: 'usa_cpa_5546165',
      title: 'Kalshi: US Trading & Rewards Signup 📈',
      category: 'usa',
      country: 'USA',
      icon: '📈',
      provider: 'Kalshi USA #44',
      time: '৪ মিনিট',
      reward: 1800,
      estPayoutBDT: '৳৩৫.০০+',
      payoutUSD: '$27.30 High Payout 🔥',
      difficulty: 'উচ্চ রিওয়ার্ড 🚀',
      link: 'https://www.cdnnd.com/view.php?id=5546165&pub=3364429'
    },
    {
      id: 'usa_cpa_5547038',
      title: 'Super.com US Coupon & Cashback Rewards 💎',
      category: 'usa',
      country: 'USA',
      icon: '💳',
      provider: 'CPALead US High Payout',
      time: '৪ মিনিট',
      reward: 800,
      estPayoutBDT: '৳১২.০০',
      payoutUSD: '$16.22 Max',
      difficulty: 'উচ্চ রিওয়ার্ড 🔥',
      link: 'https://www.fastsvr.com/view.php?id=5547038&pub=3364429'
    },
    {
      id: 'usa_cpa_5547037',
      title: 'Secret World: AI Hidden Adventure Game 🎮',
      category: 'usa',
      country: 'USA',
      icon: '🕹️',
      provider: 'CPALead US Game',
      time: '৩ মিনিট',
      reward: 500,
      estPayoutBDT: '৳৭.৫০',
      payoutUSD: '$5.46 Max',
      difficulty: 'সহজ গেম',
      link: 'https://www.fastrsrvr.com/view.php?id=5547037&pub=3364429'
    },
    {
      id: 'usa_cpa_5545253',
      title: 'Premium FastPay CPA Special Offer 🚀',
      category: 'usa',
      country: 'USA',
      icon: '🚀',
      provider: 'CPALead FastPay',
      time: '৪ মিনিট',
      reward: 900,
      estPayoutBDT: '৳১৩.৫০',
      difficulty: 'ভিআইপি রিওয়ার্ড',
      link: 'https://www.fastsvr.com/view.php?id=5545253&pub=3364429'
    },
    {
      id: 'usa_cpa_5544943',
      title: 'DirectCPI Mobile Game Level Challenge 🏆',
      category: 'usa',
      country: 'USA',
      icon: '🎯',
      provider: 'DirectCPI Studio',
      time: '৫ মিনিট',
      reward: 750,
      estPayoutBDT: '৳১১.২৫',
      difficulty: 'মাঝারি',
      link: 'https://www.directcpi.com/view.php?id=5544943&pub=3364429'
    },
    {
      id: 'usa_cpa_5542950',
      title: 'US Shopping Club & Deals Discovery 🛍️',
      category: 'usa',
      country: 'USA',
      icon: '🛒',
      provider: 'CDN Flyer US',
      time: '৩ মিনিট',
      reward: 650,
      estPayoutBDT: '৳৯.৭৫',
      difficulty: 'সহজ',
      link: 'https://www.cdnflyer.com/view.php?id=5542950&pub=3364429'
    },
    {
      id: 'usa_cpa_5546999',
      title: 'AppStore Vault Premium Trial & Review 📱',
      category: 'usa',
      country: 'USA',
      icon: '📲',
      provider: 'AppVault Media',
      time: '৩ মিনিট',
      reward: 600,
      estPayoutBDT: '৳৯.০০',
      difficulty: 'সহজ',
      link: 'https://www.appstorevault.mobi/view.php?id=5546999&pub=3364429'
    },
    {
      id: 'usa_cpa_5542327',
      title: 'QuickClick Express Opinion Survey ⚡',
      category: 'usa',
      country: 'USA',
      icon: '⚡',
      provider: 'QuickClick Hub',
      time: '২.৫ মিনিট',
      reward: 550,
      estPayoutBDT: '৳৮.২৫',
      difficulty: 'সহজ',
      link: 'https://www.qckclk.com/view.php?id=5542327&pub=3364429'
    },
    {
      id: 'usa_cpa_5547019',
      title: 'Finance & Crypto Opinion Survey 2026 📈',
      category: 'usa',
      country: 'USA',
      icon: '📊',
      provider: 'FastServer Surveys',
      time: '৩ মিনিট',
      reward: 450,
      estPayoutBDT: '৳৬.৭৫',
      difficulty: 'সহজ',
      link: 'https://www.fastrsrvr.com/view.php?id=5547019&pub=3364429'
    }
  ];

  const handleOpenProvider = (provider: OfferwallProvider) => {
    const userId = user?.uid || 'user_guest';
    let url = '';

    if (provider.partnerType === 'CPALead') {
      url = cpaleadBaseUrl.includes('?') 
        ? `${cpaleadBaseUrl}&subid=${encodeURIComponent(userId)}` 
        : `${cpaleadBaseUrl}?subid=${encodeURIComponent(userId)}`;
    } else if (provider.partnerType === 'Monlix') {
      url = `https://monlix.com/offerwall/${monlixAppId}/${encodeURIComponent(userId)}`;
    } else if (provider.partnerType === 'TimeWall') {
      url = timewallBaseUrl.includes('?') 
        ? `${timewallBaseUrl}&subid=${encodeURIComponent(userId)}` 
        : `${timewallBaseUrl}?subid=${encodeURIComponent(userId)}`;
    } else {
      url = `https://fastfile.click/direct/12345?subid=${encodeURIComponent(userId)}`;
    }

    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setActiveOfferwallUrl(url);
      setActiveWallName(provider.name);
    }
  };

  const handleStartTask = (task: CpaTask) => {
    setVerifyingTaskId(task.id);
    const userId = user?.uid || 'user_guest';
    const separator = task.link.includes('?') ? '&' : '?';
    const finalUrl = `${task.link}${separator}subid=${encodeURIComponent(userId)}&taskId=${task.id}`;

    try {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setActiveOfferwallUrl(finalUrl);
      setActiveWallName(task.title);
    }

    // Auto-verify simulation & bonus reward on task visit
    setTimeout(() => {
      setVerifyingTaskId(null);
      awardCoinsLocally(task.reward);
      triggerConfetti();
      soundService.playSuccessFanfare();
      showToast(
        language === 'bn' 
          ? `🎉 অফার টাস্ক সফলভাবে ভিজিট হয়েছে! +${task.reward} কয়েন আপনার অ্যাকাউন্টে জমা হয়েছে!`
          : `🎉 Offer visited! +${task.reward} coins credited to your wallet!`,
        'success'
      );
      refreshUser();
    }, 3500);
  };

  const handleCopyLink = (task: CpaTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = user?.uid || 'user_guest';
    const separator = task.link.includes('?') ? '&' : '?';
    const finalUrl = `${task.link}${separator}subid=${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(finalUrl);
    setCopiedId(task.id);
    showToast('অফার লিংক কপি হয়েছে ✓', 'সোশ্যাল মিডিয়া বা বন্ধুদের শেয়ার করতে পারেন!', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredTasks = activeCountryTab === 'all'
    ? curatedTasks
    : activeCountryTab === 'bd'
      ? curatedTasks.filter(t => t.country === 'BD')
      : curatedTasks.filter(t => t.country === 'USA');

  const bdCount = curatedTasks.filter(t => t.country === 'BD').length;
  const usaCount = curatedTasks.filter(t => t.country === 'USA').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 🌟 Header Banner: CPA Income Multiplier */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/95 via-orange-600/90 to-rose-700/95 p-5 sm:p-6 text-white shadow-2xl border border-amber-400/30">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black text-amber-200 border border-amber-300/30 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
              CPALead লাইভ অফার হাব (Pub ID: 3364429)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-1.5 flex items-center gap-2">
            <span>🎯 বাংলাদেশ ও USA স্পেশাল অফার জোন</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-lg">
            পছন্দের অ্যাপ ডাউনলোড, সার্ভে বা কুইজ পূরণ করে প্রতি টাস্কে <span className="font-black text-amber-200">১২০ থেকে ৯০০ কয়েন</span> ইনস্ট্যান্ট আয় করুন!
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-200">
              <span className="text-sm">🇧🇩</span>
              <span>বাংলাদেশ: ৪টি অফার (১২০-২০০ 🪙)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-cyan-200">
              <span className="text-sm">🇺🇸</span>
              <span>USA স্পেশাল: ৮টি হাই-পেইং (৪৫০-৯০০ 🪙)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📝 Quick Action: Jump to General Tasks & Daily Quiz */}
      {onSwitchToDailyTasks && (
        <button
          type="button"
          onClick={onSwitchToDailyTasks}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900/90 border border-purple-500/40 hover:border-purple-400 text-white flex items-center justify-between shadow-xl active:scale-[0.98] transition group"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 text-lg group-hover:scale-110 transition">
              📝
            </span>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-purple-300 flex items-center gap-1.5">
                <span>সাধারণ টাস্ক ও কুইজ মোড</span>
                <span className="px-1.5 py-0.2 rounded-md bg-purple-500/30 text-purple-200 text-[9px] font-bold">
                  ক্যাপচা • ম্যাথ • জিকে
                </span>
              </h4>
              <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                সহজ অংক ও ক্যাপচা সমাধান করে দ্রুত কয়েন জিতে নিন
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-black shrink-0 flex items-center gap-1 shadow-md">
            <span>সাধারণ টাস্ক</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      )}

      {/* 🚀 Top 3 Featured Offerwall Networks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>অফিসিয়াল অফারওয়াল নেটওয়ার্ক</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">ট্যাপ করে প্রবেশ করুন</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {providers.map((p) => (
            <div
              key={p.id}
              onClick={() => handleOpenProvider(p)}
              className="relative group p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 shadow-lg cursor-pointer active:scale-[0.98] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-white/10 shadow-inner">
                      {p.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        {p.payoutRange} / কাজ
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black text-white bg-gradient-to-r ${p.badgeColor} shadow-sm shrink-0`}>
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {language === 'bn' ? p.descBn : p.descEn}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-300 text-xs font-black">
                  <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{p.avgReward}</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 px-3 py-1.5 rounded-xl shadow-md"
                >
                  <span>প্রবেশ করুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 Curated Micro-Tasks Section with Country Tabs */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>ভেরিফাইড টাস্ক লিস্ট ({curatedTasks.length}টি লাইভ অফার)</span>
          </h3>
          
          {/* Country Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveCountryTab('bd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
                activeCountryTab === 'bd'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇧🇩</span>
              <span>বাংলাদেশ অফার ({bdCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCountryTab('usa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
                activeCountryTab === 'usa'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸</span>
              <span>USA স্পেশাল ({usaCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCountryTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 whitespace-nowrap ${
                activeCountryTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>সকল ({curatedTasks.length})</span>
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="space-y-2.5">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="text-2xl p-2.5 rounded-xl bg-slate-800/90 border border-white/5 shrink-0 shadow-inner">
                  {t.icon}
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {t.title}
                    </h4>
                    <span className={`px-2 py-0.2 rounded-md text-[9px] font-black border ${
                      t.country === 'BD'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {t.country === 'BD' ? '🇧🇩 বাংলাদেশ' : '🇺🇸 USA'}
                    </span>
                    {t.payoutUSD && (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {t.payoutUSD}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-0.5 text-slate-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {t.time}
                    </span>
                    <span>•</span>
                    <span className="text-cyan-400">{t.provider}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{t.estPayoutBDT} সমমূল্য</span>
                    <span>•</span>
                    <span className="text-slate-400">{t.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <div className="text-left sm:text-right">
                  <span className="text-xs sm:text-sm font-black text-amber-400 block">
                    +{t.reward} 🪙
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">ইনস্ট্যান্ট কয়েন</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(t, e)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition"
                    title="লিংক কপি করুন"
                  >
                    {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartTask(t)}
                    disabled={verifyingTaskId === t.id}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>{verifyingTaskId === t.id ? 'যাচাই হচ্ছে...' : 'শুরু করুন'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ℹ️ Security & Anti-Fraud Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950/90 to-slate-900/90 border border-slate-800/80 flex items-start gap-3 text-slate-400 text-xs shadow-lg">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-[11px] leading-relaxed">
          <p>
            <strong className="text-slate-200 font-bold">🇧🇩 বাংলাদেশ অফার:</strong> সরাসরি সাধারণ ইন্টারনেট বা ওয়াইফাই সংযোগ দিয়েই শেষ করুন।
          </p>
          <p>
            <strong className="text-slate-200 font-bold">🇺🇸 USA স্পেশাল অফার:</strong> শুধুমাত্র USA ইউজার অথবা যারা আন্তর্জাতিক ট্রাফিক থেকে কাজটি করবেন তাদের জন্য প্রযোজ্য।
          </p>
        </div>
      </div>

      {/* 📱 Fullscreen Iframe Modal (Fallback if external window is blocked) */}
      {activeOfferwallUrl && (
        <div className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex flex-col justify-between animate-fadeIn">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-amber-300">🎯 {activeWallName}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveOfferwallUrl(null)}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe
            src={activeOfferwallUrl}
            className="w-full flex-1 border-0 bg-white"
            title="CPA Offerwall"
          />
        </div>
      )}
    </div>
  );
};
