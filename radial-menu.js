/* Aset Lancar disembunyikan dari menu (radial & klasik) atas permintaan user */
(function(){try{var st=document.createElement('style');st.textContent='#nav-aset-lancar{display:none!important}';(document.head||document.documentElement).appendChild(st);}catch(e){}})();
/* PATATAS — Menu radial seperempat lingkaran (R2) pengganti sidebar kiri.
   Item dibangun dari menu sidebar asli: hanya yang tampil (hak akses per user tetap berlaku),
   dan klik item = klik menu asli (navTo + logika lama tetap jalan).
   Preferensi: localStorage patatas_nav_mode = 'radial' | 'classic' (bawaan radial). */
(function () {
  if (window.__patatasRadial) return; window.__patatasRadial = true;
  var KEY = 'patatas_nav_mode';
  var D2R = Math.PI / 180;
  var BASE_R = 190, BASE_R2 = 310, BTN = 74, SUB = 62, UTIL = 56;
  var root, dim, hub, cap, layer, open = false, subOpen = false, items = [], closeTimer = null;

  function $(s, c) { return (c || document).querySelector(s); }
  function mode() { try { return localStorage.getItem(KEY) === 'classic' ? 'classic' : 'radial'; } catch (e) { return 'radial'; } }
  function setMode(m) { try { localStorage.setItem(KEY, m); } catch (e) {} applyMode(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function visible(el) {
    if (!el) return false;
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }
  function loggedIn() {
    var b = document.body;
    if (!b || b.classList.contains('pa-login')) return false;
    var s = null; try { s = window.PATATAS_AUTH && window.PATATAS_AUTH.session(); } catch (e) {}
    if (!s) return false;
    var app = document.getElementById('app');
    return !app || app.style.display !== 'none';
  }

  var CSS = '' +
    'body.nav-radial #sidebar,body.nav-radial .sidebar{display:none!important}' +
    'body.nav-radial .main,body.nav-radial #main{margin-left:0!important;width:100%!important;max-width:100%!important}' +
    'body.nav-radial #btn-toggle-sidebar,body.nav-radial .menu-toggle,body.nav-radial .menu-btn{display:none!important}' +
    '#pr-root{position:fixed;inset:0;z-index:100040;pointer-events:none;font-family:"Segoe UI",system-ui,-apple-system,sans-serif}' +
    'body.pa-login #pr-root,body:not(.nav-radial) #pr-root{display:none!important}' +
    '#pr-dim{position:absolute;inset:0;background:rgba(15,61,54,.6);opacity:0;transition:opacity .28s ease;pointer-events:none}' +
    '#pr-root.open #pr-dim{opacity:1;pointer-events:auto}' +
    '#pr-hub{position:absolute;left:-34px;top:50%;width:92px;height:92px;margin-top:-46px;border-radius:50%;border:0;cursor:pointer;pointer-events:auto;' +
      'background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-left:30px;' +
      'font-weight:800;font-size:22px;line-height:1;box-shadow:0 0 0 7px rgba(255,255,255,.3),0 10px 25px rgba(0,0,0,.3);transition:transform .2s ease,box-shadow .2s;z-index:3;-webkit-tap-highlight-color:transparent}' +
    '#pr-hub small{font-size:10px;font-weight:600;opacity:.9;margin-top:3px}' +
    '#pr-hub:hover{transform:scale(1.05)}#pr-hub:focus-visible{outline:3px solid #facc15;outline-offset:3px}' +
    '#pr-cap{position:absolute;top:50%;left:66px;transform:translateY(-50%);max-width:98px;color:#fff;font-size:11px;line-height:1.25;opacity:0;transition:opacity .25s;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.4);z-index:2}' +
    '#pr-cap b{display:block;font-size:12.5px;word-break:break-word}#pr-cap span{opacity:.85;display:block;margin-top:2px;word-break:break-word}' +
    '#pr-root.open #pr-cap{opacity:1;transition-delay:.25s}' +
    '.pr-btn{position:absolute;left:0;top:50%;border-radius:50%;border:0;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'box-shadow:0 6px 16px rgba(0,0,0,.25);pointer-events:none;opacity:0;visibility:hidden;transform:translate(-50%,-50%) translate(0px,0px) scale(.2);' +
      'transition:transform .22s cubic-bezier(.55,0,.75,.2),opacity .18s ease,visibility 0s linear .3s,background .15s;padding:0;-webkit-tap-highlight-color:transparent;z-index:1}' +
    '.pr-btn .ic{line-height:1}.pr-btn .lb{color:#0f766e;font-weight:700;margin-top:3px;max-width:90%;line-height:1.05;text-align:center;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-word}' +
    '.pr-btn.show{pointer-events:auto;opacity:1;visibility:visible;transition:transform .5s cubic-bezier(.34,1.56,.64,1),opacity .2s ease,visibility 0s,background .15s}' +
    '.pr-btn:hover{filter:brightness(.96)}.pr-btn:focus-visible{outline:3px solid #facc15;outline-offset:3px}' +
    '.pr-btn.sub{background:#ccfbf1}.pr-btn.util{background:#f1f5f9}.pr-btn.util .lb{color:#334155}' +
    '.pr-btn.logout{background:#fee2e2}.pr-btn.logout .lb{color:#b91c1c}' +
    '.pr-btn.active{background:#facc15!important}.pr-btn.active .lb{color:#713f12!important}' +
    '.pr-btn.grp-open{box-shadow:0 0 0 4px #facc15,0 6px 16px rgba(0,0,0,.25)}' +
    '#nav-radial-back{cursor:pointer}' +
    '@media print{#pr-root{display:none!important}}';

  function injectCss() {
    if (document.getElementById('pr-css')) return;
    var st = document.createElement('style'); st.id = 'pr-css'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  function build() {
    if (root) return;
    injectCss();
    root = document.createElement('div'); root.id = 'pr-root';
    root.innerHTML = '<div id="pr-dim"></div><div id="pr-layer" role="menu" aria-label="Menu utama"></div><div id="pr-cap"></div>' +
      '<button type="button" id="pr-hub" aria-haspopup="true" aria-expanded="false" aria-label="Buka menu" title="Menu">P<small>menu</small></button>';
    document.body.appendChild(root);
    dim = $('#pr-dim', root); hub = $('#pr-hub', root); cap = $('#pr-cap', root); layer = $('#pr-layer', root);
    hub.onclick = function () { open ? closeMenu() : openMenu(); };
    dim.onclick = function () { closeMenu(); };
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', function () { if (open) layout(); });
  }

  /* ---- item dari sidebar asli ---- */
  function navEl(sel) { return document.querySelector('#sidebar ' + sel) || document.querySelector(sel); }
  function labelOf(el, fb) {
    if (!el) return fb;
    var t = (el.textContent || '').replace(/[▾▸]/g, '').replace(/\s+/g, ' ').trim();
    return t || fb;
  }
  function isActive(el) {
    if (!el) return false;
    var pg = el.getAttribute('data-page');
    if (pg) { var p = document.getElementById('page-' + pg); if (p) return p.classList.contains('active'); }
    return el.classList.contains('active');
  }
  function collect() {
    var list = [];
    var subs = [
      ['#nav-assets-list', '🧱', 'Aset Tetap'], ['#nav-valuation', '💰', 'Valuation Stock']
    ].map(function (d) { var el = navEl(d[0]); return { el: el, icon: d[1], label: labelOf(el, d[2]) }; })
      .filter(function (x) { return x.el && visible(x.el); });
    var parent = navEl('#nav-assets');
    var top = [
      ['a[data-page="dashboard"]', '📊', 'Dashboard'],
      ['ASET'],
      ['#nav-transfer', '🔁', 'Transfer'],
      ['a[data-page="ba"]', '📄', 'Berita Acara'],
      ['a[data-page="scan"]', '📷', 'Scan QR'],
      ['a[data-page="report"]', '📑', 'Report'],
      ['a[data-page="settings"]', '⚙️', 'Settings']
    ];
    top.forEach(function (d) {
      if (d[0] === 'ASET') {
        if (!subs.length || (parent && !visible(parent) && subs.length > 1)) return;
        if (subs.length === 1) { list.push({ kind: 'nav', el: subs[0].el, icon: subs[0].icon, label: subs[0].label, active: isActive(subs[0].el) }); return; }
        list.push({ kind: 'group', icon: '🏷️', label: 'Aset', subs: subs, active: subs.some(function (s) { return isActive(s.el); }) });
        return;
      }
      var el = navEl(d[0]);
      if (!el || !visible(el)) return;
      var lb = d[2];
      if (d[0].indexOf('report') >= 0 || d[0].indexOf('settings') >= 0) lb = labelOf(el, d[2]);
      list.push({ kind: 'nav', el: el, icon: d[1], label: lb, active: isActive(el) });
    });
    // utilitas (ring luar bawah)
    var util = [];
    var pm = navEl('#nav-present-monkey');
    if (pm && visible(pm)) {
      var ic = $('#nav-monkey-icon', pm), lbm = $('#nav-monkey-label', pm);
      util.push({ kind: 'nav', el: pm, icon: (ic && ic.textContent.trim()) || '🙉', label: (lbm && lbm.textContent.trim()) || 'Presentasi', util: true, keepOpen: true });
    }
    util.push({ kind: 'classic', icon: '🗂️', label: 'Sidebar klasik', util: true });
    util.push({ kind: 'logout', icon: '🚪', label: 'Logout', util: true });
    return { top: list, util: util };
  }

  /* ---- geometri ---- */
  function geo() {
    var vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
    var k = Math.min(1,
      (0.42 * vh) / BASE_R,
      (vw - 8) / (BASE_R2 + SUB / 2 + 4),
      (vh / 2 - 6) / (BASE_R * Math.sin(72 * D2R) + BTN / 2));
    k = Math.max(k, 0.55);
    return { k: k, R: BASE_R * k, R2: BASE_R2 * k, cy: vh / 2, vw: vw, vh: vh };
  }
  function angles(n, a0, a1) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(n === 1 ? (a0 + a1) / 2 : a0 + (a1 - a0) * i / (n - 1));
    return out;
  }

  function makeBtn(it, size, cls, k) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'pr-btn' + (cls ? ' ' + cls : '') + (it.active ? ' active' : '');
    b.setAttribute('role', 'menuitem'); b.setAttribute('tabindex', '-1');
    b.setAttribute('aria-label', it.label);
    var s = size * k;
    b.style.width = b.style.height = s + 'px';
    b.innerHTML = '<span class="ic" style="font-size:' + (s * 0.3) + 'px">' + esc(it.icon) + '</span><span class="lb" style="font-size:' + Math.max(8, s * 0.128) + 'px">' + esc(it.label) + '</span>';
    b.onclick = function (ev) { ev.stopPropagation(); activate(it, b); };
    layer.appendChild(b);
    it.btn = b;
    return b;
  }
  function place(b, r, deg, delay, show, origin) {
    var x = r * Math.cos(deg * D2R), y = -r * Math.sin(deg * D2R);
    b._x = x; b._y = y;
    b.style.transitionDelay = show ? (delay + 's, ' + delay + 's, 0s, 0s') : '';
    b.style.transform = show ? 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px) scale(1)' : 'translate(-50%,-50%) translate(' + (origin ? origin[0] : 0) + 'px,' + (origin ? origin[1] : 0) + 'px) scale(.2)';
    b.classList.toggle('show', !!show);
  }

  function layout() {
    var g = geo(), top = items.top, n = top.length;
    // jarak minimum antar tombol: kalau terlalu rapat, perlebar busur sampai ±80°
    var span = 72, need = (BTN * g.k + 6) * (n - 1) / g.R / D2R / 2;
    if (need > span) span = Math.min(82, need);
    var A = angles(n, span, -span);
    top.forEach(function (it, i) { it.ang = A[i]; place(it.btn, g.R, A[i], i * 0.05, true); });
    // utilitas di ring luar bagian bawah
    var lo = -Math.min(74, maxAng(g, g.R2 * 0.97, UTIL * g.k / 2)), nu = items.util.length;
    var U = angles(nu, lo + 14 * (nu - 1), lo);
    items.util.forEach(function (it, i) { place(it.btn, g.R2 * 0.97, U[i], 0.18 + i * 0.05, true); });
    layoutSub(g);
  }
  function layoutSub(g) {
    g = g || geo();
    top0().forEach(function (grp) {
      var m = grp.subs.length, step = 13;
      var c = Math.min(grp.ang, 62, maxAng(g, g.R2, SUB * g.k / 2) - step * (m - 1) / 2);
      var A = angles(m, c + step * (m - 1) / 2, c - step * (m - 1) / 2);
      grp.subs.forEach(function (s, i) { place(s.btn, g.R2, A[i], subOpen ? i * 0.07 : 0, subOpen, [grp.btn._x || 0, grp.btn._y || 0]); });
      grp.btn.classList.toggle('grp-open', subOpen);
      grp.btn.setAttribute('aria-expanded', subOpen ? 'true' : 'false');
    });
  }
  /* sudut maksimum (derajat) supaya tombol berjari-jari r tetap di dalam layar secara vertikal */
  function maxAng(g, r, half) {
    var v = (g.cy - half - 4) / r;
    return v >= 1 ? 90 : Math.asin(Math.max(0, v)) / D2R;
  }
  function top0() { return (items.top || []).filter(function (x) { return x.kind === 'group'; }); }

  function caption() {
    var s = null; try { s = window.PATATAS_AUTH && window.PATATAS_AUTH.session(); } catch (e) {}
    s = s || {};
    var role = s.role === 'outlet' ? ('OUTLET: ' + (s.outletCode || '')) : (s.appRole || '');
    cap.innerHTML = '<b>' + esc(s.username || '—') + '</b><span>' + esc(role) + '</span>';
  }

  function openMenu() {
    if (!loggedIn()) return;
    clearTimeout(closeTimer);
    layer.innerHTML = '';
    items = collect();
    var g = geo();
    items.top.forEach(function (it) {
      makeBtn(it, BTN, '', g.k);
      if (it.kind === 'group') it.subs.forEach(function (s) { s.active = isActive(s.el); s.kind = 'nav'; makeBtn(s, SUB, 'sub', g.k); });
    });
    items.util.forEach(function (it) { makeBtn(it, UTIL, 'util' + (it.kind === 'logout' ? ' logout' : ''), g.k); });
    caption();
    open = true; subOpen = false;
    root.classList.add('open');
    hub.innerHTML = '✕<small>tutup</small>'; hub.setAttribute('aria-expanded', 'true'); hub.setAttribute('aria-label', 'Tutup menu');
    // render posisi awal dulu, lalu animasi keluar
    void layer.offsetWidth;
    requestAnimationFrame(function () { layout(); var f = focusables()[0]; if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 60); });
  }
  function closeMenu(cb) {
    if (!open) { if (cb) cb(); return; }
    open = false;
    var all = Array.prototype.slice.call(layer.querySelectorAll('.pr-btn'));
    all.reverse().forEach(function (b, i) { b.style.transitionDelay = (i * 0.02) + 's'; b.style.transform = 'translate(-50%,-50%) translate(0px,0px) scale(.2)'; b.classList.remove('show'); });
    root.classList.remove('open');
    hub.innerHTML = 'P<small>menu</small>'; hub.setAttribute('aria-expanded', 'false'); hub.setAttribute('aria-label', 'Buka menu');
    subOpen = false;
    closeTimer = setTimeout(function () { if (!open) layer.innerHTML = ''; }, 600);
    if (cb) cb();
  }
  function activate(it, b) {
    if (it.kind === 'group') { subOpen = !subOpen; layoutSub(); if (subOpen) setTimeout(function () { try { it.subs[0].btn.focus({ preventScroll: true }); } catch (e) {} }, 120); return; }
    if (it.kind === 'logout') { closeMenu(); if (typeof window.doLogout === 'function') window.doLogout(); return; }
    if (it.kind === 'classic') { closeMenu(); setMode('classic'); return; }
    if (it.keepOpen) {
      try { it.el.click(); } catch (e) {}
      setTimeout(function () { var lbm = $('#nav-monkey-label', it.el), ic = $('#nav-monkey-icon', it.el);
        if (lbm) b.querySelector('.lb').textContent = lbm.textContent.trim(); if (ic) b.querySelector('.ic').textContent = ic.textContent.trim(); }, 50);
      return;
    }
    closeMenu();
    try { it.el.click(); } catch (e) { console.warn('radial nav', e); }
  }
  function focusables() { return Array.prototype.slice.call(layer.querySelectorAll('.pr-btn.show')); }
  function onKey(e) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (subOpen) { subOpen = false; layoutSub(); var g0 = top0()[0]; if (g0) g0.btn.focus(); return; }
      closeMenu(); try { hub.focus(); } catch (x) {}
      return;
    }
    var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (keys[e.key] || e.key === 'Tab') {
      var f = focusables(); if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      var d = e.key === 'Tab' ? (e.shiftKey ? -1 : 1) : keys[e.key];
      e.preventDefault();
      f[(i + d + f.length) % f.length].focus();
    }
  }

  /* ---- mode klasik / radial ---- */
  function ensureBackLink() {
    if (document.getElementById('nav-radial-back')) return;
    var box = document.querySelector('#sidebar .user-box');
    if (!box) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'nav-radial-back'; b.className = 'btn btn-outline';
    b.title = 'Kembali ke menu radial';
    b.style.cssText = 'width:100%;font-size:.75rem;padding:.4rem;margin-top:.75rem';
    b.textContent = '◔ Menu Radial';
    b.onclick = function (e) { e.preventDefault(); setMode('radial'); };
    var lo = box.querySelector('button[onclick*="doLogout"]');
    var holder = lo && lo.parentNode;
    if (holder && holder.parentNode === box) box.insertBefore(b, holder); else box.appendChild(b);
  }
  function applyMode() {
    if (!document.body) return;
    build(); ensureBackLink();
    var r = mode() === 'radial';
    document.body.classList.toggle('nav-radial', r);
    if (!r && open) closeMenu();
    var sb = document.getElementById('sidebar'); if (r && sb) sb.classList.remove('open');
  }
  function boot() {
    if (!document.body || !document.getElementById('sidebar')) { setTimeout(boot, 200); return; }
    applyMode();
    // sesi/hak akses berubah -> tutup menu (dibangun ulang saat dibuka lagi)
    document.addEventListener('patatas-auth', function () { if (open) closeMenu(); applyMode(); });
    try {
      new MutationObserver(function () { if (!loggedIn() && open) closeMenu(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }
  window.PATATAS_RADIAL = { open: function () { openMenu(); }, close: function () { closeMenu(); }, setMode: setMode, mode: mode };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
