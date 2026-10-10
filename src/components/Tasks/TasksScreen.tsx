import React, { useState } from 'react';
import { 
  CheckSquare, 
  HelpCircle, 
  Calculator, 
  ShieldCheck, 
  CalendarCheck, 
  Coins, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Trophy, 
  Flame, 
  Award, 
  Zap,
  Youtube,
  Globe,
  Smartphone,
  Send,
  Gift,
  ExternalLink,
  CheckCircle2,
  Lock,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { AdInterstitial } from '../Feed/AdInterstitial';
import { MiniBannerAd } from '../Common/MiniBannerAd';
import { sanitizeAdDirectLink } from '../../utils/adLinkSanitizer';
import { SponsoredClickHub } from '../Common/SponsoredClickHub';
import { openAdWithStrictTimer } from '../Common/AdVisitTimerModal';
import { OfferwallHub } from './OfferwallHub';

type TaskType = 'math' | 'gk' | 'captcha' | 'daily_checkin';
type TaskTab = 'micro_tasks' | 'daily_tasks' | 'offerwall';

interface FreeMicroTask {
  id: string;
  titleBn: string;
  category: 'youtube' | 'web' | 'app' | 'social';
  icon: string;
  badge: string;
  timeSec: number;
  reward: number;
  descBn: string;
  link: string;
}

export const TasksScreen: React.FC = () => {
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { language, showToast, triggerConfetti, settings } = useApp();

  const [activeTab, setActiveTab] = useState<TaskTab>('micro_tasks');
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

  // Free Micro-task state
  const [completedMicroTasks, setCompletedMicroTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('completed_free_micro_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const adsterraDirectLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const hilltopAdsDirectLink = settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c';

  const freeMicroTasksList: FreeMicroTask[] = [
    {
      id: 'free_task_hilltop_visit',
      titleBn: 'HilltopAds স্পন্সর সাইট ভিজিট ও ১৫ সেকেন্ড স্ক্রোল 🚀',
      category: 'web',
      icon: '⚡',
      badge: '১০০% ফ্রি',
      timeSec: 15,
      reward: 35,
      descBn: 'স্পন্সর সাইটে প্রবেশ করে ১৫ সেকেন্ড স্ক্রোল করুন—কোনো টাকা বা সাইনআপ লাগবে না',
      link: hilltopAdsDirectLink
    },
    {
      id: 'free_task_yt_sub',
      titleBn: 'স্পন্সর ভিডিও ক্লিপ দেখুন ও ২০ সেকেন্ড অপেক্ষা করুন 🎬',
      category: 'youtube',
      icon: '🎬',
      badge: 'ভিডিও স্পন্সর',
      timeSec: 20,
      reward: 30,
      descBn: 'স্পন্সর ভিডিও পেজটি ২০ সেকেন্ড স্ক্রোল করে দেখুন—টাইমার শেষ হলে কয়েন যোগ হবে',
      link: adsterraDirectLink
    },
    {
      id: 'free_task_web_visit',
      titleBn: 'Adsterra স্পন্সর পেজ ভিজিট ও ২০ সেকেন্ড স্ক্রোল 🌐',
      category: 'web',
      icon: '🌐',
      badge: 'সহজ ভিজিট',
      timeSec: 20,
      reward: 25,
      descBn: 'স্পন্সর সাইটে প্রবেশ করে ২০ সেকেন্ড স্ক্রোল করে পড়ুন—কোনো রেজিস্ট্রেশন লাগবে না',
      link: adsterraDirectLink
    },
    {
      id: 'free_task_app_trial',
      titleBn: 'ফ্রি অ্যান্ড্রয়েড লাইট অ্যাপ ও গেম টেস্ট 📱',
      category: 'app',
      icon: '📲',
      badge: 'প্লে-স্টোর ফ্রি',
      timeSec: 30,
      reward: 50,
      descBn: 'প্লে-স্টোরের ১টি ছোট ফ্রি অ্যাপ বা গেম ১ মিনিট টেস্ট করে বড় কয়েন বোনাস নিন',
      link: hilltopAdsDirectLink
    },
    {
      id: 'free_task_telegram',
      titleBn: 'অফিশিয়াল টেলিগ্রাম চ্যানেল ও সাপোর্ট গ্রুপ ✈️',
      category: 'social',
      icon: '✈️',
      badge: 'সোশ্যাল জয়েন',
      timeSec: 15,
      reward: 20,
      descBn: 'আমাদের টেলিগ্রাম চ্যানেলে জয়েন করুন এবং নতুন পেমেন্ট প্রুফ ও আপডেট পান',
      link: 'https://t.me/+EarnWatchBD'
    },
    {
      id: 'free_task_deal_view',
      titleBn: 'বাংলাদেশ প্রিমিয়াম ক্যাশব্যাক ও রিওয়ার্ড ভিউ 🎁',
      category: 'web',
      icon: '🎁',
      badge: '১০০% ফ্রি বোনাস',
      timeSec: 20,
      reward: 35,
      descBn: 'ফ্রি রিওয়ার্ড ভাউচার ও গিফট কার্ড সাইট ২০ সেকেন্ড ভিউ করুন',
      link: hilltopAdsDirectLink
    },
    {
      id: 'free_task_quiz_portal',
      titleBn: 'অনলাইন দ্রুত মতামত সার্ভে ও বিকাশ কুইজ 📋',
      category: 'app',
      icon: '📝',
      badge: 'সহজ কুইজ',
      timeSec: 20,
      reward: 40,
      descBn: 'সহজ বাংলা কুইজে মতামত দিন ও ইনস্ট্যান্ট ওয়ালেট পয়েন্ট অর্জন করুন',
      link: adsterraDirectLink
    }
  ];

  const handleStartMicroTask = (task: FreeMicroTask) => {
    soundService.playCoinReward();
    // 🛡️ Open with strict 20-second engaged visit verification
    openAdWithStrictTimer(task.link, task.titleBn, Math.min(task.reward, 20), 20);
    if (!completedMicroTasks.includes(task.id)) {
      const updated = [...completedMicroTasks, task.id];
      setCompletedMicroTasks(updated);
      try {
        localStorage.setItem('completed_free_micro_tasks', JSON.stringify(updated));
      } catch {}
    }
  };

  // Ad stages:
  // PRE_TASK: Before task opens
  // POST_TASK: Immediately after completing before reward credit
  const [adStage, setAdStage] = useState<'NONE' | 'PRE_TASK' | 'POST_TASK'>('NONE');
  const [taskCoins, setTaskCoins] = useState<number>(0);

  // ---------- MATH QUIZ STATE ----------
  const [mathNum1, setMathNum1] = useState(12);
  const [mathNum2, setMathNum2] = useState(8);
  const [mathAnswer, setMathAnswer] = useState('');

  // ---------- GK QUIZ STATE ----------
  const gkQuestions = [
    {
      q: 'বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?',
      options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জসীম উদ্দীন', 'জীবনানন্দ দাশ'],
      ans: 'রবীন্দ্রনাথ ঠাকুর'
    },
    {
      q: 'পদ্মা সেতুর মোট দৈর্ঘ্য কত কিলোমিটার?',
      options: ['৫.১৫ কিমি', '৬.১৫ কিমি', '৭.১৫ কিমি', '৬.৫০ কিমি'],
      ans: '৬.১৫ কিমি'
    },
    {
      q: 'বাংলাদেশের কেন্দ্রীয় ব্যাংকের নাম কী?',
      options: ['বাংলাদেশ ব্যাংক', 'সোনালী ব্যাংক', 'জনতা ব্যাংক', 'রূপালী ব্যাংক'],
      ans: 'বাংলাদেশ ব্যাংক'
    }
  ];
  const [currentGkIndex, setCurrentGkIndex] = useState(0);

  // ---------- CAPTCHA STATE ----------
  const [captchaCode, setCaptchaCode] = useState('BD78X9');
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  const tasksList: { id: TaskType; titleBn: string; titleEn: string; icon: string; descBn: string; reward: number }[] = [
    {
      id: 'math',
      titleBn: '১. সহজ অংক (যোগ-বিয়োগ) ➕➖',
      titleEn: 'Math Quiz (Add/Subtract)',
      icon: '🧮',
      descBn: 'ছোট ছোট গাণিতিক হিসাব করে ইনস্ট্যান্ট কয়েন আয় করুন',
      reward: 10
    },
    {
      id: 'gk',
      titleBn: '২. সাধারণ জ্ঞান (GK) কুইজ 🧠',
      titleEn: 'General Knowledge Quiz',
      icon: '🧠',
      descBn: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়ের সঠিক উত্তর দিয়ে কয়েন জিতুন',
      reward: 12
    },
    {
      id: 'captcha',
      titleBn: '৩. ক্যাপচা পূরণ (Captcha) 🔤',
      titleEn: 'Captcha Solving',
      icon: '🔤',
      descBn: 'সহজ ৬ অক্ষরের কোড দেখে টাইপ করুন ও রিওয়ার্ড নিন',
      reward: 8
    },
    {
      id: 'daily_checkin',
      titleBn: '৪. ডেইলি চেক-ইন বোনাস 📅',
      titleEn: 'Daily Check-in Streak',
      icon: '📅',
      descBn: 'প্রতিদিন অ্যাপে প্রবেশ করে নিয়মিত ধারাবাহিক কয়েন বোনাস নিন',
      reward: 15
    }
  ];

  // Step 1: Click Task -> Auto popunder + 20s pre-task ad
  const handleSelectTask = (taskId: TaskType) => {
    setActiveTask(taskId);
    if (taskId === 'daily_checkin') {
      executeDailyCheckIn();
      return;
    }

    // 🚀 Auto-trigger Adsterra Popunder / Direct link in background
    try {
      const directLink = sanitizeAdDirectLink(settings?.adsConfig?.adsterraDirectLink, 'adsterra');
      window.open(directLink, '_blank', 'noopener,noreferrer');
    } catch {}

    if (taskId === 'math') {
      setMathNum1(Math.floor(Math.random() * 25) + 5);
      setMathNum2(Math.floor(Math.random() * 20) + 2);
      setMathAnswer('');
    }
    if (taskId === 'captcha') {
      generateCaptcha();
    }
    setAdStage('PRE_TASK');
  };

  // Step 2: Pre-task ad finished -> Open task form
  const handlePreAdFinished = () => {
    setAdStage('NONE');
  };

  // Step 3: Task completed -> SHOW POST-TASK AD (Double monetization)
  const triggerTaskComplete = (earned: number) => {
    setTaskCoins(earned);
    setAdStage('POST_TASK');
  };

  // Step 4: Post-task ad finished -> Credit in database
  const handlePostAdFinished = async () => {
    setAdStage('NONE');
    awardCoinsLocally(taskCoins);
    soundService.playSuccessFanfare();
    triggerConfetti();
    showToast(
      language === 'bn' ? `+${taskCoins} টাস্ক রিওয়ার্ড ওয়ালেটে যোগ হয়েছে! ✅` : `+${taskCoins} Task Reward Credited!`,
      '',
      'coin'
    );
    setActiveTask(null);

    try {
      const res = await api.claimTaskReward(activeTask || 'task', activeTask || 'task', taskCoins);
      if (res && res.success) {
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostAdSkipped = () => {
    setAdStage('NONE');
    setActiveTask(null);
    showToast(
      language === 'bn' ? '⚠️ বিজ্ঞাপন পুরো না দেখায় টাস্কের রিওয়ার্ড কয়েন যোগ হয়নি।' : 'Ad skipped. No task reward earned.',
      '',
      'error'
    );
  };

  // Math submit
  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer, 10) === (mathNum1 + mathNum2)) {
      triggerTaskComplete(10);
    } else {
      showToast('ভুল উত্তর! আবার চেষ্টা করুন।', '', 'error');
    }
  };

  // GK Answer select
  const handleGkAnswer = (selected: string) => {
    if (selected === gkQuestions[currentGkIndex].ans) {
      triggerTaskComplete(12);
    } else {
      showToast('ভুল উত্তর! আবার সঠিক উত্তর নির্বাচন করুন।', '', 'error');
    }
  };

  // Captcha submit
  const handleCaptchaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.trim().toUpperCase() === captchaCode) {
      triggerTaskComplete(8);
    } else {
      showToast('ক্যাপচা কোড মেলেনি! আবার লিখুন।', '', 'error');
      generateCaptcha();
    }
  };

  // Daily Check-in
  const executeDailyCheckIn = async () => {
    try {
      const res = await api.dailyCheckIn();
      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} দৈনিক চেক-ইন বোনাস পেয়েছেন! 🌟` : `+${res.earnedCoins} Daily Check-In Bonus!`,
          '',
          'coin'
        );
      } else {
        showToast(res.message, '', 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'আজকের চেক-ইন ইতিমধ্যেই শেষ', '', 'info');
    }
    setActiveTask(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-24 sm:pt-28 pb-24 space-y-4">
      {/* 🚀 Main Navigation Tabs: 100% Free Micro Tasks vs Daily Quiz & Captcha vs Offerwall */}
      <div className="p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('micro_tasks');
              setActiveTask(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
              activeTab === 'micro_tasks'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/40'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'micro_tasks' ? 'text-slate-950 fill-slate-950' : 'text-emerald-400'}`} />
            <span>১০০% ফ্রি টাস্ক ⚡</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('daily_tasks');
            }}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
              activeTab === 'daily_tasks'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/40'
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${activeTab === 'daily_tasks' ? 'text-white' : 'text-purple-400'}`} />
            <span>কুইজ ও ক্যাপচা 📝</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('offerwall');
              setActiveTask(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
              activeTab === 'offerwall'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/40'
            }`}
          >
            <Flame className={`w-4 h-4 ${activeTab === 'offerwall' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>অফারওয়াল হাব 🔥</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 100% FREE MICRO TASKS (NO DEPOSIT / ZERO COST) */}
      {activeTab === 'micro_tasks' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* 💎 HIGH-CPM SPONSOR CLICK & VISIT REWARD HUB */}
          <SponsoredClickHub compact={true} />

          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#06201B] via-[#0A2E26] to-[#041512] border border-emerald-500/40 p-4 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-emerald-400" />
                <span>১০০% ফ্রি মাইক্রো-টাস্ক 📱</span>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                কোনো টাকা লাগবে না 🆓
              </span>
            </div>

            <h2 className="text-lg font-black text-white font-['Outfit'] mb-1">
              ইউটিউব সাবস্ক্রাইব, ওয়েবসাইট ভিজিট ও ফ্রি অ্যাপ
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              সহজ ১৫-২০ সেকেন্ডের কাজ শেষ করে ইনস্ট্যান্ট ওয়ালেট কয়েন ক্লেইম করুন। ইউজারের ১ পয়সাও খরচ নেই!
            </p>

            <div className="mt-3 p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between text-[11px]">
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ভেরিফাইড ফ্রি কাজ • আনলিমিটেড পয়েন্ট</span>
              </span>
              <span className="text-amber-400 font-mono font-black">
                +২০ হতে +৫০ কয়েন
              </span>
            </div>
          </div>

          {/* Micro Tasks List */}
          <div className="space-y-2.5">
            {freeMicroTasksList.map((task) => {
              const isDone = completedMicroTasks.includes(task.id);
              return (
                <div
                  key={task.id}
                  onClick={() => handleStartMicroTask(task)}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between group active:scale-98 cursor-pointer ${
                    isDone 
                      ? 'bg-[#0a1612] border-emerald-500/30' 
                      : 'bg-[#0B111E] border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition">
                      {task.icon}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white leading-tight">
                          {task.titleBn}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {task.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{task.descBn}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.timeSec} সেকেন্ড</span>
                        </span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">১০০% সম্পূর্ণ ফ্রি</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-2 shrink-0">
                    <span className="text-xs font-black text-emerald-400 font-mono block">
                      +{task.reward} কয়েন
                    </span>
                    <button 
                      type="button"
                      className={`mt-1.5 px-3 py-1 rounded-xl font-black text-[10px] shadow transition flex items-center gap-1 ${
                        isDone 
                          ? 'bg-emerald-600 text-slate-950 font-black' 
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>সম্পন্ন</span>
                        </>
                      ) : (
                        <>
                          <span>শুরু করুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini Banner */}
          <div className="pt-2">
            <MiniBannerAd slotId="tasks_screen_micro_bottom" category="gaming" />
          </div>
        </div>
      )}

      {/* TAB 2: CPA OFFERWALL HUB */}
      {activeTab === 'offerwall' && (
        <OfferwallHub onSwitchToDailyTasks={() => setActiveTab('daily_tasks')} />
      )}

      {/* TAB 3: DAILY QUIZ & CAPTCHA TASKS */}
      {activeTab === 'daily_tasks' && (
        <>
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#121128] via-[#1B163B] to-[#0D182E] border border-purple-500/30 p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <CheckSquare className="w-4 h-4" />
                <span>টাস্ক এবং কুইজ মডিউল 📝</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                সহজ কাজ • বাড়তি আয়
              </span>
            </div>

            <h2 className="text-xl font-black text-white font-['Outfit'] mb-1">
              কুইজ খেলে ও ক্যাপচা পূরণ করে কয়েন নিন
            </h2>
            <p className="text-xs text-slate-300">
              প্রতিটি টাস্কের আগে ও পরে স্পন্সরড বিজ্ঞাপন দেখে আপনি অতিরিক্ত ক্যাশআউট পয়েন্ট আয় করতে পারবেন।
            </p>

            {/* Ad Info */}
            <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between text-[11px]">
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>টাস্ক প্রি ও পোস্ট অ্যাড সিস্টেম সক্রিয়</span>
              </span>
              <span className="text-emerald-400 font-mono font-black">
                +৮ হতে +১৫ কয়েন
              </span>
            </div>
          </div>

      {/* Main Task Selector or Active Task Arena */}
      {!activeTask ? (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            উপলব্ধ টাস্ক সমূহ
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {tasksList.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTask(t.id)}
                className="p-4 rounded-3xl bg-[#0C0F1A] border border-slate-800 hover:border-purple-500/50 cursor-pointer transition flex items-center justify-between group active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition">
                    {t.icon}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">{t.titleBn}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.descBn}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 font-mono block">
                    +{t.reward} কয়েন
                  </span>
                  <button className="mt-1 px-3 py-1 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white font-black text-[10px] shadow transition">
                    শুরু করুন ▶
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 📢 Sponsored Dynamic Banner Ad */}
          <div className="pt-2">
            <MiniBannerAd slotId="tasks_screen_bottom" category="gaming" />
          </div>
        </div>
      ) : (
        /* ACTIVE TASK ARENA */
        <div className="p-4 rounded-3xl bg-[#0C0F1A] border border-purple-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTask(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>টাস্ক লিস্টে ফিরুন</span>
            </button>
            <span className="text-xs font-black text-amber-400 uppercase">
              {activeTask.toUpperCase()} CHALLENGE
            </span>
          </div>

          {/* 1. MATH TASK */}
          {activeTask === 'math' && (
            <form onSubmit={handleMathSubmit} className="space-y-4 py-2">
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-2">নিচের যোগফলটি বের করুন:</span>
                <div className="text-3xl font-black text-white font-mono tracking-wider">
                  {mathNum1} + {mathNum2} = ?
                </div>
              </div>

              <div>
                <input
                  type="number"
                  required
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="সঠিক উত্তর লিখুন..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-center text-lg font-black text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl transition"
              >
                উত্তর সাবমিট করুন (+১০ কয়েন)
              </button>
            </form>
          )}

          {/* 2. GK QUIZ TASK */}
          {activeTask === 'gk' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-purple-400 font-bold block mb-1">সাধারণ জ্ঞান প্রশ্ন:</span>
                <h4 className="text-base font-black text-white leading-snug">
                  {gkQuestions[currentGkIndex].q}
                </h4>
              </div>

              <div className="space-y-2">
                {gkQuestions[currentGkIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleGkAnswer(opt)}
                    className="w-full p-3 text-left rounded-2xl bg-slate-900 hover:bg-purple-500/20 border border-slate-800 hover:border-purple-500 text-xs font-bold text-slate-200 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. CAPTCHA TASK */}
          {activeTask === 'captcha' && (
            <form onSubmit={handleCaptchaSubmit} className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">ক্যাপচা কোড:</span>
                  <span className="text-2xl font-mono font-black tracking-widest text-amber-400 select-none">
                    {captchaCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="উপরের কোডটি এখানে লিখুন"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-center text-base font-mono font-black text-white uppercase focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl transition"
              >
                ক্যাপচা কনফার্ম করুন (+৮ কয়েন)
              </button>
            </form>
          )}
        </div>
      )}
      </>
      )}

      {/* ========================================================= */}
      {/* 📢 PRE-TASK AND POST-TASK INTERSTITIAL ADS */}
      {/* ========================================================= */}
      {adStage === 'PRE_TASK' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden border-2 border-purple-500/60 shadow-2xl flex flex-col justify-center">
            <AdInterstitial
              durationSeconds={20}
              rewardCoins={0}
              title="টাস্ক আনলক ভেরিফিকেশন"
              onAdCompleted={handlePreAdFinished}
              onAdSkipped={handlePreAdFinished}
            />
          </div>
        </div>
      )}

      {adStage === 'POST_TASK' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl flex flex-col justify-center">
            <AdInterstitial
              durationSeconds={18}
              rewardCoins={taskCoins || 25}
              onAdCompleted={handlePostAdFinished}
              onAdSkipped={handlePostAdSkipped}
            />
          </div>
        </div>
      )}
    </div>
  );
};
