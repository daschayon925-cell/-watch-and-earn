import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdsterraBannerUnitProps {
  className?: string;
}

export const AdsterraBannerUnit: React.FC<AdsterraBannerUnitProps> = ({ className = '' }) => {
  const { settings } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const customBannerCode = settings?.adsConfig?.adsterraBannerCode;

  useEffect(() => {
    if (isDismissed || !containerRef.current) return;

    const bannerCode =
      customBannerCode?.trim() ||
      `<script async="async" data-cfasync="false" src="https://pl31616461.profitableratecpmnetwork.com/ba831837bc8426c844a5c5f130f56557/invoke.js"></script><div id="container-ba831837bc8426c844a5c5f130f56557"></div>`;

    containerRef.current.innerHTML = '';

    // Create an iframe to safely isolate and execute the native banner script
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.minHeight = '180px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    iframe.title = 'Verified Sponsor Banner';

    containerRef.current.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                margin: 0; 
                padding: 4px; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                background: transparent; 
                color: #ffffff;
                font-family: system-ui, -apple-system, sans-serif;
              }
              #container-ba831837bc8426c844a5c5f130f56557 {
                width: 100%;
                display: flex;
                justify-content: center;
              }
            </style>
          </head>
          <body>
            ${bannerCode}
          </body>
        </html>
      `);
      doc.close();
    }
  }, [isDismissed, customBannerCode]);

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg ${className}`}>
      <div className="flex items-center justify-between w-full mb-1 px-1">
        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 fill-emerald-400" />
          ভেরিফায়েড স্পন্সর বিজ্ঞাপন (Non-Adult)
        </span>

        {/* ❌ Easy Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-full transition active:scale-95 border border-slate-700 cursor-pointer"
          title="বিজ্ঞাপন বন্ধ করুন"
        >
          <X className="w-3 h-3" />
          <span>বন্ধ</span>
        </button>
      </div>

      {/* Ad Container */}
      <div ref={containerRef} className="w-full flex justify-center items-center min-h-[160px]" />
    </div>
  );
};
