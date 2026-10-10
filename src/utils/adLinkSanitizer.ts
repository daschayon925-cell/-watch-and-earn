// 🛡️ High-Converting Ad Link Sanitizer
// Ensures raw JS SDK files (e.g., Monetag tag.min.js, 5gvci.com, Adsterra invoke.js) 
// are NEVER mistakenly opened as landing pages in user browsers.

export const VERIFIED_DIRECT_LINKS = {
  adsterra: 'https://www.profitableratecpmnetwork.com/qbtbe2bx?key=2c7a6b8817f0da29e82bed11c12f55c4',
  hilltop: 'https://affectionatestorage.com/Ah6g5c',
  monetag: 'https://uplcm.com/4/11971342'
};

/**
 * Returns a guaranteed clean landing page URL.
 * If input contains `.js`, script tags, or invalid protocols, it falls back to a real Direct Link.
 */
export function sanitizeAdDirectLink(
  rawUrl?: string | null,
  network: 'adsterra' | 'hilltop' | 'monetag' = 'monetag'
): string {
  const fallback = VERIFIED_DIRECT_LINKS[network] || VERIFIED_DIRECT_LINKS.monetag;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return fallback;
  }

  const trimmed = rawUrl.trim();

  // Reject scripts, html tags, or invalid protocols
  if (
    trimmed.includes('.js') ||
    trimmed.includes('tag.min.js') ||
    trimmed.includes('5gvci.com') ||
    trimmed.includes('invoke.js') ||
    trimmed.includes('<script') ||
    trimmed.startsWith('javascript:') ||
    (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))
  ) {
    return fallback;
  }

  return trimmed;
}

/**
 * Returns a safe rotating direct link from verified ad networks (Equal share).
 */
export function getRandomSafeDirectLink(adsConfig?: any): string {
  const adsterra = sanitizeAdDirectLink(adsConfig?.adsterraDirectLink, 'adsterra');
  const hilltop = sanitizeAdDirectLink(adsConfig?.hilltopAdsDirectLink, 'hilltop');
  const monetag = sanitizeAdDirectLink(adsConfig?.monetagDirectLink, 'monetag');

  const rand = Math.random();
  if (rand < 0.34) return adsterra;
  if (rand < 0.67) return hilltop;
  return monetag;
}
