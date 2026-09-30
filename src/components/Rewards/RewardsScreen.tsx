import React, { useState } from 'react';
import { 
  Gift, 
  Flame, 
  Tv, 
  Share2, 
  Award, 
  CheckCircle2, 
  Coins, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Trophy,
  MessageCircle,
  Share
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { AdInterstitial } from '../Feed/AdInterstitial';
import { MiniBannerAd } from '../Common/MiniBannerAd';

export const RewardsScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { settings, language, showToast, triggerConfetti } = useApp();

  const [checkingIn, setCheckingIn] = useState(false);
  const [claimingMilestone, setClaimingMilestone] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [claimingRef, setClaimingRef] = useState(false);

  // Rewarded ad modal state
  const [watchingAd, setWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const streakRewards = [10, 15, 20, 25, 35, 45, 75];
  const isCheckedInToday = user?.lastCheckInDate === new Date().toISOString().split('T')[0];

  const handleDailyCheckIn = async () => {
    if (checkingIn || isCheckedInToday) return;
    setCheckingIn(true);
    try {
      const res = await api.dailyCheckIn();
      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} দৈনিক বোনাস অর্জিত! 🎉` : `+${res.earnedCoins} Daily Bonus Earned!`,
          '',
          'coin'
        );
      } else {
        showToast(res.message, '', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Error claiming check-in', '', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleClaimMilestone = async (count: number) => {
    setClaimingMilestone(count);
    try {
      const res = await api.claimMilestone(count);
      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} মাইলস্টোন বোনাস অর্জিত! 🏆` : `+${res.earnedCoins} Milestone Bonus!`,
          '',
          'coin'
        );
      } else {
        showToast(res.message, '', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'ভিডিও লক্ষ্যমাত্রা এখনো অপূর্ণ', '', 'error');
    } finally {
      setClaimingMilestone(null);
    }
  };

  const handleStartRewardedAd = () => {
    if (watchingAd) return;
    setWatchingAd(true);
    setCountdown(10);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishAdReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishAdReward = async () => {
    try {
      const res = await api.claimRewardedAd('reward_center_sponsor');
      if (res.success) {
        soundService.playCoinReward();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} স্পন্সরড বোনাস অর্জিত! 🎁` : `+${res.earnedCoins} Sponsored Ad Reward!`,
          '',
          'coin'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWatchingAd(false);
    }
  };

  const handleCopyReferral = () => {
    const code = user?.referralCode || 'BD7788';
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(language === 'bn' ? 'রেফারেল কোড কপি হয়েছে!' : 'Referral code copied!', '', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputReferralCode.trim() || claimingRef) return;
    setClaimingRef(true);
    try {
      const res = await api.claimReferral(inputReferralCode.trim());
      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        setInputReferralCode('');
        showToast(
          language === 'bn' ? `+${res.earnedCoins} রেফারেল ওয়েলকাম বোনাস! 🤝` : `+${res.earnedCoins} Referral Welcome Bonus!`,
          '',
          'coin'
        );
      } else {
        showToast(res.message, '', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ভুল রেফারেল কোড', '', 'error');
    } finally {
      setClaimingRef(false);
    }
  };

  const milestones = [
    { count: 5, reward: 20, descBn: '৫টি ভিডিও দেখুন', descEn: 'Watch 5 videos' },
    { count: 10, reward: 50, descBn: '১০টি ভিডিও দেখুন', descEn: 'Watch 10 videos' },
    { count: 25, reward: 150, descBn: '২৫টি ভিডিও দেখুন', descEn: 'Watch 25 videos' },
    { count: 50, reward: 350, descBn: '৫০টি ভিডিও দেখুন', descEn: 'Watch 50 videos' },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Real Full Screen Sponsored Ad with Pictures and Action buttons */}
      {watchingAd && (
        <div className="fixed inset-0 z-50 bg-black">
          <AdInterstitial
            durationSeconds={15}
            rewardCoins={settings?.rewardedAdBonus || 35}
            onAdCompleted={finishAdReward}
          />
        </div>
      )}

      {/* 7-Day Streak Calendar */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0C1524] via-[#09101C] to-[#0D1C16] border border-amber-500/30 p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <h3 className="font-bold text-sm text-white">
              {language === 'bn' ? '৭ দিনের স্ট্রিক বোনাস' : '7-Day Check-in Streak'}
            </h3>
          </div>
          <span className="text-xs font-black text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
            {user?.streakDays || 1} {language === 'bn' ? 'দিন চলমান' : 'Days Streak'}
          </span>
        </div>

        {/* 7 Day Blocks Grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {streakRewards.map((amt, idx) => {
            const dayNum = idx + 1;
            const isCompleted = (user?.streakDays || 0) >= dayNum && (isCheckedInToday || (user?.streakDays || 0) > dayNum);
            const isCurrent = (user?.streakDays || 1) === dayNum;

            return (
              <div
                key={dayNum}
                className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-between ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[9px] font-bold">D{dayNum}</span>
                <span className="text-xs my-0.5">🪙</span>
                <span className="text-[10px] font-black leading-none">+{amt}</span>
              </div>
            );
          })}
        </div>

        {/* Check-in CTA */}
        <button
          onClick={handleDailyCheckIn}
          disabled={isCheckedInToday || checkingIn}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition"
        >
          {isCheckedInToday 
            ? (language === 'bn' ? '✓ আজকের বোনাস গ্রহণ করেছেন' : '✓ Claimed for today') 
            : (language === 'bn' ? 'আজকের বোনাস গ্রহণ করুন' : 'Claim Daily Bonus')}
        </button>
      </div>

      {/* Watch Milestones Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm text-white">
            {language === 'bn' ? 'দৈনিক ভিডিও মাইলস্টোন' : 'Daily Watch Milestones'}
          </h3>
        </div>

        <div className="space-y-2.5">
          {milestones.map((m) => {
            const watchedCount = user?.todayVideosCount || 0;
            const isReached = watchedCount >= m.count;

            return (
              <div
                key={m.count}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      {language === 'bn' ? m.descBn : m.descEn}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {language === 'bn' ? `+${m.reward} কয়েন` : `+${m.reward} Coins`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (watchedCount / m.count) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {watchedCount}/{m.count}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleClaimMilestone(m.count)}
                  disabled={!isReached || claimingMilestone === m.count}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition shrink-0"
                >
                  {isReached 
                    ? (language === 'bn' ? 'ক্লেম করুন' : 'Claim') 
                    : (language === 'bn' ? 'বাকি আছে' : 'Locked')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sponsored Rewarded Ad Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Tv className="w-4 h-4" />
            <h4 className="text-xs font-bold text-white">
              {language === 'bn' ? 'স্পনসরড বিজ্ঞাপন বোনাস' : 'Watch Sponsored Ad'}
            </h4>
          </div>
          <p className="text-[10px] text-slate-400">
            {language === 'bn' ? 'বিজ্ঞাপন দেখে বাড়তি ৩০ কয়েন জিতে নিন' : 'Watch 15s sponsored clip'}
          </p>
        </div>

        <button
          onClick={handleStartRewardedAd}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-cyan-500/20 shrink-0 transition"
        >
          +{settings?.rewardedAdBonus || 30} Coins
        </button>
      </div>

      {/* Referral Hub */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#091522] via-[#070D17] to-[#0F1E1A] border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Share2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'রেফারেল ইনভাইট প্রোগ্রাম' : 'Referral Program'}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {language === 'bn' ? `মোট রেফারেল: ${user?.referralCount || 0}` : `Total Referrals: ${user?.referralCount || 0}`}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-400 block font-medium">
              {language === 'bn' ? 'আপনার ব্যক্তিগত রেফারেল কোড:' : 'Your Unique Referral Code:'}
            </span>
            <span className="text-base font-black text-emerald-400 font-mono tracking-widest">
              {user?.referralCode || 'BD7788'}
            </span>
          </div>

          <button
            onClick={handleCopyReferral}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}
          </button>
        </div>

        {/* 🚀 One-Tap WhatsApp & Social Share Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              const shareText = `🔥 ভিডিও দেখে ও গেম খেলে প্রতিদিন বিকাশ/নগদে টাকা আয় করুন! আমার রেফারেল কোড [${user?.referralCode || 'BD7788'}] দিয়ে একাউন্ট খুললেই পাবেন ৫০ কয়েন বোনাস!\n👉 এখনই জয়েন করুন: ${window.location.origin}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
            }}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>হোয়াটসঅ্যাপে শেয়ার</span>
          </button>

          <button
            onClick={() => {
              const shareText = `🔥 ভিডিও দেখে ও গেম খেলে প্রতিদিন বিকাশ/নগদে টাকা আয় করুন! আমার রেফারেল কোড [${user?.referralCode || 'BD7788'}] দিয়ে একাউন্ট খুললেই পাবেন ৫০ কয়েন বোনাস!\n👉 এখনই জয়েন করুন: ${window.location.origin}`;
              if (navigator.share) {
                navigator.share({
                  title: 'WATCH & EARN BD',
                  text: shareText,
                  url: window.location.origin
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(shareText);
                showToast('রেফারেল ইনভাইট মেসেজ কপি হয়েছে!', 'মেসেঞ্জার বা ফেসবুকে বন্ধুদের পাঠিয়ে দিন।', 'success');
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
          >
            <Share className="w-4 h-4" />
            <span>বন্ধুদের শেয়ার করুন</span>
          </button>
        </div>

        {/* Enter someone else's referral code if not yet referred */}
        {!user?.referredBy && (
          <form onSubmit={handleApplyReferralCode} className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-slate-300 block">
                {language === 'bn' ? 'বন্ধুর রেফারেল কোড দিন:' : 'Have a friend referral code?'}
              </label>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                +৫০ কয়েন পাবেন 🎁
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputReferralCode}
                onChange={(e) => setInputReferralCode(e.target.value.toUpperCase())}
                placeholder="যেমন: BD9921"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 uppercase"
              />
              <button
                type="submit"
                disabled={!inputReferralCode.trim() || claimingRef}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 disabled:opacity-40"
              >
                {claimingRef ? '...' : (language === 'bn' ? 'প্রয়োগ' : 'Apply')}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 leading-tight">
              • আপনি পাবেন ৫০ কয়েন, বন্ধু পাবে ২৫ কয়েন এবং ভবিষ্যতে আপনার প্রতিটি উত্তোলনের ১% আজীবন রয়েল্টি কমিশন পাবে।
            </p>
          </form>
        )}
      </div>

      {/* 📢 খালি জায়গায় ছোট ব্যানার অ্যাড (Rewards Screen Mini Banner) */}
      <MiniBannerAd slotId="rewards_middle_slot" category="finance" />

      {/* Achievement Badges Showcase */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white">
            {language === 'bn' ? 'অর্জন ব্যাজ (Achievements)' : 'Achievement Badges'}
          </h4>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400">
            <span className="text-xl block mb-1">🌱</span>
            <span className="text-[9px] font-bold text-white block">Newbie</span>
            <span className="text-[8px] text-slate-400">Unlocked</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-400">
            <span className="text-xl block mb-1">🔥</span>
            <span className="text-[9px] font-bold text-white block">Streaker</span>
            <span className="text-[8px] text-slate-400">Day {user?.streakDays || 1}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-400">
            <span className="text-xl block mb-1">🎬</span>
            <span className="text-[9px] font-bold text-white block">Watcher</span>
            <span className="text-[8px] text-slate-400">Level 2</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">
            <span className="text-xl block mb-1">👑</span>
            <span className="text-[9px] font-bold text-slate-300 block">VIP BD</span>
            <span className="text-[8px] text-slate-500">5000 Coins</span>
          </div>
        </div>
      </div>
    </div>
  );
};
