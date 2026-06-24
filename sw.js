// sw.js v9 - HTML/스크립트는 항상 최신(네트워크) + Noto 이모지 이미지만 영구 캐시(cache-first) + prefetch 지원
const CACHE = 'butterfly-word-v9';
const EMOJI_CACHE = 'noto-emoji-v1';   // 이모지 이미지 영구 캐시(버전 갱신 시에도 보존)

function isEmojiReq(url){
  return url.indexOf('noto-emoji') >= 0 && url.indexOf('.png') >= 0;
}

self.addEventListener('install', e => {
  // 이모지 캐시는 보존하고 나머지 캐시만 삭제
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== EMOJI_CACHE).map(k => caches.delete(k))
    ))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== EMOJI_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    const clientList = await self.clients.matchAll({ type: 'window' });
    for (const client of clientList) {
      client.postMessage({ type: 'SW_UPDATED', version: CACHE });
    }
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // Noto 이모지 이미지: 영구 캐시-우선 (한 번 받으면 다시 네트워크 안 탐)
  if (isEmojiReq(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(EMOJI_CACHE);
      const hit = await cache.match(e.request);
      if (hit) return hit;
      try {
        const res = await fetch(e.request);
        if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        const any = await cache.match(e.request);
        return any || Response.error();
      }
    })());
    return;
  }

  // Firebase는 그냥 통과
  if (url.includes('googleapis.com') || url.includes('firebase') || url.includes('gstatic.com')) return;

  // HTML 문서(내비게이션): 엣지 캐시까지 우회해 항상 최신
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

  // 나머지(스크립트 등)도 네트워크 직접
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
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
