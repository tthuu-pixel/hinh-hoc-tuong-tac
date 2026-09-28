/* =====================================================================
   KHUNG MÔ HÌNH HÌNH PHẲNG — dùng chung cho mọi hình phẳng lớp 6, 7, 8
   Vẽ bằng SVG. Mỗi tệp mô hình gọi KhungPhang.tao({...}):
     diem      : { A: [x, y], ... }        các điểm kéo được (toạ độ theo cm, trục y hướng lên)
     coDinh    : ['A']                      các điểm không cho kéo
     rangBuoc  : { B: function (p, P, ts) { return p; } }   giới hạn vị trí khi kéo
     thamSo    : thanh trượt (giống khung 3D) · luaChon: nút chọn · hopChon: ô tích
     lamSang   : nút làm nổi bật { id, nhan, mau, ghiChu }
     hoatHinh  : [{ id, nhan, thoiGian }]  — trong ve() dùng g.hoat('id') để lấy tiến độ 0..1
     ve(g, P, ts)       : vẽ hình bằng các lệnh g.doan, g.daGiac, g.goc ...
     congThuc(P, ts, C) : các dòng công thức · nhanXet(P, ts): khung nhận xét tự cập nhật
   ===================================================================== */
(function () {
  'use strict';

  var MAU = {
    canh: '#E0342F', chieuDai: '#E0342F', chieuRong: '#1E6FE0', chieuCao: '#92400E',
    duongCheo: '#C026D3', goc1: '#E0342F', goc2: '#1E6FE0', goc3: '#16A34A', goc4: '#F59E0B',
    chuVi: '#E0342F', dienTich: '#F59E0B', song: '#7C3AED', trucDX: '#C026D3', tam: '#0D9488',
    phu: '#0891B2',
  };
  var MAU_NET = '#1B2540', MAU_TO = '#BFD3FA';

  /* ---------- Tiện ích số & hình học ---------- */
  // Số dạng LaTeX: dấu phẩy thập phân không bị giãn cách
  function soL(x, le) { return so(x, le).replace(',', '{,}'); }
  function so(x, le) {
    if (le === undefined) le = 2;
    var r = Math.round(x * Math.pow(10, le)) / Math.pow(10, le);
    if (Math.abs(r) < 1e-9) r = 0;
    return String(r).replace('.', ',');
  }
  var H = {
    cong: function (A, B) { return [A[0] + B[0], A[1] + B[1]]; },
    tru: function (A, B) { return [A[0] - B[0], A[1] - B[1]]; },
    nhan: function (A, k) { return [A[0] * k, A[1] * k]; },
    dai: function (A, B) { return Math.hypot(B[0] - A[0], B[1] - A[1]); },
    trung: function (A, B) { return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; },
    lerp: function (A, B, t) { return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]; },
    huong: function (A, B) { return Math.atan2(B[1] - A[1], B[0] - A[0]); },
    xoay: function (P, O, a) { var c = Math.cos(a), s = Math.sin(a), x = P[0] - O[0], y = P[1] - O[1]; return [O[0] + x * c - y * s, O[1] + x * s + y * c]; },
    chan: function (P, A, B) {   // chân đường vuông góc từ P xuống đường thẳng AB
      var d = H.tru(B, A), t = ((P[0] - A[0]) * d[0] + (P[1] - A[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]);
      return [A[0] + d[0] * t, A[1] + d[1] * t];
    },
    doiXung: function (P, A, B) { var K = H.chan(P, A, B); return [2 * K[0] - P[0], 2 * K[1] - P[1]]; },
    giao: function (A, B, C, D) {
      var d1 = H.tru(B, A), d2 = H.tru(D, C), m = d1[0] * d2[1] - d1[1] * d2[0];
      if (Math.abs(m) < 1e-12) return null;
      var t = ((C[0] - A[0]) * d2[1] - (C[1] - A[1]) * d2[0]) / m;
      return [A[0] + d1[0] * t, A[1] + d1[1] * t];
    },
    gocDo: function (A, O, B) {   // số đo góc AOB (0..180°)
      var a = H.tru(A, O), b = H.tru(B, O), la = Math.hypot(a[0], a[1]), lb = Math.hypot(b[0], b[1]);
      if (la < 1e-9 || lb < 1e-9) return 0;
      return Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (la * lb)))) * 180 / Math.PI;
    },
    dienTich: function (ds) { var s = 0; for (var i = 0; i < ds.length; i++) { var p = ds[i], q = ds[(i + 1) % ds.length]; s += p[0] * q[1] - q[0] * p[1]; } return Math.abs(s) / 2; },
    chuVi: function (ds) { var s = 0; for (var i = 0; i < ds.length; i++) s += H.dai(ds[i], ds[(i + 1) % ds.length]); return s; },
    trongTam: function (A, B, C) { return [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3]; },
    noiTiep: function (A, B, C) { var a = H.dai(B, C), b = H.dai(C, A), c = H.dai(A, B), p = a + b + c; return [(a * A[0] + b * B[0] + c * C[0]) / p, (a * A[1] + b * B[1] + c * C[1]) / p]; },
    ngoaiTiep: function (A, B, C) {
      var d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
      if (Math.abs(d) < 1e-12) return null;
      var a2 = A[0] * A[0] + A[1] * A[1], b2 = B[0] * B[0] + B[1] * B[1], c2 = C[0] * C[0] + C[1] * C[1];
      return [(a2 * (B[1] - C[1]) + b2 * (C[1] - A[1]) + c2 * (A[1] - B[1])) / d, (a2 * (C[0] - B[0]) + b2 * (A[0] - C[0]) + c2 * (B[0] - A[0])) / d];
    },
    trucTam: function (A, B, C) { var O = H.ngoaiTiep(A, B, C); return O ? [A[0] + B[0] + C[0] - 2 * O[0], A[1] + B[1] + C[1] - 2 * O[1]] : null; },
    songSong: function (A, B, C, D) { var u = H.tru(B, A), v = H.tru(D, C); return Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-3 * Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]); },
    vuongGoc: function (A, B, C, D) { var u = H.tru(B, A), v = H.tru(D, C); return Math.abs(u[0] * v[0] + u[1] * v[1]) < 1e-3 * Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]); },
    bang: function (x, y) { return Math.abs(x - y) < 1e-3 * Math.max(1, Math.abs(x), Math.abs(y)); },
    // Dời hình (quay + tịnh tiến) một đa giác từ vị trí ds0 sang ds1 bằng nhau, tiến độ t
    doiHinh: function (ds0, ds1, t) {
      var a0 = H.huong(ds0[0], ds0[1]), a1 = H.huong(ds1[0], ds1[1]), da = a1 - a0;
      while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      var c0 = tam(ds0), c1 = tam(ds1), c = H.lerp(c0, c1, t);
      return ds0.map(function (p) { var q = H.xoay(p, c0, da * t); return [q[0] - c0[0] + c[0], q[1] - c0[1] + c[1]]; });
      function tam(ds) { var x = 0, y = 0; ds.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / ds.length, y / ds.length]; }
    },
    em: function (t) { t = Math.max(0, Math.min(1, t)); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    doan: function (t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); },   // tiến độ con trong [a, b]
  };

  var ICON = {
    phong: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/></svg>',
    thu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6"/></svg>',
    vua: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"/></svg>',
    luoi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/></svg>',
    datLai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    toan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  };
  function thoat(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function giaTri(x, a, b) { return typeof x === 'function' ? x(a, b) : x; }

  /* =====================================================================
     TẠO MÔ HÌNH
     ===================================================================== */
  function tao(cfg) {
    document.body.classList.add('trang-mo-hinh');
    document.title = cfg.ten + ' · ' + ((window.CAU_HINH || {}).TEN_NGAN || (window.CAU_HINH || {}).TEN_SAN_PHAM || '');
    if (window.GiaoDien) GiaoDien.thanhTren({ quayLai: '../../thu-vien.html' });

    var P = {}, P0 = {};
    Object.keys(cfg.diem || {}).forEach(function (k) { P[k] = cfg.diem[k].slice(); P0[k] = cfg.diem[k].slice(); });
    var ts = {};
    (cfg.thamSo || []).forEach(function (p) { ts[p.khoa] = p.gt; });
    (cfg.luaChon || []).forEach(function (l) { ts[l.khoa] = l.gt; });
    (cfg.hopChon || []).forEach(function (h) { ts[h.khoa] = !!h.gt; });
    var dsSang = cfg.lamSang || [], mapSang = {};
    dsSang.forEach(function (s) { mapSang[s.id] = s; });
    var coDinh = {}; (cfg.coDinh || []).forEach(function (k) { coDinh[k] = 1; });

    var TT = {
      dangSang: [], thoiDiemBat: {},
      hienLuoi: cfg.hienLuoi !== false, batLuoi: cfg.batLuoi !== false, hienTen: true, hienSo: true,
      hoat: null,              // { id, t, chay, t0, dai }
      keo: null, daKeo: false,
    };
    var buocLuoi = cfg.buocLuoi || 0.5;

    /* ---------- Khung trang ---------- */
    var goc = document.getElementById('mo-hinh');
    var mauLop = { 6: 'var(--lop6)', 7: 'var(--lop7)', 8: 'var(--lop8)', 9: 'var(--lop9)' }[cfg.lop] || 'var(--chinh)';
    goc.innerHTML =
      '<div class="mh" id="mh">' +
      '  <div class="mh-canh phang" id="mh-canh">' +
      '    <svg class="phang-svg" id="phang-svg" xmlns="http://www.w3.org/2000/svg"></svg>' +
      '    <div class="mh-tieu-de">' + thoat(cfg.ten) + '<span style="background:' + mauLop + '">Lớp ' + cfg.lop + '</span></div>' +
      '    <div class="mh-ghi-chu an-mo" id="mh-ghi-chu"></div>' +
      '    <div class="goi-y-keo" id="goi-y-keo">' + (cfg.goiY || 'Kéo các chấm tròn để thay đổi hình') + '</div>' +
      '    <div class="mh-cong-cu" id="mh-cong-cu"></div>' +
      '  </div>' +
      '  <aside class="mh-bang" id="mh-bang"></aside>' +
      '</div>';
    var khung = document.getElementById('mh-canh'), svg = document.getElementById('phang-svg');
    var bang = document.getElementById('mh-bang'), elGhiChu = document.getElementById('mh-ghi-chu');
    if (!Object.keys(P).filter(function (k) { return !coDinh[k]; }).length) document.getElementById('goi-y-keo').classList.add('an');

    /* ---------- Khung nhìn: toạ độ thế giới (cm) <-> điểm ảnh ---------- */
    var V = { cx: 0, cy: 0, s: 40, W: 800, H: 600 };
    function X(p) { return V.W / 2 + (p[0] - V.cx) * V.s; }
    function Y(p) { return V.H / 2 - (p[1] - V.cy) * V.s; }
    function veThe(x, y) { return [V.cx + (x - V.W / 2) / V.s, V.cy - (y - V.H / 2) / V.s]; }
    function vuaKhung(tucThi) {
      var ds = Object.keys(P).filter(function (k) { return !(cfg.anTayCam && cfg.anTayCam(k, P, ts)); }).map(function (k) { return P[k]; });
      if (cfg.khungNhin) { var kn = typeof cfg.khungNhin === 'function' ? cfg.khungNhin(P, ts, bat) : cfg.khungNhin; ds = ds.concat(kn); }
      if (!ds.length) ds = [[-5, -5], [5, 5]];
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      ds.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
      var le = cfg.le == null ? 1.6 : cfg.le;
      x0 -= le; x1 += le; y0 -= le; y1 += le;
      var dich = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, s: Math.min(V.W / (x1 - x0), (V.H - 150) / (y1 - y0)) };
      dich.s = Math.max(6, Math.min(160, dich.s));
      dich.cy += 22 / dich.s;   // phía trên có tiêu đề + ghi chú cao hơn thanh công cụ phía dưới
      if (tucThi) { V.cx = dich.cx; V.cy = dich.cy; V.s = dich.s; ve(); return; }
      hoatNhin = { t0: performance.now(), tu: { cx: V.cx, cy: V.cy, s: V.s }, den: dich };
    }
    var hoatNhin = null;

    /* =====================================================================
       BỘ LỆNH VẼ (g)
       ===================================================================== */
    var out = [], bamDiem = [];
    function bat(id) { return TT.dangSang.indexOf(id) >= 0; }
    function nhip(id) {
      var dt = (performance.now() - (TT.thoiDiemBat[id] || 0)) / 1000;
      return dt > 2.4 ? 0 : 0.5 + 0.5 * Math.sin(dt * Math.PI * 2 * 1.6);
    }
    function kieuNet(o) {
      o = o || {};
      var id = o.sang, on = id && bat(id);
      var mau = on ? mapSang[id].mau : (o.mau || MAU_NET);
      var rong = on ? (o.rongSang || 5) + 3 * nhip(id) : (o.rong || 2.5);
      var dut = o.dut ? ' stroke-dasharray="' + (o.dut === true ? '7 6' : o.dut) + '"' : '';
      var mo = TT.dangSang.length && id && !on && o.mo !== false ? 0.55 : (o.doMo == null ? 1 : o.doMo);
      return { mau: mau, rong: rong, dut: dut, on: on, mo: mo };
    }
    function an(o) { return o && o.chiKhiSang && !bat(o.sang); }
    function pts(ds) { return ds.map(function (p) { return X(p).toFixed(1) + ',' + Y(p).toFixed(1); }).join(' '); }

    var g = {
      H: H, so: so, MAU: MAU,
      bat: bat,
      hoat: function (id) { return TT.hoat && TT.hoat.id === id ? TT.hoat.t : null; },
      tg: function (id) { return bat(id) ? (performance.now() - (TT.thoiDiemBat[id] || 0)) / 1000 : null; },
      raw: function (s) { out.push(s); },
      X: X, Y: Y,
      tamNhin: function () { return [V.cx, V.cy]; },
      hienSo: function () { return TT.hienSo; },
      tiLe: function () { return V.s; },
      daGiac: function (ds, o) {
        o = o || {}; if (an(o)) return;
        var on = o.sang && bat(o.sang);
        var to = on ? mapSang[o.sang].mau : (o.to === undefined ? MAU_TO : o.to);
        var doMo = on ? 0.45 + 0.2 * nhip(o.sang) : (o.doMoTo == null ? 0.35 : o.doMoTo);
        var k = kieuNet(o.net ? { sang: o.sangNet, mau: o.net, rong: o.rong, dut: o.dut } : { mau: o.mauNet, rong: o.rong == null ? 2.5 : o.rong, dut: o.dut });
        out.push('<polygon points="' + pts(ds) + '" fill="' + (to || 'none') + '" fill-opacity="' + (to ? doMo : 0) + '" stroke="' + (o.khongVien ? 'none' : k.mau) + '" stroke-width="' + k.rong + '"' + k.dut + ' stroke-linejoin="round"/>');
      },
      doan: function (A, B, o) {
        o = o || {}; if (an(o)) return;
        var k = kieuNet(o);
        out.push('<line x1="' + X(A).toFixed(1) + '" y1="' + Y(A).toFixed(1) + '" x2="' + X(B).toFixed(1) + '" y2="' + Y(B).toFixed(1) + '" stroke="' + k.mau + '" stroke-width="' + k.rong + '" stroke-opacity="' + k.mo + '"' + k.dut + ' stroke-linecap="round"/>');
        if (o.kyHieu) g.kyHieu(A, B, o.kyHieu, k.mau);
      },
      // Đường thẳng đi qua A, B (kéo dài hết khung nhìn)
      duongThang: function (A, B, o) {
        o = o || {};
        var d = H.tru(B, A), L = Math.hypot(d[0], d[1]); if (L < 1e-9) return;
        if (cfg.doanNgan !== false && !o.daiHet) {
          var du = (o.du == null ? 1.2 : o.du) / L;
          g.doan(H.cong(A, H.nhan(d, -du)), H.cong(B, H.nhan(d, du)), o); return;
        }
        var k = (V.W + V.H) / V.s * 2 / L;
        g.doan(H.cong(A, H.nhan(d, -k)), H.cong(A, H.nhan(d, k)), o);
      },
      tia: function (O, A, o) {
        o = o || {};
        var d = H.tru(A, O), L = Math.hypot(d[0], d[1]); if (L < 1e-9) return;
        if (cfg.doanNgan !== false && !o.daiHet) { g.doan(O, H.cong(A, H.nhan(d, (o.du == null ? 1 : o.du) / L)), o); return; }
        g.doan(O, H.cong(O, H.nhan(d, (V.W + V.H) / V.s * 2 / L)), o);
      },
      // Đường gấp khúc (nét), o.rongCm: độ dày tính theo cm (chữ cái khối)
      duong: function (ds, o) {
        o = o || {}; if (an(o) || ds.length < 2) return;
        var k = kieuNet(o), rong = o.rongCm ? o.rongCm * V.s : k.rong;
        out.push('<polyline points="' + pts(ds) + '" fill="none" stroke="' + k.mau + '" stroke-width="' + rong.toFixed(1) + '" stroke-opacity="' + k.mo + '"' + k.dut + ' stroke-linecap="round" stroke-linejoin="round"/>');
      },
      // Ký hiệu đoạn bằng nhau: n vạch nhỏ ở giữa đoạn
      kyHieu: function (A, B, n, mau) {
        var M = H.trung(A, B), a = H.huong(A, B) + Math.PI / 2, dd = 7 / V.s, kc = 5 / V.s;
        var u = [Math.cos(a - Math.PI / 2), Math.sin(a - Math.PI / 2)];
        for (var i = 0; i < n; i++) {
          var c = H.cong(M, H.nhan(u, (i - (n - 1) / 2) * kc));
          var p = H.cong(c, [Math.cos(a) * dd, Math.sin(a) * dd]), q = H.cong(c, [-Math.cos(a) * dd, -Math.sin(a) * dd]);
          out.push('<line x1="' + X(p) + '" y1="' + Y(p) + '" x2="' + X(q) + '" y2="' + Y(q) + '" stroke="' + (mau || MAU_NET) + '" stroke-width="2.2"/>');
        }
      },
      // Góc AOB: cung (theo chiều ngắn), tô quạt, ký hiệu nhiều cung, nhãn số đo
      goc: function (A, O, B, o) {
        o = o || {}; if (an(o)) return;
        var on = o.sang && bat(o.sang), mau = on ? mapSang[o.sang].mau : (o.mau || MAU_NET);
        var r = (o.r || 26) + (on ? 4 * nhip(o.sang) : 0);
        var a0 = H.huong(O, A), a1 = H.huong(O, B), da = a1 - a0;
        while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        if (o.lon) da = da > 0 ? da - 2 * Math.PI : da + 2 * Math.PI;
        var deg = Math.abs(da) * 180 / Math.PI;
        var ox = X(O), oy = Y(O);
        if (o.vuong !== false && Math.abs(deg - 90) < 0.05 && !o.lon) {
          var s = Math.max(o.canhVuong || 20, r * 0.62), u = [Math.cos(a0), Math.sin(a0)], v = [Math.cos(a1), Math.sin(a1)];   // ký hiệu góc vuông: cạnh tối thiểu 20px
          var p1 = [ox + u[0] * s, oy - u[1] * s], p2 = [ox + (u[0] + v[0]) * s, oy - (u[1] + v[1]) * s], p3 = [ox + v[0] * s, oy - v[1] * s];
          if (o.to !== false) out.push('<polygon points="' + ox + ',' + oy + ' ' + p1 + ' ' + p2 + ' ' + p3 + '" fill="' + mau + '" fill-opacity="' + (on ? 0.35 : (o.doMoTo || 0.18)) + '"/>');
          out.push('<polyline points="' + p1 + ' ' + p2 + ' ' + p3 + '" fill="none" stroke="' + mau + '" stroke-width="2.4" stroke-linejoin="miter"/>');
        } else {
          var cung = function (rr) {
            var n = Math.max(6, Math.ceil(Math.abs(da) * 24)), s2 = '';
            for (var i = 0; i <= n; i++) { var a = a0 + da * i / n; s2 += (ox + rr * Math.cos(a)).toFixed(1) + ',' + (oy - rr * Math.sin(a)).toFixed(1) + ' '; }
            return s2;
          };
          if (o.to !== false) out.push('<polygon points="' + ox + ',' + oy + ' ' + cung(r) + '" fill="' + mau + '" fill-opacity="' + (on ? 0.4 : (o.doMoTo || 0.2)) + '"/>');
          for (var j = 0; j < (o.kyHieu || 1); j++) out.push('<polyline points="' + cung(r - j * 5) + '" fill="none" stroke="' + mau + '" stroke-width="' + (on ? 2.6 : 2) + '"/>');
        }
        var laVuong = o.vuong !== false && Math.abs(deg - 90) < 0.05 && !o.lon;
        if (o.nhan !== false && (TT.hienSo || o.nhan) && !(laVuong && !o.nhanVuong && typeof o.nhan !== 'string')) {
          var am = a0 + da / 2, rn = r + (o.xaNhan || 16);
          var chu = typeof o.nhan === 'string' ? o.nhan : so(deg, o.le == null ? 0 : o.le) + '°';
          out.push('<text class="chu" x="' + (ox + rn * Math.cos(am)).toFixed(1) + '" y="' + (oy - rn * Math.sin(am) + 6).toFixed(1) + '" text-anchor="middle" fill="' + mau + '">' + thoat(chu) + '</text>');
        }
        return deg;
      },
      duongTron: function (O, r, o) {
        o = o || {}; if (an(o)) return;
        var k = kieuNet(o);
        out.push('<circle cx="' + X(O) + '" cy="' + Y(O) + '" r="' + (r * V.s).toFixed(1) + '" fill="' + (o.to || 'none') + '" fill-opacity="' + (o.doMoTo || 0.15) + '" stroke="' + k.mau + '" stroke-width="' + k.rong + '"' + k.dut + '/>');
      },
      // Hình quạt tâm O bán kính r (cm), từ góc a0 đến a1 (radian)
      quat: function (O, r, a0, a1, o) {
        o = o || {}; if (an(o)) return;
        var n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * 30)), s = X(O) + ',' + Y(O) + ' ';
        for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; s += X([O[0] + r * Math.cos(a), 0]).toFixed(1) + ',' + Y([0, O[1] + r * Math.sin(a)]).toFixed(1) + ' '; }
        out.push('<polygon points="' + s + '" fill="' + (o.to || MAU_TO) + '" fill-opacity="' + (o.doMoTo == null ? 0.6 : o.doMoTo) + '" stroke="' + (o.mau || MAU_NET) + '" stroke-width="' + (o.rong || 2) + '" stroke-linejoin="round"/>');
      },
      diem: function (Pt, ten, o) {
        o = o || {}; if (an(o)) return;
        var on = o.sang && bat(o.sang), mau = on ? mapSang[o.sang].mau : (o.mau || MAU_NET);
        out.push('<circle cx="' + X(Pt) + '" cy="' + Y(Pt) + '" r="' + (o.r || 4) + '" fill="' + mau + '"/>');
        if (ten && TT.hienTen) {
          var h = o.huong || [-0.7, 0.7], L = Math.hypot(h[0], h[1]) || 1, kc = o.kc || 18;
          out.push('<text class="ten-diem" x="' + (X(Pt) + h[0] / L * kc).toFixed(1) + '" y="' + (Y(Pt) - h[1] / L * kc + 7).toFixed(1) + '" text-anchor="middle"' + (on ? ' style="fill:' + mau + '"' : '') + '>' + thoat(String(ten).replace(/'/g, '′')) + '</text>');
        }
      },
      chu: function (Pt, text, o) {
        o = o || {}; if (an(o)) return;
        var on = o.sang && bat(o.sang), mau = on ? mapSang[o.sang].mau : (o.mau || MAU_NET);
        out.push('<text class="' + (o.nho ? 'chu-nho' : 'chu') + '" x="' + (X(Pt) + (o.dx || 0)).toFixed(1) + '" y="' + (Y(Pt) + (o.dy || 0) + 6).toFixed(1) + '" text-anchor="' + (o.canh || 'middle') + '" fill="' + mau + '"' + (o.nghieng ? ' font-style="italic"' : '') + '>' + thoat(text) + '</text>');
      },
      // Công thức LaTeX đặt trên hình (foreignObject). o: co (cỡ chữ px), mau, canh ('middle' | 'start' | 'end')
      latex: function (Pt, tex, o) {
        o = o || {};
        var html = window.Latex ? window.Latex.chuoi(tex) : null;
        if (html === null) { if (window.Latex && !TT.choLatex) { TT.choLatex = true; window.Latex.khiXong(function () { capNhat(); }); } g.chu(Pt, tex.replace(/\\[a-zA-Z]+|[{}]/g, ''), { mau: o.mau }); return; }
        var W = 900, Hh = 200, canh = o.canh || 'middle', x = X(Pt) - (canh === 'middle' ? W / 2 : canh === 'end' ? W : 0), y = Y(Pt) - Hh / 2;
        out.push('<foreignObject x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + W + '" height="' + Hh + '" style="pointer-events:none;overflow:visible">' +
          '<div xmlns="http://www.w3.org/1999/xhtml" style="height:' + Hh + 'px;display:flex;align-items:center;justify-content:' + (canh === 'middle' ? 'center' : canh === 'end' ? 'flex-end' : 'flex-start') +
          ';font-size:' + (o.co || 20) + 'px;color:' + (o.mau || MAU_NET) + ';white-space:nowrap">' + html + '</div></foreignObject>');
      },
      // ---------- Dụng cụ vẽ hình (thước thẳng, bút chì, compa) — vẽ bằng SVG ----------
      // Thước thẳng đặt dọc đoạn AB (o.ben = 1 | -1: thước nằm bên nào của đường)
      thuoc: function (A, B, o) {
        o = o || {};
        var ax = X(A), ay = Y(A), bx = X(B), by = Y(B), L = Math.hypot(bx - ax, by - ay); if (L < 1) return;
        var ux = (bx - ax) / L, uy = (by - ay) / L, ben = o.ben || 1, nx = -uy * ben, ny = ux * ben, du = 26, day = 30;
        var p = function (t, h) { return (ax + ux * t + nx * h).toFixed(1) + ',' + (ay + uy * t + ny * h).toFixed(1); };
        var s2 = '<g opacity="' + (o.doMo == null ? 0.92 : o.doMo) + '" style="pointer-events:none">';
        s2 += '<polygon points="' + p(-du, 2) + ' ' + p(L + du, 2) + ' ' + p(L + du, day) + ' ' + p(-du, day) + '" fill="#FEF3C7" fill-opacity="0.82" stroke="#B45309" stroke-width="1.6"/>';
        for (var t = -du + 6, i = 0; t < L + du - 4; t += 8, i++) {
          var h = i % 5 === 0 ? 10 : 5;
          s2 += '<line x1="' + (ax + ux * t + nx * 2).toFixed(1) + '" y1="' + (ay + uy * t + ny * 2).toFixed(1) + '" x2="' + (ax + ux * t + nx * (2 + h)).toFixed(1) + '" y2="' + (ay + uy * t + ny * (2 + h)).toFixed(1) + '" stroke="#92400E" stroke-width="1"/>';
        }
        out.push(s2 + '</g>');
      },
      // Bút chì: đầu chì tại P, thân nghiêng lên bên phải
      but: function (Pt, o) {
        o = o || {};
        var x = X(Pt), y = Y(Pt), a = (o.goc == null ? -58 : o.goc) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
        var p = function (t, h) { return (x + ux * t + nx * h).toFixed(1) + ',' + (y + uy * t + ny * h).toFixed(1); };
        var w = 7, s2 = '<g style="pointer-events:none">';
        s2 += '<polygon points="' + p(0, 0) + ' ' + p(22, w) + ' ' + p(22, -w) + '" fill="#F5D0A9" stroke="#92400E" stroke-width="1"/>';
        s2 += '<polygon points="' + p(0, 0) + ' ' + p(7, 2.2) + ' ' + p(7, -2.2) + '" fill="#1E293B"/>';
        s2 += '<polygon points="' + p(22, w) + ' ' + p(112, w) + ' ' + p(112, -w) + ' ' + p(22, -w) + '" fill="#F59E0B" stroke="#B45309" stroke-width="1"/>';
        s2 += '<line x1="' + p(22, 0).split(',')[0] + '" y1="' + p(22, 0).split(',')[1] + '" x2="' + p(112, 0).split(',')[0] + '" y2="' + p(112, 0).split(',')[1] + '" stroke="#FCD34D" stroke-width="2"/>';
        s2 += '<polygon points="' + p(112, w) + ' ' + p(122, w) + ' ' + p(122, -w) + ' ' + p(112, -w) + '" fill="#CBD5E1" stroke="#64748B" stroke-width="1"/>';
        s2 += '<polygon points="' + p(122, w) + ' ' + p(134, w) + ' ' + p(134, -w) + ' ' + p(122, -w) + '" fill="#F472B6" stroke="#BE185D" stroke-width="1"/>';
        out.push(s2 + '</g>');
      },
      // Compa: mũi kim tại O, đầu chì tại T (hai điểm trên hình)
      compa: function (O, T, o) {
        o = o || {};
        var ox = X(O), oy = Y(O), tx = X(T), ty = Y(T), d = Math.hypot(tx - ox, ty - oy);
        var L = Math.max(d / 2 + 24, d * 0.72, 90), hh = Math.sqrt(Math.max(0, L * L - d * d / 4));
        var mx = (ox + tx) / 2, my = (oy + ty) / 2, nx = d > 1 ? -(ty - oy) / d : 0, ny = d > 1 ? (tx - ox) / d : -1;
        if (ny > 0) { nx = -nx; ny = -ny; }                       // khớp compa luôn ở phía trên
        var hx = mx + nx * hh, hy = my + ny * hh;
        var s2 = '<g style="pointer-events:none">';
        var chan = function (x2, y2, laBut) {
          var dx = x2 - hx, dy = y2 - hy, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, k = laBut ? 22 : 10;
          var gx = x2 - ux * k, gy = y2 - uy * k;
          var r = '<line x1="' + hx.toFixed(1) + '" y1="' + hy.toFixed(1) + '" x2="' + gx.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke="#64748B" stroke-width="7" stroke-linecap="round"/>';
          r += '<line x1="' + hx.toFixed(1) + '" y1="' + hy.toFixed(1) + '" x2="' + gx.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>';
          if (laBut) r += '<line x1="' + gx.toFixed(1) + '" y1="' + gy.toFixed(1) + '" x2="' + (x2 - ux * 5).toFixed(1) + '" y2="' + (y2 - uy * 5).toFixed(1) + '" stroke="#F59E0B" stroke-width="6" stroke-linecap="butt"/>' +
            '<line x1="' + (x2 - ux * 6).toFixed(1) + '" y1="' + (y2 - uy * 6).toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>';
          else r += '<line x1="' + gx.toFixed(1) + '" y1="' + gy.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#334155" stroke-width="2" stroke-linecap="round"/>';
          return r;
        };
        s2 += chan(ox, oy, false) + chan(tx, ty, true);
        s2 += '<line x1="' + hx.toFixed(1) + '" y1="' + hy.toFixed(1) + '" x2="' + (hx + nx * 22).toFixed(1) + '" y2="' + (hy + ny * 22).toFixed(1) + '" stroke="#1E293B" stroke-width="7" stroke-linecap="round"/>';
        s2 += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="7.5" fill="#475569" stroke="#1E293B" stroke-width="1.5"/>';
        out.push(s2 + '</g>');
      },
      // Thước đo góc (nửa hình tròn) tâm O, vạch 0° theo hướng a0 (radian), chia độ theo chiều dau (+1 ngược kim đồng hồ)
      thuocDoGoc: function (O, a0, dau, r, o) {
        o = o || {};
        var mo = o.doMo == null ? 1 : o.doMo, ds = [O];
        for (var i = 0; i <= 36; i++) { var a = a0 + dau * Math.PI * i / 36; ds.push([O[0] + r * Math.cos(a), O[1] + r * Math.sin(a)]); }
        g.daGiac(ds, { to: '#FEF3C7', doMoTo: 0.8 * mo, mauNet: '#B45309', rong: 1.5 });
        for (var d = 0; d <= 180; d += 10) {
          var a2 = a0 + dau * d * Math.PI / 180, p = [O[0] + r * Math.cos(a2), O[1] + r * Math.sin(a2)], q = [O[0] + r * (d % 30 ? 0.92 : 0.86) * Math.cos(a2), O[1] + r * (d % 30 ? 0.92 : 0.86) * Math.sin(a2)];
          g.doan(p, q, { mau: '#92400E', rong: 1.2, doMo: mo });
          if (d % 30 === 0 && mo > 0.5) g.chu([O[0] + r * 0.74 * Math.cos(a2), O[1] + r * 0.74 * Math.sin(a2)], String(d), { nho: true, mau: '#92400E' });
        }
        g.diem(O, '', { r: 3, mau: '#B45309' });
      },
      // Nhãn số đo dạng viên thuốc bên cạnh đoạn AB (phía "ra" theo hướng vuông góc)
      nhanDo: function (A, B, text, o) {
        o = o || {}; if (an(o) || !TT.hienSo) return;
        var on = o.sang && bat(o.sang), mau = on ? mapSang[o.sang].mau : (o.mau || '#475569');
        var M = H.lerp(A, B, o.t == null ? 0.5 : o.t), a = H.huong(A, B) + (o.benTrai === false ? -Math.PI / 2 : Math.PI / 2);
        var kc = (o.kc || 22) / V.s, Q = [M[0] + Math.cos(a) * kc, M[1] + Math.sin(a) * kc];
        var w = text.length * 8.6 + 16, x = X(Q), y = Y(Q);
        out.push('<g><rect x="' + (x - w / 2).toFixed(1) + '" y="' + (y - 13) + '" width="' + w.toFixed(1) + '" height="26" rx="13" fill="' + mau + '"/>' +
                 '<text x="' + x.toFixed(1) + '" y="' + (y + 5.5) + '" text-anchor="middle" fill="#fff" style="font-family:var(--phong-toan);font-size:16px;font-weight:700">' + thoat(text) + '</text></g>');
      },
      // Lưới ô vuông tô màu (đếm ô diện tích): ô đơn vị từ (x0,y0) kích thước w×h ô, hiện n ô đầu
      oVuong: function (x0, y0, w, h, n, o) {
        o = o || {}; var dem = 0;
        for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
          if (dem >= n) return;
          var p = [x0 + i, y0 + j + 1];
          out.push('<rect x="' + (X(p) + 1.5).toFixed(1) + '" y="' + (Y(p) + 1.5).toFixed(1) + '" width="' + (V.s - 3).toFixed(1) + '" height="' + (V.s - 3).toFixed(1) + '" rx="3" fill="' + (o.to || MAU.dienTich) + '" fill-opacity="' + ((j % 2) ? 0.55 : 0.75) + '"/>');
          dem++;
        }
      },
    };

    /* ---------- Vẽ toàn bộ ---------- */
    function veLuoi() {
      if (!TT.hienLuoi || V.s < 8) return;
      var a = veThe(0, V.H), b = veThe(V.W, 0), s = '';
      for (var x = Math.floor(a[0]); x <= b[0]; x++) { var px = X([x, 0]).toFixed(1); s += '<line x1="' + px + '" y1="0" x2="' + px + '" y2="' + V.H + '" stroke="' + (x % 5 ? '#E3E9F3' : '#CBD5E6') + '"/>'; }
      for (var y = Math.floor(a[1]); y <= b[1]; y++) { var py = Y([0, y]).toFixed(1); s += '<line x1="0" y1="' + py + '" x2="' + V.W + '" y2="' + py + '" stroke="' + (y % 5 ? '#E3E9F3' : '#CBD5E6') + '"/>'; }
      out.push('<g stroke-width="1">' + s + '</g>');
    }
    function ve() {
      out = [];
      veLuoi();
      cfg.ve(g, P, ts);
      // tay cầm các điểm kéo được
      bamDiem = [];
      if (!(TT.hoat && TT.hoat.anDiem)) Object.keys(P).forEach(function (k) {
        if (coDinh[k] || (cfg.anTayCam && cfg.anTayCam(k, P, ts))) return;
        bamDiem.push(k);
        out.push('<circle class="vien-keo' + (TT.keo && TT.keo.ten === k ? ' dang' : '') + '" cx="' + X(P[k]) + '" cy="' + Y(P[k]) + '" r="13"/>');
      });
      svg.innerHTML = out.join('');
    }
    var canVe = true;
    function capNhat() { canVe = true; }
    function capNhatBang() { capNhatHien(); capNhatCongThuc(); capNhatNhanXet(); capNhatGhiChu(); }
    function capNhatHien() {   // nút có hàm hien(P, ts) chỉ hiện khi phù hợp (ví dụ theo chế độ đang chọn)
      if (!bang) return;
      bang.querySelectorAll('.nut-sang').forEach(function (b) {
        var m = mapSang[b.dataset.sang]; if (!m || !m.hien) return;
        b.style.display = m.hien(P, ts) ? '' : 'none';   // nút bị ẩn vẫn giữ trạng thái bật/tắt, hiện lại khi đổi chế độ
      });
      bang.querySelectorAll('[data-hoat]').forEach(function (b) {
        var a = (cfg.hoatHinh || []).filter(function (x) { return x.id === b.dataset.hoat; })[0];
        if (a && a.hien) b.style.display = a.hien(P, ts) ? '' : 'none';
      });
      (cfg.thamSo || []).forEach(function (p) {
        if (!p.hien) return;
        var el = document.getElementById('ts-' + p.khoa), khoi = el && el.closest('.tham-so');
        if (khoi) khoi.style.display = p.hien(P, ts) ? '' : 'none';
      });
    }

    /* =====================================================================
       TƯƠNG TÁC: kéo điểm, dời, phóng to/thu nhỏ (chuột, cảm ứng)
       ===================================================================== */
    var conTro = {};
    function toaDo(e) { var r = svg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function timDiem(px) {
      var ban = null, min = (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 30 : 20;
      bamDiem.forEach(function (k) { var d = Math.hypot(X(P[k]) - px[0], Y(P[k]) - px[1]); if (d < min) { min = d; ban = k; } });
      return ban;
    }
    svg.addEventListener('pointerdown', function (e) {
      svg.setPointerCapture(e.pointerId);
      var px = toaDo(e);
      conTro[e.pointerId] = px;
      var ids = Object.keys(conTro);
      if (ids.length === 2) { TT.keo = null; batDauChum(); return; }
      var k = timDiem(px);
      if (k) { TT.keo = { ten: k }; svg.classList.add('dang-keo'); }
      else { TT.keo = { doi: true, px: px, cx: V.cx, cy: V.cy }; svg.classList.add('dang-keo'); }
      capNhat();
    });
    svg.addEventListener('pointermove', function (e) {
      var px = toaDo(e);
      if (!conTro[e.pointerId]) { svg.classList.toggle('tren-diem', !!timDiem(px)); return; }
      conTro[e.pointerId] = px;
      if (chum) { tiepChum(); return; }
      if (!TT.keo) return;
      if (TT.keo.ten) {
        var p = veThe(px[0], px[1]);
        if (TT.batLuoi) p = [Math.round(p[0] / buocLuoi) * buocLuoi, Math.round(p[1] / buocLuoi) * buocLuoi];
        if (cfg.rangBuoc && cfg.rangBuoc[TT.keo.ten]) p = cfg.rangBuoc[TT.keo.ten](p, P, ts);
        if (p && (p[0] !== P[TT.keo.ten][0] || p[1] !== P[TT.keo.ten][1])) {
          P[TT.keo.ten] = p;
          if (!TT.daKeo) { TT.daKeo = true; document.getElementById('goi-y-keo').classList.add('an-mo'); }
          if (cfg.sauKeo) cfg.sauKeo(TT.keo.ten, P, ts);
          capNhatBang(); capNhat();
        }
      } else if (TT.keo.doi) {
        V.cx = TT.keo.cx - (px[0] - TT.keo.px[0]) / V.s;
        V.cy = TT.keo.cy + (px[1] - TT.keo.px[1]) / V.s;
        capNhat();
      }
    });
    function thaTay(e) {
      delete conTro[e.pointerId];
      if (Object.keys(conTro).length < 2) chum = null;
      if (!Object.keys(conTro).length) { TT.keo = null; svg.classList.remove('dang-keo'); capNhat(); }
    }
    svg.addEventListener('pointerup', thaTay);
    svg.addEventListener('pointercancel', thaTay);
    var chum = null;
    function batDauChum() {
      var ds = Object.keys(conTro).map(function (k) { return conTro[k]; });
      chum = { d: Math.hypot(ds[0][0] - ds[1][0], ds[0][1] - ds[1][1]), s: V.s, m: [(ds[0][0] + ds[1][0]) / 2, (ds[0][1] + ds[1][1]) / 2] };
      chum.w = veThe(chum.m[0], chum.m[1]);
    }
    function tiepChum() {
      var ds = Object.keys(conTro).map(function (k) { return conTro[k]; });
      var d = Math.hypot(ds[0][0] - ds[1][0], ds[0][1] - ds[1][1]), m = [(ds[0][0] + ds[1][0]) / 2, (ds[0][1] + ds[1][1]) / 2];
      V.s = Math.max(6, Math.min(200, chum.s * d / chum.d));
      V.cx = chum.w[0] - (m[0] - V.W / 2) / V.s; V.cy = chum.w[1] + (m[1] - V.H / 2) / V.s;
      capNhat();
    }
    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var px = toaDo(e), w = veThe(px[0], px[1]);
      V.s = Math.max(6, Math.min(200, V.s * Math.exp(-e.deltaY * 0.0015)));
      V.cx = w[0] - (px[0] - V.W / 2) / V.s; V.cy = w[1] + (px[1] - V.H / 2) / V.s;
      capNhat();
    }, { passive: false });
    function phong(k) { hoatNhin = { t0: performance.now(), tu: { cx: V.cx, cy: V.cy, s: V.s }, den: { cx: V.cx, cy: V.cy, s: Math.max(6, Math.min(200, V.s * k)) } }; }

    /* =====================================================================
       BẢNG ĐIỀU KHIỂN
       ===================================================================== */
    var soMuc = 0;
    function muc(tieuDe, noiDung) { soMuc++; return '<section class="muc"><h3><span class="so">' + soMuc + '</span>' + tieuDe + '</h3>' + noiDung + '</section>'; }
    function hienGiaTri(p) { return p.hienThi ? p.hienThi(ts, P) : so(ts[p.khoa]) + ' ' + (p.donVi || ''); }
    function veBang() {
      var h = '';
      if (cfg.nhanXet) h += muc('Nhận xét', '<div class="nhan-xet" id="nhan-xet"></div>');
      if ((cfg.luaChon && cfg.luaChon.length) || (cfg.hopChon && cfg.hopChon.length) || (cfg.thamSo && cfg.thamSo.length)) {
        var s = '';
        (cfg.luaChon || []).forEach(function (l) {
          s += (l.nhan ? '<div style="font-weight:600;margin-bottom:6px">' + l.nhan + '</div>' : '') +
            '<div class="lua-chon" data-lc="' + l.khoa + '">' + l.ds.map(function (d) {
              return '<button data-gt="' + d.gt + '"' + (d.gt === ts[l.khoa] ? ' class="bat"' : '') + '>' + d.nhan + '</button>';
            }).join('') + '</div>';
        });
        (cfg.thamSo || []).forEach(function (p) {
          s += '<div class="tham-so" style="--mau:' + (p.mau || 'var(--chinh)') + '"><div class="dong"><span>' + p.nhan + '</span>' +
            '<span class="gia-tri" id="gt-' + p.khoa + '">' + hienGiaTri(p) + '</span></div>' +
            '<div class="hang"><button class="buoc" data-buoc="-1" data-k="' + p.khoa + '">−</button>' +
            '<input type="range" id="ts-' + p.khoa + '" min="' + p.min + '" max="' + p.max + '" step="' + p.buoc + '" value="' + ts[p.khoa] + '">' +
            '<button class="buoc" data-buoc="1" data-k="' + p.khoa + '">+</button></div></div>';
        });
        (cfg.hopChon || []).forEach(function (hc) {
          s += '<label class="cong-tac">' + hc.nhan + ' <input type="checkbox" data-hc="' + hc.khoa + '"' + (ts[hc.khoa] ? ' checked' : '') + '></label>';
        });
        h += muc(cfg.tieuDeLuaChon || 'Điều chỉnh', s);
      }
      if (cfg.nutPhu && cfg.nutPhu.length) {
        h += muc(cfg.tieuDeNutPhu || 'Thao tác', '<div class="hanh-dong-phu" style="margin-top:0">' + cfg.nutPhu.map(function (n, i) {
          return '<button class="nut' + (n.chinh ? ' chinh' : '') + '" data-phu="' + i + '">' + n.nhan + '</button>';
        }).join('') + '</div>');
      }
      if (dsSang.length) {
        h += muc(cfg.tieuDeSang || 'Bấm để làm nổi bật', '<div class="luoi-sang">' + dsSang.map(function (s) {
          return '<button class="nut-sang" data-sang="' + s.id + '" style="--mau:' + s.mau + '"><span class="cham"></span><span>' + s.nhan + '</span></button>';
        }).join('') + '</div><div class="hanh-dong-phu"><button class="nut nho" id="nut-tat-het">Tắt hết</button></div>');
      }
      if (cfg.hoatHinh && cfg.hoatHinh.length) {
        h += muc('Hoạt hình minh hoạ', '<div class="hoat-hinh">' + cfg.hoatHinh.map(function (a) {
          return '<button class="nut" data-hoat="' + a.id + '">▶ ' + a.nhan + '</button>';
        }).join('') + '</div><div style="display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap"><span style="font-weight:600;font-size:14px">Tốc độ</span>' +
          '<div class="lua-chon" id="lc-toc-2d" style="margin:0">' + [['cham', 'Chậm'], ['vua', 'Vừa'], ['nhanh', 'Nhanh']].map(function (x) { return '<button data-toc="' + x[0] + '"' + (x[0] === TT.tocDo ? ' class="bat"' : '') + '>' + x[1] + '</button>'; }).join('') + '</div></div>' +
          '<div class="dong-dieu-khien an" id="dk-hoat"><span style="font-weight:600">Tua</span>' +
          '<input type="range" id="thanh-hoat" min="0" max="1" step="0.001" value="0"><button class="nut nho" id="nut-thoat-hoat">Về hình ban đầu</button></div>');
      }
      if (cfg.congThuc) h += muc('Công thức', '<div class="cong-thuc" id="mh-cong-thuc"></div>');
      h += muc('Hiển thị',
        '<label class="cong-tac">Lưới ô vuông (1 ô = 1 ' + (cfg.donVi || 'cm') + ') <input type="checkbox" id="hien-luoi"' + (TT.hienLuoi ? ' checked' : '') + '></label>' +
        '<label class="cong-tac">Điểm kéo bắt vào lưới <input type="checkbox" id="bat-luoi"' + (TT.batLuoi ? ' checked' : '') + '></label>' +
        '<label class="cong-tac">Tên điểm <input type="checkbox" id="hien-ten" checked></label>' +
        '<label class="cong-tac">Số đo <input type="checkbox" id="hien-so" checked></label>');
      bang.innerHTML = h;

      bang.querySelectorAll('[data-lc]').forEach(function (nhom) {
        nhom.querySelectorAll('button').forEach(function (b) {
          b.onclick = function () {
            var l = cfg.luaChon.filter(function (x) { return x.khoa === nhom.dataset.lc; })[0];
            var gt = l.ds.filter(function (d) { return String(d.gt) === b.dataset.gt; })[0].gt;
            ts[l.khoa] = gt;
            nhom.querySelectorAll('button').forEach(function (x) { x.classList.toggle('bat', x === b); });
            dungHoat();
            if (l.khiDoi) l.khiDoi(gt, P, ts, API_TRANG);
            if (l.vuaKhung) vuaKhung();
            capNhatBang(); capNhat();
          };
        });
      });
      (cfg.thamSo || []).forEach(function (p) {
        var inp = document.getElementById('ts-' + p.khoa);
        inp.addEventListener('input', function () { datThamSo(p, parseFloat(inp.value)); });
      });
      bang.querySelectorAll('.buoc').forEach(function (b) {
        b.onclick = function () {
          var p = cfg.thamSo.filter(function (x) { return x.khoa === b.dataset.k; })[0];
          var gt = Math.min(p.max, Math.max(p.min, ts[p.khoa] + p.buoc * (+b.dataset.buoc)));
          gt = parseFloat((Math.round(gt / p.buoc) * p.buoc).toFixed(6));
          document.getElementById('ts-' + p.khoa).value = gt; datThamSo(p, gt);
        };
      });
      bang.querySelectorAll('[data-hc]').forEach(function (cb) {
        cb.onchange = function () {
          var hc = cfg.hopChon.filter(function (x) { return x.khoa === cb.dataset.hc; })[0];
          ts[hc.khoa] = cb.checked;
          if (hc.khiDoi) hc.khiDoi(cb.checked, P, ts, API_TRANG);
          capNhatBang(); capNhat();
        };
      });
      bang.querySelectorAll('.nut-sang').forEach(function (b) { b.onclick = function () { batTatSang(b.dataset.sang); }; });
      bang.querySelectorAll('[data-phu]').forEach(function (b) {
        b.onclick = function () { cfg.nutPhu[+b.dataset.phu].bam(P, ts, API_TRANG); capNhatBang(); capNhat(); };
      });
      var nt = document.getElementById('nut-tat-het');
      if (nt) nt.onclick = function () { TT.dangSang = []; capNhatNutSang(); capNhatBang(); capNhat(); };
      bang.querySelectorAll('[data-hoat]').forEach(function (b) { b.onclick = function () { chayHoat(b.dataset.hoat); }; });
      var th = document.getElementById('thanh-hoat');
      if (th) th.addEventListener('input', function () { if (TT.hoat) { TT.hoat.t = parseFloat(th.value); TT.hoat.chay = false; capNhatNutHoat(); capNhatBang(); capNhat(); } });
      var lcToc = document.getElementById('lc-toc-2d');
      if (lcToc) lcToc.querySelectorAll('button').forEach(function (b) { b.onclick = function () { datTocDo(b.dataset.toc); }; });
      var nth = document.getElementById('nut-thoat-hoat');
      if (nth) nth.onclick = function () { dungHoat(); capNhatBang(); capNhat(); };
      document.getElementById('hien-luoi').onchange = function (e) { TT.hienLuoi = e.target.checked; capNhat(); };
      document.getElementById('bat-luoi').onchange = function (e) { TT.batLuoi = e.target.checked; };
      document.getElementById('hien-ten').onchange = function (e) { TT.hienTen = e.target.checked; capNhat(); };
      document.getElementById('hien-so').onchange = function (e) { TT.hienSo = e.target.checked; capNhat(); };
    }
    function datThamSo(p, gt) {
      ts[p.khoa] = gt;
      document.getElementById('gt-' + p.khoa).innerHTML = hienGiaTri(p);
      if (p.khiDoi) p.khiDoi(gt, P, ts);
      capNhatBang(); capNhat();
      if (p.vuaKhung) vuaKhung();
    }
    function batTatSang(id) {
      var i = TT.dangSang.indexOf(id);
      if (i >= 0) TT.dangSang.splice(i, 1); else { TT.dangSang.push(id); TT.thoiDiemBat[id] = performance.now(); }
      capNhatNutSang(); capNhatBang(); capNhat();
      if (mapSang[id] && mapSang[id].vuaKhung) vuaKhung();
    }
    function capNhatNutSang() { bang.querySelectorAll('.nut-sang').forEach(function (b) { b.classList.toggle('bat', bat(b.dataset.sang)); }); }

    var API_TRANG = {
      datLuaChon: function (khoa, gt) {
        ts[khoa] = gt;
        var nhom = bang.querySelector('[data-lc="' + khoa + '"]');
        if (nhom) nhom.querySelectorAll('button').forEach(function (x) { x.classList.toggle('bat', x.dataset.gt === String(gt)); });
      },
      tatSang: function () { TT.dangSang = []; capNhatNutSang(); },
      datSang: function (ds) { var bay = performance.now(); TT.dangSang = ds.slice(); ds.forEach(function (id) { TT.thoiDiemBat[id] = bay; }); capNhatNutSang(); },
      dungHoat: function () { dungHoat(); },
      vuaKhung: function () { vuaKhung(); },
    };

    /* ---------- Hoạt hình ---------- */
    // Tốc độ hoạt hình: hệ số nhân thời gian (lưu lại cho lần mở sau)
    var HE_TOC = { cham: 2.2, vua: 1.5, nhanh: 1 };
    TT.tocDo = (function () { try { var v = localStorage.getItem('mh2d_toc_do'); return HE_TOC[v] ? v : 'vua'; } catch (e) { return 'vua'; } })();
    function datTocDo(k) {
      if (TT.hoat) { var cu = TT.hoat.dai; TT.hoat.dai = cu / HE_TOC[TT.tocDo] * HE_TOC[k]; TT.hoat.t0 = performance.now() - TT.hoat.t * TT.hoat.dai; }
      TT.tocDo = k;
      try { localStorage.setItem('mh2d_toc_do', k); } catch (e) {}
      var el = document.getElementById('lc-toc-2d');
      if (el) el.querySelectorAll('button').forEach(function (b) { b.classList.toggle('bat', b.dataset.toc === k); });
    }
    function chayHoat(id) {
      var a = cfg.hoatHinh.filter(function (x) { return x.id === id; })[0];
      if (TT.hoat && TT.hoat.id === id && TT.hoat.chay) { TT.hoat.chay = false; capNhatNutHoat(); return; }
      var t = TT.hoat && TT.hoat.id === id && TT.hoat.t < 1 ? TT.hoat.t : 0;
      var dai = (giaTri(a.thoiGian, P, ts) || 4000) * HE_TOC[TT.tocDo];
      TT.hoat = { id: id, t: t, chay: true, dai: dai, t0: performance.now() - t * dai, anDiem: a.anDiem !== false };
      document.getElementById('dk-hoat').classList.remove('an');
      if (a.vuaKhung) vuaKhungHoat(a);
      capNhatNutHoat(); capNhatBang();
    }
    function vuaKhungHoat(a) {
      var kn = giaTri(a.vuaKhung, P, ts);
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      kn.concat(Object.keys(P).map(function (k) { return P[k]; })).forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
      x0 -= 1.5; x1 += 1.5; y0 -= 1.5; y1 += 1.5;
      var s = Math.max(6, Math.min(160, Math.min(V.W / (x1 - x0), (V.H - 150) / (y1 - y0))));
      hoatNhin = { t0: performance.now(), tu: { cx: V.cx, cy: V.cy, s: V.s }, den: { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 + 22 / s, s: s } };
    }
    function dungHoat() {
      TT.hoat = null;
      var dk = document.getElementById('dk-hoat'); if (dk) dk.classList.add('an');
      capNhatNutHoat();
    }
    function capNhatNutHoat() {
      bang.querySelectorAll('[data-hoat]').forEach(function (b) {
        var a = cfg.hoatHinh.filter(function (x) { return x.id === b.dataset.hoat; })[0];
        var dang = TT.hoat && TT.hoat.id === a.id;
        b.classList.toggle('dang-chay', !!(dang && TT.hoat.chay));
        b.textContent = (dang && TT.hoat.chay ? '⏸ ' : dang && TT.hoat.t >= 1 ? '↻ ' : '▶ ') + a.nhan;
      });
      var th = document.getElementById('thanh-hoat'); if (th && TT.hoat) th.value = TT.hoat.t;
    }

    /* ---------- Công thức, nhận xét, ghi chú ---------- */
    var CT = {
      c: function (id, chu) { var s = mapSang[id]; return '<span class="bien" style="color:' + (s ? s.mau : 'inherit') + '">' + chu + '</span>'; },
      // m: tô màu một phần công thức LaTeX (dùng bên trong $...$)
      m: function (id, tex) { var s = mapSang[id]; return s ? '\\textcolor{' + s.mau + '}{' + tex + '}' : tex; },
      so: so, soL: soL,
    };
    function datHTML(el, html) {   // chỉ vẽ lại khi nội dung đổi, rồi hiển thị công thức LaTeX
      if (!el || el._cu === html) return;
      el._cu = html; el.innerHTML = html;
      if (window.Latex) window.Latex.ve(el);
    }
    function capNhatCongThuc() {
      var el = document.getElementById('mh-cong-thuc'); if (!el) return;
      datHTML(el, cfg.congThuc(P, ts, CT).map(function (r) {
        var on = r.id && bat(r.id), mau = r.id && mapSang[r.id] ? mapSang[r.id].mau : 'var(--chinh)';
        return '<div class="ct' + (on ? ' bat' : '') + '" style="--mau:' + mau + '"><div class="ten">' + r.ten + '</div><div class="bt">' + r.bt + '</div></div>';
      }).join(''));
    }
    function capNhatNhanXet() { var el = document.getElementById('nhan-xet'); if (el) datHTML(el, cfg.nhanXet(P, ts, CT)); }
    function capNhatGhiChu() {
      var ghi = null, mau = 'var(--chinh)';
      if (TT.hoat) {
        var a = cfg.hoatHinh.filter(function (x) { return x.id === TT.hoat.id; })[0];
        if (a.ghiChu) { ghi = typeof a.ghiChu === 'function' ? a.ghiChu(P, ts, TT.hoat.t) : a.ghiChu; mau = '#0D9488'; }
      }
      if (!ghi) {
        var id = TT.dangSang[TT.dangSang.length - 1];
        if (id && mapSang[id].ghiChu) { ghi = giaTri(mapSang[id].ghiChu, P, ts); mau = mapSang[id].mau; }
      }
      if (!ghi) { elGhiChu.classList.add('an-mo'); elGhiChu._cu = ''; return; }
      elGhiChu.style.borderLeftColor = mau;
      datHTML(elGhiChu, ghi);
      elGhiChu.classList.remove('an-mo');
    }

    /* ---------- Thanh công cụ ---------- */
    function veCongCu() {
      var cc = document.getElementById('mh-cong-cu');
      function nut(id, icon, nhan, tieuDe) { return '<button class="cc" id="cc-' + id + '" title="' + tieuDe + '">' + ICON[icon] + '<span>' + nhan + '</span></button>'; }
      cc.innerHTML = nut('phong', 'phong', 'Phóng to', 'Phóng to') + nut('thu', 'thu', 'Thu nhỏ', 'Thu nhỏ') + nut('vua', 'vua', 'Vừa khung', 'Đưa hình vào giữa khung') +
        '<span class="ngan"></span>' + nut('luoi', 'luoi', 'Lưới', 'Bật/tắt lưới ô vuông') + nut('datlai', 'datLai', 'Đặt lại', 'Đưa hình về ban đầu') + nut('toan', 'toan', 'Toàn MH', 'Toàn màn hình');
      document.getElementById('cc-phong').onclick = function () { phong(1.25); };
      document.getElementById('cc-thu').onclick = function () { phong(0.8); };
      document.getElementById('cc-vua').onclick = function () { vuaKhung(); };
      document.getElementById('cc-luoi').onclick = function () { TT.hienLuoi = !TT.hienLuoi; document.getElementById('hien-luoi').checked = TT.hienLuoi; this.classList.toggle('bat', TT.hienLuoi); capNhat(); };
      document.getElementById('cc-luoi').classList.toggle('bat', TT.hienLuoi);
      document.getElementById('cc-datlai').onclick = datLai;
      document.getElementById('cc-toan').onclick = function () {
        var el = document.getElementById('mh');
        if (document.fullscreenElement) document.exitFullscreen();
        else if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      };
      document.addEventListener('fullscreenchange', function () {
        document.getElementById('cc-toan').classList.toggle('bat', !!document.fullscreenElement);
        setTimeout(function () { doiKichThuoc(); vuaKhung(true); }, 80);
      });
    }
    function datLai() {
      Object.keys(P0).forEach(function (k) { P[k] = P0[k].slice(); });
      (cfg.thamSo || []).forEach(function (p) { ts[p.khoa] = p.gt; var i = document.getElementById('ts-' + p.khoa); if (i) { i.value = p.gt; document.getElementById('gt-' + p.khoa).innerHTML = hienGiaTri(p); } });
      TT.dangSang = []; dungHoat(); capNhatNutSang();
      if (cfg.khiDatLai) cfg.khiDatLai(P, ts);
      capNhatBang(); vuaKhung(); capNhat();
    }

    /* ---------- Vòng vẽ ---------- */
    function doiKichThuoc() {
      V.W = khung.clientWidth || 800; V.H = khung.clientHeight || 600; capNhat();
    }
    if (window.ResizeObserver) new ResizeObserver(doiKichThuoc).observe(khung);
    window.addEventListener('resize', doiKichThuoc);
    function vong(now) {
      requestAnimationFrame(vong);
      var dong = false;
      if (hoatNhin) {
        var t = Math.min(1, (now - hoatNhin.t0) / 450), e = 1 - Math.pow(1 - t, 3);
        V.cx = hoatNhin.tu.cx + (hoatNhin.den.cx - hoatNhin.tu.cx) * e;
        V.cy = hoatNhin.tu.cy + (hoatNhin.den.cy - hoatNhin.tu.cy) * e;
        V.s = hoatNhin.tu.s * Math.pow(hoatNhin.den.s / hoatNhin.tu.s, e);
        if (t >= 1) hoatNhin = null;
        dong = true;
      }
      if (TT.hoat && TT.hoat.chay) {
        TT.hoat.t = Math.min(1, (now - TT.hoat.t0) / TT.hoat.dai);
        if (TT.hoat.t >= 1) { TT.hoat.chay = false; capNhatNutHoat(); capNhatBang(); }
        var th = document.getElementById('thanh-hoat'); if (th) th.value = TT.hoat.t;
        capNhatGhiChu();
        dong = true;
      }
      TT.dangSang.forEach(function (id) { if (now - (TT.thoiDiemBat[id] || 0) < 2600 || (mapSang[id] && mapSang[id].lap)) dong = true; });
      if (dong || canVe) { canVe = false; ve(); }
    }

    /* ---------- Khởi động ---------- */
    veBang(); veCongCu(); doiKichThuoc();
    if (cfg.khiDatLai) cfg.khiDatLai(P, ts);
    if (cfg.batDau) { TT.dangSang = cfg.batDau.slice(); capNhatNutSang(); }
    vuaKhung(true);
    capNhatBang();
    requestAnimationFrame(vong);
    setTimeout(function () { document.getElementById('goi-y-keo').classList.add('an-mo'); }, 7000);
    return { P: P, ts: ts, capNhat: function () { capNhatBang(); capNhat(); } };
  }


  /* =====================================================================
     BỘ HIỆU ỨNG ĐỐI XỨNG (dùng cho lớp 6, đường tròn lớp 9, gấp hình lớp 7…)
       - Trục đối xứng, tâm đối xứng
       - Điểm M chạy trên hình, điểm M′ đối xứng chạy theo (nét đứt, ký hiệu bằng nhau)
       - Gấp giấy 3D theo trục, quay tờ giấy 3D quanh tâm
     ===================================================================== */
  /* =====================================================================
     KỊCH BẢN DỰNG HÌNH — chạy lần lượt từng thao tác (thước, compa, thước đo góc)
     Mỗi bước: { tg (giây), ghi (chữ), ve(g, e) khi đang làm, xong(g) sau khi làm xong, cu(g, e) vẽ dụng cụ }
     Bước chưa tới thì KHÔNG vẽ gì — nét nào đang kẻ mới hiện nét đó.
     ===================================================================== */
  function kichBan(ds) {
    ds = ds.filter(Boolean);
    var tong = ds.reduce(function (s, b) { return s + (b.tg == null ? 1 : b.tg); }, 0) || 1;
    function viTri(t) {
      if (t >= 1) return { i: ds.length - 1, e: 1 };
      var tt = Math.max(0, Math.min(1, t)) * tong, dau = 0;
      for (var i = 0; i < ds.length; i++) { var d = ds[i].tg == null ? 1 : ds[i].tg; if (tt < dau + d || i === ds.length - 1) return { i: i, e: d ? Math.min(1, (tt - dau) / d) : 1 }; dau += d; }
      return { i: ds.length - 1, e: 1 };
    }
    return {
      tong: tong,
      ve: function (g, t) {
        var v = viTri(t), cu = null;
        for (var i = 0; i < ds.length; i++) {
          var b = ds[i];
          if (i < v.i || (i === v.i && v.e >= 1 && t >= 1)) { if (b.xong) b.xong(g); }
          else if (i === v.i) { var e = H.em(v.e); if (b.ve) b.ve(g, e); if (b.cu) cu = { b: b, e: e }; }
        }
        if (cu) cu.b.cu(g, cu.e);   // dụng cụ vẽ sau cùng (nằm trên)
      },
      ghi: function (t) { var v = viTri(t), s = ''; for (var i = 0; i <= v.i; i++) if (ds[i].ghi) s = ds[i].ghi; return s; },
    };
  }
  function diemTron(O, r, a) { return [O[0] + r * Math.cos(a), O[1] + r * Math.sin(a)]; }
  function cungTron(g, O, r, a0, a1, o) { var n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * 30)), ds = []; for (var i = 0; i <= n; i++) ds.push(diemTron(O, r, a0 + (a1 - a0) * i / n)); g.duong(ds, o || { mau: '#0D9488', rong: 2 }); }
  function gocLech(a0, a1) { var d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
  // Các thao tác dựng hình
  var DUNG = {
    // Kẻ đoạn / tia AB bằng thước + bút chì
    doan: function (A, B, o) {
      o = o || {}; var net = o.net || { rong: 3 };
      return { tg: o.tg == null ? 1.1 : o.tg, ghi: o.ghi,
        ve: function (g, e) { g.doan(A, H.lerp(A, B, e), net); },
        xong: function (g) { g.doan(A, B, net); if (o.sau) o.sau(g); },
        cu: function (g, e) { g.thuoc(A, B, { ben: o.ben || -1 }); g.but(H.lerp(A, B, e)); } };
    },
    // Vẽ cung tròn tâm O bán kính r từ góc a0 đến a1 bằng compa
    cung: function (O, r, a0, a1, o) {
      o = o || {}; var net = o.net || { mau: '#0D9488', rong: 2 };
      return { tg: o.tg == null ? 1.1 : o.tg, ghi: o.ghi,
        ve: function (g, e) { cungTron(g, O, r, a0, a0 + (a1 - a0) * e, net); },
        xong: function (g) { cungTron(g, O, r, a0, a1, net); if (o.sau) o.sau(g); },
        cu: function (g, e) { g.compa(O, diemTron(O, r, a0 + (a1 - a0) * e)); } };
    },
    // Đặt compa đo đoạn OT: mũi kim tại O, mở dần đầu chì tới T
    doCompa: function (O, T, o) {
      o = o || {};
      return { tg: o.tg == null ? 1.2 : o.tg, ghi: o.ghi,
        ve: function (g, e) { if (o.danh) o.danh(g); },
        xong: function (g) { if (o.sau) o.sau(g); },
        cu: function (g, e) { g.compa(O, H.lerp(H.lerp(O, T, 0.25), T, e)); } };
    },
    // Giữ nguyên độ mở, nhấc compa từ (O1, T1) sang (O2, T2)
    chuyenCompa: function (O1, T1, O2, T2, o) {
      o = o || {};
      return { tg: o.tg == null ? 0.9 : o.tg, ghi: o.ghi,
        cu: function (g, e) { g.compa(H.lerp(O1, O2, e), H.lerp(T1, T2, e)); } };
    },
    // Giữ mũi kim tại O, xoay compa (không vẽ) từ góc a0 sang góc a1
    xoayCompa: function (O, r, a0, a1, o) {
      o = o || {};
      return { tg: o.tg == null ? 0.6 : o.tg, ghi: o.ghi, cu: function (g, e) { g.compa(O, diemTron(O, r, a0 + gocLech(a0, a1) * e)); } };
    },
    // Đặt thước đo góc tại O (vạch 0° theo hướng OA), đọc số đo góc AOB
    doGoc: function (O, A, B, o) {
      o = o || {};
      var a0 = H.huong(O, A), da = gocLech(a0, H.huong(O, B)), r = o.r || Math.min(H.dai(O, A), H.dai(O, B)) * 0.7;
      return { tg: o.tg == null ? 1.3 : o.tg, ghi: o.ghi,
        ve: function (g, e) {
          g.thuocDoGoc(O, a0, da > 0 ? 1 : -1, r, { doMo: Math.min(1, e * 2) });
          if (e > 0.5) { var am = a0 + da * Math.min(1, (e - 0.5) * 2); g.doan(O, diemTron(O, r * 1.05, am), { mau: '#DC2626', rong: 2 }); }
          if (o.danh) o.danh(g);
        },
        xong: function (g) { if (o.sau) o.sau(g); } };
    },
    // Đặt thước đo góc tại O, vạch 0° theo hướng a0, đánh dấu điểm ở góc a1 (điểm được giữ lại)
    danhDauGoc: function (O, a0, a1, o) {
      o = o || {};
      var da = gocLech(a0, a1), r = o.r || 1.6, M = diemTron(O, r * 1.02, a1);
      return { tg: o.tg == null ? 1.3 : o.tg, ghi: o.ghi,
        ve: function (g, e) { g.thuocDoGoc(O, a0, da > 0 ? 1 : -1, r, { doMo: Math.min(1, e * 2) }); if (e > 0.6) g.diem(M, '', { r: 4.5, mau: '#DC2626' }); },
        xong: function (g) { g.diem(M, '', { r: 3.5, mau: '#DC2626' }); if (o.sau) o.sau(g); },
        cu: function (g, e) { if (e > 0.5) g.but(M); } };
    },
    // Bước chỉ để hiện kết quả (tên điểm, ký hiệu…)
    hien: function (f, o) { o = o || {}; return { tg: o.tg == null ? 0.5 : o.tg, ghi: o.ghi, ve: function (g, e) { f(g); }, xong: f }; },
  };

  var DX = (function () {
    function cheo(A, B, P) { return (B[0] - A[0]) * (P[1] - A[1]) - (B[1] - A[1]) * (P[0] - A[0]); }
    // Cắt đa giác, giữ phần nằm phía "dau" của đường thẳng AB (dau = +1: bên trái A→B)
    function catDaGiac(ds, A, B, dau) {
      var ra = [];
      for (var i = 0; i < ds.length; i++) {
        var P = ds[i], Q = ds[(i + 1) % ds.length], fp = cheo(A, B, P) * dau, fq = cheo(A, B, Q) * dau;
        if (fp >= -1e-9) ra.push(P);
        if ((fp > 1e-9 && fq < -1e-9) || (fp < -1e-9 && fq > 1e-9)) ra.push(H.lerp(P, Q, fp / (fp - fq)));
      }
      return ra;
    }
    // Cắt đường gấp khúc, trả về các đoạn nằm phía "dau" (bỏ các đoạn nằm trên chính trục)
    function catDuong(ds, A, B, dau) {
      var ra = [], cur = [], L = H.dai(A, B);
      function trenTruc(P) { return Math.abs(cheo(A, B, P)) / L < 1e-6; }
      for (var i = 0; i < ds.length - 1; i++) {
        var P = ds[i], Q = ds[i + 1], fp = cheo(A, B, P) * dau / L, fq = cheo(A, B, Q) * dau / L;
        if (trenTruc(P) && trenTruc(Q)) { if (cur.length > 1) ra.push(cur); cur = []; continue; }
        if (fp >= -1e-9 && fq >= -1e-9) { if (!cur.length) cur.push(P); cur.push(Q); }
        else if (fp >= -1e-9 && fq < 0) { if (!cur.length) cur.push(P); cur.push(H.lerp(P, Q, fp / (fp - fq))); ra.push(cur); cur = []; }
        else if (fp < 0 && fq >= -1e-9) { cur = [H.lerp(P, Q, fp / (fp - fq)), Q]; }
        else { if (cur.length > 1) ra.push(cur); cur = []; }
      }
      if (cur.length > 1) ra.push(cur);
      // đường khép kín: nối đoạn cuối với đoạn đầu nếu liền nhau để điểm chạy liên tục
      if (ra.length > 1) {
        var dau0 = ra[0][0], cuoi = ra[ra.length - 1][ra[ra.length - 1].length - 1];
        if (H.dai(dau0, cuoi) < 1e-9) { var gop = ra.pop().concat(ra.shift().slice(1)); ra.unshift(gop); }
      }
      return ra;
    }
    function doDai(ds) { var s = 0; for (var i = 0; i < ds.length - 1; i++) s += H.dai(ds[i], ds[i + 1]); return s; }
    // Lấy điểm ở tỉ lệ s (0..1) trên tập đường; kèm phần đường đã đi (để vẽ vết)
    function diemTren(dsDuong, s) {
      var tong = 0; dsDuong.forEach(function (d) { tong += doDai(d); });
      var con = s * tong, vet = [];
      for (var k = 0; k < dsDuong.length; k++) {
        var d = dsDuong[k], cur = [d[0]];
        for (var i = 0; i < d.length - 1; i++) {
          var l = H.dai(d[i], d[i + 1]);
          if (con <= l) { var P = H.lerp(d[i], d[i + 1], l ? con / l : 0); cur.push(P); vet.push(cur); return { P: P, vet: vet }; }
          con -= l; cur.push(d[i + 1]);
        }
        vet.push(cur);
      }
      var cuoi = dsDuong[dsDuong.length - 1];
      return { P: cuoi[cuoi.length - 1], vet: vet };
    }
    function dong(ds) { return ds.concat([ds[0]]); }
    function netCua(info) { return info.net || (info.ds ? [dong(info.ds)] : []); }
    // Toạ độ 3D -> toạ độ vẽ (chiếu xiên nhẹ + phối cảnh)
    function chieu(g, p) {
      var c = g.tamNhin(), f = 1 + p[2] * 0.07, x = p[0] + p[2] * 0.2, y = p[1] + p[2] * 0.3;
      return [c[0] + (x - c[0]) * f, c[1] + (y - c[1]) * f];
    }
    function bong(p) { return [p[0] + p[2] * 0.35, p[1] - p[2] * 0.35]; }
    // Quay điểm quanh trục AB (trong không gian) góc th; trả về [x, y, z]
    function quanhTruc(P, A, B, th) {
      var u = H.tru(B, A), L = Math.hypot(u[0], u[1]); u = [u[0] / L, u[1] / L];
      var n = [-u[1], u[0]], d = H.tru(P, A), x = d[0] * u[0] + d[1] * u[1], y = d[0] * n[0] + d[1] * n[1];
      var yy = y * Math.cos(th), z = y * Math.sin(th);
      return [A[0] + u[0] * x + n[0] * yy, A[1] + u[1] * x + n[1] * yy, z];
    }
    function trucHienTai(info, ts) {
      if (!info.truc || !info.truc.length) return null;
      return info.truc[Math.min(ts.truc || 0, info.truc.length - 1)];
    }
    function trucThu(info) {   // khi hình không có trục: thử gấp theo đường thẳng đứng qua tâm hình
      var c = info.tamThu || info.tam || [0, 0];
      return [[c[0], c[1] - 1], [c[0], c[1] + 1]];
    }
    function veHinh(g, info, o) {
      o = o || {};
      if (info.ds) g.daGiac(o.ds || info.ds, { to: o.to || info.to || '#93C5FD', doMoTo: o.doMo == null ? 0.55 : o.doMo, rong: o.rong == null ? 2.5 : o.rong, mauNet: o.mauNet, dut: o.dut });
      if (info.net && !info.ds) (o.net || info.net).forEach(function (d) { g.duong(d, { rongCm: info.rongCm, mau: o.mauNet || info.mauNet || '#2451C7', doMo: o.doMo == null ? 1 : o.doMo + 0.3 }); });
    }
    function daiTruc(info, A, B) {   // kéo dài trục vừa quá hình
      var ds = info.ds || [].concat.apply([], info.net || []), u = H.tru(B, A), L = Math.hypot(u[0], u[1]); u = [u[0] / L, u[1] / L];
      var mn = Infinity, mx = -Infinity;
      ds.forEach(function (p) { var t = (p[0] - A[0]) * u[0] + (p[1] - A[1]) * u[1]; mn = Math.min(mn, t); mx = Math.max(mx, t); });
      return [H.cong(A, H.nhan(u, mn - 1)), H.cong(A, H.nhan(u, mx + 1))];
    }

    return {
      catDaGiac: catDaGiac, catDuong: catDuong, diemTren: diemTren, quanhTruc: quanhTruc, chieu: chieu, bong: bong,
      luaChonTruc: function (n) {
        var ds = []; for (var i = 0; i < n; i++) ds.push({ gt: i, nhan: 'Trục ' + (i + 1) });
        return { khoa: 'truc', gt: 0, nhan: 'Trục dùng cho hiệu ứng', ds: ds };
      },
      hopChonVet: { khoa: 'vet', nhan: 'Để lại vết khi điểm chạy', gt: true },
      lamSang: function (layInfo) {
        return [
          { id: 'truc', nhan: 'Trục đối xứng', mau: '#C026D3',
            ghiChu: function (P, ts) { var f = layInfo(P, ts), n = (f.truc || []).length; return n ? f.ten + ' có <b>' + n + ' trục đối xứng</b>' + (n > 1 ? ' (trục đang chọn in đậm)' : '') + '.' : f.ten + ' <b>không có trục đối xứng</b>.'; } },
          { id: 'diemTruc', nhan: 'Điểm đối xứng qua trục', mau: '#E0342F', lap: true,
            ghiChu: function (P, ts) { var f = layInfo(P, ts); return (f.truc || []).length ? 'Điểm <i>M</i> chạy trên nửa hình bên này trục, điểm đối xứng <i>M′</i> chạy trên nửa bên kia. Luôn có <i>MM′</i> ⊥ trục và <i>MH = HM′</i>.' : f.ten + ' không có trục đối xứng.'; } },
          { id: 'tam', nhan: 'Tâm đối xứng', mau: '#0D9488',
            ghiChu: function (P, ts) { var f = layInfo(P, ts); return f.tam ? f.ten + ' có <b>tâm đối xứng</b> <i>O</i>.' : f.ten + ' <b>không có tâm đối xứng</b>.'; } },
          { id: 'diemTam', nhan: 'Điểm đối xứng qua tâm', mau: '#1E6FE0', lap: true,
            ghiChu: function (P, ts) { var f = layInfo(P, ts); return f.tam ? 'Điểm <i>M</i> chạy trên hình, điểm <i>M′</i> đối xứng với <i>M</i> qua <i>O</i> cũng chạy trên hình. Luôn có <i>O</i> là trung điểm của <i>MM′</i>.' : f.ten + ' không có tâm đối xứng.'; } },
        ];
      },
      hoatHinh: function (layInfo) {
        return [
          { id: 'gap', nhan: 'Gấp giấy theo trục', thoiGian: 4200,
            ghiChu: function (P, ts, t) {
              var f = layInfo(P, ts), co = (f.truc || []).length;
              if (t < 1) return co ? 'Gấp tờ giấy theo trục đối xứng…' : 'Thử gấp tờ giấy theo đường thẳng đứng đi qua giữa hình…';
              return co ? 'Hai nửa hình <b>trùng khít</b> nhau: đường gấp là <b>trục đối xứng</b>.' : 'Hai nửa <b>không trùng khít</b>: ' + f.ten + ' không có trục đối xứng.';
            } },
          { id: 'quay', nhan: 'Quay nửa vòng quanh tâm', thoiGian: 4200,
            ghiChu: function (P, ts, t) {
              var f = layInfo(P, ts);
              if (t < 1) return 'Ghim một tờ giấy trong in hình tại ' + (f.tam ? 'tâm <i>O</i>' : 'điểm giữa hình') + ' rồi quay nửa vòng…';
              return f.tam ? 'Sau nửa vòng, hình <b>trùng với chính nó</b>: <i>O</i> là <b>tâm đối xứng</b>.' : 'Sau nửa vòng, hình <b>không trùng</b> với ban đầu: ' + f.ten + ' không có tâm đối xứng.';
            } },
        ];
      },
      dangHoat: function (g) { return g.hoat('gap') !== null || g.hoat('quay') !== null; },
      nhanXet: function (f) {
        var n = (f.truc || []).length;
        return '<b>' + f.ten + '</b>: ' + (n ? '<span class="dung">có ' + n + ' trục đối xứng</span>' : '<span class="sai">không có trục đối xứng</span>') +
          ' · ' + (f.tam ? '<span class="dung">có tâm đối xứng</span>' : '<span class="sai">không có tâm đối xứng</span>');
      },
      // Vẽ hiệu ứng. Gọi SAU khi trang đã vẽ hình (khi không có hoạt hình gấp/quay).
      ve: function (g, info, ts) {
        var tg = g.hoat('gap'), tq = g.hoat('quay'), MAU_TRUOC = info.to || '#93C5FD', MAU_SAU = '#FDBA74';
        if (tg !== null) {
          var tr = trucHienTai(info, ts) || trucThu(info), A = tr[0], B = tr[1], th = Math.PI * H.em(tg);
          if (info.ds) {
            var co = catDaGiac(info.ds, A, B, -1), di = catDaGiac(info.ds, A, B, 1);
            g.daGiac(info.ds, { to: 'none', rong: 1.2, mauNet: '#CBD5E1', dut: '5 5' });
            if (co.length > 2) g.daGiac(co, { to: MAU_TRUOC, doMoTo: 0.6, rong: 2.5 });
            if (di.length > 2) {
              var p3 = di.map(function (p) { return quanhTruc(p, A, B, th); });
              g.daGiac(p3.map(bong), { to: '#0F172A', doMoTo: 0.12 * Math.sin(th), khongVien: true });
              g.daGiac(p3.map(function (p) { return chieu(g, p); }), { to: Math.cos(th) >= 0 ? MAU_TRUOC : MAU_SAU, doMoTo: 0.85, rong: 2.5, mauNet: '#1B2540' });
            }
          } else {
            netCua(info).forEach(function (d) {
              catDuong(d, A, B, -1).forEach(function (x) { g.duong(x, { rongCm: info.rongCm, mau: '#2451C7' }); });
              catDuong(d, A, B, 1).forEach(function (x) { g.duong(x, { rongCm: info.rongCm, mau: '#CBD5E1' }); });
            });
            netCua(info).forEach(function (d) {
              catDuong(d, A, B, 1).forEach(function (x) {
                var p3 = x.map(function (p) { return quanhTruc(p, A, B, th); });
                g.duong(p3.map(bong), { rongCm: info.rongCm, mau: '#0F172A', doMo: 0.15 * Math.sin(th) });
                g.duong(p3.map(function (p) { return chieu(g, p); }), { rongCm: info.rongCm, mau: Math.cos(th) >= 0 ? '#2451C7' : '#EA580C', doMo: 0.9 });
              });
            });
          }
          var dt = daiTruc(info, A, B);
          g.doan(dt[0], dt[1], { mau: '#C026D3', rong: 2.5, dut: '10 6' });
          return true;
        }
        if (tq !== null) {
          var O = info.tam || info.tamThu || [0, 0], e = H.em(tq), goc = Math.PI * e, cao = 1.4 * Math.sin(Math.PI * e);
          veHinh(g, info, { doMo: 0.35 });
          var bien = function (p) { var q = H.xoay(p, O, goc); return [q[0], q[1], cao]; };
          if (info.ds) {
            var q3 = info.ds.map(bien);
            g.daGiac(q3.map(bong), { to: '#0F172A', doMoTo: 0.1 * Math.sin(Math.PI * e), khongVien: true });
            g.daGiac(q3.map(function (p) { return chieu(g, p); }), { to: '#FDE68A', doMoTo: 0.55, rong: 2.5, mauNet: '#B45309' });
          } else {
            netCua(info).forEach(function (d) {
              var q3 = d.map(bien);
              g.duong(q3.map(bong), { rongCm: info.rongCm, mau: '#0F172A', doMo: 0.12 * Math.sin(Math.PI * e) });
              g.duong(q3.map(function (p) { return chieu(g, p); }), { rongCm: info.rongCm, mau: '#EA580C', doMo: 0.8 });
            });
          }
          var ghim = chieu(g, [O[0], O[1], cao]);
          g.doan(O, ghim, { mau: '#475569', rong: 2 });
          g.diem(ghim, '', { r: 6, mau: '#DC2626' });
          g.diem(O, info.tam ? 'O' : '', { r: 3.5, mau: '#0D9488', huong: [0.8, -0.8] });
          return true;
        }
        // --- Trục đối xứng
        var truc = info.truc || [], k = Math.min(ts.truc || 0, Math.max(0, truc.length - 1));
        if (g.bat('truc') || g.bat('diemTruc')) truc.forEach(function (t, i) {
          var dt2 = daiTruc(info, t[0], t[1]);
          g.doan(dt2[0], dt2[1], { mau: '#C026D3', rong: i === k ? 3.2 : 1.8, dut: '10 6', doMo: i === k || !g.bat('diemTruc') ? 1 : 0.35 });
          if (truc.length > 1 && g.bat('truc')) g.chu(H.cong(dt2[1], H.nhan(H.tru(dt2[1], dt2[0]), 0.06 / Math.max(0.01, H.dai(dt2[0], dt2[1])) * 4)), 'd' + (i + 1), { mau: '#C026D3', nho: true });
        });
        var vet = ts.vet !== false, T0 = 7;
        function veCap(M, M2, I, mau1, mau2, vuong) {
          g.doan(M, M2, { mau: '#64748B', rong: 2, dut: '6 5' });
          g.kyHieu(M, I, 2, '#475569'); g.kyHieu(I, M2, 2, '#475569');
          if (vuong) g.goc(M, I, vuong, { mau: '#475569', nhan: false, r: 12, to: false });
          g.diem(I, vuong ? 'H' : '', { r: 3, mau: '#475569', huong: [0.9, -0.9] });
          g.diem(M, 'M', { r: 6, mau: mau1, huong: H.tru(M, I) });
          g.diem(M2, "M'", { r: 6, mau: mau2, huong: H.tru(M2, I) });
        }
        if (g.bat('diemTruc') && truc.length) {
          var A2 = truc[k][0], B2 = truc[k][1], nua = [];
          netCua(info).forEach(function (d) { nua = nua.concat(catDuong(d, A2, B2, 1)); });
          if (nua.length) {
            var s1 = ((g.tg('diemTruc') || 0) / T0) % 1, kq = diemTren(nua, s1), M = kq.P, M2 = H.doiXung(M, A2, B2), I = H.chan(M, A2, B2);
            if (vet) kq.vet.forEach(function (x) {
              g.duong(x, { mau: '#E0342F', rong: 5, doMo: 0.75 });
              g.duong(x.map(function (p) { return H.doiXung(p, A2, B2); }), { mau: '#1E6FE0', rong: 5, doMo: 0.75 });
            });
            if (H.dai(M, I) > 1e-6) veCap(M, M2, I, '#E0342F', '#1E6FE0', B2);
            else { g.diem(M, 'M ≡ M′', { r: 6, mau: '#7C3AED' }); }
          }
        }
        // --- Tâm đối xứng
        if ((g.bat('tam') || g.bat('diemTam')) && info.tam) g.diem(info.tam, 'O', { r: 6, mau: '#0D9488', huong: [0.8, -0.8] });
        if (g.bat('diemTam') && info.tam) {
          var O2 = info.tam, tat = netCua(info), s2 = ((g.tg('diemTam') || 0) / (T0 * 1.4)) % 1;
          var kq2 = diemTren(tat, s2), N = kq2.P, N2 = [2 * O2[0] - N[0], 2 * O2[1] - N[1]];
          if (vet) kq2.vet.forEach(function (x) {
            g.duong(x, { mau: '#1E6FE0', rong: 5, doMo: 0.7 });
            g.duong(x.map(function (p) { return [2 * O2[0] - p[0], 2 * O2[1] - p[1]]; }), { mau: '#F59E0B', rong: 5, doMo: 0.7 });
          });
          veCap(N, N2, O2, '#1E6FE0', '#F59E0B', null);
          g.diem(O2, 'O', { r: 5, mau: '#0D9488', huong: [0.8, -0.8] });
        }
        return false;
      },
    };
  })();


  /* =====================================================================
     BỘ DỰNG "HAI TAM GIÁC" — tam giác bằng nhau (lớp 7), đồng dạng (lớp 8)
     opt.loai: 'bang' | 'dongDang'
     opt.th  : 'ccc' | 'cgc' | 'gcg' | 'gg' | 'vuong'
     Tam giác 1 (ABC) kéo được; tam giác 2 (A'B'C') là ảnh qua phép quay
     (thanh trượt), có thể lật, có thể phóng theo tỉ số k (đồng dạng).
     ===================================================================== */
  function haiTamGiac(opt) {
    var dd = opt.loai === 'dongDang';
    var MAU_C = { AB: '#E0342F', BC: '#1E6FE0', CA: '#16A34A' }, MAU_G = { A: '#F59E0B', B: '#7C3AED', C: '#0D9488' };
    var TEN_C = { AB: ['A', 'B'], BC: ['B', 'C'], CA: ['C', 'A'] };
    var VACH = { AB: 1, BC: 2, CA: 3, A: 1, B: 2, C: 3 };
    // Các trường hợp tam giác vuông (vuông tại A)
    var TH_VUONG = dd ? {
      gn: { nhan: 'Một góc nhọn bằng nhau', yt: ['B'] },
      cgv: { nhan: 'Hai cạnh góc vuông tỉ lệ', yt: ['AB', 'CA'] },
      chCgv: { nhan: 'Cạnh huyền và cạnh góc vuông tỉ lệ', yt: ['BC', 'AB'] },
    } : {
      cgv: { nhan: 'Hai cạnh góc vuông', yt: ['AB', 'CA'] },
      cgvGn: { nhan: 'Cạnh góc vuông và góc nhọn kề', yt: ['AB', 'B'] },
      chGn: { nhan: 'Cạnh huyền và góc nhọn', yt: ['BC', 'B'] },
      chCgv: { nhan: 'Cạnh huyền và cạnh góc vuông', yt: ['BC', 'AB'] },
    };
    var YT = { ccc: ['AB', 'BC', 'CA'], cgc: ['AB', 'B', 'BC'], gcg: ['B', 'BC', 'C'], gg: ['B', 'C'] };
    function yeuTo(ts) { return opt.th === 'vuong' ? TH_VUONG[ts.thv].yt : YT[opt.th]; }
    function tenYT(id) { return id.length === 2 ? 'cạnh ' + id + ' và ' + id[0] + '′' + id[1] + '′' : 'góc ' + id + ' và góc ' + id + '′'; }

    function T2(P, ts) {
      var A = P.A, B = P.B, C = P.C, G = H.trongTam(A, B, C), k = dd ? ts.k : 1, goc = (ts.xoay || 0) * Math.PI / 180;
      var f = function (p) { var q = H.xoay(p, G, goc); if (ts.lat) q = [2 * G[0] - q[0], q[1]]; return [G[0] + (q[0] - G[0]) * k, G[1] + (q[1] - G[1]) * k]; };
      var a = f(A), b = f(B), c = f(C);
      var xmax = Math.max(A[0], B[0], C[0]), xmin = Math.min(a[0], b[0], c[0]), dx = xmax - xmin + 2.2;
      var d = function (p) { return [p[0] + dx, p[1]]; };
      return { A: d(a), B: d(b), C: d(c) };
    }
    function goc(Q, v) { var o = { A: ['B', 'C'], B: ['C', 'A'], C: ['A', 'B'] }[v]; return H.gocDo(Q[o[0]], Q[v], Q[o[1]]); }

    var lamSang = [];
    var dsYT = opt.th === 'vuong' ? ['AB', 'CA', 'BC', 'B', 'C'] : YT[opt.th];
    dsYT.forEach(function (id) {
      var laCanh = id.length === 2;
      lamSang.push({ id: id, nhan: laCanh ? (dd ? 'Tỉ số ' + id[0] + '′' + id[1] + '′/' + id : 'Cạnh ' + id + ' = ' + id[0] + '′' + id[1] + '′') : 'Góc ' + id + ' = góc ' + id + '′',
        mau: laCanh ? MAU_C[id] : MAU_G[id],
        ghiChu: function (P, ts) {
          var Q = T2(P, ts), c = TEN_C[id];
          if (laCanh) { var l1 = H.dai(P[c[0]], P[c[1]]), l2 = H.dai(Q[c[0]], Q[c[1]]); return dd ? '$\\dfrac{' + c[0] + "'" + c[1] + "'}{" + id + '} = \\dfrac{' + soL(l2) + '}{' + soL(l1) + '} = \\mathbf{' + soL(l2 / l1) + '}$' : '$' + id + ' = ' + c[0] + "'" + c[1] + "' = \\mathbf{" + soL(l1) + '}$ <b>cm</b>'; }
          return '$\\widehat{' + id + '} = \\widehat{' + id + "'} = \\mathbf{" + soL(goc(P, id), 0) + '^\\circ}$';
        } });
    });
    lamSang.push({ id: 'ketLuan', nhan: dd ? 'Kết luận: đồng dạng' : 'Kết luận: bằng nhau', mau: '#475569',
      ghiChu: dd ? 'Hai tam giác đồng dạng: các <b>góc tương ứng bằng nhau</b>, các <b>cạnh tương ứng tỉ lệ</b>.' : 'Hai tam giác bằng nhau: các <b>cạnh tương ứng bằng nhau</b>, các <b>góc tương ứng bằng nhau</b>.' });

    var hoatHinh = [{ id: 'gop', nhan: dd ? 'Đặt tam giác A′B′C′ lên ABC' : 'Gộp hình (chồng khít)', thoiGian: 5200,
      ghiChu: function (P, ts, t) {
        var lat = ts.lat;
        if (lat && t < 0.4) return "Tam giác $A'B'C'$ đang bị <b>lật</b>: lật tờ giấy lại…";
        if (t < 1) return dd ? "Dời tam giác $A'B'C'$ để $A'$ trùng $A$, hai cạnh nằm trên hai tia $AB$, $AC$…" : "Dời tam giác $A'B'C'$ chồng lên tam giác $ABC$…";
        return dd ? "Hai tam giác có chung góc $A$, cạnh $B'C'$ song song với $BC$: <b>$\\triangle A'B'C' \\backsim \\triangle ABC$</b> theo tỉ số $k = " + soL(ts.k) + '$.' : "Hai tam giác <b>trùng khít</b>: <b>$\\triangle ABC = \\triangle A'B'C'$</b>.";
      } }];
    if (opt.th !== 'vuong') hoatHinh.push({ id: 've', nhan: 'Hướng dẫn vẽ tam giác A′B′C′', anDiem: true,
      thoiGian: function (P, ts) { return kbVe(P, ts).tong * 1000; },
      ghiChu: function (P, ts, t) { return kbVe(P, ts).ghi(t); } });

    // Kịch bản vẽ tam giác A'B'C' bằng thước, compa, thước đo góc — từng thao tác một
    function kbVe(P, ts) {
      var Q = T2(P, ts), A2 = Q.A, B2 = Q.B, C2 = Q.C, G2 = H.trongTam(A2, B2, C2), k = dd ? ts.k : 1, D = DUNG;
      var dai = function (id) { var c = TEN_C[id]; return H.dai(P[c[0]], P[c[1]]); };
      var Ls = function (id) { return soL(dai(id) * k); };
      function danhCanh(g, id, laT2) { var c = TEN_C[id], T = laT2 ? Q : P; g.doan(T[c[0]], T[c[1]], { mau: MAU_C[id], rong: 4.5, kyHieu: dd ? 0 : VACH[id] }); }
      function danhGoc(g, id, laT2) { var o = { A: ['B', 'C'], B: ['C', 'A'], C: ['A', 'B'] }[id], T = laT2 ? Q : P; g.goc(T[o[0]], T[id], T[o[1]], { mau: MAU_G[id], r: 26, kyHieu: VACH[id], doMoTo: 0.35, nhan: false }); }
      function ten(g, V, t) { g.diem(V, t, { mau: '#0D9488', huong: H.tru(V, G2) }); }
      var aBC = H.huong(B2, C2), aBA = H.huong(B2, A2), aCB = H.huong(C2, B2), aCA = H.huong(C2, A2);
      var buoc = [], n = 0;
      function B(t) { n++; return '<b>Bước ' + n + '.</b> ' + t; }
      // Chuyển một cạnh của ABC sang tam giác mới: mũi kim tại X2, cung cắt quanh hướng aDich
      function chuyenCanh(id, X1, Y1, X2, aDich, ghiDo, ghiVe, sau) {
        var r = dai(id) * k, lech = 0.28;
        if (!dd) {
          buoc.push(D.doCompa(X1, Y1, { ghi: B(ghiDo), danh: function (g) { danhCanh(g, id, false); }, sau: function (g) { danhCanh(g, id, false); } }));
          buoc.push(D.chuyenCompa(X1, Y1, X2, diemTron(X2, r, aDich - lech), { ghi: 'Giữ nguyên độ mở của compa, đặt mũi kim tại $' + ghiVe[0] + '$.' }));
        } else {
          buoc.push(D.doCompa(X2, diemTron(X2, r, aDich - lech), { ghi: B('Mở compa một khoảng bằng $k \\cdot ' + id + ' = ' + Ls(id) + '$ cm, đặt mũi kim tại $' + ghiVe[0] + '$.') }));
        }
        buoc.push(D.cung(X2, r, aDich - lech, aDich + lech, { ghi: ghiVe[1], sau: sau }));
      }
      if (opt.th === 'ccc') {
        buoc.push(D.doan(B2, H.lerp(B2, C2, 1.3), { ghi: B("Dùng thước vẽ tia $B'x$."), net: { rong: 2, mau: '#475569' } }));
        chuyenCanh('BC', P.B, P.C, B2, aBC, 'Đặt compa đo đoạn $BC$: mũi kim tại $B$, đầu chì tại $C$.', ["B'", "Vạch cung cắt tia $B'x$ tại $C'$: $B'C' = " + (dd ? 'k \\cdot BC' : 'BC') + '$.'],
          function (g) { ten(g, C2, "C'"); });
        chuyenCanh('AB', P.B, P.A, B2, aBA, 'Đặt compa đo đoạn $AB$.', ["B'", "Vẽ cung tròn tâm $B'$ bán kính $" + (dd ? 'k \\cdot AB' : 'AB') + '$.']);
        chuyenCanh('CA', P.C, P.A, C2, aCA, 'Đặt compa đo đoạn $AC$.', ["C'", "Vẽ cung tròn tâm $C'$ bán kính $" + (dd ? 'k \\cdot AC' : 'AC') + "$; hai cung cắt nhau tại $A'$."],
          function (g) { ten(g, A2, "A'"); });
        buoc.push(D.doan(B2, C2, { tg: 0.7, ghi: B("Nối các điểm: kẻ $B'C'$."), sau: function (g) { danhCanh(g, 'BC', true); } }));
        buoc.push(D.doan(A2, B2, { ghi: "Kẻ $A'B'$.", sau: function (g) { danhCanh(g, 'AB', true); } }));
        buoc.push(D.doan(A2, C2, { ghi: "Kẻ $A'C'$.", sau: function (g) { danhCanh(g, 'CA', true); } }));
      } else if (opt.th === 'cgc') {
        var rA = dai('AB') * k, rC = dai('BC') * k;
        buoc.push(D.doGoc(P.B, P.C, P.A, { ghi: B('Dùng thước đo góc đo góc $B$: $\\widehat{B} = ' + soL(goc(P, 'B'), 0) + '^\\circ$.'), danh: function (g) { danhGoc(g, 'B', false); }, sau: function (g) { danhGoc(g, 'B', false); } }));
        buoc.push(D.doan(B2, diemTron(B2, rC * 1.3, aBC), { ghi: B("Vẽ tia $B'y$."), net: { rong: 2, mau: '#475569' } }));
        buoc.push(D.danhDauGoc(B2, aBC, aBA, { r: Math.min(rA, rC) * 0.7, ghi: B("Đặt thước đo góc tại $B'$, vạch $0^\\circ$ trùng tia $B'y$; đánh dấu điểm ở vạch $" + soL(goc(P, 'B'), 0) + '^\\circ$.') }));
        buoc.push(D.doan(B2, diemTron(B2, rA * 1.3, aBA), { ghi: B("Vẽ tia $B'x$ qua điểm vừa đánh dấu: $\\widehat{xB'y} = \\widehat{B}$."), net: { rong: 2, mau: '#475569' }, sau: function (g) { danhGoc(g, 'B', true); } }));
        chuyenCanh('AB', P.B, P.A, B2, aBA, 'Đặt compa đo đoạn $BA$.', ["B'", "Vạch cung cắt tia $B'x$ tại $A'$: $B'A' = " + (dd ? 'k \\cdot BA' : 'BA') + '$.'], function (g) { ten(g, A2, "A'"); });
        chuyenCanh('BC', P.B, P.C, B2, aBC, 'Đặt compa đo đoạn $BC$.', ["B'", "Vạch cung cắt tia $B'y$ tại $C'$: $B'C' = " + (dd ? 'k \\cdot BC' : 'BC') + '$.'], function (g) { ten(g, C2, "C'"); });
        buoc.push(D.doan(B2, A2, { tg: 0.6, ghi: B("Tô lại các cạnh và nối $A'C'$."), sau: function (g) { danhCanh(g, 'AB', true); } }));
        buoc.push(D.doan(B2, C2, { tg: 0.6, sau: function (g) { danhCanh(g, 'BC', true); } }));
        buoc.push(D.doan(A2, C2, { sau: function (g) { g.doan(A2, C2, { rong: 3 }); } }));
      } else {   // gcg, gg
        var rCx = dai('BC') * k, Lx = H.dai(B2, A2) * 1.25, Ly = H.dai(C2, A2) * 1.25;
        buoc.push(D.doan(B2, H.lerp(B2, C2, 1.3), { ghi: B("Dùng thước vẽ tia $B'z$."), net: { rong: 2, mau: '#475569' } }));
        chuyenCanh('BC', P.B, P.C, B2, aBC, 'Đặt compa đo đoạn $BC$.', ["B'", "Vạch cung cắt tia $B'z$ tại $C'$: $B'C' = " + (dd ? 'k \\cdot BC' : 'BC') + '$.'], function (g) { ten(g, C2, "C'"); danhCanh(g, 'BC', true); });
        buoc.push(D.doGoc(P.B, P.C, P.A, { ghi: B('Đo góc $B$: $\\widehat{B} = ' + soL(goc(P, 'B'), 0) + '^\\circ$.'), danh: function (g) { danhGoc(g, 'B', false); }, sau: function (g) { danhGoc(g, 'B', false); } }));
        buoc.push(D.danhDauGoc(B2, aBC, aBA, { r: rCx * 0.35, ghi: B("Đặt thước đo góc tại $B'$ (vạch $0^\\circ$ trùng $B'C'$), đánh dấu điểm ở vạch $" + soL(goc(P, 'B'), 0) + '^\\circ$.') }));
        buoc.push(D.doan(B2, diemTron(B2, Lx, aBA), { ghi: "Vẽ tia $B'x$ qua điểm vừa đánh dấu.", net: { mau: '#7C3AED', rong: 2.5 }, sau: function (g) { danhGoc(g, 'B', true); } }));
        buoc.push(D.doGoc(P.C, P.B, P.A, { ghi: B('Đo góc $C$: $\\widehat{C} = ' + soL(goc(P, 'C'), 0) + '^\\circ$.'), danh: function (g) { danhGoc(g, 'C', false); }, sau: function (g) { danhGoc(g, 'C', false); } }));
        buoc.push(D.danhDauGoc(C2, aCB, aCA, { r: rCx * 0.35, ghi: B("Đặt thước đo góc tại $C'$ (vạch $0^\\circ$ trùng $C'B'$), đánh dấu điểm ở vạch $" + soL(goc(P, 'C'), 0) + '^\\circ$.') }));
        buoc.push(D.doan(C2, diemTron(C2, Ly, aCA), { ghi: "Vẽ tia $C'y$ qua điểm vừa đánh dấu.", net: { mau: '#0D9488', rong: 2.5 }, sau: function (g) { danhGoc(g, 'C', true); } }));
        buoc.push(D.hien(function (g) { ten(g, A2, "A'"); g.daGiac([A2, B2, C2], { to: '#FDBA74', doMoTo: 0.3, rong: 0 }); }, { tg: 0.8, ghi: B("Hai tia $B'x$ và $C'y$ cắt nhau tại $A'$.") }));
      }
      buoc.push(D.hien(function (g) { g.daGiac([A2, B2, C2], { to: '#FDBA74', doMoTo: 0.3, rong: 0 }); }, { tg: 0.6, ghi: 'Ta được ' + (dd ? "$\\triangle A'B'C' \\backsim \\triangle ABC$." : "$\\triangle A'B'C' = \\triangle ABC$.") }));
      var kb = kichBan(buoc);
      kb.veTen = function (g) { g.diem(B2, "B'", { huong: H.tru(B2, G2) }); };
      return kb;
    }

    function veTamGiac(g, Q, ten, to, ts, laT2) {
      g.daGiac([Q.A, Q.B, Q.C], { to: to, doMoTo: 0.35, rong: 2.4 });
      ['AB', 'BC', 'CA'].forEach(function (id) {
        var c = TEN_C[id], on = g.bat(id) || g.bat('ketLuan');
        g.doan(Q[c[0]], Q[c[1]], { mau: on ? MAU_C[id] : '#1B2540', rong: on ? 5 : 2.4, kyHieu: on && !dd ? VACH[id] : 0 });
        if (on && g.hienSo()) g.nhanDo(Q[c[0]], Q[c[1]], so(H.dai(Q[c[0]], Q[c[1]])), { mau: MAU_C[id], kc: 18, benTrai: H.dienTich([Q.A, Q.B, Q.C]) >= 0 ? cheo(Q) : !cheo(Q) });
      });
      ['A', 'B', 'C'].forEach(function (v) {
        if (!(g.bat(v) || g.bat('ketLuan'))) return;
        var o = { A: ['B', 'C'], B: ['C', 'A'], C: ['A', 'B'] }[v];
        g.goc(Q[o[0]], Q[v], Q[o[1]], { mau: MAU_G[v], r: 24, kyHieu: VACH[v], doMoTo: 0.3 });
      });
      var G = H.trongTam(Q.A, Q.B, Q.C);
      ['A', 'B', 'C'].forEach(function (v) { g.diem(Q[v], v + (laT2 ? "'" : ''), { huong: H.tru(Q[v], G) }); });
    }
    function cheo(Q) { return (Q.B[0] - Q.A[0]) * (Q.C[1] - Q.A[1]) - (Q.B[1] - Q.A[1]) * (Q.C[0] - Q.A[0]) < 0; }
    function cung(g, O, r, a0, a1, mau) { var ds = []; for (var i = 0; i <= 24; i++) { var a = a0 + (a1 - a0) * i / 24; ds.push([O[0] + r * Math.cos(a), O[1] + r * Math.sin(a)]); } g.duong(ds, { mau: mau || '#0D9488', rong: 2 }); }

    var cfg = {
      ten: opt.ten, lop: opt.lop,
      diem: opt.th === 'vuong' ? { A: [-6, -1], B: [-2, -1], C: [-6, 2] } : { A: [-5.5, 2], B: [-7, -1.5], C: [-2, -1.5] },
      buocLuoi: 0.5,
      rangBuoc: opt.th === 'vuong' ? {
        B: function (p, P) { return [Math.max(P.A[0] + 1, p[0]), P.A[1]]; },
        C: function (p, P) { return [P.A[0], Math.max(P.A[1] + 1, p[1])]; },
      } : null,
      coDinh: opt.th === 'vuong' ? ['A'] : [],
      luaChon: opt.th === 'vuong' ? [{ khoa: 'thv', gt: Object.keys(TH_VUONG)[0], nhan: 'Trường hợp', ds: Object.keys(TH_VUONG).map(function (k) { return { gt: k, nhan: TH_VUONG[k].nhan }; }),
        khiDoi: function (gt, P, ts, api) { api.dungHoat(); api.datSang(TH_VUONG[gt].yt); } }] : [],
      thamSo: [{ khoa: 'xoay', nhan: 'Xoay tam giác A′B′C′', min: 0, max: 345, buoc: 15, gt: 30, hienThi: function (ts) { return so(ts.xoay, 0) + '°'; } }]
        .concat(dd ? [{ khoa: 'k', nhan: 'Tỉ số đồng dạng k', min: 0.5, max: 2.5, buoc: 0.1, gt: 1.5, mau: '#0D9488' }] : []),
      hopChon: [{ khoa: 'lat', nhan: 'Lật tam giác A′B′C′ (đối xứng gương)', gt: false }],
      tieuDeLuaChon: 'Điều chỉnh tam giác A′B′C′',
      lamSang: lamSang, hoatHinh: hoatHinh,

      ve: function (g, P, ts) {
        var Q = T2(P, ts), tg = g.hoat('gop'), tv = g.hoat('ve');
        veTamGiac(g, P, '', '#93C5FD', ts, false);
        if (tg !== null) {
          var dsQ = [Q.A, Q.B, Q.C], G2 = H.trongTam(Q.A, Q.B, Q.C), sau = dsQ;
          var p1 = ts.lat ? H.em(H.doan(tg, 0, 0.35)) : 1, p2 = H.em(H.doan(tg, ts.lat ? 0.4 : 0, 1));
          if (ts.lat) sau = dsQ.map(function (p) { return [2 * G2[0] - p[0], p[1]]; });
          if (ts.lat && tg < 0.4) {
            var truc = [[G2[0], G2[1] - 1], [G2[0], G2[1] + 1]], th = Math.PI * p1;
            var q3 = dsQ.map(function (p) { return DX.quanhTruc(p, truc[0], truc[1], th); });
            g.daGiac(q3.map(DX.bong), { to: '#0F172A', doMoTo: 0.12 * Math.sin(th), khongVien: true });
            g.daGiac(q3.map(function (p) { return DX.chieu(g, p); }), { to: Math.cos(th) >= 0 ? '#FDBA74' : '#FDE68A', doMoTo: 0.8, rong: 2.4, mauNet: '#B45309' });
            return;
          }
          var dich = dd ? [P.A, H.lerp(P.A, P.B, ts.k), H.lerp(P.A, P.C, ts.k)] : [P.A, P.B, P.C];
          var ht = H.doiHinh(sau, dich, p2);
          g.daGiac(ht, { to: '#FDBA74', doMoTo: 0.6, rong: 2.4, mauNet: '#B45309' });
          if (tg >= 1 && dd) { g.doan(dich[1], dich[2], { mau: '#7C3AED', rong: 4 }); g.duongThang(P.B, P.C, { mau: '#7C3AED', rong: 1.5, dut: '6 5' }); }
          ['A', 'B', 'C'].forEach(function (v, i) { g.diem(ht[i], v + "'", { mau: '#B45309', huong: H.tru(ht[i], H.trongTam(ht[0], ht[1], ht[2])) }); });
          return;
        }
        if (tv !== null) { var kb = kbVe(P, ts); kb.ve(g, tv); kb.veTen(g); return; }
        veTamGiac(g, Q, "'", '#FDBA74', ts, true);
        if (opt.th === 'vuong') { g.goc(P.B, P.A, P.C, { mau: '#1B2540', nhan: false, r: 14, to: false }); g.goc(Q.B, Q.A, Q.C, { mau: '#1B2540', nhan: false, r: 14, to: false }); }
      },

      congThuc: function (P, ts, C) {
        var yt = yeuTo(ts), ky = opt.th === 'vuong' ? '' : ' (' + opt.th.split('').join('.') + ')';
        var dk = yt.map(function (id) {
          if (id.length === 2) { var c = TEN_C[id]; return dd ? C.m(id, '\\dfrac{' + c[0] + "'" + c[1] + "'}{" + id + '}') : C.m(id, id + ' = ' + c[0] + "'" + c[1] + "'"); }
          return C.m(id, '\\widehat{' + id + '} = \\widehat{' + id + "'}");
        });
        var bt = dd && (opt.th === 'ccc' || (opt.th === 'vuong' && yt.length === 2)) ? '$' + dk.join(' = ') + '$' : '$' + dk.join('$ ; $') + '$';
        if (dd && opt.th === 'cgc') bt = '$' + dk[0] + ' = ' + dk[2] + '$ ; $' + dk[1] + '$';
        var ten = opt.th === 'vuong' ? (dd ? 'Tam giác vuông đồng dạng' : 'Tam giác vuông bằng nhau') + ': ' + TH_VUONG[ts.thv].nhan.toLowerCase() : (dd ? 'Trường hợp đồng dạng' : 'Trường hợp bằng nhau') + ky;
        return [{ id: 'ketLuan', ten: ten, bt: 'Nếu ' + bt + ' thì ' + (dd ? "$\\triangle A'B'C' \\backsim \\triangle ABC$" : "$\\triangle ABC = \\triangle A'B'C'$") }];
      },
      nhanXet: function (P, ts) {
        var Q = T2(P, ts), s = '';
        ['AB', 'BC', 'CA'].forEach(function (id) { var c = TEN_C[id], l1 = H.dai(P[c[0]], P[c[1]]), l2 = H.dai(Q[c[0]], Q[c[1]]); s += '<span style="color:' + MAU_C[id] + ';font-weight:700">$' + (dd ? '\\dfrac{' + c[0] + "'" + c[1] + "'}{" + id + '} = ' + soL(l2 / l1) : id + ' = ' + c[0] + "'" + c[1] + "' = " + soL(l1)) + '$</span> · '; });
        s = s.replace(/ · $/, '') + (dd ? '<div style="height:6px"></div>' : '<br>');
        ['A', 'B', 'C'].forEach(function (v) { s += '<span style="color:' + MAU_G[v] + ';font-weight:700">$\\widehat{' + v + '} = \\widehat{' + v + "'} = " + soL(goc(P, v), 0) + '^\\circ$</span> · '; });
        return s.replace(/ · $/, '') + (ts.lat ? '<br><span class="dung">Tam giác $A\'B\'C\'$ đang bị lật — bấm “' + (dd ? 'Đặt' : 'Gộp hình') + '” để xem.</span>' : '');
      },
      khungNhin: function (P, ts) { var Q = T2(P, ts); return [Q.A, Q.B, Q.C]; },
      khiDatLai: function (P, ts) { },
    };
    if (opt.th === 'vuong') cfg.batDau = TH_VUONG[Object.keys(TH_VUONG)[0]].yt;
    return cfg;
  }


  /* =====================================================================
     TIỆN ÍCH CHO CÁC TRANG TỨ GIÁC (Toán 8)
     q = { A, B, C, D } — bốn đỉnh theo thứ tự.
     ===================================================================== */
  var TG = {
    canh: function (q) { return [[q.A, q.B, 'AB'], [q.B, q.C, 'BC'], [q.C, q.D, 'CD'], [q.D, q.A, 'DA']]; },
    tam: function (q) { return [(q.A[0] + q.B[0] + q.C[0] + q.D[0]) / 4, (q.A[1] + q.B[1] + q.C[1] + q.D[1]) / 4]; },
    nhanDinh: function (g, q) {
      var T = TG.tam(q);
      ['A', 'B', 'C', 'D'].forEach(function (k) { g.diem(q[k], k, { huong: H.tru(q[k], T) }); });
    },
    // Vẽ 4 góc: o.ids = [idA, idB, idC, idD] (id làm sáng, có thể null), o.kyHieu = [..], o.mau
    goc: function (g, q, i, o) {
      var ds = [q.A, q.B, q.C, q.D], V = ds[i], T = ds[(i + 3) % 4], S = ds[(i + 1) % 4];
      return g.goc(T, V, S, o);
    },
    // Hai đường chéo: o.sang, o.trung (ký hiệu cắt nhau tại trung điểm), o.bang (4 đoạn bằng nhau), o.vuong
    cheo: function (g, q, o) {
      o = o || {};
      var mau = o.mau || MAU.duongCheo, O = H.giao(q.A, q.C, q.B, q.D);
      g.doan(q.A, q.C, { sang: o.sang, mau: mau, rong: 2.4, rongSang: 3.5 }); g.doan(q.B, q.D, { sang: o.sang, mau: mau, rong: 2.4, rongSang: 3.5 });
      if (!O) return null;
      if (o.bang) [q.A, q.B, q.C, q.D].forEach(function (V) { g.kyHieu(V, O, 1, mau); });
      else if (o.trung) { g.kyHieu(q.A, O, 1, mau); g.kyHieu(O, q.C, 1, mau); g.kyHieu(q.B, O, 2, mau); g.kyHieu(O, q.D, 2, mau); }
      if (o.vuong) g.goc(q.C, O, q.B, { mau: mau, r: 12 });
      if (o.tenO !== false) g.diem(O, 'O', { r: 3.5, mau: mau, huong: [0.7, -1] });
      return O;
    },
    // Nhận dạng tứ giác theo dấu hiệu
    nhanDang: function (q) {
      var A = q.A, B = q.B, C = q.C, D = q.D;
      var ss1 = H.songSong(A, B, D, C), ss2 = H.songSong(A, D, B, C);
      var AB = H.dai(A, B), BC = H.dai(B, C), CD = H.dai(C, D), DA = H.dai(D, A);
      var O = H.giao(A, C, B, D);
      var catTrung = !!O && H.dai(O, H.trung(A, C)) < 1e-3 && H.dai(O, H.trung(B, D)) < 1e-3;
      var cheoBang = H.bang(H.dai(A, C), H.dai(B, D)), cheoVuong = H.vuongGoc(A, C, B, D);
      var gA = H.gocDo(D, A, B), gB = H.gocDo(A, B, C), gC = H.gocDo(B, C, D), gD = H.gocDo(C, D, A);
      var vuong = function (x) { return Math.abs(x - 90) < 0.05; };
      var coGocVuong = vuong(gA) || vuong(gB) || vuong(gC) || vuong(gD);
      var ke4Bang = H.bang(AB, BC) && H.bang(BC, CD) && H.bang(CD, DA);
      var loi = Math.abs(gA + gB + gC + gD - 360) < 0.1;
      var bh = ss1 && ss2, ten;
      if (!loi) ten = 'tứ giác (không lồi)';
      else if (bh && coGocVuong && (ke4Bang || cheoVuong)) ten = 'hình vuông';
      else if (bh && coGocVuong) ten = 'hình chữ nhật';
      else if (bh && (ke4Bang || cheoVuong)) ten = 'hình thoi';
      else if (bh) ten = 'hình bình hành';
      else if (ss1 || ss2) {
        var dayLaAB = ss1, gocKe = dayLaAB ? Math.abs(gA - gB) < 0.05 || Math.abs(gC - gD) < 0.05 : Math.abs(gA - gD) < 0.05 || Math.abs(gB - gC) < 0.05;
        ten = coGocVuong ? 'hình thang vuông' : (gocKe ? 'hình thang cân' : 'hình thang');
      } else ten = 'tứ giác';
      return { ss1: ss1, ss2: ss2, catTrung: catTrung, cheoBang: cheoBang, cheoVuong: cheoVuong, coGocVuong: coGocVuong, ke4Bang: ke4Bang, ten: ten, O: O,
               goc: [gA, gB, gC, gD], tongGoc: gA + gB + gC + gD, canh: [AB, BC, CD, DA] };
    },
    // Khung "Dấu hiệu nhận biết"
    dauHieu: function (tieuDe, ds) {
      return '<hr style="border:none;border-top:1px dashed #CBD5E1;margin:8px 0"><b>' + tieuDe + '</b>' + ds.map(function (x) { return '<br>• ' + x; }).join('');
    },
    // Giữ góc vuông: điểm D ⊥ AB tại A với độ dài cũ (dùng khi kéo B)
    vuongTai: function (A, B, dai, ben) {
      var u = H.tru(B, A), L = Math.hypot(u[0], u[1]) || 1;
      return [A[0] - u[1] / L * dai * ben, A[1] + u[0] / L * dai * ben];
    },
  };

  window.KhungPhang = { tao: tao, MAU: MAU, H: H, so: so, soL: soL, kichBan: kichBan, dung: DUNG, gocLech: gocLech, doiXung: DX, haiTamGiac: haiTamGiac, tuGiac: TG };
})();
