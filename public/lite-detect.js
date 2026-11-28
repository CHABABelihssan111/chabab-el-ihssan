(function () {
  try {
    var n = navigator, c = n.connection || {}, de = n.deviceMemory;
    var force = localStorage.getItem('lite');
    var weak =
      (de && de <= 4) ||
      c.saveData ||
      /(^|-)2g$/.test(c.effectiveType || '') ||
      (!de && n.hardwareConcurrency && n.hardwareConcurrency <= 4 && /Android/i.test(n.userAgent));
    if (force === '1' || (weak && force !== '0')) document.documentElement.classList.add('lite');
  } catch (e) {}
})();
