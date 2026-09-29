import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { language } = useApp();

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto p-3.5 bg-gradient-to-r from-[#0E1626] to-[#0A101C] border border-emerald-500/40 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">
            {language === 'bn' ? 'অ্যাপটি ইনস্টল করুন' : 'Install PWA App'}
          </h4>
          <p className="text-[10px] text-slate-300">
            {language === 'bn' ? 'হোম স্ক্রিন থেকে সহজে ভিডিও দেখুন ও কয়েন আয় করুন' : 'Fast, smooth full-screen experience'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1 transition"
        >
          <Download className="w-3.5 h-3.5" />
          {language === 'bn' ? 'ইনস্টল' : 'Install'}
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
