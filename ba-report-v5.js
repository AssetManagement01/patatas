(function () {
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  var cacheBA = null, cacheBA2 = null, drawing = false;
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function thumb(u) {
    u = String(u || '');
    var m = u.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w400';
    return /^https?:/i.test(u) ? u : '';
  }
  function jenis() {
    var el = document.getElementById('ba-rp-jenis');
    return el ? el.value : 'keluar';
  }
  function filt(list) {
    list = list || [];
    var a = window.baFilterOutlet ? window.baFilterOutlet(list) : list;
    if (a && a.length) return a;
    var scope = window.baGetScope && window.baGetScope();
    if (!scope) return list;
    var keys = [scope.name].concat(scope.keys || []).map(function (s) { return String(s || '').toLowerCase(); });
    return list.filter(function (r) {
      var L = String(r.loc || r.location || '').toLowerCase();
      for (var i = 0; i < keys.length; i++) if (keys[i] && L.indexOf(keys[i]) >= 0) return true;
      return false;
    });
  }
  function gviz(sheet) {
    return new Promise(function (res, rej) {
      var n = 'google_rp_' + sheet + '_' + Date.now();
      var t = setTimeout(function () { rej(new Error('t')); }, 15000);
      window[n] = function (resp) {
        clearTimeout(t);
        try {
          var cols = (resp.table && resp.table.cols) || [];
          var rows = (resp.table && resp.table.rows) || [];
          var h = cols.map(function (c) { return String(c.label || '').toLowerCase(); });
          function ix(x) { return h.indexOf(x); }
          var iT = ix('tanggal'), iSku = ix('sku'), iN = ix('nama'), iU = ix('uom'), iQ = ix('qty');
          var iP = ix('price'), iTot = ix('total'), iK = ix('keterangan'), iF = ix('foto'), iL = ix('loc'), iS = ix('status');
          var out = [];
          rows.forEach(function (row) {
            var c = row.c || [];
            var date = cell(c[iT]), nama = cell(c[iN]);
            if (!date && !nama) return;
            out.push({ date: date, sku: cell(c[iSku]), name: nama, uom: cell(c[iU]), qty: Number(String(cell(c[iQ])).replace(/,/g, '')) || 0, price: Number(String(cell(c[iP])).replace(/,/g, '')) || 0, total: Number(String(cell(c[iTot])).replace(/,/g, '')) || 0, keterangan: cell(c[iK]), foto: cell(c[iF]), loc: cell(c[iL]), status: cell(c[iS]) || '' });
          });
          res(out);
        } catch (err) { rej(err); }
      };
      var s = document.createElement('script');
      s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=' + encodeURIComponent(sheet) + '&tqx=out:json;responseHandler:' + n + '&_=' + Date.now();
      s.onerror = function () { clearTimeout(t); rej(new Error('g')); };
      document.body.appendChild(s);
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
    document.getElementById('ba-rp-jenis').addEventListener('change', function () { render(true); });
    return true;
  }
  function draw(list, j) {
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;
    j = j || jenis();
    var showSku = j !== 'masuk';
    var table = tb.closest('table');
    if (table) {
      var head = table.querySelector('thead tr');
      if (head) {
        head.innerHTML = (j === 'semua' ? '<th style="padding:0.4rem">Jenis</th>' : '') +
          '<th style="padding:0.4rem">Tanggal</th>' + (showSku ? '<th style="padding:0.4rem">SKU</th>' : '') +
          '<th style="padding:0.4rem">Nama</th><th style="padding:0.4rem">Uom</th><th style="padding:0.4rem">Qty</th><th style="padding:0.4rem">Price</th><th style="padding:0.4rem">Total</th><th style="padding:0.4rem">Keterangan</th><th style="padding:0.4rem">Loc</th><th style="padding:0.4rem">Status</th><th style="padding:0.4rem">Foto</th>';
      }
    }
    if (!list || !list.length) {
      tb.innerHTML = '<tr><td colspan="12" style="padding:1rem;text-align:center;color:#94a3b8">Tidak ada data</td></tr>';
      tb.removeAttribute('data-ok');
      return;
    }
    tb.setAttribute('data-ok', '1');
    tb.innerHTML = list.map(function (r) {
      var f = thumb(r.foto);
      var foto = f ? '<img src="' + f + '" style="width:40px;height:40px;object-fit:cover;border-radius:4px"/>' : '-';
      var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
      return '<tr>' + (j === 'semua' ? '<td style="padding:0.4rem">' + (r._jenis || '') + '</td>' : '') +
        '<td style="padding:0.4rem">' + (r.date || '') + '</td>' +
        (showSku ? '<td style="padding:0.4rem">' + (r.sku || '') + '</td>' : '') +
        '<td style="padding:0.4rem">' + (r.name || '') + '</td><td style="padding:0.4rem">' + (r.uom || '') + '</td><td style="padding:0.4rem">' + (r.qty || 0) + '</td><td style="padding:0.4rem">' + fmt(r.price) + '</td><td style="padding:0.4rem">' + fmt(tot) + '</td><td style="padding:0.4rem">' + (r.keterangan || '') + '</td><td style="padding:0.4rem">' + (r.loc || '') + '</td><td style="padding:0.4rem">' + (r.status || '') + '</td><td style="padding:0.4rem">' + foto + '</td></tr>';
    }).join('');
  }
  async function render(force) {
    if (drawing) return;
    var tb = document.getElementById('ba-rp-tbody');
    if (!tb) return;
    if (!force && tb.getAttribute('data-ok') === '1') return;
    drawing = true;
    injectJenis();
    var j = jenis();
    try {
      if (j !== 'masuk' && !cacheBA) cacheBA = await gviz('BA');
      if (j !== 'keluar' && !cacheBA2) cacheBA2 = await gviz('BA2');
    } catch (e) {}
    var keluar = filt(cacheBA || []);
    var masuk = filt(cacheBA2 || []);
    if (j === 'masuk') draw(masuk, 'masuk');
    else if (j === 'semua') draw(keluar.map(function (r) { return Object.assign({}, r, { _jenis: 'Kas Keluar' }); }).concat(masuk.map(function (r) { return Object.assign({}, r, { _jenis: 'Kas Masuk' }); })), 'semua');
    else draw(keluar, 'keluar');
    drawing = false;
  }
  window.baRenderReport = function () { cacheBA = null; cacheBA2 = null; render(true); };
  setInterval(function () {
    window.baRenderReport = function () { cacheBA = null; cacheBA2 = null; render(true); };
    injectJenis();
    var tb = document.getElementById('ba-rp-tbody');
    if (tb && tb.getAttribute('data-ok') !== '1') render(false);
  }, 800);
})();
