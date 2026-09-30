import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ShieldCheck, CheckCircle2, Sparkles, X } from 'lucide-react';
import { api } from '../../services/api';

interface PayoutEvent {
  id: string;
  name: string;
  phone: string;
  amount: number;
  method: string;
  timeAgo: string;
}

export const LivePayoutToast: React.FC = () => {
  const [currentPayout, setCurrentPayout] = useState<PayoutEvent | null>(null);
  const [visible, setVisible] = useState(false);

  // Pool of realistic BD live payment proof notifications
  const defaultProofs: PayoutEvent[] = [
    { id: '1', name: 'আল-আমিন হোসেন', phone: '০১৭****৮২১', amount: 30, method: 'রিচার্জ (GP)', timeAgo: '১ মিনিট আগে' },
    { id: '2', name: 'মোঃ তানভীর', phone: '০১৯****৩৪২', amount: 100, method: 'বিকাশ', timeAgo: '২ মিনিট আগে' },
    { id: '3', name: 'রাকিব হাসান', phone: '০১৮****৯১২', amount: 50, method: 'নগদ', timeAgo: '৪ মিনিট আগে' },
    { id: '4', name: 'নুসরাত জাহান', phone: '০১৬****৫২৩', amount: 30, method: 'রিচার্জ (BL)', timeAgo: '৬ মিনিট আগে' },
    { id: '5', name: 'শাকিল আহমেদ', phone: '০১৭****১৬৫', amount: 200, method: 'বিকাশ', timeAgo: '৮ মিনিট আগে' },
    { id: '6', name: 'মেহেদী হাসান', phone: '০১৮****৭০৮', amount: 100, method: 'নগদ', timeAgo: '১০ মিনিট আগে' }
  ];

  useEffect(() => {
    let proofIndex = 0;
    
    const showNextProof = async () => {
      let pool = defaultProofs;
      try {
        const liveList = await api.getPublicPayoutFeed();
        if (liveList && liveList.length > 0) {
          pool = liveList;
        }
      } catch (e) {}

      const selected = pool[proofIndex % pool.length];
      proofIndex++;
      setCurrentPayout(selected);
      setVisible(true);

      // Hide toast after 4.5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 4500);
    };

    // First trigger after 4 seconds of entering the app
    const initialTimer = setTimeout(() => {
      showNextProof();
    }, 3500);

    // Then trigger every 14 seconds
    const loopInterval = setInterval(() => {
      showNextProof();
    }, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopInterval);
    };
  }, []);

  if (!visible || !currentPayout) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-xs z-40 pointer-events-none animate-in slide-in-from-bottom-5 duration-300">
      <div className="pointer-events-auto flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-[#0C1524]/95 via-[#0D1C2A]/95 to-[#0A1715]/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[11px] font-black text-white truncate">
                {currentPayout.name}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {currentPayout.phone}
              </span>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 truncate">
              সরাসরি <span className="font-bold text-white">{currentPayout.method}</span> এ ৳{currentPayout.amount} টাকা সফল!
            </p>
          </div>
        </div>

        <button 
          onClick={() => setVisible(false)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
