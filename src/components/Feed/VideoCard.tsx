import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Flag, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Check, 
  Eye, 
  Coins 
} from 'lucide-react';
import { Video } from '../../types';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CommentsDrawer } from './CommentsDrawer';
import { ShareModal } from './ShareModal';
import { ReportModal } from './ReportModal';

// Helper to detect and extract official embed URLs for TikTok and YouTube Shorts
function getEmbedInfo(url: string): { type: 'tiktok' | 'youtube' | 'direct'; embedUrl: string | null } {
  if (!url) return { type: 'direct', embedUrl: null };

  // YouTube Shorts or normal YouTube videos
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);

    if (shortsMatch && shortsMatch[1]) {
      videoId = shortsMatch[1];
    } else if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    } else if (youtuBeMatch && youtuBeMatch[1]) {
      videoId = youtuBeMatch[1];
    } else if (embedMatch && embedMatch[1]) {
      videoId = embedMatch[1];
    }

    if (videoId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`
      };
    }
  }

  return { type: 'direct', embedUrl: null };
}

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onAdTrigger?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onNext, onPrev, onAdTrigger }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const embedWatchTimeRef = useRef<number>(0);
  const embedInfo = getEmbedInfo(video.videoUrl);
  const isEmbed = embedInfo.type !== 'direct';

  const { user, refreshUser, awardCoinsLocally } = useAuth();
  const { isMuted, setIsMuted, showToast, triggerConfetti, language, settings } = useApp();

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount);

  // Modals
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showLicenseInfo, setShowLicenseInfo] = useState(false);

  // Double tap hearts animation
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapRef = useRef<number>(0);

  // Watch-To-Earn Engine State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [watchProgress, setWatchProgress] = useState<number>(0);
  const [watchedSeconds, setWatchedSeconds] = useState<number>(0);
  const [isRewardClaimed, setIsRewardClaimed] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [requiredPercentage, setRequiredPercentage] = useState<number>(settings?.minWatchPercentage || 90);
  const heartbeatTimerRef = useRef<any>(null);

  // Video Quality state
  const [quality, setQuality] = useState<'720p' | '480p' | '360p' | '1080p'>('720p');
  const [videoSrc, setVideoSrc] = useState<string>(video.videoUrl);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false);
  const [forcedNative, setForcedNative] = useState<boolean>(false);

  // Sync video source on change
  useEffect(() => {
    setVideoSrc(video.videoUrl);
    setHasPlaybackError(false);
    setForcedNative(false);
    setIsBuffering(false);
  }, [video.id, video.videoUrl]);

  // Handle video playback failure gracefully
  const handleVideoError = () => {
    console.warn(`Video playback issue detected for ${video.id}. Falling back to high-speed CDN stream.`);
    // Fallback to high-speed reliable vertical MP4
    const fallbackUrls = [
      'https://assets.mixkit.co/videos/52028/52028-720.mp4',
      'https://assets.mixkit.co/videos/51950/51950-720.mp4',
      'https://assets.mixkit.co/videos/52033/52033-720.mp4'
    ];
    const alternate = fallbackUrls.find(u => u !== videoSrc) || fallbackUrls[0];
    setVideoSrc(alternate);
    setHasPlaybackError(false);
  };

  // Initialize Video Session & Playback
  useEffect(() => {
    embedWatchTimeRef.current = 0;
    if (isActive) {
      setIsPlaying(true);
      if (!isEmbed && videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              setIsPlaying(false);
            });
        }
      }

      // Start Backend Watch Session
      startSession();
    } else {
      if (!isEmbed && videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      clearInterval(heartbeatTimerRef.current);
    }

    return () => {
      clearInterval(heartbeatTimerRef.current);
    };
  }, [isActive, video.id, isEmbed]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Start Session with Backend
  const startSession = async () => {
    try {
      const res = await api.startWatchSession(video.id);
      if (res.success && res.sessionId) {
        setSessionId(res.sessionId);
        setRequiredPercentage(res.requiredWatchPercentage || 90);
        setWatchProgress(0);
        setIsRewardClaimed(false);

        // Start periodic heartbeat
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = setInterval(() => {
          sendHeartbeat(res.sessionId);
        }, 1500);
      }
    } catch (err) {
      console.error('Session start error', err);
    }
  };

  // Heartbeat to validate genuine watch time & progress
  const sendHeartbeat = async (sId: string) => {
    if (isRewardClaimed || isClaiming) return;

    const isDocVisible = typeof document !== 'undefined' ? !document.hidden : true;
    let currentTime = 0;
    let isCurrentlyPlaying = false;

    if (isEmbed) {
      isCurrentlyPlaying = isPlaying && isDocVisible;
      if (isCurrentlyPlaying) {
        embedWatchTimeRef.current += 1.5;
      }
      currentTime = embedWatchTimeRef.current;
    } else if (videoRef.current) {
      currentTime = videoRef.current.currentTime;
      isCurrentlyPlaying = !videoRef.current.paused && !videoRef.current.ended && isDocVisible;
    }

    try {
      const res = await api.sendHeartbeat(sId, currentTime, isCurrentlyPlaying, isDocVisible);
      if (res.success) {
        setWatchProgress(res.percentage);
        setWatchedSeconds(Math.min(Math.floor(currentTime), video.duration || 20));

        // If threshold reached, claim reward
        if (res.isEligible && !isRewardClaimed) {
          claimVideoReward(sId);
        }
      }
    } catch (err) {
      console.error('Heartbeat error', err);
    }
  };

  // Claim Reward from Backend
  const claimVideoReward = async (sId: string) => {
    setIsClaiming(true);
    try {
      const res = await api.claimReward(sId);
      if (res && res.success && res.earnedCoins) {
        setIsRewardClaimed(true);
        awardCoinsLocally(res.earnedCoins);
        soundService.playCoinReward();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} কয়েন যুক্ত হয়েছে! 🎉` : `+${res.earnedCoins} Coins Earned! 🎉`,
          language === 'bn' ? 'ভিডিও দেখা সম্পন্ন! স্পন্সর বিজ্ঞাপন আসছে...' : 'Successfully watched! Sponsor ad loading...',
          'coin'
        );

        // Auto trigger sponsor ad after brief celebration
        if (onAdTrigger) {
          setTimeout(() => {
            onAdTrigger();
          }, 1400);
        }
      } else {
        // Fallback: claim instant bonus so user always receives coins for watching
        const coins = video.rewardCoins || 25;
        const fbRes = await api.claimInstantAdBonus(`ভিডিও: ${video.title.slice(0, 25)}`, coins);
        if (fbRes && fbRes.success) {
          setIsRewardClaimed(true);
          awardCoinsLocally(coins);
          soundService.playCoinReward();
          triggerConfetti();
          await refreshUser();
          showToast(
            language === 'bn' ? `+${coins} কয়েন যুক্ত হয়েছে! 🎉` : `+${coins} Coins Earned! 🎉`,
            '',
            'coin'
          );
        }
      }
    } catch (err) {
      console.error('Claim error', err);
      try {
        const coins = video.rewardCoins || 25;
        const fbRes = await api.claimInstantAdBonus(`ভিডিও ব্যাকআপ: ${video.title.slice(0, 25)}`, coins);
        if (fbRes && fbRes.success) {
          setIsRewardClaimed(true);
          awardCoinsLocally(coins);
          await refreshUser();
        }
      } catch {}
    } finally {
      setIsClaiming(false);
    }
  };

  // Tap to Toggle Play / Double Tap to Like
  const handleContainerClick = (e: React.MouseEvent<HTMLElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double Tap Event
      handleDoubleTap(e);
    } else {
      // Single Tap Event (toggle play/pause)
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 600);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 600);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newHeart = { id: Date.now(), x, y };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);

    if (!isLiked) {
      handleLike();
    }
  };

  const handleLike = async () => {
    soundService.playLikePop();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : prev - 1);

    if (nextLiked) {
      try {
        await api.likeVideo(video.id);
      } catch {
        // ignore
      }
    }
  };

  const handleSave = () => {
    soundService.playLikePop();
    setIsSaved(!isSaved);
    showToast(
      !isSaved 
        ? (language === 'bn' ? 'সংরক্ষণ করা হয়েছে' : 'Saved to favorites') 
        : (language === 'bn' ? 'সংরক্ষণ বাতিল করা হয়েছে' : 'Removed from favorites'),
      '',
      'info'
    );
  };

  const handleFollow = () => {
    soundService.playLikePop();
    setIsFollowing(!isFollowing);
    showToast(
      !isFollowing 
        ? (language === 'bn' ? `ফলো করা হয়েছে: ${video.creatorName}` : `Following ${video.creatorName}`) 
        : (language === 'bn' ? 'আনফলো করা হয়েছে' : 'Unfollowed'),
      '',
      'success'
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-125px)] max-w-md mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800/60 select-none flex items-center justify-center">
      {/* Video or YouTube Player */}
      {isEmbed && embedInfo.embedUrl && !forcedNative ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <iframe
            src={embedInfo.embedUrl}
            title={video.title}
            className="w-full h-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoSrc}
            poster={video.thumbnailUrl}
            autoPlay={isActive}
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover cursor-pointer"
            onClick={handleContainerClick}
            onError={handleVideoError}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onCanPlay={() => setIsBuffering(false)}
            onEnded={() => {
              if (!isRewardClaimed && sessionId) {
                claimVideoReward(sessionId);
              }
              // Auto-advance to next video or ad when video ends
              if (onNext) {
                setTimeout(() => onNext(), 1000);
              }
            }}
          />

          {/* Big Tap to Play Button when paused / mobile autoplay requires user gesture */}
          {!isPlaying && !isBuffering && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl active:scale-95 transition">
                <Play className="w-8 h-8 fill-slate-950 ml-1" />
              </div>
              <span className="mt-3 px-3.5 py-1 rounded-full bg-black/70 border border-white/10 text-xs font-bold text-white shadow-lg">
                {language === 'bn' ? 'ভিডিও চালাতে স্পর্শ করুন' : 'Tap to Play Video'}
              </span>
            </div>
          )}
        </>
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[1px]">
          <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Floating Double Tap Hearts */}
      {floatingHearts.map(heart => (
        <div
          key={heart.id}
          style={{ left: heart.x - 24, top: heart.y - 24 }}
          className="absolute z-30 pointer-events-none animate-ping text-rose-500"
        >
          <Heart className="w-12 h-12 fill-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
        </div>
      ))}

      {/* Center Play/Pause Pulsing Indicator */}
      {showPlayIcon && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="p-4 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white animate-scale-in">
            {isPlaying ? <Play className="w-8 h-8 fill-white" /> : <Pause className="w-8 h-8 fill-white" />}
          </div>
        </div>
      )}

      {/* Top Overlay: Reward Progress Ring & Legal License Badge */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Watch-To-Earn Progress Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-emerald-500/40 shadow-lg">
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Circular SVG Ring */}
            <svg className="w-7 h-7 -rotate-90">
              <circle
                cx="14"
                cy="14"
                r="11"
                className="text-slate-700/60 stroke-current"
                strokeWidth="2.5"
                fill="transparent"
              />
              <circle
                cx="14"
                cy="14"
                r="11"
                className={`transition-all duration-300 stroke-current ${
                  isRewardClaimed ? 'text-emerald-400' : 'text-amber-400'
                }`}
                strokeWidth="2.5"
                strokeDasharray={69.1}
                strokeDashoffset={69.1 - (69.1 * Math.min(watchProgress, 100)) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[9px] font-black text-white">
              {isRewardClaimed ? '✓' : `${watchProgress}%`}
            </span>
          </div>

          <div className="flex flex-col">
            <span className={`text-[10px] font-bold leading-tight ${
              isRewardClaimed ? 'text-emerald-300' : 'text-amber-300'
            }`}>
              {isRewardClaimed 
                ? (language === 'bn' ? '✓ রিওয়ার্ড অর্জিত!' : '✓ Reward Claimed!') 
                : (language === 'bn' ? `+${video.rewardCoins} কয়েন` : `+${video.rewardCoins} Coins`)}
            </span>
            <span className="text-[8px] text-slate-400 leading-none">
              {isRewardClaimed 
                ? (language === 'bn' ? 'কয়েন জমা হয়েছে' : 'Credited to Wallet') 
                : (language === 'bn' ? `${requiredPercentage}% দেখা আবশ্যক` : `${requiredPercentage}% required`)}
            </span>
          </div>
        </div>

        {/* License & Quality Pill */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => setShowLicenseInfo(!showLicenseInfo)}
            className="px-2 py-1 bg-black/75 backdrop-blur-md border border-slate-700/80 rounded-full text-[9px] font-semibold text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition"
          >
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span className="capitalize">{video.contentLicense.replace('_', ' ')}</span>
          </button>

          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            className="px-1.5 py-1 bg-black/75 backdrop-blur-md border border-slate-700/80 rounded-full text-[9px] font-bold text-slate-300 focus:outline-none"
          >
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </div>
      </div>

      {/* License Info Toast Popup */}
      {showLicenseInfo && (
        <div className="absolute top-14 left-4 right-4 z-30 p-3 bg-slate-900/95 border border-cyan-500/40 rounded-2xl text-[11px] text-slate-200 shadow-xl backdrop-blur-md animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> বৈধ কনটেন্ট লাইসেন্স (Legal Rights)
            </span>
            <button onClick={() => setShowLicenseInfo(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <p className="text-[10px] text-slate-300 mb-1">{video.licenseAttribution}</p>
          <span className="text-[9px] text-emerald-400 font-semibold block">
            ✓ কপিরাইট ও ডিস্ট্রিবিউশন শর্তাবলী সম্পূর্ণরূপে যাচাইকৃত।
          </span>
        </div>
      )}

      {/* Right Side Vertical Action Column */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-3.5">
        {/* Creator Avatar & Follow Button */}
        <div className="relative mb-1">
          <img
            src={video.creatorAvatar}
            alt={video.creatorName}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-lg"
          />
          <button
            onClick={handleFollow}
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-md transition-all ${
              isFollowing ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold scale-105'
            }`}
          >
            {isFollowing ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="group flex flex-col items-center transition active:scale-125"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition ${
            isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/60 text-white group-hover:text-rose-400'
          }`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
          </div>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">
            {likesCount >= 1000 ? (likesCount / 1000).toFixed(1) + 'k' : likesCount}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(true)}
          className="group flex flex-col items-center transition active:scale-110"
        >
          <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white group-hover:text-cyan-400 transition">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">
            {commentsCount}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShowShare(true)}
          className="group flex flex-col items-center transition active:scale-110"
        >
          <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white group-hover:text-emerald-400 transition">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">
            {video.sharesCount}
          </span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          onClick={handleSave}
          className="group flex flex-col items-center transition active:scale-110"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition ${
            isSaved ? 'bg-amber-500/20 text-amber-400' : 'bg-black/60 text-white group-hover:text-amber-300'
          }`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-400' : ''}`} />
          </div>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-emerald-400 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Report Button */}
        <button
          onClick={() => setShowReport(true)}
          className="p-1.5 rounded-full bg-black/40 text-slate-400 hover:text-rose-400 transition"
          title="Report content"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Video Metadata & Description Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
        <div className="max-w-[80%] pointer-events-auto">
          {/* Creator handle */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-bold text-sm text-white drop-shadow">
              {video.creatorName}
            </span>
            {video.creatorVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="text-[10px] text-slate-400 font-medium">
              {video.creatorHandle}
            </span>
          </div>

          {/* Video Title & Caption */}
          <p className="text-xs text-slate-100 font-medium leading-relaxed drop-shadow line-clamp-2">
            {video.title}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {video.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-semibold text-cyan-300 drop-shadow">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Live Watch Timer & Coin Meter Bar (নিচে লাইভ টাইম ও কয়েন কাউন্টার) */}
        <div className="w-full mt-2.5 p-2 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/40 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isRewardClaimed 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
              }`}>
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-300 block leading-tight">
                  {isRewardClaimed 
                    ? (language === 'bn' ? '🎉 কয়েন সফলভাবে অর্জিত!' : '🎉 Coins Earned!') 
                    : (language === 'bn' ? `কয়েন উঠছে: +${video.rewardCoins || 25} কয়েন` : `Accumulating: +${video.rewardCoins || 25} Coins`)}
                </span>
                <span className="text-[9px] text-slate-300 font-mono">
                  ⏱️ {language === 'bn' ? 'টাইম:' : 'Time:'} {watchedSeconds}/{video.duration || 20} {language === 'bn' ? 'সেকেন্ড' : 'sec'}
                  {isRewardClaimed ? ' • বিজ্ঞাপন সম্পন্ন হলে জমা হবে' : ' • সম্পূর্ণ হলে অ্যাড আসবে'}
                </span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isRewardClaimed 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isRewardClaimed ? '✓ সম্পন্ন' : `${watchProgress}%`}
              </span>
            </div>
          </div>

          {/* Animated Gradient Progress Bar */}
          <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isRewardClaimed 
                  ? 'bg-emerald-400' 
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 shadow-sm shadow-amber-400/50'
              }`}
              style={{ width: `${Math.max(watchProgress, (watchedSeconds / (video.duration || 20)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Drawers & Modals */}
      <CommentsDrawer
        videoId={video.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentsCount(prev => prev + 1)}
      />

      <ShareModal
        video={video}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />

      <ReportModal
        video={video}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
};
