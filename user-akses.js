/* PATATAS — Settings > User Akses (hanya DEVELOPER). Semua aturan juga dicek di server. */
(function () {
  var MENU_LABEL = { aset_tetap: "Aset Tetap", aset_lancar: "Aset Lancar", valuation: "Valuation Stock", dashboard: "Dashboard",
    transfer: "Transfer Aset", ba: "BA Kas Keluar", ba2: "BA Kas Masuk", scan: "Scan QR", report: "Report", settings: "Settings" };
  var SPECIAL_LABEL = { approve_transfer: "Approve Transfer", hapus: "Hapus data", import_export: "Import/Export", ubah_status_ba: "Ubah status BA" };
  var META = null, USERS = [], EDITING = null;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function sess() { return window.PATATAS_AUTH && window.PATATAS_AUTH.session(); }
  function isDev() { var s = sess(); return !!(s && s.appRole === "DEVELOPER"); }
  function post(o) { return window.PATATAS_AUTH.post(o); }
  function $(id) { return document.getElementById(id); }
  var IN = "width:100%;box-sizing:border-box;padding:.5rem .7rem;border:1px solid var(--border,#e2e8f0);border-radius:8px;font-size:.88rem;background:var(--card,#fff);color:inherit";
  var LB = "font-size:.72rem;font-weight:600;color:#64748b;display:block;margin-bottom:.2rem";
  var CARD = "background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:1.25rem;margin-bottom:1rem";

  function build() {
    var page = $("page-settings");
    if (!page) return;
    var box = $("ua-root");
    if (!isDev()) { if (box) box.remove(); return; }
    if (box) return;
    box = document.createElement("div"); box.id = "ua-root"; box.style.cssText = "max-width:1100px;margin-top:.5rem";
    box.innerHTML =
      '<div style="' + CARD + '">' +
      '<h3 style="margin:0 0 .2rem;font-size:1.05rem">👥 User Akses <span style="font-size:.7rem;font-weight:600;background:#0b4f37;color:#fff;border-radius:999px;padding:.1rem .5rem;margin-left:.35rem">DEVELOPER</span></h3>' +
      '<p style="margin:0 0 1rem;font-size:.8rem;color:#64748b">Tambah / ubah user dan hak akses per menu. Hanya akun DEVELOPER yang bisa membuka bagian ini.</p>' +
      '<div id="ua-form-title" style="font-weight:700;margin-bottom:.6rem">Tambah User</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.65rem">' +
      '<div><label style="' + LB + '">Divisi / Posisi</label><input id="ua-divisi" style="' + IN + '" placeholder="mis. Store Manager"/></div>' +
      '<div><label style="' + LB + '">Username</label><input id="ua-username" style="' + IN + '" autocomplete="off"/></div>' +
      '<div id="ua-pw-wrap"><label style="' + LB + '">Password (min 6)</label><div style="display:flex;gap:.3rem"><input id="ua-password" type="text" autocomplete="new-password" style="' + IN + '"/><button type="button" id="ua-gen" class="btn btn-outline" style="white-space:nowrap;padding:.4rem .55rem;font-size:.75rem" title="Buat password acak">🎲</button></div></div>' +
      '<div><label style="' + LB + '">Role</label><select id="ua-role" style="' + IN + '"><option>ADMIN</option><option>HO</option><option selected>OUTLET</option><option>VIEWER</option></select></div>' +
      '<div><label style="' + LB + '">Outlet</label><select id="ua-outlet" style="' + IN + '"></select></div>' +
      '<div><label style="' + LB + '">Tools (hak akses)</label><select id="ua-tools" style="' + IN + '"><option value="Default">Default (ikut role)</option><option value="Custom">Custom</option></select></div>' +
      '</div>' +
      '<div style="overflow-x:auto;margin-top:.9rem"><table style="width:100%;border-collapse:collapse;font-size:.83rem" id="ua-matrix"></table></div>' +
      '<div id="ua-specials" style="display:flex;flex-wrap:wrap;gap:.4rem 1.1rem;margin-top:.6rem;font-size:.83rem"></div>' +
      '<div style="display:flex;gap:.5rem;margin-top:1rem;align-items:center;flex-wrap:wrap">' +
      '<button type="button" id="ua-save" class="btn btn-primary">Simpan User</button>' +
      '<button type="button" id="ua-cancel" class="btn btn-outline" style="display:none">Batal Edit</button>' +
      '<span id="ua-msg" style="font-size:.8rem"></span></div></div>' +
      '<div style="' + CARD + '"><div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">' +
      '<h3 style="margin:0;font-size:1.05rem">Daftar User</h3><div style="display:flex;gap:.4rem"><input id="ua-search" placeholder="Cari…" style="' + IN + ';width:170px"/>' +
      '<button type="button" id="ua-reload" class="btn btn-outline" style="font-size:.78rem">↻ Muat ulang</button></div></div>' +
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.82rem" id="ua-table"></table></div></div>';
    var anchor = page.firstElementChild;
    if (anchor && anchor.nextSibling) page.insertBefore(box, anchor.nextSibling); else page.appendChild(box);
    $("ua-gen").onclick = function () { $("ua-password").value = genPw(); };
    $("ua-role").onchange = function () { renderMatrix(); syncOutlet(); };
    $("ua-tools").onchange = function () { renderMatrix(); };
    $("ua-save").onclick = saveUser;
    $("ua-cancel").onclick = resetForm;
    $("ua-reload").onclick = load;
    $("ua-search").oninput = renderTable;
    load();
  }
  function genPw() {
    var A = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", a = new Uint32Array(12), o = "";
    crypto.getRandomValues(a); for (var i = 0; i < 12; i++) o += A[a[i] % A.length];
    return o;
  }
  function syncOutlet() {
    var r = $("ua-role").value, o = $("ua-outlet");
    if (r === "ADMIN") { o.value = ""; o.disabled = true; } else o.disabled = false;
  }
  function load() {
    var msg = $("ua-msg"); if (msg) { msg.style.color = "#64748b"; msg.textContent = "Memuat…"; }
    return post({ action: "listUsers" }).then(function (r) {
      if (!r || !r.ok) { if (msg) { msg.style.color = "#dc2626"; msg.textContent = (r && r.error) || "Gagal memuat user"; } return; }
      META = r; USERS = r.users || [];
      var o = $("ua-outlet"), cur = o.value;
      o.innerHTML = '<option value="">— Semua outlet —</option>' + Object.keys(r.outlets).map(function (k) { return '<option value="' + esc(k) + '">' + esc(k + " — " + r.outlets[k].name) + "</option>"; }).join("");
      o.value = cur;
      if (msg) msg.textContent = "";
      renderMatrix(); renderTable(); syncOutlet();
    }).catch(function (e) { if (msg) { msg.style.color = "#dc2626"; msg.textContent = "Gagal: " + (e && e.message || e); } });
  }
  function currentPerms() {
    var m = {}, s = {};
    Object.keys(MENU_LABEL).forEach(function (k) { var c = document.querySelector('input[name="ua-m-' + k + '"]:checked'); m[k] = c ? Number(c.value) : 0; });
    Object.keys(SPECIAL_LABEL).forEach(function (k) { var c = $("ua-s-" + k); s[k] = !!(c && c.checked); });
    return { m: m, s: s };
  }
  function renderMatrix(perms) {
    if (!META) return;
    var custom = $("ua-tools").value === "Custom";
    var role = $("ua-role").value;
    var p = perms || (custom ? (renderMatrix._last || META.defaults[role]) : META.defaults[role]);
    if (!custom) p = META.defaults[role];
    var dis = "";
    var h = '<tr style="text-align:left;border-bottom:1px solid var(--border,#e2e8f0)"><th style="padding:.4rem">Menu</th><th style="padding:.4rem;text-align:center">Tidak ada</th><th style="padding:.4rem;text-align:center">Lihat</th><th style="padding:.4rem;text-align:center">Lihat + Edit</th></tr>';
    Object.keys(MENU_LABEL).forEach(function (k) {
      h += '<tr style="border-bottom:1px solid var(--border,#f1f5f9)"><td style="padding:.35rem .4rem">' + MENU_LABEL[k] + "</td>";
      [0, 1, 2].forEach(function (v) { h += '<td style="text-align:center"><input type="radio" name="ua-m-' + k + '" value="' + v + '"' + (p.m[k] === v ? " checked" : "") + dis + "/></td>"; });
      h += "</tr>";
    });
    $("ua-matrix").innerHTML = h;
    $("ua-specials").innerHTML = '<b style="width:100%;font-size:.78rem;color:#64748b">Aksi khusus</b>' + Object.keys(SPECIAL_LABEL).map(function (k) {
      return '<label style="display:inline-flex;gap:.35rem;align-items:center"><input type="checkbox" id="ua-s-' + k + '"' + (p.s[k] ? " checked" : "") + dis + "/>" + SPECIAL_LABEL[k] + "</label>";
    }).join("") + '<span id="ua-tools-hint" style="width:100%;font-size:.75rem;color:' + (custom ? "#0f766e" : "#94a3b8") + '">' +
      (custom ? "Mode Custom: hak akses di atas bisa diubah bebas lalu klik Simpan." : "Mode Default: mengikuti role. Klik pilihan mana pun untuk otomatis pindah ke Custom.") + "</span>";
    $("ua-matrix").onchange = $("ua-specials").onchange = function () {
      if ($("ua-tools").value !== "Custom") { var cur = currentPerms(); $("ua-tools").value = "Custom"; renderMatrix._last = cur; renderMatrix(cur); return; }
      renderMatrix._last = currentPerms();
    };
  }
  function fmtDate(s) { if (!s) return "—"; var d = new Date(s); return isNaN(d) ? esc(s) : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  function renderTable() {
    var q = (($("ua-search") || {}).value || "").toLowerCase();
    var rows = USERS.filter(function (u) { return !q || (u.username + " " + (u.aliases || []).join(" ") + " " + u.divisi + " " + u.role + " " + u.outlet).toLowerCase().indexOf(q) >= 0; });
    var th = "padding:.45rem .4rem;text-align:left;white-space:nowrap";
    var h = '<tr style="border-bottom:1px solid var(--border,#e2e8f0);color:#64748b"><th style="' + th + '">Username</th><th style="' + th + '">Divisi</th><th style="' + th + '">Role</th><th style="' + th + '">Outlet</th><th style="' + th + '">Tools</th><th style="' + th + '">Status</th><th style="' + th + '">Dibuat</th><th style="' + th + '">Aksi</th></tr>';
    rows.forEach(function (u) {
      var dev = u.role === "DEVELOPER", aktif = u.status === "Aktif";
      var pill = function (t, bg, fg) { return '<span style="display:inline-block;padding:.1rem .5rem;border-radius:999px;font-size:.72rem;font-weight:600;background:' + bg + ";color:" + fg + '">' + esc(t) + "</span>"; };
      h += '<tr style="border-bottom:1px solid var(--border,#f1f5f9)' + (aktif ? "" : ";opacity:.55") + '">' +
        '<td style="padding:.4rem"><b>' + esc(u.username) + "</b>" + (u.aliases && u.aliases.length ? '<div style="font-size:.7rem;color:#94a3b8">' + esc(u.aliases.join(", ")) + "</div>" : "") + (u.mustChange ? '<div style="font-size:.68rem;color:#b45309">belum ganti password</div>' : "") + "</td>" +
        '<td style="padding:.4rem">' + esc(u.divisi || "—") + "</td>" +
        '<td style="padding:.4rem">' + pill(u.role, dev ? "#0b4f37" : "#e0f2fe", dev ? "#fff" : "#075985") + "</td>" +
        '<td style="padding:.4rem">' + esc(u.outlet || "Semua") + "</td>" +
        '<td style="padding:.4rem">' + pill(u.tools, u.tools === "Custom" ? "#fef3c7" : "#f1f5f9", u.tools === "Custom" ? "#92400e" : "#475569") + "</td>" +
        '<td style="padding:.4rem">' + pill(u.status, aktif ? "#dcfce7" : "#fee2e2", aktif ? "#166534" : "#991b1b") + "</td>" +
        '<td style="padding:.4rem;white-space:nowrap">' + fmtDate(u.created) + "</td>" +
        '<td style="padding:.4rem;white-space:nowrap">' +
        (dev ? "" : '<button type="button" class="btn btn-outline" data-ua="edit" data-u="' + esc(u.username) + '" style="font-size:.72rem;padding:.25rem .5rem">✏️ Edit</button> ') +
        '<button type="button" class="btn btn-outline" data-ua="reset" data-u="' + esc(u.username) + '" style="font-size:.72rem;padding:.25rem .5rem">🔑 Reset password</button> ' +
        (dev ? "" : '<button type="button" class="btn btn-outline" data-ua="status" data-u="' + esc(u.username) + '" style="font-size:.72rem;padding:.25rem .5rem;color:' + (aktif ? "#b91c1c" : "#166534") + '">' + (aktif ? "⛔ Nonaktifkan" : "✅ Aktifkan") + "</button>") +
        "</td></tr>";
    });
    $("ua-table").innerHTML = h;
    Array.prototype.forEach.call($("ua-table").querySelectorAll("button[data-ua]"), function (b) {
      b.onclick = function () { act(b.getAttribute("data-ua"), b.getAttribute("data-u")); };
    });
  }
  function find(n) { for (var i = 0; i < USERS.length; i++) if (USERS[i].username === n) return USERS[i]; return null; }
  function uaModal(opt) {
    var d = document.createElement("div");
    d.className = "ua-modal";
    d.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:1rem";
    d.innerHTML = '<div role="dialog" style="background:var(--card,#fff);color:var(--text,#0f172a);border-radius:16px;max-width:400px;width:100%;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.3)">' +
      '<div style="background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:.85rem 1.1rem;font-weight:700">' + esc(opt.title) + "</div>" +
      '<div data-b style="padding:1rem 1.1rem;font-size:.86rem">' + opt.body + '</div><div data-err style="display:none;color:#dc2626;font-size:.8rem;padding:0 1.1rem .5rem"></div>' +
      '<div data-f style="display:flex;gap:.5rem;justify-content:flex-end;padding:0 1.1rem 1rem">' +
      (opt.cancel === false ? "" : '<button type="button" class="btn btn-outline" data-no style="border-radius:10px">' + esc(opt.cancelText || "Batal") + "</button>") +
      '<button type="button" class="btn btn-primary" data-ok style="border-radius:10px;' + (opt.danger ? "background:#dc2626;border-color:#dc2626" : "background:#0f766e;border-color:#0f766e") + ';color:#fff">' + esc(opt.okText || "Simpan") + "</button></div></div>";
    document.body.appendChild(d);
    var close = function () { d.remove(); };
    d.err = function (m) { var e = d.querySelector("[data-err]"); e.textContent = m; e.style.display = m ? "" : "none"; };
    d.close = close;
    if (d.querySelector("[data-no]")) d.querySelector("[data-no]").onclick = close;
    d.addEventListener("click", function (ev) { if (ev.target === d && opt.cancel !== false) close(); });
    d.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && opt.cancel !== false) close(); if (ev.key === "Enter" && ev.target.tagName === "INPUT") d.querySelector("[data-ok]").click(); });
    d.querySelector("[data-ok]").onclick = function () {
      var b = this; if (b.disabled) return;
      var r = opt.onOk ? opt.onOk(d) : true;
      if (r && typeof r.then === "function") { b.disabled = true; b.textContent = "Memproses…"; r.then(function (keep) { if (!keep) close(); else { b.disabled = false; b.textContent = opt.okText || "Simpan"; } }); }
      else if (r !== false) close();
    };
    var f = d.querySelector("input:not([readonly])"); setTimeout(function () { (f || d.querySelector("[data-ok]")).focus(); }, 30);
    return d;
  }
  function uaInfo(title, html) { return uaModal({ title: title, body: html, okText: "OK", cancel: false }); }
  function act(kind, name) {
    var u = find(name); if (!u) return;
    if (kind === "edit") {
      EDITING = u.username;
      $("ua-form-title").textContent = "Edit User: " + u.username;
      $("ua-username").value = u.username; $("ua-username").disabled = true;
      $("ua-pw-wrap").style.display = "none";
      $("ua-divisi").value = u.divisi || ""; $("ua-role").value = u.role; $("ua-outlet").value = u.outlet || "";
      $("ua-tools").value = u.tools === "Custom" ? "Custom" : "Default";
      renderMatrix._last = u.perms; renderMatrix(u.perms); syncOutlet();
      $("ua-cancel").style.display = "";
      $("ua-root").scrollIntoView({ behavior: "smooth" });
    } else if (kind === "reset") {
      uaModal({ title: "Reset password — " + u.username, okText: "Simpan",
        body: '<p style="margin:0 0 .6rem;color:#64748b">Ketik password sementara baru (min 6 karakter), atau <b>kosongkan</b> untuk dibuat acak. User wajib menggantinya saat login berikutnya.</p>' +
          '<div style="display:flex;gap:.4rem"><input type="password" data-pw autocomplete="new-password" placeholder="Kosongkan = acak" style="flex:1;padding:.55rem .7rem;border:1px solid #cbd5e1;border-radius:10px;font-size:.9rem"/>' +
          '<button type="button" class="btn btn-outline" data-eye title="Tampilkan/sembunyikan" style="border-radius:10px">👁</button></div>',
        onOk: function (d) {
          var pw = d.querySelector("[data-pw]").value;
          if (pw && pw.length < 6) { d.err("Password minimal 6 karakter"); return false; }
          d.err("");
          return post({ action: "userResetPassword", username: u.username, newPassword: pw || "" }).then(function (r) {
            if (!r || !r.ok) { d.err((r && r.error) || "Gagal reset"); return true; }
            d.close();
            if (r.tempPassword) showOnce(u.username, r.tempPassword);
            else uaInfo("Password di-reset", "Password <b>" + esc(u.username) + "</b> sudah di-reset. User wajib ganti saat login berikutnya.");
            load(); return false;
          }).catch(function (e) { d.err("Gagal: " + (e && e.message || e)); return true; });
        } }).querySelector("[data-eye]").onclick = function () { var i = this.parentNode.querySelector("[data-pw]"); i.type = i.type === "password" ? "text" : "password"; };
    } else if (kind === "status") {
      var to = u.status === "Aktif" ? "Nonaktif" : "Aktif", off = to === "Nonaktif";
      uaModal({ title: (off ? "Nonaktifkan " : "Aktifkan kembali ") + u.username, okText: off ? "Nonaktifkan" : "Aktifkan", danger: off,
        body: off ? "User <b>" + esc(u.username) + "</b> akan langsung ter-logout dan tidak bisa login sampai diaktifkan kembali." : "User <b>" + esc(u.username) + "</b> bisa login lagi dengan password yang ada.",
        onOk: function (d) {
          return post({ action: "userSetStatus", username: u.username, status: to }).then(function (r) {
            if (!r || !r.ok) { d.err((r && r.error) || "Gagal"); return true; }
            load(); return false;
          }).catch(function (e) { d.err("Gagal: " + (e && e.message || e)); return true; });
        } });
    }
  }
  function showOnce(user, pw) {
    var d = uaModal({ title: "Password sementara — " + user, okText: "Tutup", cancel: false,
      body: '<p style="margin:0 0 .6rem;color:#64748b">Hanya ditampilkan <b>sekali</b>. Berikan langsung ke user; user wajib ganti saat login.</p>' +
        '<div style="display:flex;gap:.4rem"><input readonly data-show value="' + esc(pw) + '" style="flex:1;font-family:monospace;font-size:1.05rem;padding:.55rem .7rem;border:1px solid #cbd5e1;border-radius:10px"/>' +
        '<button type="button" class="btn btn-outline" data-c style="border-radius:10px">📋 Salin</button></div>' });
    d.querySelector("[data-c]").onclick = function () { var b = this, i = d.querySelector("[data-show]"); i.select();
      var ok = function () { b.textContent = "✓ Tersalin"; };
      try { navigator.clipboard.writeText(pw).then(ok, function () { document.execCommand("copy"); ok(); }); } catch (e) { document.execCommand("copy"); ok(); } };
  }
  function resetForm() {
    EDITING = null; renderMatrix._last = null;
    $("ua-form-title").textContent = "Tambah User";
    $("ua-username").disabled = false; $("ua-username").value = ""; $("ua-password").value = ""; $("ua-divisi").value = "";
    $("ua-pw-wrap").style.display = ""; $("ua-tools").value = "Default"; $("ua-role").value = "OUTLET"; $("ua-outlet").value = "";
    $("ua-cancel").style.display = "none"; renderMatrix(); syncOutlet();
  }
  function saveUser() {
    var msg = $("ua-msg");
    var body = { action: "userSave", mode: EDITING ? "update" : "create", username: EDITING || $("ua-username").value.trim(),
      divisi: $("ua-divisi").value.trim(), role: $("ua-role").value, outlet: $("ua-outlet").value, tools: $("ua-tools").value };
    if (body.tools === "Custom") body.perms = currentPerms();
    if (!EDITING) {
      body.password = $("ua-password").value;
      if (!body.username) { msg.style.color = "#dc2626"; msg.textContent = "Isi username"; return; }
      if (body.password.length < 6) { msg.style.color = "#dc2626"; msg.textContent = "Password minimal 6 karakter"; return; }
    }
    if (body.role === "OUTLET" && !body.outlet) { msg.style.color = "#dc2626"; msg.textContent = "Role OUTLET wajib pilih outlet"; return; }
    msg.style.color = "#64748b"; msg.textContent = "Menyimpan…";
    post(body).then(function (r) {
      if (!r || !r.ok) { msg.style.color = "#dc2626"; msg.textContent = (r && r.error) || "Gagal menyimpan"; return; }
      msg.style.color = "#16a34a"; msg.textContent = (EDITING ? "Perubahan disimpan: " : "User dibuat: ") + r.user.username + (EDITING ? "" : " (wajib ganti password saat login pertama)");
      resetForm(); load();
    }).catch(function (e) { msg.style.color = "#dc2626"; msg.textContent = "Gagal: " + (e && e.message || e); });
  }
  document.addEventListener("patatas-auth", function () { setTimeout(build, 50); });
  if (document.readyState !== "loading") setTimeout(build, 300); else document.addEventListener("DOMContentLoaded", function () { setTimeout(build, 300); });
})();
