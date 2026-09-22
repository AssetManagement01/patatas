(function () {
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function gviz(sheet) {
    return new Promise(function (res, rej) {
      var n = 'boot_' + sheet + '_' + Date.now();
      var t = setTimeout(function () { rej(new Error('timeout')); }, 15000);
      window[n] = function (resp) {
        clearTimeout(t);
        try {
          var cols = (resp.table && resp.table.cols) || [];
          var rows = (resp.table && resp.table.rows) || [];
          var h = cols.map(function (c) { return String(c.label || '').toLowerCase(); });
          function ix(x) { return h.indexOf(x); }
          var iT=ix('tanggal'),iSku=ix('sku'),iN=ix('nama'),iU=ix('uom'),iQ=ix('qty'),iP=ix('price'),iTot=ix('total'),iK=ix('keterangan'),iF=ix('foto'),iL=ix('loc'),iS=ix('status');
          var out=[];
          rows.forEach(function(row){
            var c=row.c||[]; var date=cell(c[iT]), nama=cell(c[iN]);
            if(!date&&!nama)return;
            out.push({date:date,sku:cell(c[iSku]),name:nama,uom:cell(c[iU]),qty:Number(String(cell(c[iQ])).replace(/,/g,''))||0,price:Number(String(cell(c[iP])).replace(/,/g,''))||0,total:Number(String(cell(c[iTot])).replace(/,/g,''))||0,keterangan:cell(c[iK]),foto:cell(c[iF]),loc:cell(c[iL]),status:cell(c[iS])||''});
          });
          res(out);
        } catch (e) { rej(e); }
      };
      var s = document.createElement('script');
      s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=' + encodeURIComponent(sheet) + '&tqx=out:json;responseHandler:' + n + '&_=' + Date.now();
      s.onerror = function () { clearTimeout(t); rej(new Error('gviz')); };
      document.body.appendChild(s);
    });
  }
  function punchBg(src) {
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () {
        var c = document.createElement('canvas');
        c.width = im.width; c.height = im.height;
        var ctx = c.getContext('2d');
        ctx.translate(c.width/2, c.height/2);
        ctx.rotate(-2 * Math.PI / 180);
        ctx.drawImage(im, -im.width/2, -im.height/2);
        var imgd = ctx.getImageData(0, 0, c.width, c.height), d = imgd.data;
        var br = d[0], bg = d[1], bb = d[2];
        for (var i = 0; i < d.length; i += 4) {
          var r = d[i], g = d[i+1], b = d[i+2];
          var dist = Math.sqrt((r-br)*(r-br)+(g-bg)*(g-bg)+(b-bb)*(b-bb));
          var luma = 0.299*r+0.587*g+0.114*b;
          if (dist < 32 || luma > 228) d[i+3] = 0;
        }
        ctx.putImageData(imgd, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      im.onerror = function () { resolve(src); };
      im.src = src;
    });
  }
  function makeWhite(src) {
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () {
        var c = document.createElement('canvas');
        c.width = im.width; c.height = im.height;
        var ctx = c.getContext('2d');
        ctx.drawImage(im, 0, 0);
        var imgd = ctx.getImageData(0, 0, c.width, c.height), d = imgd.data;
        for (var i = 0; i < d.length; i += 4) if (d[i+3] > 0) { d[i]=255; d[i+1]=255; d[i+2]=255; }
        ctx.putImageData(imgd, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      im.onerror = function () { resolve(src); };
      im.src = src;
    });
  }
  function applyLogo(src, srcW) {
    document.querySelectorAll('.brand img, .login-brand img, img').forEach(function (img) {
      if (!/patatas|logo|brand/i.test((img.className||'')+(img.alt||'')+(img.parentElement && img.parentElement.className||''))) {
        if (!img.closest('.brand, .sidebar .logo, .login')) return;
      }
      if (img.closest('.sidebar')) img.src = srcW || src;
      else img.src = src;
      img.style.cssText = 'background:transparent;max-width:220px;width:100%;height:auto;max-height:84px;object-fit:contain;filter:none;display:block';
    });
    document.querySelectorAll('.sidebar .logo img').forEach(function (img) {
      img.src = srcW || src;
      img.style.cssText = 'background:transparent;max-width:168px;width:100%;height:auto;max-height:64px;object-fit:contain;filter:none;display:block;margin:0 auto';
    });
  }
  function loadLogo() {
    var files = ['logo_p0.txt','logo_p1.txt','logo_p2.txt','logo_p3.txt','logo_p4.txt','logo_p5.txt'];
    Promise.all(files.map(function (f) { return fetch(f + '?v=4').then(function (r) { return r.text(); }); }))
      .then(async function (chunks) {
        var raw = 'data:image/jpeg;base64,' + chunks.join('').replace(/\s/g, '');
        var src = await punchBg(raw);
        var srcW = await makeWhite(src);
        applyLogo(src, srcW);
        [400,1200,2500].forEach(function (ms) { setTimeout(function () { applyLogo(src, srcW); }, ms); });
      }).catch(function () {});
  }
  function paintHist(list) {
    var tb = document.getElementById('ba-table-body');
    if (!tb) return;
    if (window.baFilterOutlet) list = window.baFilterOutlet(list || []);
    var table = tb.closest('table');
    if (table) {
      var head = table.querySelector('thead tr');
      if (head) head.innerHTML = '<th style="padding:0.5rem">Tanggal</th><th style="padding:0.5rem">Nama</th><th style="padding:0.5rem">Uom</th><th style="padding:0.5rem">Qty</th><th style="padding:0.5rem">Price</th><th style="padding:0.5rem">Total</th><th style="padding:0.5rem">Keterangan</th><th style="padding:0.5rem">Loc</th><th style="padding:0.5rem">Status</th><th style="padding:0.5rem">Aksi</th>';
    }
    if (!list.length) {
      tb.innerHTML = '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
      return;
    }
    var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9';
    tb.innerHTML = list.map(function (r) {
      var tot = Number(r.total) || ((Number(r.price)||0)*(Number(r.qty)||0));
      var badge = window.baStatusBadge ? window.baStatusBadge(r.status) : (r.status || '');
      var aksi = window.baAdminButtons ? window.baAdminButtons(r) : '';
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+fmt(r.price)+'</td><td style="'+td+'">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+badge+'</td><td style="'+td+'">'+aksi+'</td></tr>';
    }).join('');
  }
  async function loadAll() {
    try {
      if (typeof window.baSyncFromSheet === 'function') {
        var api = await window.baSyncFromSheet();
        if (api && api.length) window.__baLastList = api;
      }
    } catch (e) {}
    try {
      var rows = await gviz('BA');
      window.__baLastList = rows;
      try { localStorage.setItem('patatas_ba_v1', JSON.stringify(rows)); } catch (e) {}
      paintHist(rows);
      if (window.baRenderReport) window.baRenderReport();
    } catch (e) {
      if (window.__baLastList) paintHist(window.__baLastList);
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button');
    if (!b || !/refresh/i.test(b.textContent || '')) return;
    var old = b.innerHTML; b.innerHTML = 'Loading...'; b.disabled = true;
    loadAll().finally(function () { b.innerHTML = old; b.disabled = false; });
  }, true);
  loadLogo();
  setTimeout(loadAll, 700);
  setTimeout(loadAll, 2500);
})();
