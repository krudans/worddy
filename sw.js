const CACHE = 'vocabug-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/features.js',
  '/js/wordpacks.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 설치 - 새 캐시 등록
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting(); // 즉시 활성화
});

// 활성화 - 구버전 캐시 전부 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] 구버전 캐시 삭제:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim(); // 현재 열린 탭에도 즉시 적용
});

// fetch - 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', e => {
  // POST 요청은 캐시 안 함
  if(e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 성공하면 캐시 업데이트
        if(response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 → 캐시에서
        return caches.match(e.request).then(r => r || caches.match('/index.html'));
      })
  );
});

// 알람 (Push Notification)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title || 'Vocabug', {
    body: data.body || '학습할 시간이에요! 🐛',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: data.tag || 'vocabug',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});

// 스케줄 알람
self.addEventListener('message', e => {
  if(e.data.type === 'SCHEDULE_ALARM') {
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
});
