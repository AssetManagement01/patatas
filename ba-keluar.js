(function () {
  if (!document.getElementById('ba-scope-js')) {
    var sc = document.createElement('script');
    sc.id = 'ba-scope-js';
    sc.src = 'ba-scope.js?t=' + Date.now();
    document.body.appendChild(sc);
  }
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function isTransferSelect(el) {
    if (!el) return false;
    var id = String(el.id || '') + ' ' + String(el.name || '');
    if (/tr-|transfer|dari|from-out|to-out|ke-out/i.test(id)) return true;
    var p = el, txt = '';
    for (var i = 0; i < 7 && p; i++) {
      txt += ' ' + (p.getAttribute && (p.getAttribute('aria-label') || '') || '');
      p = p.parentElement;
    }
    try {
      var box = el.closest('div,section,form');
      if (box) txt += ' ' + (box.innerText || '').slice(0, 220);
    } catch (e) {}
    return /Dari Outlet|Ke Outlet|Form Transfer Antar/i.test(txt);
  }
  function unlockTransfer() {
    document.querySelectorAll('select').forEach(function (el) {
      if (!isTransferSelect(el)) return;
      if (el.getAttribute('data-lock')) {
        el.disabled = false;
        el.style.pointerEvents = '';
        el.style.background = '';
        el.removeAttribute('data-lock');
      }
    });
  }
  var HEAD = '<th style="padding:0.5rem">Tanggal</th><th style="padding:0.5rem">Nama</th><th style="padding:0.5rem">Uom</th><th style="padding:0.5rem">Qty</th><th style="padding:0.5rem">Price</th><th style="padding:0.5rem">Total</th><th style="padding:0.5rem">Keterangan</th><th style="padding:0.5rem">Loc</th><th style="padding:0.5rem">Status</th><th style="padding:0.5rem">Aksi</th>';
  function hookBa() {
    if (typeof window.baRenderTable !== 'function') return;
    if (window.baRenderTable._pt) return;
    var prev = window.baRenderTable;
    window.baRenderTable = function (list) {
      if (list && list.length) {
        window.__baLastList = list;
        try { localStorage.setItem('patatas_ba_v1', JSON.stringify(list)); } catch (e) {}
      } else {
        if (window.__baLastList && window.__baLastList.length) list = window.__baLastList;
        else {
          try { list = JSON.parse(localStorage.getItem('patatas_ba_v1') || '[]'); } catch (e) { list = []; }
        }
      }
      if (window.baFilterOutlet) list = window.baFilterOutlet(list || []);
      var tb = document.getElementById('ba-table-body');
      if (!tb) return prev.apply(this, arguments);
      var table = tb.closest('table');
      if (table) { var head = table.querySelector('thead tr'); if (head) head.innerHTML = HEAD; }
      if (!list.length) {
        tb.innerHTML = '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
        return;
      }
      var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9;vertical-align:middle';
      tb.innerHTML = list.map(function (r) {
        var loc = r.loc || r.location || r.Loc || '';
        var pr = Number(r.price || 0) || 0;
        var tot = Number(r.total) || (pr * (Number(r.qty) || 0));
        var badge = window.baStatusBadge ? window.baStatusBadge(r.status) : (r.status || '');
        var aksi = window.baAdminButtons ? window.baAdminButtons(r) : '';
        return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+';text-align:center">'+(r.uom||'')+'</td><td style="'+td+';text-align:center">'+(r.qty||0)+'</td><td style="'+td+';text-align:right">'+fmt(pr)+'</td><td style="'+td+';text-align:right;font-weight:600">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+loc+'</td><td style="'+td+';white-space:nowrap">'+badge+'</td><td style="'+td+';white-space:nowrap">'+aksi+'</td></tr>';
      }).join('');
    };
    window.baRenderTable._pt = true;
  }
  function spin(btn) {
    if (!btn || btn.getAttribute('data-spin') === '1') return;
    btn.setAttribute('data-spin', '1');
    var old = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Loading...';
    setTimeout(function () {
      btn.disabled = false;
      btn.innerHTML = old;
      btn.removeAttribute('data-spin');
    }, 1500);
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('button');
    if (!b) return;
    if (/refresh/i.test(b.textContent || '')) spin(b);
  }, true);
  var origLock = window.applyLockToSelect;
  setInterval(function () {
    hookBa();
    unlockTransfer();
    if (typeof window.fillTransferOutlets === 'function' && window.fillTransferOutlets._locked) {
      /* keep unlock after lock cycle */
      setTimeout(unlockTransfer, 50);
    }
  }, 500);
  hookBa();
  unlockTransfer();
})();
