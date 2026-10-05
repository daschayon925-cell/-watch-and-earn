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
import { TwoStepAdTaskModal, TwoStepTaskData } from './TwoStepAdTaskModal';

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

  // Two Step Ad Modal State
  const [twoStepModalOpen, setTwoStepModalOpen] = useState(false);
  const [currentTwoStepTask, setCurrentTwoStepTask] = useState<TwoStepTaskData | null>(null);

  const hilltopAdsDirectLink = settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c';
  const adsterraDirectLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';

  // Configured or fallback Offerwall URLs with automatic subid parameter
  const cpaleadBaseUrl = settings?.offerwallsConfig?.cpaleadUrl?.trim() || 'https://www.fastrsrvr.com/view.php?id=5547000&pub=3364429';
  const monlixAppId = settings?.offerwallsConfig?.monlixAppId?.trim() || 'demo_monlix';
  const timewallPlacementId = settings?.offerwallsConfig?.timewallPlacementId?.trim() || 'd7521f148f92a2d3';
  const timewallBaseUrl = settings?.offerwallsConfig?.timewallUrl?.trim() || `https://timewall.io/offers/${timewallPlacementId}`;

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

  // 🇧🇩 বাংলাদেশ ও 🇺🇸 USA লাইভ CPALead ও HilltopAds ১০০% ফ্রি অফার লিস্ট (কোনো টাকা লাগবে না)
  const curatedTasks: CpaTask[] = [
    // 🚀 HilltopAds VIP Sponsor (100% Free Website Visit)
    {
      id: 'hilltop_direct_7488677',
      title: 'HilltopAds ফ্রি স্পন্সর ওয়েবসাইট ভিজিট ও বোনাস 🚀',
      category: 'bd',
      country: 'GLOBAL',
      icon: '🌐',
      provider: 'HilltopAds Sponsor',
      time: '২০ সেকেন্ড',
      reward: 70,
      estPayoutBDT: '৳১.০৫',
      difficulty: '১০০% ফ্রি (টাকা লাগবে না)',
      link: settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c'
    },
    // 🇧🇩 100% FREE BANGLADESH TASKS (NO MONEY / NO DEPOSIT)
    {
      id: 'bd_cpa_5547000',
      title: 'ফ্রি প্লে-স্টোর অ্যাপ ইনস্টল ও ১ মিনিট ওপেন 📱',
      category: 'bd',
      country: 'BD',
      icon: '📲',
      provider: 'CPALead PlayStore',
      time: '১.৫ মিনিট',
      reward: 180,
      estPayoutBDT: '৳২.৭০',
      difficulty: '১০০% ফ্রি ইনস্টল',
      link: 'https://www.fastrsrvr.com/view.php?id=5547000&pub=3364429'
    },
    {
      id: 'bd_cpa_5547029',
      title: 'ফ্রি ওপিনিয়ন সার্ভে ও বিকাশ জ্ঞান কুইজ 📋',
      category: 'bd',
      country: 'BD',
      icon: '📝',
      provider: 'CPALead Free Survey',
      time: '২ মিনিট',
      reward: 160,
      estPayoutBDT: '৳২.৪০',
      difficulty: '১০০% ফ্রি কুইজ',
      link: 'https://www.fastsvr.com/view.php?id=5547029&pub=3364429'
    },
    {
      id: 'bd_cpa_5546977',
      title: 'স্পন্সর ব্লগ আর্টিকেল পড়ুন ও ২০ সেকেন্ড স্ক্রোল 📰',
      category: 'bd',
      country: 'BD',
      icon: '📰',
      provider: 'CPALead Article View',
      time: '২০ সেকেন্ড',
      reward: 90,
      estPayoutBDT: '৳১.৩৫',
      difficulty: '১০০% ফ্রি ভিজিট',
      link: 'https://www.cdnflyer.com/view.php?id=5546977&pub=3364429'
    },
    {
      id: 'bd_cpa_5546987',
      title: 'অনলাইন শর্ট স্পন্সর ভিডিও দেখুন ও রিওয়ার্ড নিন 🎬',
      category: 'bd',
      country: 'BD',
      icon: '🎬',
      provider: 'CPALead Video Watch',
      time: '৩০ সেকেন্ড',
      reward: 110,
      estPayoutBDT: '৳১.৬৫',
      difficulty: '১০০% ফ্রি ভিডিও',
      link: 'https://www.lnksforyou.com/view.php?id=5546987&pub=3364429'
    },
    {
      id: 'bd_cpa_free_game_trial',
      title: 'ফ্রি অনলাইন ব্রাউজার গেম টেস্ট ও ৩০ সেকেন্ড প্লে 🎮',
      category: 'bd',
      country: 'BD',
      icon: '🕹️',
      provider: 'CPALead Mini Game',
      time: '৩০ সেকেন্ড',
      reward: 100,
      estPayoutBDT: '৳১.৫০',
      difficulty: '১০০% ফ্রি গেম',
      link: 'https://www.fastrsrvr.com/view.php?id=5547037&pub=3364429'
    },
    {
      id: 'bd_cpa_coupon_deals',
      title: 'দারাজ ও ফুডপান্ডা ফ্রি ডিসকাউন্ট কুপন ব্রাউজ 🛍️',
      category: 'bd',
      country: 'BD',
      icon: '🛍️',
      provider: 'CPALead Deals',
      time: '২০ সেকেন্ড',
      reward: 85,
      estPayoutBDT: '৳১.২৮',
      difficulty: '১০০% ফ্রি ব্রাউজ',
      link: 'https://www.fastsvr.com/view.php?id=5547038&pub=3364429'
    },

    // 🇺🇸 USA & GLOBAL 100% FREE TASKS (High-Reward)
    {
      id: 'usa_cpa_5544943',
      title: 'গ্লোবাল স্পন্সর ওয়েবসাইট ভিজিট ও ফ্রি অফার ভিউ 🌍',
      category: 'usa',
      country: 'GLOBAL',
      icon: '💎',
      provider: 'Global Sponsor Visit',
      time: '২৫ সেকেন্ড',
      reward: 140,
      estPayoutBDT: '৳২.১০',
      difficulty: '১০০% ফ্রি',
      link: 'https://www.cdnflyer.com/view.php?id=5544943&pub=3364429'
    },
    {
      id: 'usa_cpa_5546165',
      title: 'অনলাইন সাধারণ জ্ঞান কুইজ ও ফ্রি গিফট কার্ড চেক 🎁',
      category: 'usa',
      country: 'USA',
      icon: '🎁',
      provider: 'Free US Quiz',
      time: '১.৫ মিনিট',
      reward: 160,
      estPayoutBDT: '৳২.৪০',
      difficulty: '১০০% ফ্রি',
      link: 'https://www.cdnnd.com/view.php?id=5546165&pub=3364429'
    },
    {
      id: 'usa_cpa_5547038',
      title: 'ফ্রি ডিসকাউন্ট কুপন ও ক্যাশব্যাক পেজ ভিউ 🛍️',
      category: 'usa',
      country: 'USA',
      icon: '🛍️',
      provider: 'Free Coupon View',
      time: '২০ সেকেন্ড',
      reward: 90,
      estPayoutBDT: '৳১.৩৫',
      difficulty: 'সহজ ভিজিট',
      link: 'https://www.fastsvr.com/view.php?id=5547038&pub=3364429'
    },
    {
      id: 'usa_cpa_5547037',
      title: 'ফ্রি অনলাইন ব্রাউজার মিনি গেম ট্রায়াল 🎮',
      category: 'usa',
      country: 'USA',
      icon: '🕹️',
      provider: 'Free Mini Game',
      time: '১ মিনিট',
      reward: 110,
      estPayoutBDT: '৳১.৬৫',
      difficulty: '১০০% ফ্রি গেম',
      link: 'https://www.fastrsrvr.com/view.php?id=5547037&pub=3364429'
    }
  ];

  const handleOpenProvider = (provider: OfferwallProvider) => {
    soundService.playCoinReward();
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
        ? `${timewallBaseUrl}&userId=${encodeURIComponent(userId)}&subid=${encodeURIComponent(userId)}` 
        : `${timewallBaseUrl}?userId=${encodeURIComponent(userId)}&subid=${encodeURIComponent(userId)}`;
    } else {
      url = `https://fastfile.click/direct/12345?subid=${encodeURIComponent(userId)}`;
    }

    setCurrentTwoStepTask({
      id: `wall_${provider.id}`,
      title: `${provider.name} মাইক্রো-টাস্ক হাব ⚡`,
      desc: `${provider.descBn}। প্রথমে ১ম স্পন্সর পেজ ভিজিট করুন, তারপর অফার সম্পন্ন করে শেষ বিজ্ঞাপনে কয়েন ক্লেইম করুন।`,
      reward: provider.id === 'timewall' ? 150 : provider.id === 'monlix' ? 200 : 180,
      timeSec: 15,
      primaryLink: url,
      step1AdLink: hilltopAdsDirectLink,
      step2AdLink: adsterraDirectLink
    });
    setTwoStepModalOpen(true);
  };

  const handleStartTask = (task: CpaTask) => {
    soundService.playCoinReward();
    const userId = user?.uid || 'user_guest';
    const separator = task.link.includes('?') ? '&' : '?';
    const finalUrl = `${task.link}${separator}subid=${encodeURIComponent(userId)}&taskId=${task.id}`;

    setCurrentTwoStepTask({
      id: task.id,
      title: task.title,
      desc: `অফিসিয়াল স্পন্সর পেজ ভিজিট করুন এবং নির্ধারিত সময় স্ক্রোল করে পয়েন্ট ক্লেইম করুন।`,
      reward: task.reward,
      timeSec: 15,
      primaryLink: finalUrl,
      step1AdLink: hilltopAdsDirectLink,
      step2AdLink: adsterraDirectLink
    });
    setTwoStepModalOpen(true);
  };

  const handleTwoStepSuccess = (taskId: string, reward: number) => {
    refreshUser();
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

      {/* 💡 Essential User Guideline for Bangladesh CPA Offers */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 text-xs space-y-1.5 shadow-lg">
        <div className="flex items-center gap-2 text-amber-300 font-black">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>কাজের জরুরি টিপস (১০০% ফ্রি কাজ করুন):</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          ✅ <strong>যা করবেন:</strong> শুধুমাত্র ১০০% ফ্রি অ্যাপ ডাউনলোড, ফ্রি সাইন-আপ ও ফ্রি সার্ভে কাজগুলো করবেন।<br />
          ❌ <strong>যা করবেন না:</strong> যেসকল অফারে টাকা ডিপোজিট করতে বা সিম থেকে এসএমএস দিয়ে টাকা কাটতে বলবে সেগুলো করবেন না, সেগুলো এড়িয়ে চলুন!
        </p>
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
      {/* 🚀 DOUBLE DIRECT LINK MODAL */}
      <TwoStepAdTaskModal
        isOpen={twoStepModalOpen}
        task={currentTwoStepTask}
        onClose={() => setTwoStepModalOpen(false)}
        onSuccess={handleTwoStepSuccess}
      />
    </div>
  );
};
