(function () {
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function thumb(u) {
    u = String(u || '');
    var m = u.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w400';
    return /^https?:/i.test(u) ? u : '';
  }
  function hint() {
    var t = ((document.body && document.body.innerText) || '');
    var m = t.match(/Hanya data:\s*([^\n]+)/i);
    if (m) return m[1].replace(/OUTLET:.*/i, '').trim().toLowerCase();
    m = t.match(/OUTLET:\s*([A-Z0-9 ]+)/i);
    return m ? m[1].trim().toLowerCase() : '';
  }
  function filt(list) {
    list = list || [];
    var t = ((document.body && document.body.innerText) || '');
    if (/Dapat melihat semua outlet|EDITOR|HO JKT/i.test(t) && !/OUTLET:\s*[A-Z]/i.test(t)) return list.slice();
    var h = hint();
    if (!h) return list.slice();
    var keys = /kh|hainan|central park/.test(h)
      ? ['hainan', 'central park']
      : h.split(/[-,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 4; });
    return list.filter(function (r) {
      var L = String(r.loc || r.location || '').toLowerCase();
      for (var i = 0; i < keys.length; i++) if (L.indexOf(keys[i]) >= 0) return true;
      return false;
    });
  }
  function injectJenis() {
    if (document.getElementById('ba-rp-jenis')) return true;
    var from = document.getElementById('ba-rp-from');
    var wrap = from && from.parentElement && from.parentElement.parentElement;
    if (!wrap) return false;
    var box = document.createElement('div');
    box.style.minWidth = '160px';
    box.innerHTML = '<label style="font-size:0.72rem;font-weight:600;color:#64748b">Jenis</label><select id="ba-rp-jenis" style="width:100%;padding:0.45rem;border:1px solid #cbd5e1;border-radius:8px"><option value="keluar">Kas Keluar</option><option value="masuk">Kas Masuk</option><option value="semua">Semua</option></select>';
    wrap.insertBefore(box, wrap.firstChild);
    document.getElementById('ba-rp-jenis').addEventListener('change', drawNow);
    return true;
  }
  function drawNow() {
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;
    injectJenis();
    var list = filt(window.__baLastList || []);
    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    var table = tb.closest('table');
    if (table) {
      var head = table.querySelector('thead tr');
      if (head) head.innerHTML = '<th style="padding:0.4rem">Tanggal</th><th style="padding:0.4rem">SKU</th><th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th><th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th><th style="padding:0.4rem">Foto</th>';
    }
    if (!list.length) {
      tb.innerHTML = '<tr><td colspan="11" style="padding:1rem;text-align:center;color:#94a3b8">Tidak ada data</td></tr>';
      return;
    }
    tb.setAttribute('data-ok', '1');
    tb.innerHTML = list.map(function (r) {
      var f = thumb(r.foto);
      var foto = f ? '<img src="' + f + '" style="width:40px;height:40px;object-fit:cover;border-radius:4px"/>' : '-';
      var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
      return '<tr><td style="padding:0.4rem">' + (r.date || '') + '</td><td style="padding:0.4rem">' + (r.sku || '') + '</td><td style="padding:0.4rem">' + (r.name || '') + '</td><td style="padding:0.4rem">' + (r.uom || '') + '</td><td style="padding:0.4rem">' + (r.qty || 0) + '</td><td style="padding:0.4rem">' + fmt(r.price) + '</td><td style="padding:0.4rem">' + fmt(tot) + '</td><td style="padding:0.4rem">' + (r.keterangan || '') + '</td><td style="padding:0.4rem">' + (r.loc || '') + '</td><td style="padding:0.4rem">' + (r.status || '') + '</td><td style="padding:0.4rem">' + foto + '</td></tr>';
    }).join('');
  }
  window.baRenderReport = drawNow;
  setInterval(function () {
    window.baRenderReport = drawNow;
    if (document.getElementById('ba-rp-tbody')) drawNow();
  }, 1000);
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('a,button');
    if (el && /report|filter/i.test(el.textContent || '')) setTimeout(drawNow, 300);
  }, true);
})();
