/* Edit baris Kas Keluar (BA) — tombol ✏️ per baris. Server: action updateBA (cek outlet di server). */
(function () {
  if (!document.getElementById('ba-aksi-css-inline')) {
    var st = document.createElement('style'); st.id = 'ba-aksi-css-inline';
    st.textContent = '#page-ba #ba-table-body td:last-child,#page-ba #ba2-table-body td:last-child,td.ba-aksi-cell{white-space:nowrap!important;vertical-align:middle!important;min-width:220px!important}'
      + '#page-ba #ba-table-body td:last-child>*,#page-ba #ba2-table-body td:last-child>*,.ba-aksi{display:inline-flex!important;flex-wrap:nowrap!important;flex-direction:row!important;align-items:center!important;gap:.35rem!important;white-space:nowrap!important}'
      + '#page-ba #ba-table-body td:last-child br,#page-ba #ba2-table-body td:last-child br,.ba-aksi br{display:none!important}'
      + '#page-ba #ba-table-body td:last-child button,#page-ba #ba2-table-body td:last-child button,.ba-aksi button{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:28px!important;margin:0!important;flex:0 0 auto!important;float:none!important;white-space:nowrap!important}'
      + '#page-ba #ba-table-body td:last-child .ba-edit-btn,#page-ba #ba-table-body td:last-child .ba2-edit,#page-ba #ba-table-body td:last-child .ba2-eye,#page-ba #ba2-table-body td:last-child .ba-edit-btn,#page-ba #ba2-table-body td:last-child .ba2-edit,#page-ba #ba2-table-body td:last-child .ba2-eye,.ba-aksi .ba-edit-btn,.ba-aksi .ba2-edit,.ba-aksi .ba2-eye{width:28px!important;padding:0!important;border:none!important;background:transparent!important}'
      + '#page-ba table{min-width:980px}';
    document.head.appendChild(st);
  }
  if (!document.getElementById('ba-aksi-css')) {
    var l = document.createElement('link'); l.id = 'ba-aksi-css'; l.rel = 'stylesheet'; l.href = 'ba-aksi.css?v=2'; document.head.appendChild(l);
  }
  function tidyAksiCell(td) {
    if (!td) return;
    td.classList.add('ba-aksi-cell');
    td.style.whiteSpace = 'nowrap'; td.style.verticalAlign = 'middle'; td.style.minWidth = '220px';
    Array.prototype.forEach.call(td.querySelectorAll('br'), function (b) { b.remove(); });
    var btns = Array.prototype.slice.call(td.querySelectorAll('button, .ba-edit-btn, .ba2-edit, .ba2-eye'));
    if (!btns.length) return;
    var wrap = td.querySelector(':scope > .ba-aksi');
    if (!wrap) {
      wrap = document.createElement('span');
      wrap.className = 'ba-aksi';
      wrap.style.cssText = 'display:inline-flex;flex-wrap:nowrap;align-items:center;gap:0.35rem;white-space:nowrap';
      while (td.firstChild) wrap.appendChild(td.firstChild);
      td.appendChild(wrap);
    } else {
      // pindahkan tombol yang di luar wrap ke dalam
      btns.forEach(function (b) { if (!wrap.contains(b)) wrap.appendChild(b); });
      wrap.style.display = 'inline-flex'; wrap.style.flexWrap = 'nowrap'; wrap.style.alignItems = 'center'; wrap.style.gap = '0.35rem'; wrap.style.whiteSpace = 'nowrap';
    }
  }
  function tidyAllAksi() {
    ['ba-table-body', 'ba2-table-body'].forEach(function (id) {
      var tb = document.getElementById(id); if (!tb) return;
      Array.prototype.forEach.call(tb.querySelectorAll('tr'), function (tr) {
        var td = tr.cells && tr.cells[tr.cells.length - 1];
        if (td) tidyAksiCell(td);
      });
    });
  }
  if (!window.__baAksiObs) {
    window.__baAksiObs = true;
    var run = function () { try { tidyAllAksi(); } catch (e) {} };
    setInterval(run, 800);
    if (document.body) {
      new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
      });
    }
  }
  function sess() { try { return JSON.parse(localStorage.getItem('patatas_asset_session') || 'null') || {}; } catch (e) { return {}; } }
  function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function isOutlet() { return String(sess().role || '').toLowerCase() === 'outlet'; }
  function canEditRow(r) {
    var s = sess(), m = (s.perms && s.perms.m) || {};
    if (!(m.ba === 2) || !r || !/^BAROW\d+$/.test(String(r.id || ''))) return false;
    if (!isOutlet()) return true;
    return String(r.loc || '').trim().toLowerCase() === String(s.outletName || '').trim().toLowerCase();
  }
  window.baCanEditRow = canEditRow;
  function btn(r) {
    if (!canEditRow(r)) return '';
    return '<button type="button" class="ba-edit-btn" data-ba-edit="' + esc(r.id) + '" title="Edit Kas Keluar" aria-label="Edit">✏️</button>';
  }
  function hook() {
    var f = window.baAdminButtons;
    if (f && f._edit) return;
    var w = function (r) {
      var a = ''; try { a = f ? f(r) : ''; } catch (e) {}
      a = String(a || '').replace(/^\s*<span class="ba-aksi">([\s\S]*)<\/span>\s*$/, '$1');
      return '<span class="ba-aksi" style="display:inline-flex;flex-wrap:nowrap;align-items:center;gap:0.35rem;white-space:nowrap">' + btn(r) + a + '</span>';
    };
    w._edit = true; window.baAdminButtons = w;
  }
  hook(); setInterval(hook, 700);
  function findRow(id) { var L = window.__baLastList || []; for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i]; return null; }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-ba-edit]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    showEdit(findRow(b.getAttribute('data-ba-edit')));
  }, true);
  function showEdit(r) {
    if (!r || !canEditRow(r)) return;
    var old = document.getElementById('ba-edit-modal'); if (old) old.remove();
    var inp = 'width:100%;box-sizing:border-box;padding:0.5rem;border:1px solid #cbd5e1;border-radius:8px;font-size:1rem;background:#fff';
    var lb = 'display:block;font-size:0.7rem;color:#64748b;font-weight:600;margin:0.55rem 0 0.2rem';
    function f(label, id, val, type, extra) { return '<label style="' + lb + '" for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val) + '" ' + (extra || '') + ' style="' + inp + '"/>'; }
    var locHtml;
    var src = document.getElementById('ba-loc');
    if (isOutlet() || !src || src.tagName !== 'SELECT') {
      locHtml = f('Lokasi', 'bae-loc', r.loc, 'text', isOutlet() ? 'readonly title="Lokasi tidak bisa diubah akun outlet"' : '');
    } else {
      var vals = [].slice.call(src.options).map(function (o) { return o.value; }).filter(Boolean);
      if (r.loc && vals.indexOf(r.loc) < 0) vals.unshift(r.loc);
      locHtml = '<label style="' + lb + '" for="bae-loc">Lokasi</label><select id="bae-loc" style="' + inp + '">' + vals.map(function (o) { return '<option value="' + esc(o) + '"' + (o === r.loc ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    }
    var wrap = document.createElement('div'); wrap.id = 'ba-edit-modal';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
    wrap.innerHTML = '<div style="background:#fff;border-radius:14px;max-width:440px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,.25)">' +
      '<div style="padding:0.85rem 1rem;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0b4f37">✏️ Edit Kas Keluar</div>' +
      '<form id="ba-edit-form" style="padding:0.25rem 1rem 1rem;overflow:auto">' +
      f('Tanggal', 'bae-date', r.date, 'date') + f('Nama barang', 'bae-name', r.name) + locHtml +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem"><div>' + f('Qty', 'bae-qty', r.qty, 'number', 'min="0" step="any"') + '</div><div>' + f('Uom', 'bae-uom', r.uom) + '</div><div>' + f('Price', 'bae-price', r.price, 'number', 'min="0" step="any"') + '</div></div>' +
      '<div id="bae-total" style="font-size:0.8rem;color:#0b4f37;font-weight:700;margin-top:0.4rem"></div>' +
      f('Keterangan', 'bae-note', r.keterangan) + f('Bukti foto/PDF (link, opsional)', 'bae-foto', r.foto || '') +
      '<div id="bae-msg" style="font-size:0.78rem;color:#b91c1c;margin-top:0.5rem;min-height:1em"></div>' +
      '<div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:0.5rem"><button type="button" id="bae-cancel" style="padding:0.5rem 1rem;background:#fff;color:#334155;border:1px solid #cbd5e1;border-radius:8px;font-weight:600;cursor:pointer">Batal</button>' +
      '<button type="submit" id="bae-save" style="padding:0.5rem 1rem;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Simpan Perubahan</button></div></form></div>';
    document.body.appendChild(wrap);
    function g(id) { return document.getElementById(id); }
    function upd() { g('bae-total').textContent = 'Total: ' + fmt((parseFloat(g('bae-qty').value) || 0) * (parseFloat(g('bae-price').value) || 0)); }
    g('bae-qty').oninput = upd; g('bae-price').oninput = upd; upd();
    function tutup() { wrap.remove(); }
    wrap.addEventListener('click', function (e) { if (e.target === wrap) tutup(); });
    g('bae-cancel').onclick = tutup;
    g('ba-edit-form').onsubmit = function (e) {
      e.preventDefault();
      var msg = g('bae-msg'), b = g('bae-save');
      var qty = parseFloat(g('bae-qty').value) || 0, price = parseFloat(g('bae-price').value) || 0;
      var nr = { date: g('bae-date').value || r.date, name: g('bae-name').value.trim(), qty: qty, uom: g('bae-uom').value.trim() || 'PCS', price: price, total: qty * price, keterangan: g('bae-note').value.trim(), foto: g('bae-foto').value.trim() };
      if (!isOutlet()) nr.loc = g('bae-loc').value.trim();
      if (!nr.name) { msg.textContent = 'Nama wajib diisi'; return false; }
      var url = (window.API_URL || '').replace(/\/$/, '');
      if (!url) { msg.textContent = 'API belum terhubung'; return false; }
      b.disabled = true; b.textContent = 'Menyimpan...'; msg.textContent = '';
      var body = { action: 'updateBA', id: r.id, by: window.USER_EMAIL || '', date: nr.date, name: nr.name, qty: nr.qty, uom: nr.uom, price: nr.price, keterangan: nr.keterangan, foto: nr.foto,
        orig: { date: r.date, name: r.name, loc: r.loc, qty: r.qty, price: r.price } };
      if (nr.loc !== undefined) body.loc = nr.loc;
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
        .then(function (res) { return res.json(); })
        .then(function (d) {
          if (d && d.ok) {
            for (var k in nr) r[k] = nr[k];
            try { localStorage.setItem('patatas_ba_v1', JSON.stringify(window.__baLastList || [])); } catch (x) {}
            if (window.baRenderTable) window.baRenderTable(window.__baLastList);
            tutup(); if (window.PATATAS_AUTH && PATATAS_AUTH.toast) PATATAS_AUTH.toast('Kas Keluar tersimpan');
            return;
          }
          throw new Error((d && (d.error || d.message)) || 'Respon server tidak valid');
        })
        .catch(function (err) { msg.textContent = 'Gagal simpan: ' + (err && err.message || err); b.disabled = false; b.textContent = 'Simpan Perubahan'; });
      return false;
    };
  }
})();
