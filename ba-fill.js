(function () {
  if (window.__baFill) return;
  window.__baFill = true;
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
        id: 'BAROW' + (i + 2),
        date: date,
        sku: cell(c[iSku]),
        name: nama,
        uom: cell(c[iU]),
        qty: Number(String(cell(c[iQ])).replace(/,/g, '')) || 0,
        price: Number(String(cell(c[iP])).replace(/,/g, '')) || 0,
        total: Number(String(cell(c[iTot])).replace(/,/g, '')) || 0,
        keterangan: cell(c[iK]),
        foto: cell(c[iF]),
        loc: cell(c[iL]),
        status: cell(c[iS]) || 'Permintaan',
        revisi: 1
      });
    });
    return out;
  }
  function save(list) {
    window.__baLastList = list;
    try { localStorage.setItem('patatas_ba_v1', JSON.stringify(list)); } catch (e) {}
  }
  function draw() {
    var list = window.__baLastList || [];
    if (window.baFilterOutlet) list = window.baFilterOutlet(list);
    if (typeof window.baRenderTable === 'function') {
      try { window.baRenderTable(list); } catch (e) {}
    }
    if (typeof window.baRenderReport === 'function') {
      try { window.baRenderReport(); } catch (e) {}
    }
  }
  function load() {
    window.patatasBAfill = function (resp) {
      var rows = parse(resp);
      if (rows.length) save(rows);
      draw();
    };
    var s = document.createElement('script');
    s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=BA&tqx=out:json;responseHandler:patatasBAfill&_=' + Date.now();
    document.body.appendChild(s);
    fetch('ba-data.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (rows) {
      if (!window.__baLastList && rows && rows.length) {
        rows.forEach(function (r, i) { if (!r.id) r.id = 'BAROW' + (i + 2); if (!r.status) r.status = 'Done'; });
        save(rows);
        draw();
      }
    }).catch(function () {});
  }
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load);
  setTimeout(load, 900);
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button');
    if (b && /refresh/i.test(b.textContent || '')) setTimeout(load, 200);
  }, true);
})();
