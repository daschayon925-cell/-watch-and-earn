import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send } from 'lucide-react';
import { Video } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface ShareModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ video, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { language, showToast } = useApp();

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?ref=${user?.referralCode || 'BD7788'}&vid=${video.id}`;
  const shareText = `🇧🇩 দেখুন: "${video.title}" - WATCH & EARN BD তে ভিডিও দেখে কয়েন আয় করুন! রেফারেল কোড: ${user?.referralCode || 'BD7788'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    showToast(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Link copied to clipboard', '', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // ignore
      }
    } else {
      handleCopy();
    }
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-[#0E1522] border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              {language === 'bn' ? 'ভিডিও শেয়ার করুন' : 'Share Video'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="flex items-center gap-3 my-4 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <img src={video.thumbnailUrl} alt={video.title} className="w-12 h-16 object-cover rounded-xl shrink-0" />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{video.title}</h4>
            <span className="text-[10px] text-emerald-400 mt-1 inline-block">+{video.rewardCoins} Coins Reward</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 transition"
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-semibold">WhatsApp</span>
          </button>

          <button
            onClick={shareFacebook}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 transition"
          >
            <Send className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-semibold">Facebook</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 transition"
          >
            <Share2 className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-semibold">{language === 'bn' ? 'অন্যান্য' : 'More'}</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950 border border-slate-800">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-[11px] text-slate-300 px-2 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}
          </button>
        </div>
      </div>
    </div>
  );
};
