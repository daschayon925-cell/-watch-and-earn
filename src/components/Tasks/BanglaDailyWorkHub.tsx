import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Wallet,
  TrendingUp,
  Flame,
  ShieldCheck,
  Globe,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Play,
  CheckSquare,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { AiTaskAssistantModal } from './AiTaskAssistantModal';

export interface VerifiedOfferwallPartner {
  id: string;
  title: string;
  category: string;
  description: string;
  payoutRange: string;
  coinRange: string;
  badge: string;
  icon: string;
  accentClass: string;
  buttonClass: string;
  getUrl: (uid: string, offerwallsConfig?: any) => string;
}

export const VERIFIED_PARTNER_WALLS: VerifiedOfferwallPartner[] = [
  {
    id: 'timewall',
    title: 'TimeWall মাইক্রো-টাস্ক, ক্লিক ও সার্ভে',
    category: 'অফিসিয়াল পার্টনার • ওয়েবসাইট ক্লিক ও মাইক্রো-টাস্ক ⏱️',
    description: 'ছোট ছোট ওয়েবসাইট ভিজিট, ক্লিক ও সার্ভে সম্পন্ন করে সরাসরি অটো-পোস্টব্যাকে কয়েন অর্জন করুন।',
    payoutRange: '৳২ – ৳১২০+',
    coinRange: '+১০০ – +৮,০০০ কয়েন',
    badge: 'সরাসরি পোস্টব্যাক ✅',
    icon: '⏱️',
    accentClass: 'from-blue-950 via-indigo-950 to-slate-900 border-blue-500/60',
    buttonClass: 'from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 text-slate-950 shadow-blue-500/30',
    getUrl: (uid, cfg) => {
      const oid = cfg?.timewallPlacementId?.trim() || '';
      const customUrl = cfg?.timewallUrl?.trim();
      if (customUrl && !customUrl.includes('d7521f148f92a2d3')) {
        return customUrl.includes('?')
          ? `${customUrl}&uid=${encodeURIComponent(uid)}`
          : `${customUrl}?uid=${encodeURIComponent(uid)}`;
      }
      return `https://timewall.io/users/login?oid=${encodeURIComponent(oid)}&uid=${encodeURIComponent(uid)}`;
    }
  },
  {
    id: 'gemk',
    title: 'Gemk গ্লোবাল অফার ও সার্ভে',
    category: 'অফিসিয়াল পার্টনার • গেম, অ্যাপ ও সার্ভে 💎',
    description: 'সহজ অ্যাপ, গেম ও সার্ভে সম্পন্ন করে সরাসরি অটো-পোস্টব্যাকে কয়েন অর্জন করুন।',
    payoutRange: '৳৩ – ৳১৫০+',
    coinRange: '+২০০ – +১০,০০০ কয়েন',
    badge: 'সরাসরি পোস্টব্যাক ✅',
    icon: '💎',
    accentClass: 'from-teal-950 via-emerald-950 to-slate-900 border-teal-500/60',
    buttonClass: 'from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 shadow-teal-500/30',
    getUrl: (uid, cfg) => {
      const customUrl = cfg?.gemkUrl?.trim() || '';
      if (customUrl) {
        if (customUrl.includes('{userid}')) return customUrl.replace(/\{userid\}/g, encodeURIComponent(uid));
        if (customUrl.includes('{user_id}')) return customUrl.replace(/\{user_id\}/g, encodeURIComponent(uid));
        return customUrl.includes('?')
          ? `${customUrl}&userid=${encodeURIComponent(uid)}`
          : `${customUrl}?userid=${encodeURIComponent(uid)}`;
      }
      const pid = cfg?.gemkPlacementId?.trim() || '';
      return `https://gemk.io/offerwall/${encodeURIComponent(pid)}?userid=${encodeURIComponent(uid)}`;
    }
  },
  {
    id: 'bitcotasks',
    title: 'BitcoTasks অল-ইন-ওয়ান ইনকাম হাব',
    category: 'অফিসিয়াল পার্টনার • সার্ভে, অফার ও পিটিসি ⚡',
    description: 'CPX পেইড সার্ভে, মোবাইল অ্যাপ ইনস্টল, গেম ও বিজ্ঞাপন দেখে সরাসরি অটো-পোস্টব্যাকে কয়েন আয় করুন।',
    payoutRange: '৳৩ – ৳১০০+',
    coinRange: '+২০০ – +৮,০০০ কয়েন',
    badge: 'সরাসরি পোস্টব্যাক ✅',
    icon: '🔥',
    accentClass: 'from-amber-950 via-orange-950 to-slate-900 border-amber-500/60',
    buttonClass: 'from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 shadow-orange-500/30',
    getUrl: (uid, cfg) => {
      const apiKey = cfg?.bitcotasksApiKey?.trim() || 'el15zv6b8o9kz3i9haq63pgtpdiivh';
      return `https://bitcotasks.com/offerwall/${encodeURIComponent(apiKey)}/${encodeURIComponent(uid)}`;
    }
  },
  {
    id: 'affmine',
    title: 'Affmine প্রিমিয়াম অ্যাপ, গেম ও অফার হাব',
    category: 'অফিসিয়াল পার্টনার #6741 • লাইভ অফারওয়াল 💎',
    description: 'মোবাইল অ্যাপ ডাউনলোড, ৩০ সেকেন্ড ওপেন ও গেম লেভেল পার করে সরাসরি সার্ভার-ভেরিফায়েড কয়েন নিন।',
    payoutRange: '৳৫ – ৳৯০+',
    coinRange: '+৩০০ – +৬,০০০ কয়েন',
    badge: 'সরাসরি পোস্টব্যাক ✅',
    icon: '💎',
    accentClass: 'from-emerald-950 via-teal-950 to-slate-900 border-emerald-500/60',
    buttonClass: 'from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30',
    getUrl: (uid, cfg) => {
      const wallCode = cfg?.affmineOfferwallCode?.trim() || 'ow_6aee0425704f4';
      return `https://affgo.xyz/offerwall/?o=${encodeURIComponent(wallCode)}&s1=${encodeURIComponent(uid)}`;
    }
  },
  {
    id: 'cpx',
    title: 'CPX Research আসল পেইড সার্ভে হাব',
    category: 'ভেরিফায়েড সার্ভে #36966 • মতামত ও কুইজ 📊',
    description: 'সহজ প্রশ্ন-উত্তর ও মতামত সার্ভে পূরণ করে ডলার ও কয়েন আয় করুন। প্রতি সফল সার্ভেতে অটো কয়েন যোগ হয়।',
    payoutRange: '৳২ – ৳৩৫+',
    coinRange: '+১৫০ – +২,৩০০ কয়েন',
    badge: 'রিয়েল সার্ভে 📊',
    icon: '📊',
    accentClass: 'from-cyan-950 via-slate-900 to-emerald-950 border-cyan-500/50',
    buttonClass: 'from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-cyan-500/25',
    getUrl: (uid, cfg) => {
      const appId = cfg?.cpxAppId?.trim() || '36966';
      return `https://offers.cpx-research.com/index.php?app_id=${encodeURIComponent(appId)}&ext_user_id=${encodeURIComponent(uid)}`;
    }
  },
  {
    id: 'offerwallme',
    title: 'Offerwall.me স্পেশাল অ্যাপ ও গেম হাব',
    category: 'অফিসিয়াল পার্টনার • সার্ভার-ভেরিফায়েড অফার 🎯',
    description: 'আন্তর্জাতিক মোবাইল গেম, অ্যাপ ট্রায়াল ও সাইন-আপ কাজ সম্পন্ন করে সরাসরি বড় কয়েন রিওয়ার্ড পান।',
    payoutRange: '৳৩ – ৳৭৫+',
    coinRange: '+২০০ – +৫,০০০ কয়েন',
    badge: 'সরাসরি পোস্টব্যাক ✅',
    icon: '🎯',
    accentClass: 'from-indigo-950 via-slate-900 to-emerald-950 border-indigo-500/50',
    buttonClass: 'from-indigo-400 to-cyan-400 hover:from-indigo-300 hover:to-cyan-300 text-slate-950 shadow-indigo-500/25',
    getUrl: (uid, cfg) => {
      const apiKey = cfg?.offerwallMeApiKey?.trim() || '6yHRmktW7Ouf75SHc826oSbiYGu06W';
      const customUrl = cfg?.offerwallMeUrl?.trim();
      if (customUrl) {
        return customUrl.includes('?')
          ? `${customUrl}&userId=${encodeURIComponent(uid)}`
          : `${customUrl}?userId=${encodeURIComponent(uid)}`;
      }
      return `https://offerwall.me/offerwall/${encodeURIComponent(apiKey)}/${encodeURIComponent(uid)}`;
    }
  },
  {
    id: 'lootly',
    title: 'Lootly গ্লোবাল অফারওয়াল (App #16)',
    category: 'অফিসিয়াল পার্টনার • গেম, অ্যাপ ও সার্ভে 🎁',
    description: 'মোবাইল অ্যাপ ও সার্ভে সম্পন্ন করে দ্রুত পয়েন্ট ও কয়েন অর্জন করুন। কাজ শেষ হলেই সার্ভার থেকে কয়েন পাবেন।',
    payoutRange: '৳২.৫০ – ৳৬০+',
    coinRange: '+২০০ – +৪,০০০ কয়েন',
    badge: 'সরাসরি পোস্টব্যাক ✅',
    icon: '🎁',
    accentClass: 'from-purple-950 via-slate-900 to-indigo-950 border-purple-500/50',
    buttonClass: 'from-purple-400 to-indigo-400 hover:from-purple-300 hover:to-indigo-300 text-slate-950 shadow-purple-500/25',
    getUrl: (uid, cfg) => {
      const key = cfg?.lootlyApiKey?.trim() || 'pj9b1buxrh05dt8eito0x8jxei21c3';
      return `https://offerwall.lootly.fun/offerwall/${encodeURIComponent(key)}/${encodeURIComponent(uid)}`;
    }
  },
  {
    id: 'zeydoo',
    title: 'Zeydoo গ্লোবাল স্মার্টলিঙ্ক ও সার্ভে',
    category: 'অফিসিয়াল পার্টনার • বাংলাদেশি মোবাইল অফার ⚡',
    description: 'বাংলাদেশি মোবাইল ও ওয়াইফাই ইউজারদের জন্য উপযোগী স্মার্ট সার্ভে ও ডিরেক্ট অফার।',
    payoutRange: '৳২ – ৳৪৫+',
    coinRange: '+১৫০ – +৩,০০০ কয়েন',
    badge: 'অটো পোস্টব্যাক ⚡',
    icon: '⚡',
    accentClass: 'from-blue-950 via-slate-900 to-cyan-950 border-blue-500/50',
    buttonClass: 'from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 text-slate-950 shadow-blue-500/25',
    getUrl: (uid, cfg) => {
      const zoneId = cfg?.zeydooZoneId?.trim() || '12138356';
      const customSmart = cfg?.zeydooSmartLinkUrl?.trim();
      if (customSmart) {
        return customSmart.includes('?')
          ? `${customSmart}&var=${encodeURIComponent(uid)}`
          : `${customSmart}?var=${encodeURIComponent(uid)}`;
      }
      return `https://zeydoo.com/link?z=${encodeURIComponent(zoneId)}&var=${encodeURIComponent(uid)}`;
    }
  }
];

// ==========================================
// 🌐 আন্তর্জাতিক আসল মাইক্রো-জব ও অফার প্ল্যাটফর্মসমূহ
// ==========================================
export const TOP_GLOBAL_PLATFORMS = [
  {
    id: 'timewall',
    name: 'TimeWall (টাইমওয়াল — মাইক্রো টাস্ক ও ক্লিক)',
    logo: '⏱️',
    taskTypes: 'ওয়েবসাইট ভিজিট, মাইক্রো টাস্ক, সার্ভে, সাইন-আপ ও ডাটা কাজ',
    payoutPerTask: '$০.০১ – $১.৫০ (৳১ – ৳১৮০+)',
    paymentMethods: 'সরাসরি Offerwall Postback / Crypto / Litecoin',
    url: 'https://timewall.io',
    guideBn: 'অ্যাডমিনদের জন্য সেরা আসল মাইক্রো-টাস্ক সাইট। আপনার সার্ভারে /api/postback/timewall ইতিমধ্যেই প্রস্তুত আছে।'
  },
  {
    id: 'clickworker',
    name: 'Clickworker (ক্লিকওয়ার্কার)',
    logo: '🤖',
    taskTypes: 'AI ট্রেইনিং (UHRS), টেক্সট তৈরি, ওয়েব রিসার্চ ও ডাটা এন্ট্রি',
    payoutPerTask: '€০.৫০ – €১০.০০ (৳৬৫ – ৳১,৩০০+)',
    paymentMethods: 'Payoneer / SEPA',
    url: 'https://www.clickworker.com',
    guideBn: 'এটি আলাদা ফ্রিল্যান্সিং ওয়েবসাইট। UHRS অ্যাসেসমেন্ট পাস করলে প্রতিদিন প্রচুর আসল AI কাজ পাওয়া যায়।'
  },
  {
    id: 'oneforma',
    name: 'OneForma by Centific',
    logo: '🌍',
    taskTypes: 'অডিও ট্রান্সক্রিপশন, বাংলা অনুবাদ ও AI ডাটা কালেকশন',
    payoutPerTask: '$১.০০ – $২০.০০ (৳১২০ – ৳২,৪০০+)',
    paymentMethods: 'Payoneer / PayPal',
    url: 'https://www.oneforma.com',
    guideBn: 'বাংলা ভাষাভাষীদের জন্য অডিও লিসেনিং ও অনুবাদ প্রোজেক্ট থাকে, যা সরাসরি ডলার দেয়।'
  },
  {
    id: 'toloka',
    name: 'Toloka AI (টলোকা)',
    logo: '🖼️',
    taskTypes: 'ছবি শনাক্তকরণ, অবজেক্ট লেবেলিং, সার্চ কোয়ালিটি ও সার্ভে',
    payoutPerTask: '$০.০৫ – $২.০০ (৳৬ – ৳২৫০)',
    paymentMethods: 'Payoneer / Papara',
    url: 'https://toloka.ai',
    guideBn: 'সরাসরি ওয়েবসাইট বা অ্যাপে ছবি লেবেলিং ও AI ডাটা যাচাই করে ডলার আয় করা যায়।'
  },
  {
    id: 'microworkers',
    name: 'Microworkers (মাইক্রোওয়ার্কার্স)',
    logo: '💼',
    taskTypes: 'সোশ্যাল মিডিয়া, সাইনআপ, ডাটা কালেকশন ও অ্যাপ টেস্ট',
    payoutPerTask: '$০.১০ – $৫.০০ (৳১২ – ৳৬০০)',
    paymentMethods: 'Skrill / Payoneer / Transfast',
    url: 'https://www.microworkers.com',
    guideBn: 'আসল ক্লায়েন্টদের ১-২ মিনিটের মাইক্রো-টাস্ক সম্পন্ন করে সরাসরি ডলার উপার্জন করা যায়।'
  },
  {
    id: 'utest',
    name: 'uTest (ইউটেস্ট)',
    logo: '🌐',
    taskTypes: 'ওয়েবসাইট ও মোবাইল অ্যাপ্লিকেশন টেস্টিং ও বাগ রিপোর্টিং',
    payoutPerTask: '$৫.০০ – $৫০.০০ (৳৬০০ – ৳৬,০০০+)',
    paymentMethods: 'Payoneer / PayPal',
    url: 'https://www.utest.com',
    guideBn: 'সফটওয়্যার ও অ্যাপ বাগ টেস্টিংয়ের বিশ্বের এক নম্বর আসল ওয়েবসাইট।'
  }
];

export const BanglaDailyWorkHub: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab, settings } = useApp();

  const coinRate = settings?.coinToBDTRate || 0.015;
  const uid = user?.uid || user?.phone || 'user';

  // Active Hub Sub Tab: 'verified_walls' | 'platforms' | 'app_earning_ways'
  const [hubTab, setHubTab] = useState<'verified_walls' | 'platforms' | 'app_earning_ways'>('verified_walls');

  // Active Live Offerwall Modal
  const [activeWall, setActiveWall] = useState<{ title: string; url: string; badge: string } | null>(null);
  const [showAiAssistantModal, setShowAiAssistantModal] = useState<boolean>(false);

  // Calculate today's real earnings in BDT from server-verified user balance
  const todayEarnedBDT = Number(((user?.todayCoins || 0) * coinRate).toFixed(1));
  const progressPercent = Math.min(100, Math.round((todayEarnedBDT / 100) * 100));

  const handleOpenOfferwall = async (partner: VerifiedOfferwallPartner) => {
    soundService.playTap();
    let targetUrl = partner.getUrl(uid, settings?.offerwallsConfig);

    // If Offerwall.me, fetch signed URL from server if available
    if (partner.id === 'offerwallme') {
      try {
        const res = await fetch(`/api/offerwall/get-signed-url?userId=${encodeURIComponent(uid)}`);
        const data = await res.json();
        if (data?.success && data?.url) {
          targetUrl = data.url;
        }
      } catch {
        // Fallback to constructed URL
      }
    }

    setActiveWall({
      title: partner.title,
      url: targetUrl,
      badge: partner.badge
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* ========================================================= */}
      {/* 🌟 1. HERO TARGET & VERIFIED SERVER SECURITY CARD */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 p-4 sm:p-5 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>১০০% আসল ও পোস্টব্যাক-ভেরিফায়েড কাজ 🇧🇩</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              অফিসিয়াল অফারওয়াল ও সার্ভে ইনকাম হাব
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              এখানে কোনো ভুয়া ফর্ম নেই—সরাসরি আন্তর্জাতিক অফারওয়াল ও সার্ভে সাইটে কাজ সম্পন্ন করলেই সার্ভার অটোমেটিক কয়েন দেবে।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-slate-950" />
            <span>ক্যাশআউট</span>
          </button>
        </div>

        {/* 📊 Target Progress Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 relative z-10">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-slate-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              আজকের সার্ভার-ভেরিফায়েড আয়:
            </span>
            <span className="text-emerald-400 font-black text-sm">
              ৳{todayEarnedBDT} / ৳১০০.০০ <span className="text-[10px] text-slate-400 font-normal">({progressPercent}%)</span>
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-slate-300 bg-emerald-900/20 border border-emerald-500/20 px-3 py-2 rounded-xl">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>শুধুমাত্র আসল পার্টনার সাইট • অটো পোস্টব্যাক সক্রিয়</span>
          </div>
          <span className="text-emerald-400 font-black flex-shrink-0">বিকাশ/নগদ রেডি</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🧭 2. TOP LEVEL SELECTOR TABS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <button
          type="button"
          onClick={() => setHubTab('verified_walls')}
          className={`py-2.5 px-2 rounded-xl font-black text-xs text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
            hubTab === 'verified_walls'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-base sm:text-sm">💎</span>
          <span>আসল অফারওয়াল (৬টি)</span>
        </button>

        <button
          type="button"
          onClick={() => setHubTab('platforms')}
          className={`py-2.5 px-2 rounded-xl font-black text-xs text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
            hubTab === 'platforms'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-base sm:text-sm">🌐</span>
          <span>বিকল্প সাইট (৬টি)</span>
        </button>

        <button
          type="button"
          onClick={() => setHubTab('app_earning_ways')}
          className={`py-2.5 px-2 rounded-xl font-black text-xs text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
            hubTab === 'app_earning_ways'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-base sm:text-sm">⚡</span>
          <span>অ্যাপের অন্যান্য কাজ</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 💎 3. TAB 1: ৬টি আসল পোস্টব্যাক-সংযুক্ত অফারওয়াল ও সার্ভে সাইট */}
      {/* ========================================================= */}
      {hubTab === 'verified_walls' && (
        <div className="space-y-3">
          {/* 🌐 BANGLA AI TASK TRANSLATOR & HELPER CARD */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xl shrink-0 shadow-md">
                🌐
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>ইংরেজি কাজ বুঝতে পারছেন না?</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Gemini AI</span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  অফারওয়ালের যেকোনো ইংরেজি লেখা পেস্ট করলেই বাংলায় ধাপে ধাপে বুঝিয়ে দেবে!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAiAssistantModal(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <span>এআই অনুবাদক ও চ্যাট খুলুন</span>
              <span>🤖</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-start gap-2 text-[11px] text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              নিচের প্রতিটি বাটনে ক্লিক করলে <strong className="text-white">আসল অফারওয়াল সাইট</strong> খুলবে। কাজ সঠিকভাবে সম্পন্ন করলে ১-৫ মিনিটের মধ্যে সার্ভার পোস্টব্যাকের মাধ্যমে কয়েন যুক্ত হবে।
            </span>
          </div>

          {VERIFIED_PARTNER_WALLS.filter((partner) => {
            if (partner.id === 'timewall') {
              const cfg = settings?.offerwallsConfig;
              return Boolean(cfg?.timewallEnabled && (cfg?.timewallPlacementId || cfg?.timewallUrl));
            }
            if (partner.id === 'gemk') {
              const cfg = settings?.offerwallsConfig;
              return Boolean(cfg?.gemkEnabled && (cfg?.gemkUrl || cfg?.gemkPlacementId));
            }
            return true;
          }).map((partner) => (
            <div
              key={partner.id}
              className={`p-4 rounded-2xl bg-gradient-to-r ${partner.accentClass} border-2 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden`}
            >
              <div className="flex items-start gap-3 relative z-10 w-full">
                <div className="w-12 h-12 rounded-2xl bg-black/30 border border-white/15 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                  {partner.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-white font-black text-[10px]">
                      {partner.badge}
                    </span>
                    <span className="text-amber-300 text-[11px] font-bold">
                      {partner.payoutRange} ({partner.coinRange})
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white">
                    {partner.title}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {partner.description}
                  </p>
                  <p className="text-[10px] text-emerald-300 font-bold">
                    {partner.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenOfferwall(partner)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r ${partner.buttonClass} font-black text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer flex-shrink-0 relative z-10`}
              >
                <span>সাইট ওপেন করুন</span>
                <ExternalLink className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 🌐 4. TAB 2: আন্তর্জাতিক আসল মাইক্রো-টাস্ক ও ফ্রিল্যান্সিং সাইট */}
      {/* ========================================================= */}
      {hubTab === 'platforms' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/30 text-xs text-slate-200 space-y-1">
            <span className="font-black text-cyan-300 flex items-center gap-1.5 text-sm">
              <Globe className="w-4 h-4" />
              আন্তর্জাতিক আসল মাইক্রো-জব ও এআই ট্রেইনিং সাইট
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              আপনি যদি <strong>AI Training, Audio Transcription, Image Annotation, Website Testing</strong>-এর মতো আসল কাজ করতে চান, তবে নিচের বিশ্বস্ত আন্তর্জাতিক ওয়েবসাইটগুলোতে সরাসরি অ্যাকাউন্ট খুলে কাজ করতে পারেন:
            </p>
          </div>

          {TOP_GLOBAL_PLATFORMS.map((platform, idx) => (
            <div
              key={platform.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition shadow-xl space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-2xl flex items-center justify-center flex-shrink-0">
                    {platform.logo}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {idx + 1}. {platform.name}
                    </h4>
                    <span className="text-[11px] text-cyan-300 font-bold block">
                      কাজের ধরণ: {platform.taskTypes}
                    </span>
                  </div>
                </div>

                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 flex items-center gap-1 transition shadow-md shadow-cyan-500/20"
                >
                  <span>সাইটে যান</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">প্রতি কাজের গড় আয়:</span>
                  <span className="text-amber-300 font-black">{platform.payoutPerTask}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">পেমেন্ট মেথড:</span>
                  <span className="text-emerald-400 font-black">{platform.paymentMethods}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic">
                💡 {platform.guideBn}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* ⚡ 5. TAB 3: অ্যাপের ভেতরের আসল রেভিনিউ-ভিত্তিক কাজ */}
      {/* ========================================================= */}
      {hubTab === 'app_earning_ways' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-xs text-slate-300 space-y-1">
            <span className="font-black text-amber-300 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" />
              অ্যাপের ভেতর থেকে নিয়মিত আয়ের আসল উপায়
            </span>
            <p className="text-[11px] text-slate-400">
              ওয়েবসাইটের মালিকের বিজ্ঞাপন ও অফারওয়াল রেভিনিউয়ের সাথে সংযুক্ত আসল কাজসমূহ:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('watch')}
              className="text-left p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <Play className="w-4 h-4" />
                  ভিডিও দেখে আয় (Watch & Earn)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">লাইভ</span>
              </div>
              <p className="text-[11px] text-slate-300">
                সার্ভার সেশন ভেরিফিকেশনের মাধ্যমে প্রতিটি শর্ট ভিডিও ও বিজ্ঞাপন দেখে নিয়মিত কয়েন সংগ্রহ করুন।
              </p>
            </button>

            <button
              type="button"
              onClick={() => setHubTab('verified_walls')}
              className="text-left p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  অফারওয়াল ও সার্ভে
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">সর্বোচ্চ আয়</span>
              </div>
              <p className="text-[11px] text-slate-300">
                BitcoTasks, Affmine, CPX Research ও Lootly-তে কাজ করে বড় কয়েন ও ডলার আয় করুন।
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="text-left p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  বন্ধুদের রেফার করে ১০% কমিশন
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">লাইফটাইম</span>
              </div>
              <p className="text-[11px] text-slate-300">
                সঠিক রেফারেল কোড শেয়ার করে বন্ধু যুক্ত করলে ২৫-৫০ কয়েন বোনাস পাবেন।
              </p>
            </button>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                এআই সেন্টিনেল সুরক্ষা
              </span>
              <p className="text-[11px] text-slate-400">
                ভুয়া ক্লিক, বট স্ক্রিপ্ট বা ভিপিএন ব্যবহার করলে এআই সেন্টিনেল স্বয়ংক্রিয়ভাবে কয়েন ও উইথড্র আটকে দেয়।
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              কোনো ভুয়া ক্লিকে ফ্রি কয়েন দেওয়া হয় না। শুধু আসল অফারওয়াল বা ভিডিও দেখার পরই ওয়ালেটে কয়েন যোগ হবে।
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📱 LIVE OFFERWALL IFRAME MODAL (With AI Bangla Translator) */}
      {/* ========================================================= */}
      {activeWall && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">💎</span>
              <div className="min-w-0">
                <h3 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  <span className="truncate">{activeWall.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] shrink-0">
                    {activeWall.badge}
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-400 truncate">
                  কাজ সফল হলে সার্ভার পোস্টব্যাকে কয়েন যুক্ত হবে (ইউজার ID: {uid.slice(0, 12)})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={activeWall.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 text-xs font-bold hover:bg-emerald-600/40 flex items-center gap-1"
              >
                <span className="hidden sm:inline">নতুন ট্যাবে</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setActiveWall(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-all active:scale-95"
              >
                বন্ধ করুন ✕
              </button>
            </div>
          </div>

          {/* 🌐 Bangla Task Translation Bar */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-4 py-2 border-b border-emerald-500/30 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold truncate">
              <span>🌐</span>
              <span className="truncate">ইংরেজি কাজ বুঝতে সমস্যা হচ্ছে?</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAiAssistantModal(true)}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] shadow-md flex items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
            >
              <span>বাংলা অনুবাদক ও এআই সাহায্য</span>
              <span>🤖</span>
            </button>
          </div>

          <div className="flex-1 w-full bg-white relative">
            <iframe
              src={activeWall.url}
              className="w-full h-full border-0"
              title={activeWall.title}
              allow="clipboard-write; fullscreen; camera; microphone; geolocation"
            />
          </div>
        </div>
      )}

      {/* 🌐 AI TASK ASSISTANT & BANGLA TRANSLATOR MODAL */}
      <AiTaskAssistantModal
        isOpen={showAiAssistantModal}
        onClose={() => setShowAiAssistantModal(false)}
      />
    </div>
  );
};
