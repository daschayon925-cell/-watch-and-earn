import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCw, X, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { AdInterstitial } from '../Feed/AdInterstitial';

interface LuckySpinProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LuckySpinModal: React.FC<LuckySpinProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { showToast, triggerConfetti, settings } = useApp();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningReward, setWinningReward] = useState<number | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const spinsToday = user?.lastSpinDate === todayStr ? (user?.spinsToday || 0) : 0;
  const maxSpins = 5;
  const isLimitReached = spinsToday >= maxSpins;

  // ⏱️ 2.5 Hour Cooldown logic between spins
  const intervalMinutes = settings?.spinIntervalMinutes || 150;
  const intervalMs = intervalMinutes * 60 * 1000;
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    const calculateRemaining = () => {
      if (!user?.lastSpinTimestamp) {
        setCooldownSeconds(0);
        return;
      }
      const lastTime = new Date(user.lastSpinTimestamp).getTime();
      const elapsed = Date.now() - lastTime;
      if (elapsed < intervalMs) {
        setCooldownSeconds(Math.ceil((intervalMs - elapsed) / 1000));
      } else {
        setCooldownSeconds(0);
      }
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [user?.lastSpinTimestamp, intervalMs]);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCooldownActive = cooldownSeconds > 0 && !isLimitReached;

  // 8 segments with attractive coin amounts
  const segments = [
    { coins: 15, color: '#F59E0B', label: '১৫ কয়েন' },
    { coins: 25, color: '#10B981', label: '২৫ কয়েন' },
    { coins: 10, color: '#3B82F6', label: '১০ কয়েন' },
    { coins: 50, color: '#EC4899', label: '৫০ মেগা 🎁' },
    { coins: 20, color: '#8B5CF6', label: '২০ কয়েন' },
    { coins: 30, color: '#06B6D4', label: '৩০ কয়েন' },
    { coins: 12, color: '#F97316', label: '১২ কয়েন' },
    { coins: 100, color: '#EF4444', label: '১০০ জ্যাকপট 👑' }
  ];

  const handleStartSpin = () => {
    if (spinning) return;
    if (isLimitReached) {
      showToast('🔒 আজকের স্পিন সীমা শেষ!', 'প্রতিদিন সর্বোচ্চ ৫টি স্পিন করতে পারবেন। আগামীকাল আবার নতুন স্পিন পাবেন।', 'info');
      return;
    }
    if (isCooldownActive) {
      showToast('⏳ স্পিন প্রস্তুত হয়নি!', `প্রতি ২.৫ ঘণ্টা পর পর ১টি স্পিন করা যায়। আরও ${formatCountdown(cooldownSeconds)} অপেক্ষা করুন।`, 'info');
      return;
    }

    setSpinning(true);
    setWinningReward(null);

    // Pick random segment
    const selectedIdx = Math.floor(Math.random() * segments.length);
    const selected = segments[selectedIdx];

    // Calculate rotation: 5-8 full spins (360 * 6) + slice offset
    const sliceAngle = 360 / segments.length;
    const targetDeg = rotation + (360 * 5) + (360 - (selectedIdx * sliceAngle)) - (sliceAngle / 2);
    setRotation(targetDeg);

    setTimeout(() => {
      setSpinning(false);
      setWinningReward(selected.coins);
      soundService.playCoinReward();
      triggerConfetti();

      // Offer short sponsor ad for claim
      setPendingClaim(selected.coins);
    }, 4000);
  };

  const handleClaimReward = async () => {
    if (!pendingClaim) return;

    try {
      const res = await api.claimSpinWheel(pendingClaim);
      if (res?.success) {
        soundService.playCoinReward();
        triggerConfetti();
        showToast(
          `🎉 +${pendingClaim} কয়েন জিতেছেন!`,
          `আপনার ব্যালেন্সে কয়েন সফলভাবে জমা হয়েছে।`,
          'coin'
        );
        await refreshUser();
      } else {
        showToast(res?.message || 'স্পিন বোনাস ক্লেইম করা যায়নি', '', 'error');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWinningReward(null);
      setPendingClaim(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Rewarded Ad before claiming jackpot */}
      {showAd && (
        <div className="fixed inset-0 z-50 bg-black">
          <AdInterstitial
            durationSeconds={10}
            rewardCoins={pendingClaim || 25}
            onAdCompleted={() => {
              setShowAd(false);
              handleClaimReward();
            }}
            onAdSkipped={() => {
              setShowAd(false);
              showToast('⚠️ বিজ্ঞাপন স্কিপ করা হয়েছে, বোনাস কয়েন দেওয়া হয়নি।', '', 'error');
              setWinningReward(null);
              setPendingClaim(null);
            }}
          />
        </div>
      )}

      <div className="w-full max-w-sm bg-gradient-to-b from-[#111C2E] via-[#0E1624] to-[#0A0F1A] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-center">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button & Rules Toggle */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          <button
            onClick={() => setShowRules(prev => !prev)}
            className="p-1.5 rounded-full bg-slate-800/80 text-amber-400 hover:text-white transition cursor-pointer"
            title="নিয়মাবলী"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black mb-1">
            <Sparkles className="w-3 h-3 fill-amber-300" />
            <span>লাকি স্পিন হুইল</span>
          </div>
          <h3 className="text-base font-black text-white">
            চাকা ঘুরিয়ে নিশ্চিত কয়েন জিতুন
          </h3>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 mt-1">
            <span>আজকের বাকি: <b className="text-amber-400 font-mono">{maxSpins - spinsToday}/{maxSpins}</b></span>
            <span>•</span>
            <span>বিরতি: <b className="text-cyan-400 font-mono">{Math.round(intervalMinutes / 60 * 10) / 10} ঘণ্টা</b></span>
          </div>
        </div>

        {/* Rules Card Popup if toggled */}
        {showRules && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left text-xs space-y-1.5 animate-in slide-in-from-top duration-200">
            <div className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>স্পিনের নিয়মাবলী:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ১. প্রতি <b>২.৫ ঘণ্টা পর পর</b> ১টি করে স্পিন আনলক হবে।<br />
              ২. দিনে সর্বোচ্চ <b>৫টি স্পিন</b> করা যাবে।<br />
              ৩. প্রতিটি স্পিনে <b>১০ থেকে ১০০ পর্যন্ত কয়েন</b> নিশ্চিত!
            </p>
          </div>
        )}

        {/* The Wheel */}
        <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
          {/* Top Indicator Arrow Needle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />
          </div>

          {/* Rotating Wheel Graphic */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden transition-transform duration-[4000ms] ease-out flex items-center justify-center"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(#EF4444 0deg 45deg, #F59E0B 45deg 90deg, #10B981 90deg 135deg, #3B82F6 135deg 180deg, #EC4899 180deg 225deg, #8B5CF6 225deg 270deg, #06B6D4 270deg 315deg, #F97316 315deg 360deg)'
            }}
          >
            {/* Center Hub */}
            <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center shadow-inner z-10">
              <span className="text-xl font-black text-amber-400 font-['Outfit']">🪙</span>
            </div>

            {/* Slices Labels */}
            {segments.map((s, idx) => {
              const angle = idx * 45 + 22.5;
              return (
                <div
                  key={idx}
                  className="absolute top-2 left-1/2 -translate-x-1/2 origin-bottom h-28 flex flex-col items-center justify-start pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-tighter mt-1">
                    {s.coins}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Won State Overlay Modal */}
        {winningReward !== null && (
          <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-500/50 animate-in zoom-in-95">
            <span className="text-2xl block mb-1">🎉</span>
            <h4 className="text-sm font-black text-emerald-300">
              অভিনন্দন! আপনি +{winningReward} কয়েন জিতেছেন!
            </h4>
            <p className="text-[10px] text-slate-300 mt-0.5 mb-2">
              সংগ্রহ করতে নিচে চাপুন
            </p>
            <button
              onClick={() => {
                if (winningReward >= 30 && settings?.adsConfig?.rewardedAdsEnabled) {
                  setShowAd(true);
                } else {
                  handleClaimReward();
                }
              }}
              className="w-full py-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition cursor-pointer"
            >
              🎁 রিওয়ার্ড গ্রহণ করুন (+{winningReward} কয়েন)
            </button>
          </div>
        )}

        {/* Spin CTA Button with Dynamic Cooldown Countdown */}
        {winningReward === null && (
          <div className="space-y-1.5 mt-2">
            <button
              onClick={handleStartSpin}
              disabled={spinning || isLimitReached || isCooldownActive}
              className={`w-full py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                isLimitReached
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : isCooldownActive
                  ? 'bg-slate-800/90 border border-amber-500/30 text-amber-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-500/25 active:scale-98'
              }`}
            >
              {isCooldownActive ? (
                <>
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>পরবর্তী স্পিন: {formatCountdown(cooldownSeconds)}</span>
                </>
              ) : isLimitReached ? (
                <span>🔒 আজকের ৫টি স্পিন শেষ</span>
              ) : spinning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>চাকা ঘুরছে...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>স্পিন করুন ▶</span>
                </>
              )}
            </button>

            {isCooldownActive && (
              <p className="text-[10px] text-slate-400">
                ⏳ নিয়ম অনুযায়ী প্রতি ২.৫ ঘণ্টা পর পর নতুন স্পিন দেওয়া হয়।
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
