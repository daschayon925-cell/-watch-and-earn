import React, { useState } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { language } = useApp();

  // If already running inside installed standalone app, or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  // If neither installable via beforeinstallprompt nor iOS Safari, do not show persistent bottom bar
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    const success = await install();
    if (success) {
      setIsDismissed(true);
    }
  };

  return (
    <>
      <aside 
        aria-label="PWA Installation Banner"
        className="fixed bottom-20 left-3 right-3 z-40 max-w-md mx-auto p-3.5 bg-gradient-to-r from-[#0C1525] via-[#09111E] to-[#041E15] border border-emerald-500/50 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white font-['Outfit'] truncate">
                {language === 'bn' ? 'WATCH & EARN BD অ্যাপ' : 'Watch & Earn BD App'}
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate mt-0.5">
              {language === 'bn' 
                ? 'হোম স্ক্রিন থেকে সহজে ভিডিও দেখুন ও দ্রুত কয়েন আয় করুন' 
                : 'Install app on home screen for 2x faster access'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* iOS Safari Guided Install Sheet */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#09111E] border border-emerald-500/40 p-5 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">iPhone / iPad এ ইনস্টল করুন</h3>
                  <p className="text-[11px] text-slate-400">Safari ব্রাউজার দিয়ে হোম স্ক্রিনে যোগ করুন</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-300">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>১. সাফারি ব্রাউজারের নিচের <strong>Share (শেয়ার)</strong> আইকনে চাপ দিন।</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>২. একটু নিচে স্ক্রল করে <strong>Add to Home Screen</strong> চাপুন।</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition"
            >
              বুঝেছি / বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </>
  );
};
