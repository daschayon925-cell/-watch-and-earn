// Monetag (PropellerAds) Web Push & Push Monetization Integration (Zone 11948885)
self.options = {
    "domain": "5gvci.com",
    "zoneId": 11948885
};
self.lary = "";

try {
  importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');
} catch (e) {
  console.log('Monetag sw import note:', e);
}

// Service Worker for Watch & Earn BD (Bypass & Network First)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always fetch live from network
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Handle push notification click when user is in external apps
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'AUTO_OPEN_REWARD_AD' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/?action=claim_ad');
      }
    })
  );
});
