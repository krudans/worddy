const CACHE = 'wordday-v10';
const ASSETS = ['/', '/index.html', '/manifest.json', '/js/features.js', '/js/wordpacks.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/index.html'))));
});

// ── 알람 (Push Notification) ──
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title || 'WordDay', {
    body: data.body || '학습할 시간이에요!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: data.tag || 'wordday',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});

// ── 스케줄 알람 (백그라운드) ──
self.addEventListener('message', e => {
  if (e.data.type === 'SCHEDULE_ALARM') {
    const { title, body, delay, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body, icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        tag, vibrate: [100, 50, 100, 50, 200],
        data: { url: '/' }
      });
    }, delay);
  }
  if (e.data.type === 'AUDIO_PLAY') {
    // 백그라운드 오디오 상태 유지
    e.ports[0].postMessage({ status: 'playing' });
  }
});
