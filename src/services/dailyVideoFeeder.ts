import { ShortVideoItem } from '../components/Watch/WatchScreen';

/**
 * 🎬 DAILY 200 AUTOMATED VIRAL VIDEO FEED GENERATOR
 * Dynamically generates 200 high-engagement YouTube Shorts, TikTok reels,
 * Dailymotion clips, and HD MP4 videos that auto-rotate every 24 hours.
 */

// Sample list of working, embeddable YouTube Shorts IDs
const YOUTUBE_SHORTS_POOL = [
  'kJQP7kiw5Fk', 'L_LUpnjgPso', '3JZ_D3ELwOQ', 'fJ9rUzIMcZQ', 'fRh_vgS2dFE',
  'OPf0YbXqDm0', '9bZkp7q19f0', '2Vv-BfVoq4g', 'YQHsXMglC9A', 'L3wKzyIN1yk',
  'kxpI4F2xRkU', 'v84qR1-r9fA', 'hTWKbfoikeg', '09R8_2nJtjg', 'RgKAFK5djSk',
  'UwTfHqI69B0', '7PNL_A0vGno', 'aJOTlE1K90k', '4TzVE1eXj_0', 'M33K-R_O97o'
];

// Sample list of Mixkit HD Vertical MP4 Video URLs
const MIXKIT_MP4_POOL = [
  'https://assets.mixkit.co/videos/52033/52033-720.mp4',
  'https://assets.mixkit.co/videos/49258/49258-720.mp4',
  'https://assets.mixkit.co/videos/41662/41662-720.mp4',
  'https://assets.mixkit.co/videos/40260/40260-720.mp4',
  'https://assets.mixkit.co/videos/49260/49260-720.mp4',
  'https://assets.mixkit.co/videos/43527/43527-720.mp4',
  'https://assets.mixkit.co/videos/52028/52028-720.mp4',
  'https://assets.mixkit.co/videos/52089/52089-720.mp4',
  'https://assets.mixkit.co/videos/51950/51950-720.mp4'
];

const CATEGORIES_CONFIG: {
  id: 'comedy' | 'dance' | 'sports' | 'pets' | 'music' | 'magic' | 'cartoon' | 'dailymotion';
  labelBn: string;
  titles: string[];
  creators: string[];
  avatars: string[];
}[] = [
  {
    id: 'comedy',
    labelBn: '😂 কমেডি নাটক',
    titles: [
      'মোশাররফ করিম ও চঞ্চল চৌধুরীর সেরা হাসির ডায়লগ 😂',
      'বাংলা সেরা হাসির কমেডি ও ফানি নাটক সিন 🔥',
      'গ্রামের মোড়লের চরম হাসির বিচার ও ফানি কাণ্ড 🤣',
      'ব্যাচেলর পয়েন্ট ভাইরালের সেরার সেরা কমেডি ক্লিপ 🎬',
      'মিরাজ ও শামীম হাসানের নতুন চরম হাসির শর্টস 🎭'
    ],
    creators: ['বাংলা নাটক কমেডি', 'Natok Hub BD', 'Comedy Express', 'Bangla Fun Shorts', 'Dhaka Natok Zone'],
    avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    ]
  },
  {
    id: 'dance',
    labelBn: '💃 টিকটক ড্যান্স',
    titles: [
      'ভাইরাল টিকটক ড্যান্স ও ট্রেন্ডিং গানের সেরা স্টেপস 💃',
      'বাংলা নতুন রোমান্টিক রিলস ও সুপার ড্যান্স পারফরম্যান্স 🎶',
      'ট্রেন্ডিং সাউন্ড বিটে এনার্জেটিক টিকটক স্টেজ ভাইরাল 🔥',
      'ইনস্টাগ্রাম রিলস ট্রেন্ডিং ভাইরাল কভার ড্যান্স 💃✨'
    ],
    creators: ['টিকটক রিলস বাংলাদেশ', 'TikTok BD Official', 'Reels Trend BD', 'Dance Mania BD'],
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    ]
  },
  {
    id: 'sports',
    labelBn: '🏏 খেলাধুলা',
    titles: [
      'বাংলাদেশ ক্রিকেটের শেষ ওভারে রুদ্ধশ্বাস ছক্কা ও জয়ের উল্লাস! 🏏',
      'অবিশ্বাস্য স্ট্রিট ট্রিক শট ও বাস্কেটবল স্কিলস 🔥',
      'টাইগারদের চার-ছক্কার সেরা হাইলাইটস ও গর্জন 🐅🇧🇩',
      'মেসি ও রোনালদোর সেরা স্কিলস ও আইকনিক গোল হাইলাইটস ⚽'
    ],
    creators: ['টাইগার্স ক্রিকেট লাইভ', 'Sports Mania BD', 'Football Skills World', 'Cricket Thrillers BD'],
    avatars: [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    ]
  },
  {
    id: 'pets',
    labelBn: '🐱 ফানি প্রাণী',
    titles: [
      'কিউট বিড়াল ও কুকুরের চরম হাসির অদ্ভুত কাণ্ড 🐶🐱',
      'বিড়ালের মিষ্টি দুষ্টুমি ও কিউট রিঅ্যাকশন দেখলে হাসতেই হবে 😂',
      'মজার ফানি পেটস ও তোতাপাখির কথা বলা শর্টস 🦜'
    ],
    creators: ['ফানি পেট জোন', 'Cute Animals BD', 'Cat Lovers BD'],
    avatars: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150']
  },
  {
    id: 'cartoon',
    labelBn: '👶 কার্টুন',
    titles: [
      'মীনা ও রাজু কার্টুন কমেডি পর্ব 👶 Meena Animation',
      'টম অ্যান্ড জেরি ক্লাসিক ফানি হাসির দৃশ্য 🐱🐭 Tom & Jerry',
      'গোপাল ভাঁড় সেরা বুদ্ধির ফানি কার্টুন ঘটনা 🧠',
      'মোটু পাতলু সমোসা কমেডি এডভেঞ্চার 🥟'
    ],
    creators: ['মীনা কার্টুন বিডি', 'Toons Comedy BD', 'Gopal Bhar Stories'],
    avatars: ['https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150']
  },
  {
    id: 'music',
    labelBn: '🎵 গান ও কনসার্ট',
    titles: [
      'লাইভ ডিজে কনসার্ট পার্টি ও এনার্জেটিক মিউজিক বিট 🎧',
      'বাংলা সেরা নতুন মেলোডি গান ও মেলোডি স্টুডিও 🎶',
      'ট্রেন্ডিং বাংলা লোফি লিরিক্স ও নাইট ড্রাইভ মিউজিক 🌙'
    ],
    creators: ['কনসার্ট ও মিউজিক লাইভ', 'Bangla Hits BD', 'Studio Acoustic BD'],
    avatars: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150']
  },
  {
    id: 'magic',
    labelBn: '✨ ম্যাজিক ট্রিকস',
    titles: [
      'অবিশ্বাস্য সাইন্স ট্রিকস ও চোখের পলকে ম্যাজিক ⚡',
      'সহজ ৩টি ম্যাজিক ট্রিকস যা ঘরেই চেষ্টা করতে পারবেন 🔮'
    ],
    creators: ['সায়েন্স ও ম্যাজিক বাংলা', 'Magic Hacks BD'],
    avatars: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150']
  },
  {
    id: 'dailymotion',
    labelBn: '🎥 ডেইলিমোশন',
    titles: [
      'ডেইলিমোশন অফিশিয়াল পার্টনার কমেডি ভিডিও 🎬 [50% RevShare]',
      'ডেইলিমোশন স্পেশাল ফানি ড্রামা ক্লিপস 🎬'
    ],
    creators: ['Dailymotion Partner BD', 'Dailymotion Official BD'],
    avatars: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150']
  }
];

// Simple deterministic hash based on date string (e.g. "2026-10-31")
function getSeedNumber(): number {
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 🚀 Generates exactly 200 fresh videos for today!
 */
export function generateDaily200Videos(): ShortVideoItem[] {
  const seed = getSeedNumber();
  const videos: ShortVideoItem[] = [];

  const totalCount = 200;

  for (let i = 0; i < totalCount; i++) {
    const catIndex = (i + seed) % CATEGORIES_CONFIG.length;
    const catConfig = CATEGORIES_CONFIG[catIndex];

    const title = catConfig.titles[i % catConfig.titles.length];
    const creator = catConfig.creators[i % catConfig.creators.length];
    const avatar = catConfig.avatars[i % catConfig.avatars.length];

    // Determine type: alternate between YouTube Shorts, Dailymotion, and MP4
    let type: 'youtube' | 'dailymotion' | 'mp4' = 'mp4';
    let ytId: string | undefined;
    let dmId: string | undefined;
    let videoUrl = MIXKIT_MP4_POOL[i % MIXKIT_MP4_POOL.length];

    if (catConfig.id === 'dailymotion' || (i % 5 === 0)) {
      type = 'dailymotion';
      dmId = 'x8y6g9l';
      videoUrl = 'https://www.dailymotion.com/video/x8y6g9l';
    } else if (i % 2 === 0) {
      type = 'youtube';
      ytId = YOUTUBE_SHORTS_POOL[i % YOUTUBE_SHORTS_POOL.length];
      videoUrl = `https://www.youtube.com/shorts/${ytId}`;
    }

    const videoItem: ShortVideoItem = {
      id: `daily_vid_${i + 1}`,
      type,
      youtubeId: ytId,
      dailymotionId: dmId,
      videoUrl,
      thumbnailUrl: dmId
        ? `https://www.dailymotion.com/thumbnail/video/${dmId}`
        : ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : `https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80`,
      title: `${title} #${i + 1}`,
      creatorName: creator,
      creatorHandle: `@${creator.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${i + 1}`,
      creatorAvatar: avatar,
      caption: `${title} 🎬 ১ মিনিট পূর্ণ হলে অটোমেটিক স্পন্সর এড ও পয়েন্ট পেয়ে যাবেন! #shorts #viral #${catConfig.id}`,
      likesCount: 120000 + ((i * 3500 + seed) % 850000),
      commentsCount: 3500 + ((i * 120 + seed) % 45000),
      audioTitle: `${catConfig.labelBn} Beat 🎶`,
      rewardCoins: (i % 3 === 0) ? 50 : 25,
      category: catConfig.id,
      categoryLabelBn: catConfig.labelBn,
      isOwnerSponsored: (i === 0 || i % 10 === 0)
    };

    videos.push(videoItem);
  }

  return videos;
}
