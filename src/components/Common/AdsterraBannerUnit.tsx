import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdsterraBannerUnitProps {
  className?: string;
  slotId?: string;
}

export const AdsterraBannerUnit: React.FC<AdsterraBannerUnitProps> = ({ className = '', slotId = 'default' }) => {
  const { settings } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  const bannerKey = '026df0717402ab99e2cfeea66cbde373';

  const srcDocContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${bannerKey}',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/${bannerKey}/invoke.js"></script>
      </body>
    </html>
  `;

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`w-full my-2 relative flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/40 shadow-2xl overflow-hidden ${className}`}>
      {/* Header Bar matching Image 2 */}
      <div className="flex items-center justify-between w-full px-2 py-1 mb-1.5 border-b border-white/10">
        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
          <span>ভেরিফায়েড স্পন্সর বিজ্ঞাপন (NON-ADULT)</span>
        </span>

        {/* ❌ Close Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-full transition active:scale-95 border border-slate-700 cursor-pointer"
          title="বিজ্ঞাপন বন্ধ করুন"
        >
          <X className="w-3 h-3" />
          <span>বন্ধ</span>
        </button>
      </div>

      {/* 🌟 Official 300x250 Adsterra Live Banner Frame */}
      <div className="w-full flex justify-center items-center min-h-[255px] overflow-hidden rounded-xl bg-slate-950/60 p-1">
        <iframe
          srcDoc={srcDocContent}
          width="310"
          height="255"
          className="border-0 overflow-hidden mx-auto rounded-lg max-w-full"
          scrolling="no"
          title="Adsterra 300x250 Banner Ad"
        />
      </div>
    </div>
  );
};
