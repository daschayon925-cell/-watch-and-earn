import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Flame, 
  Tv, 
  Wallet, 
  Share2, 
  Zap, 
  Award, 
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Clock,
  Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';

export const WorkEngagementHub: React.FC<{
  onOpenOfferwall: () => void;
  onOpenWatch: () => void;
  onOpenSpin: () => void;
}> = ({ onOpenOfferwall, onOpenWatch, onOpenSpin }) => {
  const { user, refreshUser } = useAuth();
  const { language, setActiveTab, showToast, triggerConfetti, settings } = useApp();
  
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const isCheckedInToday = user?.lastCheckInDate === new Date().toISOString().split('T')[0];
  const videosWatched = user?.todayVideosCount || 0;
  const adClicks = user?.adClicksToday || 0;

  // Telegram Link (can come from admin settings or official default)
  const telegramUrl = 'https://t.me/+EarnWatchBD';

  // WhatsApp share link
  const refCode = user?.referralCode || 'BD7788';
  const shareText = encodeURIComponent(
    `🔥 ঘরে বসে মোবাইল দিয়ে ভিডিও দেখে ও সহজ কাজ করে প্রতিদিন ২০০-৫০০ টাকা আয় করুন! বিকাশ ও নগদে সরাসরি পেমেন্ট।\n\nআমার রেফারেল কোড: ${refCode}\nএখনই জয়েন করুন:`
  );
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://watchearnbd.com';
  const whatsappLink = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`;

  // Mission completion count
  const mission1Done = videosWatched >= 3;
  const mission2Done = isCheckedInToday;
  const mission3Done = (user?.todayCoins || 0) >= 30;
  const completedMissionsCount = [mission1Done, mission2Done, mission3Done].filter(Boolean).length;

  const stepsGuide = [
    {
      title: '১. দৈনিক চেক-ইন ও স্পিন হুইল',
      desc: 'প্রতিদিন অ্যাপে প্রবেশ করে সবার আগে "ডেইলি চেক-ইন" থেকে ২৫ কয়েন এবং "স্পিন হুইল" ঘুরিয়ে ফ্রি উপহার সংগ্রহ করুন।',
      icon: '🎁',
      actionLabel: 'স্পিন হুইল খুলুন',
      action: onOpenSpin
    },
    {
      title: '২. শর্টস ও রিলস ভিডিও দেখা',
      desc: 'ভিডিও ট্যাবে গিয়ে ট্রেন্ডিং শর্টস ও বিনোদনমূলক ভিডিও দেখুন। ভিডিও শেষ হলে স্বয়ংক্রিয়ভাবে পয়েন্ট আপনার ওয়ালেটে জমা হবে।',
      icon: '▶️',
      actionLabel: 'ভিডিও দেখা শুরু করুন',
      action: onOpenWatch
    },
    {
      title: '৩. অফারওয়াল হাব (সবচেয়ে বেশি আয় 🔥)',
      desc: 'পছন্দের সহজ অ্যাপ টেস্ট, কুইজ বা সার্ভে পূরণ করে প্রতিটি টাস্কে ১২০ থেকে ১,০০০ কয়েন পর্যন্ত বড় আয় করুন।',
      icon: '🚀',
      actionLabel: 'অফারওয়াল হাবে যান',
      action: onOpenOfferwall
    },
    {
      title: '৪. বিকাশ / নগদ / রিচার্জে টাকা তোলা',
      desc: 'আপনার অ্যাকাউন্টে নির্ধারিত কয়েন হলেই ওয়ালেট থেকে বিকাশ, নগদ বা মোবাইল রিচার্জে উইথড্র দিন। ৫ থেকে ৩০ মিনিটের মধ্যে পেমেন্ট সম্পন্ন হবে।',
      icon: '💸',
      actionLabel: 'ওয়ালেট দেখুন',
      action: () => setActiveTab('wallet')
    },
    {
      title: '৫. বন্ধুদের আমন্ত্রণ জানিয়ে লাইফটাইম কমিশন',
      desc: 'বন্ধুদের সাথে আপনার রেফারেল কোড শেয়ার করুন। বন্ধু জয়েন করলেই ৫০ কয়েন বোনাস পাবেন এবং তার আয়ের থেকে অতিরিক্ত কমিশন পাবেন।',
      icon: '👥',
      actionLabel: 'রেফার পেজে যান',
      action: () => setActiveTab('rewards')
    }
  ];

  return (
    <div className="space-y-4">
      {/* 🔰 ১. "কীভাবে কাজ করবেন ও টাকা তুলবেন?" হাইলাইট কার্ড */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1527] via-[#0D1E36] to-[#0A1224] border-2 border-cyan-500/50 p-4 sm:p-5 shadow-xl shadow-cyan-950/40">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
              <span>নতুনদের স্পেশাল গাইড · ১০০% ফ্রি</span>
            </span>
            <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
              ৫টি সহজ ধাপ
            </span>
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-black text-white leading-snug flex items-center gap-1.5">
              <span>🔰 কীভাবে কাজ করবেন ও বিকাশ/নগদে টাকা তুলবেন?</span>
            </h3>
            <p className="text-xs text-cyan-100/90 mt-1 leading-relaxed">
              সঠিক নিয়মে কাজ করলে প্রতিদিন নিশ্চিত আয় হবে! কোন কাজে কত আয় এবং কীভাবে ৫ মিনিটে পেমেন্ট পাবেন তার বিস্তারিত দেখে নিন।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <button
              onClick={() => {
                setShowGuideModal(true);
                soundService.playTap();
              }}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 stroke-[2.5]" />
              <span>কাজের সম্পূর্ণ নিয়ম দেখুন</span>
            </button>

            <button
              onClick={() => {
                onOpenOfferwall();
                soundService.playTap();
              }}
              className="py-2.5 px-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <span>বেশি আয়ের কাজ শুরু ➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* ✈️ ২. অফিশিয়াল টেলিগ্রাম চ্যানেল ও পেমেন্ট প্রুফ গ্রুপ (সবচেয়ে বড় ভরসা) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#08182B] via-[#0E2A4D] to-[#0A1B30] border-2 border-sky-500/60 p-4 sm:p-5 shadow-xl shadow-sky-950/40">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-sm">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                  লাইভ কমিউনিটি ও সাপোর্ট
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  অফিশিয়াল টেলিগ্রাম চ্যানেল ও পেমেন্ট গ্রুপ
                </h4>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-extrabold text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ১২,৫০০+ মেম্বার
            </span>
          </div>

          <p className="text-xs text-sky-100/90 leading-relaxed font-sans">
            আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন—প্রতিদিন শত শত ইউজারের <strong className="text-emerald-300">বিকাশ ও নগদ পেমেন্ট প্রুফ স্ক্রিনশট</strong>, প্রতিদিনের নতুন অফার এবং ২৪/৭ লাইভ অ্যাডমিন সাপোর্ট পান!
          </p>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                soundService.playSuccessFanfare();
                triggerConfetti();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>👉 টেলিগ্রাম চ্যানেলে জয়েন করুন (পেমেন্ট প্রুফ দেখুন)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* 🎯 ৩. আজকের ৩টি কাজের মিশন ও বোনাস (Daily Work Quest) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12111E] via-[#161226] to-[#0E0C18] border border-purple-500/40 p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black text-white tracking-wide">
              🎯 আজকের দৈনিক মিশন ({completedMissionsCount}/৩ সম্পন্ন)
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
            স্পেশাল +৫০ কয়েন বোনাস
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedMissionsCount / 3) * 100}%` }}
          />
        </div>

        {/* 3 Step Missions */}
        <div className="space-y-2 pt-1">
          {/* Mission 1 */}
          <div 
            onClick={onOpenWatch}
            className={`p-2.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
              mission1Done 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
                mission1Done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {mission1Done ? '✓' : '১'}
              </span>
              <div>
                <span className="text-xs font-bold text-white block">৩টি বিনোদন ভিডিও দেখুন</span>
                <span className="text-[10px] text-slate-400">প্রগ্রেস: {Math.min(3, videosWatched)}/৩ ভিডিও</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              +{3 * 25} 🪙
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>

          {/* Mission 2 */}
          <div 
            onClick={() => setActiveTab('rewards')}
            className={`p-2.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
              mission2Done 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
                mission2Done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {mission2Done ? '✓' : '২'}
              </span>
              <div>
                <span className="text-xs font-bold text-white block">দৈনিক চেক-ইন সম্পন্ন করুন</span>
                <span className="text-[10px] text-slate-400">{mission2Done ? 'আজকের চেক-ইন সমাপ্ত ✓' : 'ক্লিক করে চেক-ইন নিন'}</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              +২৫ 🪙
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>

          {/* Mission 3 */}
          <div 
            onClick={onOpenOfferwall}
            className={`p-2.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
              mission3Done 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold ${
                mission3Done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {mission3Done ? '✓' : '৩'}
              </span>
              <div>
                <span className="text-xs font-bold text-white block">অফারওয়াল বা কুইজে ৩০+ কয়েন আয় করুন</span>
                <span className="text-[10px] text-slate-400">আজকের আয়: {user?.todayCoins || 0}/৩০ কয়েন</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              +৫০ 🪙
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
        </div>

        {/* Claim Extra Bonus when all done */}
        {completedMissionsCount === 3 ? (
          <button
            onClick={() => {
              soundService.playSuccessFanfare();
              triggerConfetti();
              showToast('🎉 অভিনন্দন! আজকের সব মিশন সম্পন্ন করার বোনাস পেয়েছেন!', '', 'coin');
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>মিশন কমপ্লিট বোনাস গ্রহণ করুন (+৫০ কয়েন)</span>
          </button>
        ) : (
          <div className="text-center py-1">
            <span className="text-[10px] text-purple-300/80 font-medium">
              💡 ৩টি মিশন সম্পন্ন করলেই অতিরিক্ত ৫০ কয়েন অটোমেটিক অ্যাকাউন্টে যোগ হবে।
            </span>
          </div>
        )}
      </div>

      {/* 🛡️ ৪. ১০০% ট্রাস্ট ও পেমেন্ট নিশ্চয়তা কার্ড */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/40 space-y-2">
        <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>১০০% বিশ্বস্ত ও নিরাপদ প্ল্যাটফর্ম</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono border border-emerald-500/30">
            গ্যারান্টিযুক্ত
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-emerald-500/20">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>০ টাকা ডিপোজিট (সম্পূর্ণ ফ্রি)</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-emerald-500/20">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>বিকাশ/নগদে ৫-৩০ মিনিটে টাকা</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-emerald-500/20">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>স্বচ্ছ কয়েন রূপান্তর হার</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-emerald-500/20">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>২৪/৭ টেলিগ্রাম হেল্পলাইন</span>
          </div>
        </div>
      </div>

      {/* 👥 ৫. ১-ক্লিক হোয়াটসঅ্যাপে রেফার শেয়ার বাটন */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0C1F16] via-[#0E261B] to-[#0A1811] border border-emerald-600/40 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
            বন্ধুদের ইনভাইট করুন
          </span>
          <h4 className="text-xs font-black text-white">
            হোয়াটসঅ্যাপে শেয়ার করে ৫০ কয়েন বোনাস নিন
          </h4>
          <span className="text-[10px] text-slate-400 block font-mono">
            কোড: <strong className="text-amber-400 font-bold">{refCode}</strong>
          </span>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            soundService.playSuccessFanfare();
            triggerConfetti();
          }}
          className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>শেয়ার করুন</span>
        </a>
      </div>

      {/* 📚 কাজের নিয়ম বিস্তারিত গাইড মডাল (Interactive Guide Modal) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0F172A] via-[#0B1120] to-[#070B14] border border-cyan-500/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black">কাজের নিয়ম ও টাকা তোলার গাইড</h3>
                  <span className="text-[10px] text-cyan-200">৫টি সহজ ধাপে প্রতিদিন আয় করুন</span>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-xl bg-black/30 hover:bg-black/50 text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed">
                👋 <strong>স্বাগতম!</strong> এই প্ল্যাটফর্মে কাজ করার জন্য কোনো টাকা জমা দিতে হয় না। নিচে উল্লেখিত ৫টি ধাপে কাজ করে সহজেই বিকাশ ও নগদে টাকা নিতে পারবেন:
              </div>

              <div className="space-y-2.5">
                {stepsGuide.map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl">{step.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-white">{step.title}</h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowGuideModal(false);
                        step.action();
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 transition"
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Payment Proof Telegram CTA in Modal */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950 to-blue-950 border border-sky-500/40 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-sky-300 font-bold">সন্দেহ আছে? প্রুফ দেখুন!</span>
                  <h5 className="text-xs font-black text-white">টেলিগ্রামে সব পেমেন্ট স্ক্রিনশট দেখুন</h5>
                </div>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 font-black text-[11px] shrink-0"
                >
                  প্রুফ দেখুন ➔
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-[#070B14] flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                🔒 ১০০% নিরাপদ · কোনো ডিপোজিট লাগবে না
              </span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs"
              >
                বুঝেছি, কাজ শুরু করি ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
