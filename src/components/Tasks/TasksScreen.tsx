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
  Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { AdInterstitial } from '../Feed/AdInterstitial';

type TaskType = 'math' | 'gk' | 'captcha' | 'daily_checkin';

export const TasksScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, showToast, triggerConfetti } = useApp();

  const [activeTask, setActiveTask] = useState<TaskType | null>(null);

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

  // Step 1: Click Task -> SHOW PRE-TASK AD (Profit first)
  const handleSelectTask = (taskId: TaskType) => {
    setActiveTask(taskId);
    if (taskId === 'daily_checkin') {
      executeDailyCheckIn();
      return;
    }
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
    try {
      const res = await api.claimTaskReward(activeTask || 'task', activeTask || 'task', taskCoins);
      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} টাস্ক রিওয়ার্ড ওয়ালেটে যোগ হয়েছে! ✅` : `+${res.earnedCoins} Task Reward Credited!`,
          '',
          'coin'
        );
        setActiveTask(null);
      }
    } catch (e) {
      console.error(e);
    }
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
    <div className="w-full max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
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
          কুইজ খেলে ও টাস্ক করে কয়েন নিন
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

      {/* ========================================================= */}
      {/* 📢 PRE-TASK AND POST-TASK INTERSTITIAL ADS */}
      {/* ========================================================= */}
      {adStage === 'PRE_TASK' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden border-2 border-purple-500/60 shadow-2xl flex flex-col justify-center">
            <AdInterstitial
              durationSeconds={12} // Quick 12s pre-task ad
              rewardCoins={0}
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
              durationSeconds={18} // 18s post-task ad
              rewardCoins={taskCoins}
              onAdCompleted={handlePostAdFinished}
              onAdSkipped={handlePostAdFinished}
            />
          </div>
        </div>
      )}
    </div>
  );
};
