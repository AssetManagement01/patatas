(function () {
  if (window.__soFix4) return;
  window.__soFix4 = true;
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function netFail(err) {
    var m = String((err && err.message) || err || '').toLowerCase();
    return /load failed|failed to fetch|networkerror|network request failed|the operation was aborted/.test(m);
  }
  function afterSave(n, show) {
    show('Tersimpan ' + n + ' item ke List SO', true);
    var box = document.getElementById('so-lines');
    if (box) box.innerHTML = '';
    if (window.soEnsureLines) window.soEnsureLines();
    var note = document.getElementById('so-note');
    if (note) note.value = '';
    setTimeout(loadFromSheet, 800);
    setTimeout(loadFromSheet, 2500);
  }
  function loadFromSheet() {
    window.patatasListSO = function (resp) {
      var cols = (resp.table && resp.table.cols) || [];
      var rows = (resp.table && resp.table.rows) || [];
      var h = cols.map(function (c) { return String(c.label || '').toLowerCase().trim(); });
      function ix() {
        for (var a = 0; a < arguments.length; a++) {
          var j = h.indexOf(arguments[a]);
          if (j >= 0) return j;
        }
        return -1;
      }
      var iT = ix('tanggal'), iId = ix('product id', 'productid', 'id');
      var iCat = ix('category'), iSub = ix('subcategory', 'sub category');
      var iCode = ix('product code', 'productcode', 'code');
      var iName = ix('product name', 'productname', 'name');
      var iUnit = ix('unit', 'uom'), iQty = ix('qty');
      var iLoc = ix('outlet', 'loc'), iNote = ix('catatan', 'note');
      var out = [];
      rows.forEach(function (row, i) {
        var c = row.c || [];
        var name = cell(c[iName]);
        var date = cell(c[iT]);
        if (!name && !date) return;
        out.push({
          id: 'SOROW' + (i + 2), date: date, productId: cell(c[iId]),
          category: cell(c[iCat]), subcategory: cell(c[iSub]), productCode: cell(c[iCode]),
          productName: name, unit: cell(c[iUnit]), qty: Number(cell(c[iQty])) || 0,
          loc: cell(c[iLoc]), outlet: cell(c[iLoc]), note: cell(c[iNote])
        });
      });
      out.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      window.listSOData = out;
      if (window.renderListSO) window.renderListSO(out);
    };
    var s = document.createElement('script');
    s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=List%20SO&tqx=out:json;responseHandler:patatasListSO&_=' + Date.now();
    document.body.appendChild(s);
  }
  function hookLoad() {
    window.loadListSO = function () {
      var tb = document.getElementById('table-body-so');
      if (tb) tb.innerHTML = '<tr><td colspan="12" style="padding:1rem;text-align:center;color:#94a3b8">Memuat…</td></tr>';
      loadFromSheet();
    };
  }
  function hookSave() {
    if (window.soSubmit && window.soSubmit.__soFixed4) return;
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
          body: JSON.stringify(payload),
          redirect: 'follow'
        });
        var text = '';
        try { text = await res.text(); } catch (e) { text = ''; }
        var json = null;
        try { json = JSON.parse(text); } catch (e) { json = null; }
        if (json && (json.ok === false || json.status === 'error')) {
          show(json.error || json.message || 'Gagal simpan', false);
          return;
        }
        afterSave(lines.length, show);
      } catch (err) {
        if (netFail(err)) afterSave(lines.length, show);
        else show(String(err.message || err), false);
      }
    };
    window.soSubmit.__soFixed4 = true;
  }
  hookLoad();
  hookSave();
  setInterval(function () { hookLoad(); hookSave(); }, 800);
  setTimeout(loadFromSheet, 1200);
})();
