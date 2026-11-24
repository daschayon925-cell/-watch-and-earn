import React, { useState, useEffect } from 'react';
import {
  Play,
  Sparkles,
  Coins,
  TrendingUp,
  ArrowRight,
  Gift,
  Share2,
  Flame,
  ShieldCheck,
  Tv,
  Award,
  Wallet,
  Megaphone,
  Clock,
  Lock,
  ChevronRight,
  UserPlus,
  Zap,
  Globe,
  Briefcase,
  Link2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Video } from '../../types';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { LivePayoutTicker } from './LivePayoutTicker';
import { DailyCheckInStreak } from './DailyCheckInStreak';
import { LuckySpinModal } from './LuckySpinModal';
import { WeeklyLeaderboardModal } from './WeeklyLeaderboardModal';
import { MiniBannerAd } from '../Common/MiniBannerAd';
import { AdsterraBannerUnit } from '../Common/AdsterraBannerUnit';
import { SponsoredClickHub } from '../Common/SponsoredClickHub';
import { AdInterstitial } from '../Feed/AdInterstitial';
import { LegalPolicyModal, PolicyTab } from '../Legal/LegalPolicyModal';
import { LandingPage } from './LandingPage';
import { WorkEngagementHub } from './WorkEngagementHub';
import { ProVipBoosterHub } from './ProVipBoosterHub';
import { SurpriseDailyBonus } from './SurpriseDailyBonus';
import { openAdWithStrictTimer } from '../Common/AdVisitTimerModal';
import { PostJobModal } from '../Tasks/PostJobModal';

export const HomeScreen: React.FC = () => {
  const { user, refreshUser, awardCoinsLocally, logout } = useAuth();
  const {
    setActiveTab,
    settings,
    setTargetVideoId,
    setSelectedCategory,
    language,
    showToast,
    triggerConfetti,
    setSelectedTaskSubTab
  } = useApp();

  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showLandingPreview, setShowLandingPreview] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [legalTab, setLegalTab] = useState<PolicyTab>('privacy');

  const isGuest =
    !user?.uid ||
    user.uid.startsWith('usr_guest_') ||
    Boolean(user?.email?.includes('@watchearn'));

  const handleOpenYouTubeApp = (topic?: string) => {
    if (topic) setSelectedCategory(topic);
    setActiveTab('watch');
    showToast(
      language === 'bn'
        ? '🔴 ভিডিও চালু হয়েছে! ভিডিও দেখার সাথে সাথে কয়েন জমা হবে।'
        : '🔴 Video playing! Watch to earn coins automatically.',
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
          language === 'bn'
            ? `+${res.earnedCoins} দৈনিক বোনাস যুক্ত হয়েছে! 🌟`
            : `+${res.earnedCoins} Daily Check-In Bonus!`,
          language === 'bn'
            ? `দিন ${res.streakDays} এর স্ট্রিক চলমান রয়েছে।`
            : `Day ${res.streakDays} streak maintained.`,
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

  const sponsorIntervalMinutes = settings?.sponsorAdIntervalMinutes || 150;
  const sponsorIntervalMs = sponsorIntervalMinutes * 60 * 1000;
  const [sponsorCooldownSeconds, setSponsorCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    const checkCooldown = () => {
      if (!user?.lastSponsoredAdTimestamp) {
        setSponsorCooldownSeconds(0);
        return;
      }
      const lastTime = new Date(user.lastSponsoredAdTimestamp).getTime();
      const elapsed = Date.now() - lastTime;
      if (elapsed < sponsorIntervalMs) {
        setSponsorCooldownSeconds(Math.ceil((sponsorIntervalMs - elapsed) / 1000));
      } else {
        setSponsorCooldownSeconds(0);
      }
    };
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [user?.lastSponsoredAdTimestamp, sponsorIntervalMs]);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleWatchRewardedAd = () => {
    if (watchingAd) return;
    if (sponsorCooldownSeconds > 0) {
      showToast(
        language === 'bn'
          ? `⏳ পরবর্তী স্পনসর বিজ্ঞাপন দেখতে পারবেন ${formatCountdown(sponsorCooldownSeconds)} পর।`
          : `Next sponsored ad available in ${formatCountdown(sponsorCooldownSeconds)}.`,
        language === 'bn'
          ? 'নিয়ম অনুযায়ী প্রতি ২.৫ ঘণ্টা পর পর ১টি স্পনসর বিজ্ঞাপন পাওয়া যায়।'
          : '1 ad per 2.5 hours.',
        'info'
      );
      return;
    }
    setWatchingAd(true);
  };

  const finishRewardedAd = async (adSessionId?: string) => {
    try {
      const res = await api.claimRewardedAd('home_sponsor_ad', adSessionId);
      if (res && res.success && res.earnedCoins) {
        awardCoinsLocally(res.earnedCoins);
        soundService.playCoinReward();
        triggerConfetti();
        showToast(
          language === 'bn'
            ? `+${res.earnedCoins} স্পনসরড কয়েন বোনাস! 🎁`
            : `+${res.earnedCoins} Ad Reward Claimed!`,
          language === 'bn'
            ? 'সফলভাবে স্পনসর বিজ্ঞাপন দেখার জন্য ধন্যবাদ।'
            : 'Thank you for watching the sponsored ad.',
          'coin'
        );
        await refreshUser();
      } else {
        const bonusCoins = settings?.rewardedAdBonus || 35;
        const fallbackRes = await api.claimInstantAdBonus('হোম স্পনসর বিজ্ঞাপন', bonusCoins);
        if (fallbackRes && fallbackRes.success && fallbackRes.earnedCoins) {
          awardCoinsLocally(fallbackRes.earnedCoins);
          soundService.playCoinReward();
          triggerConfetti();
          showToast(
            language === 'bn'
              ? `+${fallbackRes.earnedCoins} স্পনসর বোনাস অর্জিত!`
              : `+${fallbackRes.earnedCoins} coins earned!`,
            '',
            'coin'
          );
          await refreshUser();
        } else {
          showToast(
            res?.message || (language === 'bn' ? 'আজকের বিজ্ঞাপন দেখার সীমা শেষ হয়েছে।' : 'Daily limit reached.'),
            '',
            'error'
          );
        }
      }
    } catch (err) {
      console.error(err);
      try {
        const bonusCoins = settings?.rewardedAdBonus || 35;
        const fallbackRes = await api.claimInstantAdBonus('হোম স্পনসর ব্যাকআপ', bonusCoins);
        if (fallbackRes && fallbackRes.success) {
          awardCoinsLocally(bonusCoins);
          await refreshUser();
        }
      } catch {}
    } finally {
      setWatchingAd(false);
    }
  };

  const handleSkipRewardedAd = () => {
    setWatchingAd(false);
    showToast(
      language === 'bn' ? '⚠️ বিজ্ঞাপন পুরো না দেখায় কোনো কয়েন যোগ হয়নি।' : 'Ad skipped. No coins earned.',
      '',
      'error'
    );
  };

  const isCheckedInToday = user?.lastCheckInDate === new Date().toISOString().split('T')[0];
  const rate = settings?.coinToBDTRate || 0.015;
  const userBdt = ((user?.coins || 0) * rate).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 sm:pt-5 pb-24 space-y-5">
      {/* Rewarded Ad Overlay */}
      {watchingAd && (
        <div className="fixed inset-0 z-50 bg-black">
          <AdInterstitial
            durationSeconds={15}
            rewardCoins={settings?.rewardedAdBonus || 35}
            onAdCompleted={finishRewardedAd}
            onAdSkipped={handleSkipRewardedAd}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* ১. লাইভ পেমেন্ট টিকার ও অফিসিয়াল/ব্যক্তিগত নোটিশ বোর্ড     */}
      {/* ========================================================= */}
      <section className="space-y-2.5">
        <LivePayoutTicker />

        {/* ব্যক্তিগত নোটিশ (শুধুমাত্র নির্দিষ্ট ইউজারের জন্য) */}
        {user?.privateNotice?.active && !user?.privateNotice?.dismissed && (
          <div className="p-4 rounded-2xl bg-[#0D1729] border border-cyan-500/45 space-y-2 shadow-lg">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    🔒 ব্যক্তিগত নোটিশ
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {user?.privateNotice?.createdAt
                      ? new Date(user.privateNotice.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : ''}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{user?.privateNotice?.title}</h4>
                <p className="text-xs text-slate-200 leading-relaxed">{user?.privateNotice?.message}</p>
                <div className="flex items-center gap-2 pt-1.5">
                  {user?.privateNotice?.linkTab && (
                    <button
                      onClick={() => setActiveTab(user.privateNotice?.linkTab as any)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition whitespace-nowrap"
                    >
                      {user?.privateNotice?.linkTab === 'wallet'
                        ? 'ওয়ালেটে যান →'
                        : user?.privateNotice?.linkTab === 'watch'
                        ? 'ভিডিও দেখুন →'
                        : 'পেজে যান →'}
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (user?.privateNotice) {
                        user.privateNotice.dismissed = true;
                        user.privateNotice.active = false;
                      }
                      await api.dismissPrivateNotice();
                      refreshUser();
                      showToast('নোটিশটি বন্ধ করা হয়েছে ✓', '', 'info');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition whitespace-nowrap"
                  >
                    ✓ বুঝেছি
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* অফিসিয়াল নোটিশ বোর্ড */}
        {settings?.activeNotice?.enabled && settings.activeNotice.title && (
          <div
            onClick={() => setActiveTab('wallet')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-amber-900/35 to-[#0B1220] border border-amber-500/40 cursor-pointer hover:border-amber-400/70 transition flex items-start gap-2.5 shadow-md"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 shrink-0">
                  অফিসিয়াল নোটিশ
                </span>
                <h4 className="text-xs font-bold text-white truncate">
                  {settings.activeNotice.title}
                </h4>
              </div>
              <p className="text-[11px] text-amber-100/90 mt-1 leading-relaxed">
                {settings.activeNotice.message}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* ২. ব্যালেন্স কার্ড, কুইক অ্যাক্সেস ও কাজের গাইড             */}
      {/* ========================================================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0D1624] via-[#0B121E] to-[#0A1813] border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Guest Signup Nudge */}
        {isGuest && (
          <button
            onClick={() => logout()}
            className="w-full px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 flex items-center justify-between gap-2 transition text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-200 truncate">
                গেস্ট মোড · ফ্রি অ্যাকাউন্ট খুললে <strong className="text-emerald-400">+১০০ কয়েন</strong>
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 whitespace-nowrap shrink-0">
              সাইন আপ →
            </span>
          </button>
        )}

        {/* User Row + Streak */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={
                user?.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
              }
              alt={user?.displayName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-emerald-500/60 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block">
                {language === 'bn' ? 'স্বাগতম' : 'Welcome back'}
              </span>
              <h2 className="text-sm font-bold text-white truncate">
                {user?.displayName || 'মেম্বার'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full shrink-0 whitespace-nowrap">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-300 tabular-nums">
              {user?.streakDays || 1} {language === 'bn' ? 'দিন' : 'Days'}
            </span>
          </div>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {language === 'bn' ? 'মোট ব্যালেন্স' : 'Total Balance'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-white font-['Outfit'] tabular-nums">
                {user?.coins?.toLocaleString() || 0}
              </span>
              <span className="text-[11px] font-semibold text-amber-400">কয়েন</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold tabular-nums">
              ≈ ৳{userBdt} BDT
            </span>
          </div>

          <div className="border-l border-slate-800/80 pl-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              {language === 'bn' ? 'আজকের আয়' : "Today's Earned"}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-400 font-['Outfit'] tabular-nums">
                +{user?.todayCoins || 0}
              </span>
              <span className="text-[11px] font-semibold text-emerald-500">কয়েন</span>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {user?.todayVideosCount || 0} {language === 'bn' ? 'টি ভিডিও দেখা হয়েছে' : 'videos watched'}
            </span>
          </div>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setActiveTab('watch');
              soundService.playLikePop();
              showToast('🎬 ভিডিও প্লেয়ার চালু হচ্ছে...', 'ভিডিও দেখে কয়েন সংগ্রহ করুন!', 'coin');
            }}
            className="flex-1 min-h-[44px] px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition active:scale-[0.98] whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-slate-950 shrink-0" />
            <span>{language === 'bn' ? 'ভিডিও দেখুন ও আয় (+১৫ 🪙)' : 'Watch & Earn (+15 🪙)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className="min-h-[44px] px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] shrink-0 whitespace-nowrap"
          >
            <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{language === 'bn' ? 'ক্যাশআউট' : 'Cashout'}</span>
          </button>
        </div>

        {/* 4 Clean Quick Shortcuts */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => {
              setSelectedTaskSubTab('bangla_daily_jobs');
              setActiveTab('tasks');
              soundService.playLikePop();
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 flex flex-col items-center justify-center gap-1 transition"
          >
            <span className="text-base">🇧🇩</span>
            <span className="text-[10px] font-bold text-slate-200 whitespace-nowrap">বাংলা কাজ</span>
          </button>

          <button
            onClick={() => {
              setSelectedTaskSubTab('shortlinks');
              setActiveTab('tasks');
              soundService.playLikePop();
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 transition"
          >
            <span className="text-base">🔗</span>
            <span className="text-[10px] font-bold text-slate-200 whitespace-nowrap">শর্টলিংক</span>
          </button>

          <button
            onClick={() => {
              setShowSpinModal(true);
              soundService.playLikePop();
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-yellow-500/40 flex flex-col items-center justify-center gap-1 transition"
          >
            <span className="text-base">🎡</span>
            <span className="text-[10px] font-bold text-slate-200 whitespace-nowrap">স্পিন হুইল</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('games');
              soundService.playLikePop();
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 flex flex-col items-center justify-center gap-1 transition"
          >
            <span className="text-base">🎲</span>
            <span className="text-[10px] font-bold text-slate-200 whitespace-nowrap">গেম হাব</span>
          </button>
        </div>

        {/* Direct Guide & Website Overview Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => {
              const el = document.getElementById('work-engagement-hub');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition whitespace-nowrap"
          >
            <span>🔰</span>
            <span>কাজের নিয়ম গাইড</span>
          </button>

          <button
            onClick={() => setShowLandingPreview(true)}
            className="py-2 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>ওয়েবসাইট বিবরণ</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ৩. দৈনিক বোনাস, স্ট্রিক ও ভিডিও মাইলস্টোন               */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'bn' ? 'দৈনিক বোনাস ও স্ট্রিক' : 'Daily Bonuses & Streak'}
          </h3>
          <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">
            মাইলস্টোন {Math.min(5, user?.todayVideosCount || 0)}/5
          </span>
        </div>

        <DailyCheckInStreak />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDailyCheckIn}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
              isCheckedInToday
                ? 'bg-slate-900/60 border-slate-800 opacity-80'
                : 'bg-[#0E1626] border-amber-500/35 hover:border-amber-400/60'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Gift className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-400/10 tabular-nums whitespace-nowrap">
                {isCheckedInToday
                  ? language === 'bn'
                    ? 'গৃহীত ✓'
                    : 'Done ✓'
                  : language === 'bn'
                  ? '+২৫ কয়েন'
                  : '+25 Coins'}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {language === 'bn' ? 'দৈনিক চেক-ইন' : 'Daily Check-in'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isCheckedInToday
                  ? language === 'bn'
                    ? 'আগামীকাল আবার চেক করুন'
                    : 'Come back tomorrow'
                  : language === 'bn'
                  ? 'আজকের বোনাস নিন'
                  : 'Claim daily reward'}
              </p>
            </div>
          </button>

          <button
            onClick={handleWatchRewardedAd}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
              sponsorCooldownSeconds > 0
                ? 'bg-slate-900/60 border-slate-800 opacity-80'
                : 'bg-[#0E1626] border-cyan-500/35 hover:border-cyan-400/60'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`p-2 rounded-xl ${
                  sponsorCooldownSeconds > 0
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-cyan-500/15 text-cyan-400'
                }`}
              >
                {sponsorCooldownSeconds > 0 ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Tv className="w-4 h-4" />
                )}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono tabular-nums whitespace-nowrap ${
                  sponsorCooldownSeconds > 0
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-cyan-400/10 text-cyan-300'
                }`}
              >
                {sponsorCooldownSeconds > 0
                  ? formatCountdown(sponsorCooldownSeconds)
                  : language === 'bn'
                  ? `+${settings?.rewardedAdBonus || 30} কয়েন`
                  : `+${settings?.rewardedAdBonus || 30} Coins`}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {language === 'bn' ? 'স্পনসর বোনাস' : 'Watch Ad Bonus'}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {sponsorCooldownSeconds > 0
                  ? language === 'bn'
                    ? 'কুলডাউন চলছে'
                    : 'Cooldown active'
                  : language === 'bn'
                  ? '১৫ সে. বিজ্ঞাপন দেখুন'
                  : 'Watch short ad'}
              </p>
            </div>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B1220] border border-slate-800 flex items-center justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="text-xs font-bold text-white truncate">
                {language === 'bn' ? 'আজকের ভিডিও মাইলস্টোন' : 'Daily Watch Milestone'}
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 tabular-nums">
              {language === 'bn'
                ? `৫টি ভিডিও দেখলে +২০ কয়েন বোনাস (${user?.todayVideosCount || 0}/5)`
                : `Watch 5 videos for +20 bonus coins (${user?.todayVideosCount || 0}/5)`}
            </p>
            <div className="w-full max-w-[180px] bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, ((user?.todayVideosCount || 0) / 5) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setActiveTab('rewards')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700 shrink-0 whitespace-nowrap"
          >
            {language === 'bn' ? 'ক্লেম' : 'Claim'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <SurpriseDailyBonus />
      </section>

      {/* ========================================================= */}
      {/* ৪. সব কাজের ও আয়ের অপশন (পরিষ্কার ও গোছানোভাবে দৃশ্যমান) */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'bn' ? 'কাজের ও আয়ের মাধ্যমসমূহ' : 'Earning Opportunities'}
          </h3>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 whitespace-nowrap"
          >
            <span>সব কাজ</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* হাই-পে অফারওয়াল হাব কার্ড */}
        <div className="rounded-3xl bg-gradient-to-br from-[#17110B] via-[#100D09] to-[#0B1220] border border-amber-500/40 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              🔥 সর্বোচ্চ আয় · ১২০–১,০০০+ কয়েন
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">অটো ক্রেডিট</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">অফারওয়াল হাব (বাংলাদেশ ও গ্লোবাল)</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              সহজ অ্যাপ, গেম বা শর্ট সার্ভে পূরণ করে প্রতি টাস্কে ১২০ থেকে ১,০০০ কয়েন আয় করুন।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center gap-2">
              <span className="text-base">🇧🇩</span>
              <div>
                <span className="text-[10px] text-slate-400 block">বাংলাদেশ টাস্ক</span>
                <span className="text-xs font-bold text-amber-400 tabular-nums">১২০–২০০ 🪙</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 flex items-center gap-2">
              <span className="text-base">🇺🇸</span>
              <div>
                <span className="text-[10px] text-slate-400 block">গ্লোবাল সার্ভে</span>
                <span className="text-xs font-bold text-cyan-400 tabular-nums">৪৫০–১,০০০ 🪙</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedTaskSubTab('offerwall');
              setActiveTab('tasks');
              soundService.playSuccessFanfare();
              triggerConfetti();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>অফারওয়াল হাব ওপেন করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-300">স্পনসর বিজ্ঞাপন ভিজিট বোনাস</span>
            <button
              type="button"
              onClick={() => {
                const directLink =
                  settings?.adsConfig?.adsterraDirectLink?.trim() ||
                  'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
                openAdWithStrictTimer(directLink, 'স্পনসরড হাই-সিপিএম অ্যাড ভিজিট', 10, 15);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-bold text-[11px] whitespace-nowrap transition"
            >
              বিজ্ঞাপন দেখুন (+১০ 🪙)
            </button>
          </div>
        </div>

        {/* পরিপাটি ৪-সারির কাজের তালিকা কার্ড (আগের ৪টি আলাদা বক্সকে ১টি ক্লিন তালিকায় গোছানো হয়েছে) */}
        <div className="rounded-3xl bg-[#0B1220] border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
          <button
            onClick={() => {
              setSelectedTaskSubTab('bangla_daily_jobs');
              setActiveTab('tasks');
              soundService.playSuccessFanfare();
            }}
            className="w-full p-3.5 hover:bg-slate-900/70 transition flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-base shrink-0">
                🇧🇩
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">বাংলা কাজ ও আর্টিকেল পড়া</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 shrink-0">
                    ৮০-১০০৳/দিন
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  বাংলা টাইপিং, বানান সংশোধন ও সহজ টাস্ক
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>

          <button
            onClick={() => {
              setSelectedTaskSubTab('shortlinks');
              setActiveTab('tasks');
              soundService.playSuccessFanfare();
            }}
            className="w-full p-3.5 hover:bg-slate-900/70 transition flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">১৫ সেকেন্ড শর্টলিংক টাস্ক</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 shrink-0 tabular-nums">
                    +৫০–৬০ 🪙
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  ShrinkMe ও DropLink ভিজিট করে ইনস্ট্যান্ট কয়েন
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          <button
            onClick={() => {
              setSelectedTaskSubTab('bd_microtasks');
              setActiveTab('tasks');
            }}
            className="w-full p-3.5 hover:bg-slate-900/70 transition flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">২-৩ মিনিটের মাইক্রোজব ও কুইজ</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 shrink-0 tabular-nums">
                    +৪০–৮০ 🪙
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  WorkupJob, শর্ট সার্ভে ও কুইজ সম্পন্ন করুন
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          <button
            onClick={() => {
              setSelectedTaskSubTab('affiliate_deals');
              setActiveTab('tasks');
            }}
            className="w-full p-3.5 hover:bg-slate-900/70 transition flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-base shrink-0">
                🛍️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">দারাজ হট ডিলস ও ক্যাশব্যাক</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 shrink-0 tabular-nums">
                    +৮০–২৫০ 🪙
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  গ্যাজেট ও প্রয়োজনীয় পণ্য কিনে কয়েন ক্যাশব্যাক নিন
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* বিজ্ঞাপনদাতা ও ক্রিয়েটর প্রমোশন কার্ড (YouTube/TikTok কাজ পোস্ট) */}
        <div className="rounded-3xl bg-[#110C1D] border border-fuchsia-500/35 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
              📢 বিজ্ঞাপনদাতা ও ক্রিয়েটর হাব
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">প্রতি কাজ ৳১–৳১.৫</span>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              YouTube ভিউ, সাবস্ক্রাইব বা TikTok প্রমোশন অর্ডার করুন
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              রিয়েল বাংলাদেশি ইউজার দিয়ে আপনার চ্যানেল বা পেজ প্রমোট করুন এবং বিকাশ/নগদে পেমেন্ট করুন।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPostJobModal(true);
                soundService.playSuccessFanfare();
              }}
              className="py-2.5 px-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>কাজ পোস্ট করুন</span>
            </button>

            <a
              href="https://wa.me/8801339223713?text=Hello,%20I%20want%20to%20order%20YouTube%20Subscribers/Views%20or%20TikTok%20promotion%20on%20Watch%20%26%20Earn%20BD"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition whitespace-nowrap"
            >
              <span>💬 হোয়াটসঅ্যাপ অর্ডার</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ৫. কাজের নিয়ম, টেলিগ্রাম চ্যানেল, দৈনিক মিশন ও ট্রাস্ট হাব */}
      {/* ========================================================= */}
      <section id="work-engagement-hub" className="space-y-3">
        <div className="px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'bn' ? 'কাজের নিয়ম, টেলিগ্রাম ও আজকের মিশন' : 'Work Guide, Community & Missions'}
          </h3>
        </div>
        <WorkEngagementHub
          onOpenOfferwall={() => {
            setSelectedTaskSubTab('offerwall');
            setActiveTab('tasks');
            soundService.playSuccessFanfare();
            triggerConfetti();
          }}
          onOpenWatch={() => handleOpenYouTubeApp()}
          onOpenSpin={() => setShowSpinModal(true)}
        />
      </section>

      {/* ========================================================= */}
      {/* ৬. ট্রেন্ডিং ভিডিও, VIP ও স্পনসর বোনাস হাব                */}
      {/* ========================================================= */}
      <section className="space-y-4">
        {/* Trending Videos */}
        <div className="rounded-3xl bg-[#0B1220] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold text-white">
                {language === 'bn' ? 'ট্রেন্ডিং ভিডিও ও আর্নিং স্ট্রিম' : 'Trending Video Stream'}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('watch')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 whitespace-nowrap"
            >
              {language === 'bn' ? 'সব দেখুন' : 'View all'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: '🔥 সব ট্রেন্ডিং' },
              { id: 'cartoon', label: '👶 কার্টুন' },
              { id: 'natok', label: '🎭 বাংলা নাটক' },
              { id: 'music', label: '🎵 মিউজিক' },
              { id: 'sports', label: '🏏 ক্রিকেট' },
              { id: 'news', label: '📰 নিউজ' },
              { id: 'comedy', label: '😂 ফানি' }
            ].map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => handleOpenYouTubeApp(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  idx === 0
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {trendingVideos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {trendingVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => {
                    setTargetVideoId(video.id);
                    setActiveTab('watch');
                  }}
                  className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer"
                >
                  <div className="relative aspect-[9/14] w-full bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 border border-amber-500/35 text-[10px] font-bold text-amber-300 tabular-nums">
                      +{video.rewardCoins} 🪙
                    </div>

                    <div className="absolute bottom-2 left-2 right-2">
                      <h5 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                        {video.title}
                      </h5>
                      <span className="text-[10px] text-slate-300 block mt-0.5 truncate">
                        {video.creatorName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pro VIP & Sponsored Click Hub */}
        <ProVipBoosterHub />
        <SponsoredClickHub />

        {/* Referral Invite Card */}
        <div className="p-4 rounded-2xl bg-[#0B1220] border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
              {language === 'bn' ? 'রেফারেল প্রোগ্রাম' : 'Refer & Earn'}
            </span>
            <h4 className="text-xs font-bold text-white truncate">
              {language === 'bn' ? 'প্রতি সফল রেফারে ৫০ কয়েন বোনাস' : 'Earn 50 Coins per friend'}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {language === 'bn'
                ? `আপনার কোড: ${user?.referralCode || 'BD7788'}`
                : `Code: ${user?.referralCode || 'BD7788'}`}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('rewards')}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ইনভাইট' : 'Invite'}</span>
          </button>
        </div>

        {/* Monetization Banners */}
        <div className="space-y-3">
          <AdsterraBannerUnit slotId="home_adsterra_slot" />
          <MiniBannerAd slotId="home_top_hero_slot" category="finance" />
        </div>

        {/* Fair-Play & Legal Footer */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'স্বচ্ছতা ও ফেয়ার-প্লে পলিসি' : 'Fair-Play & Legal Policy'}</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono">Verified Quality</span>
          </div>
          <p className="leading-relaxed">
            {language === 'bn'
              ? 'বিজ্ঞাপন ও স্পন্সর ক্যাম্পেইন বাজেট থেকে পুরস্কার পয়েন্ট বিতরণ করা হয়। এটি কোনো স্থায়ী বেতনের চাকরি বা নিশ্চিত আয়ের প্রতিশ্রুতি নয়।'
              : 'Rewards depend on platform ad campaigns, valid watch time, and partner compliance rules.'}
          </p>

          <div className="pt-1 border-t border-slate-900 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-400">
            <button
              onClick={() => {
                setLegalTab('privacy');
                setShowLegalModal(true);
              }}
              className="hover:text-emerald-400 transition underline"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setLegalTab('terms');
                setShowLegalModal(true);
              }}
              className="hover:text-emerald-400 transition underline"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setLegalTab('fraud');
                setShowLegalModal(true);
              }}
              className="hover:text-emerald-400 transition underline"
            >
              Anti-Fraud Rules
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setLegalTab('support');
                setShowLegalModal(true);
              }}
              className="hover:text-emerald-400 transition underline"
            >
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <LuckySpinModal isOpen={showSpinModal} onClose={() => setShowSpinModal(false)} />

      <WeeklyLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
      />

      <LegalPolicyModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalTab}
      />

      {showPostJobModal && (
        <PostJobModal
          onClose={() => setShowPostJobModal(false)}
          onJobCreated={() => {
            setShowPostJobModal(false);
            refreshUser();
            showToast(
              '✅ আপনার কাজের আবেদন সফলভাবে গ্রহণ করা হয়েছে! এডমিন যাচাই করে শীঘ্রই লাইভ করবে।',
              '',
              'success'
            );
          }}
        />
      )}

      {showLandingPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05070B]">
          <div className="sticky top-0 z-50 bg-[#070A11]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                WATCH & EARN BD — ওভারভিউ
              </span>
            </div>
            <button
              onClick={() => setShowLandingPreview(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold transition shrink-0 whitespace-nowrap border border-slate-700"
            >
              ✕ বন্ধ করুন
            </button>
          </div>
          <LandingPage onOpenAuth={() => setShowLandingPreview(false)} />
        </div>
      )}
    </div>
  );
};
