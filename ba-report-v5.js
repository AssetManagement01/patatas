(function () {
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function hint() {
    var t = ((document.body && document.body.innerText) || '');
    var m = t.match(/Hanya data:\s*([^\n]+)/i);
    if (m) return m[1].replace(/OUTLET:.*/i, '').trim().toLowerCase();
    m = t.match(/OUTLET:\s*([A-Z0-9 ]+)/i);
    return m ? m[1].trim().toLowerCase() : '';
  }
  function filt(list) {
    list = (list || []).slice();
    var t = ((document.body && document.body.innerText) || '');
    if (/Dapat melihat semua outlet|EDITOR|HO JKT/i.test(t) && !/OUTLET:\s*[A-Z]/i.test(t)) return list;
    var h = hint();
    if (!h) return list;
    var keys = /kh|hainan|central park/.test(h) ? ['hainan', 'central park'] : h.split(/[-,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 4; });
    return list.filter(function (r) {
      var L = String(r.loc || r.Loc || r.location || '').toLowerCase();
      for (var i = 0; i < keys.length; i++) if (L.indexOf(keys[i]) >= 0) return true;
      return false;
    });
  }
  function rows() {
    var list = filt(window.__baLastList || []);
    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    return list;
  }
  function thumb(u) {
    u = String(u || '');
    var m = u.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w400';
    return /^https?:/i.test(u) ? u : '';
  }
  function drawNow() {
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;
    var list = rows();
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
      return '<tr><td style="padding:0.4rem">'+(r.date||'')+'</td><td style="padding:0.4rem">'+(r.sku||'')+'</td><td style="padding:0.4rem">'+(r.name||'')+'</td><td style="padding:0.4rem">'+(r.uom||'')+'</td><td style="padding:0.4rem">'+(r.qty||0)+'</td><td style="padding:0.4rem">'+fmt(r.price)+'</td><td style="padding:0.4rem">'+fmt(tot)+'</td><td style="padding:0.4rem">'+(r.keterangan||'')+'</td><td style="padding:0.4rem">'+(r.loc||'')+'</td><td style="padding:0.4rem">'+(r.status||'')+'</td><td style="padding:0.4rem">'+foto+'</td></tr>';
    }).join('');
  }
  function collect() {
    return rows().map(function (t) {
      return {
        Tanggal: t.date || '', SKU: t.sku || '', Nama: t.name || '', Loc: t.loc || '',
        Qty: Number(t.qty) || 0, Uom: t.uom || '', Keterangan: t.keterangan || '',
        Price: Number(t.price) || 0, Total: Number(t.total) || 0, Foto: t.foto || '', Status: t.status || ''
      };
    });
  }
  function lock() {
    window.baCollectReportRows = collect;
    window.baRenderReport = drawNow;
    window.baFilterOutlet = window.baFilterOutlet || function (list) { return filt(list); };
  }
  lock();
  setInterval(function () { lock(); if (document.getElementById('ba-rp-tbody')) drawNow(); }, 700);
})();
