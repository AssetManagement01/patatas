/**
 * PATATAS — tempel ke Code.gs lalu Deploy > Manage deployments > Edit > Version: New version
 * (URL /exec tetap sama).
 * Sheet BA2 header:
 * Tanggal | Nama | Uom | Qty | Price | Total | Keterangan | Foto | Loc | Status |
 * Tgl Permintaan | Tgl Penawaran | Tgl Proses | Tgl Selesai | Tgl Tolak | Revisi Penawaran | Diubah Oleh | Catatan Status
 *
 * Routing di doPost (sesuaikan nama variabel payload/action dengan Code.gs Anda):
 *   if (action === 'saveBA2')   return ba2Json_(saveBA2_(payload));
 *   if (action === 'updateBA2') return ba2Json_(editBA2Row_(payload));   // BARU: edit Kas Masuk
 */
function ba2Json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function saveBA2_(payload) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName('BA2');
  if (!sh) sh = ss.insertSheet('BA2');
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Tanggal','Nama','Uom','Qty','Price','Total','Keterangan','Foto','Loc','Status','Tgl Permintaan','Tgl Penawaran','Tgl Proses','Tgl Selesai','Tgl Tolak','Revisi Penawaran','Diubah Oleh','Catatan Status']);
  }
  var nama = String(payload.name || payload.nama || '').trim();
  if (!nama || nama.toUpperCase() === 'MANUAL') {
    nama = String(payload.item || payload.keterangan || 'MANUAL').trim();
  }
  var qty = Number(payload.qty) || 0;
  var price = Number(payload.price) || 0;
  var total = Number(payload.total) || (qty * price);
  var tgl = String(payload.date || '').trim();
  // Kas Masuk langsung Done (bukan Permintaan)
  var status = String(payload.status || 'Done');
  var done = (status === 'Done' || status === 'Selesai');
  sh.appendRow([
    tgl,
    nama,
    String(payload.uom || 'PCS'),
    qty,
    price,
    total,
    String(payload.keterangan || ''),
    String(payload.foto || ''),
    String(payload.loc || ''),
    status,
    tgl,
    '',
    '',
    done ? (String(payload.tglSelesai || '') || tgl) : '',
    '',
    1,
    String(payload.by || ''),
    String(payload.catatanStatus || '')
  ]);
  return { ok: true, sheet: 'BA2', id: 'BA2ROW' + sh.getLastRow() };
}

/**
 * Edit 1 baris Kas Masuk. payload: { id:'BA2ROW<n>', date, name, uom, qty, price, total,
 * keterangan, foto, loc, status, by, orig:{date,name,loc,qty,price,keterangan} }
 * Baris hanya diubah bila isi lama cocok dengan payload.orig (mencegah salah baris
 * kalau urutan sheet berubah). Kalau tidak cocok, dicari 1 baris lain yang cocok persis.
 */
function editBA2Row_(payload) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName('BA2');
  if (!sh) return { ok: false, error: 'Sheet BA2 tidak ada' };
  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  if (lastRow < 2) return { ok: false, error: 'Sheet BA2 kosong' };
  var head = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim().toLowerCase(); });
  function col(name) { return head.indexOf(name); }
  var C = {
    tgl: col('tanggal'), nama: col('nama'), uom: col('uom'), qty: col('qty'), price: col('price'), total: col('total'),
    ket: col('keterangan'), foto: col('foto'), loc: col('loc'), status: col('status'),
    selesai: col('tgl selesai'), by: col('diubah oleh')
  };
  if (C.nama < 0 || C.tgl < 0) return { ok: false, error: 'Header BA2 tidak dikenali' };
  var tz = ss.getSpreadsheetTimeZone();
  function d2s(v) { return (v instanceof Date) ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v == null ? '' : v).trim(); }
  function s(v) { return String(v == null ? '' : v).trim().toLowerCase(); }
  function n(v) { return Number(v) || 0; }
  var data = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var o = payload.orig || {};
  function match(row) {
    if (!payload.orig) return true;
    return d2s(row[C.tgl]) === String(o.date || '').trim() &&
      s(row[C.nama]) === s(o.name) &&
      (C.loc < 0 || s(row[C.loc]) === s(o.loc)) &&
      (C.qty < 0 || n(row[C.qty]) === n(o.qty)) &&
      (C.price < 0 || n(row[C.price]) === n(o.price)) &&
      (C.ket < 0 || s(row[C.ket]) === s(o.keterangan));
  }
  var m = String(payload.id || '').match(/^BA2ROW(\d+)$/);
  var r = m ? Number(m[1]) : 0;
  if (!(r >= 2 && r <= lastRow && match(data[r - 2]))) {
    if (!payload.orig) return { ok: false, error: 'Baris tidak ditemukan' };
    var hits = [];
    data.forEach(function (row, i) { if (match(row)) hits.push(i + 2); });
    if (hits.length !== 1) return { ok: false, error: 'Baris Kas Masuk tidak ditemukan / data sudah berubah. Refresh lalu coba lagi.' };
    r = hits[0];
  }
  var row = data[r - 2].slice();
  var formulas = sh.getRange(r, 1, 1, lastCol).getFormulas()[0];
  var qty = n(payload.qty), price = n(payload.price);
  // Hanya sel yang berubah yang ditulis; sel berisi rumus tidak ditimpa.
  function put(c, v) { if (c >= 0 && v !== undefined && !formulas[c]) { row[c] = v; sh.getRange(r, c + 1).setValue(v); } }
  put(C.tgl, String(payload.date || d2s(row[C.tgl])).trim());
  put(C.nama, String(payload.name || payload.nama || row[C.nama]).trim());
  put(C.uom, String(payload.uom || row[C.uom] || 'PCS'));
  put(C.qty, qty);
  put(C.price, price);
  put(C.total, n(payload.total) || qty * price);
  if (payload.keterangan !== undefined) put(C.ket, String(payload.keterangan));
  if (payload.foto !== undefined) put(C.foto, String(payload.foto));
  if (payload.loc !== undefined) put(C.loc, String(payload.loc));
  if (payload.status) {
    var st = String(payload.status);
    put(C.status, st);
    if ((st === 'Done' || st === 'Selesai') && C.selesai >= 0 && !row[C.selesai]) put(C.selesai, Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'));
  }
  put(C.by, String(payload.by || ''));
  return { ok: true, sheet: 'BA2', id: 'BA2ROW' + r };
}
