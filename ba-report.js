(function () {
  if (window.__baReportReady) {
    // Jika sudah pernah jalan, langsung render ulang saja
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
      var td = normDate(t.date || t.Tanggal || '');
      if (from && td && td < from) return false;
      if (to && td && td > to) return false;
      return true;
    }).sort(function (a, b) {
      return String(a.date || '').localeCompare(String(b.date || ''));
    });
  }
  function mapRow(t, kind) {
    return {
      Jenis: kind === 'masuk' ? 'Kas Masuk' : 'Kas Keluar',
      Tanggal: t.date || t.Tanggal || '',
      SKU: kind === 'masuk' ? '' : (t.sku || t.SKU || ''),
      Nama: t.name || t.nama || t.Nama || '',
      Loc: t.loc || t.Loc || '',
      Qty: Number(t.qty || t.Qty) || 0,
      Uom: t.uom || t.Uom || t.UOM || '',
      Price: Number(t.price || t.Price) || 0,
      Total: Number(t.total || t.Total) || ((Number(t.price) || 0) * (Number(t.qty) || 0)),
      Keterangan: t.keterangan || t.Keterangan || '',
      Status: t.status || '',
      Foto: t.foto || t.Foto || t.photo || t.url || t.Url || ''
    };
  }
  function colsFor(j) {
    var cols = j === 'semua' ? ['Jenis'] : [];
    cols.push('Tanggal');
    if (j !== 'masuk') cols.push('SKU');
    cols.push('Nama', 'Loc', 'Qty', 'Uom', 'Price', 'Total', 'Keterangan', 'Status', 'Foto');
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
          '<th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Loc</th>' +
          '<th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Uom</th>' +
          '<th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th>' +
          '<th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Status</th>' +
          '<th style="padding:0.4rem">Foto</th>';
      }
    }
    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="12" style="padding:1rem;text-align:center;color:#94a3b8">Tidak ada data</td></tr>';
      return;
    }
    function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }

    // RENDER BARIS TABEL DENGAN GAMBAR
    tb.innerHTML = rows.map(function (r) {
      var fotoHtml = '-';
      if (r.Foto && String(r.Foto).startsWith('http')) {
        fotoHtml = '<a href="' + r.Foto + '" target="_blank"><img src="' + r.Foto + '" style="width:45px;height:45px;object-fit:cover;border-radius:6px;border:1px solid #cbd5e1;" /></a>';
      } else if (r.Foto) {
        fotoHtml = '<span style="font-size:0.75rem;color:#64748b">' + r.Foto + '</span>';
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

  // Eksekusi paksa render pertama kali
  injectTools();
  window.baRenderReport();
})();
