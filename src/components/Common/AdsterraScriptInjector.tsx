import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const AdsterraScriptInjector: React.FC = () => {
  const { settings } = useApp();

  useEffect(() => {
    // 1. 🚀 INJECT OFFICIAL ADSTERRA SOCIAL BAR (HIGH CPM IN-PAGE PUSH)
    const socialBarSrc = 'https://pl31612557.profitableratecpmnetwork.com/4b/5b/f5/4b5bf560a60882eaf9fc46b3684fb3f4.js';
    
    if (!document.getElementById('adsterra-social-bar-script')) {
      const socialScript = document.createElement('script');
      socialScript.id = 'adsterra-social-bar-script';
      socialScript.type = 'text/javascript';
      socialScript.src = socialBarSrc;
      socialScript.async = true;
      document.head.appendChild(socialScript);
    }

    // 2. 🛡️ SMART FREQUENCY-CAPPED POPUNDER CONTROLLER
    const popunderSrc = 'https://pl31611746.profitableratecpmnetwork.com/11/4f/12/114f12061c28bd123f51ddc1fb9c6111.js';
    const COOLDOWN_MS = 3 * 60 * 1000; // ৩ মিনিট পর পর সর্বোচ্চ ১ বার পপআন্ডার কার্যকর হবে
    const LAST_POPUNDER_KEY = 'watch_earn_last_popunder_time';

    const canTriggerPopunder = () => {
      const lastTime = localStorage.getItem(LAST_POPUNDER_KEY);
      if (!lastTime) return true;
      const elapsed = Date.now() - parseInt(lastTime, 10);
      return elapsed >= COOLDOWN_MS;
    };

    const handleSmartClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('button[data-no-ad]') ||
        target.closest('.no-ad-trigger')
      ) {
        return;
      }

      if (canTriggerPopunder()) {
        localStorage.setItem(LAST_POPUNDER_KEY, Date.now().toString());
        
        if (!document.getElementById('adsterra-popunder-direct-script')) {
          const script = document.createElement('script');
          script.id = 'adsterra-popunder-direct-script';
          script.type = 'text/javascript';
          script.src = popunderSrc;
          script.async = true;
          document.head.appendChild(script);
        }
      }
    };

    window.addEventListener('click', handleSmartClick, { capture: true, passive: true });

    // 3. Optional custom Social Bar code from settings if changed by admin
    const customSocialBar = settings?.adsConfig?.adsterraSocialBarCode;
    if (customSocialBar && customSocialBar.trim() && !customSocialBar.includes('pl31612557')) {
      if (!document.getElementById('adsterra-social-bar-custom-tag')) {
        const div = document.createElement('div');
        div.id = 'adsterra-social-bar-custom-tag';
        div.innerHTML = customSocialBar.trim();
        document.body.appendChild(div);

        const scripts = div.querySelectorAll('script');
        scripts.forEach((s) => {
          const newScript = document.createElement('script');
          if (s.src) newScript.src = s.src;
          if (s.innerHTML) newScript.innerHTML = s.innerHTML;
          document.body.appendChild(newScript);
        });
      }
    }

    return () => {
      window.removeEventListener('click', handleSmartClick, { capture: true });
    };
  }, [settings?.adsConfig]);

  return null;
};
