(function () {
  if (window.__baBoot) return; window.__baBoot = true;
  var SID = '16Cx2OD5a5mG4ozQD_J5cmidesLqj-_74llTKtUxwGjk';
  function fmt(n) { n = Number(n) || 0; try { return n.toLocaleString('id-ID'); } catch (e) { return String(n); } }
  function cell(c) {
    if (c == null) return '';
    if (typeof c === 'object') return String(c.f != null ? c.f : (c.v != null ? c.v : '')).trim();
    return String(c).trim();
  }
  function punchBg(src) {
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () {
        var c = document.createElement('canvas');
        c.width = im.width; c.height = im.height;
        var ctx = c.getContext('2d');
        ctx.drawImage(im, 0, 0);
        var imgd = ctx.getImageData(0, 0, c.width, c.height), d = imgd.data;
        var br=d[0],bg=d[1],bb=d[2];
        for (var i=0;i<d.length;i+=4){
          var r=d[i],g=d[i+1],b=d[i+2];
          var dist=Math.sqrt((r-br)*(r-br)+(g-bg)*(g-bg)+(b-bb)*(b-bb));
          if (dist<32 || (0.299*r+0.587*g+0.114*b)>228) d[i+3]=0;
        }
        ctx.putImageData(imgd,0,0);
        resolve(c.toDataURL('image/png'));
      };
      im.onerror=function(){resolve(src);}; im.src=src;
    });
  }
  function makeWhite(src) {
    return new Promise(function (resolve) {
      var im=new Image();
      im.onload=function(){
        var c=document.createElement('canvas'); c.width=im.width;c.height=im.height;
        var ctx=c.getContext('2d'); ctx.drawImage(im,0,0);
        var imgd=ctx.getImageData(0,0,c.width,c.height),d=imgd.data;
        for(var i=0;i<d.length;i+=4) if(d[i+3]>0){d[i]=255;d[i+1]=255;d[i+2]=255;}
        ctx.putImageData(imgd,0,0); resolve(c.toDataURL('image/png'));
      };
      im.onerror=function(){resolve(src);}; im.src=src;
    });
  }
  function applyLogo(src, srcW) {
    document.querySelectorAll('.brand img, .sidebar .logo img').forEach(function (img) {
      img.src = img.closest('.sidebar') ? (srcW || src) : src;
      img.style.cssText = 'background:transparent;max-width:220px;width:100%;height:auto;max-height:84px;object-fit:contain;filter:none;display:block';
    });
  }
  function loadLogo() {
    Promise.all(['logo_p0.txt','logo_p1.txt','logo_p2.txt','logo_p3.txt','logo_p4.txt','logo_p5.txt'].map(function(f){return fetch(f+'?v=5').then(function(r){return r.text();});}))
      .then(async function(chunks){
        var raw='data:image/jpeg;base64,'+chunks.join('').replace(/\s/g,'');
        var src=await punchBg(raw); var srcW=await makeWhite(src);
        applyLogo(src,srcW);
        [500,1500].forEach(function(ms){setTimeout(function(){applyLogo(src,srcW);},ms);});
      }).catch(function(){});
  }
  function paintHist(list) {
    var tb=document.getElementById('ba-table-body'); if(!tb) return;
    list=list||window.__baLastList||[];
    if (window.baFilterOutlet) list=window.baFilterOutlet(list);
    var table=tb.closest('table');
    if(table){var head=table.querySelector('thead tr'); if(head) head.innerHTML='<th style="padding:0.5rem">Tanggal</th><th style="padding:0.5rem">Nama</th><th style="padding:0.5rem">Uom</th><th style="padding:0.5rem">Qty</th><th style="padding:0.5rem">Price</th><th style="padding:0.5rem">Total</th><th style="padding:0.5rem">Keterangan</th><th style="padding:0.5rem">Loc</th><th style="padding:0.5rem">Status</th><th style="padding:0.5rem">Aksi</th>';}
    if(!list.length){tb.innerHTML='<tr><td colspan="10" style="padding:1rem;text-align:center;color:#94a3b8">Belum ada data</td></tr>';return;}
    var td='padding:0.45rem;border-bottom:1px solid #f1f5f9';
    tb.innerHTML=list.map(function(r){
      var tot=Number(r.total)||((Number(r.price)||0)*(Number(r.qty)||0));
      var badge=window.baStatusBadge?window.baStatusBadge(r.status):(r.status||'');
      var aksi=window.baAdminButtons?window.baAdminButtons(r):'';
      return '<tr><td style="'+td+'">'+(r.date||'')+'</td><td style="'+td+'">'+(r.name||'')+'</td><td style="'+td+'">'+(r.uom||'')+'</td><td style="'+td+'">'+(r.qty||0)+'</td><td style="'+td+'">'+fmt(r.price)+'</td><td style="'+td+'">'+fmt(tot)+'</td><td style="'+td+'">'+(r.keterangan||'')+'</td><td style="'+td+'">'+(r.loc||'')+'</td><td style="'+td+'">'+badge+'</td><td style="'+td+'">'+aksi+'</td></tr>';
    }).join('');
  }
  window.paintHist = paintHist;
  loadLogo();
  setTimeout(function(){ if(window.__baLastList) paintHist(window.__baLastList); }, 800);
  setTimeout(function(){ if(window.__baLastList) paintHist(window.__baLastList); }, 2000);
})();
