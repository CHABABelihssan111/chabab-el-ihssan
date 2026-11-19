// Service worker "النت أولا" : يجلب دائماً النسخة الجديدة (ويحترم تعطيل الموقع).
// بلا انترنت فقط يعرض آخر نسخة محفوظة. /admin و /oauth لا يُخزَّنان أبداً.
const CACHE = 'cei-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (/^\/(admin|oauth)(\/|$)/.test(url.pathname) || url.pathname === '/sw.js') return;

  // ملفات /assets/ أسماؤها تتبدل مع كل build → كاش أولا
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); }
        return res;
      }))
    );
    return;
  }

  // باقي الطلبات: النت أولا، والكاش عند انقطاع الانترنت فقط
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); }
      return res; // يشمل 503 (التعطيل): يُعرض ولا يُخزَّن
    }).catch(() =>
      caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('/index.html') || caches.match('/') : undefined))
    )
  );
});
