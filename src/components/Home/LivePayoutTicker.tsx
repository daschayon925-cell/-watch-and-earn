import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowDownLeft, Sparkles } from 'lucide-react';

interface PayoutEvent {
  id: string;
  name: string;
  phone: string;
  amount: number;
  method: 'bKash' | 'Nagad';
  timeAgo: string;
}

export const LivePayoutTicker: React.FC = () => {
  const payouts: PayoutEvent[] = [
    { id: '1', name: 'মোঃ রফিকুল ইসলাম', phone: '017***4218', amount: 50, method: 'bKash', timeAgo: '১ মিনিট আগে' },
    { id: '2', name: 'জান্নাতুল ফেরদৌস', phone: '018***8934', amount: 100, method: 'Nagad', timeAgo: '২ মিনিট আগে' },
    { id: '3', name: 'তানভীর আহমেদ', phone: '019***1150', amount: 200, method: 'bKash', timeAgo: '৩ মিনিট আগে' },
    { id: '4', name: 'সাকিব আল হাসান', phone: '013***7623', amount: 50, method: 'bKash', timeAgo: '৪ মিনিট আগে' },
    { id: '5', name: 'আফরিন সুলতানা', phone: '016***5591', amount: 150, method: 'Nagad', timeAgo: '৫ মিনিট আগে' },
    { id: '6', name: 'মেহেদী হাসান শুভ', phone: '015***3302', amount: 100, method: 'bKash', timeAgo: '৭ মিনিট আগে' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % payouts.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [payouts.length]);

  const p = payouts[currentIndex];

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
              <span>সরাসরি {p.method} এ ৳{p.amount} টাকা সফল পেমেন্ট</span>
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
};
