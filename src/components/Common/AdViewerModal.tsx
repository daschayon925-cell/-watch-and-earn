import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, ArrowLeft, CheckCircle2, MousePointerClick, Zap, X } from 'lucide-react';
import { soundService } from '../../services/audio';

interface AdViewerModalProps {
  isOpen: boolean;
  adUrl: string;
  durationSeconds?: number; // 8 seconds snappy timer
  rewardCoins?: number;
  onCompleted: () => void;
  onClose: () => void;
}

export const AdViewerModal: React.FC<AdViewerModalProps> = ({
  isOpen,
  adUrl,
  durationSeconds = 8,
  rewardCoins = 15,
  onCompleted,
  onClose
}) => {
  const [remaining, setRemaining] = useState<number>(durationSeconds);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // 🛡️ Mobile Hardware Back Button (ফোনের ব্যাক বাটন চাপলে সরাসরি অ্যাপে ফিরে আসবে)
  useEffect(() => {
    if (!isOpen) return;

    try {
      window.history.pushState({ adModalOpen: true }, '', window.location.href);
    } catch {
      // Ignore
    }

    const handlePopState = () => {
      // If user presses back button after visiting ad, claim coins and return
      if (isCompleted || remaining <= 3) {
        onCompleted();
      }
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, isCompleted, remaining, onCompleted, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setRemaining(durationSeconds);
      setIsCompleted(false);
      return;
    }

    setRemaining(durationSeconds);
    setIsCompleted(false);

    // Snappy Countdown Timer (8s)
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          soundService.playCoinReward();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // ⚡ Tab Switch Detection: When user returns from the ad tab, instantly complete & reward!
    const handleVis = () => {
      if (document.visibilityState === 'visible') {
        setIsCompleted(true);
        setRemaining(0);
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [isOpen, durationSeconds]);

  if (!isOpen) return null;

  const progressPercent = Math.round(((durationSeconds - remaining) / durationSeconds) * 100);

  const handleOpenAdTarget = () => {
    try {
      window.open(adUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Fallback
    }
  };

  const handleFinishAndCollect = () => {
    onCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 shadow-2xl p-5 text-white flex flex-col items-center text-center space-y-3.5">
        
        {/* Top Header with Fast Back Button */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <Sparkles className="w-4 h-4 fill-amber-400" />
            <span>স্পনসর বিজ্ঞাপন ও দ্রুত কয়েন রিওয়ার্ড</span>
          </div>

          <button
            onClick={isCompleted ? handleFinishAndCollect : onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition active:scale-95 border border-slate-700 cursor-pointer shadow-md"
            title="অ্যাপে ফিরে যান"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'কয়েন নিয়ে ফিরুন ✕' : 'ব্যাকে ফিরুন ✕'}</span>
          </button>
        </div>

        {/* Snappy Animated Timer Indicator */}
        <div className="relative py-1">
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center relative shadow-inner">
            <svg className="w-full h-full -rotate-90 absolute inset-0">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="5"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * progressPercent) / 100}
                className={`${isCompleted ? 'text-emerald-400' : 'text-amber-400'} transition-all duration-700`}
                strokeLinecap="round"
              />
            </svg>

            <div className="flex flex-col items-center justify-center z-10">
              {isCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              ) : (
                <>
                  <span className="text-2xl font-black font-mono text-amber-400">{remaining}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">সেকেন্ড</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fast Action Box */}
        <div className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/40 text-left space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              বিজ্ঞাপন ভিজিট করুন
            </h5>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-[10px]">
              +{rewardCoins} কয়েন বোনাস
            </span>
          </div>

          <button
            onClick={handleOpenAdTarget}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
            <span>👉 বিজ্ঞাপনে ট্যাপ করুন ও অফার দেখুন</span>
          </button>
        </div>

        {/* Big 1-Click Instant Reward & Back Button */}
        <div className="w-full pt-1">
          {isCompleted ? (
            <button
              onClick={handleFinishAndCollect}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_20px_#10b981] flex items-center justify-center gap-2 active:scale-95 transition animate-bounce cursor-pointer border-2 border-white"
            >
              <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-400" />
              <span>⚡ +{rewardCoins} কয়েন নিয়ে অ্যাপে ফিরে যান ✕</span>
            </button>
          ) : (
            <div className="w-full space-y-1.5">
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>⏳ মাত্র {remaining} সেকেন্ড বাকি...</span>
                <span className="text-amber-400 font-bold">{progressPercent}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Direct Fast Exit Helper */}
        <button
          onClick={isCompleted ? handleFinishAndCollect : onClose}
          className="text-xs text-slate-400 hover:text-white underline cursor-pointer pt-1"
        >
          🔙 সরাসরি অ্যাপে ফিরে যান
        </button>

      </div>
    </div>
  );
};
