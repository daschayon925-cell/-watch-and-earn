import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, ArrowLeft, CheckCircle2, MousePointerClick, ShieldCheck, X } from 'lucide-react';
import { soundService } from '../../services/audio';

interface AdViewerModalProps {
  isOpen: boolean;
  adUrl: string;
  durationSeconds?: number; // 25 seconds
  rewardCoins?: number;
  onCompleted: () => void;
  onClose: () => void;
}

export const AdViewerModal: React.FC<AdViewerModalProps> = ({
  isOpen,
  adUrl,
  durationSeconds = 25,
  rewardCoins = 15,
  onCompleted,
  onClose
}) => {
  const [remaining, setRemaining] = useState<number>(durationSeconds);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasInteractedWithAd, setHasInteractedWithAd] = useState<boolean>(true);

  // 🛡️ Safe Hardware Back Button Navigation Handler (ইউজার ব্যাক বাটনে চাপলে সুন্দরভাবে অ্যাপে ফিরবে)
  useEffect(() => {
    if (!isOpen) return;

    try {
      window.history.pushState({ adModalOpen: true }, '', window.location.href);
    } catch {
      // Ignore state push errors
    }

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setRemaining(durationSeconds);
      setIsCompleted(false);
      return;
    }

    setRemaining(durationSeconds);
    setIsCompleted(false);
    setHasInteractedWithAd(true);

    // Initial trigger: Open real ad safely in independent new tab without breaking app
    try {
      window.open(adUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Browser popup blocked
    }

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

    return () => clearInterval(interval);
  }, [isOpen, durationSeconds, adUrl]);

  if (!isOpen) return null;

  const progressPercent = Math.round(((durationSeconds - remaining) / durationSeconds) * 100);

  const handleOpenAdTarget = () => {
    setHasInteractedWithAd(true);
    try {
      window.open(adUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(adUrl, '_blank');
    }
  };

  const handleFinishAndCollect = () => {
    onCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 shadow-2xl p-5 text-white flex flex-col items-center text-center space-y-3.5">
        
        {/* Top Header with Clear Back Button */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <Sparkles className="w-4 h-4 fill-amber-400" />
            <span>স্পনসর বিজ্ঞাপন ও কয়েন বোনাস</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition active:scale-95 border border-slate-700 cursor-pointer"
            title="অ্যাপে ফিরে যান"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ব্যাকে ফিরুন</span>
          </button>
        </div>

        {/* 25-Second Animated Circular Timer */}
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
                className={`${isCompleted ? 'text-emerald-400' : 'text-amber-400'} transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>

            <div className="flex flex-col items-center justify-center z-10">
              {isCompleted ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce" />
              ) : (
                <>
                  <span className="text-xl font-black font-mono text-amber-400">{remaining}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">সেকেন্ড</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ad Direct Tap Box */}
        <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
          <div className="flex items-start gap-2">
            <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h5 className="text-[11px] font-black text-amber-300">
                বিজ্ঞাপন পেজ দেখুন (+{rewardCoins} কয়েন)
              </h5>
              <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                বিজ্ঞাপন পেজে কয়েক সেকেন্ড ঘুরে টাইমার শেষ হলেই সরাসরি একাউন্টে কয়েন যোগ হবে।
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdTarget}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
            <span>👉 বিজ্ঞাপনে ট্যাপ করুন ও অফার দেখুন</span>
          </button>
        </div>

        {/* Action Button: Collect Reward or Progress Bar */}
        <div className="w-full pt-1">
          {isCompleted ? (
            <button
              onClick={handleFinishAndCollect}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition animate-pulse cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 fill-slate-950" />
              <span>+{rewardCoins} কয়েন গ্রহণ করে অ্যাপে ফিরুন 🎁</span>
            </button>
          ) : (
            <div className="w-full space-y-1.5">
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>⏳ টাইমার চলছে... বাকি {remaining} সেকেন্ড</span>
                <span className="text-amber-400 font-bold">{progressPercent}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Easy Back to App Footer Button */}
        <button
          onClick={onClose}
          className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer pt-1"
        >
          🔙 সরাসরি অ্যাপে ফিরে যান
        </button>

      </div>
    </div>
  );
};
