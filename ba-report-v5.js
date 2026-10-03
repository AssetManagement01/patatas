(function () {
  function filt(list) {
    list = (list || []).slice();
    var t = ((document.body && document.body.innerText) || '');
    if (/Dapat melihat semua outlet|EDITOR|HO JKT/i.test(t) && !/OUTLET:\s*[A-Z]/i.test(t)) return list;
    var m = t.match(/Hanya data:\s*([^\n]+)/i) || t.match(/OUTLET:\s*([A-Z0-9 ]+)/i);
    var h = m ? m[1].replace(/OUTLET:.*/i, '').trim().toLowerCase() : '';
    if (!h) return list;
    var keys = /kh|hainan|central park/.test(h) ? ['hainan', 'central park'] : h.split(/[-,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 4; });
    return list.filter(function (r) {
      var L = String(r.loc || r.Loc || r.location || '').toLowerCase();
      for (var i = 0; i < keys.length; i++) if (L.indexOf(keys[i]) >= 0) return true;
      return false;
    });
  }
  window.baFilterOutlet = window.baFilterOutlet || filt;
})();
