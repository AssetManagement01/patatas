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
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

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

  function locOptions() {
    var sel = document.getElementById('ba-loc');
    if (sel) return sel.innerHTML;
    return '<option value="">— Pilih —</option>';
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
    if (h && /Form Berita Acara/i.test(h.textContent)) h.textContent = 'Kas Keluar — Maintenance / pengeluaran';
    var masuk = document.createElement('div');
    masuk.id = 'ba-panel-masuk';
    masuk.style.display = 'none';
    masuk.innerHTML =
      '<div style="background:#fff;border-radius:14px;padding:1.25rem;border:1px solid var(--border);margin-bottom:1rem">' +
      '<h3 style="margin:0 0 0.25rem;font-size:1.05rem">Kas Masuk — Penjualan barang bekas</h3>' +
      '<p style="margin:0 0 1rem;font-size:0.8rem;color:#64748b">Minyak goreng bekas, galon bekas, dll. Nama dari Aset Tetap atau ketik manual. Status awal: <b>Permintaan</b>.</p>' +
      '<form id="ba2-form">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">' +
      '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">Tanggal *</label>' +
      '<input type="date" id="ba2-date" required style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/></div>' +
      '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">Lokasi *</label>' +
      '<select id="ba2-loc" required style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px">' + locOptions() + '</select></div></div>' +
      '<div style="margin-top:0.75rem"><label style="font-size:0.72rem;font-weight:600;color:#64748b">Nama *</label>' +
      '<input list="ba2-name-list" id="ba2-name" required placeholder="Dari Aset Tetap atau ketik manual" style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/>' +
      '<datalist id="ba2-name-list"></datalist></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-top:0.75rem">' +
      '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">UOM</label>' +
      '<input id="ba2-uom" value="PCS" style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/></div>' +
      '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">Qty *</label>' +
      '<input type="number" id="ba2-qty" min="0" step="any" value="1" required style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/></div>' +
      '<div><label style="font-size:0.72rem;font-weight:600;color:#64748b">Price *</label>' +
      '<input type="number" id="ba2-price" min="0" step="any" value="0" required style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"/></div></div>' +
      '<div style="margin-top:0.75rem"><label style="font-size:0.72rem;font-weight:600;color:#64748b">Keterangan *</label>' +
      '<textarea id="ba2-note" rows="2" required placeholder="Contoh: Jual minyak goreng bekas" style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px"></textarea></div>' +
      '<div style="margin-top:0.75rem"><label style="font-size:0.72rem;font-weight:600;color:#64748b">Foto</label>' +
      '<input type="file" id="ba2-foto-file" accept="image/*" style="width:100%;font-size:0.8rem"/>' +
      '<input type="hidden" id="ba2-foto"/>' +
      '<img id="ba2-foto-preview" style="display:none;max-width:160px;margin-top:0.4rem;border-radius:8px"/></div>' +
      '<div style="margin-top:1rem"><button type="submit" class="btn btn-primary" style="padding:0.55rem 1.1rem;background:#0b4f37;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Simpan Kas Masuk</button></div>' +
      '</form></div>' +
      '<div style="background:#fff;border-radius:14px;padding:1.25rem;border:1px solid var(--border)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem">' +
      '<h3 style="margin:0;font-size:1.05rem">Riwayat Kas Masuk</h3>' +
      '<button type="button" onclick="window.ba2Reload&&ba2Reload()" style="padding:0.35rem 0.7rem;border:1px solid var(--border);border-radius:8px;background:#fff;cursor:pointer;font-size:0.78rem">Refresh</button></div>' +
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.8rem">' +
      '<thead><tr style="background:#0b4f37;color:#fff;text-align:left">' +
      '<th style="padding:0.5rem">Tanggal</th><th style="padding:0.5rem">Nama</th><th style="padding:0.5rem">Loc</th>' +
      '<th style="padding:0.5rem">Qty</th><th style="padding:0.5rem">Price</th><th style="padding:0.5rem">Total</th>' +
      '<th style="padding:0.5rem">Keterangan</th><th style="padding:0.5rem">Status</th><th style="padding:0.5rem">Aksi</th>' +
      '</tr></thead><tbody id="ba2-table-body"></tbody></table></div></div>';
    page.appendChild(tabs);
    page.appendChild(keluar);
    page.appendChild(masuk);
    fillNames();
    var dt = document.getElementById('ba2-date');
    if (dt && !dt.value) dt.value = today();
    var form = document.getElementById('ba2-form');
    if (form) form.addEventListener('submit', onSubmit);
    var ff = document.getElementById('ba2-foto-file');
    if (ff) ff.addEventListener('change', onFoto);
    document.addEventListener('click', onAksi, true);
    window.ba2Render();
  }

  function fillNames() {
    var dl = document.getElementById('ba2-name-list');
    if (!dl) return;
    dl.innerHTML = namesList().map(function (n) {
      return '<option value="' + n.replace(/"/g, '"') + '">';
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
    var name = (document.getElementById('ba2-name').value || '').trim();
    var loc = (document.getElementById('ba2-loc').value || '').trim();
    var note = (document.getElementById('ba2-note').value || '').trim();
    var date = document.getElementById('ba2-date').value || today();
    var qty = parseFloat(document.getElementById('ba2-qty').value) || 0;
    var price = parseFloat(document.getElementById('ba2-price').value) || 0;
    if (!name || !loc || !note) { alert('Lengkapi Nama, Lokasi, dan Keterangan'); return false; }
    var row = {
      id: 'BA2' + Date.now(),
      sheet: 'BA2',
      jenis: 'Kas Masuk',
      date: date, nama: name, name: name,
      uom: (document.getElementById('ba2-uom').value || 'PCS'),
      qty: qty, price: price, total: price * qty,
      keterangan: note,
      foto: (document.getElementById('ba2-foto').value || ''),
      loc: loc,
      status: 'Permintaan',
      tglPermintaan: date,
      tglPenawaran: '', tglProses: '', tglSelesai: '', tglTolak: '',
      revisi: 1, diubahOleh: window.USER_EMAIL || '', catatanStatus: '',
      by: window.USER_EMAIL || ''
    };
    var list = localLoad();
    list.unshift(row);
    localSave(list);
    window.ba2Render(list);
    pushSheet(row);
    document.getElementById('ba2-form').reset();
    var dt = document.getElementById('ba2-date'); if (dt) dt.value = today();
    var pv = document.getElementById('ba2-foto-preview'); if (pv) pv.style.display = 'none';
    var hid = document.getElementById('ba2-foto'); if (hid) hid.value = '';
    return false;
  }

  async function pushSheet(row) {
    var url = apiUrl();
    if (!url) return;
    var payload = {
      action: 'saveBA2',
      id: row.id, date: row.date, name: row.name, nama: row.nama,
      uom: row.uom, qty: row.qty, price: row.price, total: row.total,
      keterangan: row.keterangan, foto: row.foto ? 'ada' : '',
      loc: row.loc, status: row.status,
      tglPermintaan: row.tglPermintaan, revisi: row.revisi,
      diubahOleh: row.diubahOleh, by: row.by, sheet: 'BA2'
    };
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    } catch (e) {}
  }

  window.ba2Render = function (list) {
    var tb = document.getElementById('ba2-table-body');
    if (!tb) return;
    list = list || localLoad();
    if (window.baFilterOutlet) list = window.baFilterOutlet(list);
    if (!list.length) {
      tb.innerHTML = '<tr><td colspan="9" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data Kas Masuk</td></tr>';
      return;
    }
    var td = 'padding:0.55rem 0.5rem;border-bottom:1px solid #f1f5f9;vertical-align:middle';
    tb.innerHTML = list.map(function (r) {
      var badge = window.baStatusBadge ? window.baStatusBadge(r.status) : (r.status || '');
      var aksi = window.baAdminButtons ? window.baAdminButtons(r) : '';
      aksi = aksi.replace(/ba-st-btn/g, 'ba2-st-btn').replace(/ba-del-btn/g, 'ba2-del-btn');
      return '<tr>' +
        '<td style="' + td + '">' + (r.date || '') + '</td>' +
        '<td style="' + td + '">' + (r.name || r.nama || '') + '</td>' +
        '<td style="' + td + '">' + (r.loc || '') + '</td>' +
        '<td style="' + td + ';text-align:center">' + (r.qty || 0) + '</td>' +
        '<td style="' + td + ';text-align:right">' + fmt(r.price) + '</td>' +
        '<td style="' + td + ';text-align:right;font-weight:600">' + fmt(r.total || (r.price * r.qty)) + '</td>' +
        '<td style="' + td + '">' + (r.keterangan || '') + '</td>' +
        '<td style="' + td + ';white-space:nowrap">' + badge + '</td>' +
        '<td style="' + td + ';white-space:nowrap"><div class="ba-aksi-wrap">' + aksi + '</div></td></tr>';
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
        var n = (cur0 && Number(cur0.revisi) || 1) + 1;
        status = 'Tahap Penawaran ' + n;
      }
      catatan = prompt('Catatan status (opsional):', '') || '';
    }
    var now = today();
    var list = localLoad().map(function (r) {
      if (String(r.id) !== String(id)) return r;
      r.status = status;
      r.catatanStatus = catatan;
      r.diubahOleh = window.USER_EMAIL || '';
      if (String(status).indexOf('Penawaran') >= 0) { r.tglPenawaran = now; r.revisi = Number(String(status).replace(/\D/g, '')) || r.revisi || 1; }
      if (status === 'Sedang Proses') r.tglProses = now;
      if (status === 'Done' || status === 'Selesai') r.tglSelesai = now;
      if (status === 'Tolak') r.tglTolak = now;
      return r;
    });
    localSave(list);
    window.ba2Render(list);
    var url = apiUrl();
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updateBA2Status', id: id, status: status, catatanStatus: catatan, by: window.USER_EMAIL || '' })
        });
      } catch (e) {}
    }
  }

  async function ba2Delete(id) {
    if (!window.USER_CAN_EDIT) { alert('Hanya Admin yang bisa hapus'); return; }
    if (!confirm('Hapus Kas Masuk ini?')) return;
    var list = localLoad().filter(function (x) { return String(x.id) !== String(id); });
    localSave(list);
    window.ba2Render(list);
    var url = apiUrl();
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'deleteBA2', id: id })
        });
      } catch (e) {}
    }
  }

  function onAksi(ev) {
    var st = ev.target && ev.target.closest && ev.target.closest('.ba2-st-btn');
    if (st) {
      ev.preventDefault();
      ba2UpdateStatus(st.getAttribute('data-ba-id'), st.getAttribute('data-ba-next'));
      return;
    }
    var del = ev.target && ev.target.closest && ev.target.closest('.ba2-del-btn');
    if (del) {
      ev.preventDefault();
      ba2Delete(del.getAttribute('data-ba-id'));
    }
  }

  window.ba2Init = function () {
    inject();
    fillNames();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
  setTimeout(inject, 400);
  setTimeout(inject, 1200);
  window.__ba2Ready = true;
})();
