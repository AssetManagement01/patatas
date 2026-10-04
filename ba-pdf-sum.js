(function () {
  var old = window.baExportPdf;
  function wrap() {
    var fn = window.baExportPdf;
    if (!fn || fn.__sum) return;
    var next = function () {
      var open = window.open;
      window.open = function () {
        var w = open.apply(window, arguments);
        if (!w) return w;
        var write = w.document.write.bind(w.document);
        w.document.write = function (html) {
          html = String(html).replace('class="sum"', 'class="sum ba-mini"').replace('class="sum"', 'class="sum ba-mini"');
          html = html.replace('</style>', '.ba-mini{width:430px!important;margin:0 0 8px auto!important}h3{text-align:right}</style>');
          return write(html);
        };
        window.open = open;
        return w;
      };
      try { fn(); } finally { window.open = open; }
    };
    next.__sum = 1;
    try {
      Object.defineProperty(window, 'baExportPdf', { configurable: true, get: function () { return next; }, set: function () {} });
    } catch (e) { window.baExportPdf = next; }
  }
  wrap();
  setInterval(wrap, 500);
})();
