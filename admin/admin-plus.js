/* إضافات سهولة الاستعمال للوحة التحكم — لا تغيّر منطق الحفظ */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };

  // زر الرجوع للأعلى + تلميح الاختصارات
  var up = document.createElement('button'); up.id = 'toTop'; up.type = 'button'; up.textContent = '↑'; up.setAttribute('aria-label', 'للأعلى');
  up.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  document.body.appendChild(up);
  var hint = document.createElement('div'); hint.id = 'kbd'; hint.textContent = 'Ctrl+S حفظ · Ctrl+K بحث'; document.body.appendChild(hint);
  window.addEventListener('scroll', function () { up.classList.toggle('show', window.scrollY > 400); }, { passive: true });

  // اختصارات: Ctrl/⌘+S = حفظ ونشر ، Ctrl/⌘+K = بحث ، Esc = إلغاء
  document.addEventListener('keydown', function (e) {
    var mod = e.ctrlKey || e.metaKey, k = (e.key || '').toLowerCase();
    if (mod && k === 's') { var s = $('[data-act="save"]'); if (s) { e.preventDefault(); s.click(); } }
    else if (mod && k === 'k') { var q = $('#q'); if (q) { e.preventDefault(); q.focus(); q.select(); } }
  });

  // تحذير عند مغادرة الصفحة وفيها تعديلات غير محفوظة
  window.addEventListener('beforeunload', function (e) {
    var m = $('#sbmsg.dirty'); if (m) { e.preventDefault(); e.returnValue = ''; }
  });

  // عدّاد متحرك للأرقام في لوحة الإحصائيات
  function countUp(root) {
    root.querySelectorAll('.stats .num:not([data-c])').forEach(function (el) {
      el.setAttribute('data-c', '1');
      var to = parseInt(el.textContent, 10); if (isNaN(to) || to < 1) return;
      var t0 = performance.now();
      (function step(t) { var p = Math.min(1, (t - t0) / 700); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
    });
  }
  var app = $('#app');
  if (app) { new MutationObserver(function () { countUp(app); }).observe(app, { childList: true, subtree: true }); countUp(app); }
})();
