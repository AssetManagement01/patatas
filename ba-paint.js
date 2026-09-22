(function () {
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function scopeName() {
    var t = ((document.body && document.body.innerText) || '');
    var m = t.match(/Hanya data:\s*([^\n]+)/i);
    if (m) return m[1].replace(/OUTLET:.*/i, '').trim();
    m = t.match(/OUTLET:\s*([A-Z0-9 ]+)/i);
    return m ? m[1].trim() : '';
  }
  function filt(list) {
    list = list || [];
    var name = scopeName().toLowerCase();
    if (!name || /semua|editor|ho jkt/i.test(((document.body && document.body.innerText) || ''))) {
      if (!/OUTLET:\s*[A-Z]/i.test(document.body.innerText || '')) return list;
    }
    if (window.baFilterOutlet) {
      var a = window.baFilterOutlet(list);
      if (a && a.length) return a;
    }
    if (!name) return list;
    var keys = name.toLowerCase().split(/[-]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 4; });
    var out = list.filter(function (r) {
      var L = String(r.loc || '').toLowerCase();
      for (var i = 0; i < keys.length; i++) if (L.indexOf(keys[i]) >= 0) return true;
      return false;
    });
    return out;
  }
  function paint(list) {
    list = list || window.__baLastList || [];
    if (list.length) window.__baLastList = list;
    var show = filt(list);
    var tb = document.getElementById('ba-table-body');
    if (tb && show.length) {
      tb.setAttribute('data-ok', '1');
      var table = tb.closest('table');
      if (table) {
        var head = table.querySelector('thead tr');
        if (head) head.innerHTML = '<th style="padding:0.5rem">Tanggal</th><th style="padding:0.5rem">Nama</th><th style="padding:0.5rem">Uom</th><th style="padding:0.5rem">Qty</th><th style="padding:0.5rem">Price</th><th style="padding:0.5rem">Total</th><th style="padding:0.5rem">Keterangan</th><th style="padding:0.5rem">Loc</th><th style="padding:0.5rem">Status</th><th style="padding:0.5rem">Aksi</th>';
      }
      var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9';
      tb.innerHTML = show.map(function (r) {
        var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
        return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+fmt(r.price)+'</td><td style="'+td+'">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+(r.status||'')+'</td><td style="'+td+'"></td></tr>';
      }).join('');
    }
    var rp = document.getElementById('ba-rp-tbody');
    if (rp && show.length) {
      rp.setAttribute('data-ok', '1');
      rp.innerHTML = show.map(function (r) {
        var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
        return '<tr><td>'+(r.date||'')+'</td><td>'+(r.sku||'')+'</td><td>'+(r.name||'')+'</td><td>'+(r.uom||'')+'</td><td>'+(r.qty||0)+'</td><td>'+fmt(r.price)+'</td><td>'+fmt(tot)+'</td><td>'+(r.keterangan||'')+'</td><td>'+(r.loc||'')+'</td><td>'+(r.status||'')+'</td><td></td></tr>';
      }).join('');
    }
  }
  window.paintHist = paint;
  fetch('ba-data.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (rows) {
    if (rows && rows.length) { window.__baLastList = rows; paint(rows); }
  }).catch(function () {});
  setInterval(function () { if (window.__baLastList) paint(window.__baLastList); }, 1500);
})();
