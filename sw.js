// sw.js v5 - 강제 캐시 갱신
const CACHE = 'butterfly-word-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json?v=2',
  './js/features.js',
  './js/wordpacks.js',
  './js/default-words.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .catch(() => {})
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
  const url = e.request.url;
  if(url.includes('firestore.googleapis.com') ||
     url.includes('firebase') ||
     url.includes('googleapis.com') ||
     url.includes('gstatic.com')) return;
  
  // index.html + JS: 항상 네트워크 우선 (캐시 무시)
  if(url.includes('.html') || url.includes('index') || url.endsWith('/') || url.includes('.js')) {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).then(r => {
        if(r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone).catch(()=>{}));
        }
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(r => {
        if(r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone).catch(()=>{}));
        }
        return r;
      });
    }).catch(() => fetch(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title || 'Butterfly Word', {
    body: data.body || '학습할 시간이에요! 🦋',
    icon: './icons/icon-192.png',
    badge: './icons/icon-72.png',
    tag: data.tag || 'butterfly',
    vibrate: [100, 50, 100],
    data: { url: data.url || './' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_ALARM') {
    const { title, body, delay, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body, icon: './icons/icon-192.png',
        badge: './icons/icon-72.png',
        tag, vibrate: [100, 50, 100, 50, 200],
        data: { url: './' }
      });
    }, delay);
  }
});
