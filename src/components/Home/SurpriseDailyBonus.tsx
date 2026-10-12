import React, { useState } from 'react';
import { Gift, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/audio';
import { openAdWithStrictTimer } from '../Common/AdVisitTimerModal';

export const SurpriseDailyBonus: React.FC = () => {
  const { showToast, triggerConfetti, settings } = useApp();
  const { awardCoinsLocally } = useAuth();
  const [clicked, setClicked] = useState(false);

  const handleSurpriseClick = () => {
    soundService.playTap();
    openAdWithStrictTimer(
      settings?.adsConfig?.adsterraDirectLink || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4',
      'সারপ্রাইজ বোনাস অ্যাড',
      50,
      15
    );
    
    setClicked(true);
    triggerConfetti();
    if (awardCoinsLocally) awardCoinsLocally(50);
    showToast('🎁 সারপ্রাইজ বোনাস!', 'বোনাস কয়েন যোগ হয়েছে। আরও অ্যাড দেখুন ইনকাম বাড়াতে!', 'coin');
  };

  return (
    <div className="w-full my-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500 shadow-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white/10 rounded-full animate-bounce">
          <Gift className="w-6 h-6 text-purple-300" />
        </div>
        <div>
          <h4 className="text-sm font-black text-white">দৈনিক সারপ্রাইজ বোনাস!</h4>
          <p className="text-[10px] text-purple-200">এখনই ক্লিক করে ৫০ কয়েন জিতে নিন!</p>
        </div>
      </div>
      <button
        onClick={handleSurpriseClick}
        disabled={clicked}
        className="px-4 py-2 bg-white text-purple-900 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
      >
        {clicked ? 'সংগৃহীত' : 'জিতে নিন!'}
      </button>
    </div>
  );
};
