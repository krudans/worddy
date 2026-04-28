// sw.js v3 - 캐시 오류로 인한 앱 재로드 방지
const CACHE = 'butterfly-word-v3';
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
      .catch(() => {}) // 실패해도 설치 계속
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
  
  // Firebase, Google API는 캐시하지 않음
  if(url.includes('firestore.googleapis.com') ||
     url.includes('firebase') ||
     url.includes('googleapis.com') ||
     url.includes('gstatic.com')) {
    return; // 네트워크 직접 처리
  }
  
  // HTML/manifest는 네트워크 우선, 실패하면 캐시
  if(url.includes('manifest.json') || url.includes('.html') || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(r => {
        if(r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone).catch(()=>{}));
        }
        return r;
      }).catch(() => caches.match(e.request).then(r => r || fetch(e.request)))
    );
    return;
  }
  
  // 나머지: 캐시 우선, 없으면 네트워크
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
