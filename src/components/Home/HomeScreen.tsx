import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Coins, 
  TrendingUp, 
  ArrowRight, 
  Gift, 
  Share2, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Tv, 
  Award,
  Wallet,
  Youtube,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Video } from '../../types';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { LivePayoutTicker } from './LivePayoutTicker';
import { MiniBannerAd } from '../Common/MiniBannerAd';
import { AdInterstitial } from '../Feed/AdInterstitial';

export const HomeScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { 
    setActiveTab, 
    settings, 
    setTargetVideoId, 
    setSelectedCategory,
    language, 
    showToast, 
    triggerConfetti 
  } = useApp();

  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);

  const handleOpenYouTubeApp = (topic?: string) => {
    if (topic) setSelectedCategory(topic);
    setActiveTab('watch');
    showToast(
      language === 'bn' 
        ? '🔴 ভিডিও চালু হয়েছে! ভিডিও দেখার সাথে সাথে কয়েন জমা হবে ও বিজ্ঞাপন আসবে।' 
        : '🔴 Video playing! Watch to earn coins & ads automatically.',
      '',
      'coin'
    );
  };

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const list = await api.getVideos();
      setTrendingVideos(list.slice(0, 4));
    } catch (err) {
      console.error(err);
    }
  };

  // 1-Click Daily Checkin
  const handleDailyCheckIn = async () => {
    if (checkingIn) return;
    setCheckingIn(true);
    try {
      const res = await api.dailyCheckIn();
      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} দৈনিক বোনাস যুক্ত হয়েছে! 🌟` : `+${res.earnedCoins} Daily Check-In Bonus!`,
          language === 'bn' ? `দিন ${res.streakDays} এর স্ট্রিক চলমান রয়েছে।` : `Day ${res.streakDays} streak maintained.`,
          'coin'
        );
      } else {
        showToast(res.message, '', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'আজকের বোনাস ইতিমধ্যে গৃহীত হয়েছে', '', 'info');
    } finally {
      setCheckingIn(false);
    }
  };

  // Rewarded Ad Simulation
  const handleWatchRewardedAd = async () => {
    if (watchingAd) return;
    setWatchingAd(true);
    setAdCountdown(8);

    const interval = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishRewardedAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishRewardedAd = async () => {
    try {
      const res = await api.claimRewardedAd('home_sponsor_ad');
      if (res.success) {
        soundService.playCoinReward();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} স্পনসরড কয়েন বোনাস! 🎁` : `+${res.earnedCoins} Ad Reward Claimed!`,
          language === 'bn' ? 'সফলভাবে স্পনসর বিজ্ঞাপন দেখার জন্য ধন্যবাদ।' : 'Thank you for watching the sponsored ad.',
          'coin'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWatchingAd(false);
    }
  };

  const isCheckedInToday = user?.lastCheckInDate === new Date().toISOString().split('T')[0];
  const rate = settings?.coinToBDTRate || 0.015;
  const userBdt = ((user?.coins || 0) * rate).toFixed(2);
  const todayBdt = ((user?.todayCoins || 0) * rate).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Rewarded Ad Overlay with Real Sponsor Graphics & Links */}
      {watchingAd && (
        <div className="fixed inset-0 z-50 bg-black">
          <AdInterstitial
            durationSeconds={15}
            rewardCoins={settings?.rewardedAdBonus || 35}
            onAdCompleted={finishRewardedAd}
          />
        </div>
      )}

      {/* Live Verified Cashout Proof Ticker (ব্যবহারকারীর বিশ্বাস ও ভাইরাল ইনগেজমেন্ট বাড়ানোর জন্য) */}
      <LivePayoutTicker />

      {/* Admin Broadcast Announcement Banner (যদি সক্রিয় থাকে) */}
      {settings?.activeNotice?.enabled && settings.activeNotice.title && (
        <div 
          onClick={() => setActiveTab('wallet')}
          className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-slate-900 border border-amber-500/40 shadow-lg cursor-pointer hover:border-amber-400 transition"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0 animate-bounce">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20">
                  অফিসিয়াল নোটিশ
                </span>
                <h4 className="text-xs font-black text-white truncate">
                  {settings.activeNotice.title}
                </h4>
              </div>
              <p className="text-[11px] text-amber-100/90 mt-1 leading-snug line-clamp-2">
                {settings.activeNotice.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Wallet & Earnings Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1624] via-[#0A101A] to-[#0D1A14] border border-emerald-500/30 p-5 shadow-2xl">
        {/* Glow ambient */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user?.displayName}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400/80"
              />
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {language === 'bn' ? 'স্বাগতম' : 'Welcome back,'}
                </span>
                <h2 className="text-xs font-bold text-white truncate max-w-[140px]">
                  {user?.displayName}
                </h2>
              </div>
            </div>

            {/* Streak Counter Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-full">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-black text-amber-300">
                {user?.streakDays || 1} {language === 'bn' ? 'দিন' : 'Days'}
              </span>
            </div>
          </div>

          {/* Balance Numbers */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 my-2">
            <div>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                {language === 'bn' ? 'মোট ব্যালেন্স' : 'Total Coins'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-white font-['Outfit']">
                  {user?.coins.toLocaleString() || 0}
                </span>
                <span className="text-[11px] font-bold text-amber-400">কয়েন</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                ≈ ৳{userBdt} BDT
              </span>
            </div>

            <div className="border-l border-slate-800/80 pl-3">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                {language === 'bn' ? 'আজকের আয়' : "Today's Earned"}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-emerald-400 font-['Outfit']">
                  +{user?.todayCoins || 0}
                </span>
                <span className="text-[11px] font-bold text-emerald-500">কয়েন</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {user?.todayVideosCount || 0} {language === 'bn' ? 'টি ভিডিও দেখা হয়েছে' : 'videos watched'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 mt-3">
            <button
              onClick={() => handleOpenYouTubeApp()}
              className="flex-1 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Sparkles className="w-5 h-5 fill-white text-white animate-pulse" />
              {language === 'bn' ? 'টিকটক ভিডিও দেখুন ও আয় করুন' : 'Watch TikTok Reels & Earn'}
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className="px-4 py-3 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              {language === 'bn' ? 'ক্যাশআউট' : 'Cashout'}
            </button>
          </div>

          {/* Quick Shortcuts to New Games & Tasks Feature */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('games')}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 hover:border-blue-400 text-left transition flex items-center gap-2.5"
            >
              <span className="text-xl">🎲</span>
              <div>
                <span className="text-xs font-black text-blue-300 block">গেমিং হাব</span>
                <span className="text-[10px] text-slate-400">লুডু, ক্যারাম, স্পিন</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-fuchsia-900/40 border border-purple-500/30 hover:border-purple-400 text-left transition flex items-center gap-2.5"
            >
              <span className="text-xl">🧠</span>
              <div>
                <span className="text-xs font-black text-purple-300 block">কুইজ ও টাস্ক</span>
                <span className="text-[10px] text-slate-400">অংক, GK, ক্যাপচা</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Pro-Level Live YouTube Entertainment Carousel & Watch Hub (স্লিক ও প্রিমিয়াম ডিজাইন) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#090E17] via-[#0E1526] to-[#0A111F] border border-slate-800/90 p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-red-500" />
              লাইভ ভিডিও ও আর্নিং স্ট্রিম
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            স্বয়ংক্রিয় কয়েন কাউন্ট
          </span>
        </div>

        {/* Clean, horizontally scrollable category pill chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: '🔥 সব ট্রেন্ডিং', active: true },
            { id: 'cartoon', label: '👶 কার্টুন' },
            { id: 'natok', label: '🎭 বাংলা নাটক' },
            { id: 'music', label: '🎵 মিউজিক ও গান' },
            { id: 'sports', label: '🏏 ক্রিকেট হাইলাইটস' },
            { id: 'news', label: '📰 ব্রেকিং নিউজ' },
            { id: 'comedy', label: '😂 ফানি ভিডিও' }
          ].map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => handleOpenYouTubeApp(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                idx === 0
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Pro Banner: Quick Play Live Feed */}
        <div 
          onClick={() => handleOpenYouTubeApp('all')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/40 border border-slate-800 p-3.5 flex items-center justify-between cursor-pointer group hover:border-red-500/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition">
              <Play className="w-5 h-5 fill-red-500 text-red-500" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white group-hover:text-red-400 transition">
                ভিডিও দেখা শুরু করুন
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                প্রতি ৪ মিনিট দেখার পর ৫০ সেকেন্ড বিজ্ঞাপনে +৫০ কয়েন
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-md shadow-red-600/30 group-hover:bg-red-500 transition">
            প্লে করুন ▶
          </button>
        </div>
      </div>

      {/* Daily Bonus & Rewarded Ad Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily Check-in Card */}
        <div 
          onClick={handleDailyCheckIn}
          className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            isCheckedInToday 
              ? 'bg-slate-900/60 border-slate-800 opacity-80' 
              : 'bg-gradient-to-br from-amber-500/15 to-slate-900 border-amber-500/40 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Gift className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-400/10">
              {isCheckedInToday ? (language === 'bn' ? 'গৃহীত ✓' : 'Done ✓') : (language === 'bn' ? '+২৫ কয়েন' : '+25 Coins')}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {language === 'bn' ? 'দৈনিক চেক-ইন' : 'Daily Streak'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isCheckedInToday 
                ? (language === 'bn' ? 'আগামীকাল আবার চেক করুন' : 'Come back tomorrow') 
                : (language === 'bn' ? 'আজকের বোনাস কয়েন নিন' : 'Claim daily reward')}
            </p>
          </div>
        </div>

        {/* Sponsored Bonus Card */}
        <div 
          onClick={handleWatchRewardedAd}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Tv className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-400/10">
              {language === 'bn' ? `+${settings?.rewardedAdBonus || 30} কয়েন` : `+${settings?.rewardedAdBonus || 30} Coins`}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {language === 'bn' ? 'স্পনসর বোনাস' : 'Watch Ad Bonus'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {language === 'bn' ? '১৫ সে. বিজ্ঞাপন দেখে বোনাস নিন' : 'Watch short sponsor ad'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Video Progress Milestone Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">
              {language === 'bn' ? 'আজকের ভিডিও মাইলস্টোন' : 'Daily Watch Milestone'}
            </h4>
          </div>
          <p className="text-[10px] text-slate-400">
            {language === 'bn' 
              ? `৫টি ভিডিও দেখলে অতিরিক্ত ২০ কয়েন বোনাস পাবেন (${user?.todayVideosCount || 0}/5)`
              : `Watch 5 videos for bonus (+20 coins)`}
          </p>
          {/* Progress bar */}
          <div className="w-40 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, ((user?.todayVideosCount || 0) / 5) * 100)}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setActiveTab('rewards')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700"
        >
          {language === 'bn' ? 'ক্লেম' : 'Claim'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Trending Bangladeshi Videos Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              {language === 'bn' ? 'ট্রেন্ডিং ভিডিওসমূহ 🇧🇩' : 'Trending Videos'}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('watch')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
          >
            {language === 'bn' ? 'সব দেখুন' : 'View all'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {trendingVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => {
                setTargetVideoId(video.id);
                setActiveTab('watch');
              }}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[9/14] w-full bg-slate-950 overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Coin Reward Pill */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center gap-1">
                  🪙 +{video.rewardCoins}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-slate-950" />
                  </div>
                </div>

                {/* Bottom Meta */}
                <div className="absolute bottom-2 left-2 right-2">
                  <h5 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                    {video.title}
                  </h5>
                  <span className="text-[9px] text-slate-300 font-medium block mt-0.5">
                    {video.creatorName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Invite Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wide">
            {language === 'bn' ? 'বন্ধু রেফার করুন' : 'Refer & Earn'}
          </span>
          <h4 className="text-xs font-bold text-white">
            {language === 'bn' ? 'প্রতি সফল রেফারে ৫০ কয়েন বোনাস' : 'Earn 50 Coins per friend'}
          </h4>
          <p className="text-[10px] text-slate-400">
            {language === 'bn' ? `আপনার কোড: ${user?.referralCode || 'BD7788'}` : `Your code: ${user?.referralCode || 'BD7788'}`}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('rewards')}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20"
        >
          <Share2 className="w-3.5 h-3.5" />
          {language === 'bn' ? 'ইনভাইট' : 'Invite'}
        </button>
      </div>

      {/* 📢 খালি জায়গায় ছোট ব্যানার অ্যাড (Mini Banner Ad Spot) */}
      <MiniBannerAd slotId="home_bottom_slot" category="finance" />

      {/* Platform Fair-Play Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'bn' ? 'স্বচ্ছতা ও ফেয়ার-প্লে পলিসি' : 'Fair-Play & Legal Policy'}</span>
        </div>
        <p className="leading-relaxed">
          {language === 'bn'
            ? 'বিজ্ঞাপন ও স্পন্সর ক্যাম্পেইন বাজেট থেকে পুরস্কার পয়েন্ট বিতরণ করা হয়। এটি কোনো স্থায়ী বেতনের চাকরি বা নিশ্চিত আয়ের প্রতিশ্রুতি নয়।'
            : 'Rewards depend on platform ad campaigns, valid watch time, and eligibility rules.'}
        </p>
      </div>
    </div>
  );
};
