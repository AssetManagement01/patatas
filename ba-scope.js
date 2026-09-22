(function () {
  var CODE_MAP = {
    bbm: 'Boemi - Blok M', cba: 'Chop Buntut AKD', cbs: 'Chop Buntut Semarang',
    'ho mdn': 'HEAD OFFICE KEJAKSAAN MEDAN', homdn: 'HEAD OFFICE KEJAKSAAN MEDAN',
    'kh cp': 'Kota Hainan - Central Park', khcp: 'Kota Hainan - Central Park',
    'nr kjk': 'Nanyang Roastery - Kejaksaan Medan', nrkjk: 'Nanyang Roastery - Kejaksaan Medan',
    'nr sp': 'Nanyang Roastery - Sun Plaza Medan', nrsp: 'Nanyang Roastery - Sun Plaza Medan',
    tbm: 'Thirty Bumbu - Taman Anggrek',
    'xo sp': 'XO Suki - Sun Plaza Medan', xosp: 'XO Suki - Sun Plaza Medan',
    hta: 'HIJO - Taman Anggrek', hgs: 'HIJO - Gading Serpong', hk: 'HIJO - Karmaja',
    hakd: 'HIJO - AKD', hevent: 'HIJO - Event', hhq: 'HIJO - HQ', bda: 'Bao Darling - AKD'
  };
  var KW = {
    bbm: ['boemi', 'blok m'],
    cba: ['chop buntut akd', 'akd'],
    cbs: ['chop buntut semarang', 'semarang'],
    'ho mdn': ['kejaksaan medan', 'head office kejaksaan'],
    homdn: ['kejaksaan medan'],
    'kh cp': ['kota hainan', 'central park'],
    khcp: ['kota hainan'],
    'nr kjk': ['nanyang roastery - kejaksaan', 'kejaksaan'],
    nrkjk: ['nanyang roastery - kejaksaan'],
    'nr sp': ['nanyang roastery - sun plaza', 'sun plaza'],
    nrsp: ['nanyang roastery - sun plaza'],
    tbm: ['thirty bumbu'],
    'xo sp': ['xo suki'],
    xosp: ['xo suki'],
    hta: ['hijo - taman anggrek', 'taman anggrek'],
    hgs: ['hijo - gading serpong', 'gading serpong'],
    hk: ['hijo - karmaja', 'karmaja'],
    hakd: ['hijo - akd'],
    hevent: ['hijo - event'],
    hhq: ['hijo - hq'],
    bda: ['bao darling']
  };
  function pageText() {
    return ((document.body && document.body.innerText) || '').replace(/\s+/g, ' ');
  }
  function isSeeAll() {
    var t = pageText();
    if (/OUTLET:\s*[A-Z0-9]/i.test(t)) return false;
    try {
      var s = JSON.parse(localStorage.getItem('patatas_asset_session') || 'null') || {};
      var email = String(s.email || window.USER_EMAIL || '').toLowerCase();
      if (/senoaset|@gmail\.com|\buser\b|\badmin\b|ho jkt|hojkt/.test(email) && !s.outlet) return true;
      var role = String(s.role || '').toLowerCase();
      if (role === 'admin' || role === 'ho' || role === 'user') return true;
    } catch (e) {}
    if (/Dapat melihat semua outlet/i.test(t)) return true;
    if (/\bEDITOR\b|\bHO JKT\b|USER \(Semua/i.test(t) && !/OUTLET:/i.test(t)) return true;
    return false;
  }
  function outletCode() {
    var t = pageText();
    var m = t.match(/OUTLET:\s*([A-Z0-9 ]{2,12})/i);
    if (m) return m[1].toLowerCase().replace(/\s+/g, ' ').trim();
    try {
      var s = JSON.parse(localStorage.getItem('patatas_asset_session') || 'null') || {};
      var o = String(s.outlet || s.outletKeyword || window.USER_OUTLET || '').toLowerCase().trim();
      if (o) {
        var compact = o.replace(/\s+/g, '');
        if (CODE_MAP[compact] || CODE_MAP[o]) return CODE_MAP[compact] ? compact : o;
        for (var k in CODE_MAP) {
          if (o.indexOf(k) >= 0 || CODE_MAP[k].toLowerCase().indexOf(o) >= 0) return k;
        }
        return o;
      }
    } catch (e) {}
    return '';
  }
  function getScope() {
    if (isSeeAll()) return null;
    var code = outletCode();
    if (!code) return null;
    var compact = code.replace(/\s+/g, '');
    return {
      code: code,
      name: CODE_MAP[code] || CODE_MAP[compact] || code,
      keys: KW[code] || KW[compact] || [code]
    };
  }
  function locMatch(loc, scope) {
    if (!scope) return true;
    var L = String(loc || '').toLowerCase();
    if (!L) return false;
    var name = String(scope.name || '').toLowerCase();
    if (name && (L.indexOf(name) >= 0 || name.indexOf(L) >= 0)) return true;
    var keys = scope.keys || [];
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].length >= 3 && L.indexOf(keys[i]) >= 0) return true;
    }
    return false;
  }
  window.baGetScope = getScope;
  window.baFilterOutlet = function (list) {
    var scope = getScope();
    if (!scope || !list) return list || [];
    return list.filter(function (r) {
      return locMatch(r.loc || r.location || r.outlet || '', scope);
    });
  };
})();
