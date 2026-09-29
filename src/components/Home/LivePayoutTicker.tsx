import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface PayoutEvent {
  id: string;
  name: string;
  phone: string;
  amount: number;
  method: string;
  timeAgo: string;
}

export const LivePayoutTicker: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadPayouts = async () => {
      try {
        const list = await api.getPublicPayoutFeed();
        if (list && list.length > 0) {
          setPayouts(list);
        }
      } catch (err) {
        console.error('Failed to load payouts', err);
      }
    };
    loadPayouts();
  }, []);

  useEffect(() => {
    if (payouts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % payouts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [payouts.length]);

  // If there are real completed payouts in the system, show the real ticker
  if (payouts.length > 0) {
    const p = payouts[currentIndex] || payouts[0];
    return (
      <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-emerald-950/70 border border-emerald-500/30 p-2.5 shadow-lg backdrop-blur-md transition-all">
        <div className="flex items-center justify-between gap-2 animate-in fade-in duration-300" key={p.id}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[11px] font-black text-white truncate">{p.name}</span>
                <span className="text-[9px] text-slate-400 font-mono">({p.phone})</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                <span>সরাসরি {p.method} এ ৳{p.amount} টাকা সফল ক্যাশআউট</span>
                <span className="text-slate-500">• {p.timeAgo}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>ভেরিফাইড পে</span>
          </div>
        </div>
      </div>
    );
  }

  // Official real banner for live payouts guarantee
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-emerald-950/60 border border-emerald-500/30 p-2.5 shadow-lg backdrop-blur-md transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[11px] font-black text-white">বাংলাদেশি বিশ্বস্ত ক্যাশআউট সিস্টেম</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-0.5">
              <span>বিকাশ • নগদ • মোবাইল রিচার্জে তাৎক্ষণিক উত্তোলন সুবিধা</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>১০০% নিরাপদ</span>
        </div>
      </div>
    </div>
  );
};

