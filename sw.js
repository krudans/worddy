const CACHE = 'vocabug-v11';
const ASSETS = [
  '/worddy/',
  '/worddy/index.html',
  '/worddy/manifest.json',
  '/worddy/js/features.js',
  '/worddy/js/wordpacks.js',
  '/worddy/icons/icon-192.png',
  '/worddy/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if(response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request)
          .then(r => r || caches.match('/worddy/index.html'));
      })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title || 'Vocabug', {
    body: data.body || '학습할 시간이에요! 🐛',
    icon: '/worddy/icons/icon-192.png',
    badge: '/worddy/icons/icon-72.png',
    tag: data.tag || 'vocabug',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/worddy/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/worddy/'));
});

self.addEventListener('message', e => {
  if(e.data.type === 'SCHEDULE_ALARM') {
    const { title, body, delay, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body, icon: '/worddy/icons/icon-192.png',
        badge: '/worddy/icons/icon-72.png',
        tag, vibrate: [100, 50, 100, 50, 200],
        data: { url: '/worddy/' }
      });
    }, delay);
  }
});
