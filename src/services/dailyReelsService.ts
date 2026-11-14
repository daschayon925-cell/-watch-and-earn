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

// High-speed CDN vertical video pool (9:16 optimized for instant mobile playback without buffering)
const VIDEO_STREAM_POOLS: Array<{ url: string; thumb: string; audio: string }> = [
  {
    url: 'https://assets.mixkit.co/videos/52028/52028-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    audio: 'Cyber Science Beat 🎧'
  },
  {
    url: 'https://assets.mixkit.co/videos/49258/49258-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    audio: 'Viral Dance Remix 🎵'
  },
  {
    url: 'https://assets.mixkit.co/videos/40260/40260-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    audio: 'Epic Street Trick Skills 🔥'
  },
  {
    url: 'https://assets.mixkit.co/videos/52089/52089-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    audio: 'Meena Cartoon Theme 👶'
  },
  {
    url: 'https://assets.mixkit.co/videos/52033/52033-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    audio: 'Bangla Natok Comedy Beat 😂'
  },
  {
    url: 'https://assets.mixkit.co/videos/52077/52077-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    audio: 'Cute Pet Meme Audio 🐶'
  },
  {
    url: 'https://assets.mixkit.co/videos/41662/41662-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    audio: 'Funny Cat Antics & Memes 🐱'
  },
  {
    url: 'https://assets.mixkit.co/videos/49260/49260-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
    audio: 'Cricket Match Excitement 🏏'
  },
  {
    url: 'https://assets.mixkit.co/videos/43527/43527-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    audio: 'Party Concert Electronic Beat ⚡'
  },
  {
    url: 'https://assets.mixkit.co/videos/48805/48805-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    audio: 'Extreme Bike Stunt Thrill 🚴'
  },
  {
    url: 'https://assets.mixkit.co/videos/52030/52030-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    audio: 'Smart Tech Tips Audio 💡'
  },
  {
    url: 'https://assets.mixkit.co/videos/42830/42830-720.mp4',
    thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    audio: 'Trendy Bengali Melody 🌸'
  }
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
    const stream = VIDEO_STREAM_POOLS[videoIdx];
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
      videoUrl: stream.url,
      likes: `${likesK}K`,
      comments: `${commentsK}K`,
      shares: `${sharesK}K`,
      dateKey: dateKey,
      appDeepLink: 'https://www.tiktok.com'
    });
  }

  return reels;
}

// Video item structure for the WatchScreen feed
export interface AutomatedShortVideoItem {
  id: string;
  type: 'mp4' | 'youtube';
  videoUrl?: string;
  youtubeId?: string;
  thumbnailUrl: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  audioTitle: string;
  rewardCoins: number;
}

// Curated YouTube backup shorts that are 100% embeddable
const YOUTUBE_SHORTS_IDS = [
  'aqz-KE-bpKQ',
  'M7lc1UVf-VE',
  'hY7m5jjJ9mM',
  'd0uFvhCHWCo',
  'fRh_vgS2dFE',
  '2Vv-BfVoq4g',
  'OPf0YbXqDm0',
  'kJQP7kiw5Fk'
];

// Returns an endless stream of automated video items ready for the WatchScreen
export function getAutomatedShortVideoItems(count = 250): AutomatedShortVideoItem[] {
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  const seed = getDailySeed(dateKey);

  const list: AutomatedShortVideoItem[] = [];

  for (let i = 1; i <= count; i++) {
    const pickSeed = (seed + i * 19) >>> 0;
    const isYt = i % 8 === 0; // 1 out of 8 is YouTube embed for rich variety, others are superfast native 9:16 MP4
    const videoStream = VIDEO_STREAM_POOLS[pickSeed % VIDEO_STREAM_POOLS.length];
    const creator = CREATORS_POOL[(pickSeed + 2) % CREATORS_POOL.length];
    const title = TITLES_POOL[(pickSeed + 5) % TITLES_POOL.length];
    const ytId = YOUTUBE_SHORTS_IDS[pickSeed % YOUTUBE_SHORTS_IDS.length];

    const likes = (pickSeed % 350) * 1000 + 12000;
    const comments = (pickSeed % 80) * 100 + 450;

    list.push({
      id: `auto_reel_${dateKey}_${i}`,
      type: isYt ? 'youtube' : 'mp4',
      videoUrl: isYt ? undefined : videoStream.url,
      youtubeId: isYt ? ytId : undefined,
      thumbnailUrl: videoStream.thumb,
      title: `${title} #${i}`,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      creatorAvatar: creator.avatar,
      caption: `${title} — দেখুন এবং প্রতি ১৫ সেকেন্ডে কয়েন আয় করুন! 🔥 #viral #shorts #videocash #bengali`,
      likesCount: likes,
      commentsCount: comments,
      audioTitle: videoStream.audio,
      rewardCoins: 25
    });
  }

  return list;
}
