/* Baca data sheet lewat server (Apps Script + login), bukan gviz/CSV publish.
   - <script src=".../gviz/tq?sheet=X...responseHandler:FN"> dialihkan ke action=readSheet lalu FN(resp) dipanggil.
   - fetch ke CSV publish/export dialihkan ke action=readSheet&fmt=csv. */
(function () {
  if (window.__secureRead) return; window.__secureRead = true;
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk', PUB = '2PACX-1vQIfY';
  function api() { return String(window.API_URL || '').replace(/\/$/, ''); }
  function tok() { try { return (JSON.parse(localStorage.getItem('patatas_asset_session') || '{}') || {}).token || ''; } catch (e) { return ''; } }
  function call(params) {
    var u = api() + '?action=readSheet&' + params + '&_=' + Date.now();
    if (!/[?&]token=/.test(u) && tok()) u += '&token=' + encodeURIComponent(tok());
    return (window.__srFetch || window.fetch).call(window, u, { cache: 'no-store', redirect: 'follow' }).then(function (r) { return r.json(); });
  }
  function qp(url, k) { var m = String(url).match(new RegExp('[?&]' + k + '=([^&#]*)')); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; }
  function isSheetUrl(u) { u = String(u || ''); return u.indexOf('docs.google.com/spreadsheets/') >= 0 && (u.indexOf(SID) >= 0 || u.indexOf(PUB) >= 0); }

  // 1) gviz JSONP
  var desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
  Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    configurable: true, get: function () { return desc.get.call(this); },
    set: function (v) {
      var s = String(v || '');
      if (isSheetUrl(s) && s.indexOf('/gviz/') >= 0) {
        var el = this, sheet = qp(s, 'sheet') || '', tqx = qp(s, 'tqx') || '';
        var m = tqx.match(/responseHandler:([A-Za-z0-9_$.]+)/), fn = m ? m[1] : 'google.visualization.Query.setResponse';
        call('sheet=' + encodeURIComponent(sheet)).then(function (j) {
          var resp = (j && j.ok) ? { status: 'ok', table: j.table } : { status: 'error', errors: [{ message: (j && (j.error || j.message)) || 'gagal' }], table: { cols: [], rows: [] } };
          var f = fn.split('.').reduce(function (o, k) { return o && o[k]; }, window);
          if (typeof f === 'function') { try { f(resp); } catch (e) { console.error(e); } }
          el.dispatchEvent(new Event('load'));
        }).catch(function (e) { console.warn('secure-read', e); el.dispatchEvent(new Event('error')); });
        return; // tidak memuat URL Google
      }
      return desc.set.call(this, v);
    }
  });
  var origSet = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (k, v) {
    if (this instanceof HTMLScriptElement && String(k).toLowerCase() === 'src' && isSheetUrl(v)) { this.src = v; return; }
    return origSet.apply(this, arguments);
  };

  // 2) CSV fetch (publish / export / proxy)
  var of = window.fetch; window.__srFetch = of;
  window.fetch = function (input, init) {
    var u = typeof input === 'string' ? input : (input && input.url) || '';
    var inner = u; try { if (!isSheetUrl(u)) inner = decodeURIComponent(u); } catch (e) {}
    if (isSheetUrl(inner) && !/\/gviz\//.test(inner)) {
      var gid = qp(inner, 'gid') || '0';
      return call('gid=' + encodeURIComponent(gid) + '&fmt=csv').then(function (j) {
        if (!j || !j.ok) throw new Error((j && (j.error || j.message)) || 'readSheet gagal');
        return new Response(j.csv, { status: 200, headers: { 'Content-Type': 'text/csv' } });
      });
    }
    return of.apply(this, arguments);
  };
})();
