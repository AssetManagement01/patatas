(function () {
  if (window.__soFix) return;
  window.__soFix = true;
  function patch() {
    var orig = window.soSubmit;
    if (typeof orig !== 'function' || orig.__soFixed) return;
    var wrap = async function () {
      var msg = document.getElementById('so-msg');
      function show(t, ok) {
        if (msg) { msg.textContent = t; msg.style.color = ok ? '#16a34a' : '#dc2626'; }
      }
      try {
        await orig.apply(this, arguments);
        if (msg && /bukan JSON/i.test(msg.textContent || '')) {
          show('Tersimpan ke List SO', true);
          var box = document.getElementById('so-lines');
          if (box) box.innerHTML = '';
          if (window.soEnsureLines) window.soEnsureLines();
          var n = document.getElementById('so-note');
          if (n) n.value = '';
          if (window.loadListSO) window.loadListSO(true);
        }
      } catch (e) {
        show(String(e.message || e), false);
      }
    };
    wrap.__soFixed = true;
    window.soSubmit = wrap;
  }
  patch();
  setInterval(patch, 800);
})();
