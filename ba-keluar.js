(function () {
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  var HEAD = '<th style="padding:0.5rem">Tanggal</th><th style="padding:0.5rem">Nama</th><th style="padding:0.5rem">Uom</th><th style="padding:0.5rem">Qty</th><th style="padding:0.5rem">Price</th><th style="padding:0.5rem">Total</th><th style="padding:0.5rem">Keterangan</th><th style="padding:0.5rem">Loc</th><th style="padding:0.5rem">Status</th><th style="padding:0.5rem">Aksi</th>';
  function hook() {
    if (typeof window.baRenderTable !== 'function') return;
    if (window.baRenderTable._pt) return;
    window.baRenderTable = function (list) {
      var tb = document.getElementById('ba-table-body');
      if (!tb) return;
      try { if (!list) list = JSON.parse(localStorage.getItem('patatas_ba_v1') || '[]'); } catch (e) { list = list || []; }
      if (window.baFilterOutlet) list = window.baFilterOutlet(list);
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
        return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+';text-align:center">'+(r.uom||'')+'</td><td style="'+td+';text-align:center">'+(r.qty||0)+'</td><td style="'+td+';text-align:right">'+fmt(pr)+'</td><td style="'+td+';text-align:right;font-weight:600">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+';white-space:nowrap">'+badge+'</td><td style="'+td+';white-space:nowrap">'+aksi+'</td></tr>';
      }).join('');
    };
    window.baRenderTable._pt = true;
    try { window.baRenderTable(); } catch (e) {}
  }
  setInterval(hook, 500);
  hook();
})();
