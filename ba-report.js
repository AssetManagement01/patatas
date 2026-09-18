(function () {
  if (window.__baReportReady) {
    if (window.baRenderReport) window.baRenderReport();
    return;
  }
  window.__baReportReady = true;

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
      var td = normDate(t.date || t.Tanggal || t.tanggal || (Array.isArray(t) ? t[0] : '') || '');
      if (from && td && td < from) return false;
      if (to && td && td > to) return false;
      return true;
    });
  }

  function parseFotoUrl(val) {
    val = String(val || '').trim();
    if (!val || val.toLowerCase() === 'ada' || val === '-') return '';
    var driveMatch = val.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w400';
    }
    if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/')) {
      return val;
    }
    return '';
  }

  function mapRow(t, kind) {
    var res = {
      Jenis: kind === 'masuk' ? 'Kas Masuk' : 'Kas Keluar',
      Tanggal: '', SKU: '', Nama: '', Uom: '', Qty: 0, Price: 0, Total: 0, Keterangan: '', FotoUrl: '', FotoRaw: '', Loc: '', Status: ''
    };

    if (t && typeof t === 'object' && !Array.isArray(t)) {
      // Jika data berupa Objek Key-Value dari API/JSON
      res.Tanggal = t.tanggal || t.Tanggal || t.date || '';
      res.SKU = t.sku || t.SKU || '';
      res.Nama = t.nama || t.Nama || t.name || t.namaBarang || '';
      res.Loc = t.loc || t.Loc || t.lokasi || '';
      res.Qty = Number(t.qty || t.Qty) || 0;
      res.Uom = t.uom || t.Uom || t.UOM || '';
      res.Price = Number(t.price || t.Price) || 0;
      res.Total = Number(t.total || t.Total) || (res.Price * res.Qty);
      res.Keterangan = t.keterangan || t.Keterangan || '';
      res.Status = t.status || t.Status || '';
      res.FotoRaw = t.foto || t.Foto || t.image || t.photo || '';
    } else if (Array.isArray(t)) {
      // Jika data berupa Array murni dari baris Spreadsheet. 
      // Sesuaikan urutan indeks [0, 1, 2, ...] berdasarkan urutan kolom di Google Sheets Anda.
      if (kind === 'masuk') {
        // Urutan Kas Masuk di Spreadsheet (berdasarkan gambar screenshot Anda):
        // 0: Tanggal, 1: Nama, 2: Loc, 3: Qty, 4: Uom, 5: Price, 6: Total, 7: Keterangan, 8: Link/Foto, 9: Status
        res.Tanggal = t[0] || '';
        res.Nama = t[1] || '';
        res.Loc = t[2] || '';
        res.Qty = Number(t[3]) || 0;
        res.Uom = t[4] || '';
        res.Price = Number(t[5]) || 0;
        res.Total = Number(t[6]) || (res.Price * res.Qty);
        res.Keterangan = t[7] || '';
        res.FotoRaw = t[8] || '';
        res.Status = t[9] || '';
      } else {
        // Urutan Kas Keluar di Spreadsheet:
        res.Tanggal = t[0] || '';
        res.SKU = t[1] || '';
        res.Nama = t[2] || '';
        res.Loc = t[3] || '';
        res.Qty = Number(t[4]) || 0;
        res.Uom = t[5] || '';
        res.Price = Number(t[6]) || 0;
        res.Total = Number(t[7]) || (res.Price * res.Qty);
        res.Keterangan = t[8] || '';
        res.Status = t[9] || '';
        res.FotoRaw = t[10] || '';
      }
    }

    if (!res.Total && res.Price && res.Qty) {
      res.Total = res.Price * res.Qty;
    }

    res.FotoUrl = parseFotoUrl(res.FotoRaw || res.Keterangan);
    return res;
  }

  function colsFor(j) {
    var cols = j === 'semua' ? ['Jenis'] : [];
    cols.push('Tanggal');
    if (j !== 'masuk') cols.push('SKU');
    cols.push('Nama', 'Loc', 'Qty', 'Uom', 'Price', 'Total', 'Keterangan', 'Status', 'FotoUrl');
    return cols;
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
    if (url) {
      try {
        if (jenis() !== 'masuk') {
          var r1 = await fetch(url + '?action=listBA&_=' + Date.now());
          var d1 = await r1.json();
          if (d1 && d1.ok && Array.isArray(d1.items)) {
            localStorage.setItem('patatas_ba_v1', JSON.stringify(d1.items));
          }
        }
        if (jenis() !== 'keluar') {
          var r2 = await fetch(url + '?action=listBA2&_=' + Date.now());
          var d2 = await r2.json();
          if (d2 && d2.ok && Array.isArray(d2.items)) {
            localStorage.setItem('patatas_ba2_v1', JSON.stringify(d2.items));
          }
        }
      } catch (e) {}
    }
    var rows = window.baCollectReportRows();
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;

    var table = tb.closest('table');
    var showSku = jenis() !== 'masuk';
    if (table) {
      var head = table.querySelector('thead tr');
      if (head) {
        head.innerHTML =
          (jenis() === 'semua' ? '<th style="padding:0.4rem">Jenis</th>' : '') +
          '<th style="padding:0.4rem">Tanggal</th>' +
          (showSku ? '<th style="padding:0.4rem">SKU</th>' : '') +
          '<th style="padding:0.4rem">Nama</th>' +
          '<th style="padding:0.4rem">Loc</th>' +
          '<th style="padding:0.4rem">Qty</th>' +
          '<th style="padding:0.4rem">Uom</th>' +
          '<th style="padding:0.4rem">Price</th>' +
          '<th style="padding:0.4rem">Total</th>' +
          '<th style="padding:0.4rem">Keterangan</th>' +
          '<th style="padding:0.4rem">Status</th>' +
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
        fotoHtml = '<a href="' + r.FotoUrl + '" target="_blank" title="Klik untuk memperbesar"><img src="' + r.FotoUrl + '" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #cbd5e1;" /></a>';
      } else if (r.FotoRaw) {
        fotoHtml = '<span style="font-size:0.75rem;color:#64748b">' + r.FotoRaw + '</span>';
      }

      return '<tr style="border-bottom:1px solid #f1f5f9">' +
        (jenis() === 'semua' ? '<td style="padding:0.4rem">' + r.Jenis + '</td>' : '') +
        '<td style="padding:0.4rem">' + (r.Tanggal || '') + '</td>' +
        (showSku ? '<td style="padding:0.4rem;font-family:monospace;font-size:0.72rem">' + (r.SKU || '') + '</td>' : '') +
        '<td style="padding:0.4rem">' + (r.Nama || '') + '</td>' +
        '<td style="padding:0.4rem">' + (r.Loc || '') + '</td>' +
        '<td style="padding:0.4rem;text-align:center">' + (r.Qty || 0) + '</td>' +
        '<td style="padding:0.4rem;text-align:center">' + (r.Uom || '') + '</td>' +
        '<td style="padding:0.4rem;text-align:right">' + fmt(r.Price) + '</td>' +
        '<td style="padding:0.4rem;text-align:right">' + fmt(r.Total) + '</td>' +
        '<td style="padding:0.4rem">' + (r.Keterangan || '') + '</td>' +
        '<td style="padding:0.4rem">' + (r.Status || '') + '</td>' +
        '<td style="padding:0.4rem;text-align:center">' + fotoHtml + '</td></tr>';
    }).join('');
  };

  // EXPORT EXCEL
  var prevExcel = window.baExportExcel;
  window.baExportExcel = function () {
    var rows = window.baCollectReportRows() || [];
    if (!rows.length) { alert('Tidak ada data'); return; }
    var j = jenis();
    var cols = colsFor(j);
    var name = 'laporan-ba-' + j + '.xls';
    if (window.exportAsExcelTable) {
      window.exportAsExcelTable(name, cols, rows.map(function (r) {
        var o = {};
        cols.forEach(function (c) { 
          if (c === 'FotoUrl') o['Foto'] = r.FotoUrl || r.FotoRaw || '-';
          else o[c] = r[c]; 
        });
        return o;
      }));
    } else if (prevExcel) prevExcel();
  };

  // EXPORT PDF
  var prevPdf = window.baExportPdf;
  window.baExportPdf = function () {
    var rows = window.baCollectReportRows() || [];
    if (!rows.length) { alert('Tidak ada data'); return; }

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function fmtRp(n) { n = Number(n) || 0; return n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

    var j = jenis();
    var showSku = j !== 'masuk';
    var title = (j === 'masuk' ? 'Laporan Kas Masuk' : (j === 'keluar' ? 'Laporan Kas Keluar' : 'Laporan Berita Acara')) + ' — PATATAS GROUP';
    var head = (j === 'semua' ? '<th>Jenis</th>' : '') + '<th>Tanggal</th>' + (showSku ? '<th>SKU</th>' : '') +
      '<th>Nama</th><th>Loc</th><th>Qty</th><th>Uom</th><th>Price</th><th>Total</th><th>Keterangan</th><th>Status</th><th>Foto</th>';

    var body = rows.map(function (r) {
      var fotoCell = '-';
      if (r.FotoUrl) {
        fotoCell = '<img src="' + esc(r.FotoUrl) + '" style="max-width:45px;max-height:45px;border-radius:4px;display:block;margin:auto;" />';
      } else if (r.FotoRaw) {
        fotoCell = esc(r.FotoRaw);
      }

      return '<tr>' + (j === 'semua' ? '<td>' + esc(r.Jenis) + '</td>' : '') +
        '<td>' + esc(r.Tanggal) + '</td>' + (showSku ? '<td>' + esc(r.SKU) + '</td>' : '') +
        '<td>' + esc(r.Nama) + '</td><td>' + esc(r.Loc) + '</td>' +
        '<td style="text-align:center">' + esc(r.Qty) + '</td><td style="text-align:center">' + esc(r.Uom) + '</td>' +
        '<td style="text-align:right">' + fmtRp(r.Price) + '</td><td style="text-align:right">' + fmtRp(r.Total) + '</td>' +
        '<td>' + esc(r.Keterangan) + '</td><td>' + esc(r.Status) + '</td>' +
        '<td style="text-align:center;vertical-align:middle">' + fotoCell + '</td></tr>';
    }).join('');

    var doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>' +
      '<style>body{font-family:Segoe UI,Arial,sans-serif;padding:20px;font-size:11px}h2{margin:0 0 8px;color:#0b4f37}' +
      'table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:5px;text-align:left;vertical-align:middle}' +
      'th{background:#0b4f37;color:#fff}img{object-fit:cover}</style></head><body>' +
      '<h2>' + title + '</h2><p style="color:#64748b;margin-bottom:12px;">Diekspor ' + new Date().toLocaleString('id-ID') + '</p>' +
      '<table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></body></html>';

    var w = window.open('', '_blank');
    if (!w) { if (prevPdf) return prevPdf(); alert('Izinkan pop-up untuk export PDF'); return; }
    w.document.write(doc);
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 800);
  };

  injectTools();
  window.baRenderReport();
})();
