import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Sparkles, ExternalLink, AlertTriangle, CheckCircle2, Lock, Coins, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';
import { triggerAdReward } from '../../services/adBonus';

interface AdVisitTimerState {
  isOpen: boolean;
  adUrl: string;
  sourceTitle: string;
  coins: number;
  durationSeconds: number;
}

// Global listener pattern for simple triggering from anywhere
let triggerAdVisitTimerGlobal: ((state: Omit<AdVisitTimerState, 'isOpen'>) => void) | null = null;

export const openAdWithStrictTimer = (
  adUrl: string,
  sourceTitle: string = 'স্পন্সর বিজ্ঞাপন',
  coins: number = 10,
  durationSeconds: number = 20
) => {
  if (triggerAdVisitTimerGlobal) {
    triggerAdVisitTimerGlobal({
      adUrl,
      sourceTitle,
      coins,
      durationSeconds
    });
  } else {
    // Fallback: open URL directly
    try {
      window.open(adUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = adUrl;
    }
  }
};

export const AdVisitTimerModal: React.FC = () => {
  const { showToast, triggerConfetti } = useApp();
  const { awardCoinsLocally } = useAuth();

  const [state, setState] = useState<AdVisitTimerState>({
    isOpen: false,
    adUrl: '',
    sourceTitle: 'স্পন্সর বিজ্ঞাপন',
    coins: 10,
    durationSeconds: 20
  });

  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const timerRef = useRef<any>(null);

  // Register global opener
  useEffect(() => {
    triggerAdVisitTimerGlobal = (data) => {
      const initialDuration = Math.max(15, data.durationSeconds || 20);
      setState({
        isOpen: true,
        adUrl: data.adUrl,
        sourceTitle: data.sourceTitle,
        coins: data.coins,
        durationSeconds: initialDuration
      });
      setSecondsRemaining(initialDuration);
      setIsCompleted(false);
      setIsClaimed(false);
      setShowExitWarning(false);

      // Open the ad in a new tab immediately
      try {
        window.open(data.adUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // Popups might be blocked
      }
    };

    return () => {
      triggerAdVisitTimerGlobal = null;
    };
  }, []);

  // Strict 20s Countdown Timer
  useEffect(() => {
    if (!state.isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isOpen]);

  // Handle successful completion
  useEffect(() => {
    if (isCompleted && !isClaimed) {
      setIsClaimed(true);
      try {
        soundService.playCoinReward();
      } catch (e) {}
      triggerConfetti();
      triggerAdReward(state.sourceTitle, awardCoinsLocally, showToast);
    }
  }, [isCompleted, isClaimed, state.sourceTitle, awardCoinsLocally, showToast, triggerConfetti]);

  // Prevent back navigation during countdown
  useEffect(() => {
    if (!state.isOpen) return;

    try {
      window.history.pushState({ adTimerActive: true }, '', window.location.href);
    } catch (e) {}

    const handlePopState = () => {
      if (!isCompleted) {
        setShowExitWarning(true);
        // re-push to keep trap
        try {
          window.history.pushState({ adTimerActive: true }, '', window.location.href);
        } catch (e) {}
      } else {
        handleClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [state.isOpen, isCompleted]);

  const handleClose = () => {
    if (!isCompleted) {
      setShowExitWarning(true);
      return;
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleReopenAd = () => {
    try {
      window.open(state.adUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = state.adUrl;
    }
  };

  if (!state.isOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round(((state.durationSeconds - secondsRemaining) / state.durationSeconds) * 100)
  );

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Container Box */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0d1322] border-2 border-amber-500/60 p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center text-white space-y-4">
        
        {/* Header Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-bounce" />
            বিজ্ঞাপন ভেরিফিকেশন চলছে
          </span>
        </div>

        {/* Big Circular / Countdown Display */}
        <div className="py-2">
          {!isCompleted ? (
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Spinning circular border */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-amber-400 font-mono tracking-tight drop-shadow-md">
                  {secondsRemaining}s
                </span>
                <span className="text-[10px] font-bold text-slate-300 mt-0.5">
                  বাকি আছে
                </span>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-14 h-14" />
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
          <div 
            className={`h-full transition-all duration-1000 ${
              isCompleted 
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Status Message */}
        <div className="space-y-1.5">
          {!isCompleted ? (
            <>
              <h3 className="text-base font-black text-white flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>২০ সেকেন্ড অপেক্ষা করুন</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed px-2">
                বিজ্ঞাপন পেজে কমপক্ষে <strong className="text-amber-300">২০ সেকেন্ড</strong> থাকুন। ২০ সেকেন্ড পূর্ণ হওয়ার আগে বের হলে <strong className="text-rose-400">কোনো কয়েন পাবেন না</strong>।
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 fill-emerald-400" />
                <span>ভেরিফিকেশন সফল হয়েছে!</span>
              </h3>
              <p className="text-xs text-slate-200">
                আপনার অ্যাকাউন্টে <strong className="text-amber-300 text-sm">+{state.coins} কয়েন</strong> সফলভাবে যোগ করা হয়েছে।
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          {!isCompleted ? (
            <>
              <button
                type="button"
                onClick={handleReopenAd}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <span>বিজ্ঞাপন পেজে যান</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowExitWarning(true)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
              >
                এখনই বের হতে চান? (কয়েন হারাবেন)
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>কয়েন বুঝে পেয়েছি (বন্ধ করুন)</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 🚨 Warning Confirmation if user attempts early exit before 20s */}
      {showExitWarning && !isCompleted && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 p-4 animate-in fade-in">
          <div className="max-w-xs w-full rounded-2xl bg-slate-900 border-2 border-rose-500 p-5 text-center text-white space-y-3 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-black text-rose-400">
              সতর্কবার্তা! কয়েন পাবেন না
            </h4>
            <p className="text-xs text-slate-300">
              আর মাত্র <strong className="text-amber-400 font-bold">{secondsRemaining} সেকেন্ড</strong> বাকি আছে! এখন বের হয়ে গেলে আপনার অ্যাকাউন্টে <strong className="text-rose-400">০ কয়েন</strong> যোগ হবে।
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowExitWarning(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow"
              >
                অপেক্ষা করব (+১০ কয়েন পাব)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitWarning(false);
                  setState((prev) => ({ ...prev, isOpen: false }));
                  showToast('❌ বিজ্ঞাপন বাতিল', '২০ সেকেন্ড পূর্ণ না করায় কোনো কয়েন দেওয়া হয়নি।', 'error');
                }}
                className="w-full py-2 text-xs font-bold text-rose-400 hover:text-rose-300"
              >
                হ্যাঁ, বের হয়ে যান (কয়েন লাগবে না)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
