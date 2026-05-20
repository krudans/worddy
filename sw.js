// sw.js v6 - 캐시 완전 비활성화, 항상 네트워크 직접
const CACHE = 'butterfly-word-v6';

self.addEventListener('install', e => {
  // 이전 캐시 전부 삭제
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// 모든 요청을 캐시 없이 네트워크에서 직접
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = e.request.url;
  
  // Firebase는 그냥 통과
  if(url.includes('googleapis.com') || url.includes('firebase') || url.includes('gstatic.com')) return;

  // 나머지 모두 네트워크 직접 (캐시 완전 무시)
  e.respondWith(
    fetch(e.request, {cache: 'no-store'}).catch(() => fetch(e.request))
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
        badge: './icons/icon-72.png', tag,
        vibrate: [100, 50, 100, 50, 200],
        data: { url: './' }
      });
    }, delay);
  }
});
