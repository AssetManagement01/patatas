(function () {
  if (window.__soFix2) return;
  window.__soFix2 = true;
  function hook() {
    if (typeof window.soSubmit !== 'function') return;
    if (window.soSubmit.__soFixed2) return;
    window.soSubmit = async function () {
      var msg = document.getElementById('so-msg');
      function show(t, ok) {
        if (msg) { msg.textContent = t; msg.style.color = ok ? '#16a34a' : '#dc2626'; }
      }
      var date = ((document.getElementById('so-date') || {}).value || '').trim();
      var loc = (window.getSOOutletValue ? window.getSOOutletValue() : ((document.getElementById('so-loc') || {}).value || '')).trim();
      var note = ((document.getElementById('so-note') || {}).value || '').trim();
      if (!date || !loc) { show('Tanggal dan Outlet wajib diisi', false); return; }
      var lines = window.soCollectLines ? window.soCollectLines() : [];
      if (!lines.length) { show('Pilih minimal 1 item', false); return; }
      var url = (window.API_URL || '').replace(/\/$/, '');
      if (!url) { show('API_URL kosong', false); return; }
      show('Menyimpan...', true);
      var payload = {
        action: 'saveListSO', date: date, loc: loc, note: note, items: lines,
        oleh: (function () {
          try {
            var s = JSON.parse(localStorage.getItem('patatas_asset_session') || 'null');
            return (s && (s.email || s.label)) || '';
          } catch (e) { return ''; }
        })()
      };
      try {
        var res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        var text = await res.text();
        var json = null;
        try { json = JSON.parse(text); } catch (e) { json = null; }
        if (json && (json.ok === false || json.status === 'error')) {
          show(json.error || json.message || 'Gagal simpan', false);
          return;
        }
        show('Tersimpan ' + lines.length + ' item ke List SO', true);
        var box = document.getElementById('so-lines');
        if (box) box.innerHTML = '';
        if (window.soEnsureLines) window.soEnsureLines();
        var n = document.getElementById('so-note');
        if (n) n.value = '';
        if (window.loadListSO) window.loadListSO(true);
      } catch (err) {
        show(String(err.message || err), false);
      }
    };
    window.soSubmit.__soFixed2 = true;
  }
  hook();
  setInterval(hook, 700);
})();
