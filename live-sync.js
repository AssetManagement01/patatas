/* Live sync: Aset Tetap & Dashboard baca langsung dari Apps Script (listMasterRows, tanpa delay CSV publish),
   tabel otomatis reload setelah simpan/edit/approve/hapus, dan polling ringan tiap 60 detik saat tab aktif. */
(function () {
  if (window.__liveSync) return;
  window.__liveSync = true;
  var POLL_MS = 60000;
  var lastSig = '';
  var origLoad = window.loadLiveData;
  function api() { return String(window.API_URL || '').replace(/\/$/, ''); }
  function q(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  // Ubah baris sheet jadi CSV (format sama dengan CSV publish). Kolom pertama dummy supaya
  // parameter "?t=..." yang ditempel loader lama ke URL tidak terbaca sebagai baris data.
  function toCsv(rows) { return rows.map(function (r) { return ['_'].concat(r).map(q).join(','); }).join('\n') + '\n'; }
  async function fetchRows() {
    var res = await fetch(api() + '?action=listMasterRows&_=' + Date.now(), { cache: 'no-store', redirect: 'follow' });
    var j = await res.json();
    if (!j || !j.ok || !Array.isArray(j.rows) || j.rows.length < 2) throw new Error('listMasterRows kosong');
    return j.rows;
  }
  function snapView() {
    var ms = {};
    ['ms-category', 'ms-sub', 'ms-location', 'ms-kondisi'].forEach(function (id) {
      var w = document.getElementById(id);
      if (w) ms[id] = [].slice.call(w.querySelectorAll('.ms-list input[type=checkbox]:checked')).map(function (c) { return c.value; });
    });
    return { ms: ms, y: window.scrollY };
  }
  function restoreView(s) {
    var any = false;
    Object.keys(s.ms).forEach(function (id) {
      var vals = s.ms[id]; if (!vals.length) return;
      var w = document.getElementById(id); if (!w) return;
      w.querySelectorAll('.ms-list input[type=checkbox]').forEach(function (c) { if (vals.indexOf(c.value) >= 0) { c.checked = true; any = true; } });
      if (typeof window.updateMsLabel === 'function') {
        var lab = { 'ms-category': '- Select Category -', 'ms-sub': '- Select Sub Category -', 'ms-location': '- Select Location -', 'ms-kondisi': '- Show All -' }[id];
        try { window.updateMsLabel(id, lab); } catch (e) {}
      }
    });
    if (any && typeof window.applyFilter === 'function') { try { window.applyFilter(); } catch (e) {} }
    window.scrollTo(0, s.y);
  }
  async function liveLoad(opts) {
    opts = opts || {};
    var rows = null;
    try { rows = await fetchRows(); } catch (e) { console.warn('live-sync: Apps Script gagal, pakai CSV', e); }
    if (!rows) return origLoad.apply(this, arguments);
    var sig = JSON.stringify(rows);
    if (opts.ifChanged && sig === lastSig) return;
    lastSig = sig;
    var view = snapView();
    var keep = window.SHEET_CSV_URL;
    window.SHEET_CSV_URL = 'data:text/csv;charset=utf-8,' + encodeURIComponent(toCsv(rows));
    try { await origLoad(); } finally { window.SHEET_CSV_URL = keep; }
    restoreView(view);
    var st = document.getElementById('api-status');
    if (st && /Sheets CSV/.test(st.textContent)) st.textContent = st.textContent.replace('Live dari Sheets CSV', 'Live dari Apps Script');
  }
  if (typeof origLoad === 'function') {
    window.loadLiveData = function () { return liveLoad({}); };
    try { loadLiveData = window.loadLiveData; } catch (e) {}
  }

  // ===== Reload otomatis setelah aksi tulis =====
  var pending = {}, timer = null;
  function scheduleRefresh(action) {
    var a = String(action || '');
    if (/Transfer/i.test(a)) { pending.tf = 1; pending.asset = 1; }
    else if (/BA2/.test(a)) pending.ba2 = 1;
    else if (/BA/.test(a)) pending.ba = 1;
    else if (/ItemPhoto|uploadPhoto/i.test(a)) pending.asset = 1;
    else return;
    clearTimeout(timer);
    timer = setTimeout(runRefresh, 1200);
  }
  function call(fn) { try { var f = window[fn]; if (typeof f === 'function') return Promise.resolve(f()).catch(function () {}); } catch (e) {} return Promise.resolve(); }
  async function runRefresh() {
    var p = pending; pending = {};
    if (p.asset) await liveLoad({}).catch(function () {});
    if (p.tf) { await call('tfRenderHistorySafe'); call('tfRenderTable'); }
    if (p.ba) call('baReload');
    if (p.ba2) call('ba2Reload');
    if ((p.ba || p.ba2) && document.getElementById('ba-rp-tbody') && document.getElementById('ba-rp-tbody').offsetParent) call('baRenderReport');
  }
  window.liveSyncRefresh = function (what) { (what || ['asset', 'tf', 'ba', 'ba2']).forEach(function (k) { pending[k] = 1; }); runRefresh(); };
  var WRITE = /^(save|update|delete|upload)/i;
  var _fetch = window.fetch;
  window.fetch = function (input, init) {
    var p = _fetch.apply(this, arguments);
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var method = (init && init.method) || (input && input.method) || 'GET';
      if (String(method).toUpperCase() === 'POST' && url.indexOf('script.google.com/macros') >= 0 && init && typeof init.body === 'string') {
        var action = ''; try { action = JSON.parse(init.body).action || ''; } catch (e) {}
        if (WRITE.test(action)) p.then(function (r) { if (r && r.ok) scheduleRefresh(action); }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };

  // Data awal mungkin sudah dimuat dari CSV sebelum file ini aktif -> segarkan sekali dari Apps Script
  if (window.USER_EMAIL && typeof origLoad === 'function') liveLoad({}).catch(function () {});

  // ===== Polling ringan: hanya saat tab terlihat & sudah login, re-render hanya jika data berubah =====
  setInterval(function () {
    if (document.hidden || !window.USER_EMAIL || typeof origLoad !== 'function') return;
    liveLoad({ ifChanged: true }).catch(function () {});
  }, POLL_MS);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && window.USER_EMAIL) liveLoad({ ifChanged: true }).catch(function () {});
  });
})();
