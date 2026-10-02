import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export const AdsterraScriptInjector: React.FC = () => {
  const { settings } = useApp();
  const isExecutingRef = useRef(false);

  useEffect(() => {
    const adsConfig = settings?.adsConfig;
    const customSocialBar = adsConfig?.adsterraSocialBarCode?.trim();

    // 🛡️ 1. PURGE UNWANTED OVERLAYS IF SOCIAL BAR IS EMPTY OR CHANGED
    const removeLingeringOverlays = () => {
      if (!customSocialBar) {
        const badIds = [
          'adsterra-social-bar-script',
          'adsterra-popunder-direct-script',
          'adsterra-social-bar-custom-tag',
          'custom-clean-adsterra-script'
        ];
        badIds.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });

        const floatingElements = document.querySelectorAll(
          '[class*="pl_"], [id*="pl_"], [class*="social-bar"], [id*="social-bar"], [data-adsterra]'
        );
        floatingElements.forEach((el) => el.remove());
      }
    };

    removeLingeringOverlays();
    const cleanupInterval = setInterval(removeLingeringOverlays, 2000);

    // 💬 2. IF ADMIN ADDS A CLEAN NON-ADULT SOCIAL BAR IN THE FUTURE, INJECT IT CLEANLY
    if (customSocialBar) {
      const match = customSocialBar.match(/src=['"]([^'"]+)['"]/);
      const scriptSrc = match ? match[1] : null;

      if (scriptSrc && !document.getElementById('adsterra-clean-social-bar-script')) {
        const script = document.createElement('script');
        script.id = 'adsterra-clean-social-bar-script';
        script.src = scriptSrc;
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // 🚀 3. PRO SMART POPUNDER ENGINE (3-MIN INTERVAL COOLDOWN)
    const isPopunderActive = adsConfig?.popunderEnabled !== false; // Default ON
    const intervalMinutes = adsConfig?.popunderIntervalMinutes || 3; // Default 3 minutes
    const dailyCap = adsConfig?.popunderDailyCap || 8; // Default max 8 per day

    if (!isPopunderActive) {
      return () => clearInterval(cleanupInterval);
    }

    const COOLDOWN_MS = intervalMinutes * 60 * 1000;
    const STORAGE_KEY_LAST = 'watch_earn_smart_popunder_last_trigger';
    const STORAGE_KEY_COUNT = 'watch_earn_smart_popunder_daily_count';
    const STORAGE_KEY_DATE = 'watch_earn_smart_popunder_date';

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

    const handleSmartPopunderClick = (e: MouseEvent) => {
      if (isExecutingRef.current) return;

      const target = e.target as HTMLElement;
      // Never interrupt essential interactions (Navigation, Form inputs, Player controls, Modals)
      if (
        !target ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('nav') ||
        target.closest('footer') ||
        target.closest('[role="navigation"]') ||
        target.closest('[data-no-popunder]') ||
        target.closest('.no-popunder') ||
        target.closest('button[type="submit"]') ||
        target.closest('.auth-modal') ||
        target.closest('.video-player-controls')
      ) {
        return;
      }

      // Check daily quota limit
      const currentDaily = getDailyCount();
      if (currentDaily >= dailyCap) {
        return; // Daily cap reached
      }

      // Check cooldown timer
      const lastTriggerStr = localStorage.getItem(STORAGE_KEY_LAST);
      const now = Date.now();

      if (lastTriggerStr) {
        const elapsed = now - parseInt(lastTriggerStr, 10);
        if (elapsed < COOLDOWN_MS) {
          return; // Still in 3-minute cooldown
        }
      }

      // Lock cooldown immediately
      localStorage.setItem(STORAGE_KEY_LAST, now.toString());
      incrementDailyCount();

      isExecutingRef.current = true;
      setTimeout(() => {
        isExecutingRef.current = false;
      }, 1000);

      const targetDirectLink =
        adsConfig?.adsterraDirectLink?.trim() ||
        'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4';

      try {
        const popWindow = window.open(targetDirectLink, '_blank');
        if (popWindow) {
          try {
            window.focus();
          } catch {
            // Ignore focus error
          }
        }
      } catch (err) {
        console.warn('Smart Popunder note:', err);
      }
    };

    window.addEventListener('click', handleSmartPopunderClick, { capture: true, passive: true });

    return () => {
      clearInterval(cleanupInterval);
      window.removeEventListener('click', handleSmartPopunderClick, { capture: true });
    };
  }, [settings?.adsConfig]);

  return null;
};
