// sw.js v8 - 캐시 비활성화 + HTML 항상 최신(CDN 엣지 캐시까지 우회) + 새 버전 자동 반영
const CACHE = 'butterfly-word-v8';

self.addEventListener('install', e => {
  // 이전 캐시 전부 삭제
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // 이전 캐시 전부 삭제
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
    // 새 SW가 활성화되면, 통제 중인 모든 페이지에 '새 버전' 알림 → 자동 새로고침 유도
    const clientList = await self.clients.matchAll({ type: 'window' });
    for (const client of clientList) {
      client.postMessage({ type: 'SW_UPDATED', version: CACHE });
    }
  })());
});

// 모든 요청을 캐시 없이 네트워크에서 직접 (HTML 내비게이션 포함)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // Firebase는 그냥 통과
  if (url.includes('googleapis.com') || url.includes('firebase') || url.includes('gstatic.com')) return;

  // HTML 문서(내비게이션) 요청: 브라우저 HTTP 캐시는 물론, GitHub Pages(Fastly) 엣지 캐시까지 우회.
  // ?nocache 같은 쿼리만으로는 Fastly가 같은 경로의 옛 HTML을 계속 주므로,
  // 매 요청마다 고유 쿼리(_cb)를 붙여 항상 오리진의 최신본을 받도록 한다.
  const isNavigation = e.request.mode === 'navigate' ||
    (e.request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    e.respondWith((async () => {
      try {
        const bust = new URL(e.request.url);
        bust.searchParams.set('_cb', Date.now());
        return await fetch(bust.toString(), { cache: 'reload' });
      } catch (err) {
        try { return await fetch(e.request, { cache: 'reload' }); }
        catch (err2) {
          try { return await fetch(e.request); }
          catch (err3) {
            return new Response('오프라인 상태입니다.', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }
        }
      }
    })());
    return;
  }

  // 나머지(스크립트/이미지 등)도 네트워크 직접
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).catch(() => fetch(e.request))
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
  if (e.data && e.data.type === 'SCHEDULE_ALARM') {
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
  // 페이지가 즉시 새 SW로 전환을 요청할 때
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
