(function () {
  var BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function jenis() {
    var el = document.getElementById('ba-rp-jenis');
    return el && el.value === 'masuk' ? 'masuk' : 'keluar';
  }
  function locFilter() { return ((document.getElementById('ba-rp-loc') || {}).value || '').trim(); }
  function statusFilter() { return ((document.getElementById('ba-rp-status') || {}).value || '').trim(); }
  function dmy(v) {
    var s = String(v || '').trim();
    var m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + '/' + m[2] + '/' + m[1].slice(-2);
    var n = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (n) return ('0' + n[1]).slice(-2) + '/' + ('0' + n[2]).slice(-2) + '/' + n[3].slice(-2);
    return s;
  }
  function monthOf(v) {
    var s = String(v || '');
    var m = s.match(/(\d{4})-(\d{2})/);
    if (m) return { k: m[1] + '-' + m[2], n: BULAN[Number(m[2]) - 1] + ' ' + m[1] };
    var n = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (n) {
      var y = n[3].length === 2 ? '20' + n[3] : n[3];
      var mo = ('0' + n[2]).slice(-2);
      return { k: y + '-' + mo, n: BULAN[Number(mo) - 1] + ' ' + y };
    }
    return { k: '0000-00', n: '-' };
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
  function rawList() {
    return jenis() === 'masuk' ? (window.__ba2LastList || []) : (window.__baRepList || window.__baLastList || []);
  }
  function rowsNow() {
    var from = ((document.getElementById('ba-rp-from') || {}).value || '').substring(0, 10);
    var to = ((document.getElementById('ba-rp-to') || {}).value || '').substring(0, 10);
    var loc = locFilter().toLowerCase();
    var st = statusFilter().toLowerCase();
    var list = (rawList() || []).filter(function (t) {
      var d = String(t.date || t.Tanggal || '').substring(0, 10);
      if (from && d && d < from) return false;
      if (to && d && d > to) return false;
      var L = String(t.loc || t.Loc || '');
      if (loc && L.toLowerCase() !== loc) return false;
      var S = String(t.status || t.Status || '').toLowerCase();
      if (st && S !== st) return false;
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
  function fillSelect(id, label, values) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var cur = sel.value;
    sel.innerHTML = '<option value="">' + label + '</option>';
    values.sort().forEach(function (s) { var o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
    if (cur) sel.value = cur;
  }
  function tools() {
    var jenisEl = document.getElementById('ba-rp-jenis');
    if (!jenisEl) return;
    var wrap = jenisEl.parentNode && jenisEl.parentNode.parentNode;
    if (!wrap) return;
    if (!document.getElementById('ba-rp-loc')) {
      var d = document.createElement('div');
      d.style.minWidth = '180px';
      d.innerHTML = '<label style="font-size:0.72rem;font-weight:600;color:#64748b">Lokasi</label><select id="ba-rp-loc" style="width:100%;padding:0.45rem;border:1px solid var(--border);border-radius:8px"><option value="">Semua lokasi</option></select>';
      wrap.insertBefore(d, jenisEl.parentNode.nextSibling);
      d.querySelector('select').onchange = paint;
    }
    if (!document.getElementById('ba-rp-status')) {
      var s = document.createElement('div');
      s.style.minWidth = '150px';
      s.innerHTML = '<label style="font-size:0.72rem;font-weight:600;color:#64748b">Status</label><select id="ba-rp-status" style="width:100%;padding:0.45rem;border:1px solid var(--border);border-radius:8px"><option value="">Semua status</option></select>';
      wrap.insertBefore(s, document.getElementById('ba-rp-loc').parentNode.nextSibling);
      s.querySelector('select').onchange = paint;
    }
    var locs = {}, stats = {};
    (rawList() || []).forEach(function (t) {
      var L = String(t.loc || t.Loc || '').trim(); if (L) locs[L] = 1;
      var S = String(t.status || t.Status || '').trim(); if (S) stats[S] = 1;
    });
    fillSelect('ba-rp-loc', 'Semua lokasi', Object.keys(locs));
    fillSelect('ba-rp-status', 'Semua status', Object.keys(stats));
  }
  function exportPdf() {
    var rows = rowsNow();
    if (!rows.length) { alert('Tidak ada data BA'); return; }
    function fmtRp(n) { n = Number(n) || 0; return n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function fotoCell(u) { var src = thumb(u); return src ? '<img src="' + esc(src) + '" style="width:54px;height:40px;object-fit:cover;border-radius:3px">' : '-'; }
    var sum = 0, byLoc = {}, byMonth = {};
    var body = rows.map(function (r, i) {
      var tot = Number(r.Total) || 0; sum += tot;
      var mo = monthOf(r.Tanggal);
      var lk = (r.Loc || '-') + '|' + mo.k;
      if (!byLoc[lk]) byLoc[lk] = { loc: r.Loc || '-', month: mo.n, k: mo.k, total: 0 };
      byLoc[lk].total += tot;
      if (!byMonth[mo.k]) byMonth[mo.k] = { n: mo.n, total: 0 };
      byMonth[mo.k].total += tot;
      return '<tr' + (i % 2 ? ' style="background:#f8fafc"' : '') + '><td class="dt">' + esc(dmy(r.Tanggal)) + '</td><td>' + esc(r.Nama) + '</td><td class="c">' + esc(r.Uom) + '</td><td class="c">' + esc(r.Qty) + '</td><td class="r">' + fmtRp(r.Price) + '</td><td class="r">' + fmtRp(tot) + '</td><td>' + esc(r.Keterangan) + '</td><td>' + esc(r.Loc) + '</td><td class="c">' + esc(r.Status) + '</td><td class="c">' + fotoCell(r.Foto) + '</td></tr>';
    }).join('');
    var locRows = Object.keys(byLoc).sort().map(function (k, i) {
      var x = byLoc[k];
      return '<tr><td class="c">' + (i + 1) + '</td><td>' + esc(x.loc) + '</td><td>' + esc(x.month) + '</td><td class="r">Rp ' + fmtRp(x.total) + '</td></tr>';
    }).join('');
    var monthRows = Object.keys(byMonth).sort().map(function (k, i) {
      return '<tr><td class="c">' + (i + 1) + '</td><td>' + esc(byMonth[k].n) + '</td><td class="r">Rp ' + fmtRp(byMonth[k].total) + '</td></tr>';
    }).join('');
    var from = ((document.getElementById('ba-rp-from') || {}).value || '');
    var to = ((document.getElementById('ba-rp-to') || {}).value || '');
    var periode = (from || to) ? ('Periode: ' + dmy(from) + ' \u2013 ' + dmy(to)) : 'Periode: semua tanggal';
    var extra = (locFilter() ? ' | Lokasi: ' + locFilter() : '') + (statusFilter() ? ' | Status: ' + statusFilter() : '');
    var title = jenis() === 'masuk' ? 'Laporan BA Kas Masuk' : 'Laporan BA Kas Keluar';
    var css = '@page{size:A4 portrait;margin:8mm}body{font-family:Segoe UI,Arial,sans-serif;padding:6px;font-size:9px;color:#0f172a}h2{margin:0 0 4px;color:#0b4f37;font-size:14px}h3{margin:12px 0 6px;color:#0b4f37;font-size:12px}.sub{color:#475569;margin-bottom:8px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #334155;padding:3px 4px;vertical-align:middle}th{background:#0b4f37;color:#fff;font-size:9px}td{font-size:9px}.dt{white-space:nowrap}.c{text-align:center}.r{text-align:right;white-space:nowrap}.sum{width:100%;margin:0 0 8px}.sum tfoot td{background:#e8f5ef;font-weight:700}';
    var sumTable = '<h3>Total per bulan</h3><table class="sum"><thead><tr><th>No</th><th>Bulan</th><th>Total</th></tr></thead><tbody>' + monthRows + '</tbody><tfoot><tr><td colspan="2" class="r">Total nominal</td><td class="r">Rp ' + fmtRp(sum) + '</td></tr></tfoot></table><h3>Total per lokasi</h3><table class="sum"><thead><tr><th>No</th><th>Lokasi</th><th>Bulan</th><th>Total</th></tr></thead><tbody>' + locRows + '</tbody><tfoot><tr><td colspan="3" class="r">Total nominal</td><td class="r">Rp ' + fmtRp(sum) + '</td></tr></tfoot></table>';
    var doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title><style>' + css + '</style></head><body><h2>' + title + ' \u2014 PATATAS GROUP</h2><div class="sub">' + esc(periode + extra) + '</div><table><thead><tr><th>Tanggal</th><th>Nama</th><th>Uom</th><th>Qty</th><th>Price</th><th>Total</th><th>Keterangan</th><th>Loc</th><th>Status</th><th>Foto</th></tr></thead><tbody>' + body + '</tbody></table>' + sumTable + '<p class="no-print" style="margin-top:14px"><button onclick="window.print()" style="padding:8px 14px;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600">Cetak / Save as PDF</button></p></body></html>';
    var w = window.open('', '_blank');
    if (!w) { alert('Izinkan popup'); return; }
    w.document.write(doc); w.document.close();
  }
  try {
    Object.defineProperty(window, 'baExportPdf', { configurable: true, get: function () { return exportPdf; }, set: function () {} });
  } catch (e) { window.baExportPdf = exportPdf; }
  function paint() {
    tools();
    var tb = document.getElementById('ba-rp-tbody-real') || document.getElementById('ba-rp-tbody');
    if (!tb || !document.getElementById('ba-rp-jenis')) return;
    var head = tb.closest('table') && tb.closest('table').querySelector('thead tr');
    if (head) head.innerHTML = '<th style="padding:0.4rem">Tanggal</th><th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th><th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th><th style="padding:0.4rem">Foto</th>';
    var rows = rowsNow();
    var html = rows.length ? rows.map(function (r) {
      var f = thumb(r.Foto);
      var foto = f ? '<img src="' + esc(f) + '" style="width:42px;height:42px;object-fit:cover;border-radius:4px">' : '';
      return '<tr><td style="padding:0.4rem;white-space:nowrap">' + esc(dmy(r.Tanggal)) + '</td><td style="padding:0.4rem">' + esc(r.Nama) + '</td><td style="padding:0.4rem">' + esc(r.Uom) + '</td><td style="padding:0.4rem">' + esc(r.Qty) + '</td><td style="padding:0.4rem">' + esc(r.Price) + '</td><td style="padding:0.4rem">' + esc(r.Total) + '</td><td style="padding:0.4rem">' + esc(r.Keterangan) + '</td><td style="padding:0.4rem">' + esc(r.Loc) + '</td><td style="padding:0.4rem">' + esc(r.Status) + '</td><td style="padding:0.4rem">' + foto + '</td></tr>';
    }).join('') : '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Tidak ada data</td></tr>';
    if (tb.innerHTML !== html) tb.innerHTML = html;
  }
  function lock() { window.baRenderReport = paint; paint(); }
  lock();
  setInterval(lock, 800);
})();
