window.switchBaKas = function (which) {
  var keluar = document.getElementById('ba-panel-keluar');
  var masuk = document.getElementById('ba-panel-masuk');
  var b1 = document.getElementById('tab-kas-keluar');
  var b2 = document.getElementById('tab-kas-masuk');
  if (!keluar || !masuk) return;
  var isIn = which === 'masuk';
  keluar.style.display = isIn ? 'none' : '';
  masuk.style.display = isIn ? '' : 'none';
  if (b1) { b1.className = isIn ? 'btn btn-outline' : 'btn btn-primary'; }
  if (b2) { b2.className = isIn ? 'btn btn-primary' : 'btn btn-outline'; }
  if (isIn && window.ba2Render) window.ba2Render();
};

(function () {
  if (window.__ba2Ready) return;
  var KEY = 'patatas_ba2_v1';
  function apiUrl() { return (window.API_URL || '').replace(/\/$/, ''); }
  function localLoad() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function localSave(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function namesList() {
    var arr = [];
    try {
      (window.uniqueData || []).forEach(function (it) {
        var n = String(it.name || it.nama || '').trim();
        if (n && arr.indexOf(n) < 0) arr.push(n);
      });
    } catch (e) {}
    return arr.sort();
  }

  function inject() {
    var page = document.getElementById('page-ba');
    if (!page || document.getElementById('ba-kas-tabs')) return;

    var tabs = document.createElement('div');
    tabs.id = 'ba-kas-tabs';
    tabs.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem';
    tabs.innerHTML =
      '<button type="button" id="tab-kas-keluar" class="btn btn-primary" style="font-size:0.85rem" onclick="window.switchBaKas(\'keluar\')">Kas Keluar</button>' +
      '<button type="button" id="tab-kas-masuk" class="btn btn-outline" style="font-size:0.85rem" onclick="window.switchBaKas(\'masuk\')">Kas Masuk</button>';

    var keluar = document.createElement('div');
    keluar.id = 'ba-panel-keluar';
    while (page.firstChild) keluar.appendChild(page.firstChild);

    var h = keluar.querySelector('h3');
    if (h) h.textContent = 'Form Kas Keluar';
    var p = keluar.querySelector('p');
    if (p && /Catat permintaan/i.test(p.textContent || '')) {
      p.innerHTML = 'Pengeluaran untuk maintenance / perbaikan. Item dari Aset Tetap atau ketik manual. Status awal: <b>Permintaan</b>.';
    }

    var masuk = keluar.cloneNode(true);
    masuk.id = 'ba-panel-masuk';
    masuk.style.display = 'none';
    masuk.querySelectorAll('[id]').forEach(function (el) {
      el.id = 'm-' + el.id;
    });

    var h2 = masuk.querySelector('h3');
    if (h2) h2.textContent = 'Form Kas Masuk';
    var p2 = masuk.querySelector('p');
    if (p2) p2.innerHTML = 'Penjualan barang bekas (minyak goreng bekas, galon bekas, dll). Nama dari Aset Tetap atau ketik manual. Status awal: <b>Permintaan</b>.';

    var form = masuk.querySelector('form');
    if (form) {
      form.id = 'ba2-form';
      form.removeAttribute('onsubmit');
    }
    var btn = masuk.querySelector('button[type="submit"]');
    if (btn) btn.textContent = 'Simpan Kas Masuk';

    var itemLab = null;
    masuk.querySelectorAll('label').forEach(function (lb) {
      if (/Item \(SKU/i.test(lb.textContent || '')) itemLab = lb;
    });
    if (itemLab) {
      itemLab.textContent = 'Nama *';
      var wrap = itemLab.parentNode;
      var keep = itemLab;
      wrap.innerHTML = '';
      wrap.appendChild(keep);
      var inp = document.createElement('input');
      inp.id = 'ba2-name';
      inp.setAttribute('list', 'ba2-name-list');
      inp.required = true;
      inp.placeholder = 'Dari Aset Tetap atau ketik manual';
      inp.style.cssText = 'width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px';
      var dl = document.createElement('datalist');
      dl.id = 'ba2-name-list';
      wrap.appendChild(inp);
      wrap.appendChild(dl);
      var extra = document.createElement('div');
      extra.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-top:0.75rem';
      extra.innerHTML =
        '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">UOM</label><input id="ba2-uom" value="PCS" style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/></div>' +
        '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">Qty *</label><input type="number" id="ba2-qty" min="0" step="any" value="1" required style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/></div>' +
        '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">Price *</label><input type="number" id="ba2-price" min="0" step="any" value="0" required style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/></div>';
      wrap.appendChild(extra);
    }

    var date = masuk.querySelector('#m-ba-date');
    if (date) date.id = 'ba2-date';
    var loc = masuk.querySelector('#m-ba-loc');
    if (loc) loc.id = 'ba2-loc';
    var note = masuk.querySelector('#m-ba-note');
    if (note) { note.id = 'ba2-note'; note.placeholder = 'Contoh: Jual minyak goreng bekas'; }
    var foto = masuk.querySelector('#m-ba-foto');
    if (foto) foto.id = 'ba2-foto';
    var ff = masuk.querySelector('#m-ba-foto-file');
    if (ff) ff.id = 'ba2-foto-file';
    var prev = masuk.querySelector('#m-ba-foto-preview');
    if (prev) prev.id = 'ba2-foto-preview';

    var hist = masuk.querySelectorAll('h3')[1];
    if (hist) hist.textContent = 'Riwayat Kas Masuk';
    var tb = masuk.querySelector('tbody');
    if (tb) tb.id = 'ba2-table-body';
    var ref = masuk.querySelector('button[onclick*="baReload"]');
    if (ref) {
      ref.removeAttribute('onclick');
      ref.onclick = function () { if (window.ba2Reload) window.ba2Reload(); };
    }

    page.appendChild(tabs);
    page.appendChild(keluar);
    page.appendChild(masuk);

    fillNames();
    var dt = document.getElementById('ba2-date');
    if (dt && !dt.value) dt.value = today();
    var f = document.getElementById('ba2-form');
    if (f) f.addEventListener('submit', onSubmit);
    var file = document.getElementById('ba2-foto-file');
    if (file) file.addEventListener('change', onFoto);
    document.addEventListener('click', onAksi, true);
    window.ba2Render();
  }

  function fillNames() {
    var dl = document.getElementById('ba2-name-list');
    if (!dl) return;
    dl.innerHTML = namesList().map(function (n) {
      return '<option value="' + String(n).replace(/"/g, '"') + '">';
    }).join('');
  }

  function onFoto(ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var im = new Image();
      im.onload = function () {
        var maxW = 1280, w = im.width, h = im.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(im, 0, 0, w, h);
        var out = c.toDataURL('image/jpeg', 0.72);
        var hid = document.getElementById('ba2-foto');
        if (hid) hid.value = out;
        var p = document.getElementById('ba2-foto-preview');
        if (p) { p.src = out; p.style.display = 'block'; }
      };
      im.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  function onSubmit(e) {
    e.preventDefault();
    var nameEl = document.getElementById('ba2-name');
    var locEl = document.getElementById('ba2-loc');
    var noteEl = document.getElementById('ba2-note');
    var dateEl = document.getElementById('ba2-date');
    var qtyEl = document.getElementById('ba2-qty');
    var priceEl = document.getElementById('ba2-price');
    var name = nameEl ? (nameEl.value || '').trim() : '';
    var loc = locEl ? (locEl.value || '').trim() : '';
    var note = noteEl ? (noteEl.value || '').trim() : '';
    var date = dateEl && dateEl.value ? dateEl.value : today();
    var qty = qtyEl ? parseFloat(qtyEl.value) || 0 : 0;
    var price = priceEl ? parseFloat(priceEl.value) || 0 : 0;
    if (!name || !loc || !note) { alert('Lengkapi Nama, Lokasi, dan Keterangan'); return false; }
    var row = {
      id: 'BA2' + Date.now(), sheet: 'BA2', jenis: 'Kas Masuk',
      date: date, nama: name, name: name,
      uom: ((document.getElementById('ba2-uom') || {}).value || 'PCS'),
      qty: qty, price: price, total: price * qty,
      keterangan: note, foto: ((document.getElementById('ba2-foto') || {}).value || ''),
      loc: loc, status: 'Permintaan', tglPermintaan: date,
      tglPenawaran: '', tglProses: '', tglSelesai: '', tglTolak: '',
      revisi: 1, diubahOleh: window.USER_EMAIL || '', catatanStatus: '', by: window.USER_EMAIL || ''
    };
    var list = localLoad(); list.unshift(row); localSave(list);
    window.ba2Render(list);
    pushSheet(row);
    var form = document.getElementById('ba2-form');
    if (form) form.reset();
    if (dateEl) dateEl.value = today();
    var pv = document.getElementById('ba2-foto-preview'); if (pv) pv.style.display = 'none';
    var hid = document.getElementById('ba2-foto'); if (hid) hid.value = '';
    return false;
  }

  async function pushSheet(row) {
    var url = apiUrl(); if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveBA2', id: row.id, date: row.date, name: row.name, nama: row.nama,
          uom: row.uom, qty: row.qty, price: row.price, total: row.total,
          keterangan: row.keterangan, foto: row.foto, loc: row.loc, status: row.status,
          tglPermintaan: row.tglPermintaan, revisi: row.revisi, by: row.by, sheet: 'BA2'
        })
      });
    } catch (e) {}
  }

  window.ba2Render = function (list) {
    var tb = document.getElementById('ba2-table-body');
    if (!tb) return;
    list = list || localLoad();
    if (window.baFilterOutlet) list = window.baFilterOutlet(list);
    if (!list.length) {
      tb.innerHTML = '<tr><td colspan="9" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';
      return;
    }
    var td = 'padding:0.45rem;border-bottom:1px solid #f1f5f9;vertical-align:middle';
    tb.innerHTML = list.map(function (r) {
      var badge = window.baStatusBadge ? window.baStatusBadge(r.status) : (r.status || '');
      var aksi = window.baAdminButtons ? window.baAdminButtons(r) : '';
      aksi = String(aksi).replace(/ba-st-btn/g, 'ba2-st-btn').replace(/ba-del-btn/g, 'ba2-del-btn');
      return '<tr>' +
        '<td style="' + td + '">' + (r.date || '') + '</td>' +
        '<td style="' + td + '">' + (r.name || r.nama || '') + '</td>' +
        '<td style="' + td + '">' + (r.loc || '') + '</td>' +
        '<td style="' + td + ';text-align:center">' + (r.qty || 0) + '</td>' +
        '<td style="' + td + ';text-align:right">' + fmt(r.price) + '</td>' +
        '<td style="' + td + ';text-align:right;font-weight:600">' + fmt(r.total || (r.price * r.qty)) + '</td>' +
        '<td style="' + td + '">' + (r.keterangan || '') + '</td>' +
        '<td style="' + td + ';white-space:nowrap">' + badge + '</td>' +
        '<td style="' + td + ';white-space:nowrap">' + aksi + '</td></tr>';
    }).join('');
  };

  window.ba2Reload = async function () {
    var url = apiUrl();
    var local = localLoad();
    if (url) {
      try {
        var res = await fetch(url + '?action=listBA2&_=' + Date.now());
        var data = await res.json();
        if (data && data.ok && Array.isArray(data.items) && data.items.length) {
          var map = {};
          local.forEach(function (x) { map[x.id] = x; });
          data.items.forEach(function (it) { map[it.id || ('BA2' + Math.random())] = it; });
          local = Object.keys(map).map(function (k) { return map[k]; });
          localSave(local);
        }
      } catch (e) {}
    }
    window.ba2Render(local);
  };

  async function ba2UpdateStatus(id, status) {
    if (window.baIsAdmin && !window.baIsAdmin()) { alert('Hanya admin yang mengubah status'); return; }
    var catatan = '';
    if (status === 'Tolak') {
      var pick = confirm('OK = Tetap Tolak\nCancel = lanjut Tahap Penawaran berikutnya');
      if (!pick) {
        var cur0 = localLoad().find(function (x) { return String(x.id) === String(id); });
        status = 'Tahap Penawaran ' + ((cur0 && Number(cur0.revisi) || 1) + 1);
      }
      catatan = prompt('Catatan status (opsional):', '') || '';
    }
    var now = today();
    var list = localLoad().map(function (r) {
      if (String(r.id) !== String(id)) return r;
      r.status = status; r.catatanStatus = catatan; r.diubahOleh = window.USER_EMAIL || '';
      if (String(status).indexOf('Penawaran') >= 0) { r.tglPenawaran = now; r.revisi = Number(String(status).replace(/\D/g, '')) || r.revisi || 1; }
      if (status === 'Sedang Proses') r.tglProses = now;
      if (status === 'Done' || status === 'Selesai') r.tglSelesai = now;
      if (status === 'Tolak') r.tglTolak = now;
      return r;
    });
    localSave(list); window.ba2Render(list);
    var url = apiUrl();
    if (url) {
      try {
        await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateBA2Status', id: id, status: status, catatanStatus: catatan, by: window.USER_EMAIL || '' }) });
      } catch (e) {}
    }
  }

  async function ba2Delete(id) {
    if (!window.USER_CAN_EDIT) { alert('Hanya Admin yang bisa hapus'); return; }
    if (!confirm('Hapus Kas Masuk ini?')) return;
    var list = localLoad().filter(function (x) { return String(x.id) !== String(id); });
    localSave(list); window.ba2Render(list);
    var url = apiUrl();
    if (url) {
      try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteBA2', id: id }) }); } catch (e) {}
    }
  }

  function onAksi(ev) {
    var st = ev.target && ev.target.closest && ev.target.closest('.ba2-st-btn');
    if (st) { ev.preventDefault(); ba2UpdateStatus(st.getAttribute('data-ba-id'), st.getAttribute('data-ba-next')); return; }
    var del = ev.target && ev.target.closest && ev.target.closest('.ba2-del-btn');
    if (del) { ev.preventDefault(); ba2Delete(del.getAttribute('data-ba-id')); }
  }

  window.ba2Init = function () { inject(); fillNames(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
  setTimeout(inject, 400);
  setTimeout(inject, 1200);
  window.__ba2Ready = true;
})();
