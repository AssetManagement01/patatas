/* Saran item Berita Acara per outlet: Kas Keluar & Kas Masuk hanya menampilkan item Aset Tetap
   yang lokasinya sama persis dengan Lokasi terpilih, format "SKU — Nama". Nama manual tetap boleh. */
(function () {
  if (window.__baItems) return; window.__baItems = true;
  var SEP = ' — ';
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLowerCase(); }
  function data() {
    try { if (typeof uniqueData !== 'undefined' && uniqueData && uniqueData.length) return uniqueData; } catch (e) {}
    return window.uniqueData || [];
  }
  function label(i) { return i.name ? (String(i.sku).trim() + SEP + String(i.name).trim()) : String(i.sku).trim(); }
  function itemsFor(loc) {
    var L = norm(loc), seen = {}, out = [];
    if (!L) return out;
    data().forEach(function (i) {
      if (!i || !i.sku || norm(i.location || i.loc || i.lokasi) !== L) return;
      var k = String(i.sku).trim().toUpperCase(); if (seen[k]) return; seen[k] = 1; out.push(i);
    });
    return out.sort(function (a, b) { return label(a).localeCompare(label(b)); });
  }
  var CFG = [
    { loc: 'ba-loc', inp: '.ba-line-sku', dl: 'ba-sku-list-outlet' },
    { loc: 'ba2-loc', inp: '.ba2-line-name', dl: 'ba2-name-list-outlet' }
  ];
  var state = {};
  function allLabels() { var m = {}; data().forEach(function (i) { if (i && i.sku) m[norm(label(i))] = 1; }); return m; }
  function sync(c, locChanged) {
    var sel = document.getElementById(c.loc); if (!sel) return;
    var dl = document.getElementById(c.dl);
    if (!dl) { dl = document.createElement('datalist'); dl.id = c.dl; document.body.appendChild(dl); }
    var loc = sel.value || '', n = data().length, key = loc + '|' + n;
    if (state[c.dl] !== key) {
      state[c.dl] = key;
      var list = itemsFor(loc);
      dl.innerHTML = '';
      list.forEach(function (i) { var o = document.createElement('option'); o.value = label(i); dl.appendChild(o); });
      dl.__ok = {}; list.forEach(function (i) { dl.__ok[norm(label(i))] = 1; });
    }
    var all = locChanged ? allLabels() : null;
    document.querySelectorAll(c.inp).forEach(function (el) {
      if (el.getAttribute('list') !== c.dl) el.setAttribute('list', c.dl);
      el.placeholder = loc ? 'Ketik SKU atau nama item...' : 'Pilih lokasi dulu (atau ketik manual)';
      if (all && el.value && all[norm(el.value)] && !dl.__ok[norm(el.value)]) el.value = ''; // item outlet lain dihapus
    });
  }
  function run(changedId) { CFG.forEach(function (c) { sync(c, changedId === c.loc); }); }
  document.addEventListener('change', function (ev) { var id = ev.target && ev.target.id; if (id === 'ba-loc' || id === 'ba2-loc') run(id); }, true);
  document.addEventListener('focusin', function (ev) { var t = ev.target; if (t && t.matches && (t.matches('.ba-line-sku') || t.matches('.ba2-line-name'))) run(); }, true);
  // Kas Masuk: simpan nama saja (BA2 tidak punya kolom SKU), seperti sebelumnya
  document.addEventListener('submit', function () {
    var byLabel = {}; data().forEach(function (i) { if (i && i.sku) byLabel[norm(label(i))] = i; });
    document.querySelectorAll('.ba2-line-name').forEach(function (el) { var it = byLabel[norm(el.value)]; if (it && it.name) el.value = String(it.name).trim(); });
  }, true);
  setInterval(run, 1500);
  run();
  window.baItemsFor = itemsFor;
})();
