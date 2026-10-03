import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { triggerAdReward } from '../../services/adBonus';

export const AdsterraScriptInjector: React.FC = () => {
  const { settings, showToast } = useApp();
  const { awardCoinsLocally } = useAuth();
  const isExecutingRef = useRef(false);

  useEffect(() => {
    const adsConfig = settings?.adsConfig;
    const customSocialBar = adsConfig?.adsterraSocialBarCode?.trim();
    const customPopunder = adsConfig?.adsterraPopunderCode?.trim();

    // 💬 1. SOCIAL BAR SCRIPT INJECTOR & PERIODIC REFRESHER
    // This ensures Adsterra's social bar ads refresh continuously one after another!
    const injectSocialBar = () => {
      if (!customSocialBar) return;
      const match = customSocialBar.match(/src=['"]([^'"]+)['"]/);
      const scriptSrc = match ? match[1] : null;
      if (!scriptSrc) return;

      const existing = document.getElementById('adsterra-dynamic-social-bar-script');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.id = 'adsterra-dynamic-social-bar-script';
      script.src = `${scriptSrc}${scriptSrc.includes('?') ? '&' : '?'}cb=${Date.now()}`;
      script.async = true;
      document.body.appendChild(script);
    };

    injectSocialBar();
    // Re-trigger social bar script every 35 seconds to cycle ads
    const socialInterval = setInterval(injectSocialBar, 35000);

    // 🌐 2. OFFICIAL ADSTERRA POPUNDER CODE INJECTOR (IF PROVIDED)
    if (customPopunder) {
      const match = customPopunder.match(/src=['"]([^'"]+)['"]/);
      const popScriptSrc = match ? match[1] : null;
      if (popScriptSrc && !document.getElementById('adsterra-official-popunder-script')) {
        const popScript = document.createElement('script');
        popScript.id = 'adsterra-official-popunder-script';
        popScript.src = popScriptSrc;
        popScript.async = true;
        document.head.appendChild(popScript);
      }
    }

    // 🚀 3. HIGH-CPM SMART POPUNDER TRIGGER ENGINE (2-MINUTE COOLDOWN)
    const isPopunderActive = adsConfig?.popunderEnabled !== false;
    const intervalMinutes = adsConfig?.popunderIntervalMinutes || 2;
    const COOLDOWN_MS = intervalMinutes * 60 * 1000; // ২ মিনিট (120 সেকেন্ড) কুলডাউন
    const STORAGE_KEY_LAST = 'watch_earn_smart_popunder_last_trigger';
    const STORAGE_KEY_COUNT = 'watch_earn_smart_popunder_daily_count';
    const STORAGE_KEY_DATE = 'watch_earn_smart_popunder_date';
    const dailyCap = adsConfig?.popunderDailyCap || 25;

    const getDailyCount = () => {
      const today = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
      if (savedDate !== today) {
        localStorage.setItem(STORAGE_KEY_DATE, today);
        localStorage.setItem(STORAGE_KEY_COUNT, '0');
        return 0;
      }
      return parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);
    };

    const incrementDailyCount = () => {
      const current = getDailyCount();
      localStorage.setItem(STORAGE_KEY_COUNT, (current + 1).toString());
    };

    const triggerSmartPopunder = (e: MouseEvent | TouchEvent) => {
      if (!isPopunderActive || isExecutingRef.current) return;

      const target = e.target as HTMLElement;
      // Do not trigger on critical inputs
      if (
        !target ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[data-no-popunder]') ||
        target.closest('.no-popunder')
      ) {
        return;
      }

      if (getDailyCount() >= dailyCap) return;

      const lastTriggerStr = localStorage.getItem(STORAGE_KEY_LAST);
      const now = Date.now();
      if (lastTriggerStr) {
        const elapsed = now - parseInt(lastTriggerStr, 10);
        if (elapsed < COOLDOWN_MS) return;
      }

      // Record trigger
      localStorage.setItem(STORAGE_KEY_LAST, now.toString());
      incrementDailyCount();
      isExecutingRef.current = true;
      setTimeout(() => {
        isExecutingRef.current = false;
      }, 1500);

      const targetDirectLink =
        adsConfig?.adsterraDirectLink?.trim() ||
        'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';

      try {
        const popWindow = window.open(targetDirectLink, '_blank');
        if (popWindow) {
          try {
            window.focus();
          } catch {}
          // 🪙 Award +10 coins for popunder ad
          triggerAdReward('পপআন্ডার স্পনসর বিজ্ঞাপন (+১০ কয়েন)', awardCoinsLocally, showToast);
        }
      } catch (err) {
        console.warn('Popunder trigger note:', err);
      }
    };

    window.addEventListener('click', triggerSmartPopunder, { capture: true });

    return () => {
      clearInterval(socialInterval);
      window.removeEventListener('click', triggerSmartPopunder, { capture: true });
    };
  }, [settings?.adsConfig]);

  return null;
};
