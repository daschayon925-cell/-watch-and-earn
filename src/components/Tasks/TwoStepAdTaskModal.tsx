import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, ExternalLink, ShieldCheck, X, Coins, CheckCircle2, 
  ArrowRight, Zap, Clock, AlertTriangle, RefreshCw, Layers 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';

export interface TwoStepTaskData {
  id: string;
  title: string;
  desc: string;
  reward: number;
  timeSec?: number;
  primaryLink: string;
  step1AdLink?: string;
  step2AdLink?: string;
}

interface Props {
  isOpen: boolean;
  task: TwoStepTaskData | null;
  onClose: () => void;
  onSuccess: (taskId: string, reward: number) => void;
}

export const TwoStepAdTaskModal: React.FC<Props> = ({
  isOpen,
  task,
  onClose,
  onSuccess
}) => {
  const { showToast, triggerConfetti, settings } = useApp();
  const { awardCoinsLocally, refreshUser } = useAuth();

  // Current sub-stage: 'STEP1_AD' -> 'STEP2_WORK' -> 'STEP3_AD' -> 'COMPLETED'
  const [stage, setStage] = useState<'STEP1_AD' | 'STEP2_WORK' | 'STEP3_AD' | 'COMPLETED'>('STEP1_AD');
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [isStep1Done, setIsStep1Done] = useState(false);
  const [isStep3Done, setIsStep3Done] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const timerRef = useRef<any>(null);

  const defaultHilltopLink = settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c';
  const defaultAdsterraLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const defaultMonetagLink = settings?.adsConfig?.monetagDirectLink?.trim() || 'https://5gvci.com/act/files/tag.min.js?z=11948885';

  const step1Link = task?.step1AdLink || (Math.random() > 0.5 ? defaultHilltopLink : defaultMonetagLink);
  const step2WorkLink = task?.primaryLink || defaultAdsterraLink;
  const step3Link = task?.step2AdLink || (Math.random() > 0.5 ? defaultAdsterraLink : defaultMonetagLink);

  useEffect(() => {
    if (isOpen && task) {
      setStage('STEP1_AD');
      setSecondsRemaining(15);
      setIsStep1Done(false);
      setIsStep3Done(false);
      setIsClaiming(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  // 🚀 Start Step 1: Pre-Task Ad
  const handleOpenStep1Ad = () => {
    try {
      window.open(step1Link, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = step1Link;
    }

    // Start 15s countdown
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsRemaining(15);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsStep1Done(true);
          soundService.playSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🚀 Proceed to Step 2: Main Work
  const handleProceedToWork = () => {
    setStage('STEP2_WORK');
    try {
      window.open(step2WorkLink, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  // 🚀 Finished Work -> Go to Step 3: Post-Task Ad
  const handleFinishedWork = () => {
    setStage('STEP3_AD');
    setSecondsRemaining(15);
    setIsStep3Done(false);

    try {
      window.open(step3Link, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = step3Link;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsStep3Done(true);
          soundService.playSuccessFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🚀 Final Step 4: Claim Coins to Wallet
  const handleFinalClaimReward = async () => {
    if (isClaiming) return;
    setIsClaiming(true);

    awardCoinsLocally(task.reward);
    soundService.playSuccessFanfare();
    triggerConfetti();

    showToast(
      `🎉 অভিনন্দন! +${task.reward} কয়েন আপনার ওয়ালেটে যুক্ত হয়েছে!`,
      '',
      'coin'
    );

    try {
      await api.claimTaskReward(task.id, task.title, task.reward);
      await refreshUser();
    } catch (e) {
      console.error(e);
    }

    onSuccess(task.id, task.reward);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#0B1120] to-[#050914] border-2 border-amber-500/50 p-5 shadow-2xl relative overflow-hidden text-white space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                ডাবল-অ্যাড ভেরিফায়েড টাস্ক 🇧🇩
              </span>
              <h3 className="font-bold text-xs text-white line-clamp-1">
                {task.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Stepper Indicator */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-center">
          <div className={`py-1.5 rounded-lg transition ${stage === 'STEP1_AD' ? 'bg-amber-500 text-slate-950 font-black shadow' : isStep1Done ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}>
            ১. শুরুর অ্যাড
          </div>
          <div className={`py-1.5 rounded-lg transition ${stage === 'STEP2_WORK' ? 'bg-emerald-500 text-slate-950 font-black shadow' : stage === 'STEP3_AD' || stage === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}>
            ২. মূল কাজ
          </div>
          <div className={`py-1.5 rounded-lg transition ${stage === 'STEP3_AD' || stage === 'COMPLETED' ? 'bg-purple-500 text-white font-black shadow' : 'text-slate-400'}`}>
            ৩. শেষ অ্যাড
          </div>
        </div>

        {/* STAGE 1: PRE-TASK DIRECT LINK AD */}
        {stage === 'STEP1_AD' && (
          <div className="space-y-3.5 py-1 text-center">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <span className="font-black block text-sm mb-1 text-amber-400">
                ধাপ ১/৩: স্পন্সর পেজ ভেরিফিকেশন ⚡
              </span>
              কয়েন সুরক্ষার জন্য প্রথমে ১ম স্পন্সর পেজটি ১৫ সেকেন্ড ভিজিট করে আসল কাজটি আনলক করুন।
            </div>

            {!isStep1Done ? (
              <div className="space-y-3">
                {secondsRemaining < 15 && secondsRemaining > 0 && (
                  <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40">
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="font-mono text-sm font-black text-amber-400">
                      অপেক্ষা করুন: {secondsRemaining} সেকেন্ড
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOpenStep1Ad}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
                >
                  <span>১ম স্পন্সর অ্যাড ওপেন করুন (১৫ সে.)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>১ম স্পন্সর ভেরিফিকেশন সফল!</span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToWork}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 cursor-pointer"
                >
                  <span>আসল কাজ শুরু করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: MAIN TASK EXECUTION */}
        {stage === 'STEP2_WORK' && (
          <div className="space-y-3.5 py-1 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-left space-y-1.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                ধাপ ২/৩: মূল কাজ
              </span>
              <h4 className="text-sm font-bold text-white">{task.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{task.desc}</p>
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">নির্ধারিত সময়:</span>
                <span className="text-amber-400 font-bold font-mono">{task.timeSec || 20} সেকেন্ড</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishedWork}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 cursor-pointer"
            >
              <span>কাজটি শেষ করেছি (পরবর্তী স্পন্সর)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 3: POST-TASK DIRECT LINK AD & CLAIM */}
        {stage === 'STEP3_AD' && (
          <div className="space-y-3.5 py-1 text-center">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
              <span className="font-black block text-sm mb-1 text-purple-400">
                ধাপ ৩/৩: শেষ স্পন্সর অ্যাড ভেরিফিকেশন 🎁
              </span>
              রিওয়ার্ড কয়েনটি সুরক্ষিতভাবে ওয়ালেটে যুক্ত করার জন্য শেষ স্পন্সর পেজটি ১৫ সেকেন্ড দেখুন।
            </div>

            {!isStep3Done ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                <Clock className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="font-mono text-sm font-black text-purple-300">
                  ভেরিফিকেশন হচ্ছে: {secondsRemaining} সেকেন্ড
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>সম্পূর্ণ ভেরিফিকেশন সফল হয়েছে!</span>
                </div>

                <button
                  type="button"
                  onClick={handleFinalClaimReward}
                  disabled={isClaiming}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/40 active:scale-95 cursor-pointer animate-pulse"
                >
                  <Coins className="w-5 h-5 fill-slate-950" />
                  <span>+{task.reward} কয়েন ওয়ালেটে ক্লেইম করুন 💰</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>১০০% নিরাপদ ও সুরক্ষিত রিওয়ার্ড সিস্টেম</span>
        </p>

      </div>
    </div>,
    document.body
  );
};
