import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  Lock, 
  HelpCircle, 
  Globe, 
  Coins, 
  Eye,
  Tv,
  Check,
  Smartphone,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Wallet,
  Users,
  Star,
  Zap,
  Clock,
  Shield,
  Layers,
  ArrowUpRight,
  Headphones,
  Gift,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { LegalPolicyModal, PolicyTab } from '../Legal/LegalPolicyModal';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { loginDemo } = useAuth();
  const { setActiveTab, showToast, triggerConfetti } = useApp();
  const [guestLoading, setGuestLoading] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<PolicyTab>('privacy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Earnings Calculator State
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [selectedTasks, setSelectedTasks] = useState<{
    videos: boolean;
    offerwalls: boolean;
    spin: boolean;
    referrals: boolean;
  }>({
    videos: true,
    offerwalls: true,
    spin: true,
    referrals: false
  });

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleOpenLegal = (tab: PolicyTab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleEnterAuditorPreview = async () => {
    setGuestLoading(true);
    try {
      await loginDemo();
      soundService.playSuccessFanfare();
      triggerConfetti();
      showToast('Auditor / Preview Mode Active!', 'Explore all offerwalls, video feeds, and earning features.', 'success');
    } catch (e: any) {
      console.error(e);
    } finally {
      setGuestLoading(false);
    }
  };

  // Calculator logic
  const calculateEstimatedEarnings = () => {
    let coinsPerDay = 0;
    // Videos: approx 60 coins per 10 mins
    if (selectedTasks.videos) {
      coinsPerDay += Math.round((dailyMinutes / 10) * 60);
    }
    // Offerwalls: approx 250 coins per 20 mins of focus
    if (selectedTasks.offerwalls) {
      coinsPerDay += Math.round((dailyMinutes / 20) * 250);
    }
    // Spin & Daily streak: 40 coins/day
    if (selectedTasks.spin) {
      coinsPerDay += 45;
    }
    // Referral passive: 120 coins/day
    if (selectedTasks.referrals) {
      coinsPerDay += 150;
    }

    const rate = 0.015; // 1000 coins = 15 BDT
    const dailyBdt = (coinsPerDay * rate).toFixed(1);
    const monthlyBdt = Math.round(coinsPerDay * rate * 30);

    return { coinsPerDay, dailyBdt, monthlyBdt };
  };

  const { coinsPerDay, dailyBdt, monthlyBdt } = calculateEstimatedEarnings();

  const toggleTask = (taskKey: keyof typeof selectedTasks) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const faqItems = [
    {
      q: 'Watch & Earn BD-তে অ্যাকাউন্ট তৈরি করতে কোনো টাকা লাগে কি?',
      a: 'একদমই না! এখানে অ্যাকাউন্ট তৈরি ও কাজ করা সম্পূর্ণ ১০০% বিনামূল্যে (Free)। কোনো ধরনের ডিপোজিট, ফি বা অগ্রিম টাকার প্রয়োজন নেই।'
    },
    {
      q: 'বিকাশ বা নগদে টাকা তুলতে কত সময় লাগে?',
      a: 'আমাদের স্বয়ংক্রিয় ভেরিফাইড সিস্টেমে রিকোয়েস্ট সাবমিট করার পর সাধারণত ৫ মিনিট থেকে সর্বোচ্চ ২ ঘণ্টার মধ্যে আপনার বিকাশ, নগদ বা মোবাইল রিচার্জ নম্বরে টাকা পৌঁছে যায়।'
    },
    {
      q: 'অফারওয়াল (Offerwall.me, Lootly, TimeWall) কীভাবে কাজ করে?',
      a: 'আমরা অফিসিয়াল পাবলিশার হিসেবে আন্তর্জাতিক অফারওয়াল নেটওয়ার্কগুলোর সাথে যুক্ত। ইউজাররা সেখানে সহজ অ্যাপ ইনস্টল, কুইজ বা সার্ভে পূরণ করলে স্বয়ংক্রিয় পোস্টব্যাক (Postback) এর মাধ্যমে তাৎক্ষণিক আপনার অ্যাকাউন্টে কয়েন যোগ হয়।'
    },
    {
      q: 'ন্যূনতম কত টাকা হলে ক্যাশআউট করা যায়?',
      a: 'মাত্র ৩০ টাকা ব্যালেন্স হলেই যেকোনো মোবাইল সিমে সরাসরি রিচার্জ নেওয়া যায়। আর ১০০ টাকা হলেই সরাসরি বিকাশ বা নগদে টাকা উত্তোলন করা যায়।'
    },
    {
      q: 'ভিপিএন (VPN) ব্যবহার করা যাবে কি?',
      a: 'আন্তর্জাতিক অফারওয়াল পলিসি অনুযায়ী অরিজিনাল বাংলাদেশ আইপি (IP) দিয়ে কাজ করা আবশ্যক। ফেক ভিপিএন বা প্রক্সি ব্যবহার করলে অফারওয়াল সিস্টেমে অ্যাকাউন্ট ব্লক হতে পারে, তাই সাধারণ ডাটা বা ওয়াইফাই দিয়ে কাজ করাই সেরা।'
    }
  ];

  const recentPayouts = [
    { name: 'আরিফুল ইসলাম', district: 'মিরপুর, ঢাকা', method: 'বিকাশ', amount: '৳৫০০', time: '২ মিনিট আগে', avatar: '👨‍💼' },
    { name: 'তানিয়া আক্তার', district: 'কুমিল্লা সদর', method: 'নগদ', amount: '৳২৫০', time: '৫ মিনিট আগে', avatar: '👩‍💻' },
    { name: 'মেহেদী হাসান', district: 'সিলেট', method: 'রিচার্জ', amount: '৳৫০', time: '৮ মিনিট আগে', avatar: '👨‍🎓' },
    { name: 'সাকিব চৌধুরী', district: 'চট্টগ্রাম', method: 'বিকাশ', amount: '৳১,২০০', time: '১২ মিনিট আগে', avatar: '👨‍💻' },
    { name: 'নাজমুল আলম', district: 'রাজশাহী', method: 'নগদ', amount: '৳৩৫০', time: '১৫ মিনিট আগে', avatar: '🧑‍🦱' },
    { name: 'সুমাইয়া জাহান', district: 'খুলনা', method: 'বিকাশ', amount: '৳৮০০', time: '১৮ মিনিট আগে', avatar: '👩‍🎓' }
  ];

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-['Hind_Siliguri','Outfit',sans-serif]">
      {/* 🌟 Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#05070B]/90 backdrop-blur-md border-b border-white/10 px-4 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#070A11] rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-base">
                ▶
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-wide text-white">
                  WATCH & EARN BD
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded">
                  🇧🇩 ভেরিফায়েড
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                বাংলাদেশের প্রিমিয়াম রিওয়ার্ড ও ভিডিও মনিটাইজেশন পোর্টাল
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">ফিচারসমূহ</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">কীভাবে কাজ করে</a>
            <a href="#offerwalls" className="hover:text-emerald-400 transition-colors">অফারওয়াল পার্টনার্স</a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">আয় ক্যালকুলেটর</a>
            <a href="#payouts" className="hover:text-emerald-400 transition-colors">পেমেন্ট প্রুফ</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">সাধারণ প্রশ্ন</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnterAuditorPreview}
              disabled={guestLoading}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-cyan-300 border border-cyan-500/40 transition shadow-sm hover:border-cyan-400 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{guestLoading ? '...' : 'সরাসরি প্রবেশ'}</span>
            </button>

            <button
              data-no-popunder="true"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuth();
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5 no-popunder"
            >
              <span>লগইন / সাইন আপ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2.5 px-2 pb-2 text-sm font-medium text-slate-200 bg-[#070A11] rounded-2xl p-4">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 hover:bg-slate-800/80 rounded-xl"
            >
              ✨ ফিচারসমূহ
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 hover:bg-slate-800/80 rounded-xl"
            >
              🚀 কীভাবে কাজ করে
            </a>
            <a 
              href="#offerwalls" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 hover:bg-slate-800/80 rounded-xl"
            >
              🎯 অফারওয়াল হাব
            </a>
            <a 
              href="#calculator" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 hover:bg-slate-800/80 rounded-xl"
            >
              🧮 আয় ক্যালকুলেটর
            </a>
            <a 
              href="#payouts" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 hover:bg-slate-800/80 rounded-xl"
            >
              💰 পেমেন্ট প্রুফ ও হিস্ট্রি
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-2 hover:bg-slate-800/80 rounded-xl"
            >
              ❓ সাধারণ প্রশ্ন
            </a>
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleEnterAuditorPreview();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>গেস্ট / অডিটর ডেমো দেখুন</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-16 lg:space-y-24">
        {/* 🚀 Hero Section */}
        <section className="relative pt-10 pb-8 px-4 overflow-hidden">
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            {/* Trust Pill Kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-400">১০০% ফ্রি প্ল্যাটফর্ম</span>
              <span className="text-slate-500">·</span>
              <span>কোনো ডিপোজিট বা ইনভেস্টমেন্ট প্রয়োজন নেই 🇧🇩</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] max-w-4xl mx-auto">
              ভিডিও দেখুন, অফার ও সার্ভে করুন — <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                বিকাশ ও নগদে সরাসরি টাকা নিন
              </span>
            </h1>

            {/* Subtitle Prose */}
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
              Watch & Earn BD হলো বাংলাদেশের নির্ভরযোগ্য ভিডিও এন্টারটেইনমেন্ট ও গ্লোবাল অফারওয়াল রিওয়ার্ড নেটওয়ার্ক। প্রতিদিন অবসর সময়ে ৫-১০ মিনিট কাজ করে ঘরে বসেই স্বচ্ছভাবে আয় করুন।
            </p>

            {/* Dual Hero Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <button
                data-no-popunder="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAuth();
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer no-popunder"
              >
                <span>ফ্রি অ্যাকাউন্ট খুলুন (+১০০ কয়েন বোনাস)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleEnterAuditorPreview}
                disabled={guestLoading}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>{guestLoading ? 'লোডিং...' : 'সরাসরি অ্যাপে প্রবেশ ও ভিডিও দেখুন 🚀'}</span>
              </button>
            </div>

            {/* ✈️ Telegram Community Trust Link */}
            <div className="flex items-center justify-center pt-1">
              <a
                href="https://t.me/+EarnWatchBD"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold transition hover:border-sky-400 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>✈️ অফিসিয়াল টেলিগ্রাম পেমেন্ট প্রুফ চ্যানেল (১২,৫০০+ মেম্বার)</span>
                <span className="text-[10px] text-sky-400 font-mono">জয়েন করুন ➔</span>
              </a>
            </div>

            {/* Trust Stat Ticker Bar */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-['Outfit'] block">
                  ৳১২,৮০,০০০+
                </span>
                <span className="text-xs text-slate-400 font-medium">মোট ক্যাশআউট পরিশোধিত</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <span className="text-xl sm:text-2xl font-black text-cyan-400 font-['Outfit'] block">
                  ৫২,০০০+
                </span>
                <span className="text-xs text-slate-400 font-medium">সক্রিয় বাংলাদেশি ইউজার</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-['Outfit'] block">
                  ৪.৯ / ৫.০ ★
                </span>
                <span className="text-xs text-slate-400 font-medium">ব্যবহারকারী সন্তুষ্টি রেটিং</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
                <span className="text-xl sm:text-2xl font-black text-rose-400 font-['Outfit'] block">
                  ৫-৩০ মিনিট
                </span>
                <span className="text-xs text-slate-400 font-medium">গড় বিকাশ/নগদ পেমেন্ট সময়</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🔴 Live Payment Ticker Ribbon */}
        <section className="border-y border-slate-800/80 bg-slate-950/60 py-3 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>লাইভ ক্যাশআউট প্রুফ</span>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar text-xs text-slate-300">
              {recentPayouts.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0 py-0.5">
                  <span className="text-sm">{item.avatar}</span>
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-slate-400">({item.district})</span>
                  <span className="text-emerald-400 font-bold">{item.amount}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                    {item.method}
                  </span>
                  <span className="text-slate-400 text-[11px]">· {item.time}</span>
                  <span className="text-slate-700 ml-2">|</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🚀 Section 1: How It Works (৩টি সহজ ধাপ) */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              সহজ ও দ্রুত পদ্ধতি
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              মাত্র ৩টি পদক্ষেপে আয় শুরু করুন
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              কোনো জটিলতা নেই। আপনার স্মার্টফোন অথবা কম্পিউটার থেকে যেকোনো সময় শুরু করতে পারবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg font-['Outfit']">
                01
              </div>
              <h3 className="text-base font-bold text-white">১ ক্লিকে অ্যাকাউন্ট খুলুন</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                গুগল অথবা ইমেইল দিয়ে মাত্র ৩০ সেকেন্ডে রেজিস্ট্রেশন করুন। কোনো গোপন ফি নেই এবং একাউন্ট খুলেই সাথে সাথে ১০০ কয়েন ফ্রি বোনাস পান।
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>তাত্ক্ষণিক সক্রিয়করণ</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-lg font-['Outfit']">
                02
              </div>
              <h3 className="text-base font-bold text-white">ভিডিও দেখুন ও টাস্ক করুন</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                জনপ্রিয় বিনোদনমূলক শর্ট ভিডিও দেখুন, অফারওয়াল (Offerwall.me, Lootly) থেকে সহজ অ্যাপ বা সার্ভে পূরণ করুন এবং লাকি স্পিন ঘুরিয়ে পয়েন্ট সংগ্রহ করুন।
              </p>
              <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>স্বয়ংক্রিয় কয়েন কাউন্ট</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative space-y-4 hover:border-slate-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg font-['Outfit']">
                03
              </div>
              <h3 className="text-base font-bold text-white">বিকাশ ও নগদে টাকা নিন</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                পয়েন্ট জমলে সরাসরি আপনার বিকাশ, নগদ, রকেট অথবা মোবাইল রিচার্জ নম্বরে ক্যাশআউট রিকোয়েস্ট দিন। ৫ থেকে ৩০ মিনিটে টাকা আপনার হাতে।
              </p>
              <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>স্বচ্ছ ও নিরাপদ পেমেন্ট</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🧮 Section 2: Interactive Earnings Calculator (আয় ক্যালকুলেটর) */}
        <section id="calculator" className="max-w-4xl mx-auto px-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#09111E] via-[#0B1527] to-[#070D18] border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  লাইভ প্রিভিউ ক্যালকুলেটর
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  আপনি প্রতিদিন কত টাকা আয় করতে পারবেন?
                </h2>
              </div>
              <div className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold self-start sm:self-auto">
                ১,০০০ কয়েন = ১৫ টাকা
              </div>
            </div>

            {/* Slider: Daily Minutes */}
            <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">প্রতিদিন কত সময় ব্যয় করতে চান?</span>
                <span className="text-emerald-400 font-black font-['Outfit'] text-sm">
                  {dailyMinutes} মিনিট
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>১০ মিনিট</span>
                <span>৩০ মিনিট</span>
                <span>১ ঘণ্টা</span>
                <span>২ ঘণ্টা</span>
              </div>
            </div>

            {/* Activity Toggles */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 font-bold block">
                কোন কোন কাজে অংশ নিতে চান? (সিলেক্ট করুন):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleTask('videos')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedTasks.videos
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>📺 ভিডিও দেখা</span>
                  <span>{selectedTasks.videos ? '✓' : '+'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTask('offerwalls')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedTasks.offerwalls
                      ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>🎯 অফারওয়াল</span>
                  <span>{selectedTasks.offerwalls ? '✓' : '+'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTask('spin')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedTasks.spin
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>🎡 স্পিন ও স্ট্রিক</span>
                  <span>{selectedTasks.spin ? '✓' : '+'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTask('referrals')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    selectedTasks.referrals
                      ? 'bg-purple-500/15 border-purple-500/60 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>👥 রেফারেল</span>
                  <span>{selectedTasks.referrals ? '✓' : '+'}</span>
                </button>
              </div>
            </div>

            {/* Calculated Earnings Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">দৈনিক সম্ভাব্য কয়েন</span>
                <span className="text-xl font-black text-amber-400 font-['Outfit'] mt-0.5 block">
                  ~{coinsPerDay.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">কয়েন / দিন</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">দৈনিক আনুমানিক টাকা</span>
                <span className="text-xl font-black text-emerald-400 font-['Outfit'] mt-0.5 block">
                  ৳{dailyBdt}
                </span>
                <span className="text-[10px] text-slate-400">টাকা / দিন</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/40 text-center">
                <span className="text-[11px] text-emerald-300 font-bold block">মাসিক আনুমানিক আয়</span>
                <span className="text-2xl font-black text-white font-['Outfit'] mt-0.5 block">
                  ৳{monthlyBdt.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-300/80">পকেট মানি ও মোবাইল খরচ</span>
              </div>
            </div>

            {/* CTA inside calculator */}
            <div className="pt-2 text-center">
              <button
                data-no-popunder="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAuth();
                }}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer no-popunder"
              >
                <span>এই আয় শুরু করতে একাউন্ট খুলুন ➔</span>
              </button>
            </div>
          </div>
        </section>

        {/* 🌟 Section 3: Core Features (আয়ের প্রধান ৪টি মাধ্যম) */}
        <section id="features" className="max-w-5xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
              আয়ের সুযোগসমূহ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Watch & Earn BD এর ৪টি আকর্ষণীয় ফিচার
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              শুধুমাত্র একটি কাজে সীমাবদ্ধ নয়, আপনার পছন্দের যেকোনো মাধ্যমে সহজেই পয়েন্ট অর্জন করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Tv className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">১. শর্ট ভিডিও ও এন্টারটেইনমেন্ট স্ট্রিম</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                বাংলা নাটক, কমেডি ভিডিও, ক্রিকেট হাইলাইটস এবং শিক্ষণীয় শর্টস দেখুন। প্রতি ৪ মিনিট ভিডিও দেখার পর স্পন্সর বিজ্ঞাপন দেখলে ৫০ কয়েন বোনাস পাওয়া যায়।
              </p>
              <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <span>বিনোদন ও আয় একসাথে</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">২. অফারওয়াল ও পেইড সার্ভে হাব</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Offerwall.me, Lootly Fun, TimeWall এবং CPX Research এর মাধ্যমে আন্তর্জাতিক সার্ভে ও মাইক্রো-টাস্ক সম্পন্ন করুন। প্রতিটি টাস্কে ৫০ থেকে ৫০০ কয়েন পর্যন্ত আয় হয়।
              </p>
              <div className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                <span>অটোমেটিক পোস্টব্যাক যুক্ত</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">৩. লাকি স্পিন ও ৭ দিনের ডেইলি স্ট্রিক</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                প্রতিদিন অ্যাপে লগইন করলেই পাচ্ছেন নিশ্চিত ডেইলি চেক-ইন বোনাস এবং লাকি হুইল স্পিন করার সুযোগ, যেখানে ১০০ কয়েন পর্যন্ত জ্যাকপট জেতার সুযোগ থাকে।
              </p>
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <span>প্রতিদিন ফ্রি রিওয়ার্ড</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">৪. আনলিমিটেড ফ্রেন্ড রেফারেল প্রোগ্রাম</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনার রেফারেল লিংক বন্ধুদের সাথে শেয়ার করুন। প্রতিটি সফল রেফারেলের জন্য আপনি পাবেন ১০০ কয়েন বোনাস এবং আজীবন তাদের আয়ের ১০% এক্সট্রা কমিশন।
              </p>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span>প্যাসিভ ইনকাম অপরচুনিটি</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🎯 Section 4: Integrated Offerwalls & Partner Networks */}
        <section id="offerwalls" className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  অফিসিয়াল পাবলিশার পার্টনারশিপ
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  ইন্টিগ্রেটেড গ্লোবাল অফারওয়াল ও অ্যাড নেটওয়ার্ক
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold self-start sm:self-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>পোস্টব্যাক লাইভ ও অ্যাক্টিভ</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 transition">
                <span className="text-base font-black text-cyan-400 font-mono block">Offerwall.me</span>
                <span className="text-[11px] text-slate-300 font-medium mt-1 block">HMAC-SHA256 Signed</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Active Integration</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-400 transition">
                <span className="text-base font-black text-purple-400 font-mono block">Lootly Fun</span>
                <span className="text-[11px] text-slate-300 font-medium mt-1 block">Surveys & Apps</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Active Integration</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 transition">
                <span className="text-base font-black text-amber-400 font-mono block">TimeWall</span>
                <span className="text-[11px] text-slate-300 font-medium mt-1 block">Clicks & Microtasks</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Policy Compliant</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 hover:border-teal-400 transition">
                <span className="text-base font-black text-teal-400 font-mono block">CPX Research</span>
                <span className="text-[11px] text-slate-300 font-medium mt-1 block">High Paying Surveys</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Instant Coins</span>
              </div>
            </div>

            {/* Auditor review banner inside offerwall */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-blue-300 flex items-center justify-center sm:justify-start gap-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>TimeWall, BitLabs & Ad Network Reviewers / Auditors:</span>
                </span>
                <p className="text-xs text-slate-300">
                  You can inspect the entire app, task flow, subid tracking, and video feed without creating an account by clicking Auditor Demo.
                </p>
              </div>
              <button
                onClick={handleEnterAuditorPreview}
                disabled={guestLoading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition shrink-0 cursor-pointer"
              >
                {guestLoading ? 'Loading...' : 'Open Auditor Demo 👁️'}
              </button>
            </div>
          </div>
        </section>

        {/* 💳 Section 5: Payment Gateways (পেমেন্ট চ্যানেল) */}
        <section id="payouts" className="max-w-5xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              সহজ ও দ্রুত ক্যাশআউট
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              বিকাশ, নগদ ও মোবাইল রিচার্জে ইনস্ট্যান্ট টাকা
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              কোনো জটিল ক্রিপ্টোকারেন্সি বা পেপ্যাল নয়, সরাসরি বাংলাদেশি মোবাইল ওয়ালেটে টাকা পৌঁছে যায়।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            {/* bKash */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#2A0815] to-[#14060C] border border-pink-500/40 space-y-2 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 text-xl font-bold">
                ৳
              </div>
              <h3 className="text-base font-extrabold text-white">বিকাশ (bKash)</h3>
              <p className="text-xs text-pink-300 font-semibold">মিনিমাম ক্যাশআউট ৳১০০</p>
              <p className="text-[11px] text-slate-400">ব্যক্তিগত বিকাশ নম্বরে সরাসরি সেন্ড মানি</p>
            </div>

            {/* Nagad */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#2B1408] to-[#140A06] border border-orange-500/40 space-y-2 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-xl font-bold">
                ৳
              </div>
              <h3 className="text-base font-extrabold text-white">নগদ (Nagad)</h3>
              <p className="text-xs text-orange-300 font-semibold">মিনিমাম ক্যাশআউট ৳১০০</p>
              <p className="text-[11px] text-slate-400">দ্রুত ও নির্ভরযোগ্য নগদ ওয়ালেট ক্যাশআউট</p>
            </div>

            {/* Rocket */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1C0E2B] to-[#0D0814] border border-purple-500/40 space-y-2 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xl font-bold">
                ৳
              </div>
              <h3 className="text-base font-extrabold text-white">রকেট (Rocket)</h3>
              <p className="text-xs text-purple-300 font-semibold">মিনিমাম ক্যাশআউট ৳১০০</p>
              <p className="text-[11px] text-slate-400">ডাচ-বাংলা ব্যাংক রকেট একাউন্ট সাপোর্ট</p>
            </div>

            {/* Mobile Recharge */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#082218] to-[#05120D] border border-emerald-500/40 space-y-2 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl font-bold">
                📱
              </div>
              <h3 className="text-base font-extrabold text-white">মোবাইল রিচার্জ</h3>
              <p className="text-xs text-emerald-300 font-semibold">মিনিমাম মাত্র ৳৩০</p>
              <p className="text-[11px] text-slate-400">GP, Robi, BL, Airtel ও Teletalk সাপোর্ট</p>
            </div>
          </div>
        </section>

        {/* 💬 Section 6: Real User Reviews & Testimonials */}
        <section className="max-w-5xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              বাস্তব অভিজ্ঞতা
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              আমাদের সফল ব্যবহারকারীরা কী বলছেন?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                “আমি প্রতিদিন ভার্সিটি যাওয়া-আসার সময় বাসে বসে ১০-১৫ মিনিট ভিডিও দেখি আর অফারওয়ালের কাজ করি। গত মাসে বিকাশে ৮৫০ টাকা তুলেছি। ছাত্রদের জন্য খুবই চমৎকার একটি প্ল্যাটফর্ম!”
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5">
                <span className="text-2xl">👨‍🎓</span>
                <div>
                  <h4 className="text-xs font-bold text-white">রাকিবুল হাসান</h4>
                  <span className="text-[10px] text-slate-400">মিরপুর, ঢাকা</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                “সবচেয়ে ভালো লেগেছে এদের পেমেন্ট স্পিড। সকালে ক্যাশআউট রিকোয়েস্ট দিয়েছিলাম, মাত্র ২০ মিনিটের মধ্যে নগদে টাকা চলে এসেছে। কোনো ঝামেলা বা মিথ্যা কথা নেই।”
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5">
                <span className="text-2xl">👩‍💼</span>
                <div>
                  <h4 className="text-xs font-bold text-white">নুসরাত জাহান</h4>
                  <span className="text-[10px] text-slate-400">জিইসি মোড়, চট্টগ্রাম</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                “অফারওয়াল ও স্পিনের কয়েন সরাসরি জমা হয়। কোনো ফেক রিওয়ার্ড নেই। আমি বন্ধুদের ইনভাইট করে রেফারেল থেকেও চমৎকার কমিশন পাচ্ছি। সবাইকে কাজ করার অনুরোধ রইলো।”
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2.5">
                <span className="text-2xl">👨‍💻</span>
                <div>
                  <h4 className="text-xs font-bold text-white">তন্ময় কর্মকার</h4>
                  <span className="text-[10px] text-slate-400">আম্বরখানা, সিলেট</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ❓ Section 7: FAQ Accordion (সাধারণ প্রশ্ন) */}
        <section id="faq" className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
              প্রশ্ন ও উত্তর
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-300 transition cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 🌟 Final Registration Call to Action */}
        <section className="max-w-5xl mx-auto px-4 pb-4">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>১০০ কয়েন ফ্রি রেজিস্ট্রেশন বোনাস</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white max-w-2xl mx-auto leading-snug">
              আজই শুরু করুন এবং প্রতিদিন ভিডিও দেখে ও অফার করে নিশ্চিত আয় করুন
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              কোনো ইনভেস্টমেন্ট ছাড়াই শুরু করুন। অবসর সময়কে রূপান্তর করুন নগদ অর্থে।
            </p>

            <div className="pt-2">
              <button
                data-no-popunder="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAuth();
                }}
                className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer no-popunder"
              >
                <span>একাউন্ট তৈরি করুন / লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 📜 Professional Footer with Compliance Links */}
      <footer className="border-t border-slate-800/80 bg-slate-950 mt-16 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  ▶
                </div>
                <span className="font-extrabold text-sm text-white">WATCH & EARN BD</span>
              </div>
              <p className="text-slate-400 leading-relaxed pr-6 text-[11px]">
                Watch & Earn BD হলো বাংলাদেশের বিশ্বস্ত ও স্বচ্ছ ডিজিটাল রিওয়ার্ড পোর্টাল। আমরা আন্তর্জাতিক অ্যাড নেটওয়ার্ক এবং ভেরিফাইড অফারওয়ালের সাথে অংশীদারিত্বের মাধ্যমে ব্যবহারকারীদের রিওয়ার্ড প্রদান করে থাকি।
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[11px]">আইনি ও নীতিমালা</span>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>
                  <button onClick={() => handleOpenLegal('privacy')} className="hover:text-emerald-400 cursor-pointer">
                    Privacy Policy (গোপনীয়তা নীতি)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegal('terms')} className="hover:text-emerald-400 cursor-pointer">
                    Terms of Service (ব্যবহারের শর্ত)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegal('fraud')} className="hover:text-emerald-400 cursor-pointer">
                    Anti-Fraud Rules (জালিয়াতি প্রতিরোধ)
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[11px]">যোগাযোগ ও সহায়তা</span>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>
                  <button onClick={() => handleOpenLegal('support')} className="hover:text-emerald-400 cursor-pointer">
                    Help Center & Support
                  </button>
                </li>
                <li>
                  <span className="text-slate-400">Telegram: @watchearnbd_support</span>
                </li>
                <li>
                  <span className="text-slate-400">Email: support@watch-and-earn.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2026 Watch & Earn BD (watch-and-earn-bd). সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex items-center gap-4">
              <span>Postback API: <code className="text-emerald-400 font-mono">200 OK Active</code></span>
              <span>Made with ❤️ for Bangladesh 🇧🇩</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal & Policy Modal */}
      <LegalPolicyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
};
