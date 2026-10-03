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
  function stable() {
    if (document.getElementById('ba-still-css')) return;
    var s = document.createElement('style');
    s.id = 'ba-still-css';
    s.textContent = '#ba-rp-tbody img{width:42px;height:42px;object-fit:cover;display:block} #page-report table{table-layout:auto}';
    document.head.appendChild(s);
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;
    var table = tb.closest('table');
    var head = table && table.querySelector('thead tr');
    if (head && head.__set) return;
    if (head) {
      head.__set = 1;
      head.innerHTML = '<th style="padding:0.4rem">Tanggal</th><th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th><th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th><th style="padding:0.4rem">Foto</th>';
    }
  }
  function exportPdf() {
    var rows = window.baCollectReportRows ? window.baCollectReportRows() : [];
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
    var doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title><style>body{font-family:Segoe UI,Arial,sans-serif;padding:16px;font-size:11px}h2{margin:0 0 6px;color:#0b4f37}table{border-collapse:collapse;width:100%}th,td{border:1px solid #94a3b8;padding:5px 6px;vertical-align:middle}th{background:#0b4f37;color:#fff}.tot{margin-top:12px;font-size:14px;font-weight:700;text-align:right}</style></head><body><h2>' + title + ' \u2014 PATATAS GROUP</h2><div style="color:#64748b;margin-bottom:12px">' + esc(periode) + (loc ? ' | Lokasi: ' + esc(loc) : '') + '</div><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table><div class="tot">Total nominal: Rp ' + fmtRp(sum) + '</div><p style="margin-top:16px"><button onclick="window.print()" style="padding:8px 14px;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600">Cetak / Save as PDF</button></p></body></html>';
    var w = window.open('', '_blank');
    if (!w) { alert('Izinkan popup'); return; }
    w.document.write(doc); w.document.close();
  }
  function lock() {
    stable();
    window.baExportPdf = exportPdf;
  }
  lock();
  setTimeout(lock, 1500);
})();
