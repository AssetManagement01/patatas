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

  function lineHtml() {
    return '<div class="ba2-line" style="margin-bottom:0.65rem;padding:0.65rem;border:1px solid var(--border);border-radius:10px;background:#fafafa">' +
      '<div style="display:flex;gap:0.4rem;align-items:flex-start">' +
      '<div style="flex:1;min-width:0">' +
      '<label style="font-size:0.65rem;color:#64748b">Nama barang</label>' +
      '<input list="ba2-name-list" class="ba2-line-name" placeholder="Ketik nama item..." style="width:100%;box-sizing:border-box;padding:0.5rem;border:1px solid var(--border);border-radius:8px;font-size:1rem"/>' +
      '</div>' +
      '<button type="button" class="ba2-line-del" style="margin-top:1.15rem;border:none;background:#fee2e2;color:#b91c1c;border-radius:8px;cursor:pointer;height:38px;width:38px;flex-shrink:0;font-size:1.1rem">×</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.4rem;margin-top:0.35rem">' +
      '<div><label style="font-size:0.65rem;color:#64748b">Qty</label><input type="number" class="ba2-line-qty" min="1" value="1" style="width:100%;box-sizing:border-box;padding:0.45rem;border:1px solid var(--border);border-radius:8px;font-size:1rem"/></div>' +
      '<div><label style="font-size:0.65rem;color:#64748b">Uom</label><input type="text" class="ba2-line-uom" value="PCS" style="width:100%;box-sizing:border-box;padding:0.45rem;border:1px solid var(--border);border-radius:8px;font-size:1rem"/></div>' +
      '<div><label style="font-size:0.65rem;color:#64748b">Price</label><input type="number" class="ba2-line-price" min="0" step="any" value="0" style="width:100%;box-sizing:border-box;padding:0.45rem;border:1px solid var(--border);border-radius:8px;font-size:1rem"/></div>' +
      '</div>' +
      '<div style="margin-top:0.45rem">' +
      '<label style="font-size:0.65rem;color:#64748b;font-weight:600">Bukti foto/PDF (opsional)</label>' +
      '<div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;margin-top:0.2rem">' +
      '<input type="text" class="ba2-line-foto" placeholder="Link Drive atau upload" style="flex:1;min-width:140px;padding:0.45rem;border:1px solid var(--border);border-radius:8px"/>' +
      '<label style="padding:0.45rem 0.7rem;background:#0b4f37;color:#fff;border-radius:8px;cursor:pointer;font-size:0.78rem;font-weight:600">Upload<input type="file" class="ba2-line-file" accept="image/*,application/pdf,.pdf" style="display:none"/></label>' +
      '</div></div></div>';
  }

  function addLine() {
    var box = document.getElementById('ba2-lines');
    if (!box) return;
    box.insertAdjacentHTML('beforeend', lineHtml());
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
    if (p) p.innerHTML = 'Pengeluaran untuk maintenance / perbaikan. Item dari Aset Tetap atau ketik manual. Status awal: <b>Permintaan</b>.';

    var masuk = keluar.cloneNode(true);
    masuk.id = 'ba-panel-masuk';
    masuk.style.display = 'none';
    masuk.querySelectorAll('[id]').forEach(function (el) { el.id = 'm-' + el.id; });

    var h2 = masuk.querySelector('h3');
    if (h2) h2.textContent = 'Form Kas Masuk';
    var p2 = masuk.querySelector('p');
    if (p2) p2.innerHTML = 'Penjualan barang bekas (minyak goreng bekas, galon bekas, dll). Nama dari Aset Tetap atau ketik manual. Status awal: <b>Permintaan</b>.';

    var form = masuk.querySelector('form');
    if (form) { form.id = 'ba2-form'; form.removeAttribute('onsubmit'); }
    var grid = form && form.querySelector('div[style*="grid-template-columns"]');
    if (grid) grid.style.gridTemplateColumns = '1fr';

    var btn = masuk.querySelector('button[type="submit"]');
    if (btn) btn.textContent = 'Simpan Kas Masuk';

    masuk.querySelectorAll('label').forEach(function (lb) {
      var t = lb.textContent || '';
      if (/Item \(SKU/i.test(t)) lb.textContent = 'Item (nama manual atau Aset Tetap)';
      if (/Foto Bukti/i.test(t)) lb.textContent = 'Bukti foto/PDF (opsional)';
    });
    var addBtn = masuk.querySelector('#m-ba-add-sku, button');
    masuk.querySelectorAll('button').forEach(function (b) {
      if (/Tambah SKU/i.test(b.textContent || '')) {
        b.textContent = '+ Tambah item';
        b.removeAttribute('onclick');
        b.onclick = function (ev) { ev.preventDefault(); addLine(); };
      }
    });

    var lines = masuk.querySelector('#m-ba-lines');
    if (lines) {
      lines.id = 'ba2-lines';
      lines.innerHTML = '';
      addLine();
    }
    var dl = document.createElement('datalist');
    dl.id = 'ba2-name-list';
    masuk.appendChild(dl);

    var date = masuk.querySelector('#m-ba-date'); if (date) date.id = 'ba2-date';
    var loc = masuk.querySelector('#m-ba-loc'); if (loc) loc.id = 'ba2-loc';
    var note = masuk.querySelector('#m-ba-note');
    if (note) { note.id = 'ba2-note'; note.placeholder = 'Contoh: Jual minyak goreng bekas'; }
    var foto = masuk.querySelector('#m-ba-foto'); if (foto) foto.id = 'ba2-foto';
    var ff = masuk.querySelector('#m-ba-foto-file'); if (ff) ff.id = 'ba2-foto-file';
    var prev = masuk.querySelector('#m-ba-foto-preview'); if (prev) prev.id = 'ba2-foto-preview';

    var hist = masuk.querySelectorAll('h3')[1];
    if (hist) hist.textContent = 'Riwayat Kas Masuk';
    var tb = masuk.querySelector('tbody'); if (tb) tb.id = 'ba2-table-body';
    masuk.querySelectorAll('button').forEach(function (b) {
      if (/Refresh/i.test(b.textContent || '')) {
        b.removeAttribute('onclick');
        b.onclick = function () { if (window.ba2Reload) window.ba2Reload(); };
      }
    });

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
    masuk.addEventListener('change', function (ev) {
      var inp = ev.target;
      if (!inp || !inp.classList.contains('ba2-line-file')) return;
      var f0 = inp.files && inp.files[0]; if (!f0) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var hid = inp.parentNode.parentNode.querySelector('.ba2-line-foto');
        if (hid) hid.value = e.target.result;
      };
      reader.readAsDataURL(f0);
    });
    masuk.addEventListener('click', function (ev) {
      var d = ev.target && ev.target.closest && ev.target.closest('.ba2-line-del');
      if (d) {
        var line = d.closest('.ba2-line');
        var box = document.getElementById('ba2-lines');
        if (line && box && box.querySelectorAll('.ba2-line').length > 1) line.remove();
      }
    });
    document.addEventListener('click', onAksi, true);
    window.ba2Render();
  }

  function fillNames() {
    var dl = document.getElementById('ba2-name-list');
    if (!dl) return;
    var arr = [];
    try {
      (window.uniqueData || []).forEach(function (it) {
        var n = String(it.name || it.nama || '').trim();
        if (n && arr.indexOf(n) < 0) arr.push(n);
      });
    } catch (e) {}
    dl.innerHTML = arr.sort().map(function (n) { return '<option value="' + String(n).replace(/"/g, '"') + '">'; }).join('');
  }

  function onFoto(ev) {
    var f = ev.target.files && ev.target.files[0]; if (!f) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var hid = document.getElementById('ba2-foto');
      if (hid) hid.value = e.target.result;
      var p = document.getElementById('ba2-foto-preview');
      if (p) { p.src = e.target.result; p.style.display = 'block'; }
    };
    reader.readAsDataURL(f);
  }

  function onSubmit(e) {
    e.preventDefault();
    var loc = ((document.getElementById('ba2-loc') || {}).value || '').trim();
    var note = ((document.getElementById('ba2-note') || {}).value || '').trim();
    var date = ((document.getElementById('ba2-date') || {}).value) || today();
    if (!loc || !note) { alert('Lengkapi Lokasi dan Keterangan'); return false; }
    var lines = document.querySelectorAll('#ba2-lines .ba2-line');
    var rows = [];
    lines.forEach(function (ln, i) {
      var name = ((ln.querySelector('.ba2-line-name') || {}).value || '').trim();
      if (!name) return;
      var qty = parseFloat((ln.querySelector('.ba2-line-qty') || {}).value) || 0;
      var price = parseFloat((ln.querySelector('.ba2-line-price') || {}).value) || 0;
      var foto = ((ln.querySelector('.ba2-line-foto') || {}).value || '') || ((document.getElementById('ba2-foto') || {}).value || '');
      rows.push({
        id: 'BA2' + Date.now() + '_' + i, sheet: 'BA2', jenis: 'Kas Masuk',
        date: date, nama: name, name: name,
        uom: ((ln.querySelector('.ba2-line-uom') || {}).value || 'PCS'),
        qty: qty, price: price, total: price * qty,
        keterangan: note, foto: foto, loc: loc, status: 'Permintaan',
        tglPermintaan: date, tglPenawaran: '', tglProses: '', tglSelesai: '', tglTolak: '',
        revisi: 1, diubahOleh: window.USER_EMAIL || '', catatanStatus: '', by: window.USER_EMAIL || ''
      });
    });
    if (!rows.length) { alert('Isi minimal 1 nama barang'); return false; }
    var list = localLoad();
    rows.forEach(function (r) { list.unshift(r); pushSheet(r); });
    localSave(list);
    window.ba2Render(list);
    var box = document.getElementById('ba2-lines');
    if (box) { box.innerHTML = ''; addLine(); }
    var n = document.getElementById('ba2-note'); if (n) n.value = '';
    return false;
  }

  async function pushSheet(row) {
    var url = apiUrl(); if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveBA2', date: row.date, name: row.name, nama: row.nama,
          uom: row.uom, qty: row.qty, price: row.price, total: row.total,
          keterangan: row.keterangan, foto: row.foto, loc: row.loc,
          status: row.status, by: row.by, sheet: 'BA2'
        })
      });
    } catch (err) {}
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
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||r.nama||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+';text-align:center">'+(r.qty||0)+'</td><td style="'+td+';text-align:right">'+fmt(r.price)+'</td><td style="'+td+';text-align:right;font-weight:600">'+fmt(r.total||(r.price*r.qty))+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+';white-space:nowrap">'+badge+'</td><td style="'+td+';white-space:nowrap">'+aksi+'</td></tr>';
    }).join('');
  };

  window.ba2Reload = async function () {
    var url = apiUrl(); var local = localLoad();
    if (url) {
      try {
        var res = await fetch(url + '?action=listBA2&_=' + Date.now());
        var data = await res.json();
        if (data && data.ok && Array.isArray(data.items) && data.items.length) {
          var map = {}; local.forEach(function (x) { map[x.id] = x; });
          data.items.forEach(function (it) { map[it.id || ('BA2'+Math.random())] = it; });
          local = Object.keys(map).map(function (k) { return map[k]; }); localSave(local);
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
      if (String(status).indexOf('Penawaran') >= 0) { r.tglPenawaran = now; r.revisi = Number(String(status).replace(/\D/g,'')) || r.revisi || 1; }
      if (status === 'Sedang Proses') r.tglProses = now;
      if (status === 'Done' || status === 'Selesai') r.tglSelesai = now;
      if (status === 'Tolak') r.tglTolak = now;
      return r;
    });
    localSave(list); window.ba2Render(list);
    var url = apiUrl();
    if (url) {
      try { await fetch(url, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify({ action:'updateBA2Status', id:id, status:status, catatanStatus:catatan, by: window.USER_EMAIL||'' }) }); } catch (e) {}
    }
  }
  async function ba2Delete(id) {
    if (!window.USER_CAN_EDIT) { alert('Hanya Admin yang bisa hapus'); return; }
    if (!confirm('Hapus Kas Masuk ini?')) return;
    localSave(localLoad().filter(function (x) { return String(x.id) !== String(id); }));
    window.ba2Render();
    var url = apiUrl();
    if (url) { try { await fetch(url, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify({ action:'deleteBA2', id:id }) }); } catch (e) {} }
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
