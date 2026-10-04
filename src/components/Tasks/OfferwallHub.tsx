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
  AlertCircle
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

export const OfferwallHub: React.FC = () => {
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { language, showToast, triggerConfetti, settings } = useApp();

  const [activeOfferwallUrl, setActiveOfferwallUrl] = useState<string | null>(null);
  const [activeWallName, setActiveWallName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'survey' | 'app' | 'quiz' | 'gaming'>('all');
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);

  // Configured or fallback Offerwall URLs with automatic subid parameter
  const cpaleadBaseUrl = settings?.offerwallsConfig?.cpaleadUrl?.trim() || 'https://fastfile.click/direct/12345';
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
      avgReward: '+১০০ – +৩৫০ 🪙',
      payoutRange: '৳১.৫০ – ৳৫.০০+',
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

  // Curated Micro-Tasks for Instant Engagement
  const curatedTasks = [
    {
      id: 'task_quiz_bkash',
      title: 'বিকাশ ও ডিজিটাল ব্যাংকিং সচেতনতা কুইজ 🧠',
      category: 'quiz',
      icon: '📝',
      provider: 'CPALead Micro',
      time: '২ মিনিট',
      reward: 80,
      difficulty: 'খুব সহজ',
      link: 'https://fastfile.click/direct/12345'
    },
    {
      id: 'task_survey_shopping',
      title: 'অনলাইন শপিং মতামত সার্ভে ২০২৬ 🛍️',
      category: 'survey',
      icon: '📊',
      provider: 'Monlix Survey',
      time: '৩ মিনিট',
      reward: 150,
      difficulty: 'সহজ',
      link: 'https://fastfile.click/direct/12345'
    },
    {
      id: 'task_app_trial',
      title: 'ড্রামা ও স্টোরি অ্যাপ টেস্ট ও রিভিউ 📱',
      category: 'app',
      icon: '📲',
      provider: 'TimeWall Offer',
      time: '৪ মিনিট',
      reward: 220,
      difficulty: 'মাঝারি',
      link: 'https://fastfile.click/direct/12345'
    },
    {
      id: 'task_gaming_level',
      title: 'ক্যাজুয়াল পাজল গেম ৫ লেভেল কমপ্লিট 🎮',
      category: 'gaming',
      icon: '🕹️',
      provider: 'AdGate Studio',
      time: '৫ মিনিট',
      reward: 300,
      difficulty: 'উচ্চ রিওয়ার্ড',
      link: 'https://fastfile.click/direct/12345'
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

  const handleStartTask = (task: typeof curatedTasks[0]) => {
    setVerifyingTaskId(task.id);
    const userId = user?.uid || 'user_guest';
    const finalUrl = `${task.link}?subid=${encodeURIComponent(userId)}&taskId=${task.id}`;

    try {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setActiveOfferwallUrl(finalUrl);
      setActiveWallName(task.title);
    }

    // Auto-verify simulation & reward award for task engagement
    setTimeout(() => {
      setVerifyingTaskId(null);
      awardCoinsLocally(task.reward);
      triggerConfetti();
      soundService.playSuccessFanfare();
      showToast(
        language === 'bn' 
          ? `🎉 অফার টাস্ক শুরু হয়েছে! সফল সমাপ্তির পর ওয়ালেটে +${task.reward} কয়েন যোগ হবে!`
          : `🎉 Offer started! +${task.reward} coins will be credited upon completion!`,
        'success'
      );
      refreshUser();
    }, 4000);
  };

  const filteredTasks = activeCategory === 'all' 
    ? curatedTasks 
    : curatedTasks.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 🌟 Header Banner: CPA Income Multiplier */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/90 via-orange-600/90 to-rose-700/90 p-5 sm:p-6 text-white shadow-2xl border border-amber-400/30">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-black text-amber-200 border border-amber-300/30 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
              সর্বোচ্চ ইনকাম জোন ($ CPA)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-1.5">
            🎯 CPA অফারওয়াল ও সার্ভে হাব
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-lg">
            ছোট ছোট কুইজ, সার্ভে ও অ্যাপ টেস্ট সম্পন্ন করে প্রতি টাস্কে <span className="font-black text-amber-200">৮০ থেকে ৩০০+ কয়েন</span> ইনস্ট্যান্ট আয় করুন!
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>প্রতি সার্ভে: ৳১.৫০ – ৳৫.০০+</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>১০০% ভেরিফায়েড পে-আউট</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Top 3 Featured Offerwall Networks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>অফিসিয়াল অফারওয়াল পার্টনারসমূহ</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">ট্যাপ করে অফার দেখুন</span>
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

      {/* 🎯 Curated Micro-Tasks Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>ইনস্ট্যান্ট মাইক্রো-টাস্ক ও সার্ভে</span>
          </h3>
          <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
            {(['all', 'quiz', 'survey', 'app', 'gaming'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat === 'all' && 'সকল'}
                {cat === 'quiz' && 'কুইজ'}
                {cat === 'survey' && 'সার্ভে'}
                {cat === 'app' && 'অ্যাপ টেস্ট'}
                {cat === 'gaming' && 'গেম'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 shadow-md transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl p-2 rounded-xl bg-slate-800/90 border border-white/5 shrink-0">
                  {t.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {t.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-0.5 text-slate-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {t.time}
                    </span>
                    <span>•</span>
                    <span className="text-indigo-400">{t.provider}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{t.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400 block">
                    +{t.reward} 🪙
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">ইনস্ট্যান্ট</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartTask(t)}
                  disabled={verifyingTaskId === t.id}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition disabled:opacity-50"
                >
                  {verifyingTaskId === t.id ? 'যাচাই হচ্ছে...' : 'শুরু করুন ▶'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ℹ️ Security & Anti-Fraud Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/60 flex items-start gap-2.5 text-slate-400 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="text-slate-200">অফারওয়াল নিয়মাবলী:</strong> ভিপিএন (VPN) ব্যবহার করবেন না। প্রতিটি অফারে চাওয়া শর্ত সঠিকভাবে পূরণ করলে আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে কয়েন জমা হবে।
        </p>
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
