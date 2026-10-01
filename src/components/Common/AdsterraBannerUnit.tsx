import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface AdsterraBannerUnitProps {
  className?: string;
}

export const AdsterraBannerUnit: React.FC<AdsterraBannerUnitProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed || !containerRef.current) return;
    
    // Clear previous if any
    containerRef.current.innerHTML = '';

    // Create an iframe to safely isolate the Adsterra 300x250 script
    const iframe = document.createElement('iframe');
    iframe.style.width = '300px';
    iframe.style.height = '250px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    iframe.title = 'Sponsor Ad 300x250';

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
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '026df0717402ab99e2cfeea66cbde373',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://www.highrevenueformat.com/026df0717402ab99e2cfeea66cbde373/invoke.js"></script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, [isDismissed]);

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg ${className}`}>
      <div className="flex items-center justify-between w-full max-w-[300px] mb-1 px-1">
        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 fill-amber-400" />
          স্পন্সর ব্যানার
        </span>
        
        {/* ❌ Easy Close / Minimize Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-full transition active:scale-95 border border-slate-700 cursor-pointer"
          title="বিজ্ঞাপন বন্ধ করুন"
        >
          <X className="w-3 h-3" />
          <span>বন্ধ করুন</span>
        </button>
      </div>

      <div ref={containerRef} className="w-[300px] h-[250px] overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800" />
    </div>
  );
};
