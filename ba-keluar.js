(function () {
  if (!document.getElementById('ba-scope-js')) {
    var sc = document.createElement('script');
    sc.id = 'ba-scope-js';
    sc.src = 'ba-scope.js?t=' + Date.now();
    document.body.appendChild(sc);
  }
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function loadBA() {
    return new Promise(function (res, rej) {
      var n = 'baHist_' + Date.now();
      var t = setTimeout(function () { rej(new Error('t')); }, 15000);
      window[n] = function (resp) {
        clearTimeout(t);
        try {
          var cols = (resp.table && resp.table.cols) || [];
          var rows = (resp.table && resp.table.rows) || [];
          var h = cols.map(function (c) { return String(c.label || '').toLowerCase(); });
          function ix(x) { return h.indexOf(x); }
          var iT=ix('tanggal'),iSku=ix('sku'),iN=ix('nama'),iU=ix('uom'),iQ=ix('qty'),iP=ix('price'),iTot=ix('total'),iK=ix('keterangan'),iL=ix('loc'),iS=ix('status');
          var out=[];
          rows.forEach(function(row){
            var c=row.c||[]; var date=cell(c[iT]), nama=cell(c[iN]);
            if(!date&&!nama)return;
            out.push({date:date,sku:cell(c[iSku]),name:nama,uom:cell(c[iU]),qty:Number(String(cell(c[iQ])).replace(/,/g,''))||0,price:Number(String(cell(c[iP])).replace(/,/g,''))||0,total:Number(String(cell(c[iTot])).replace(/,/g,''))||0,keterangan:cell(c[iK]),loc:cell(c[iL]),status:cell(c[iS])||''});
          });
          window.__baLastList = out;
          try { localStorage.setItem('patatas_ba_v1', JSON.stringify(out)); } catch (e) {}
          res(out);
        } catch (e) { rej(e); }
      };
      var s=document.createElement('script');
      s.src='https://docs.google.com/spreadsheets/d/'+SID+'/gviz/tq?sheet=BA&tqx=out:json;responseHandler:'+n+'&_='+Date.now();
      s.onerror=function(){clearTimeout(t);rej(new Error('g'));};
      document.body.appendChild(s);
    });
  }
  var HEAD = '<th style="padding:0.5rem">Tanggal</th><th style="padding:0.5rem">Nama</th><th style="padding:0.5rem">Uom</th><th style="padding:0.5rem">Qty</th><th style="padding:0.5rem">Price</th><th style="padding:0.5rem">Total</th><th style="padding:0.5rem">Keterangan</th><th style="padding:0.5rem">Loc</th><th style="padding:0.5rem">Status</th><th style="padding:0.5rem">Aksi</th>';
  function paint(list) {
    var tb = document.getElementById('ba-table-body');
    if (!tb) return;
    if (window.baFilterOutlet) list = window.baFilterOutlet(list || []);
    var table = tb.closest('table');
    if (table) { var head = table.querySelector('thead tr'); if (head) head.innerHTML = HEAD; }
    if (!list.length) {
      tb.innerHTML = '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
      return;
    }
    var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9;vertical-align:middle';
    tb.innerHTML = list.map(function (r) {
      var pr = Number(r.price || 0) || 0;
      var tot = Number(r.total) || (pr * (Number(r.qty) || 0));
      var badge = window.baStatusBadge ? window.baStatusBadge(r.status) : (r.status || '');
      var aksi = window.baAdminButtons ? window.baAdminButtons(r) : '';
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+';text-align:right">'+fmt(pr)+'</td><td style="'+td+';text-align:right;font-weight:600">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+badge+'</td><td style="'+td+'">'+aksi+'</td></tr>';
    }).join('');
  }
  function hook() {
    if (typeof window.baRenderTable === 'function' && !window.baRenderTable._pt) {
      window.baRenderTable = function (list) {
        if (list && list.length) {
          window.__baLastList = list;
          try { localStorage.setItem('patatas_ba_v1', JSON.stringify(list)); } catch (e) {}
          paint(list);
        } else if (window.__baLastList) paint(window.__baLastList);
        else loadBA().then(paint).catch(function () { paint([]); });
      };
      window.baRenderTable._pt = true;
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button');
    if (!b || !/refresh/i.test(b.textContent || '')) return;
    var old = b.innerHTML;
    b.innerHTML = 'Loading...'; b.disabled = true;
    loadBA().then(paint).finally(function () { b.innerHTML = old; b.disabled = false; });
  }, true);
  hook();
  setInterval(hook, 600);
  setTimeout(function () { loadBA().then(paint).catch(function () {}); }, 800);
})();
