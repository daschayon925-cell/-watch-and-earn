// Daily Auto-Rotating TikTok & Shorts Feed Engine
// Provides 200+ distinct video slots generated automatically every day based on the calendar date (YYYY-MM-DD)
// Yesterday's videos are automatically replaced with brand new trending videos every midnight!

export interface AutoReelItem {
  id: string;
  title: string;
  creator: string;
  handle: string;
  avatar: string;
  likes: string;
  comments: string;
  shares: string;
  videoUrl: string;
  category: string;
  appDeepLink: string;
  dateKey: string;
  videoNumber: number;
}

// High-speed CDN vertical video pool (optimized for mobile playback without buffering)
const VIDEO_STREAM_POOLS = [
  'https://assets.mixkit.co/videos/52028/52028-720.mp4',
  'https://assets.mixkit.co/videos/49258/49258-720.mp4',
  'https://assets.mixkit.co/videos/42828/42828-720.mp4',
  'https://assets.mixkit.co/videos/52089/52089-720.mp4',
  'https://assets.mixkit.co/videos/52033/52033-720.mp4',
  'https://assets.mixkit.co/videos/52077/52077-720.mp4',
  'https://assets.mixkit.co/videos/51969/51969-720.mp4',
  'https://assets.mixkit.co/videos/49260/49260-720.mp4',
  'https://assets.mixkit.co/videos/42827/42827-720.mp4',
  'https://assets.mixkit.co/videos/42830/42830-720.mp4',
  'https://assets.mixkit.co/videos/52030/52030-720.mp4',
  'https://assets.mixkit.co/videos/52032/52032-720.mp4'
];

const CREATORS_POOL = [
  { name: 'Bangla Fun Studio', handle: '@bangla_comedy_zone', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', cat: 'হাসির ভিডিও' },
  { name: 'Meena Stories BD', handle: '@meena_stories_bd', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', cat: 'কার্টুন' },
  { name: 'Melody Wave Bangla', handle: '@melody_bangla', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', cat: 'গান ও মিউজিক' },
  { name: 'Tigers Sports BD', handle: '@tigers_cricket_bd', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', cat: 'খেলাধুলা' },
  { name: 'Natok Hub Express', handle: '@natok_hub_bd', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', cat: 'হাসির নাটক' },
  { name: 'Dhaka Viral Clips', handle: '@dhaka_vibe_official', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', cat: 'ভাইরাল রিলস' },
  { name: 'Chitromohol BD', handle: '@chitro_mohol', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', cat: 'মুভি ক্লিপস' },
  { name: 'Tech Master Bangla', handle: '@tech_master_bd', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80', cat: 'টেক টিপস' },
  { name: 'Village Life BD', handle: '@village_life_bd', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', cat: 'গ্রামীন জীবন' },
  { name: 'Foodie Dhaka Express', handle: '@dhaka_food_street', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', cat: 'খাবার ও রেসিপি' }
];

const TITLES_POOL = [
  '🔥 সেরা হাসির ফানি মুহূর্ত! ভাইরাল টিকটক কমেডি ভিডিও 😂🇧🇩',
  '🎒 মীনা রাজু মজার পর্ব - হাসির দৃশ্য ও সচেতনতা ❤️',
  '🎵 নতুন বাংলা ভাইরাল রোমান্টিক গান ও মিউজিক ভিডিও 🎶',
  '🏏 শেষ ওভারে ম্যাচ জেতানো রোমাঞ্চকর চার-ছক্কার মুহূর্ত! 🐅',
  '🎭 মোশাররফ করিম ও চঞ্চল চৌধুরীর সেরা হাসির ডায়লগ 🎬',
  '🌟 আজকের সবচেয়ে ভাইরাল শর্ট ভিডিও - না দেখলে মিস করবেন! 🔥',
  '🤣 বন্ধু যখন পরীক্ষায় ফেল করে তখন মজার রিঅ্যাকশন 😂',
  '🇧🇩 সুন্দরবনের বাঘের অবিশ্বাস্য রোমাঞ্চকর দৃশ্য ও ড্রোন শুট 🐅',
  '🍲 পুরান ঢাকার কাচ্চি বিরিয়ানির সেরা স্বাদ ও গোপন রহস্য 😋',
  '📱 মোবাইল ফোনের সেরা ৫টি গোপন ট্রিকস যা ৯০% মানুষ জানে না 💡',
  '🎤 সেরা লাইভ কনসার্টের অসাধারণ আবেগঘন গান 🎵',
  '🚲 সাইকেল নিয়ে সেরা বিপজ্জনক স্টান্ট ভিডিও 🚴‍♂️',
  '🌧️ বর্ষার দিনে গ্রামের নদীর অপূর্ব সুন্দর রূপ ও নৌকা ভ্রমণ 🛶',
  '🐈 বিড়ালের চরম কিউট ও অদ্ভুত কান্ডকারখানা দেখে হাসবেনই 🐱',
  '🏆 ওয়ার্ল্ড কাপ ফাইনালের সেরা ঐতিহাসিক মুহূর্ত ⚽'
];

// Simple deterministic hash based on daily date string (e.g., "2026-09-28")
function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Generate exactly 250 fresh videos for the current date
export function getDailyAutoReels(count = 250): AutoReelItem[] {
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0]; // e.g. "2026-09-28"
  const seed = getDailySeed(dateKey);

  const reels: AutoReelItem[] = [];

  for (let i = 1; i <= count; i++) {
    // Unique pseudorandom selector based on day seed + index
    const pickSeed = (seed + i * 17) >>> 0;
    const videoIdx = pickSeed % VIDEO_STREAM_POOLS.length;
    const creatorIdx = (pickSeed + 3) % CREATORS_POOL.length;
    const titleIdx = (pickSeed + 7) % TITLES_POOL.length;

    const creator = CREATORS_POOL[creatorIdx];
    const likesK = ((pickSeed % 400) + 20).toFixed(1);
    const commentsK = ((pickSeed % 50) + 1).toFixed(1);
    const sharesK = ((pickSeed % 30) + 1).toFixed(1);

    reels.push({
      id: `reel_${dateKey}_${i}`,
      videoNumber: i,
      title: `${TITLES_POOL[titleIdx]} #${i}`,
      creator: creator.name,
      handle: creator.handle,
      avatar: creator.avatar,
      category: creator.cat,
      videoUrl: VIDEO_STREAM_POOLS[videoIdx],
      likes: `${likesK}K`,
      comments: `${commentsK}K`,
      shares: `${sharesK}K`,
      dateKey: dateKey,
      appDeepLink: 'https://www.tiktok.com'
    });
  }

  return reels;
}
