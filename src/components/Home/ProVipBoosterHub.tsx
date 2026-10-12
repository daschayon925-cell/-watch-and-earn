import React, { useState } from 'react';
import { Crown, Zap, Sparkles, ShieldCheck, Award, Flame, Gift, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';
import { openAdWithStrictTimer } from '../Common/AdVisitTimerModal';

export const ProVipBoosterHub: React.FC = () => {
  const { showToast, triggerConfetti, settings } = useApp();
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const [activeTab, setActiveTab] = useState<'vip' | 'booster' | 'scratch'>('vip');
  const [scratchResult, setScratchResult] = useState<number | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [turboActive, setTurboActive] = useState(false);

  const handleBuyVip = (tier: string, cost: number) => {
    soundService.playCoinReward();
    triggerConfetti();
    showToast(
      `👑 অভিনন্দন! আপনি ${tier} VIP মেম্বার হয়েছেন!`,
      `এখন থেকে আপনার ওয়ালেটে দ্বিগুণ আয় (2X Earnings) এবং ইনস্ট্যান্ট উইথড্র সুবিধা সক্রিয় হয়েছে।`,
      'coin'
    );
  };

  const handleActivateTurbo = () => {
    soundService.playTap();
    openAdWithStrictTimer(
      settings?.adsConfig?.adsterraDirectLink || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4',
      '2X Turbo Speed Booster',
      25,
      20
    );
    setTurboActive(true);
    showToast(
      '🚀 ২X টার্বো স্পিড বুস্টার চালু হয়েছে!',
      'আগামী ১৫ মিনিট প্রতিটি ভিডিও ও টাস্কে দ্বিগুণ কয়েন পাবেন।',
      'success'
    );
  };

  const handleScratchCard = () => {
    if (isScratched) return;
    soundService.playCoinReward();
    const won = Math.floor(Math.random() * 150) + 50; // 50 to 200 coins
    setScratchResult(won);
    setIsScratched(true);
    triggerConfetti();
    if (awardCoinsLocally) awardCoinsLocally(won);
    showToast(`🎉 স্ক্র্যাচ কার্ডে জিতেছেন +${won} কয়েন!`, 'আপনার ওয়ালেটে বোনাস যোগ হয়েছে।', 'coin');
  };

  return (
    <div className="w-full my-4 p-4 rounded-3xl bg-gradient-to-b from-slate-900 via-[#0c1326] to-slate-950 border-2 border-amber-500/50 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg text-slate-950">
            <Crown className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <span>PRO VIP & EARNING BOOSTER</span>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">PRO v3.0</span>
            </h3>
            <p className="text-[10px] text-slate-400">ইনকাম দ্বিগুণ করুন ও প্রিমিয়াম সুবিধা উপভোগ করুন</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('vip')}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
            activeTab === 'vip' 
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>VIP পাস</span>
        </button>
        <button
          onClick={() => setActiveTab('booster')}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
            activeTab === 'booster' 
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>২X বুস্টার</span>
        </button>
        <button
          onClick={() => setActiveTab('scratch')}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
            activeTab === 'scratch' 
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>লাকি স্ক্র্যাচ</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'vip' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>GOLD VIP PASS (গোল্ড ভিআইপি)</span>
              </span>
              <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                খুব জনপ্রিয়
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              সব ভিডিও ও টাস্কে আজীবন ২X (দ্বিগুণ) ইনকাম, জিরো উইথড্র ফি এবং ইনস্ট্যান্ট ক্যাশআউট সুবিধা।
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono font-bold text-amber-400">মূল্য: ১,০০০ কয়েন মাত্র</span>
              <button
                onClick={() => handleBuyVip('Gold VIP', 1000)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs shadow flex items-center gap-1 cursor-pointer active:scale-95 transition"
              >
                <span>অ্যাক্টিভ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>DIAMOND VIP PASS (ডায়মন্ড ভিআইপি)</span>
              </span>
              <span className="text-[10px] font-black bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full">
                ভিআইপি সুবিধা
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              ৩X ইনকাম বুস্ট, লাইফটাইম রেফারেল কমিশন ডাবল এবং ডেডিকেটেড ভিআইপি টেলিগ্রাম সাপোর্ট।
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono font-bold text-cyan-400">মূল্য: ২,৫০০ কয়েন</span>
              <button
                onClick={() => handleBuyVip('Diamond VIP', 2500)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-black text-xs shadow flex items-center gap-1 cursor-pointer active:scale-95 transition"
              >
                <span>আপগ্রেড করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'booster' && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400 animate-pulse">
            <Zap className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">১৫ মিনিটের জন্য ২X টার্বো স্পিড বুস্টার</h4>
            <p className="text-[11px] text-slate-300 mt-1">
              একটি স্পনসর বিজ্ঞাপন দেখে তাৎক্ষণিকভাবে পরবর্তী ১৫ মিনিটের জন্য আপনার সমস্ত কাজের গতি দ্বিগুণ করে নিন।
            </p>
          </div>
          <button
            onClick={handleActivateTurbo}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{turboActive ? 'বুস্টার সক্রিয় রয়েছে (2X)' : '২X স্পিড বুস্টার চালু করুন'}</span>
          </button>
        </div>
      )}

      {activeTab === 'scratch' && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/40 mx-auto flex items-center justify-center text-yellow-400">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">দৈনিক লাকি স্ক্র্যাচ কার্ড বোনাস</h4>
            <p className="text-[11px] text-slate-300 mt-1">
              কার্ড ঘষে জিতে নিন ৫০ থেকে ২০০ পর্যন্ত ফ্রি বোনাস কয়েন!
            </p>
          </div>

          <div 
            onClick={handleScratchCard}
            className={`w-full py-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center ${
              isScratched 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                : 'bg-slate-900 hover:bg-slate-800 border-amber-500/60 text-amber-300 animate-pulse'
            }`}
          >
            {isScratched ? (
              <>
                াসফলভাবে স্ক্র্যাচ করা হয়েছে! 🎉
                <span className="text-xl font-black text-white mt-1">+{scratchResult} কয়েন জিতেছে!</span>
              </>
            ) : (
              <>
                <span className="text-sm font-black">✨ এখানে টাচ করে স্ক্র্যাচ করুন ✨</span>
                <span className="text-[10px] text-slate-400 mt-1">(ডেইলি ১ বার ফ্রি)</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
