(function () {
  if (window.__baPdfFix) return;
  window.__baPdfFix = true;
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function num(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return 0;
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/\s/g, '').replace(',', '.');
    var n = Number(s);
    return isNaN(n) ? 0 : n;
  }
  function jenis() {
    var el = document.getElementById('ba-rp-jenis');
    return el && el.value === 'masuk' ? 'masuk' : 'keluar';
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var p = String(iso).substring(0, 10).split('-');
    if (p.length < 3) return iso;
    var bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return Number(p[2]) + ' ' + (bulan[Number(p[1]) - 1] || p[1]) + ' ' + p[0];
  }
  function inRange(list) {
    var from = ((document.getElementById('ba-rp-from') || {}).value || '').substring(0, 10);
    var to = ((document.getElementById('ba-rp-to') || {}).value || '').substring(0, 10);
    return (list || []).filter(function (t) {
      var d = String(t.date || t.Tanggal || '').substring(0, 10);
      if (from && d && d < from) return false;
      if (to && d && d > to) return false;
      return true;
    });
  }
  function outletOk(list) {
    if (window.baFilterOutlet) return window.baFilterOutlet(list);
    return list;
  }
  function loadBa2() {
    window.__ba2Rep = function (resp) {
      var cols = (resp.table && resp.table.cols) || [];
      var rows = (resp.table && resp.table.rows) || [];
      var h = cols.map(function (c) { return String(c.label || '').toLowerCase().trim(); });
      function ix(n) { return h.indexOf(n); }
      var out = [];
      rows.forEach(function (row) {
        var c = row.c || [];
        var date = cell(c[ix('tanggal')]), name = cell(c[ix('nama')]);
        if (!date && !name) return;
        var qty = num(cell(c[ix('qty')]));
        var price = num(cell(c[ix('price')]));
        var total = num(cell(c[ix('total')])) || (qty * price);
        out.push({
          date: date, name: name, sku: '', uom: cell(c[ix('uom')]), qty: qty, price: price, total: total,
          keterangan: cell(c[ix('keterangan')]), foto: cell(c[ix('foto')]), loc: cell(c[ix('loc')]),
          status: cell(c[ix('status')]) || 'Done'
        });
      });
      window.__ba2LastList = out;
      if (jenis() === 'masuk') draw();
    };
    var s = document.createElement('script');
    s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=BA2&tqx=out:json;responseHandler:__ba2Rep&_=' + Date.now();
    document.body.appendChild(s);
  }
  function source() {
    var list = jenis() === 'masuk' ? (window.__ba2LastList || []) : (window.__baLastList || []);
    list = outletOk(list.slice());
    list = inRange(list);
    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    return list;
  }
  function mapRows() {
    return source().map(function (t) {
      return {
        Tanggal: t.date || '', SKU: t.sku || '', Nama: t.name || '', Loc: t.loc || '',
        Qty: Number(t.qty) || 0, Uom: t.uom || '', Keterangan: t.keterangan || '',
        Price: Number(t.price) || 0, Total: Number(t.total) || ((Number(t.price) || 0) * (Number(t.qty) || 0)),
        Foto: t.foto || '', Status: t.status || ''
      };
    });
  }
  function draw() {
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;
    var list = source();
    var table = tb.closest('table');
    var masuk = jenis() === 'masuk';
    if (table) {
      var head = table.querySelector('thead tr');
      if (head) head.innerHTML = masuk
        ? '<th style="padding:0.4rem">Tanggal</th><th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th><th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th><th style="padding:0.4rem">Foto</th>'
        : '<th style="padding:0.4rem">Tanggal</th><th style="padding:0.4rem">SKU</th><th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th><th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th><th style="padding:0.4rem">Foto</th>';
    }
    if (!list.length) {
      tb.innerHTML = '<tr><td colspan="11" style="padding:1rem;text-align:center;color:#94a3b8">Tidak ada data</td></tr>';
      return;
    }
    tb.innerHTML = list.map(function (r) {
      var foto = r.foto ? '<img src="' + String(r.foto).replace(/"/g, '') + '" style="width:42px;height:42px;object-fit:cover;border-radius:4px">' : '';
      var sku = masuk ? '' : '<td style="padding:0.4rem">' + (r.sku || '') + '</td>';
      return '<tr><td style="padding:0.4rem">' + (r.date || '') + '</td>' + sku +
        '<td style="padding:0.4rem">' + (r.name || '') + '</td><td style="padding:0.4rem">' + (r.uom || '') + '</td>' +
        '<td style="padding:0.4rem">' + (r.qty || 0) + '</td><td style="padding:0.4rem">' + (r.price || 0) + '</td>' +
        '<td style="padding:0.4rem">' + (r.total || 0) + '</td><td style="padding:0.4rem">' + (r.keterangan || '') + '</td>' +
        '<td style="padding:0.4rem">' + (r.loc || '') + '</td><td style="padding:0.4rem">' + (r.status || '') + '</td>' +
        '<td style="padding:0.4rem">' + foto + '</td></tr>';
    }).join('');
  }
  function tools() {
    var box = document.getElementById('ba-rp-from');
    if (!box) return;
    var wrap = box.parentNode && box.parentNode.parentNode;
    if (!wrap || document.getElementById('ba-rp-jenis')) return;
    var d = document.createElement('div');
    d.style.minWidth = '150px';
    d.innerHTML = '<label style="font-size:0.72rem;font-weight:600;color:#64748b">Jenis</label>' +
      '<select id="ba-rp-jenis" style="width:100%;padding:0.45rem;border:1px solid var(--border);border-radius:8px"><option value="keluar">Kas Keluar</option><option value="masuk">Kas Masuk</option></select>';
    wrap.insertBefore(d, box.parentNode);
    d.querySelector('select').onchange = function () {
      if (this.value === 'masuk') loadBa2();
      draw();
    };
  }
  function exportPdf() {
    var rows = mapRows();
    if (!rows.length) { alert('Tidak ada data BA'); return; }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>'); }
    function fmtRp(n) { n = Number(n) || 0; return n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function fotoCell(u) {
      u = String(u || '').trim();
      if (!u) return '-';
      var m = u.match(/\/file\/d\/([^/]+)/) || u.match(/[?&]id=([^&]+)/);
      var src = m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w240' : u;
      if (src.indexOf('http') === 0 || src.indexOf('data:image') === 0) return '<img src="' + esc(src) + '" style="max-width:90px;max-height:70px;object-fit:cover">';
      return '-';
    }
    var masuk = jenis() === 'masuk';
    var sum = 0;
    var body = rows.map(function (r) {
      var tot = Number(r.Total) || 0;
      sum += tot;
      return '<tr><td>' + esc(r.Tanggal) + '</td>' + (masuk ? '' : '<td>' + esc(r.SKU) + '</td>') +
        '<td>' + esc(r.Nama) + '</td><td>' + esc(r.Uom) + '</td><td style="text-align:center">' + esc(r.Qty) + '</td>' +
        '<td style="text-align:right">' + fmtRp(r.Price) + '</td><td style="text-align:right">' + fmtRp(tot) + '</td>' +
        '<td>' + esc(r.Keterangan) + '</td><td>' + esc(r.Loc) + '</td><td>' + esc(r.Status) + '</td><td>' + fotoCell(r.Foto) + '</td></tr>';
    }).join('');
    var from = ((document.getElementById('ba-rp-from') || {}).value || '');
    var to = ((document.getElementById('ba-rp-to') || {}).value || '');
    var periode = (from || to) ? ('Periode: ' + (fmtDate(from) || '-') + ' – ' + (fmtDate(to) || '-')) : 'Periode: semua tanggal';
    var title = masuk ? 'Laporan BA Kas Masuk' : 'Laporan BA Kas Keluar';
    var head = masuk
      ? '<th>Tanggal</th><th>Nama</th><th>Uom</th><th>Qty</th><th>Price</th><th>Total</th><th>Keterangan</th><th>Loc</th><th>Status</th><th>Foto</th>'
      : '<th>Tanggal</th><th>SKU</th><th>Nama</th><th>Uom</th><th>Qty</th><th>Price</th><th>Total</th><th>Keterangan</th><th>Loc</th><th>Status</th><th>Foto</th>';
    var doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title><style>body{font-family:Segoe UI,Arial,sans-serif;padding:20px;font-size:12px}h2{margin:0 0 6px;color:#0b4f37}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #94a3b8;padding:6px 8px;vertical-align:middle}th{background:#0b4f37;color:#fff}.tot{margin-top:12px;font-size:14px;font-weight:700;text-align:right}</style></head><body>' +
      '<h2>' + title + ' — PATATAS GROUP</h2><div style="color:#64748b;margin-bottom:12px">' + esc(periode) + '</div>' +
      '<table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>' +
      '<div class="tot">Total nominal: Rp ' + fmtRp(sum) + '</div>' +
      '<p style="margin-top:16px"><button onclick="window.print()" style="padding:8px 14px;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600">Cetak / Save as PDF</button></p></body></html>';
    var w = window.open('', '_blank');
    if (!w) { alert('Izinkan popup'); return; }
    w.document.write(doc);
    w.document.close();
  }
  function lock() {
    tools();
    window.baCollectReportRows = mapRows;
    window.baRenderReport = function () { if (jenis() === 'masuk') loadBa2(); draw(); };
    window.baExportPdf = exportPdf;
  }
  lock();
  setInterval(lock, 800);
  setTimeout(loadBa2, 1500);
})();
