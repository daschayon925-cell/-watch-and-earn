import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface PaymentItem {
  id: string;
  name: string;
  phone: string;
  method: 'bKash' | 'Nagad' | 'Recharge';
  amount: number;
  trxId: string;
  timeAgo: string;
}

const SAMPLE_PAYMENTS: PaymentItem[] = [
  { id: 'p1', name: 'মোঃ সাকিব', phone: '017***42', method: 'bKash', amount: 100, trxId: '9A8X7K2M', timeAgo: '২ মিনিট আগে' },
  { id: 'p2', name: 'তানভীর আহমেদ', phone: '018***19', method: 'Nagad', amount: 150, trxId: '4B2M1Q9P', timeAgo: '৫ মিনিট আগে' },
  { id: 'p3', name: 'রিয়াদ হোসেন', phone: '019***55', method: 'Recharge', amount: 30, trxId: 'RC-8842', timeAgo: '৮ মিনিট আগে' },
  { id: 'p4', name: 'নুসরাত জাহান', phone: '016***83', method: 'bKash', amount: 200, trxId: '7X9L3P1Z', timeAgo: '১২ মিনিট আগে' },
  { id: 'p5', name: 'মেহেদী হাসান', phone: '013***67', method: 'Nagad', amount: 100, trxId: '2K5V8N4B', timeAgo: '১৫ মিনিট আগে' },
  { id: 'p6', name: 'সজীব রায়', phone: '017***90', method: 'bKash', amount: 300, trxId: '6T1Y4W8Q', timeAgo: '১৮ মিনিট আগে' },
];

export const LivePaymentTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLE_PAYMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = SAMPLE_PAYMENTS[currentIndex];

  const getMethodBadge = (m: 'bKash' | 'Nagad' | 'Recharge') => {
    switch (m) {
      case 'bKash':
        return <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 px-1.5 py-0.2 rounded text-[9px] font-black">বিকাশ</span>;
      case 'Nagad':
        return <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.2 rounded text-[9px] font-black">নগদ</span>;
      case 'Recharge':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded text-[9px] font-black">রিচার্জ</span>;
    }
  };

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-emerald-950/80 via-slate-900/95 to-emerald-950/80 border-y border-emerald-500/30 py-1.5 px-3 backdrop-blur-md">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-emerald-300 flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            লাইভ পেমেন্ট প্রুফ:
          </span>
        </div>

        {/* Dynamic Sliding Item */}
        <div className="flex-1 overflow-hidden">
          <div 
            key={current.id} 
            className="flex items-center gap-1.5 text-[11px] animate-in fade-in slide-in-from-right duration-300 truncate"
          >
            <span className="font-bold text-white truncate">{current.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">({current.phone})</span>
            {getMethodBadge(current.method)}
            <span className="font-black text-amber-400 font-mono">৳{current.amount}</span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold hidden sm:inline">[{current.trxId}]</span>
            <span className="text-[9px] text-slate-400 shrink-0 ml-auto">{current.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
