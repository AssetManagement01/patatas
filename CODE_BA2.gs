/**
 * PATATAS — tempel ke Code.gs lalu Deploy > New version
 * Sheet BA2 header:
 * Tanggal | Nama | Uom | Qty | Price | Total | Keterangan | Foto | Loc | Status |
 * Tgl Permintaan | Tgl Penawaran | Tgl Proses | Tgl Selesai | Tgl Tolak | Revisi Penawaran | Diubah Oleh | Catatan Status
 */
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
    String(payload.status || 'Permintaan'),
    tgl,
    '',
    '',
    '',
    '',
    1,
    String(payload.by || ''),
    String(payload.catatanStatus || '')
  ]);
  return { ok: true, sheet: 'BA2' };
}
