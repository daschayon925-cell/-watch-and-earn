import React, { useState } from 'react';
import { Sparkles, RotateCw, Gift, X, Flame, ShieldAlert, CheckCircle2, Coins } from 'lucide-react';
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
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { showToast, triggerConfetti, settings } = useApp();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningReward, setWinningReward] = useState<number | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const spinsToday = user?.lastSpinDate === todayStr ? (user?.spinsToday || 0) : 0;
  const maxSpins = 5;
  const isLimitReached = spinsToday >= maxSpins;

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

    awardCoinsLocally(pendingClaim);
    soundService.playCoinReward();
    triggerConfetti();
    showToast(
      `🎉 +${pendingClaim} কয়েন জিতেছেন!`,
      `আপনার ব্যালেন্সে কয়েন জমা হয়েছে।`,
      'coin'
    );

    try {
      const res = await api.claimSpinWheel(pendingClaim);
      if (res?.success) {
        await refreshUser();
      } else if (res?.limitReached) {
        showToast('আজকের স্পিনের কোটা শেষ!', res.message || 'আগামীকাল আবার আসুন।', 'info');
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
              showToast('বিজ্ঞাপন বাতিল হয়েছে', 'স্পিন রিওয়ার্ড নিতে বিজ্ঞাপনটি সম্পূর্ণ দেখুন।', 'info');
            }}
          />
        </div>
      )}

      <div className="w-full max-w-sm bg-gradient-to-b from-[#111C2E] via-[#0E1624] to-[#0A0F1A] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-center">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black mb-1">
            <Sparkles className="w-3 h-3 fill-amber-300" />
            <span>লাকি স্পিন হুইল</span>
          </div>
          <h3 className="text-base font-black text-white">
            চাকা ঘুরিয়ে নিশ্চিত কয়েন জিতুন
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            আজকের স্পিন বাকি: <span className="text-amber-400 font-black">{maxSpins - spinsToday}/{maxSpins}</span>
          </p>
        </div>

        {/* The Wheel */}
        <div className="relative w-64 h-64 mx-auto my-3 flex items-center justify-center">
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
                // If reward is high, show 8s sponsor ad for huge developer profit
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

        {/* Spin CTA Button */}
        {winningReward === null && (
          <button
            onClick={handleStartSpin}
            disabled={spinning || isLimitReached}
            className={`w-full py-3.5 mt-2 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
              isLimitReached
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-500/25 active:scale-98'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            <span>{isLimitReached ? '🔒 আজকের ৫টি স্পিন শেষ' : spinning ? 'চাকা ঘুরছে...' : 'স্পিন করুন ▶'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
