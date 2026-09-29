(function () {
  if (window.__baMasuk3) return;
  window.__baMasuk3 = true;
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function numID(c) {
    if (c && typeof c === 'object' && typeof c.v === 'number') return c.v;
    var s = cell(c);
    if (!s) return 0;
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (s.indexOf(',') >= 0) s = s.replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    var n = Number(s);
    return isNaN(n) ? 0 : n;
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
    var keys;
    if (/bbm|boemi|blok/.test(h)) keys = ['boemi', 'blok m'];
    else if (/kh|hainan|central park/.test(h)) keys = ['hainan', 'central park'];
    else keys = h.split(/[-,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 4; });
    return list.filter(function (r) {
      var L = String(r.loc || r.location || '').toLowerCase();
      for (var i = 0; i < keys.length; i++) if (L.indexOf(keys[i]) >= 0) return true;
      return false;
    });
  }
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function driveUrl(u) {
    u = String(u || '').trim();
    var m = u.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/file/d/' + m[1] + '/view';
    return /^https?:/i.test(u) ? u : '';
  }
  function paint() {
    var tb = document.getElementById('ba2-table-body');
    if (!tb) return;
    var list = filt(window.__ba2LastList || []).sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9';
    tb.innerHTML = list.length ? list.map(function (r) {
      var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
      var st = r.status || 'Done';
      var badge = window.baStatusBadge ? window.baStatusBadge(st) : st;
      var foto = driveUrl(r.foto);
      var aksi = foto
        ? '<button type="button" class="ba2-eye" data-foto="'+foto.replace(/"/g,'')+'" title="Lihat foto" style="font-size:0.9rem;padding:0.2rem 0.45rem;border:1px solid #cbd5e1;background:#fff;border-radius:6px;cursor:pointer">👁</button>'
        : '<span style="color:#94a3b8;font-size:0.75rem">-</span>';
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+fmt(r.price)+'</td><td style="'+td+'">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+badge+'</td><td style="'+td+'">'+aksi+'</td></tr>';
    }).join('') : '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('.ba2-eye');
    if (!b) return;
    ev.preventDefault();
    var u = b.getAttribute('data-foto') || '';
    if (u) window.open(u, '_blank');
  }, true);
  function load() {
    window.patatasBA2 = function (resp) {
      var cols = (resp.table && resp.table.cols) || [];
      var rows = (resp.table && resp.table.rows) || [];
      var h = cols.map(function (c) { return String(c.label || '').toLowerCase(); });
      function ix(x) { return h.indexOf(x); }
      var iT=ix('tanggal'),iN=ix('nama'),iU=ix('uom'),iQ=ix('qty'),iP=ix('price'),iTot=ix('total'),iK=ix('keterangan'),iF=ix('foto'),iL=ix('loc'),iS=ix('status');
      var out = [];
      rows.forEach(function (row, i) {
        var c = row.c || [];
        var date = cell(c[iT]), nama = cell(c[iN]);
        if (!date && !nama) return;
        out.push({ id: 'BA2ROW' + (i + 2), date: date, name: nama, uom: cell(c[iU]), qty: numID(c[iQ]), price: numID(c[iP]), total: numID(c[iTot]), keterangan: cell(c[iK]), foto: cell(c[iF]), loc: cell(c[iL]), status: cell(c[iS]) || 'Done' });
      });
      window.__ba2LastList = out;
      try { localStorage.setItem('patatas_ba2_v1', JSON.stringify(out)); } catch (e) {}
      paint();
    };
    var s = document.createElement('script');
    s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=BA2&tqx=out:json;responseHandler:patatasBA2&_=' + Date.now();
    document.body.appendChild(s);
  }
  load();
  setInterval(function () { if (document.getElementById('ba2-table-body') && window.__ba2LastList) paint(); }, 1000);
})();
