import React, { useState } from 'react';
import { Sparkles, Gift, Check, Flame, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';

export const DailyCheckInStreak: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, showToast, triggerConfetti } = useApp();
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedInToday = user?.lastCheckInDate === todayStr;
  const currentStreak = user?.streakDays || 1;

  // 7-day progressive streak rewards
  const streakRewards = [
    { day: 1, coins: 10, label: '১ম দিন' },
    { day: 2, coins: 15, label: '২য় দিন' },
    { day: 3, coins: 20, label: '৩য় দিন' },
    { day: 4, coins: 25, label: '৪র্থ দিন' },
    { day: 5, coins: 35, label: '৫ম দিন' },
    { day: 6, coins: 45, label: '৬ষ্ঠ দিন' },
    { day: 7, coins: 75, label: '৭ম মেগা' }
  ];

  const handleClaimCheckIn = async () => {
    if (isCheckedInToday) {
      showToast('আজকের বোনাস নেওয়া হয়েছে!', 'আগামীকাল নতুন দিনের রিওয়ার্ড আনলক হবে।', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await api.claimDailyBonus();
      if (res?.success) {
        soundService.playCoinReward();
        triggerConfetti();
        await refreshUser();
        showToast(
          `🎉 +${res.earnedCoins} কয়েন বোনাস পেয়েছেন!`,
          `আপনার স্ট্রিক এখন ${res.streakDays} দিন! প্রতিদিন লগইন করে বোনাস বাড়ান।`,
          'coin'
        );
      } else {
        showToast(res?.message || 'আজকের বোনাস ইতিমধ্যেই নেওয়া হয়েছে।', '', 'info');
      }
    } catch (err) {
      showToast('বোনাস সংগ্রহ করতে সমস্যা হয়েছে', '', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1320] via-[#0D1829] to-[#0A121E] border border-amber-500/30 p-4 shadow-xl">
      {/* Ambient glowing background */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Gift className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>৭ দিনের ডেইলি লগইন বোনাস</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                ফ্রি কয়েন
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">প্রতিদিন লগইন করলেই বাড়ছে রিওয়ার্ড</p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-[11px] font-black text-amber-300 font-['Outfit']">
            {currentStreak} Days Streak
          </span>
        </div>
      </div>

      {/* 7 Day Streak Cards Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {streakRewards.map((item) => {
          const isPast = isCheckedInToday ? item.day <= currentStreak : item.day < currentStreak;
          const isToday = isCheckedInToday ? item.day === currentStreak : item.day === currentStreak;
          const isMega = item.day === 7;

          return (
            <div
              key={item.day}
              className={`relative rounded-xl p-1.5 text-center flex flex-col items-center justify-between transition-all ${
                isToday && !isCheckedInToday
                  ? 'bg-gradient-to-b from-amber-500/30 to-yellow-600/30 border-2 border-amber-400 shadow-md shadow-amber-500/20 scale-105 z-10'
                  : isPast
                  ? 'bg-emerald-950/40 border border-emerald-500/40 opacity-85'
                  : 'bg-slate-900/60 border border-slate-800/80 opacity-60'
              } ${isMega ? 'border-amber-400/60' : ''}`}
            >
              <span className="text-[8px] font-bold text-slate-400 block truncate">
                {item.label}
              </span>

              <div className="my-1 flex items-center justify-center">
                {isPast ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[12px]">{isMega ? '🎁' : '🪙'}</span>
                )}
              </div>

              <span className={`text-[10px] font-black font-['Outfit'] ${
                isPast ? 'text-emerald-400' : isToday ? 'text-amber-300' : 'text-slate-300'
              }`}>
                +{item.coins}
              </span>
            </div>
          );
        })}
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaimCheckIn}
        disabled={isCheckedInToday || loading}
        className={`w-full py-2.5 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
          isCheckedInToday
            ? 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 active:scale-98 shadow-amber-500/25'
        }`}
      >
        {isCheckedInToday ? (
          <>
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>আজকের বোনাস নেওয়া শেষ (কাল আবার আসুন)</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950 animate-bounce" />
            <span>আজকের দিন {currentStreak} এর রিওয়ার্ড সংগ্রহ করুন</span>
          </>
        )}
      </button>
    </div>
  );
};
