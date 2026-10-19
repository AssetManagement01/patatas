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
  function canEdit() {
    try { if (window.baIsAdmin && window.baIsAdmin()) return true; } catch (e) {}
    return !!window.USER_CAN_EDIT;
  }
  function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function apiUrl() { return (window.API_URL || '').replace(/\/$/, ''); }
  var STATUSES = ['Done', 'Permintaan', 'Tahap Penawaran', 'Sedang Proses', 'Tolak'];
  function showEdit(r) {
    if (!r || !canEdit()) return;
    var old = document.getElementById('ba2-edit-modal');
    if (old) old.remove();
    var inp = 'width:100%;box-sizing:border-box;padding:0.5rem;border:1px solid #cbd5e1;border-radius:8px;font-size:1rem;background:#fff';
    var lb = 'display:block;font-size:0.7rem;color:#64748b;font-weight:600;margin:0.55rem 0 0.2rem';
    function f(label, id, val, type, extra) {
      return '<label style="'+lb+'" for="'+id+'">'+label+'</label><input id="'+id+'" type="'+(type||'text')+'" value="'+esc(val)+'" '+(extra||'')+' style="'+inp+'"/>';
    }
    function locField(v) {
      var src = document.getElementById('ba2-loc');
      if (!src || src.tagName !== 'SELECT') return f('Lokasi', 'ba2e-loc', v);
      var vals = [].slice.call(src.options).map(function (o) { return o.value; }).filter(function (x) { return x; });
      if (v && vals.indexOf(v) < 0) vals.unshift(v);
      return '<label style="'+lb+'" for="ba2e-loc">Lokasi</label><select id="ba2e-loc" style="'+inp+'">' +
        vals.map(function (o) { return '<option value="'+esc(o)+'"'+(o===v?' selected':'')+'>'+esc(o)+'</option>'; }).join('') + '</select>';
    }
    var st = r.status || 'Done';
    var opts = STATUSES.slice();
    if (opts.indexOf(st) < 0) opts.push(st);
    var wrap = document.createElement('div');
    wrap.id = 'ba2-edit-modal';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
    wrap.innerHTML =
      '<div style="background:#fff;border-radius:14px;max-width:440px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,.25)">' +
      '<div style="padding:0.85rem 1rem;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0b4f37">✏️ Edit Kas Masuk</div>' +
      '<form id="ba2-edit-form" style="padding:0.25rem 1rem 1rem;overflow:auto">' +
      f('Tanggal', 'ba2e-date', r.date, 'date') +
      f('Nama barang', 'ba2e-name', r.name) +
      locField(r.loc) +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem">' +
      '<div>' + f('Qty', 'ba2e-qty', r.qty, 'number', 'min="0" step="any"') + '</div>' +
      '<div>' + f('Uom', 'ba2e-uom', r.uom) + '</div>' +
      '<div>' + f('Price', 'ba2e-price', r.price, 'number', 'min="0" step="any"') + '</div>' +
      '</div>' +
      '<div id="ba2e-total" style="font-size:0.8rem;color:#0b4f37;font-weight:700;margin-top:0.4rem"></div>' +
      f('Keterangan', 'ba2e-note', r.keterangan) +
      f('Bukti foto/PDF (link, opsional)', 'ba2e-foto', r.foto || r.photo || '') +
      '<label style="'+lb+'" for="ba2e-status">Status</label><select id="ba2e-status" style="'+inp+'">' +
      opts.map(function (o) { return '<option value="'+esc(o)+'"'+(o===st?' selected':'')+'>'+esc(o)+'</option>'; }).join('') + '</select>' +
      '<div id="ba2e-msg" style="font-size:0.78rem;color:#b91c1c;margin-top:0.5rem;min-height:1em"></div>' +
      '<div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:0.5rem">' +
      '<button type="button" id="ba2e-cancel" style="padding:0.5rem 1rem;background:#fff;color:#334155;border:1px solid #cbd5e1;border-radius:8px;font-weight:600;cursor:pointer">Batal</button>' +
      '<button type="submit" id="ba2e-save" style="padding:0.5rem 1rem;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Simpan Perubahan</button>' +
      '</div></form></div>';
    document.body.appendChild(wrap);
    function g(id) { return document.getElementById(id); }
    function upd() { var t = (parseFloat(g('ba2e-qty').value) || 0) * (parseFloat(g('ba2e-price').value) || 0); g('ba2e-total').textContent = 'Total: ' + fmt(t); }
    g('ba2e-qty').oninput = upd; g('ba2e-price').oninput = upd; upd();
    function tutup() { wrap.remove(); }
    wrap.addEventListener('click', function (e) { if (e.target === wrap) tutup(); });
    g('ba2e-cancel').onclick = tutup;
    g('ba2-edit-form').onsubmit = function (e) {
      e.preventDefault();
      var msg = g('ba2e-msg');
      var qty = parseFloat(g('ba2e-qty').value) || 0, price = parseFloat(g('ba2e-price').value) || 0;
      var nr = {
        date: g('ba2e-date').value || r.date, name: g('ba2e-name').value.trim(), loc: g('ba2e-loc').value.trim(),
        qty: qty, uom: g('ba2e-uom').value.trim() || 'PCS', price: price, total: qty * price,
        keterangan: g('ba2e-note').value.trim(), foto: g('ba2e-foto').value.trim(), status: g('ba2e-status').value
      };
      if (!nr.name || !nr.loc || !nr.keterangan) { msg.textContent = 'Nama, Lokasi, dan Keterangan wajib diisi'; return false; }
      var url = apiUrl();
      if (!url) { msg.textContent = 'API belum terhubung'; return false; }
      var btn = g('ba2e-save'); btn.disabled = true; btn.textContent = 'Menyimpan...'; msg.textContent = '';
      function txt(v) { return String(v == null ? '' : v).trim(); }
      function num(v) { return Number(v) || 0; }
      var oldSt = txt(r.status) || 'Done';
      var statusChanged = txt(nr.status) !== oldSt;
      var otherChanged = txt(nr.date) !== txt(r.date) || txt(nr.name) !== txt(r.name) || txt(nr.loc) !== txt(r.loc) ||
        num(nr.qty) !== num(r.qty) || txt(nr.uom) !== (txt(r.uom) || 'PCS') || num(nr.price) !== num(r.price) ||
        txt(nr.keterangan) !== txt(r.keterangan) || txt(nr.foto) !== txt(r.foto || r.photo);
      function post(obj) {
        return fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(obj) })
          .then(function (res) { return res.text(); })
          .then(function (t) { var d = null; try { d = JSON.parse(t); } catch (x) {} return d; });
      }
      function errOf(d) {
        if (!d) return '';
        if (d.ok === false || d.success === false || String(d.status || '').toLowerCase() === 'error' || (d.error && !d.ok)) return String(d.error || d.message || 'Gagal');
        return '';
      }
      function applyLocal(fields) {
        var list = window.__ba2MasukList || [];
        for (var i = 0; i < list.length; i++) if (list[i].id === r.id) { for (var k in fields) list[i][k] = fields[k]; }
        try { localStorage.setItem('patatas_ba2_v1', JSON.stringify(list)); } catch (x) {}
        paint();
      }
      function fail(em) {
        msg.style.color = '#b91c1c';
        msg.textContent = 'Gagal simpan: ' + em;
        btn.disabled = false; btn.textContent = 'Simpan Perubahan';
      }
      // Status saja -> action lama updateBA2Status (sudah ada di server, tanpa deploy)
      function saveStatus() {
        return post({ action: 'updateBA2Status', id: r.id, status: nr.status, catatanStatus: '', by: window.USER_EMAIL || '' })
          .then(function (d) { var e = errOf(d); if (e) throw new Error(e); });
      }
      if (!statusChanged && !otherChanged) { tutup(); return false; }
      if (statusChanged && !otherChanged) {
        saveStatus().then(function () {
          applyLocal({ status: nr.status }); tutup(); setTimeout(load, 1500);
        }).catch(function (err) { fail(err && err.message || err); });
        return false;
      }
      var body = {
        action: 'updateBA2', id: r.id, sheet: 'BA2', by: window.USER_EMAIL || '',
        date: nr.date, name: nr.name, nama: nr.name, loc: nr.loc, qty: nr.qty, uom: nr.uom, price: nr.price, total: nr.total,
        keterangan: nr.keterangan, foto: nr.foto, status: nr.status,
        // data lama: server memastikan baris yang diubah memang baris ini
        orig: { date: r.date, name: r.name, loc: r.loc, qty: r.qty, price: r.price, keterangan: r.keterangan }
      };
      post(body).then(function (d) {
        if (d && d.ok) { applyLocal(nr); tutup(); setTimeout(load, 1500); return; }
        var em = (d && (d.error || d.message)) || 'Respon server tidak valid';
        if (!/tidak dikenali|unknown action|tidak dikenal/i.test(em)) { fail(em); return; }
        var need = 'Perubahan selain Status (tanggal/nama/lokasi/qty/uom/price/keterangan/foto) BELUM tersimpan: server Apps Script belum mendukung edit (action updateBA2). Deploy versi baru Code.gs dulu.';
        if (!statusChanged) { fail(need); return; }
        saveStatus().then(function () {
          applyLocal({ status: nr.status });
          msg.style.color = '#92400e';
          msg.textContent = 'Status tersimpan (' + nr.status + '). ' + need;
          btn.disabled = false; btn.textContent = 'Simpan Perubahan';
          setTimeout(load, 1500);
        }).catch(function (err) { fail('status juga gagal: ' + (err && err.message || err) + '. ' + need); });
      }).catch(function (err) { fail(err && err.message || err); });
      return false;
    };
  }
  function paint() {
    var tb = document.getElementById('ba2-table-body');
    if (!tb) return;
    var list = filt(window.__ba2MasukList || window.__ba2LastList || []).sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9';
    tb.innerHTML = list.length ? list.map(function (r, i) {
      var tot = Number(r.total) || ((Number(r.price) || 0) * (Number(r.qty) || 0));
      var st = r.status || 'Done';
      var badge = window.baStatusBadge ? window.baStatusBadge(st) : st;
      var has = !!(r.foto || r.photo);
      var eye = has
        ? '<button type="button" class="ba2-eye" data-i="'+i+'" title="Lihat foto" style="width:32px;height:32px;border:none;background:transparent;color:#0b4f37;font-size:1.15rem;cursor:pointer;line-height:1;vertical-align:middle">◎</button>'
        : '<span style="display:inline-block;width:32px"></span>';
      var edit = (canEdit() && /^BA2ROW\d+$/.test(String(r.id || '')))
        ? '<button type="button" class="ba2-edit" data-i="'+i+'" title="Edit Kas Masuk" aria-label="Edit" style="width:32px;height:32px;border:none;background:transparent;font-size:1rem;cursor:pointer;line-height:1;vertical-align:middle">✏️</button>'
        : '';
      var aksi = edit ? eye + edit : (has ? eye : '<span style="color:#94a3b8">-</span>');
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+fmt(r.price)+'</td><td style="'+td+'">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+';white-space:nowrap">'+badge+'</td><td style="'+td+';white-space:nowrap">'+aksi+'</td></tr>';
    }).join('') : '<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
    window.__ba2Painted = list;
  }
  document.addEventListener('click', function (ev) {
    var ed = ev.target && ev.target.closest && ev.target.closest('.ba2-edit');
    if (ed) {
      ev.preventDefault();
      ev.stopPropagation();
      showEdit((window.__ba2Painted || [])[Number(ed.getAttribute('data-i'))]);
      return;
    }
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
      window.__ba2MasukList = out; // salinan sendiri (ba-pdf.js menimpa __ba2LastList tanpa id baris)
      try { localStorage.setItem('patatas_ba2_v1', JSON.stringify(out)); } catch (e) {}
      paint();
    };
    var s = document.createElement('script');
    s.src = 'https://docs.google.com/spreadsheets/d/' + SID + '/gviz/tq?sheet=BA2&tqx=out:json;responseHandler:patatasBA2&_=' + Date.now();
    document.body.appendChild(s);
  }
  window.baMasukReload = load;
  load();
  setInterval(function () { if (document.getElementById('ba2-table-body') && window.__ba2LastList) paint(); }, 1500);
})();
