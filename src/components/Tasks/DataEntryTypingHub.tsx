import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Coins, 
  ExternalLink, 
  Clock, 
  AlertCircle, 
  Check, 
  Flame, 
  Award, 
  FileSpreadsheet, 
  Cpu, 
  Copy,
  TrendingUp,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { openAdWithStrictTimer } from '../Common/AdVisitTimerModal';

interface InvoiceTask {
  id: string;
  customerName: string;
  itemName: string;
  invoiceNo: string;
  totalAmountBDT: number;
}

const SAMPLE_INVOICES: InvoiceTask[] = [
  { id: 'inv_1', customerName: 'হাসান মাহমুদ', itemName: 'স্মার্ট ওয়াচ X-10', invoiceNo: 'INV-8842', totalAmountBDT: 1450 },
  { id: 'inv_2', customerName: 'তানভীর আহমেদ', itemName: 'ব্লুটুথ হেডফোন প্রো', invoiceNo: 'INV-9021', totalAmountBDT: 850 },
  { id: 'inv_3', customerName: 'রাকিবুল ইসলাম', itemName: 'ম্যাক্স পাওয়ার ব্যাংক 20k', invoiceNo: 'INV-7734', totalAmountBDT: 2100 },
  { id: 'inv_4', customerName: 'নুসরাত জাহান', itemName: 'প্রিমিয়াম সাউন্ডবার 40W', invoiceNo: 'INV-6519', totalAmountBDT: 3200 },
  { id: 'inv_5', customerName: 'শফিকুল ইসলাম', itemName: 'ইউএসবি টাইপ-সি ফাস্ট হাব', invoiceNo: 'INV-4187', totalAmountBDT: 720 },
];

const BANGLA_SENTENCES = [
  'পরিশ্রম এবং সততা সফলতার মূল চাবিকাঠি।',
  'ডিজিটাল বাংলাদেশ গড়তে প্রযুক্তি শিক্ষায় এগিয়ে আসুন।',
  'দৈনিক অল্প অল্প কাজ করেই জীবনে বড় অর্জন সম্ভব।',
  'অনলাইন ফ্রিল্যান্সিং ও ডাটা এন্ট্রি একটি আত্মনির্ভর পেশা।',
  'সময়ের মূল্য দেওয়া মানুষের কাজের কদর সর্বত্র থাকে।',
  'স্মার্ট বাংলাদেশ বিনির্মাণে প্রতিটি যুবকের ভূমিকা অনন্য।'
];

export const DataEntryTypingHub: React.FC = () => {
  const { user, awardCoinsLocally } = useAuth();
  const { showToast, triggerConfetti, language, settings } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'captcha' | 'invoice' | 'bangla' | 'platforms'>('captcha');

  // Ad link fallbacks
  const adsterraDirectLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const hilltopAdsDirectLink = settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c';

  // Stats
  const [completedToday, setCompletedToday] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('we_typing_completed_count');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [coinsEarnedToday, setCoinsEarnedToday] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('we_typing_coins_earned');
      return saved ? parseInt(saved, 10) : 75;
    } catch {
      return 75;
    }
  });

  // 1. CAPTCHA STATE
  const [captchaCode, setCaptchaCode] = useState<string>('7K8M9Q');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaStatus, setCaptchaStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setCaptchaStatus('idle');
  };

  const handleCaptchaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.trim().toUpperCase() === captchaCode) {
      setCaptchaStatus('success');
      soundService.playSuccessFanfare();
      triggerConfetti();

      // Open strict verified sponsor ad
      openAdWithStrictTimer(adsterraDirectLink, 'ক্যাপচা ভেরিফিকেশন স্পনসর অ্যাড', 20, 15);

      const newCount = completedToday + 1;
      const newCoins = coinsEarnedToday + 20;
      setCompletedToday(newCount);
      setCoinsEarnedToday(newCoins);
      try {
        localStorage.setItem('we_typing_completed_count', newCount.toString());
        localStorage.setItem('we_typing_coins_earned', newCoins.toString());
      } catch {}

      showToast('ক্যাপচা সঠিক হয়েছে! 🌟', '১৫ সেকেন্ড বিজ্ঞাপন ভেরিফিকেশনের পর +২০ কয়েন যোগ হবে।', 'coin');
      setTimeout(() => {
        generateNewCaptcha();
      }, 1200);
    } else {
      setCaptchaStatus('error');
      soundService.playTap();
      showToast('ভুল ক্যাপচা কোড!', 'কোডটি ভালো করে দেখে সঠিকভাবে লিখুন।', 'error');
      generateNewCaptcha();
    }
  };

  // 2. INVOICE DATA ENTRY STATE
  const [invoiceIndex, setInvoiceIndex] = useState<number>(0);
  const currentInvoice = SAMPLE_INVOICES[invoiceIndex % SAMPLE_INVOICES.length];
  const [inputCustomer, setInputCustomer] = useState('');
  const [inputItem, setInputItem] = useState('');
  const [inputInvoiceNo, setInputInvoiceNo] = useState('');
  const [inputAmount, setInputAmount] = useState('');

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cMatch = inputCustomer.trim().toLowerCase() === currentInvoice.customerName.trim().toLowerCase();
    const iMatch = inputItem.trim().toLowerCase() === currentInvoice.itemName.trim().toLowerCase();
    const invMatch = inputInvoiceNo.trim().toUpperCase() === currentInvoice.invoiceNo.trim().toUpperCase();
    const aMatch = parseInt(inputAmount, 10) === currentInvoice.totalAmountBDT;

    if (cMatch && iMatch && invMatch && aMatch) {
      soundService.playSuccessFanfare();
      triggerConfetti();
      openAdWithStrictTimer(hilltopAdsDirectLink, 'মেমো ডাটা এন্ট্রি ভেরিফিকেশন স্পনসর', 30, 18);

      const newCount = completedToday + 1;
      const newCoins = coinsEarnedToday + 30;
      setCompletedToday(newCount);
      setCoinsEarnedToday(newCoins);
      try {
        localStorage.setItem('we_typing_completed_count', newCount.toString());
        localStorage.setItem('we_typing_coins_earned', newCoins.toString());
      } catch {}

      showToast('ডাটা এন্ট্রি নির্ভুল হয়েছে! 📋', 'স্পনসর ভেরিফিকেশন শেষে +৩০ কয়েন ওয়ালেটে যুক্ত হবে।', 'coin');
      setInputCustomer('');
      setInputItem('');
      setInputInvoiceNo('');
      setInputAmount('');
      setInvoiceIndex((prev) => prev + 1);
    } else {
      soundService.playTap();
      showToast('ডাটা মিলছে না!', 'মেমোতে দেওয়া তথ্যের সাথে বানান ও সংখ্যা মিলিয়ে লিখুন।', 'error');
    }
  };

  // 3. BANGLA TRANSCRIPTION STATE
  const [sentenceIndex, setSentenceIndex] = useState<number>(0);
  const currentSentence = BANGLA_SENTENCES[sentenceIndex % BANGLA_SENTENCES.length];
  const [banglaInput, setBanglaInput] = useState('');

  const handleBanglaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (banglaInput.trim() === currentSentence.trim()) {
      soundService.playSuccessFanfare();
      triggerConfetti();
      openAdWithStrictTimer(adsterraDirectLink, 'বাংলা টাইপিং স্পনসর ভেরিফিকেশন', 25, 15);

      const newCount = completedToday + 1;
      const newCoins = coinsEarnedToday + 25;
      setCompletedToday(newCount);
      setCoinsEarnedToday(newCoins);
      try {
        localStorage.setItem('we_typing_completed_count', newCount.toString());
        localStorage.setItem('we_typing_coins_earned', newCoins.toString());
      } catch {}

      showToast('বাংলা টাইপিং নির্ভুল হয়েছে! ✍️', '+২৫ কয়েন রিওয়ার্ড ভেরিফিকেশন চলছে।', 'coin');
      setBanglaInput('');
      setSentenceIndex((prev) => prev + 1);
    } else {
      soundService.playTap();
      showToast('বানান বা দাড়ি মেলেনি!', 'নিচে দেখানো বাক্যের সাথে হুবহু মিলিয়ে লিখুন।', 'error');
    }
  };

  // 4. TOP REAL CAPTCHA & TYPING PLATFORMS
  const realPlatforms = [
    {
      id: '2captcha',
      name: '2Captcha (বিশ্বের ১ নম্বর ক্যাপচা সাইট) 🌐',
      badge: 'আন্তর্জাতিক ভেরিফাইড',
      payout: '$0.50 - $1.50 / ১০০০ ক্যাপচা',
      withdraw: 'Payeer, WebMoney, Crypto (বিকাশে এক্সচেঞ্জ)',
      desc: 'এখানে সাধারণ ইমেজ ক্যাপচা ও রি-ক্যাপচা সমাধান করে রিয়েল ডলারে পেমেন্ট পাওয়া যায়। মোবাইল অ্যাপ ও ওয়েব উভয় জায়গায় কাজ করা যায়।',
      link: 'https://2captcha.com?from=26849182',
      sponsorUrl: adsterraDirectLink
    },
    {
      id: 'kolotibablo',
      name: 'Kolotibablo (কলোটিবাবলো টাইপিং) ⌨️',
      badge: '২০ বছরের পুরানো',
      payout: '$0.80 - $2.20 / ১০০০ ক্যাপচা',
      withdraw: 'Litecoin, USDT, Payeer, AdvCash',
      desc: 'বিশ্বের প্রাচীনতম ও বিশ্বস্ত ক্যাপচা ডাটা এন্ট্রি প্ল্যাটফর্ম। অভিজ্ঞ ও দ্রুত টাইপারদের জন্য লেভেল বোনাস এবং উচ্চ রেট প্রদান করে।',
      link: 'https://kolotibablo.com',
      sponsorUrl: hilltopAdsDirectLink
    },
    {
      id: 'megatypers',
      name: 'MegaTypers (মেগাটাইপার্স ডাটা এন্ট্রি) 📄',
      badge: 'সহজ টাইপিং',
      payout: '$0.60 - $1.20 / ১০০০ শব্দ',
      withdraw: 'Perfect Money, Payeer, Western Union',
      desc: 'টাইপিং স্পিড ভালো হলে ঘরে বসে ডাটা এন্ট্রি করে ইনকাম করার জন্য বহুল ব্যবহৃত একটি আন্তর্জাতিক প্ল্যাটফর্ম।',
      link: 'https://www.megatypers.com',
      sponsorUrl: adsterraDirectLink
    },
    {
      id: 'sproutgigs',
      name: 'SproutGigs মাইক্রো ডাটা টাস্ক 💼',
      badge: 'ছোট ডাটা জব',
      payout: '$০.০৫ - $০.৩০ প্রতি টাস্ক',
      withdraw: 'Airtm, Litecoin, Skrill',
      desc: 'ফর্ম ফিলিং, ডাটা কালেকশন, ওয়েবসাইট ভেরিফিকেশন ও সোশ্যাল টাস্কের জন্য বিশ্বের সবচেয়ে বড় ফ্রিল্যান্স মাইক্রো প্ল্যাটফর্ম।',
      link: 'https://sproutgigs.com',
      sponsorUrl: hilltopAdsDirectLink
    }
  ];

  return (
    <div className="space-y-4">
      {/* 🌟 HERO BANNER */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-black text-indigo-300 uppercase tracking-wider mb-2">
            <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
            টাইপিং ও ক্যাপচা ডাটা এন্ট্রি ওয়ার্কস্টেশন
          </div>
          <h2 className="text-lg font-black text-white">
            বিজ্ঞাপন দেখে টাইপিং ও ক্যাপচা পূরণ করে ইনকাম ⌨️
          </h2>
          <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed">
            কোনো জটিলতা নেই—স্ক্রিনের কোড বা মেমো দেখে দেখে টাইপ করুন, ছোট বিজ্ঞাপন ভেরিফিকেশন দেখুন এবং ইনস্ট্যান্ট কয়েন যোগ করুন।
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-indigo-500/30">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/30">
              <span className="text-[10px] text-slate-400 font-bold block">আজকের সম্পন্ন কাজ:</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                {completedToday} টি টাস্ক
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/30">
              <span className="text-[10px] text-slate-400 font-bold block">অর্জিত রিওয়ার্ড পয়েন্ট:</span>
              <span className="text-sm font-black font-mono text-amber-400">
                +{coinsEarnedToday} কয়েন
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveSubTab('captcha')}
          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'captcha'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ক্যাপচা টাইপিং</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('invoice')}
          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'invoice'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>মেমো ডাটা এন্ট্রি</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('bangla')}
          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'bangla'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>বাংলা টাইপিং</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('platforms')}
          className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'platforms'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>আসল ক্যাপচা সাইট</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. CAPTCHA WORKSTATION */}
      {/* ======================================================== */}
      {activeSubTab === 'captcha' && (
        <div className="p-4 rounded-3xl bg-[#090E1A] border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>সিকিউর ক্যাপচা টাইপিং ভেরিফিকেশন</span>
              </h3>
              <p className="text-[11px] text-slate-400">কোডটি দেখে হুবহু লিখুন ও ১৫ সে. বিজ্ঞাপন দেখে কয়েন নিন</p>
            </div>
            <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
              +২০ কয়েন
            </span>
          </div>

          {/* Captcha Box */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0f172a] to-slate-950 border-2 border-indigo-500/40 flex items-center justify-between shadow-inner">
            <div className="relative select-none">
              <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 italic drop-shadow-md">
                {captchaCode}
              </span>
              {/* Security background lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
            </div>

            <button
              type="button"
              onClick={generateNewCaptcha}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-400 transition cursor-pointer"
              title="নতুন কোড আনুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCaptchaSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                উপরের ক্যাপচা কোডটি এখানে সঠিকভাবে লিখুন:
              </label>
              <input
                type="text"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="যেমন: 7K8M9Q"
                className="w-full px-4 py-3 bg-slate-950 border border-indigo-500/50 rounded-2xl text-center text-lg font-mono font-black text-amber-300 tracking-widest focus:outline-none focus:border-indigo-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition"
            >
              <Check className="w-4 h-4" />
              <span>ক্যাপচা কনফার্ম ও বিজ্ঞাপন দেখুন (+২০ কয়েন)</span>
            </button>
          </form>

          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              💡 <strong>বিজ্ঞাপন ভেরিফিকেশন:</strong> সাবমিট বাটনে চাপলে একটি ১৫ সেকেন্ডের ভেরিফিকেশন স্পনসর পেজ খুলবে। টাইমার পূর্ণ হলে স্বয়ংক্রিয়ভাবে কয়েন যোগ হবে।
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. INVOICE / MEMO DATA ENTRY */}
      {/* ======================================================== */}
      {activeSubTab === 'invoice' && (
        <div className="p-4 rounded-3xl bg-[#090E1A] border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>মেমো ও ক্যাশ চালান ডাটা এন্ট্রি</span>
              </h3>
              <p className="text-[11px] text-slate-400">মেমোর সঠিক তথ্য নিচে টাইপ করুন</p>
            </div>
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              +৩০ কয়েন
            </span>
          </div>

          {/* Digital Receipt Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-bold text-indigo-400">ক্যাশ মেমো ভাউচার</span>
              <span className="text-xs font-black text-amber-400">{currentInvoice.invoiceNo}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">গ্রাহকের নাম:</span>
                <span className="font-bold text-white">{currentInvoice.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">পণ্যের বিবরণ:</span>
                <span className="font-bold text-white">{currentInvoice.itemName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">মোট মূল্য (BDT):</span>
                <span className="font-black text-emerald-400">৳{currentInvoice.totalAmountBDT}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">স্ট্যাটাস:</span>
                <span className="text-[10px] font-bold text-emerald-400">পরিশোধিত ✓</span>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleInvoiceSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  গ্রাহকের নাম:
                </label>
                <input
                  type="text"
                  required
                  value={inputCustomer}
                  onChange={(e) => setInputCustomer(e.target.value)}
                  placeholder="যেমন: হাসান মাহমুদ"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  পণ্যের বিবরণ:
                </label>
                <input
                  type="text"
                  required
                  value={inputItem}
                  onChange={(e) => setInputItem(e.target.value)}
                  placeholder="যেমন: স্মার্ট ওয়াচ X-10"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  চালান নম্বর (Invoice No):
                </label>
                <input
                  type="text"
                  required
                  value={inputInvoiceNo}
                  onChange={(e) => setInputInvoiceNo(e.target.value.toUpperCase())}
                  placeholder="যেমন: INV-8842"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  মোট টাকার পরিমাণ (শুধু সংখ্যা):
                </label>
                <input
                  type="number"
                  required
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="যেমন: 1450"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition"
            >
              <Check className="w-4 h-4" />
              <span>ডাটা এন্ট্রি সাবমিট ও রিওয়ার্ড ক্লেইম (+৩০ কয়েন)</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. BANGLA TEXT TRANSCRIPTION */}
      {/* ======================================================== */}
      {activeSubTab === 'bangla' && (
        <div className="p-4 rounded-3xl bg-[#090E1A] border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Keyboard className="w-4 h-4 text-purple-400" />
                <span>বাংলা বাক্য টাইপিং স্পিড টেস্ট</span>
              </h3>
              <p className="text-[11px] text-slate-400">বাক্যটি হুবহু নিচে লিখে দ্রুত সাবমিট করুন</p>
            </div>
            <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-full">
              +২৫ কয়েন
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">লক্ষ্য বাক্য (Target Sentence):</span>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              "{currentSentence}"
            </p>
          </div>

          <form onSubmit={handleBanglaSubmit} className="space-y-3">
            <div>
              <textarea
                rows={3}
                required
                value={banglaInput}
                onChange={(e) => setBanglaInput(e.target.value)}
                placeholder="উপরের বাক্যটি এখানে বাংলা কিবোর্ড দিয়ে লিখুন..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition"
            >
              <Check className="w-4 h-4" />
              <span>টাইপিং যাচাই ও কয়েন গ্রহণ (+২৫ কয়েন)</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. REAL WORLD CAPTCHA & DATA ENTRY PLATFORMS */}
      {/* ======================================================== */}
      {activeSubTab === 'platforms' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <p className="leading-relaxed">
              ⭐ <strong>আন্তর্জাতিক আসল কোম্পানি:</strong> আপনি এবং আপনার ইউজাররা সরাসরি নিচের সাইটগুলোতেও ফ্রি একাউন্ট খুলে প্রতিদিন আনলিমিটেড ক্যাপচা সমাধান ও ডাটা এন্ট্রি করে সরাসরি ডলারে পেমেন্ট নিতে পারেন।
            </p>
          </div>

          {realPlatforms.map((plat) => (
            <div
              key={plat.id}
              className="p-4 rounded-3xl bg-[#0B111E] border border-slate-800 hover:border-indigo-500/40 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-black text-white">{plat.name}</h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {plat.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{plat.desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">আয়ের রেট:</span>
                  <span className="text-emerald-400 font-bold">{plat.payout}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">পেমেন্ট মেথড:</span>
                  <span className="text-cyan-400 font-bold">{plat.withdraw}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ১০০% বিশ্বস্ত ও ফ্রি
                </span>

                <button
                  type="button"
                  onClick={() => {
                    openAdWithStrictTimer(plat.sponsorUrl, plat.name, 15, 15);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <span>সাইটে প্রবেশ করুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
