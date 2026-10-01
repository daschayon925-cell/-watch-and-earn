import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, ArrowLeft, CheckCircle2, ShieldAlert, MousePointerClick, AlertCircle } from 'lucide-react';
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
  const [hasInteractedWithAd, setHasInteractedWithAd] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setRemaining(durationSeconds);
      setIsCompleted(false);
      setHasInteractedWithAd(false);
      setShowWarning(false);
      return;
    }

    setRemaining(durationSeconds);
    setIsCompleted(false);
    setHasInteractedWithAd(false);
    setShowWarning(false);

    // Initial click trigger: open real ad in new active window/tab
    try {
      window.open(adUrl, '_blank', 'noopener,noreferrer');
      setHasInteractedWithAd(true);
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
    setShowWarning(false);
    try {
      window.open(adUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = adUrl;
    }
  };

  const handleFinishAndCollect = () => {
    if (!hasInteractedWithAd) {
      setShowWarning(true);
      return;
    }
    onCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 shadow-2xl p-5 text-white flex flex-col items-center text-center space-y-3.5">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <Sparkles className="w-4 h-4 fill-amber-400" />
            <span>হাই-সিপিএম স্পনসর বিজ্ঞাপন</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition active:scale-95 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ফিরে যান</span>
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

        {/* Mandatory Click / Engagement Verification Box */}
        <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
          <div className="flex items-start gap-2">
            <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h5 className="text-[11px] font-black text-amber-300">
                বিজ্ঞাপন পেজে ভিজিট ও টাচ আবশ্যক
              </h5>
              <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                কয়েন পেতে হলে নতুন ট্যাবে বিজ্ঞাপনটি ওপেন করে যেকোনো বাটনে ট্যাপ করতে হবে এবং ২৫ সেকেন্ড থাকতে হবে।
              </p>
            </div>
          </div>

          {/* High-Visibility Click Button to Guarantee Impression & Conversion */}
          <button
            onClick={handleOpenAdTarget}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
            <span>👉 বিজ্ঞাপনে ট্যাপ করুন ও অফার দেখুন</span>
          </button>
        </div>

        {showWarning && !hasInteractedWithAd && (
          <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>প্রথমে উপরের বাটনে ট্যাপ করে বিজ্ঞাপনটি ওপেন করুন!</span>
          </div>
        )}

        {/* Action Button: Collect Reward or Wait */}
        <div className="w-full pt-1">
          {isCompleted ? (
            <button
              onClick={handleFinishAndCollect}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4 fill-slate-950" />
              <span>+{rewardCoins} কয়েন গ্রহণ করুন</span>
            </button>
          ) : (
            <div className="w-full space-y-1.5">
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                ⏳ সময় গণনা চলছে... বাকি {remaining} সেকেন্ড
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
