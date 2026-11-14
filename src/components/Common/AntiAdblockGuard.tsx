import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AntiAdblockGuard: React.FC = () => {
  const { settings, showToast } = useApp();
  const [isAdblockDetected, setIsAdblockDetected] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  // Check if Anti-Adblock feature is enabled in admin settings (default: true for revenue safety)
  const isEnabled = (settings?.adsConfig as any)?.antiAdblockEnabled !== false;

  const testAdBlock = async () => {
    if (!isEnabled) {
      setIsAdblockDetected(false);
      return;
    }

    setChecking(true);
    let adBlocked = false;

    // Test 1: Fetch known ad script test URL or inject bait element
    try {
      const bait = document.createElement('div');
      bait.className = 'adsbygoogle ad-zone ad-space ad-unit sponsored-ad-banner';
      bait.style.position = 'absolute';
      bait.style.left = '-9999px';
      bait.style.height = '1px';
      bait.style.width = '1px';
      document.body.appendChild(bait);

      if (bait.offsetHeight === 0 || bait.clientHeight === 0 || window.getComputedStyle(bait).display === 'none') {
        adBlocked = true;
      }
      document.body.removeChild(bait);
    } catch {
      adBlocked = true;
    }

    // Test 2: Attempt dummy fetch to standard ad server domain
    if (!adBlocked) {
      try {
        const res = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
      } catch {
        adBlocked = true;
      }
    }

    setIsAdblockDetected(adBlocked);
    setChecking(false);
  };

  useEffect(() => {
    // Initial check after 2.5 seconds to allow normal app load
    const timer = setTimeout(() => {
      testAdBlock();
    }, 2500);

    return () => clearTimeout(timer);
  }, [isEnabled]);

  if (!isEnabled || !isAdblockDetected) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/50 p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_20px_#f43f5e]">
          <ShieldAlert className="w-9 h-9 text-rose-400 animate-bounce" />
        </div>

        <div>
          <h2 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
            <span>🛡️ অ্যাডব্লকার শনাক্ত হয়েছে!</span>
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            আপনার ফোনে বা ব্রাউজারে <strong className="text-amber-400">AdBlock, Brave Shield বা DNS Adblocker</strong> চালু থাকায় স্পন্সর বিজ্ঞাপন ও ভিডিও ভিউ লোড হচ্ছে না।
          </p>
          <div className="mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-[11px] text-slate-300 text-left space-y-1">
            <p className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>কীভাবে বন্ধ করবেন:</span>
            </p>
            <p>১. আপনার ব্রাউজারের উপরে "Shield" বা AdBlock আইকনে চাপ দিন।</p>
            <p>২. এই ওয়েবসাইটের জন্য AdBlock অফ করুন এবং রিফ্রেশ চাপুন।</p>
          </div>
        </div>

        {/* Retry Action Button */}
        <button
          onClick={testAdBlock}
          disabled={checking}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'যাচাই করা হচ্ছে...' : 'অ্যাডব্লক বন্ধ করেছি, পুনরায় চেষ্টা করুন'}</span>
        </button>
      </div>
    </div>
  );
};
