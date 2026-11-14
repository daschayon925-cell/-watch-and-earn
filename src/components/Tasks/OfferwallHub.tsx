import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Award, 
  Coins, 
  Zap, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Globe, 
  X, 
  Smartphone, 
  FileText, 
  Gamepad2, 
  HelpCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Flag,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { soundService } from '../../services/audio';
import { api } from '../../services/api';
import { openAdWithStrictTimer } from '../Common/AdVisitTimerModal';
import { AiTaskAssistantModal } from './AiTaskAssistantModal';

interface OfferwallProvider {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  icon: string;
  descBn: string;
  descEn: string;
  avgReward: string;
  payoutRange: string;
  partnerType: 'BitcoTasks' | 'Affmine' | 'Freecash' | 'OfferwallMe' | 'Lootly' | 'AdGem' | 'CPX' | 'CPAGrip' | 'AdsterraTask' | 'HilltopAdsTask' | 'MonetagTask' | 'ZeydooTask';
  status: 'active' | 'popular' | 'high_rate';
}

interface CpaTask {
  id: string;
  title: string;
  category: 'bd' | 'usa' | 'app' | 'survey' | 'gaming';
  country: 'BD' | 'USA' | 'GLOBAL';
  icon: string;
  provider: string;
  time: string;
  reward: number;
  estPayoutBDT: string;
  difficulty: string;
  link: string;
  payoutUSD?: string;
}

interface OfferwallHubProps {
  onSwitchToDailyTasks?: () => void;
}

export const OfferwallHub: React.FC<OfferwallHubProps> = ({ onSwitchToDailyTasks }) => {
  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { language, showToast, triggerConfetti, settings } = useApp();

  const [activeCountryTab, setActiveCountryTab] = useState<'bd' | 'usa' | 'all'>('bd');
  const [activeOfferwallUrl, setActiveOfferwallUrl] = useState<string | null>(null);
  const [activeWallName, setActiveWallName] = useState<string>('');
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFreecashCode, setCopiedFreecashCode] = useState<boolean>(false);
  const [showAiAssistantModal, setShowAiAssistantModal] = useState<boolean>(false);

  // 🛡️ User's Verified Ad Networks & Direct Links
  const hilltopAdsDirectLink = settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c';
  const adsterraDirectLink = settings?.adsConfig?.adsterraDirectLink?.trim() || 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';
  const monetagDirectLink = settings?.adsConfig?.monetagDirectLink?.trim() || 'https://uplcm.com/4/11971342';

  // 🎯 User's Verified Offerwall Accounts & Active Referral Codes
  const freecashUrl = settings?.offerwallsConfig?.freecashUrl?.trim() || 'https://freecash.com/r/39Z5IH';
  const freecashReferralCode = settings?.offerwallsConfig?.freecashReferralCode?.trim() || '39Z5IH';
  const cpxAppId = settings?.offerwallsConfig?.cpxAppId?.trim() || '36966';
  const offerwallMeApiKey = settings?.offerwallsConfig?.offerwallMeApiKey?.trim() || '6yHRmktW7Ouf75SHc826oSbiYGu06W';
  const offerwallMeUrl = settings?.offerwallsConfig?.offerwallMeUrl?.trim() || '';
  const offerwallMePlacementId = settings?.offerwallsConfig?.offerwallMePlacementId?.trim() || '6aca33472eaa6484016c37d7';
  const lootlyApiKey = settings?.offerwallsConfig?.lootlyApiKey?.trim() || 'pj9b1buxrh05dt8eito0x8jxei21c3';
  const lootlyAppId = settings?.offerwallsConfig?.lootlyAppId?.trim() || '16';
  const adgemAppId = settings?.offerwallsConfig?.adgemAppId?.trim() || '';
  const adgemWallUrl = settings?.offerwallsConfig?.adgemWallUrl?.trim() || '';

  // 💎 শুধুমাত্র যেসকল প্ল্যাটফর্মে ইউজারের অ্যাকাউন্ট বা কোড যুক্ত রয়েছে
  const providers: OfferwallProvider[] = [
    // 🔥 1. OFFICIAL BITCOTASKS VERIFIED OFFERWALL (User's Verified Key: el15zv6b8o9kz3i9haq63pgtpdiivh)
    {
      id: 'bitcotasks_hub',
      name: 'BitcoTasks অল-ইন-ওয়ান হাব (সার্ভে, অফার ও পিটিসি)',
      badge: 'অফিসিয়াল পার্টনার 🔥',
      badgeColor: 'from-amber-500 via-orange-600 to-red-600',
      icon: '🔥',
      descBn: 'পেইড সার্ভে (CPX/BitLabs), মোবাইল অ্যাপ ইনস্টল, গেম ও পিটিসি অ্যাডস—সর্বোচ্চ কয়েন ও অটোমেটিক পোস্টব্যাক',
      descEn: 'All-in-one verified offerwall: Paid surveys, mobile apps, games & PTC rewards',
      avgReward: '+২০০ – +৮,০০০ 🪙',
      payoutRange: '৳৩.০০ – ৳১০০.০০+',
      partnerType: 'BitcoTasks',
      status: 'popular'
    },
    // 💎 2. OFFICIAL AFFMINE VERIFIED OFFERWALL (User's Verified Wall #6741 - ow_6aee0425704f4)
    {
      id: 'affmine_hub',
      name: 'Affmine অফিশিয়াল অফারওয়াল ও অ্যাপস (#6741)',
      badge: 'অফিসিয়াল পার্টনার 💎',
      badgeColor: 'from-emerald-600 to-teal-600',
      icon: '💎',
      descBn: 'মোবাইল অ্যাপ ইনস্টল, হাই-পেয়িং গেম ও সাইন-আপ—সরাসরি অনুমোদিত অফিশিয়াল অফারওয়াল',
      descEn: 'Premium mobile apps, top rewarding games and verified CPA offers',
      avgReward: '+৩০০ – +৬,০০০ 🪙',
      payoutRange: '৳৫.০০ – ৳৯০.০০+',
      partnerType: 'Affmine',
      status: 'popular'
    },
    // ⚡ 2. OFFICIAL PARTNER: Zeydoo SmartLink & Surveys (User's Verified Zone: 12138356)
    {
      id: 'zeydoo_hub',
      name: 'Zeydoo গ্লোবাল স্মার্টলিঙ্ক ও সার্ভে',
      badge: 'অফিসিয়াল পার্টনার ⚡',
      badgeColor: 'from-blue-600 to-indigo-600',
      icon: '⚡',
      descBn: 'স্মার্ট সার্ভে, মোবাইল অফার ও গেম খেলে সর্বোচ্চ রিওয়ার্ড—বাংলাদেশি মোবাইল ইউজারদের জন্য শতভাগ কার্যকর',
      descEn: 'Smart surveys, mobile apps & mini games with instant automatic payout',
      avgReward: '+১৫০ – +৩,০০০ 🪙',
      payoutRange: '৳২.০০ – ৳৪৫.০০+',
      partnerType: 'ZeydooTask',
      status: 'active'
    },
    // 🎯 2. OFFICIAL OFFERWALL: Offerwall.me (User's Verified Account - 6aca33472eaa6484016c37d7)
    {
      id: 'offerwall_me',
      name: 'Offerwall.me স্পেশাল হাব',
      badge: 'অফিসিয়াল পার্টনার 🎯',
      badgeColor: 'from-amber-500 to-emerald-500',
      icon: '🎯',
      descBn: 'গেমিং, প্রিমিয়াম সার্ভে ও হাই-পেয়িং মোবাইল অফার—সফল টাস্কে সরাসরি নিশ্চিত কয়েন ও ডলার রিওয়ার্ড',
      descEn: 'Mobile games, top surveys & high-payout offers with server-verified reward credits',
      avgReward: '+২০০ – +৫,০০০ 🪙',
      payoutRange: '৳৩.০০ – ৳৭৫.০০+',
      partnerType: 'OfferwallMe',
      status: 'active'
    },
    // 🎁 2. OFFICIAL OFFERWALL: Lootly (User's Verified Account - App #16)
    {
      id: 'lootly_hub',
      name: 'Lootly Global Offerwall',
      badge: 'অফিসিয়াল পার্টনার 🎁',
      badgeColor: 'from-purple-600 to-indigo-600',
      icon: '🎁',
      descBn: 'গেমিং অফার, মোবাইল অ্যাপ ইনস্টল ও সার্ভে করে বড় কয়েন আর্ন করুন (পাসিং ভেরিফিকেশন)',
      descEn: 'Mobile games, app trials, PTC tasks and top rewarding surveys',
      avgReward: '+২০০ – +৪,০০০ 🪙',
      payoutRange: '৳২.৫০ – ৳৬০.০০+',
      partnerType: 'Lootly',
      status: 'active'
    },
    // 📊 3. CPX RESEARCH OFFICIAL SURVEY HUB (User's Verified App ID: 36966)
    {
      id: 'cpx_hub',
      name: 'CPX Research পেইড সার্ভে ও কুইজ',
      badge: 'ভেরিফায়েড সার্ভে 📊',
      badgeColor: 'from-emerald-500 to-teal-600',
      icon: '📊',
      descBn: 'সহজ প্রশ্ন-উত্তর, মতামত সার্ভে ও কুইজ পূরণ করে নিশ্চিত ডলার ও কয়েন ইনকাম (ডিসকোয়ালিফাই হলেও বোনাস কয়েন)',
      descEn: 'Top global surveys & quizzes with guaranteed consolation coin rewards',
      avgReward: '+১৫০ – +১,৫০০ 🪙',
      payoutRange: '৳২.০০ – ৳২৫.০০+',
      partnerType: 'CPX',
      status: 'popular'
    },
    // 💵 4. FREECASH MEGA GLOBAL REWARD HUB (User's Verified Partner Code: 39Z5IH)
    {
      id: 'freecash_hub',
      name: 'Freecash গ্লোবাল হাব ($1 - $20+)',
      badge: 'বিশ্বসেরা ইনকাম 💎',
      badgeColor: 'from-emerald-500 to-green-600',
      icon: '💵',
      descBn: 'গেমিং অফার, মোবাইল অ্যাপ ইনস্টল ও সার্ভে করে সর্বোচ্চ সরাসরি ডলার রিওয়ার্ড (রেফারেল কোড: 39Z5IH)',
      descEn: 'Top global games, app trials & high-paying surveys ($1 - $20+ per offer)',
      avgReward: '+১,০০০ – +২৫,০০০ 🪙',
      payoutRange: '৳১০০ – ৳২,০০০+',
      partnerType: 'Freecash',
      status: 'high_rate'
    },
    // 🚀 5. ADGEM OFFERWALL (WatchEarnBD - iFrame & Postback Ready)
    {
      id: 'adgem_hub',
      name: 'AdGem গ্লোবাল অফারওয়াল',
      badge: 'কানেক্টেড পার্টনার 🚀',
      badgeColor: 'from-blue-600 to-cyan-600',
      icon: '🚀',
      descBn: 'জনপ্রিয় গেম লেভেল পার, মোবাইল অ্যাপ টেস্ট ও আন্তর্জাতিক হাই-পেইং অফার (WatchEarnBD)',
      descEn: 'Play top games, test apps & earn high coin payouts with server postback',
      avgReward: '+৩০০ – +৬,০০০ 🪙',
      payoutRange: '৳৫.০০ – ৳৮০.০০+',
      partnerType: 'AdGem',
      status: 'high_rate'
    },
    // 🌐 6. CPAGRIP GLOBAL CPA OFFERS & CONTENT LOCKER (User's Verified Account)
    {
      id: 'cpagrip_hub',
      name: 'CPAGrip গ্লোবাল অফার হাব',
      badge: 'টপ ডলার অফার 💵',
      badgeColor: 'from-emerald-600 to-green-600',
      icon: '💵',
      descBn: 'গেমিং অ্যাপ ইনস্টল, গিফট কার্ড ও অফার পূরণ করে সরাসরি ডলারে রিওয়ার্ড আর্ন করুন',
      descEn: 'Install apps, sign up and complete high-paying international CPA offers',
      avgReward: '+৩০০ – +৮,০০০ 🪙',
      payoutRange: '৳৫.০০ – ৳১০০.০০+',
      partnerType: 'CPAGrip',
      status: 'high_rate'
    },
    // 💎 5. ADSTERRA HIGH-CPM SPONSOR HUB (User's Verified Account)
    {
      id: 'adsterra_hub',
      name: 'Adsterra হাই-রেট স্পন্সর অফার',
      badge: 'ইনস্ট্যান্ট কয়েন 💎',
      badgeColor: 'from-blue-600 to-indigo-600',
      icon: '💎',
      descBn: 'হাই-সিপিএম স্পন্সর পেজ ভিজিট করুন এবং প্রতি সম্পন্ন টাস্কে সরাসরি ওয়ালেটে কয়েন পান',
      descEn: 'Visit verified high-CPM sponsor offers & get instant coin rewards',
      avgReward: '+১০০ – +৫০০ 🪙',
      payoutRange: '৳১.৫০ – ৳৭.৫০',
      partnerType: 'AdsterraTask',
      status: 'high_rate'
    },
    // 🎁 6. HILLTOPADS VIP SPONSOR REWARDS (User's Verified Account)
    {
      id: 'hilltop_hub',
      name: 'HilltopAds ভিআইপি স্পন্সর হাব',
      badge: 'টপ স্পন্সর 🎁',
      badgeColor: 'from-emerald-500 to-teal-600',
      icon: '🎁',
      descBn: '১০০% ফ্রি স্পন্সর ওয়েবসাইট ও অ্যাপ ট্রায়াল ভিজিট করে বড় বোনাস কয়েন সংগ্রহ করুন',
      descEn: '100% free sponsor website visits and bonus coin rewards',
      avgReward: '+১২০ – +৬০০ 🪙',
      payoutRange: '৳১.৮০ – ৳৯.০০',
      partnerType: 'HilltopAdsTask',
      status: 'popular'
    },
    // ⚡ 7. MONETAG VIP SMARTLINK SPONSOR (User's Verified Account)
    {
      id: 'monetag_hub',
      name: 'Monetag স্মার্টলিঙ্ক স্পন্সর',
      badge: 'হাই CPM স্পন্সর ⚡',
      badgeColor: 'from-purple-600 to-pink-600',
      icon: '⚡',
      descBn: 'স্মার্টলিঙ্ক স্পন্সর পেজ ভিউ করে ২০ সেকেন্ডে নিশ্চিত বোনাস কয়েন সংগ্রহ করুন',
      descEn: 'View smartlink sponsor offer page and earn instant bonus coins',
      avgReward: '+১১০ – +৫৫০ 🪙',
      payoutRange: '৳১.৬৫ – ৳৮.০০',
      partnerType: 'MonetagTask',
      status: 'active'
    }
  ];

  // 🇧🇩 বাংলাদেশ ও 🇺🇸 USA লাইভ CPALead ও HilltopAds ১০০% ফ্রি অফার লিস্ট (কোনো টাকা লাগবে না)
  const curatedTasks: CpaTask[] = [
    // ⚡ Zeydoo Official Smartlink Survey & Playable Task (User's Verified Zone 12138356)
    {
      id: 'zeydoo_smart_survey_bd',
      title: 'Zeydoo স্মার্ট ওপিনিয়ন সার্ভে ও কুইজ ⚡',
      category: 'bd',
      country: 'BD',
      icon: '⚡',
      provider: 'Zeydoo SmartLink',
      time: '১-২ মিনিট',
      reward: 200,
      estPayoutBDT: '৳৩.০০',
      difficulty: '১০০% ফ্রি স্মার্ট সার্ভে',
      link: `https://nya5.com/link?z=12138356&var=${encodeURIComponent(user?.uid || 'guest')}&ymid=${encodeURIComponent('task_survey_' + Date.now())}`
    },
    {
      id: 'zeydoo_playable_click_bd',
      title: 'Zeydoo প্লে-অ্যান্ড-উইন মোবাইল গেম ট্রায়াল 🎮',
      category: 'bd',
      country: 'BD',
      icon: '🎯',
      provider: 'Zeydoo SmartLink',
      time: '২ মিনিট',
      reward: 250,
      estPayoutBDT: '৳৩.৭৫',
      difficulty: '১০০% ফ্রি গেম ট্রায়াল',
      link: `https://nya5.com/link?z=12138356&var=${encodeURIComponent(user?.uid || 'guest')}&ymid=${encodeURIComponent('task_game_' + Date.now())}`
    },
    // 🚀 HilltopAds VIP Sponsor (100% Free Website Visit)
    {
      id: 'hilltop_direct_7488677',
      title: 'HilltopAds ফ্রি স্পন্সর ওয়েবসাইট ভিজিট ও বোনাস 🚀',
      category: 'bd',
      country: 'GLOBAL',
      icon: '🌐',
      provider: 'HilltopAds Sponsor',
      time: '২০ সেকেন্ড',
      reward: 70,
      estPayoutBDT: '৳১.০৫',
      difficulty: '১০০% ফ্রি (টাকা লাগবে না)',
      link: settings?.adsConfig?.hilltopAdsDirectLink?.trim() || 'https://affectionatestorage.com/Ah6g5c'
    },
    // 🇧🇩 100% FREE BANGLADESH TASKS (NO MONEY / NO DEPOSIT)
    {
      id: 'bd_cpa_5547000',
      title: 'স্পন্সর ওয়েবসাইট ভিজিট ও ৩০ সেকেন্ড ভিউ 📱',
      category: 'bd',
      country: 'BD',
      icon: '📲',
      provider: 'HilltopAds Premium',
      time: '৩০ সেকেন্ড',
      reward: 180,
      estPayoutBDT: '৳২.৭০',
      difficulty: '১০০% ফ্রি ভিজিট',
      link: hilltopAdsDirectLink
    },
    {
      id: 'bd_cpa_5547029',
      title: 'ফ্রি ওপিনিয়ন সার্ভে ও ক্যাশব্যাক ভিউ 📋',
      category: 'bd',
      country: 'BD',
      icon: '📝',
      provider: 'Adsterra SmartLink',
      time: '২০ সেকেন্ড',
      reward: 160,
      estPayoutBDT: '৳২.৪০',
      difficulty: '১০০% ফ্রি ভিউ',
      link: adsterraDirectLink
    },
    {
      id: 'bd_cpa_5546977',
      title: 'স্পন্সর ব্লগ আর্টিকেল পড়ুন ও ২০ সেকেন্ড স্ক্রোল 📰',
      category: 'bd',
      country: 'BD',
      icon: '📰',
      provider: 'HilltopAds Sponsor',
      time: '২০ সেকেন্ড',
      reward: 90,
      estPayoutBDT: '৳১.৩৫',
      difficulty: '১০০% ফ্রি ভিজিট',
      link: hilltopAdsDirectLink
    },
    {
      id: 'bd_cpa_5546987',
      title: 'অনলাইন শর্ট স্পন্সর ভিডিও দেখুন ও রিওয়ার্ড নিন 🎬',
      category: 'bd',
      country: 'BD',
      icon: '🎬',
      provider: 'Adsterra Video',
      time: '৩০ সেকেন্ড',
      reward: 110,
      estPayoutBDT: '৳১.৬৫',
      difficulty: '১০০% ফ্রি ভিডিও',
      link: adsterraDirectLink
    },
    {
      id: 'bd_cpa_free_game_trial',
      title: 'ফ্রি অনলাইন ব্রাউজার গেম টেস্ট ও ৩০ সেকেন্ড প্লে 🎮',
      category: 'bd',
      country: 'BD',
      icon: '🕹️',
      provider: 'Game Sponsor',
      time: '৩০ সেকেন্ড',
      reward: 100,
      estPayoutBDT: '৳১.৫০',
      difficulty: '১০০% ফ্রি গেম',
      link: hilltopAdsDirectLink
    },
    {
      id: 'bd_cpa_coupon_deals',
      title: 'দারাজ ও ফুডপান্ডা ফ্রি ডিসকাউন্ট কুপন ব্রাউজ 🛍️',
      category: 'bd',
      country: 'BD',
      icon: '🛍️',
      provider: 'Deals Sponsor',
      time: '২০ সেকেন্ড',
      reward: 85,
      estPayoutBDT: '৳১.২৮',
      difficulty: '১০০% ফ্রি ব্রাউজ',
      link: adsterraDirectLink
    },

    // 🇺🇸 USA & GLOBAL 100% FREE TASKS (High-Reward)
    {
      id: 'usa_cpa_5544943',
      title: 'গ্লোবাল স্পন্সর ওয়েবসাইট ভিজিট ও ফ্রি অফার ভিউ 🌍',
      category: 'usa',
      country: 'GLOBAL',
      icon: '💎',
      provider: 'Global Sponsor Visit',
      time: '২৫ সেকেন্ড',
      reward: 140,
      estPayoutBDT: '৳২.১০',
      difficulty: '১০০% ফ্রি',
      link: hilltopAdsDirectLink
    },
    {
      id: 'usa_cpa_5546165',
      title: 'অনলাইন সাধারণ জ্ঞান কুইজ ও ফ্রি গিফট কার্ড চেক 🎁',
      category: 'usa',
      country: 'USA',
      icon: '🎁',
      provider: 'Free US Quiz',
      time: '১.৫ মিনিট',
      reward: 160,
      estPayoutBDT: '৳২.৪০',
      difficulty: '১০০% ফ্রি',
      link: adsterraDirectLink
    },
    {
      id: 'usa_cpa_5547038',
      title: 'ফ্রি ডিসকাউন্ট কুপন ও ক্যাশব্যাক পেজ ভিউ 🛍️',
      category: 'usa',
      country: 'USA',
      icon: '🛍️',
      provider: 'Free Coupon View',
      time: '২০ সেকেন্ড',
      reward: 90,
      estPayoutBDT: '৳১.৩৫',
      difficulty: 'সহজ ভিজিট',
      link: hilltopAdsDirectLink
    },
    {
      id: 'usa_cpa_5547037',
      title: 'ফ্রি অনলাইন ব্রাউজার মিনি গেম ট্রায়াল 🎮',
      category: 'usa',
      country: 'USA',
      icon: '🕹️',
      provider: 'Free Mini Game',
      time: '১ মিনিট',
      reward: 110,
      estPayoutBDT: '৳১.৬৫',
      difficulty: '১০০% ফ্রি গেম',
      link: adsterraDirectLink
    }
  ];

  const handleOpenProvider = (provider: OfferwallProvider) => {
    soundService.playCoinReward();
    const userId = user?.uid || 'user_guest';
    let url = '';

    if (provider.partnerType === 'BitcoTasks') {
      const apiKey = settings?.offerwallsConfig?.bitcotasksApiKey || 'el15zv6b8o9kz3i9haq63pgtpdiivh';
      const bitcotasksUrl = `https://bitcotasks.com/offerwall/${encodeURIComponent(apiKey)}/${encodeURIComponent(userId)}`;
      try {
        const win = window.open(bitcotasksUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          setActiveOfferwallUrl(bitcotasksUrl);
          setActiveWallName(provider.name);
        }
        showToast(
          'BitcoTasks অফিশিয়াল অফারওয়াল ওপেন হয়েছে 🔥',
          'সার্ভে, গেম বা অফার পূরণ করলে সরাসরি কয়েন যোগ হবে এবং মালিকের একাউন্টে ডলারে জমা হবে।',
          'success'
        );
      } catch {
        setActiveOfferwallUrl(bitcotasksUrl);
        setActiveWallName(provider.name);
      }
      return;
    }

    if (provider.partnerType === 'Affmine') {
      const affmineWallCode = settings?.offerwallsConfig?.affmineOfferwallCode || 'ow_6aee0425704f4';
      const affmineUrl = `https://affgo.xyz/offerwall/?o=${encodeURIComponent(affmineWallCode)}&s1=${encodeURIComponent(userId)}`;
      try {
        const win = window.open(affmineUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          setActiveOfferwallUrl(affmineUrl);
          setActiveWallName(provider.name);
        }
        showToast(
          'Affmine অফিশিয়াল অফারওয়াল ওপেন হয়েছে 💎',
          'যেকোনো অ্যাপ ডাউনলোড বা অফার পূরণ করলে সরাসরি কয়েন যোগ হবে এবং ডলার মালিকের একাউন্টে যুক্ত হবে।',
          'success'
        );
      } catch {
        setActiveOfferwallUrl(affmineUrl);
        setActiveWallName(provider.name);
      }
      return;
    }

    if (provider.partnerType === 'ZeydooTask') {
      const clickId = 'c_' + userId + '_' + Date.now();
      const zeydooUrl = `https://nya5.com/link?z=12138356&var=${encodeURIComponent(userId)}&ymid=${encodeURIComponent(clickId)}`;
      try {
        const win = window.open(zeydooUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          setActiveOfferwallUrl(zeydooUrl);
          setActiveWallName(provider.name);
        }
        showToast(
          'Zeydoo স্মার্টলিঙ্ক ওপেন হয়েছে ⚡',
          'সার্ভে বা অফার সফলভাবে সম্পন্ন হলে স্বয়ংক্রিয় পোস্টব্যাকের মাধ্যমে আপনার একাউন্টে কয়েন জমা হবে।',
          'success'
        );
      } catch {
        window.location.href = zeydooUrl;
      }
      return;
    } else if (provider.partnerType === 'Freecash') {
      try {
        const win = window.open(freecashUrl, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          setActiveOfferwallUrl(freecashUrl);
          setActiveWallName(provider.name);
        }
        showToast(
          'Freecash গ্লোবাল হাব ওপেন হয়েছে 💵',
          `রেফারেল কোড ${freecashReferralCode} স্বয়ংক্রিয়ভাবে সক্রিয় থাকবে। ফ্রি কেস ও $২৫০ পর্যন্ত বোনাস নিন!`,
          'success'
        );
      } catch {
        setActiveOfferwallUrl(freecashUrl);
        setActiveWallName(provider.name);
      }
      return;
    } else if (provider.partnerType === 'AdsterraTask') {
      openAdWithStrictTimer(adsterraDirectLink, 'Adsterra স্পন্সর অফার', 100, 20);
      return;
    } else if (provider.partnerType === 'HilltopAdsTask') {
      openAdWithStrictTimer(hilltopAdsDirectLink, 'HilltopAds স্পন্সর হাব', 120, 20);
      return;
    } else if (provider.partnerType === 'MonetagTask') {
      openAdWithStrictTimer(monetagDirectLink, 'Monetag স্মার্টলিঙ্ক স্পন্সর', 110, 20);
      return;
    } else if (provider.partnerType === 'OfferwallMe') {
      const activeApiKey = offerwallMeApiKey || '6yHRmktW7Ouf75SHc826oSbiYGu06W';
      const fallbackUrl = offerwallMeUrl
        ? (offerwallMeUrl.includes('?') ? `${offerwallMeUrl}&userId=${encodeURIComponent(userId)}` : `${offerwallMeUrl}?userId=${encodeURIComponent(userId)}`)
        : `https://offerwall.me/offerwall/${encodeURIComponent(activeApiKey)}/${encodeURIComponent(userId)}`;
      
      const openOfferwall = async () => {
        let targetUrl = fallbackUrl;
        try {
          const res = await fetch(`/api/offerwall/get-signed-url?userId=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.success && data?.url) {
              targetUrl = data.url;
            }
          }
        } catch {
          // fallback
        }

        try {
          const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
          if (!win || win.closed || typeof win.closed === 'undefined') {
            setActiveOfferwallUrl(targetUrl);
            setActiveWallName(provider.name);
          }
        } catch {
          setActiveOfferwallUrl(targetUrl);
          setActiveWallName(provider.name);
        }
      };

      openOfferwall();
      showToast(
        'Offerwall.me অফারওয়াল ওপেন হচ্ছে 🎯',
        'গেম, সার্ভে বা টাস্ক সম্পন্ন হলে সার্ভার ভেরিফিকেশনের মাধ্যমে স্বয়ংক্রিয়ভাবে ওয়ালেটে কয়েন যোগ হবে।',
        'info'
      );
      return;
    } else if (provider.partnerType === 'Lootly') {
      const activeLootlyKey = lootlyApiKey || 'pj9b1buxrh05dt8eito0x8jxei21c3';
      url = `https://offerwall.lootly.fun/offerwall/${encodeURIComponent(activeLootlyKey)}/${encodeURIComponent(userId)}`;
    } else if (provider.partnerType === 'CPX') {
      const appId = cpxAppId || '36966';
      url = `https://offers.cpx-research.com/index.php?app_id=${encodeURIComponent(appId)}&ext_user_id=${encodeURIComponent(userId)}`;
      try {
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          setActiveOfferwallUrl(url);
          setActiveWallName(provider.name);
        }
        showToast(
          'CPX Research সার্ভে হাব ওপেন হয়েছে 📊',
          'সার্ভে বা কুইজ সফলভাবে সম্পন্ন হলে সরাসরি আপনার একাউন্টে কয়েন জমা হবে।',
          'info'
        );
      } catch {
        setActiveOfferwallUrl(url);
        setActiveWallName(provider.name);
      }
      return;
    } else if (provider.partnerType === 'AdGem') {
      if (adgemWallUrl) {
        url = adgemWallUrl.includes('?') 
          ? `${adgemWallUrl}&player_id=${encodeURIComponent(userId)}&playerid=${encodeURIComponent(userId)}` 
          : `${adgemWallUrl}?player_id=${encodeURIComponent(userId)}&playerid=${encodeURIComponent(userId)}`;
      } else if (adgemAppId) {
        url = `https://api.adgem.com/v1/wall?appid=${encodeURIComponent(adgemAppId)}&playerid=${encodeURIComponent(userId)}`;
      } else {
        showToast(
          'AdGem অফারওয়াল সংযুক্ত হচ্ছে! 🚀',
          'AdGem অ্যাকাউন্ট তৈরি সম্পন্ন হচ্ছে। ড্যাশবোর্ড থেকে App ID পাওয়ার পর এটি সরাসরি চালু হয়ে যাবে।',
          'info'
        );
        return;
      }
    } else if (provider.partnerType === 'CPAGrip') {
      const cpagripUrl = settings?.offerwallsConfig?.cpagripUrl?.trim();
      if (cpagripUrl) {
        url = cpagripUrl.includes('?') 
          ? `${cpagripUrl}&tracking_id=${encodeURIComponent(userId)}&subid=${encodeURIComponent(userId)}` 
          : `${cpagripUrl}?tracking_id=${encodeURIComponent(userId)}&subid=${encodeURIComponent(userId)}`;
      } else {
        url = 'https://www.cpagrip.com/';
      }
    }

    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        setActiveOfferwallUrl(url);
        setActiveWallName(provider.name);
      }
      showToast(
        `${provider.name} অফারওয়াল ওপেন হয়েছে 🎯`,
        'কাজ বা সার্ভে সফলভাবে সম্পন্ন হলে প্রোভাইডার ভেরিফিকেশন শেষে স্বয়ংক্রিয়ভাবে কয়েন যোগ হবে।',
        'info'
      );
    } catch {
      setActiveOfferwallUrl(url);
      setActiveWallName(provider.name);
    }
  };

  const handleStartTask = (task: CpaTask) => {
    soundService.playCoinReward();
    const userId = user?.uid || 'user_guest';
    const separator = task.link.includes('?') ? '&' : '?';
    const finalUrl = `${task.link}${separator}subid=${encodeURIComponent(userId)}&taskId=${task.id}`;

    // 🛡️ Genuine task verification: user visits the task page for 20s and receives verified coins!
    openAdWithStrictTimer(finalUrl, task.title, Math.min(task.reward, 50), 20);
  };

  const handleCopyLink = (task: CpaTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = user?.uid || 'user_guest';
    const separator = task.link.includes('?') ? '&' : '?';
    const finalUrl = `${task.link}${separator}subid=${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(finalUrl);
    setCopiedId(task.id);
    showToast('অফার লিংক কপি হয়েছে ✓', 'সোশ্যাল মিডিয়া বা বন্ধুদের শেয়ার করতে পারেন!', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredTasks = activeCountryTab === 'all'
    ? curatedTasks
    : activeCountryTab === 'bd'
      ? curatedTasks.filter(t => t.country === 'BD')
      : curatedTasks.filter(t => t.country === 'USA');

  const bdCount = curatedTasks.filter(t => t.country === 'BD').length;
  const usaCount = curatedTasks.filter(t => t.country === 'USA').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 🌟 Header Banner: Verified Partner Offerwalls & Tasks */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600/95 via-orange-600/90 to-rose-700/95 p-5 sm:p-6 text-white shadow-2xl border border-amber-400/30">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black text-amber-200 border border-amber-300/30 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
              ভেরিফায়েড পার্টনার অফারওয়াল হাব 💎
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-1.5 flex items-center gap-2">
            <span>🎯 ভেরিফায়েড অফার ও স্পন্সর আর্নিং জোন</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-lg">
            পছন্দের অ্যাপ ডাউনলোড, ফ্রি সাইট ভিউ বা গেম খেলে প্রতি টাস্কে <span className="font-black text-amber-200">১২০ থেকে ৯০০ কয়েন</span> ইনস্ট্যান্ট আয় করুন!
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-200">
              <span className="text-sm">🇧🇩</span>
              <span>বাংলাদেশ: ৪টি অফার (১২০-২০০ 🪙)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-cyan-200">
              <span className="text-sm">🇺🇸</span>
              <span>USA স্পেশাল: ৮টি হাই-পেইং (৪৫০-৯০০ 🪙)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌐 BANGLA AI TASK TRANSLATOR & HELPER CARD */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xl shrink-0 shadow-md">
            🌐
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>অফারগুলোর ইংরেজি বুঝতে পারছেন না?</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">এআই অনুবাদক</span>
            </h4>
            <p className="text-[11px] text-slate-300">
              যেকোনো কাজের ইংরেজি লেখা কপি করে আমাদের বাংলা অনুবাদকে দিলে সহজ ধাপে কাজ বুঝিয়ে দেবে!
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAiAssistantModal(true)}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
        >
          <span>বাংলা অনুবাদক ও সাহায্য</span>
          <span>🤖</span>
        </button>
      </div>

      {/* 💡 Essential User Guideline for Bangladesh CPA Offers */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 text-xs space-y-1.5 shadow-lg">
        <div className="flex items-center gap-2 text-amber-300 font-black">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>কাজের জরুরি টিপস (১০০% ফ্রি কাজ করুন):</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          ✅ <strong>যা করবেন:</strong> শুধুমাত্র ১০০% ফ্রি অ্যাপ ডাউনলোড, ফ্রি সাইন-আপ ও ফ্রি সার্ভে কাজগুলো করবেন।<br />
          ❌ <strong>যা করবেন না:</strong> যেসকল অফারে টাকা ডিপোজিট করতে বা সিম থেকে এসএমএস দিয়ে টাকা কাটতে বলবে সেগুলো করবেন না, সেগুলো এড়িয়ে চলুন!
        </p>
      </div>

      {/* 📝 Quick Action: Jump to General Tasks & Daily Quiz */}
      {onSwitchToDailyTasks && (
        <button
          type="button"
          onClick={onSwitchToDailyTasks}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900/90 border border-purple-500/40 hover:border-purple-400 text-white flex items-center justify-between shadow-xl active:scale-[0.98] transition group"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 text-lg group-hover:scale-110 transition">
              📝
            </span>
            <div className="text-left">
              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-purple-300 flex items-center gap-1.5">
                <span>সাধারণ টাস্ক ও কুইজ মোড</span>
                <span className="px-1.5 py-0.2 rounded-md bg-purple-500/30 text-purple-200 text-[9px] font-bold">
                  ক্যাপচা • ম্যাথ • জিকে
                </span>
              </h4>
              <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                সহজ অংক ও ক্যাপচা সমাধান করে দ্রুত কয়েন জিতে নিন
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-black shrink-0 flex items-center gap-1 shadow-md">
            <span>সাধারণ টাস্ক</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      )}

      {/* 💵 FREECASH GLOBAL MEGA TASK & EARNING ZONE ($1 - $20+) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-[#062016] to-slate-950 border-2 border-emerald-500/50 p-4 sm:p-5 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xl shadow-inner">
                💵
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Freecash গ্লোবাল মেগা অফার জোন
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                    $১ – $২০+ প্রতি কাজ
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300 font-medium">
                  বিশ্বের #১ গেমিং ও হাই-পেইং মাইক্রোজব প্ল্যাটফর্ম (Instant Cashout)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>ফ্রি সাইনআপ কেস বোনাস ($২৫০ পর্যন্ত)</span>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            মোবাইল গেম খেলে লেভেল পার করা, বিভিন্ন প্রিমিয়াম অ্যাপ টেস্ট এবং আন্তর্জাতিক সার্ভে পূরণ করে সরাসরি <strong className="text-emerald-400">১ ডলার থেকে ২০ ডলার (১০০৳ থেকে ২০০০৳+)</strong> আয় করতে পারবেন।
          </p>

          {/* Referral Code & Action Buttons */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-slate-400">অফিশিয়াল রেফারেল কোড:</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-emerald-500/50 font-mono font-black text-sm text-emerald-400">
                <span>{freecashReferralCode}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(freecashReferralCode);
                    setCopiedFreecashCode(true);
                    showToast('কোড কপি হয়েছে ✓', `Freecash রেফারেল কোড: ${freecashReferralCode}`, 'success');
                    setTimeout(() => setCopiedFreecashCode(false), 2500);
                  }}
                  className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-300 transition"
                  title="Copy Referral Code"
                >
                  {copiedFreecashCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  soundService.playSuccessFanfare();
                  try {
                    window.open(freecashUrl, '_blank', 'noopener,noreferrer');
                    showToast(
                      'Freecash ওপেন হয়েছে 🚀',
                      `রেফারেল কোড ${freecashReferralCode} দিয়ে একাউন্ট খুলে কাজ শুরু করুন!`,
                      'success'
                    );
                  } catch {
                    setActiveOfferwallUrl(freecashUrl);
                    setActiveWallName('Freecash.com');
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
              >
                <span>ফ্রি ক্যাশে কাজ শুরু করুন</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
              <span className="block text-xs font-black text-emerald-300">🎮 গেম টাস্ক</span>
              <span className="text-[10px] text-slate-400">$১ - $১৫ / গেম</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
              <span className="block text-xs font-black text-emerald-300">📋 সার্ভে অফার</span>
              <span className="text-[10px] text-slate-400">$০.৫০ - $৩ / সার্ভে</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
              <span className="block text-xs font-black text-emerald-300">⚡ ইনস্ট্যান্ট পে</span>
              <span className="text-[10px] text-slate-400">ক্রিপ্টো / বিকাশ / পেপ্যাল</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Top 3 Featured Offerwall Networks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>অফিসিয়াল অফারওয়াল নেটওয়ার্ক</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">ট্যাপ করে প্রবেশ করুন</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {providers.map((p) => (
            <div
              key={p.id}
              onClick={() => handleOpenProvider(p)}
              className="relative group p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 shadow-lg cursor-pointer active:scale-[0.98] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-white/10 shadow-inner">
                      {p.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        {p.payoutRange} / কাজ
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black text-white bg-gradient-to-r ${p.badgeColor} shadow-sm shrink-0`}>
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {language === 'bn' ? p.descBn : p.descEn}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-300 text-xs font-black">
                  <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{p.avgReward}</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 px-3 py-1.5 rounded-xl shadow-md"
                >
                  <span>প্রবেশ করুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 Curated Micro-Tasks Section with Country Tabs */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
          <h3 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>ভেরিফাইড টাস্ক লিস্ট ({curatedTasks.length}টি লাইভ অফার)</span>
          </h3>
          
          {/* Country Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveCountryTab('bd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
                activeCountryTab === 'bd'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇧🇩</span>
              <span>বাংলাদেশ অফার ({bdCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCountryTab('usa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
                activeCountryTab === 'usa'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸</span>
              <span>USA স্পেশাল ({usaCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCountryTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 whitespace-nowrap ${
                activeCountryTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>সকল ({curatedTasks.length})</span>
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="space-y-2.5">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md transition"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <span className="text-2xl p-2.5 rounded-xl bg-slate-800/90 border border-white/5 shrink-0 shadow-inner">
                  {t.icon}
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      {t.title}
                    </h4>
                    <span className={`px-2 py-0.2 rounded-md text-[9px] font-black border ${
                      t.country === 'BD'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {t.country === 'BD' ? '🇧🇩 বাংলাদেশ' : '🇺🇸 USA'}
                    </span>
                    {t.payoutUSD && (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {t.payoutUSD}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-0.5 text-slate-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {t.time}
                    </span>
                    <span>•</span>
                    <span className="text-cyan-400">{t.provider}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{t.estPayoutBDT} সমমূল্য</span>
                    <span>•</span>
                    <span className="text-slate-400">{t.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <div className="text-left sm:text-right">
                  <span className="text-xs sm:text-sm font-black text-amber-400 block">
                    +{t.reward} 🪙
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">ইনস্ট্যান্ট কয়েন</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(t, e)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition"
                    title="লিংক কপি করুন"
                  >
                    {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartTask(t)}
                    disabled={verifyingTaskId === t.id}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>{verifyingTaskId === t.id ? 'যাচাই হচ্ছে...' : 'শুরু করুন'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ℹ️ Security & Anti-Fraud Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950/90 to-slate-900/90 border border-slate-800/80 flex items-start gap-3 text-slate-400 text-xs shadow-lg">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-[11px] leading-relaxed">
          <p>
            <strong className="text-slate-200 font-bold">🇧🇩 বাংলাদেশ অফার:</strong> সরাসরি সাধারণ ইন্টারনেট বা ওয়াইফাই সংযোগ দিয়েই শেষ করুন।
          </p>
          <p>
            <strong className="text-slate-200 font-bold">🇺🇸 USA স্পেশাল অফার:</strong> শুধুমাত্র USA ইউজার অথবা যারা আন্তর্জাতিক ট্রাফিক থেকে কাজটি করবেন তাদের জন্য প্রযোজ্য।
          </p>
        </div>
      </div>

      {/* 📱 Fullscreen Iframe Modal (Fallback if external window is blocked) */}
      {activeOfferwallUrl && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col justify-between animate-fadeIn">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-amber-300">🎯 {activeWallName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAiAssistantModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <span>🌐 বাংলা অনুবাদক</span>
              </button>
              <a
                href={activeOfferwallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition active:scale-95"
              >
                <span>নতুন ট্যাবে খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setActiveOfferwallUrl(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <iframe
            src={activeOfferwallUrl}
            className="w-full flex-1 border-0 bg-white"
            title="CPA Offerwall"
            allow="camera; microphone; geolocation"
          />
        </div>
      )}

      {/* 🌐 AI Task Assistant & Bengali Translator Modal */}
      <AiTaskAssistantModal
        isOpen={showAiAssistantModal}
        onClose={() => setShowAiAssistantModal(false)}
      />
    </div>
  );
};
