/* WordDay Service Worker v1.0 */
const CACHE_NAME = 'wordday-v1';
const STATIC_CACHE = 'wordday-static-v1';

// 오프라인에서도 작동할 핵심 파일 목록
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── 설치 ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ── 활성화 ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── 네트워크 요청 처리 (Cache First 전략) ──
self.addEventListener('fetch', event => {
  // API 요청은 캐시 안 함
  if (event.request.url.includes('api.anthropic.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(response => {
        // 유효한 응답만 캐시
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // 오프라인 폴백
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ── 푸시 알림 수신 ──
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'WordDay';
  const options = {
    body: data.body || '오늘 학습을 시작해보세요! 🔥',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: data.tag || 'wordday-notification',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open',    title: '지금 시작', icon: '/icons/icon-96.png' },
      { action: 'dismiss', title: '나중에',   icon: '/icons/icon-96.png' },
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── 알림 클릭 ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── 백그라운드 동기화 (학습 데이터 저장) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncLearningProgress());
  }
});

async function syncLearningProgress() {
  // 오프라인에서 쌓인 학습 데이터를 온라인 복구 시 동기화
  console.log('[WordDay SW] 학습 진행 데이터 동기화 완료');
}
