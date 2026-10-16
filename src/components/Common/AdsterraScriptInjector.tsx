import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { triggerAdReward } from '../../services/adBonus';
import { getRandomSafeDirectLink } from '../../utils/adLinkSanitizer';

export const AdsterraScriptInjector: React.FC = () => {
  const { settings, showToast, activeTab, floatingAdsEnabled } = useApp();
  const { user, awardCoinsLocally } = useAuth();
  const isExecutingRef = useRef(false);

  useEffect(() => {
    // 🛡️ CRITICAL: Never inject any ad scripts or popunder listeners inside Admin Panel or during Login Modal!
    if (!user || (activeTab as string) === 'admin') {
      const socialScript = document.getElementById('adsterra-dynamic-social-bar-script');
      const popScript = document.getElementById('adsterra-official-popunder-script');
      const mScript = document.getElementById('monetag-dynamic-tag-script');
      if (socialScript) socialScript.remove();
      if (popScript) popScript.remove();
      if (mScript) mScript.remove();
      return;
    }

    const adsConfig = settings?.adsConfig;
    const customSocialBar = adsConfig?.adsterraSocialBarCode?.trim();
    const customPopunder = adsConfig?.adsterraPopunderCode?.trim();

    // 🛡️ When clean view is active, cleanup any floating ad script and overlays immediately
    if (!floatingAdsEnabled) {
      const socialScript = document.getElementById('adsterra-dynamic-social-bar-script');
      if (socialScript) socialScript.remove();
      return;
    }

    // 💬 1. SOCIAL BAR SCRIPT INJECTOR (Single clean injection to prevent duplicate scripts & popups)
    const injectSocialBar = () => {
      if (!customSocialBar) return;
      const match = customSocialBar.match(/src=['"]([^'"]+)['"]/);
      const scriptSrc = match ? match[1] : null;
      if (!scriptSrc) return;

      const existing = document.getElementById('adsterra-dynamic-social-bar-script');
      if (existing) return; // Already injected, do not duplicate

      const script = document.createElement('script');
      script.id = 'adsterra-dynamic-social-bar-script';
      script.src = scriptSrc;
      script.async = true;
      script.onerror = () => { /* Suppress ad script network errors */ };
      document.body.appendChild(script);
    };

    injectSocialBar();

    // 🛡️ Ensure 3rd-party floating ad elements do not overlap top navbar or bottom navigation
    const rescaleAdsterraSocialBar = () => {
      try {
        const allElements = document.querySelectorAll('body > div, body > iframe');

        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.id === 'root' || htmlEl.tagName === 'SCRIPT' || htmlEl.id === 'bottom-nav-bar') return;
          
          const style = window.getComputedStyle(htmlEl);
          if (style.position === 'fixed' || style.position === 'absolute') {
            const topVal = parseInt(style.top, 10);
            const bottomVal = parseInt(style.bottom, 10);

            htmlEl.style.zIndex = '35'; // Keep below header (z-50) and bottom-nav (z-50)
            htmlEl.setAttribute('data-scaled-social-bar', 'true');

            // If placed near top, keep right below status bar / header
            if (!isNaN(topVal) && topVal < 60) {
              htmlEl.style.top = '60px';
            }

            // If placed near bottom, raise slightly above BottomNav so buttons are clickable
            if (!isNaN(bottomVal) && bottomVal < 65) {
              htmlEl.style.bottom = '70px';
            }
          }
        });
      } catch {}
    };

    const observer = new MutationObserver(() => {
      rescaleAdsterraSocialBar();
    });

    try {
      observer.observe(document.body, { childList: true, subtree: true });
    } catch {}

    const scaleTimer = setInterval(rescaleAdsterraSocialBar, 1500);

    // 🌐 2. OFFICIAL ADSTERRA POPUNDER CODE INJECTOR (IF PROVIDED)
    if (customPopunder) {
      const match = customPopunder.match(/src=['"]([^'"]+)['"]/);
      const popScriptSrc = match ? match[1] : null;
      if (popScriptSrc && !document.getElementById('adsterra-official-popunder-script')) {
        const popScript = document.createElement('script');
        popScript.id = 'adsterra-official-popunder-script';
        popScript.src = popScriptSrc;
        popScript.async = true;
        popScript.onerror = () => { /* Suppress popunder script network errors */ };
        document.head.appendChild(popScript);
      }
    }

    // 🚀 3. HIGH-CPM SMART POPUNDER TRIGGER ENGINE (2-HOUR / 120-MINUTE COOLDOWN)
    const isPopunderActive = adsConfig?.popunderEnabled !== false;
    const intervalMinutes = adsConfig?.popunderIntervalMinutes ?? 120; // দিনে ২ ঘণ্টা (১২০ মিনিট) পর পর
    const COOLDOWN_MS = intervalMinutes * 60 * 1000;
    const STORAGE_KEY_LAST = 'watch_earn_smart_popunder_last_trigger';
    const STORAGE_KEY_COUNT = 'watch_earn_smart_popunder_daily_count';
    const STORAGE_KEY_DATE = 'watch_earn_smart_popunder_date';
    const dailyCap = adsConfig?.popunderDailyCap || 8;

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
      // Do not trigger on critical inputs or anywhere in admin panel
      if (
        (activeTab as string) === 'admin' ||
        !target ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[data-no-popunder]') ||
        target.closest('.no-popunder') ||
        target.closest('[data-admin-panel]') ||
        target.closest('.admin-portal') ||
        target.closest('.admin-no-ad')
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

      // 🌐 4. MONETAG (PROPELLERADS) SCRIPT TAG INJECTOR
      const monetagCode = adsConfig?.monetagTagCode?.trim();
      if (adsConfig?.monetagEnabled !== false && monetagCode) {
        const match = monetagCode.match(/src=['"]([^'"]+)['"]/);
        const monetagSrc = match ? match[1] : null;
        if (monetagSrc && !document.getElementById('monetag-dynamic-tag-script')) {
          const mScript = document.createElement('script');
          mScript.id = 'monetag-dynamic-tag-script';
          mScript.src = monetagSrc;
          mScript.async = true;
          mScript.onerror = () => { /* Suppress monetag script errors */ };
          document.head.appendChild(mScript);
        }
      }

      // 🛡️ Always pick a verified clean landing page URL (never raw .js scripts!)
      const targetDirectLink = getRandomSafeDirectLink(adsConfig);

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
      clearInterval(scaleTimer);
      try { observer.disconnect(); } catch {}
      window.removeEventListener('click', triggerSmartPopunder, { capture: true });
    };
  }, [settings?.adsConfig, activeTab, user, floatingAdsEnabled]);

  return null;
};
