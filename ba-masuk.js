(function () {
  if (window.__baMasuk4) return;
  window.__baMasuk4 = true;
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
  function fileId(u) {
    var m = String(u || '').match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    return m ? m[1] : '';
  }
  function thumb(u) {
    var id = fileId(u);
    if (id) return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w800';
    return /^https?:/i.test(u) ? u : '';
  }
  function showFoto(r) {
    var old = document.getElementById('ba2-foto-modal');
    if (old) old.remove();
    var src = thumb(r.foto || r.photo || '');
    var wrap = document.createElement('div');
    wrap.id = 'ba2-foto-modal';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
    wrap.innerHTML =
      '<div style="background:#fff;border-radius:14px;max-width:420px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.25)">' +
      '<div style="padding:0.85rem 1rem;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0b4f37">' + String(r.name || 'Foto item').replace(/</g,'') + '</div>' +
      '<div style="padding:1rem;text-align:center">' +
      '<div style="font-size:0.7rem;color:#64748b;letter-spacing:.06em;margin-bottom:0.5rem">FOTO ITEM</div>' +
      (src ? '<img src="'+src+'" alt="foto" style="max-width:100%;max-height:360px;border-radius:10px;object-fit:contain;background:#f8fafc"/>' : '<div style="color:#94a3b8;padding:2rem">Tidak ada foto</div>') +
      '<div style="font-size:0.8rem;color:#64748b;margin-top:0.65rem">' + String(r.loc || '') + (r.date ? ' · ' + r.date : '') + '</div>' +
      '</div>' +
      '<div style="padding:0.75rem 1rem;border-top:1px solid #e2e8f0;text-align:right">' +
      '<button type="button" id="ba2-foto-close" style="padding:0.45rem 1rem;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Tutup</button>' +
      '</div></div>';
    document.body.appendChild(wrap);
    function tutup() { wrap.remove(); }
    wrap.addEventListener('click', function (e) { if (e.target === wrap) tutup(); });
    var c = document.getElementById('ba2-foto-close');
    if (c) c.onclick = tutup;
  }
  function paint() {
    var tb = document.getElementById('ba2-table-body');
    if (!tb) return;
    var list = filt(window.__ba2LastList || []).sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9';
    tb.innerHTML = list.length ? list.map(function (r, i) {
      var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
      var st = r.status || 'Done';
      var badge = window.baStatusBadge ? window.baStatusBadge(st) : st;
      var has = !!(r.foto || r.photo);
      var aksi = has
        ? '<button type="button" class="ba2-eye" data-i="'+i+'" title="Lihat foto" style="width:32px;height:32px;border:none;background:transparent;color:#0b4f37;font-size:1.15rem;cursor:pointer;line-height:1">◎</button>'
        : '<span style="color:#94a3b8">-</span>';
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+fmt(r.price)+'</td><td style="'+td+'">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+badge+'</td><td style="'+td+'">'+aksi+'</td></tr>';
    }).join('') : '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
    window.__ba2Painted = list;
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest('.ba2-eye');
    if (!b) return;
    ev.preventDefault();
    ev.stopPropagation();
    var list = window.__ba2Painted || [];
    var r = list[Number(b.getAttribute('data-i'))] || { foto: b.getAttribute('data-foto') };
    showFoto(r);
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
  setInterval(function () { if (document.getElementById('ba2-table-body') && window.__ba2LastList) paint(); }, 1500);
})();
