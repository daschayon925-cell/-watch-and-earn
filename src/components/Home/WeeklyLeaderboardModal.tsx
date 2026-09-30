import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Flame, 
  Sparkles, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  Gift, 
  ChevronRight,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { MiniBannerAd } from '../Common/MiniBannerAd';

export const WeeklyLeaderboardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { language, setActiveTab } = useApp();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [poolBDT, setPoolBDT] = useState(500);
  const [daysLeft, setDaysLeft] = useState(3);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.getWeeklyLeaderboard();
      if (res?.success) {
        setLeaders(res.leaderboard);
        setPoolBDT(res.weeklyPoolBDT || 500);
        setDaysLeft(res.resetDaysLeft || 3);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#0F172A] via-[#0B1120] to-[#070B14] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="relative p-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
              <Trophy className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black uppercase tracking-wide">
                  সাপ্তাহিক লিডারবোর্ড
                </h3>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 text-amber-300">
                  TOP {leaders.length}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-900/90 mt-0.5">
                শীর্ষ ৩ জনের জন্য ৳{poolBDT} টাকার অতিরিক্ত মেগা বোনাস পুল
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-950/20 hover:bg-slate-950/40 flex items-center justify-center text-slate-950 font-black text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>সপ্তাহ শেষ হতে বাকি: {daysLeft} দিন</span>
          </div>

          <div className="text-[11px] text-slate-400">
            রিসেট: প্রতি রবিবার রাত ১২টা
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="p-4 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-slate-800/80">
          <div className="grid grid-cols-3 gap-2 items-end">
            {/* 2nd Place */}
            {leaders[1] && (
              <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-900/80 border border-slate-700 text-center relative order-1">
                <span className="text-lg">🥈</span>
                <img
                  src={leaders[1].avatar}
                  alt={leaders[1].name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-400 my-1"
                />
                <span className="text-[10px] font-bold text-white truncate w-full">
                  {leaders[1].name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-black text-amber-400 font-['Outfit'] mt-0.5">
                  {leaders[1].coins} কয়েন
                </span>
                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded mt-1 border border-emerald-500/30">
                  +৳১৫০ বোনাস
                </span>
              </div>
            )}

            {/* 1st Place Champion */}
            {leaders[0] && (
              <div className="flex flex-col items-center p-2.5 rounded-2xl bg-gradient-to-b from-amber-500/25 to-yellow-600/20 border-2 border-amber-400 text-center relative order-2 scale-105 shadow-xl shadow-amber-500/20">
                <Crown className="w-5 h-5 text-amber-300 fill-amber-300 absolute -top-3" />
                <span className="text-xl">🥇</span>
                <img
                  src={leaders[0].avatar}
                  alt={leaders[0].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 my-1 shadow-md"
                />
                <span className="text-[11px] font-black text-white truncate w-full">
                  {leaders[0].name.split(' ')[0]}
                </span>
                <span className="text-xs font-black text-amber-300 font-['Outfit'] mt-0.5">
                  {leaders[0].coins} কয়েন
                </span>
                <span className="text-[9px] font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-2 py-0.5 rounded-full mt-1 shadow-sm">
                  👑 +৳২৫০ বোনাস
                </span>
              </div>
            )}

            {/* 3rd Place */}
            {leaders[2] && (
              <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-900/80 border border-amber-800/60 text-center relative order-3">
                <span className="text-lg">🥉</span>
                <img
                  src={leaders[2].avatar}
                  alt={leaders[2].name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-700 my-1"
                />
                <span className="text-[10px] font-bold text-white truncate w-full">
                  {leaders[2].name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-black text-amber-400 font-['Outfit'] mt-0.5">
                  {leaders[2].coins} কয়েন
                </span>
                <span className="text-[8px] font-bold text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded mt-1 border border-amber-600/30">
                  +৳১০০ বোনাস
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ad Spot in Leaderboard for High CTR */}
        <div className="px-4 py-2 bg-slate-950/80">
          <MiniBannerAd slotId="leaderboard_banner" category="finance" />
        </div>

        {/* List of Other Top Rankers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-56">
          {leaders.slice(3).map((item) => (
            <div
              key={item.rank}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 text-center text-xs font-black text-slate-400 font-['Outfit']">
                  #{item.rank}
                </span>
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h5 className="text-xs font-bold text-white truncate max-w-[130px]">
                    {item.name}
                  </h5>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {item.phone} • {item.videos} ভিডিও
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-amber-400 font-['Outfit'] block">
                  {item.coins} কয়েন
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* User's own Rank Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.displayName}
              className="w-8 h-8 rounded-full object-cover border border-emerald-400"
            />
            <div>
              <span className="text-[10px] text-slate-400 block">আপনার অবস্থান</span>
              <h5 className="text-xs font-bold text-white truncate max-w-[120px]">
                {user?.displayName}
              </h5>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-emerald-400 font-['Outfit'] block">
              {user?.coins || 0} কয়েন
            </span>
            <span className="text-[9px] text-amber-400 font-bold">
              ভিডিও দেখে র্যাংক আপগ্রেড করুন 🚀
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
