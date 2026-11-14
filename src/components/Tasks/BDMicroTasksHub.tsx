import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  Zap, 
  Smartphone, 
  Globe, 
  Youtube, 
  Send, 
  Share2, 
  Award, 
  Check, 
  AlertCircle, 
  Play, 
  Briefcase, 
  ArrowRight,
  TrendingUp,
  FileText,
  ThumbsUp,
  HelpCircle,
  X,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';
import { sanitizeAdDirectLink } from '../../utils/adLinkSanitizer';
import { PostJobModal } from './PostJobModal';

export interface BDMicroJob {
  id: string;
  titleBn: string;
  category: 'microjob' | 'video' | 'social' | 'survey' | 'app' | 'article' | 'shortlink';
  platformName: string;
  icon: string;
  badge: string;
  timeEstimate: string; // e.g. '২ মিনিট'
  durationSeconds: number; // e.g. 120
  rewardCoins: number;
  estPayoutBDT: string; // e.g. '৳১.০৫'
  descriptionBn: string;
  instructionsBn: string[];
  externalUrl?: string;
  isPopular?: boolean;
}

export const BDMicroTasksHub: React.FC = () => {
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { language, showToast, triggerConfetti, settings } = useApp();

  const adsterraDirectLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const hilltopAdsDirectLink = settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c';

  const monetagDirectLink = settings?.adsConfig?.monetagDirectLink?.trim() || 'https://uplcm.com/4/11971342';
  const freecashUrl = settings?.offerwallsConfig?.freecashUrl?.trim() || 'https://freecash.com/r/39Z5IH';
  const freecashReferralCode = settings?.offerwallsConfig?.freecashReferralCode?.trim() || '39Z5IH';
  const cpxAppId = settings?.offerwallsConfig?.cpxAppId?.trim() || '36966';
  const offerwallMeApiKey = settings?.offerwallsConfig?.offerwallMeApiKey?.trim() || '6yHRmktW7Ouf75SHc826oSbiYGu06W';
  const lootlyApiKey = settings?.offerwallsConfig?.lootlyApiKey?.trim() || 'pj9b1buxrh05dt8eito0x8jxei21c3';
  const userId = user?.uid || 'user_guest';

  // Completed task ids in localStorage
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('we_bd_microtasks_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active executing task modal state
  const [activeJob, setActiveJob] = useState<BDMicroJob | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [userProof, setUserProof] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter category
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'microjob' | 'social' | 'video' | 'survey'>('all');
  const [showPostJobModal, setShowPostJobModal] = useState<boolean>(false);
  const [communityJobs, setCommunityJobs] = useState<any[]>([]);

  // 💎 শুধুমাত্র যেসকল প্ল্যাটফর্মে ইউজারের অ্যাকাউন্ট ও কোড যুক্ত রয়েছে
  const bdPlatforms = [
    {
      id: 'cpx_research',
      name: 'CPX Research পেইড সার্ভে ও কুইজ 📊',
      badge: 'ভেরিফায়েড অ্যাপ ID: 36966',
      tagline: 'সহজ প্রশ্ন-উত্তর, মতামত সার্ভে ও কুইজ পূরণ করে নিশ্চিত ডলার ও ওয়ালেট কয়েন',
      icon: '📊',
      time: '২-৩ মিনিট / সার্ভে',
      payoutMethods: 'অ্যাপ ওয়ালেট (বিকাশ/নগদ)',
      url: `https://offers.cpx-research.com/index.php?app_id=${encodeURIComponent(cpxAppId)}&ext_user_id=${encodeURIComponent(userId)}`,
      referralBenefitBn: 'ডিসকোয়ালিফাই হলেও সান্ত্বনা বোনাস কয়েন পাবেন',
      gradient: 'from-teal-600 via-emerald-600 to-green-700'
    },
    {
      id: 'freecash_mega',
      name: 'Freecash মেগা হাব ($১ - $২০+)',
      badge: 'ভেরিফায়েড কোড: 39Z5IH 💎',
      tagline: 'মোবাইল গেম খেলে, অ্যাপ টেস্ট ও সার্ভে করে সরাসরি ডলার ($১ - $১০+) ইনকাম',
      icon: '💵',
      time: '৫-১৫ মিনিট / কাজ',
      payoutMethods: 'বিকাশ, নগদ, ক্রিপ্টো, পেপ্যাল',
      url: freecashUrl,
      referralCode: freecashReferralCode,
      referralBenefitBn: 'রেফারেল কোড 39Z5IH দিয়ে ফ্রি কেস ও $২৫০ পর্যন্ত বোনাস',
      gradient: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'offerwall_me',
      name: 'Offerwall.me স্পেশাল হাব 🎯',
      badge: 'ভেরিফায়েড প্লেসমেন্ট ID',
      tagline: 'জনপ্রিয় গেম লেভেল পার, অ্যাপ ট্রায়াল ও হাই-পেইং অফার থেকে নিশ্চিত কয়েন',
      icon: '🎯',
      time: '১-৫ মিনিট / অফার',
      payoutMethods: 'অ্যাপ ওয়ালেট (বিকাশ/নগদ)',
      url: `https://offerwall.me/offerwall/${encodeURIComponent(offerwallMeApiKey)}/${encodeURIComponent(userId)}`,
      referralBenefitBn: 'সার্ভার ভেরিফিকেশনের মাধ্যমে সরাসরি ওয়ালেটে কয়েন যুক্ত হবে',
      gradient: 'from-amber-600 to-orange-700'
    },
    {
      id: 'lootly_global',
      name: 'Lootly গ্লোবাল অফারওয়াল 🎁',
      badge: 'ভেরিফায়েড অ্যাপ #১৬',
      tagline: 'গেমিং অফার, মোবাইল অ্যাপ ইনস্টল ও সার্ভে করে বড় কয়েন আর্ন করুন',
      icon: '🎁',
      time: '২-৫ মিনিট / কাজ',
      payoutMethods: 'অ্যাপ ওয়ালেট (বিকাশ/নগদ)',
      url: `https://offerwall.lootly.fun/offerwall/${encodeURIComponent(lootlyApiKey)}/${encodeURIComponent(userId)}`,
      referralBenefitBn: 'আন্তর্জাতিক হাই-রেট অফার ও সহজ টাস্ক',
      gradient: 'from-purple-600 to-indigo-700'
    },
    {
      id: 'adsterra_sponsor',
      name: 'Adsterra হাই-রেট স্পনসর ভিজিট 🌐',
      badge: 'হাই-CPM স্পনসর 💎',
      tagline: 'হাই-সিপিএম স্পনসর পেজ ভিজিট করুন এবং প্রতি সম্পন্ন টাস্কে সরাসরি ওয়ালেটে কয়েন পান',
      icon: '💎',
      time: '২০-৩০ সেকেন্ড',
      payoutMethods: 'অ্যাপ ওয়ালেট (বিকাশ/নগদ)',
      url: adsterraDirectLink,
      referralBenefitBn: 'কোনো রেজিস্ট্রেশন লাগবে না—২০ সেকেন্ড স্ক্রোল করলেই কয়েন',
      gradient: 'from-blue-600 to-cyan-700'
    },
    {
      id: 'hilltop_sponsor',
      name: 'HilltopAds ভিআইপি স্পনসর হাব 🚀',
      badge: 'টপ স্পনসর • জোন ৭৪৮৮৬৭৭',
      tagline: '১০০% ফ্রি স্পনসর ওয়েবসাইট ও অ্যাপ ট্রায়াল ভিজিট করে বড় বোনাস কয়েন সংগ্রহ করুন',
      icon: '🚀',
      time: '২০ সেকেন্ড',
      payoutMethods: 'অ্যাপ ওয়ালেট (বিকাশ/নগদ)',
      url: hilltopAdsDirectLink,
      referralBenefitBn: '১০০% ফ্রি ব্রাউজ—টাইমার শেষ হলেই কয়েন জমা হবে',
      gradient: 'from-rose-600 to-pink-700'
    },
    {
      id: 'monetag_sponsor',
      name: 'Monetag স্মার্টলিঙ্ক স্পনসর ⚡',
      badge: 'হাই-রেট স্মার্টলিঙ্ক • জোন ১১৯৪... ⚡',
      tagline: 'স্মার্টলিঙ্ক স্পন্সর পেজ ভিউ করে ২০ সেকেন্ডে নিশ্চিত বোনাস কয়েন সংগ্রহ করুন',
      icon: '⚡',
      time: '২০ সেকেন্ড',
      payoutMethods: 'অ্যাপ ওয়ালেট (বিকাশ/নগদ)',
      url: monetagDirectLink,
      referralBenefitBn: 'স্পন্সর ভিউ শেষ হলে স্বয়ংক্রিয়ভাবে কয়েন ক্লেইম',
      gradient: 'from-emerald-700 to-cyan-800'
    }
  ];

  // Curated 2 to 3 minute quick jobs
  const microJobsList: BDMicroJob[] = [
    {
      id: 'bd_job_adsterra_sponsor',
      titleBn: 'Adsterra হাই-রেট স্পনসর পেজ ভিজিট ও ২ মিনিট স্ক্রোল 🌐',
      category: 'microjob',
      platformName: 'Adsterra Sponsor',
      icon: '💎',
      badge: '২ মিনিট কাজ • ৳১.০৫',
      timeEstimate: '২ মিনিট',
      durationSeconds: 120,
      rewardCoins: 70,
      estPayoutBDT: '৳১.০৫',
      descriptionBn: 'স্পনসর পেজে গিয়ে বিষয়বস্তু ২ মিনিট ধরে স্ক্রোল করে দেখুন—কোনো ডিপোজিট বা ফি লাগবে না।',
      instructionsBn: [
        'নিচের "টাস্ক লিঙ্ক খুলুন" বাটনে ক্লিক করুন।',
        'নতুন ট্যাবে সাইটটি কমপক্ষে ২ মিনিট (১২০ সেকেন্ড) স্ক্রোল করে পড়ুন।',
        'কাউন্টডাউন টাইমার শেষ হলে "কয়েন ক্লেইম করুন" এ চাপ দিন।'
      ],
      externalUrl: adsterraDirectLink,
      isPopular: true
    },
    {
      id: 'bd_job_yt_watch_sub',
      titleBn: 'ইউটিউব ভিডিও ২ মিনিট দেখা ও লাইক দেওয়া 🎬',
      category: 'video',
      platformName: 'YouTube Microjob',
      icon: '▶️',
      badge: '২ মিনিট ভিডিও • ৳০.৯০',
      timeEstimate: '২ মিনিট',
      durationSeconds: 120,
      rewardCoins: 60,
      estPayoutBDT: '৳০.৯০',
      descriptionBn: 'মনোরম ভিডিও ক্লিপটি ২ মিনিট চালিয়ে উপভোগ করুন এবং চ্যানেলে একটি লাইক দিন।',
      instructionsBn: [
        '"টাস্ক লিঙ্ক খুলুন" চেপে ভিডিও চালু করুন।',
        'ভিডিওটি ২ মিনিট ধরে মনোযোগ দিয়ে দেখুন।',
        'ভিডিও দেখা শেষ হলে অ্যাপে ফিরে এসে কয়েন ক্লেইম করুন।'
      ],
      externalUrl: adsterraDirectLink,
      isPopular: true
    },
    {
      id: 'bd_job_bkash_opinion_poll',
      titleBn: 'বিকাশ ও নগদ মতামত জরিপ (২ মিনিটের শর্ট সার্ভে) 📋',
      category: 'survey',
      platformName: 'BD Quick Poll',
      icon: '📝',
      badge: 'সহজ সার্ভে • ৳০.৮৫',
      timeEstimate: '২ মিনিট',
      durationSeconds: 90,
      rewardCoins: 55,
      estPayoutBDT: '৳০.৮৫',
      descriptionBn: 'বাংলাদেশি ক্যাশআউট মেথড নিয়ে ৩টি সহজ টিক-মার্ক প্রশ্নের উত্তর দিন ও ইনস্ট্যান্ট পয়েন্ট নিন।',
      instructionsBn: [
        'পোল পেজে যান এবং আপনার পছন্দের পেমেন্ট মেথড বাছাই করুন।',
        '৯০ সেকেন্ডের সাধারণ জরিপ সম্পন্ন করুন।',
        'ফেরত এসে সফলভাবে পয়েন্ট সংগ্রহ করুন।'
      ],
      externalUrl: hilltopAdsDirectLink
    },
    {
      id: 'bd_job_tg_channel_follow',
      titleBn: 'অফিশিয়াল টেলিগ্রাম চ্যানেল ও সাপোর্ট গ্রুপ জয়েন ✈️',
      category: 'social',
      platformName: 'Telegram Official',
      icon: '✈️',
      badge: '১ মিনিট • ৳০.৭০',
      timeEstimate: '১ মিনিট',
      durationSeconds: 60,
      rewardCoins: 45,
      estPayoutBDT: '৳০.৭০',
      descriptionBn: 'আমাদের অফিশিয়াল টেলিগ্রাম চ্যানেলে যুক্ত হয়ে নিয়মিত নোটিশ ও পেমেন্ট প্রুফ দেখুন।',
      instructionsBn: [
        'টেলিগ্রাম চ্যানেল লিঙ্ক ওপেন করুন।',
        'চ্যানেলে জয়েন বাটনে চাপ দিন।',
        'অ্যাপে ফিরে এসে রিওয়ার্ড কয়েন সংগ্রহ করুন।'
      ],
      externalUrl: 'https://t.me/+EarnWatchBD'
    },
    {
      id: 'bd_job_blog_reading',
      titleBn: 'তথ্যবহুল বাংলা ব্লগ আর্টিকেল ২ মিনিট পড়া 📰',
      category: 'article',
      platformName: 'Bangla Blog',
      icon: '📰',
      badge: '২ মিনিট রিডিং • ৳০.৭৫',
      timeEstimate: '২ মিনিট',
      durationSeconds: 120,
      rewardCoins: 50,
      estPayoutBDT: '৳০.৭৫',
      descriptionBn: 'অনলাইন ইনকাম ও টেকনোলজি বিষয়ক বাংলা ব্লগ পোস্টটি ২ মিনিট স্ক্রোল করে পড়ুন।',
      instructionsBn: [
        'ব্লগ আর্টিকেলটি ওপেন করুন।',
        'আর্টিকেলের বিভিন্ন প্যারাগ্রাফ ২ মিনিট ধরে স্ক্রোল করে রিডিং করুন।',
        'টাইমার সম্পন্ন হলে সরাসরি কয়েন জমা হবে।'
      ],
      externalUrl: hilltopAdsDirectLink
    },
    {
      id: 'bd_job_telegram_join',
      titleBn: 'অফিশিয়াল টেলিগ্রাম পেমেন্ট প্রুফ গ্রুপ জয়েন ✈️',
      category: 'social',
      platformName: 'Telegram Community',
      icon: '✈️',
      badge: '১ মিনিট কাজ • ৳০.৬০',
      timeEstimate: '১ মিনিট',
      durationSeconds: 60,
      rewardCoins: 40,
      estPayoutBDT: '৳০.৬০',
      descriptionBn: 'আমাদের টেলিগ্রাম চ্যানেলে যুক্ত হয়ে লাইভ পেমেন্ট প্রুফ ও নিয়মিত নোটিশ দেখুন।',
      instructionsBn: [
        'টেলিগ্রাম গ্রুপ লিঙ্কে প্রবেশ করুন।',
        'গ্রুপে "Join Channel" চাপুন।',
        'অ্যাপে ফিরে এসে রিওয়ার্ড নিন।'
      ],
      externalUrl: 'https://t.me/+EarnWatchBD'
    },
    {
      id: 'bd_job_app_test_trial',
      titleBn: 'ফ্রি অ্যান্ড্রয়েড অ্যাপ টেস্ট ও ৫-স্টার রেটিং 📱',
      category: 'app',
      platformName: 'Play Store Microjob',
      icon: '⭐',
      badge: '৩ মিনিট কাজ • ৳১.২০',
      timeEstimate: '৩ মিনিট',
      durationSeconds: 180,
      rewardCoins: 80,
      estPayoutBDT: '৳১.২০',
      descriptionBn: 'প্লে-স্টোর থেকে একটি ফ্রি লাইট অ্যাপ অথবা গেম ৩ মিনিট টেস্ট করে ভালো ফিডব্যাক দিন।',
      instructionsBn: [
        'প্লে-স্টোর বা অ্যাপ পেজে যান।',
        'অ্যাপটি টেস্ট করে ৩ মিনিট চালু রাখুন।',
        'অ্যাপে ফিরে এসে বড় রিওয়ার্ড কয়েন সংগ্রহ করুন।'
      ],
      externalUrl: adsterraDirectLink,
      isPopular: true
    },
    {
      id: 'bd_job_shortlink_captcha',
      titleBn: 'বাংলাদেশি শর্টলিংক ও ১ মিনিটের ক্যাপচা সল্ভ 🔗',
      category: 'shortlink',
      platformName: 'BD Shortlink',
      icon: '🧩',
      badge: '১.৫ মিনিট • ৳০.৭০',
      timeEstimate: '১.৫ মিনিট',
      durationSeconds: 90,
      rewardCoins: 45,
      estPayoutBDT: '৳০.৭০',
      descriptionBn: 'সহজ একটি লিঙ্ক ওপেন করে ১টি সহজ ইমেজ বা টেক্সট ক্যাপচা পূরণ করুন।',
      instructionsBn: [
        'শর্টলিংক পেজটি ওপেন করুন।',
        'সহজ ক্যাপচা বক্সে টিক দিন বা কোড লিখুন।',
        'ক্যাপচা ভেরিফাই হলে কয়েন ক্লেইম করুন।'
      ],
      externalUrl: hilltopAdsDirectLink
    }
  ];

  // Filter list
  const filteredJobs = microJobsList.filter((job) => {
    if (selectedCategory === 'all') return true;
    return job.category === selectedCategory;
  });

  // Countdown timer effect when job modal is active
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            soundService.playSuccessFanfare();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerRemaining]);

  useEffect(() => {
    loadCommunityJobs();
  }, []);

  const loadCommunityJobs = async () => {
    try {
      const res = await api.getActiveJobs();
      if (res?.success && Array.isArray(res.jobs)) {
        setCommunityJobs(res.jobs);
      }
    } catch (e) {
      console.error('Failed to load community jobs', e);
    }
  };

  // Start job modal
  const handleOpenJob = (job: BDMicroJob) => {
    soundService.playCoinReward();
    setActiveJob(job);
    setTimerRemaining(job.durationSeconds);
    setIsTimerRunning(true);
    setUserProof('');

    // Open target link
    if (job.externalUrl) {
      try {
        const safeUrl = sanitizeAdDirectLink(job.externalUrl, 'monetag');
        window.open(safeUrl, '_blank', 'noopener,noreferrer');
      } catch {}
    }
  };

  // Re-open task URL
  const handleReopenUrl = () => {
    if (activeJob?.externalUrl) {
      try {
        const safeUrl = sanitizeAdDirectLink(activeJob.externalUrl, 'monetag');
        window.open(safeUrl, '_blank', 'noopener,noreferrer');
      } catch {}
    }
  };

  // Claim reward
  const handleClaimReward = async () => {
    if (!activeJob) return;
    setIsSubmitting(true);

    try {
      // Award coins locally immediately
      awardCoinsLocally(activeJob.rewardCoins);
      soundService.playSuccessFanfare();
      triggerConfetti();

      // Save to completed list
      if (!completedTaskIds.includes(activeJob.id)) {
        const updated = [...completedTaskIds, activeJob.id];
        setCompletedTaskIds(updated);
        try {
          localStorage.setItem('we_bd_microtasks_completed', JSON.stringify(updated));
        } catch {}
      }

      showToast(
        language === 'bn' 
          ? `+${activeJob.rewardCoins} কয়েন (${activeJob.estPayoutBDT}) সফলভাবে ওয়ালেটে যুক্ত হয়েছে! 🎉` 
          : `+${activeJob.rewardCoins} coins added to your wallet!`,
        language === 'bn' ? 'টাস্ক সফলভাবে সম্পন্ন হয়েছে।' : 'Task completed successfully.',
        'coin'
      );

      // Notify backend
      try {
        await api.claimTaskReward(activeJob.id, activeJob.titleBn, activeJob.rewardCoins);
        await refreshUser();
      } catch (err) {
        console.error('Task claim sync error:', err);
      }

      setActiveJob(null);
    } catch (e: any) {
      showToast(e.message || 'কয়েন যুক্ত করতে সমস্যা হয়েছে', '', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-4">
      {/* 🇧🇩 TOP BANNER: 2-3 MINUTE MICRO-JOBS IN BANGLADESH */}
      <div className="rounded-3xl bg-gradient-to-br from-[#061C14] via-[#0A2E20] to-[#04140E] border-2 border-emerald-500/50 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 fill-emerald-400 text-slate-950" />
            <span>২ থেকে ৩ মিনিটের কাজ • দ্রুত ইনকাম 🇧🇩</span>
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ১০০% ফ্রি • নো ডিপোজিট
          </span>
        </div>

        <h2 className="text-xl font-black text-white font-['Outfit'] mb-1.5 leading-tight">
          বাংলাদেশি মাইক্রোজব ও সহজ আর্নিং প্ল্যাটফর্ম
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          ইউজারের ঘণ্টার পর ঘণ্টা সময় নষ্ট হবে না! মাত্র ২ থেকে ৩ মিনিট ছোট ছোট কাজ করে সরাসরি কয়েন ও বিকাশ/নগদে ক্যাশআউট করুন।
        </p>

        {/* Feature badges */}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-center">
            <span className="text-emerald-400 font-mono font-black text-xs block">⏱️ ২-৩ মিনিট</span>
            <span className="text-[10px] text-slate-400">প্রতি কাজের সময়</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-center">
            <span className="text-amber-400 font-mono font-black text-xs block">+৪০ হতে +৮০ 🪙</span>
            <span className="text-[10px] text-slate-400">ইনস্ট্যান্ট কয়েন</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-center">
            <span className="text-cyan-400 font-mono font-black text-xs block">৳১ হতে ৳৫</span>
            <span className="text-[10px] text-slate-400">বিকাশ/নগদ রেট</span>
          </div>
        </div>
      </div>

      {/* 📢 POST YOUR OWN JOB BANNER (EARN FROM PROMOTERS & USERS) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-xl flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-white">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">📢</span>
            <span>নিজের চ্যানেল, পেজ বা অ্যাপ প্রচার করতে চান?</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            বিকাশ/নগদে ডিপোজিট করে কাজ দিন—রিয়েল ইউজাররা সম্পন্ন করবে!
          </p>
        </div>
        <button
          onClick={() => setShowPostJobModal(true)}
          className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/30 whitespace-nowrap active:scale-95 transition cursor-pointer"
        >
          ➕ কাজ দিন
        </button>
      </div>

      {/* 🌟 COMMUNITY POSTED JOBS (REAL USER TASKS) */}
      {communityJobs.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>কমিউনিটি মাইক্রোজব (ইউজারদের দেওয়া কাজ)</span>
            </h3>
            <span className="text-[10px] text-amber-400 font-bold">{communityJobs.length}টি লাইভ কাজ</span>
          </div>

          <div className="space-y-2.5">
            {communityJobs.map((cJob) => {
              const isCompleted = completedTaskIds.includes(cJob.id);
              return (
                <div
                  key={cJob.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#0c1815] border border-emerald-500/30 hover:border-emerald-500/60 transition shadow-lg flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl flex-shrink-0">
                        {cJob.category === 'youtube' ? '🎬' : cJob.category === 'facebook' ? '👍' : cJob.category === 'app' ? '📱' : '🌐'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            কমিউনিটি জব 🌟
                          </span>
                          <span className="text-[10px] text-slate-400">
                            কোটা: {cJob.completedWorkers}/{cJob.targetWorkers} জন
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {cJob.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {cJob.instructions}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                        <Coins className="w-3.5 h-3.5" />
                        <span>+{cJob.rewardCoinsPerWorker || 25}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">কয়েন</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500">
                      পোস্টদাতা: {cJob.userName}
                    </span>
                    <button
                      disabled={isCompleted}
                      onClick={async () => {
                        if (isCompleted) return;
                        try {
                          window.open(cJob.targetUrl, '_blank', 'noopener,noreferrer');
                        } catch {}
                        showToast('কাজটি সম্পন্ন করার পর ৫ সেকেন্ডে কয়েন যোগ হবে', '', 'info');
                        setTimeout(async () => {
                          const res = await api.completeWorkerJob(cJob.id);
                          if (res?.success) {
                            awardCoinsLocally(cJob.rewardCoinsPerWorker || 25);
                            soundService.playSuccessFanfare();
                            triggerConfetti();
                            setCompletedTaskIds((prev) => [...prev, cJob.id]);
                            loadCommunityJobs();
                            showToast(res.message, '', 'coin');
                          }
                        }, 5000);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 cursor-pointer ${
                        isCompleted
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>সম্পন্ন হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <span>কাজটি করুন</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🚀 1. শীর্ষ ভেরিফায়েড আর্নিং ও সার্ভে পার্টনার সাইটসমূহ (CPX, Freecash, Offerwall.me) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>ভেরিফায়েড আর্নিং ও স্পনসর প্ল্যাটফর্মসমূহ</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold">অ্যাক্টিভ কোডযুক্ত সাইট</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {bdPlatforms.map((plat) => (
            <div
              key={plat.id}
              onClick={() => {
                soundService.playCoinReward();
                try {
                  window.open(plat.url, '_blank', 'noopener,noreferrer');
                } catch {}
              }}
              className="p-3.5 rounded-2xl bg-[#09131C] border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between group active:scale-98 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition">
                  {plat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{plat.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      {plat.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                    {plat.tagline}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-slate-500">
                    <span>⏱️ {plat.time}</span>
                    <span>💸 {plat.payoutMethods}</span>
                    {plat.referralCode && (
                      <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                        <span>কোড: {plat.referralCode}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(plat.referralCode!);
                            setCopiedCodeId(plat.id);
                            showToast('রেফারেল কোড কপি হয়েছে ✓', `কোড: ${plat.referralCode}`, 'success');
                            setTimeout(() => setCopiedCodeId(null), 2500);
                          }}
                          className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-300 transition"
                          title="Copy Code"
                        >
                          {copiedCodeId === plat.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                  {plat.referralBenefitBn && (
                    <div className="mt-1 text-[10px] text-amber-300/90 flex items-center gap-1 font-medium">
                      <span>✨ {plat.referralBenefitBn}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pl-2 shrink-0">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow group-hover:shadow-emerald-500/30 transition cursor-pointer"
                >
                  <span>{plat.referralCode ? 'কাজ শুরু করুন' : 'সাইট দেখুন'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 2. ক্যাটাগরি ফিল্টার */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          সব কাজ ({microJobsList.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('microjob')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'microjob'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          💼 মাইক্রোজব
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('video')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'video'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🎬 ২ মিনিট ভিডিও
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('social')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'social'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          👍 সোশ্যাল কাজ
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('survey')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'survey'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          📋 শর্ট সার্ভে
        </button>
      </div>

      {/* ⚡ 3. ইন-অ্যাপ ২-৩ মিনিটের ভেরিফাইড টাস্ক লিস্ট */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>সহজ ২-৩ মিনিটের লাইভ টাস্ক</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {completedTaskIds.length}/{microJobsList.length} সম্পন্ন
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredJobs.map((job) => {
            const isDone = completedTaskIds.includes(job.id);
            return (
              <div
                key={job.id}
                onClick={() => handleOpenJob(job)}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between group active:scale-98 cursor-pointer ${
                  isDone 
                    ? 'bg-[#0a1612] border-emerald-500/30' 
                    : 'bg-[#0C0F1A] border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition border ${
                    isDone 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-950 border-slate-800 group-hover:scale-105'
                  }`}>
                    {isDone ? '✅' : job.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white block">
                        {job.titleBn}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {job.descriptionBn}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        ⏱️ {job.timeEstimate}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                        {job.estPayoutBDT}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right pl-2 flex-shrink-0">
                  <span className="text-xs font-black text-amber-400 font-mono block">
                    +{job.rewardCoins} 🪙
                  </span>
                  <button
                    type="button"
                    className={`mt-1.5 px-3 py-1 rounded-xl font-black text-[10px] shadow transition flex items-center gap-1 cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>সম্পন্ন</span>
                      </>
                    ) : (
                      <>
                        <span>শুরু করুন</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💡 4. টিপস কার্ড: কীভাবে দ্রুত বেশি আয় করবেন */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>ইউজারদের জন্য গুরুত্বপূর্ণ পরামর্শ 💡</span>
        </div>
        <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span>প্রতিটি টাস্কে ২ থেকে ৩ মিনিট সময় দিলে স্বয়ংক্রিয়ভাবে কয়েন যোগ হবে। দ্রুত বের হয়ে গেলে কয়েন বাতিল হতে পারে।</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span>প্রতিদিন ৫-১০টি মাইক্রোজব করলে সহজেই ৫০ থেকে ১৫০ টাকা আয় করে বিকাশ/নগদে ক্যাশআউট করতে পারবেন।</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span>কোনো সাইটে টাকা বা রেজিস্ট্রেশন ফি দিতে বলা হলে দিবেন না—এই অ্যাপের সকল কাজ ১০০% ফ্রি!</span>
          </li>
        </ul>
      </div>

      {/* 📋 5. ACTIVE TASK EXECUTION & LIVE TIMER MODAL */}
      {activeJob && (
        <div className="fixed inset-0 z-[9999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0B111D] border-2 border-emerald-500/50 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeJob.icon}</span>
                <div>
                  <h4 className="text-sm font-black text-white leading-tight">
                    {activeJob.titleBn}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {activeJob.platformName} • {activeJob.timeEstimate}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveJob(null);
                  setIsTimerRunning(false);
                }}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Countdown Clock Display */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-2">
              <span className="text-[11px] text-slate-400 block font-bold">
                কাজের সময় কাউন্টডাউন
              </span>
              <div className="text-4xl font-black text-emerald-400 font-mono tracking-wider">
                {formatTimer(timerRemaining)}
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                {timerRemaining > 0 
                  ? 'টাস্কের লিঙ্কে গিয়ে অপেক্ষা করুন। সময় শেষ হলে নিচের বাটন সক্রিয় হবে।'
                  : '🎉 সময় সফলভাবে সম্পন্ন হয়েছে! এখন রিওয়ার্ড ক্লেইম করুন।'}
              </p>
            </div>

            {/* Instructions */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
              <span className="font-bold text-white block">ধাপসমূহ:</span>
              {activeJob.instructionsBn.map((inst, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            {/* Reopen Button */}
            <button
              type="button"
              onClick={handleReopenUrl}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>টাস্ক সাইটে পুনরায় যান</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Claim / Complete Button */}
            <button
              type="button"
              disabled={timerRemaining > 0 || isSubmitting}
              onClick={handleClaimReward}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition cursor-pointer ${
                timerRemaining === 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/30 hover:brightness-110 active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {timerRemaining > 0 ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>আরও {timerRemaining} সেকেন্ড অপেক্ষা করুন</span>
                </>
              ) : isSubmitting ? (
                <span>যাচাই করা হচ্ছে...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>+{activeJob.rewardCoins} কয়েন ক্লেইম করুন ({activeJob.estPayoutBDT}) 🎁</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 💼 USER JOB POSTING MODAL */}
      {showPostJobModal && (
        <PostJobModal 
          onClose={() => setShowPostJobModal(false)} 
          onJobCreated={loadCommunityJobs} 
        />
      )}
    </div>
  );
};
