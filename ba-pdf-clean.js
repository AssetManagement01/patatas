(function () {
  function jenis() {
    var el = document.getElementById('ba-rp-jenis');
    return el && el.value === 'masuk' ? 'masuk' : 'keluar';
  }
  function locFilter() {
    return ((document.getElementById('ba-rp-loc') || {}).value || '').trim();
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var p = String(iso).substring(0, 10).split('-');
    if (p.length < 3) return iso;
    var bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return Number(p[2]) + ' ' + (bulan[Number(p[1]) - 1] || p[1]) + ' ' + p[0];
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"'); }
  function num(v) { var n = Number(v); return isNaN(n) ? 0 : n; }
  function thumb(u) {
    u = String(u || '').trim();
    if (!u) return '';
    var m = u.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w200';
    return /^https?:|^data:image/i.test(u) ? u : '';
  }
  function rowsNow() {
    var list = jenis() === 'masuk' ? (window.__ba2LastList || []) : (window.__baRepList || window.__baLastList || []);
    var from = ((document.getElementById('ba-rp-from') || {}).value || '').substring(0, 10);
    var to = ((document.getElementById('ba-rp-to') || {}).value || '').substring(0, 10);
    var loc = locFilter().toLowerCase();
    list = (list || []).filter(function (t) {
      var d = String(t.date || t.Tanggal || '').substring(0, 10);
      if (from && d && d < from) return false;
      if (to && d && d > to) return false;
      var L = String(t.loc || t.Loc || '').toLowerCase();
      if (loc && L.indexOf(loc) < 0) return false;
      return true;
    });
    if (window.baFilterOutlet) { try { list = window.baFilterOutlet(list); } catch (e) {} }
    list.sort(function (a, b) { return String(b.date || b.Tanggal || '').localeCompare(String(a.date || a.Tanggal || '')); });
    return list.map(function (t) {
      var qty = num(t.qty != null ? t.qty : t.Qty);
      var price = num(t.price != null ? t.price : t.Price);
      var total = num(t.total != null ? t.total : t.Total) || qty * price;
      return {
        Tanggal: t.date || t.Tanggal || '', Nama: t.name || t.Nama || '', Uom: t.uom || t.Uom || '',
        Qty: qty, Price: price, Total: total, Keterangan: t.keterangan || t.Keterangan || '',
        Loc: t.loc || t.Loc || '', Status: t.status || t.Status || '', Foto: t.foto || t.Foto || ''
      };
    });
  }
  function paint() {
    var tb = document.getElementById('ba-rp-tbody-real') || document.getElementById('ba-rp-tbody');
    if (!tb || !document.getElementById('ba-rp-jenis')) return;
    var table = tb.closest('table');
    var head = table && table.querySelector('thead tr');
    var headHtml = '<th style="padding:0.4rem">Tanggal</th><th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th><th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th><th style="padding:0.4rem">Foto</th>';
    if (head) head.innerHTML = headHtml;
    var rows = rowsNow();
    var html = rows.length ? rows.map(function (r) {
      var f = thumb(r.Foto);
      var foto = f ? '<img src="' + esc(f) + '" style="width:42px;height:42px;object-fit:cover;border-radius:4px">' : '';
      return '<tr><td style="padding:0.4rem">' + esc(r.Tanggal) + '</td><td style="padding:0.4rem">' + esc(r.Nama) + '</td><td style="padding:0.4rem">' + esc(r.Uom) + '</td><td style="padding:0.4rem">' + esc(r.Qty) + '</td><td style="padding:0.4rem">' + esc(r.Price) + '</td><td style="padding:0.4rem">' + esc(r.Total) + '</td><td style="padding:0.4rem">' + esc(r.Keterangan) + '</td><td style="padding:0.4rem">' + esc(r.Loc) + '</td><td style="padding:0.4rem">' + esc(r.Status) + '</td><td style="padding:0.4rem">' + foto + '</td></tr>';
    }).join('') : '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Tidak ada data</td></tr>';
    if (tb.innerHTML !== html) tb.innerHTML = html;
  }
  function exportPdf() {
    var rows = rowsNow();
    if (!rows.length) { alert('Tidak ada data BA'); return; }
    function fmtRp(n) { n = Number(n) || 0; return n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function fotoCell(u) {
      var src = thumb(u);
      return src ? '<img src="' + esc(src) + '" style="max-width:90px;max-height:70px;object-fit:cover">' : '-';
    }
    var sum = 0;
    var body = rows.map(function (r) {
      var tot = Number(r.Total) || 0; sum += tot;
      return '<tr><td>' + esc(r.Tanggal) + '</td><td>' + esc(r.Nama) + '</td><td>' + esc(r.Uom) + '</td><td style="text-align:center">' + esc(r.Qty) + '</td><td style="text-align:right">' + fmtRp(r.Price) + '</td><td style="text-align:right">' + fmtRp(tot) + '</td><td>' + esc(r.Keterangan) + '</td><td>' + esc(r.Loc) + '</td><td>' + esc(r.Status) + '</td><td>' + fotoCell(r.Foto) + '</td></tr>';
    }).join('');
    var from = ((document.getElementById('ba-rp-from') || {}).value || '');
    var to = ((document.getElementById('ba-rp-to') || {}).value || '');
    var periode = (from || to) ? ('Periode: ' + (fmtDate(from) || '-') + ' \u2013 ' + (fmtDate(to) || '-')) : 'Periode: semua tanggal';
    var loc = locFilter();
    var title = jenis() === 'masuk' ? 'Laporan BA Kas Masuk' : 'Laporan BA Kas Keluar';
    var head = '<th>Tanggal</th><th>Nama</th><th>Uom</th><th>Qty</th><th>Price</th><th>Total</th><th>Keterangan</th><th>Loc</th><th>Status</th><th>Foto</th>';
    var doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title><style>body{font-family:Segoe UI,Arial,sans-serif;padding:16px;font-size:11px}h2{margin:0 0 6px;color:#0b4f37}table{border-collapse:collapse;width:100%}th,td{border:1px solid #94a3b8;padding:5px 6px;vertical-align:top}th{background:#0b4f37;color:#fff}.tot{margin-top:12px;font-size:14px;font-weight:700;text-align:right}</style></head><body><h2>' + title + ' \u2014 PATATAS GROUP</h2><div style="color:#64748b;margin-bottom:12px">' + esc(periode) + (loc ? ' | Lokasi: ' + esc(loc) : '') + '</div><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table><div class="tot">Total nominal: Rp ' + fmtRp(sum) + '</div><p style="margin-top:16px"><button onclick="window.print()" style="padding:8px 14px;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600">Cetak / Save as PDF</button></p></body></html>';
    var w = window.open('', '_blank');
    if (!w) { alert('Izinkan popup'); return; }
    w.document.write(doc); w.document.close();
  }
  function lock() {
    window.baExportPdf = exportPdf;
    window.baRenderReport = function () { paint(); };
    paint();
  }
  lock();
  setInterval(lock, 700);
})();
