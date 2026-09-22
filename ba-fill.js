(function () {
  if (window.__baFill3) return;
  window.__baFill3 = true;
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function parse(resp) {
    var cols = (resp.table && resp.table.cols) || [];
    var rows = (resp.table && resp.table.rows) || [];
    var h = cols.map(function (c) { return String(c.label || '').toLowerCase(); });
    function ix(x) { return h.indexOf(x); }
    var iT=ix('tanggal'),iSku=ix('sku'),iN=ix('nama'),iU=ix('uom'),iQ=ix('qty'),iP=ix('price'),iTot=ix('total'),iK=ix('keterangan'),iF=ix('foto'),iL=ix('loc'),iS=ix('status');
    var out = [];
    rows.forEach(function (row, i) {
      var c = row.c || [];
      var date = cell(c[iT]), nama = cell(c[iN]);
      if (!date && !nama) return;
      out.push({
        id: 'BAROW' + (i + 2), date: date, sku: cell(c[iSku]), name: nama, uom: cell(c[iU]),
        qty: Number(String(cell(c[iQ])).replace(/,/g,''))||0,
        price: Number(String(cell(c[iP])).replace(/,/g,''))||0,
        total: Number(String(cell(c[iTot])).replace(/,/g,''))||0,
        keterangan: cell(c[iK]), foto: cell(c[iF]), loc: cell(c[iL]),
        status: cell(c[iS]) || 'Permintaan', revisi: 1
      });
    });
    return out;
  }
  function hint() {
    var t = ((document.body && document.body.innerText) || '');
    var m = t.match(/Hanya data:\s*([^\n]+)/i);
    if (m) return m[1].replace(/OUTLET:.*/i,'').trim().toLowerCase();
    m = t.match(/OUTLET:\s*([A-Z0-9 ]+)/i);
    return m ? m[1].trim().toLowerCase() : '';
  }
  function filt(list) {
    list = list || [];
    var t = ((document.body && document.body.innerText) || '');
    if (/Dapat melihat semua outlet|EDITOR|HO JKT/i.test(t) && !/OUTLET:\s*[A-Z]/i.test(t)) return list;
    var h = hint();
    if (!h) return list;
    var keys = /kh|hainan|central park/.test(h) ? ['hainan', 'central park'] : h.split(/[-,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 4; });
    return list.filter(function (r) {
      var L = String(r.loc || '').toLowerCase();
      for (var i = 0; i < keys.length; i++) if (L.indexOf(keys[i]) >= 0) return true;
      return false;
    });
  }
  function fmt(n) { n = Number(n)||0; try { return n.toLocaleString('id-ID'); } catch(e){ return String(n); } }
  function paint(list) {
    list = list || window.__baLastList || [];
    var show = filt(list);
    var tb = document.getElementById('ba-table-body');
    if (tb) {
      if (!show.length) {
        tb.innerHTML = '<tr><td colspan="8" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
      } else {
        var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9';
        tb.innerHTML = show.map(function (r) {
          var badge = window.baStatusBadge ? window.baStatusBadge(r.status) : (r.status||'');
          var aksi = window.baAdminButtons ? window.baAdminButtons(r) : '';
          return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.sku||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+badge+'</td><td style="'+td+'">'+aksi+'</td></tr>';
        }).join('');
      }
    }
    var rp = document.getElementById('ba-rp-tbody');
    if (rp && show.length) {
      rp.innerHTML = show.map(function (r) {
        var tot = Number(r.total)||((Number(r.price)||0)*(Number(r.qty)||0));
        return '<tr><td>'+(r.date||'')+'</td><td>'+(r.sku||'')+'</td><td>'+(r.name||'')+'</td><td>'+(r.uom||'')+'</td><td>'+(r.qty||0)+'</td><td>'+fmt(r.price)+'</td><td>'+fmt(tot)+'</td><td>'+(r.keterangan||'')+'</td><td>'+(r.loc||'')+'</td><td>'+(r.status||'')+'</td><td></td></tr>';
      }).join('');
    }
  }
  function save(rows) {
    window.__baLastList = rows;
    try { localStorage.setItem('patatas_ba_v1', JSON.stringify(rows)); } catch (e) {}
    paint(rows);
  }
  function loadAll() {
    return new Promise(function (resolve) {
      var done = false;
      function finish(rows) {
        if (rows && rows.length) save(rows);
        else if (window.__baLastList) paint(window.__baLastList);
        if (!done) { done = true; resolve(); }
      }
      window.patatasBAfill = function (resp) { finish(parse(resp)); };
      var s = document.createElement('script');
      s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=BA&tqx=out:json;responseHandler:patatasBAfill&_=' + Date.now();
      s.onerror = function () {
        fetch('ba-data.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (rows) {
          rows.forEach(function (r, i) { if (!r.id) r.id = 'BAROW' + (i + 2); });
          finish(rows);
        }).catch(function () { finish(null); });
      };
      document.body.appendChild(s);
      setTimeout(function () {
        if (!done) {
          fetch('ba-data.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (rows) {
            rows.forEach(function (x, i) { if (!x.id) x.id = 'BAROW' + (i + 2); });
            finish(rows);
          }).catch(function () { finish(null); });
        }
      }, 4000);
    });
  }
  function hookRefresh() {
    document.querySelectorAll('button').forEach(function (b) {
      if (!/refresh/i.test(b.textContent || '') || b.getAttribute('data-ba-load')) return;
      b.setAttribute('data-ba-load', '1');
      b.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        var old = b.innerHTML;
        b.disabled = true;
        b.innerHTML = 'Loading...';
        var tb = document.getElementById('ba-table-body');
        if (tb) tb.innerHTML = '<tr><td colspan="8" style="padding:1rem;text-align:center;color:#0f766e">Loading...</td></tr>';
        loadAll().finally(function () {
          b.disabled = false;
          b.innerHTML = old;
        });
      }, true);
    });
  }
  loadAll();
  hookRefresh();
  setInterval(hookRefresh, 1500);
})();
