import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  HelpCircle,
  Coins,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { sanitizeAdDirectLink } from '../../utils/adLinkSanitizer';

interface ShortlinkTasksHubProps {
  onOpenAd?: (url: string, title: string, reward: number, timeSec: number) => void;
}

interface ShortlinkTask {
  id: string;
  title: string;
  titleBn: string;
  provider: 'ShrinkMe' | 'Droplink' | 'DirectLink';
  reward: number;
  timeSec: number;
  url: string;
  badge: string;
  badgeColor: string;
  completedToday: boolean;
}

export const ShortlinkTasksHub: React.FC<ShortlinkTasksHubProps> = () => {
  const { user, awardCoinsLocally } = useAuth();
  const { showToast, triggerConfetti, settings } = useApp();

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('shortlink_tasks_date');
      if (savedDate !== today) {
        localStorage.setItem('shortlink_tasks_date', today);
        localStorage.removeItem('completed_shortlink_tasks');
        return [];
      }
      const saved = localStorage.getItem('completed_shortlink_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track user redeemed promo codes permanently in state and storage
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('we_redeemed_promo_codes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeVerification, setActiveVerification] = useState<{
    taskId: string;
    secondsLeft: number;
    url: string;
    reward: number;
    title: string;
  } | null>(null);

  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  // Active Admin ShrinkMe & DropLink Links or Default Clean Mainstream Direct Links
  const defaultAdsterraLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const monetagDirectLink = settings?.adsConfig?.monetagDirectLink?.trim() || 'https://uplcm.com/4/11971342';
  
  const configuredShrinkmeUrl = settings?.adsConfig?.shrinkmeShortlinkUrl?.trim();
  const configuredDroplinkUrl = settings?.adsConfig?.droplinkShortlinkUrl?.trim();

  // 🛡️ Ensure clean, 100% family-friendly ad destinations with non-adult filters
  const primaryShortlink = configuredShrinkmeUrl && !configuredShrinkmeUrl.includes('droplink')
    ? sanitizeAdDirectLink(configuredShrinkmeUrl, 'monetag')
    : monetagDirectLink;

  const droplinkShortlink = configuredDroplinkUrl && !configuredDroplinkUrl.includes('droplink.co/dmWjV8x7')
    ? sanitizeAdDirectLink(configuredDroplinkUrl, 'adsterra')
    : defaultAdsterraLink;

  const tasksList: ShortlinkTask[] = [
    {
      id: 'shortlink_shrinkme_1',
      title: 'ShrinkMe High-Speed Link 1',
      titleBn: 'ShrinkMe ১৫ সেকেন্ড হাই-স্পিড লিংক ১ ⚡',
      provider: 'ShrinkMe',
      reward: 50,
      timeSec: 15,
      url: primaryShortlink,
      badge: 'ShrinkMe পার্টনার',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      completedToday: completedIds.includes('shortlink_shrinkme_1')
    },
    {
      id: 'shortlink_droplink_2',
      title: 'DropLink Fast Earn Link 2',
      titleBn: 'DropLink ১৫ সেকেন্ড সুপার আর্ন ২ 🚀',
      provider: 'Droplink',
      reward: 55,
      timeSec: 15,
      url: droplinkShortlink,
      badge: 'DropLink পার্টনার',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      completedToday: completedIds.includes('shortlink_droplink_2')
    },
    {
      id: 'shortlink_direct_3',
      title: 'Adsterra Direct Sponsor 3',
      titleBn: 'Adsterra ডিরেক্ট স্পনসর ভিজিট ৩ 🌐',
      provider: 'DirectLink',
      reward: 40,
      timeSec: 15,
      url: defaultAdsterraLink,
      badge: 'কোনো ক্যাপচা নেই',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      completedToday: completedIds.includes('shortlink_direct_3')
    },
    {
      id: 'shortlink_shrinkme_4',
      title: 'ShrinkMe VIP Multiplier 4',
      titleBn: 'ShrinkMe ভিআইপি বোনাস লিংক ৪ 💎',
      provider: 'ShrinkMe',
      reward: 60,
      timeSec: 18,
      url: primaryShortlink,
      badge: 'হাই বোনাস',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      completedToday: completedIds.includes('shortlink_shrinkme_4')
    }
  ];

  // Timer countdown effect for active task verification
  useEffect(() => {
    if (!activeVerification) return;

    if (activeVerification.secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setActiveVerification(prev => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          return { ...prev, secondsLeft: 0 };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeVerification?.taskId, activeVerification?.secondsLeft]);

  const handleStartTask = (task: ShortlinkTask) => {
    if (task.completedToday) {
      showToast('আপনি আজকের জন্য এই লিংক টাস্কটি সম্পন্ন করেছেন!', '', 'info');
      return;
    }

    try {
      soundService.playTap();
    } catch {}

    // Open clean sanitized shortlink/direct link in a new tab (100% Non-Adult Family Friendly)
    const safeUrl = sanitizeAdDirectLink(task.url, task.provider === 'Droplink' ? 'adsterra' : 'monetag');
    window.open(safeUrl, '_blank', 'noopener,noreferrer');

    // Start verification timer
    setActiveVerification({
      taskId: task.id,
      secondsLeft: task.timeSec,
      url: safeUrl,
      reward: task.reward,
      title: task.titleBn
    });

    showToast('নতুন ট্যাবে নিরাপদ লিংক খোলা হয়েছে!', '১৫ সেকেন্ড অপেক্ষা করে কয়েন সংগ্রহ করুন...', 'info');
  };

  // 💥 "কয়েন দাবি করুন" চাপ দিলে সরাসরি Monetag/Adsterra স্পন্সর এড ওপেন হবে এবং কয়েন জমা হবে
  const handleClaimReward = (task: ShortlinkTask) => {
    if (activeVerification?.secondsLeft && activeVerification.secondsLeft > 0) {
      showToast(`দয়া করে আরও ${activeVerification.secondsLeft} সেকেন্ড অপেক্ষা করুন!`, '', 'info');
      return;
    }

    // 🚀 Pop up sponsor ad in a new tab on claim
    try {
      const targetAdLink = monetagDirectLink || defaultAdsterraLink;
      const directLink = sanitizeAdDirectLink(targetAdLink, 'adsterra');
      if (directLink) {
        window.open(directLink, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {}

    const updated = [...completedIds, task.id];
    setCompletedIds(updated);
    try {
      localStorage.setItem('completed_shortlink_tasks', JSON.stringify(updated));
    } catch {}

    awardCoinsLocally(task.reward);
    try {
      soundService.playCoinReward();
    } catch {}
    triggerConfetti();
    showToast(`🎉 স্পন্সর এড ভিউ সফল! +${task.reward} কয়েন আপনার ওয়ালেটে যোগ হয়েছে!`, '', 'coin');
    setActiveVerification(null);
  };

  // 🎁 প্রোমো কোড / সিক্রেট কোড রিডিম ইঞ্জিন
  const handleSecretCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = secretCodeInput.trim().toUpperCase();

    if (!cleanCode) {
      showToast('দয়া করে ৪-৬ সংখ্যার সিক্রেট কোডটি লিখুন!', '', 'info');
      return;
    }

    // Check if already redeemed
    if (redeemedCodes.includes(cleanCode)) {
      showToast('⚠️ আপনি ইতিমধ্যে এই প্রমো কোডটি ক্লেইম করেছেন!', 'নতুন অন্য কোনো কোড ব্যবহার করুন', 'info');
      return;
    }

    // Valid promo / secret codes
    const validCodes: Record<string, number> = {
      'SHRINK100': 100,
      'EARN50': 50,
      'PROMO50': 50,
      'BONUS77': 77,
      'DOUBLE2026': 80,
      'BONUS100': 100,
      'PROMO200': 200,
      'MONETAG50': 50,
      'VIP500': 500
    };

    // Custom admin promo code if set
    const adminCustomCode = (settings?.adsConfig as any)?.customPromoCode?.trim()?.toUpperCase();
    const adminCustomReward = (settings?.adsConfig as any)?.customPromoReward || 100;
    if (adminCustomCode) {
      validCodes[adminCustomCode] = Number(adminCustomReward);
    }

    if (validCodes[cleanCode]) {
      const reward = validCodes[cleanCode];

      // Mark code as redeemed permanently
      const updatedRedeemed = [...redeemedCodes, cleanCode];
      setRedeemedCodes(updatedRedeemed);
      try {
        localStorage.setItem('we_redeemed_promo_codes', JSON.stringify(updatedRedeemed));
      } catch {}

      awardCoinsLocally(reward);
      try {
        soundService.playCoinReward();
      } catch {}
      triggerConfetti();
      showToast(`🎉 প্রোমো কোড রিডিম সফল! +${reward} কয়েন আপনার ওয়ালেটে যোগ হয়েছে!`, '', 'coin');
      setSecretCodeInput('');
    } else {
      showToast('❌ ভুল প্রমো কোড!', 'লিংক শেষ পেজে প্রাপ্ত সঠিক ৪-৬ সংখ্যার সিক্রেট কোডটি দিন।', 'error');
    }
  };

  const completedCount = completedIds.length;
  const totalCount = tasksList.length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>ডাবল ইনকাম ও নো-রিজেকশন মোড</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>🛡️ ১০০% পারিবারিক ও নিরাপদ বিজ্ঞাপন ফিল্টার সক্রিয়</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>১৫ সেকেন্ড শর্টলিংক ভিজিট</span>
              <span className="text-sm font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ৫০ কয়েন/টাস্ক
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              কোনো গেম খেলা বা অ্যাপ ইনস্টল করার ঝামেলা নেই! মাত্র ১৫ সেকেন্ড লিংকে গিয়ে ক্যাপচা ভেরিফাই করুন এবং তাৎক্ষণিক কয়েন আর্ন করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 transition"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>কাজের নিয়ম</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>আজকের টাস্ক: {completedCount}/{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>দৈনিক পূর্ণতার অগ্রগতি</span>
            <span className="font-bold text-indigo-400">{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Guide Dropdown */}
      {showGuide && (
        <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 text-xs sm:text-sm text-slate-300 space-y-2">
          <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>শর্টলিংক টাস্ক কীভাবে পূরণ করবেন:</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
            <li>নিচের যেকোনো একটি লিংকের <strong>"ভিজিট করুন"</strong> বাটনে ক্লিক করুন।</li>
            <li>নতুন উইন্ডোতে ShrinkMe পেজ খুললে <strong>১০-১৫ সেকেন্ড</strong> অপেক্ষা করুন।</li>
            <li>সেখানে থাকা <strong>"I am not a robot"</strong> ক্যাপচা ভেরিফাই করে নীল বা সবুজ রঙের <strong>"Get Link"</strong> চাপুন।</li>
            <li>লিংকটি ওপেন হলেই আমাদের অ্যাপে ফিরে আসুন এবং <strong>"কয়েন সংগ্রহ করুন"</strong> বাটনে চাপ দিন!</li>
          </ol>
        </div>
      )}

      {/* Active Verification Card if In Progress */}
      {activeVerification && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 p-4 shadow-lg animate-pulse">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-400">লিংক ভিজিট যাচাই হচ্ছে...</div>
                <div className="text-sm font-bold text-white">{activeVerification.title}</div>
              </div>
            </div>

            <div className="text-right">
              {activeVerification.secondsLeft > 0 ? (
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-black">
                  ⏳ {activeVerification.secondsLeft} সেকেন্ড বাকি
                </div>
              ) : (
                <button
                  onClick={() => {
                    const task = tasksList.find(t => t.id === activeVerification.taskId);
                    if (task) handleClaimReward(task);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 animate-bounce"
                >
                  🎉 কয়েন সংগ্রহ করুন (+{activeVerification.reward})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tasksList.map(task => {
          const isVerifying = activeVerification?.taskId === task.id;
          const isTimerDone = isVerifying && activeVerification.secondsLeft === 0;

          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-4 transition relative flex flex-col justify-between ${
                task.completedToday
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${task.badgeColor}`}>
                    {task.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>+{task.reward}</span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                  {task.titleBn}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>সময়: মাত্র {task.timeSec} সেকেন্ড</span>
                  <span className="mx-1">•</span>
                  <span>নেটওয়ার্ক: {task.provider}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {task.completedToday ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>আজ সম্পন্ন হয়েছে</span>
                  </div>
                ) : isVerifying ? (
                  isTimerDone ? (
                    <button
                      onClick={() => handleClaimReward(task)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>কয়েন দাবি করুন (+{task.reward})</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs text-center flex items-center justify-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>অপেক্ষা করুন ({activeVerification.secondsLeft}s)</span>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => handleStartTask(task)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 group"
                  >
                    <span>লিংক ভিজিট করুন</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Code Verification Box */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>শর্টলিংক সিক্রেট কোড বা প্রমো কোড রিডিম</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          যদি কোনো শর্টলিংকের শেষ পেজে আপনি বিশেষ ৪-৬ সংখ্যার সিক্রেট কোড পান, সেটি এখানে লিখে সাথে সাথে ৫০-১০০ কয়েন বোনাস নিন:
        </p>
        <form onSubmit={handleSecretCodeSubmit} className="flex gap-2">
          <input
            type="text"
            value={secretCodeInput}
            onChange={(e) => setSecretCodeInput(e.target.value)}
            placeholder="উদাহরণ: SHRINK100 বা BONUS77"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1"
          >
            <span>ক্লেইম</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
