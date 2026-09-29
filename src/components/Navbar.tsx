import React from 'react';
import { Bell, Shield, Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const {
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    unreadNotificationCount,
    setIsNotificationDrawerOpen,
    isMuted,
    setIsMuted,
    settings
  } = useApp();

  // If in full watch mode, render a streamlined floating top overlay
  const isWatchTab = activeTab === 'watch';

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isWatchTab 
        ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[2px]' 
        : 'bg-[#05070B]/90 backdrop-blur-md border-b border-slate-800/80'
    } px-4 py-3 max-w-md mx-auto w-full`}>
      <div className="flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Custom Modern 3D Play-Coin Logo Icon */}
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/30 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
            <div className="w-full h-full bg-[#05070B] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              {/* Background radial spark */}
              <div className="absolute inset-0 bg-radial from-emerald-500/20 to-transparent" />
              <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(16,185,129,0.7)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" stroke="url(#logo_grad)" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M12 9.5L23 16L12 22.5V9.5Z" fill="url(#play_grad)" />
                <circle cx="22" cy="10" r="3.5" fill="#F59E0B" />
                <text x="20.5" y="11.8" fill="#78350F" fontSize="4.5" fontWeight="900" fontFamily="sans-serif">৳</text>
                <defs>
                  <linearGradient id="logo_grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10B981" />
                    <stop offset="1" stopColor="#06B6D4" />
                  </linearGradient>
                  <linearGradient id="play_grad" x1="12" y1="9.5" x2="23" y2="22.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#34D399" />
                    <stop offset="1" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-sm tracking-tight text-white font-['Outfit'] flex items-center">
                WATCH<span className="text-emerald-400">&</span>EARN
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 rounded-md border border-emerald-500/40 tracking-wider">
                BD 🇧🇩
              </span>
            </div>
            <p className="text-[9.5px] text-slate-300 font-semibold tracking-wide mt-0.5 flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span>{language === 'bn' ? 'ভিডিও দেখুন • প্রতিদিন আয় করুন' : 'Watch Videos • Earn Daily'}</span>
            </p>
          </div>
        </div>

        {/* Right Action Icons & Coin Pill */}
        <div className="flex items-center gap-2">
          {/* Audio Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* User Coin Balance Ticker */}
          {user && (
            <div 
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-amber-500/10 border border-amber-500/30 hover:border-amber-400 rounded-full cursor-pointer transition shadow-sm"
            >
              <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-black text-slate-950 shadow-inner">
                🪙
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-amber-300 leading-tight">
                  {user.coins.toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-400 font-medium leading-none">
                  ≈ ৳{(user.coins * (settings?.coinToBDTRate || 0.015)).toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-emerald-400 transition"
          >
            {language === 'bn' ? 'বাং' : 'EN'}
          </button>
        </div>
      </div>

      {/* Demo Mode Badge / Notice if active */}
      {settings?.isDemoMode && !isWatchTab && (
        <div className="mt-2 py-0.5 px-2 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 rounded border border-cyan-500/30 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-semibold">
              {language === 'bn' ? 'ডেমো মোড সক্রিয়: বিকাশ ও নগদ ক্যাশআউট সিমুলেশন' : 'DEMO MODE: Simulated Ad & BD Payouts'}
            </span>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded hover:bg-cyan-500/30 transition flex items-center gap-0.5"
            >
              <Shield className="w-3 h-3" /> Admin
            </button>
          )}
        </div>
      )}
    </header>
  );
};
