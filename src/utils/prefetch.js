// تحميل مسبق لصفحات الموقع عند مرور الفأرة/اللمس على الرابط، فيظهر التنقل فوريًا
// دون وميض هيكل التحميل. Vite يدمج هذه الاستيرادات مع lazy() في App.jsx (نفس الملفات).
const ROUTES = {
  '/donate': () => import('../pages/Donate'),
  '/volunteer': () => import('../pages/Volunteer'),
  '/news': () => import('../pages/NewsPage'),
  '/programs': () => import('../pages/ProgramsPage'),
  '/privacy-policy': () => import('../pages/PrivacyPolicy'),
  '/terms-of-use': () => import('../pages/TermsOfUse'),
  '/report-problem': () => import('../pages/ReportProblem'),
  '/gallery': () => import('../pages/GalleryPage'),
  '/sadaqa-jariya': () => import('../pages/SadaqaJariya'),
  '/participate': () => import('../pages/Participate'),
  '/feedback': () => import('../pages/FeedbackPage'),
};
const done = new Set();

function warm(e) {
  const a = e.target && e.target.closest ? e.target.closest('a[href^="/"]') : null;
  if (!a) return;
  const p = a.getAttribute('href').split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const load = ROUTES[p];
  if (!load || done.has(p)) return;
  done.add(p);
  load().catch(() => done.delete(p));
}

export function initPrefetch() {
  const c = navigator.connection;
  if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return; // لا نستهلك بيانات المشترك
  ['pointerover', 'touchstart', 'focusin'].forEach((ev) =>
    document.addEventListener(ev, warm, { passive: true, capture: true }));
}
