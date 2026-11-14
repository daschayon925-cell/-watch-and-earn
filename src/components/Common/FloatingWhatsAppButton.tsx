import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FloatingWhatsAppButton: React.FC = () => {
  const { settings } = useApp();
  const [showTooltip, setShowTooltip] = useState(true);

  // Admin WhatsApp number (defaults to user's verified phone 8801339223713)
  const phone = settings?.jobPostingConfig?.bkashNumber || '01339223713';
  const cleanPhone = phone.startsWith('88') ? phone : '88' + phone.replace(/[^0-9]/g, '');

  const defaultMsg = encodeURIComponent('হ্যালো এডমিন! আমি WatchEarnBD সাইট থেকে কাজ ও পেমেন্ট বিষয়ে যোগাযোগ করছি।');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${defaultMsg}`;

  return (
    <div className="fixed bottom-24 right-3.5 z-40 flex flex-col items-end gap-1.5 pointer-events-auto">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500/50 shadow-xl text-white text-[11px] font-bold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>এডমিন হোয়াটসঅ্যাপ হেল্প</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="p-0.5 ml-1 text-slate-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition cursor-pointer border-2 border-white/20"
        title="এডমিনের সাথে হোয়াটসঅ্যাপে চ্যাট করুন"
      >
        <MessageCircle className="w-6 h-6 fill-white text-emerald-600" />
      </a>
    </div>
  );
};
