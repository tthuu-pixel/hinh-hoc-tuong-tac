/* =====================================================================
   KHUNG MÔ HÌNH "QUAY HÌNH PHẲNG TẠO HÌNH KHỐI" (Toán 9: hình trụ, hình nón…)
   Một hình phẳng (hình chữ nhật, tam giác vuông, nửa hình tròn…) có một cạnh nằm trên trục quay (cạnh cố định).
   Quay hình quanh trục: các cạnh còn lại quét nên mặt xung quanh và mặt đáy.
   Mỗi trang gọi QuayHinh.tao({...}):
     ten, lop, thamSo: [{khoa, nhan, min, max, buoc, gt}],
     cachQuay: [{ id, nhan, dung(ts) -> { diem: {Tên: [x, y]}, thuTu: [...], r, h, l?, tenHinh, tenTruc,
                   cung?: { 'BA': { tam: [x, y] } }  (cạnh từ B tới A là cung tròn, phồng về phía x > 0),
                   phu?: [{ a, b, vai, dut }]  (đoạn phụ quay theo, ví dụ bán kính OM),
                   vet?: ['M']  (điểm vẽ thêm vết), soDo?: [{ chu, vi: [x, y], mau, quay }] } }]
       (x: khoảng cách tới trục, y: độ cao; cạnh nằm trên trục là cạnh cố định)
     lamSang: [{ id: 'truc'|'banKinh'|'duongSinh'|'xq'|'day', nhan, ghiChu(info) }],
     ketQua(info) -> chuỗi HTML (có $…$) khi quay đủ một vòng,
     congThuc(r, h) -> [{ ten, bt }],  soSanh: [{ ten, tinh(r, h) }]
   Cần nạp trước: thu-vien-ngoai/three-bundle.min.js
   ===================================================================== */
(function () {
  'use strict';
  var T = window.THREE, PI = Math.PI, VONG = 2 * PI;
  var MAU = { truc: '#92400E', banKinh: '#E0342F', duongSinh: '#EA580C', cung: '#EA580C', xungQuanh: '#FF9800', day: '#7C3AED', hinh: '#3B82F6', canh: '#1B2540', vet: '#7C3AED', duongKinh: '#0891B2' };
  var TOC = { cham: { nhan: 'Chậm', giay: 10 }, vua: { nhan: 'Vừa', giay: 6 }, nhanh: { nhan: 'Nhanh', giay: 3.2 } };
  var IC = {
    chay: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    dung: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    datLai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    cheo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h11v12H4zM4 8l5-4h11l-5 4M20 4v12l-5 4"/></svg>',
    truoc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>',
    tren: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9l9-5 9 5-9 5z"/><path d="M12 14v6" opacity=".5"/></svg>',
    phong: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/></svg>',
    thu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6"/></svg>',
    toan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  };
  function so(x, le) {
    if (le === undefined) le = 2;
    var r = Math.round(x * Math.pow(10, le)) / Math.pow(10, le);
    if (Math.abs(r) < 1e-9) r = 0;
    return String(r).replace('.', ',');
  }
  function soL(x, le) { return so(x, le).replace(',', '{,}'); }
  function thoat(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function tenDinh(t) { return String(t).replace(/'/g, '′'); }
  // điểm (x, y) của mặt phẳng hình, quay góc φ quanh trục Oy
  function p3(x, y, phi) { return new T.Vector3(x * Math.cos(phi), y, x * Math.sin(phi)); }   // quay về phía người xem trước

  function tao(cfg) {
    document.body.classList.add('trang-mo-hinh');
    document.title = cfg.ten + ' · ' + ((window.CAU_HINH || {}).TEN_NGAN || (window.CAU_HINH || {}).TEN_SAN_PHAM || '');
    if (window.GiaoDien) GiaoDien.thanhTren({ quayLai: '../thu-vien.html' });

    var ts = {}; cfg.thamSo.forEach(function (p) { ts[p.khoa] = p.gt; });
    var TT = { cach: 0, goc: 0, chay: false, toc: 'vua', sang: null, ten: true, quet: true, soDo: true, bong: true, xongBao: false };
    try { TT.toc = localStorage.getItem('mh3d_toc_do') || 'vua'; if (!TOC[TT.toc]) TT.toc = 'vua'; } catch (e) { }
    var HINH = null;   // hình phẳng của cách quay hiện tại

    /* ---------- khung trang (giống các mô hình không gian khác) ---------- */
    var goc = document.getElementById('mo-hinh');
    var mauLop = { 6: 'var(--lop6)', 7: 'var(--lop7)', 8: 'var(--lop8)', 9: 'var(--lop9)' }[cfg.lop] || 'var(--chinh)';
    goc.innerHTML =
      '<div class="mh" id="mh"><div class="mh-canh" id="mh-canh">' +
      '<div class="mh-tieu-de">' + thoat(cfg.ten) + '<span style="background:' + mauLop + '">Lớp ' + cfg.lop + '</span></div>' +
      '<div class="mh-ghi-chu" id="mh-ghi-chu"></div>' +
      '<div class="nhan-dem" id="mh-dem" style="--mau:' + MAU.vet + '"></div>' +
      '<div class="mh-cong-cu" id="mh-cong-cu"></div>' +
      '</div><aside class="mh-bang" id="mh-bang"></aside></div>';
    var khungCanh = document.getElementById('mh-canh'), bang = document.getElementById('mh-bang');
    var elGhiChu = document.getElementById('mh-ghi-chu'), elDem = document.getElementById('mh-dem');

    /* ---------- Three.js ---------- */
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    khungCanh.insertBefore(renderer.domElement, khungCanh.firstChild);
    var nhanRenderer = new T.CSS2DRenderer(); nhanRenderer.domElement.className = 'mh-nhan-lop';
    khungCanh.insertBefore(nhanRenderer.domElement, renderer.domElement.nextSibling);
    var canh = new T.Scene(), camera = new T.PerspectiveCamera(32, 1, 0.05, 500);
    canh.add(new T.HemisphereLight(0xffffff, 0xB8C4DA, 1.7));
    var den = new T.DirectionalLight(0xffffff, 1.3); den.position.set(5, 9, 7); canh.add(den);
    var dk = new T.OrbitControls(camera, renderer.domElement);
    dk.enableDamping = true; dk.dampingFactor = 0.09; dk.rotateSpeed = 0.8;
    dk.touches = { ONE: T.TOUCH.ROTATE, TWO: T.TOUCH.DOLLY_PAN };
    renderer.domElement.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    var nhomCo = new T.Group(), nhomQuay = new T.Group(), nhomQuet = new T.Group(), nhomVien = new T.Group();
    canh.add(nhomCo, nhomQuay, nhomQuet, nhomVien);
    var dsVL = [];   // LineMaterial cần cập nhật độ phân giải

    function duong(diem, mau, rong, tuyChon) {
      tuyChon = tuyChon || {};
      var g = new T.LineGeometry(), arr = [];
      diem.forEach(function (p) { arr.push(p.x, p.y, p.z); });
      g.setPositions(arr);
      var m = new T.LineMaterial({ color: new T.Color(mau), linewidth: rong, dashed: !!tuyChon.dut, dashSize: 0.18, gapSize: 0.13, transparent: true, opacity: tuyChon.doMo == null ? 1 : tuyChon.doMo });
      if (tuyChon.khongSau) m.depthTest = false;
      m.resolution.set(khungCanh.clientWidth || 1, khungCanh.clientHeight || 1);
      dsVL.push(m);
      var ln = new T.Line2(g, m); ln.computeLineDistances(); ln.renderOrder = tuyChon.thuTu == null ? 4 : tuyChon.thuTu;
      return ln;
    }
    function don(nhom) {
      while (nhom.children.length) {
        var c = nhom.children[0];
        c.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) { var i = dsVL.indexOf(o.material); if (i >= 0) dsVL.splice(i, 1); o.material.dispose(); }
          if (o.element && o.element.parentNode) o.element.parentNode.removeChild(o.element);
        });
        nhom.remove(c);
      }
    }
    function nhan(chu, lop, mau) {
      var el = document.createElement('div'); el.className = lop; el.innerHTML = chu;
      if (mau) el.style.background = mau;
      return new T.CSS2DObject(el);
    }
    function cham(p, mau, r) {
      var m = new T.Mesh(new T.SphereGeometry(r, 16, 12), new T.MeshBasicMaterial({ color: mau, depthTest: false }));
      m.position.copy(p); m.renderOrder = 7; return m;
    }

    /* ---------- hình phẳng + vai trò từng cạnh ---------- */
    function tinhHinh() {
      var d = cfg.cachQuay[TT.cach].dung(ts), n = d.thuTu.length, canhDS = [], xMax = 0;
      for (var i = 0; i < n; i++) {
        var a = d.thuTu[i], b = d.thuTu[(i + 1) % n], P = d.diem[a], Q = d.diem[b], vai, ds = [P, Q], cg = d.cung && d.cung[a + b];
        if (cg) {   // cung tròn từ P tới Q, đi qua phía x > 0
          var tx = cg.tam[0], ty = cg.tam[1], R = Math.hypot(P[0] - tx, P[1] - ty), a0 = Math.atan2(P[1] - ty, P[0] - tx), a1 = Math.atan2(Q[1] - ty, Q[0] - tx);
          var da1 = ((a1 - a0) % VONG + VONG) % VONG, da2 = da1 - VONG;   // ngược / thuận chiều kim đồng hồ
          var da = tx + R * Math.cos(a0 + da1 / 2) >= tx + R * Math.cos(a0 + da2 / 2) ? da1 : da2;   // chọn đường đi qua phía x > 0
          ds = []; for (var j = 0; j <= 64; j++) { var t = a0 + da * j / 64; ds.push([tx + R * Math.cos(t), ty + R * Math.sin(t)]); }
          vai = 'cung';
        } else if (Math.abs(P[0]) < 1e-9 && Math.abs(Q[0]) < 1e-9) vai = 'truc';
        else if (Math.abs(P[1] - Q[1]) < 1e-9) vai = 'banKinh';
        else vai = 'duongSinh';
        ds.forEach(function (x) { xMax = Math.max(xMax, x[0]); });
        canhDS.push({ a: a, b: b, P: P, Q: Q, ds: ds, vai: vai, tam: cg ? cg.tam : null });
      }
      d.canh = canhDS;
      d.l = d.l || Math.hypot(d.r, d.h);
      d.R = Math.hypot(xMax, d.h / 2);
      d.tenCanh = function (vai) { var c = canhDS.filter(function (x) { return x.vai === vai; })[0]; return c ? c.a + c.b : ''; };
      return d;
    }

    /* ---------- dựng phần đứng yên + hình phẳng quay ---------- */
    var dt = { canh: [], quet: [], vet: [], nhanR: null };
    function xay() {
      don(nhomCo); don(nhomQuay); dt = { canh: [], quet: [], vet: [], nhanR: null };
      var H = HINH, h = H.h, r = H.r, rd = H.R * 0.022 + 0.04;
      // lưới nền mờ
      var luoi = new T.GridHelper(Math.ceil(Math.max(r, h) * 3.2), Math.ceil(Math.max(r, h) * 3.2), 0xC9D5EA, 0xDDE5F2);
      luoi.position.y = -0.002; luoi.material.transparent = true; luoi.material.opacity = 0.55; nhomCo.add(luoi);
      // trục quay (đường thẳng chứa cạnh cố định), kéo dài hai đầu bằng nét đứt
      nhomCo.add(duong([new T.Vector3(0, -h * 0.18, 0), new T.Vector3(0, h * 1.25, 0)], '#64748B', 1.6, { dut: true, doMo: 0.8, thuTu: 2 }));
      var nhTruc = nhan('trục', 'nhan-truc'); nhTruc.position.set(0, h * 1.25 + 0.15, 0); nhomCo.add(nhTruc);
      // mũi tên chỉ chiều quay quanh trục
      var cung = [], rc = Math.max(0.55, H.R * 0.28), yc = h * 1.12;
      for (var i = 0; i <= 40; i++) cung.push(p3(rc, yc, -1.0 + i / 40 * 5.2));
      nhomCo.add(duong(cung, '#475569', 2, { thuTu: 2 }));
      var dau = new T.Mesh(new T.ConeGeometry(0.09 + rc * 0.08, 0.26 + rc * 0.15, 16), new T.MeshBasicMaterial({ color: '#475569' }));
      var cuoi = p3(rc, yc, 4.2), truocCuoi = p3(rc, yc, 4.1);
      dau.position.copy(cuoi); dau.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), cuoi.clone().sub(truocCuoi).normalize()); nhomCo.add(dau);
      // bóng mờ vị trí ban đầu của hình phẳng
      var bong = new T.Group(); bong.name = 'bong';
      H.canh.forEach(function (c) { bong.add(duong(c.ds.map(function (P) { return p3(P[0], P[1], 0); }), '#94A3B8', 1.6, { dut: true, doMo: 0.7, thuTu: 2 })); });
      nhomCo.add(bong);

      // hình phẳng (quay theo nhomQuay.rotation.y)
      var sh = new T.Shape();
      H.canh.forEach(function (c, i) { c.ds.forEach(function (P, j) { if (!i && !j) sh.moveTo(P[0], P[1]); else if (j) sh.lineTo(P[0], P[1]); }); });
      var mat = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({ color: MAU.hinh, transparent: true, opacity: 0.32, side: T.DoubleSide, depthWrite: false }));
      mat.renderOrder = 3; nhomQuay.add(mat);
      H.canh.forEach(function (c) {
        var mau = MAU[c.vai] || MAU.duongSinh;
        var ln = duong(c.ds.map(function (P) { return new T.Vector3(P[0], P[1], 0); }), mau, 4, { thuTu: 5 });
        ln.userData = { vai: c.vai };
        (c.vai === 'truc' ? nhomCo : nhomQuay).add(ln); dt.canh.push(ln);
      });
      // đỉnh: trên trục thì đứng yên, ngoài trục thì quay theo
      Object.keys(H.diem).forEach(function (k) {
        var P = H.diem[k], trenTruc = Math.abs(P[0]) < 1e-9, nhom = trenTruc ? nhomCo : nhomQuay;
        var v = new T.Vector3(P[0], P[1], 0);
        nhom.add(cham(v, '#1B2540', rd));
        var o = nhan(tenDinh(k), 'nhan-dinh');
        var lech = trenTruc ? new T.Vector3(-1, P[1] > h / 2 ? 0.35 : -0.35, 0) : new T.Vector3(0.7, P[1] > h / 2 ? 0.5 : -0.5, 0.2);
        o.position.copy(v).add(lech.normalize().multiplyScalar(H.R * 0.1 + 0.16)); o.userData.ten = true;
        nhom.add(o);
      });
      // đoạn phụ quay theo hình (ví dụ bán kính OM của nửa hình tròn)
      (H.phu || []).forEach(function (f) {
        var P = H.diem[f.a], Q = H.diem[f.b];
        var ln = duong([new T.Vector3(P[0], P[1], 0), new T.Vector3(Q[0], Q[1], 0)], MAU[f.vai] || MAU.banKinh, 3, { dut: f.dut, thuTu: 5 });
        ln.userData = { vai: f.vai }; nhomQuay.add(ln); dt.canh.push(ln);
      });
      if (H.soDo) {
        H.soDo.forEach(function (s) { var o = nhan(s.chu, 'nhan-do', s.mau); o.position.set(s.vi[0], s.vi[1], 0.05); o.userData.so = true; (s.quay ? nhomQuay : nhomCo).add(o); });
        apDungHienThi(); return;
      }
      // số đo: chiều cao trên trục, bán kính trên cạnh đáy, đường sinh (hình nón)
      var cTruc = H.canh.filter(function (c) { return c.vai === 'truc'; })[0];
      var coXien = H.canh.some(function (c) { return c.vai === 'duongSinh' && Math.abs(c.P[0] - c.Q[0]) > 1e-9; });
      var nh = nhan('<i>h</i> = ' + so(h) + ' cm', 'nhan-do', MAU.truc); nh.position.set(-H.R * 0.18 - 0.35, coXien ? h * 0.26 : h / 2, 0); nh.userData.so = true; nhomCo.add(nh);
      var cR = H.canh.filter(function (c) { return c.vai === 'banKinh'; }).sort(function (a, b) { return a.P[1] - b.P[1]; })[0];
      if (cR) { var nr = nhan('<i>r</i> = ' + so(r) + ' cm', 'nhan-do', MAU.banKinh); nr.position.set((cR.P[0] + cR.Q[0]) / 2, cR.P[1] - H.R * 0.07 - 0.12, 0.05); nr.userData.so = true; nhomQuay.add(nr); }
      var cL = H.canh.filter(function (c) { return c.vai === 'duongSinh'; })[0];
      if (cL && Math.abs(cL.P[0] - cL.Q[0]) > 1e-9) { var nl = nhan('<i>l</i> ≈ ' + so(H.l) + ' cm', 'nhan-do', MAU.duongSinh); nl.position.set((cL.P[0] + cL.Q[0]) / 2 + 0.35 + H.R * 0.08, (cL.P[1] + cL.Q[1]) / 2 + 0.25, 0); nl.userData.so = true; nhomQuay.add(nl); }
      void cTruc;
      apDungHienThi();
    }

    /* ---------- phần quét được (dựng lại mỗi khi góc đổi) ---------- */
    function vetQuet() {
      don(nhomQuet); dt.quet = []; dt.vet = [];
      var g = TT.goc; if (g < 1e-4) return;
      var H = HINH, na = Math.max(2, Math.ceil(g / VONG * 120));
      H.canh.forEach(function (c) {
        if (c.vai === 'truc') return;
        // mặt tròn xoay do cạnh c quét nên
        var pos = [], idx = [], m2 = c.ds.length;
        for (var j = 0; j <= na; j++) {
          var phi = g * j / na;
          c.ds.forEach(function (P) { var v = p3(P[0], P[1], phi); pos.push(v.x, v.y, v.z); });
        }
        for (j = 0; j < na; j++) for (var q = 0; q < m2 - 1; q++) { var a = j * m2 + q, b2 = a + m2; idx.push(a, a + 1, b2, a + 1, b2 + 1, b2); }
        var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
        var laDay = c.vai === 'banKinh';
        var m = new T.Mesh(geo, new T.MeshLambertMaterial({ color: laDay ? MAU.day : MAU.xungQuanh, transparent: true, opacity: laDay ? 0.22 : 0.3, side: T.DoubleSide, depthWrite: false, emissive: laDay ? MAU.day : MAU.xungQuanh, emissiveIntensity: 0.15 }));
        m.renderOrder = 1; m.userData = { vai: laDay ? 'day' : 'xq' }; nhomQuet.add(m); dt.quet.push(m);
      });
      // vết của các đỉnh ngoài trục: cung tròn (đủ vòng thì thành đường tròn đáy)
      H.thuTu.concat(H.vet || []).forEach(function (k) {
        var P = H.diem[k]; if (Math.abs(P[0]) < 1e-9) return;
        var ds = []; for (var j = 0; j <= na; j++) ds.push(p3(P[0], P[1], g * j / na));
        var ln = duong(ds, MAU.vet, 3, { thuTu: 4 }); ln.userData = { vai: 'vet' }; nhomQuet.add(ln); dt.vet.push(ln);
      });
      apDungHienThi();
    }

    // Đường viền (đường sinh ngoài cùng) của phần đã quét, theo góc nhìn
    var vienKhoa = '';
    function capNhatVien() {
      var C = camera.position, khoaMoi = [C.x, C.y, C.z, TT.goc].map(function (x) { return x.toFixed(3); }).join(',') + TT.cach;
      if (khoaMoi === vienKhoa) return; vienKhoa = khoaMoi;
      don(nhomVien);
      if (!TT.quet || TT.goc < 1e-3) return;
      HINH.canh.forEach(function (c) {
        if (c.vai === 'cung' && TT.goc >= VONG - 1e-6) {   // mặt cầu: đường bao là một đường tròn
          var O = new T.Vector3(c.tam[0], c.tam[1], 0), Rc = Math.hypot(c.P[0] - c.tam[0], c.P[1] - c.tam[1]);
          var u = new T.Vector3().subVectors(C, O), dd = u.length(); if (dd <= Rc * 1.001) return; u.divideScalar(dd);
          var tm = O.clone().add(u.clone().multiplyScalar(Rc * Rc / dd)), rr = Rc * Math.sqrt(1 - Rc * Rc / (dd * dd));
          var e1 = new T.Vector3(0, 1, 0).cross(u); if (e1.lengthSq() < 1e-6) e1.set(1, 0, 0); e1.normalize();
          var e2 = new T.Vector3().crossVectors(u, e1), vt = [];
          for (var i = 0; i <= 120; i++) { var a = i / 120 * VONG; vt.push(tm.clone().add(e1.clone().multiplyScalar(rr * Math.cos(a))).add(e2.clone().multiplyScalar(rr * Math.sin(a)))); }
          nhomVien.add(duong(vt, MAU.canh, 2.2, { doMo: 0.85, thuTu: 4 }));
          return;
        }
        if (c.vai !== 'duongSinh') return;
        var dx = c.Q[0] - c.P[0], dy = c.Q[1] - c.P[1], L = Math.hypot(dx, dy), nr = dy / L, ny = -dx / L;
        if (Math.abs(nr) < 1e-9) return;
        var k = c.P[0] * nr + c.P[1] * ny, v = (k - C.y * ny) / nr, rho = Math.hypot(C.x, C.z);
        if (rho < 1e-6 || Math.abs(v / rho) >= 1) return;
        var psi = Math.atan2(C.z, C.x), d = Math.acos(v / rho);
        [psi + d, psi - d].forEach(function (phi) {
          phi = ((phi % VONG) + VONG) % VONG;
          if (phi > TT.goc + 1e-6) return;
          nhomVien.add(duong([p3(c.P[0], c.P[1], phi), p3(c.Q[0], c.Q[1], phi)], MAU.canh, 2.2, { doMo: 0.85, thuTu: 4 }));
        });
      });
    }

    /* ---------- hiển thị, làm sáng ---------- */
    function apDungHienThi() {
      var s = TT.sang;
      dt.canh.forEach(function (ln) {
        var sang = s && (ln.userData.vai === s || (s === 'xq' && (ln.userData.vai === 'duongSinh' || ln.userData.vai === 'cung')) || (s === 'day' && ln.userData.vai === 'banKinh'));
        ln.material.linewidth = sang ? 7 : 4;
      });
      dt.quet.forEach(function (m) {
        m.visible = TT.quet;
        var sang = s && m.userData.vai === s;
        m.material.opacity = sang ? 0.6 : (m.userData.vai === 'day' ? 0.22 : 0.3) * (s && !sang ? 0.6 : 1);
        m.material.emissiveIntensity = sang ? 0.45 : 0.15;
      });
      dt.vet.forEach(function (ln) { ln.visible = TT.quet; ln.material.linewidth = s === 'day' || s === 'vet' ? 5 : 3; });
      [nhomCo, nhomQuay].forEach(function (g) {
        g.traverse(function (o) {
          if (o.userData && o.userData.ten) o.visible = TT.ten;
          if (o.userData && o.userData.so) o.visible = TT.soDo;
          if (o.name === 'bong') o.visible = TT.bong && TT.goc > 0.02;
        });
      });
    }
    function ghiChu() {
      var H = HINH, deg = Math.round(TT.goc * 180 / PI), h = '', coDinh = H.moTaTruc || ('cạnh cố định $' + H.tenTruc + '$');
      if (TT.sang) {
        var s = (cfg.lamSang || []).filter(function (x) { return x.id === TT.sang; })[0];
        h = s ? s.ghiChu(thongTin()) : '';
      } else if (TT.goc >= VONG - 1e-6) h = cfg.ketQua(thongTin());
      else if (TT.goc > 0) h = 'Đang quay ' + H.tenHinh + ' quanh ' + coDinh + '… đã quay <b>' + deg + '°</b>. ' + (TT.quet ? 'Phần màu là vết các cạnh quét nên.' : '');
      else h = 'Bấm <b>▶ Quay</b> (hoặc kéo thanh <b>Góc quay</b>) để quay ' + H.tenHinh + ' một vòng quanh ' + coDinh + '.';
      elGhiChu.innerHTML = h; elGhiChu.style.borderLeftColor = TT.goc >= VONG - 1e-6 ? MAU.vet : 'var(--chinh)';
      if (window.Latex) Latex.ve(elGhiChu);
      elDem.innerHTML = 'Góc quay: <span class="toan">' + deg + '°</span>' + (TT.goc >= VONG - 1e-6 ? ' ✓' : '');
    }
    function thongTin() { var H = HINH; return { r: H.r, h: H.h, l: H.l, truc: H.tenTruc, tenR: H.tenR, tenL: H.tenL, tenHinh: H.tenHinh, cach: cfg.cachQuay[TT.cach], H: H, so: so, soL: soL }; }

    /* ---------- camera ---------- */
    var hoatCam = null;
    var HUONG = { cheo: new T.Vector3(1.05, 0.62, 1.9), truoc: new T.Vector3(0, 0.0001, 1), tren: new T.Vector3(0, 1, 0.0001) };
    function nhin(ten, tucThi) {
      var R = HINH.R * 1.35 + 0.4, dich = new T.Vector3(0, HINH.h * 0.52, 0);
      var d = R / Math.sin(T.MathUtils.degToRad(camera.fov / 2)) * 1.05 / Math.min(1, camera.aspect * 0.9 + 0.1);
      var vt = HUONG[ten || 'cheo'].clone().normalize().multiplyScalar(d).add(dich);
      if (tucThi) { camera.position.copy(vt); dk.target.copy(dich); dk.update(); return; }
      hoatCam = { t0: performance.now(), tu: camera.position.clone(), den: vt, tuD: dk.target.clone(), denD: dich, dai: 600 };
    }
    function phong(k) {
      var v = new T.Vector3().subVectors(camera.position, dk.target), d = Math.max(1, Math.min(200, v.length() * k));
      hoatCam = { t0: performance.now(), tu: camera.position.clone(), den: dk.target.clone().add(v.setLength(d)), tuD: dk.target.clone(), denD: dk.target.clone(), dai: 250 };
    }

    /* ---------- bảng điều khiển ---------- */
    var soMuc = 0;
    function muc(tieuDe, noiDung) { soMuc++; return '<section class="muc"><h3><span class="so">' + soMuc + '</span>' + tieuDe + '</h3>' + noiDung + '</section>'; }
    function veBang() {
      soMuc = 0; var h = '';
      h += muc('Cạnh cố định (trục quay)', '<div class="lua-chon" id="lc-cach">' + cfg.cachQuay.map(function (c, i) {
        return '<button data-cach="' + i + '"' + (i === TT.cach ? ' class="bat"' : '') + '>' + thoat(c.nhan) + '</button>'; }).join('') + '</div>' +
        '<div style="font-size:14px;color:var(--chu-phu)">' + (cfg.goiYCach || '') + '</div>');
      h += muc('Quay', '<div class="dong-dieu-khien"><button class="nut chinh" id="nut-quay">' + IC.chay + ' Quay</button><button class="nut" id="nut-dat-lai">' + IC.datLai + ' Về đầu</button></div>' +
        '<div class="tham-so" style="--mau:' + MAU.vet + ';margin-top:12px"><div class="dong"><span>Góc quay</span><span class="gia-tri" id="gt-goc">0°</span></div>' +
        '<div class="hang"><input type="range" id="thanh-goc" min="0" max="360" step="1" value="0" aria-label="Góc quay"></div></div>' +
        '<div class="lua-chon" id="lc-toc">' + Object.keys(TOC).map(function (k) { return '<button data-toc="' + k + '"' + (k === TT.toc ? ' class="bat"' : '') + '>' + TOC[k].nhan + '</button>'; }).join('') + '</div>');
      h += muc('Kích thước hình phẳng', cfg.thamSo.map(function (p) {
        return '<div class="tham-so" style="--mau:' + (p.mau || 'var(--chinh)') + '"><div class="dong"><span>' + p.nhan + '</span><span class="gia-tri" id="gt-' + p.khoa + '">' + so(ts[p.khoa]) + ' cm</span></div>' +
          '<div class="hang"><button class="buoc" data-buoc="-1" data-k="' + p.khoa + '" aria-label="Giảm">−</button><input type="range" id="ts-' + p.khoa + '" min="' + p.min + '" max="' + p.max + '" step="' + p.buoc + '" value="' + ts[p.khoa] + '">' +
          '<button class="buoc" data-buoc="1" data-k="' + p.khoa + '" aria-label="Tăng">+</button></div></div>';
      }).join(''));
      h += muc('Bấm để làm nổi bật', '<div class="luoi-sang">' + (cfg.lamSang || []).map(function (s) {
        var mau = s.mau || { truc: MAU.truc, banKinh: MAU.banKinh, duongSinh: MAU.duongSinh, xq: MAU.xungQuanh, day: MAU.day, vet: MAU.vet }[s.id];
        return '<button class="nut-sang" data-sang="' + s.id + '" style="--mau:' + mau + '"><span class="cham"></span><span>' + s.nhan + '</span></button>'; }).join('') + '</div>');
      h += muc('Công thức', '<div class="cong-thuc" id="mh-cong-thuc"></div>');
      if (cfg.soSanh) h += muc('So sánh hai cách quay', '<div class="nhan-xet" id="mh-so-sanh"></div>');
      h += muc('Hiển thị',
        '<label class="cong-tac">Vết quét (mặt, đường tròn) <input type="checkbox" id="hien-quet" checked></label>' +
        '<label class="cong-tac">Vị trí ban đầu (nét đứt) <input type="checkbox" id="hien-bong" checked></label>' +
        '<label class="cong-tac">Tên điểm <input type="checkbox" id="hien-ten" checked></label>' +
        '<label class="cong-tac">Số đo <input type="checkbox" id="hien-so" checked></label>');
      bang.innerHTML = h;
      if (window.Latex) Latex.ve(bang);
      ganSuKien(); capNhatCongThuc();
    }
    function capNhatCongThuc() {
      var H = HINH, el = document.getElementById('mh-cong-thuc');
      el.innerHTML = cfg.congThuc(H.r, H.h, H.l, soL).map(function (c) { return '<div class="ct"><div class="ten">' + c.ten + '</div><div class="bt">' + c.bt + '</div></div>'; }).join('');
      if (window.Latex) Latex.ve(el);
      var ss = document.getElementById('mh-so-sanh');
      if (ss) {
        var hang = cfg.cachQuay.map(function (c, i) {
          var d = c.dung(ts);
          return '<tr' + (i === TT.cach ? ' style="background:#EEF4FF;font-weight:700"' : '') + '><td>' + thoat(c.nhan) + '</td><td>$r=' + soL(d.r) + '$</td><td>$h=' + soL(d.h) + '$</td>' +
            cfg.soSanh.map(function (s) { return '<td>' + s.tinh(d.r, d.h, soL) + '</td>'; }).join('') + '</tr>';
        }).join('');
        ss.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:14px">' + hang + '</table><p style="font-size:14px;color:var(--chu-phu);margin:8px 0 0">' + (cfg.nhanXetSoSanh || '') + '</p>';
        ss.querySelectorAll('td').forEach(function (td) { td.style.padding = '6px 4px'; td.style.borderBottom = '1px dashed #C7D2E6'; });
        if (window.Latex) Latex.ve(ss);
      }
    }
    function datGoc(g, tuThanh) {
      TT.goc = Math.max(0, Math.min(VONG, g));
      nhomQuay.rotation.y = -TT.goc;
      vetQuet(); vienKhoa = ''; ghiChu();
      var deg = Math.round(TT.goc * 180 / PI);
      document.getElementById('gt-goc').textContent = deg + '°';
      if (!tuThanh) document.getElementById('thanh-goc').value = deg;
    }
    function datChay(c) {
      TT.chay = c;
      if (c && TT.goc >= VONG - 1e-6) datGoc(0);
      var nut = document.getElementById('nut-quay'); nut.innerHTML = (c ? IC.dung + ' Dừng' : IC.chay + ' Quay');
      var cc = document.getElementById('cc-quay'); if (cc) cc.innerHTML = (c ? IC.dung : IC.chay) + '<span>' + (c ? 'Dừng' : 'Quay') + '</span>';
    }
    function lamMoi() { HINH = tinhHinh(); xay(); datGoc(TT.goc); capNhatCongThuc(); }
    function ganSuKien() {
      document.getElementById('nut-quay').onclick = function () { datChay(!TT.chay); };
      document.getElementById('nut-dat-lai').onclick = function () { datChay(false); datGoc(0); };
      document.getElementById('thanh-goc').addEventListener('input', function (e) { datChay(false); datGoc(+e.target.value * PI / 180, true); });
      bang.querySelectorAll('[data-toc]').forEach(function (b) { b.onclick = function () {
        TT.toc = b.dataset.toc; try { localStorage.setItem('mh3d_toc_do', TT.toc); } catch (e) { }
        bang.querySelectorAll('[data-toc]').forEach(function (x) { x.classList.toggle('bat', x === b); }); }; });
      bang.querySelectorAll('[data-cach]').forEach(function (b) { b.onclick = function () {
        TT.cach = +b.dataset.cach; bang.querySelectorAll('[data-cach]').forEach(function (x) { x.classList.toggle('bat', x === b); });
        datChay(false); TT.goc = 0; lamMoi(); nhin('cheo'); }; });
      cfg.thamSo.forEach(function (p) {
        document.getElementById('ts-' + p.khoa).addEventListener('input', function (e) { ts[p.khoa] = +e.target.value; document.getElementById('gt-' + p.khoa).textContent = so(ts[p.khoa]) + ' cm'; lamMoi(); });
      });
      bang.querySelectorAll('.buoc').forEach(function (b) { b.onclick = function () {
        var p = cfg.thamSo.filter(function (x) { return x.khoa === b.dataset.k; })[0], inp = document.getElementById('ts-' + p.khoa);
        var v = Math.max(p.min, Math.min(p.max, ts[p.khoa] + (+b.dataset.buoc) * p.buoc)); inp.value = v; inp.dispatchEvent(new Event('input')); }; });
      bang.querySelectorAll('[data-sang]').forEach(function (b) { b.onclick = function () {
        TT.sang = TT.sang === b.dataset.sang ? null : b.dataset.sang;
        bang.querySelectorAll('[data-sang]').forEach(function (x) { x.classList.toggle('bat', x.dataset.sang === TT.sang); });
        apDungHienThi(); ghiChu(); }; });
      [['hien-quet', 'quet'], ['hien-bong', 'bong'], ['hien-ten', 'ten'], ['hien-so', 'soDo']].forEach(function (a) {
        document.getElementById(a[0]).onchange = function (e) { TT[a[1]] = e.target.checked; apDungHienThi(); vienKhoa = ''; };
      });
    }
    function veCongCu() {
      var cc = document.getElementById('mh-cong-cu');
      cc.innerHTML = '<button class="cc" id="cc-quay">' + IC.chay + '<span>Quay</span></button><button class="cc" data-cc="datLai">' + IC.datLai + '<span>Về đầu</span></button><span class="ngan"></span>' +
        '<button class="cc" data-cc="cheo">' + IC.cheo + '<span>Chéo</span></button><button class="cc" data-cc="truoc">' + IC.truoc + '<span>Trước</span></button><button class="cc" data-cc="tren">' + IC.tren + '<span>Trên</span></button><span class="ngan"></span>' +
        '<button class="cc" data-cc="phong">' + IC.phong + '<span>Phóng to</span></button><button class="cc" data-cc="thu">' + IC.thu + '<span>Thu nhỏ</span></button><button class="cc" data-cc="toan">' + IC.toan + '<span>Toàn màn hình</span></button>';
      document.getElementById('cc-quay').onclick = function () { datChay(!TT.chay); };
      cc.querySelectorAll('[data-cc]').forEach(function (b) { b.onclick = function () {
        var k = b.dataset.cc;
        if (k === 'datLai') { datChay(false); datGoc(0); }
        else if (k === 'phong') phong(0.8); else if (k === 'thu') phong(1.25);
        else if (k === 'toan') { var mh = document.getElementById('mh'); if (!document.fullscreenElement) (mh.requestFullscreen || function () { }).call(mh); else document.exitFullscreen(); }
        else nhin(k);
      }; });
    }

    /* ---------- vòng vẽ ---------- */
    function coKhung() {
      var w = khungCanh.clientWidth || 1, h = khungCanh.clientHeight || 1;
      renderer.setSize(w, h, false); nhanRenderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      dsVL.forEach(function (m) { m.resolution.set(w, h); });
    }
    new ResizeObserver(coKhung).observe(khungCanh);
    var truoc = performance.now();
    function vong(t) {
      var dtg = Math.min(0.1, (t - truoc) / 1000); truoc = t;
      if (TT.chay) {
        var g = TT.goc + dtg * VONG / TOC[TT.toc].giay;
        if (g >= VONG) { g = VONG; datChay(false); }
        datGoc(g);
      }
      if (hoatCam) {
        var k = Math.min(1, (t - hoatCam.t0) / hoatCam.dai), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        camera.position.lerpVectors(hoatCam.tu, hoatCam.den, e); dk.target.lerpVectors(hoatCam.tuD, hoatCam.denD, e);
        if (k >= 1) hoatCam = null;
      }
      dk.update(); capNhatVien();
      renderer.render(canh, camera); nhanRenderer.render(canh, camera);
      requestAnimationFrame(vong);
    }

    HINH = tinhHinh();
    veBang(); veCongCu(); coKhung(); xay(); datGoc(0); nhin('cheo', true);
    requestAnimationFrame(vong);
    window.QuayHinhTT = TT;   // để kiểm thử
  }

  window.QuayHinh = { tao: tao, MAU: MAU, so: so, soL: soL };
})();
