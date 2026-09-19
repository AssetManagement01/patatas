(function () {
  var SHEET_ID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';

  function apiUrl() { return String(window.API_URL || '').replace(/\/$/, ''); }
  function loadLocal(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } }
  function normDate(d) {
    d = String(d || '').trim();
    var m = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    return d.substring(0, 10);
  }
  function jenis() {
    var el = document.getElementById('ba-rp-jenis');
    return el ? el.value : 'keluar';
  }
  function inRange(list) {
    var from = normDate((document.getElementById('ba-rp-from') || {}).value || '');
    var to = normDate((document.getElementById('ba-rp-to') || {}).value || '');
    return (list || []).filter(function (t) {
      var td = normDate(t.date || t.Tanggal || '');
      if (from && td && td < from) return false;
      if (to && td && td > to) return false;
      return true;
    });
  }
  function parseFotoUrl(val) {
    val = String(val || '').trim();
    if (!val) return '';
    var driveMatch = val.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w400';
    if (/^https?:\/\/|^data:image\//i.test(val)) return val;
    return '';
  }
  function cellStr(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function loadBa2Sheet() {
    return new Promise(function (resolve, reject) {
      var name = '__baRpGviz_' + Date.now();
      var timer = setTimeout(function () { reject(new Error('timeout')); }, 12000);
      window[name] = function (resp) {
        clearTimeout(timer);
        try {
          var table = resp && resp.table;
          var cols = (table && table.cols) || [];
          var rows = (table && table.rows) || [];
          var h = cols.map(function (c) { return String(c.label || c.id || '').trim().toLowerCase(); });
          function ix(n) { return h.indexOf(n); }
          var iT = ix('tanggal'), iN = ix('nama'), iU = ix('uom'), iQ = ix('qty'), iP = ix('price');
          var iTot = ix('total'), iK = ix('keterangan'), iF = ix('foto'), iL = ix('loc'), iS = ix('status');
          var out = [];
          rows.forEach(function (row, ri) {
            var c = row.c || [];
            var date = cellStr(c[iT]), nama = cellStr(c[iN]);
            if (!date && !nama) return;
            out.push({
              date: date, name: nama, uom: cellStr(c[iU]),
              qty: Number(String(cellStr(c[iQ])).replace(/,/g, '')) || 0,
              price: Number(String(cellStr(c[iP])).replace(/,/g, '')) || 0,
              total: Number(String(cellStr(c[iTot])).replace(/,/g, '')) || 0,
              keterangan: cellStr(c[iK]), foto: cellStr(c[iF]), loc: cellStr(c[iL]),
              status: cellStr(c[iS]) || 'Done'
            });
          });
          try { localStorage.setItem('patatas_ba2_v1', JSON.stringify(out)); } catch (e) {}
          resolve(out);
        } catch (err) { reject(err); }
      };
      var s = document.createElement('script');
      s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?sheet=BA2&tqx=out:json;responseHandler:' + name + '&_=' + Date.now();
      s.onerror = function () { clearTimeout(timer); reject(new Error('gviz')); };
      document.body.appendChild(s);
    });
  }

  function mapRow(t, kind) {
    t = t || {};
    var nama = t.name || t.nama || t.Nama || '';
    var shifted = kind === 'masuk' && /^(drg|liter|ltr|pcs)$/i.test(String(nama).trim()) && t.sku;
    var r;
    if (shifted) {
      r = {
        Jenis: 'Kas Masuk', Tanggal: t.date || '', Nama: t.sku,
        Uom: nama, Qty: Number(t.uom) || 0, Price: Number(t.qty) || 0, Total: Number(t.price) || 0,
        Keterangan: /^https?:/i.test(t.keterangan || '') ? '' : (t.keterangan || ''),
        Loc: t.foto || '', Status: /done|permintaan/i.test(t.loc || '') ? t.loc : (t.status || 'Done'),
        FotoRaw: /^https?:/i.test(t.keterangan || '') ? t.keterangan : (t.foto || '')
      };
    } else {
      r = {
        Jenis: kind === 'masuk' ? 'Kas Masuk' : 'Kas Keluar',
        Tanggal: t.date || t.Tanggal || '', SKU: kind === 'masuk' ? '' : (t.sku || ''),
        Nama: nama || t.sku || '', Loc: t.loc || '', Qty: Number(t.qty) || 0, Uom: t.uom || '',
        Price: Number(t.price) || 0, Total: Number(t.total) || 0,
        Keterangan: t.keterangan || '', Status: t.status || '', FotoRaw: t.foto || ''
      };
    }
    if (!r.Total) r.Total = (Number(r.Price) || 0) * (Number(r.Qty) || 0);
    r.FotoUrl = parseFotoUrl(r.FotoRaw);
    if (/^https?:/i.test(r.Keterangan || '')) { r.FotoUrl = r.FotoUrl || parseFotoUrl(r.Keterangan); r.Keterangan = ''; }
    return r;
  }

  function injectTools() {
    var panel = document.getElementById('rp-panel-ba');
    if (!panel || document.getElementById('ba-rp-jenis')) return;
    var h = panel.querySelector('h3');
    if (h) h.textContent = 'Berita Acara Report';
    var wrap = panel.querySelector('div[style*="flex-wrap"]');
    if (!wrap) return;
    var box = document.createElement('div');
    box.style.minWidth = '180px';
    box.innerHTML =
      '<label style="font-size:0.72rem;font-weight:600;color:#64748b">Jenis</label>' +
      '<select id="ba-rp-jenis" style="width:100%;padding:0.45rem;border:1px solid var(--border);border-radius:8px;box-sizing:border-box">' +
      '<option value="keluar">Kas Keluar</option>' +
      '<option value="masuk">Kas Masuk</option>' +
      '<option value="semua">Semua</option>' +
      '</select>';
    wrap.insertBefore(box, wrap.firstChild);
    document.getElementById('ba-rp-jenis').addEventListener('change', function () {
      if (window.baRenderReport) window.baRenderReport();
    });
  }

  window.baCollectReportRows = function () {
    var j = jenis();
    var rows = [];
    if (j === 'keluar' || j === 'semua') {
      inRange(loadLocal('patatas_ba_v1')).forEach(function (t) { rows.push(mapRow(t, 'keluar')); });
    }
    if (j === 'masuk' || j === 'semua') {
      inRange(loadLocal('patatas_ba2_v1')).forEach(function (t) { rows.push(mapRow(t, 'masuk')); });
    }
    rows.sort(function (a, b) { return String(a.Tanggal).localeCompare(String(b.Tanggal)); });
    return rows;
  };

  window.baRenderReport = async function () {
    injectTools();
    var url = apiUrl();
    if (url && jenis() !== 'masuk') {
      try {
        var r1 = await fetch(url + '?action=listBA&_=' + Date.now());
        var d1 = await r1.json();
        if (d1 && d1.ok && Array.isArray(d1.items)) localStorage.setItem('patatas_ba_v1', JSON.stringify(d1.items));
      } catch (e) {}
    }
    if (jenis() !== 'keluar') {
      try { await loadBa2Sheet(); } catch (e) {}
    }
    var rows = window.baCollectReportRows();
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;
    var showSku = jenis() !== 'masuk';
    var table = tb.closest('table');
    if (table) {
      var head = table.querySelector('thead tr');
      if (head) {
        head.innerHTML =
          (jenis() === 'semua' ? '<th style="padding:0.4rem">Jenis</th>' : '') +
          '<th style="padding:0.4rem">Tanggal</th>' +
          (showSku ? '<th style="padding:0.4rem">SKU</th>' : '') +
          '<th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th>' +
          '<th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th>' +
          '<th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th>' +
          '<th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th>' +
          '<th style="padding:0.4rem">Foto</th>';
      }
    }
    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="12" style="padding:1rem;text-align:center;color:#94a3b8">Tidak ada data</td></tr>';
      return;
    }
    function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
    tb.innerHTML = rows.map(function (r) {
      var fotoHtml = '-';
      if (r.FotoUrl) {
        fotoHtml = '<a href="' + r.FotoUrl + '" target="_blank"><img src="' + r.FotoUrl + '" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #cbd5e1"/></a>';
      }
      return '<tr style="border-bottom:1px solid #f1f5f9">' +
        (jenis() === 'semua' ? '<td style="padding:0.4rem">' + r.Jenis + '</td>' : '') +
        '<td style="padding:0.4rem">' + (r.Tanggal || '') + '</td>' +
        (showSku ? '<td style="padding:0.4rem;font-family:monospace;font-size:0.72rem">' + (r.SKU || '') + '</td>' : '') +
        '<td style="padding:0.4rem">' + (r.Nama || '') + '</td>' +
        '<td style="padding:0.4rem;text-align:center">' + (r.Uom || '') + '</td>' +
        '<td style="padding:0.4rem;text-align:center">' + (r.Qty || 0) + '</td>' +
        '<td style="padding:0.4rem;text-align:right">' + fmt(r.Price) + '</td>' +
        '<td style="padding:0.4rem;text-align:right">' + fmt(r.Total) + '</td>' +
        '<td style="padding:0.4rem">' + (r.Keterangan || '') + '</td>' +
        '<td style="padding:0.4rem">' + (r.Loc || '') + '</td>' +
        '<td style="padding:0.4rem">' + (r.Status || '') + '</td>' +
        '<td style="padding:0.4rem;text-align:center">' + fotoHtml + '</td></tr>';
    }).join('');
  };

  window.baExportExcel = function () {
    var rows = window.baCollectReportRows() || [];
    if (!rows.length) { alert('Tidak ada data'); return; }
    var j = jenis();
    var cols = (j === 'semua' ? ['Jenis'] : []).concat(
      j === 'masuk'
        ? ['Tanggal', 'Nama', 'Uom', 'Qty', 'Price', 'Total', 'Keterangan', 'Loc', 'Status']
        : ['Tanggal', 'SKU', 'Nama', 'Uom', 'Qty', 'Price', 'Total', 'Keterangan', 'Loc', 'Status']
    );
    if (window.exportAsExcelTable) {
      window.exportAsExcelTable('laporan-ba-' + j + '.xls', cols, rows.map(function (r) {
        var o = {}; cols.forEach(function (c) { o[c] = r[c]; }); return o;
      }));
    }
  };

  window.baExportPdf = function () {
    var rows = window.baCollectReportRows() || [];
    if (!rows.length) { alert('Tidak ada data'); return; }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>'); }
    function fmtRp(n) { return (Number(n) || 0).toLocaleString('id-ID'); }
    var j = jenis();
    var title = j === 'masuk' ? 'Laporan Kas Masuk' : (j === 'keluar' ? 'Laporan Kas Keluar' : 'Laporan Berita Acara');
    var showSku = j !== 'masuk';
    var head = (j === 'semua' ? '<th>Jenis</th>' : '') + '<th>Tanggal</th>' + (showSku ? '<th>SKU</th>' : '') +
      '<th>Nama</th><th>Uom</th><th>Qty</th><th>Price</th><th>Total</th><th>Keterangan</th><th>Loc</th><th>Status</th><th>Foto</th>';
    var body = rows.map(function (r) {
      var foto = r.FotoUrl ? '<img src="' + esc(r.FotoUrl) + '" style="max-width:45px;max-height:45px"/>' : '-';
      return '<tr>' + (j === 'semua' ? '<td>' + esc(r.Jenis) + '</td>' : '') +
        '<td>' + esc(r.Tanggal) + '</td>' + (showSku ? '<td>' + esc(r.SKU) + '</td>' : '') +
        '<td>' + esc(r.Nama) + '</td><td>' + esc(r.Uom) + '</td><td>' + esc(r.Qty) + '</td>' +
        '<td>' + fmtRp(r.Price) + '</td><td>' + fmtRp(r.Total) + '</td>' +
        '<td>' + esc(r.Keterangan) + '</td><td>' + esc(r.Loc) + '</td><td>' + esc(r.Status) + '</td><td>' + foto + '</td></tr>';
    }).join('');
    var doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>' +
      '<style>body{font-family:Segoe UI,Arial;padding:20px;font-size:11px}h2{color:#0b4f37}' +
      'table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:5px}th{background:#0b4f37;color:#fff}</style></head><body>' +
      '<h2>' + title + ' — PATATAS GROUP</h2><p>' + new Date().toLocaleString('id-ID') + '</p>' +
      '<table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></body></html>';
    var w = window.open('', '_blank');
    if (!w) { alert('Izinkan pop-up untuk export PDF'); return; }
    w.document.write(doc); w.document.close(); w.focus();
    setTimeout(function () { w.print(); }, 600);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectTools);
  else injectTools();
  setTimeout(injectTools, 400);
})();
