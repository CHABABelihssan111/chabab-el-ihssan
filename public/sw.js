// Service worker « النت أولا » : يجلب دائماً النسخة الجديدة (ويحترم تعطيل الموقع).
// بلا انترنت : يعرض آخر نسخة محفوظة — وصفحة التبرع وأرقام الحسابات محفوظة مسبقاً.
// /admin و /oauth لا يُخزَّنان أبداً.
const CACHE = 'cei-v3';
// تُحفظ عند التثبيت : الرئيسية + صفحة التبرع (أرقام الحسابات داخل ملفات الموقع نفسها)
const CORE = ['/', '/donate', '/volunteer', '/manifest.webmanifest', '/favicon-192.png', '/images/logo.png'];

const OFFLINE_HTML = '<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>شباب الإحسان</title><body style="font-family:system-ui,sans-serif;background:#7a1034;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px">' +
  '<div><h1>أنت غير متصل بالإنترنت</h1><p>أعد المحاولة عند عودة الاتصال.</p><p>Vous êtes hors ligne — réessayez plus tard.</p></div></body></html>';

const store = (cache, req, res) => (res && res.status === 200 ? cache.put(req, res.clone()).catch(() => {}) : undefined);

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(async (c) => {
        // قائمة ملفات البناء (يولّدها vite) : التطبيق + الرئيسية + التبرع + التطوع + الخطوط
        let built = [];
        try { built = (await (await fetch('/precache.json', { cache: 'reload' })).json()).files || []; } catch { /* dev */ }
        await Promise.all([...CORE, ...built].map((u) =>
          fetch(u, { cache: 'reload' }).then((r) => store(c, u, r)).catch(() => {})
        ));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// عند انقطاع الانترنت : النسخة المحفوظة لنفس الصفحة، وإلا الصفحة الرئيسية (التطبيق يعرض الصفحة المطلوبة بنفسه)
const offlineFallback = async (req) => {
  const c = await caches.open(CACHE);
  const hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  if (req.mode === 'navigate') {
    return (await c.match('/')) || (await c.match('/index.html')) ||
      new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return Response.error();
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return; // فيديو/ملفات كبيرة : بدون كاش
  if (/^\/(admin|oauth)(\/|$)/.test(url.pathname) || url.pathname === '/sw.js') return;

  // ملفات /assets/ أسماؤها تتبدل مع كل build → كاش أولا
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        caches.open(CACHE).then((c) => store(c, req, res));
        return res;
      }))
    );
    return;
  }

  // باقي الطلبات: النت أولا، والكاش عند انقطاع الانترنت فقط
  e.respondWith(
    fetch(req).then((res) => {
      caches.open(CACHE).then((c) => store(c, req, res)); // 503 (التعطيل) يُعرض ولا يُخزَّن
      return res;
    }).catch(() => offlineFallback(req))
  );
});
