(function () {
  if (window.__baBoot) return; window.__baBoot = true;
  function applyLogo(src, srcW) {
    document.querySelectorAll('#login-screen img, .login-card img, .brand img, .sidebar .logo img').forEach(function (img) {
      var inSide = !!(img.closest && img.closest('.sidebar'));
      img.src = inSide ? (srcW || src) : src;
      img.style.cssText = 'background:transparent;max-width:' + (inSide ? '168px' : '260px') + ';width:100%;height:auto;max-height:' + (inSide ? '64px' : '110px') + ';object-fit:contain;filter:none;transform:none;display:block;margin:0 auto';
    });
  }
  window.paintHist = window.paintHist || function (list) {
    var tb = document.getElementById('ba-table-body');
    if (!tb) return;
    list = list || window.__baLastList || [];
    if (window.baFilterOutlet) list = window.baFilterOutlet(list);
    if (!list.length) {
      tb.innerHTML = '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
      return;
    }
    var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9';
    function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
    tb.innerHTML = list.map(function (r) {
      var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+fmt(r.price)+'</td><td style="'+td+'">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+(r.status||'')+'</td><td style="'+td+'"></td></tr>';
    }).join('');
  };
  setTimeout(function () { if (window.__baLastList) window.paintHist(window.__baLastList); }, 1000);
})();
