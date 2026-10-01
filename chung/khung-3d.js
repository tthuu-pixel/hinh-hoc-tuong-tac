/* =====================================================================
   KHUNG MÔ HÌNH KHÔNG GIAN — dùng chung cho mọi hình không gian
   Mỗi tệp mô hình chỉ cần gọi KhongGian.tao({...}) với mô tả hình:
     - Hình đa diện  : cfg.daDien(ts)  -> { dinh, mat, diemPhu }
     - Hình mặt cong : cfg.matCong(ts) -> KhongGian.hinh.tru / non / cau (+ dinh)
   Cần nạp trước: thu-vien-ngoai/three-bundle.min.js
   ===================================================================== */
(function () {
  'use strict';
  var T = window.THREE;

  /* ---------- Bảng màu cố định: cùng đại lượng = cùng màu ở mọi hình ---------- */
  var MAU = {
    canh: '#E0342F',        // cạnh / chiều dài a
    chieuDai: '#E0342F',     // đỏ
    chieuRong: '#1E6FE0',    // xanh dương
    chieuCao: '#92400E',     // nâu
    canhBen: '#DB2777',
    trungDoan: '#9333EA',
    banKinh: '#E0342F',
    duongKinh: '#0891B2',
    duongSinh: '#EA580C',
    duongCheo: '#C026D3',
    duongCaoDay: '#0891B2',
    chuVi: '#E0342F',
    matDay: '#7C3AED',
    xungQuanh: '#F59E0B',
    toanPhan: '#EC4899',
    theTich: '#0D9488',
    tam: '#1E6FE0',
  };
  var MAU_CANH = '#1B2540';
  var MAU_MAT = '#BFD3FA';
  var MAU_CAT = '#FF7A00';
  var MAU_NUOC = '#38BDF8';

  /* ---------- Tiện ích số ---------- */
  // Tốc độ hiệu ứng: thời gian trải/gấp trọn hình (ms) và hệ số cho các hiệu ứng thể tích
  var TOC_DO = { cham: { nhan: 'Chậm', trai: 9000, hs: 0.45 }, vua: { nhan: 'Vừa', trai: 5000, hs: 0.75 }, nhanh: { nhan: 'Nhanh', trai: 2200, hs: 1.3 } };
  function so(x, le) {
    if (le === undefined) le = 2;
    var r = Math.round(x * Math.pow(10, le)) / Math.pow(10, le);
    if (Math.abs(r) < 1e-9) r = 0;
    return String(r).replace('.', ',');
  }
  function tenDinh(t) { return String(t).replace(/'/g, '′'); }
  function v3(a) { return a instanceof T.Vector3 ? a.clone() : new T.Vector3(a[0], a[1], a[2]); }
  function khoa(p, q) { return p < q ? p + '|' + q : q + '|' + p; }
  function thoat(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function giaTri(x, ts) { return typeof x === 'function' ? x(ts) : x; }

  /* ---------- Đường tròn nằm ngang (khép kín) ---------- */
  function vongTron(y, r, n, cx, cz) {
    n = n || 96; cx = cx || 0; cz = cz || 0;
    var ds = [];
    for (var i = 0; i <= n; i++) { var a = i / n * Math.PI * 2; ds.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]); }
    return ds;
  }

  /* =====================================================================
     HÌNH MẶT CONG DỰNG SẴN: trụ, nón, cầu (đáy nằm trên mặt phẳng y = 0)
     ===================================================================== */
  var HINH = {
    tru: function (r, h) {
      return {
        loai: 'tru', r: r, h: h,
        mat: [
          { ten: 'dayDuoi', tam: [0, 0, 0], phap: [0, -1, 0], geo: function () { var g = new T.CircleGeometry(r, 96); g.rotateX(Math.PI / 2); return g; } },
          { ten: 'dayTren', tam: [0, h, 0], phap: [0, 1, 0], geo: function () { var g = new T.CircleGeometry(r, 96); g.rotateX(-Math.PI / 2); g.translate(0, h, 0); return g; } },
          { ten: 'xungQuanh', tam: [0, h / 2, r], phap: [0, 0, 1], geo: function () { var g = new T.CylinderGeometry(r, r, h, 96, 1, true); g.translate(0, h / 2, 0); return g; } },
        ],
        canh: { dayDuoi: vongTron(0, r), dayTren: vongTron(h, r) },
        vien: function (C) {
          var rho = Math.hypot(C.x, C.z); if (rho <= r * 1.0001) return [];
          var phi = Math.atan2(C.z, C.x), d = Math.acos(r / rho);
          return [phi + d, phi - d].map(function (t) {
            var x = r * Math.cos(t), z = r * Math.sin(t);
            return [new T.Vector3(x, 0, z), new T.Vector3(x, h, z)];
          });
        },
        tam: [0, h / 2, 0], banKinh: Math.hypot(r, h / 2), minY: 0,
      };
    },
    non: function (r, h) {
      return {
        loai: 'non', r: r, h: h,
        mat: [
          { ten: 'dayDuoi', tam: [0, 0, 0], phap: [0, -1, 0], geo: function () { var g = new T.CircleGeometry(r, 96); g.rotateX(Math.PI / 2); return g; } },
          { ten: 'xungQuanh', tam: [0, h / 2, r / 2], phap: [0, 0, 1], geo: function () { var g = new T.ConeGeometry(r, h, 96, 1, true); g.translate(0, h / 2, 0); return g; } },
        ],
        canh: { dayDuoi: vongTron(0, r) },
        vien: function (C) {
          var rho = Math.hypot(C.x, C.z); if (rho < 1e-6) return [];
          var val = r * (h - C.y) / (h * rho); if (Math.abs(val) >= 0.9999) return [];
          var phi = Math.atan2(C.z, C.x), d = Math.acos(val);
          return [phi + d, phi - d].map(function (t) { return [new T.Vector3(0, h, 0), new T.Vector3(r * Math.cos(t), 0, r * Math.sin(t))]; });
        },
        tam: [0, h / 2, 0], banKinh: Math.max(Math.hypot(r, h / 2), h / 2), minY: 0,
      };
    },
    cau: function (R) {
      var O = new T.Vector3(0, R, 0);
      return {
        loai: 'cau', R: R,
        mat: [{ ten: 'matCau', tam: [0, R, R], phap: [0, 0, 1], geo: function () { var g = new T.SphereGeometry(R, 96, 64); g.translate(0, R, 0); return g; } }],
        canh: { xichDao: vongTron(R, R) },
        vien: function (C) {
          var u = new T.Vector3().subVectors(C, O), d = u.length(); if (d <= R * 1.001) return [];
          u.divideScalar(d);
          var tam = O.clone().add(u.clone().multiplyScalar(R * R / d)), rr = R * Math.sqrt(1 - R * R / (d * d));
          var e1 = new T.Vector3(0, 1, 0).cross(u); if (e1.lengthSq() < 1e-6) e1.set(1, 0, 0); e1.normalize();
          var e2 = new T.Vector3().crossVectors(u, e1);
          var ds = [];
          for (var i = 0; i <= 120; i++) {
            var a = i / 120 * Math.PI * 2;
            ds.push(tam.clone().add(e1.clone().multiplyScalar(rr * Math.cos(a))).add(e2.clone().multiplyScalar(rr * Math.sin(a))));
          }
          return [ds];
        },
        tam: [0, R, 0], banKinh: R, minY: 0,
      };
    },
  };

  var ICON = {
    phong: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M11 8v6M8 11h6"/></svg>',
    thu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6"/></svg>',
    truoc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>',
    tren: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9l9-5 9 5-9 5z"/><path d="M12 14v6" opacity=".5"/></svg>',
    ben: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 4l10 3v14L7 18z"/></svg>',
    cheo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h11v12H4zM4 8l5-4h11l-5 4M20 4v12l-5 4"/></svg>',
    xoay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg>',
    datLai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    toan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  };

  /* =====================================================================
     TẠO MÔ HÌNH
     ===================================================================== */
  function tao(cfg) {
    document.body.classList.add('trang-mo-hinh');
    document.title = cfg.ten + ' · ' + ((window.CAU_HINH || {}).TEN_NGAN || (window.CAU_HINH || {}).TEN_SAN_PHAM || '');
    if (window.GiaoDien) GiaoDien.thanhTren({ quayLai: '../thu-vien.html' });

    var ts = {};
    cfg.thamSo.forEach(function (p) { ts[p.khoa] = p.gt; });
    var dsSang = cfg.lamSang || [];
    var mapSang = {}; dsSang.forEach(function (s) { mapSang[s.id] = s; });
    var KIEU_V = cfg.khoiDonVi ? 'khoi' : cfg.lopDay ? 'lop' : cfg.doNuoc ? 'nuoc' : null;

    /* ---------- Dựng khung trang ---------- */
    var goc = document.getElementById('mo-hinh');
    var mauLop = { 6: 'var(--lop6)', 7: 'var(--lop7)', 8: 'var(--lop8)', 9: 'var(--lop9)' }[cfg.lop] || 'var(--chinh)';
    goc.innerHTML =
      '<div class="mh" id="mh">' +
      '  <div class="mh-canh" id="mh-canh">' +
      '    <div class="mh-tieu-de">' + thoat(cfg.ten) + '<span style="background:' + mauLop + '">Lớp ' + cfg.lop + '</span></div>' +
      '    <div class="mh-ghi-chu an-mo" id="mh-ghi-chu"></div>' +
      '    <div class="nhan-dem an" id="mh-dem"></div>' +
      '    <div class="mh-cong-cu" id="mh-cong-cu"></div>' +
      '  </div>' +
      '  <aside class="mh-bang" id="mh-bang"></aside>' +
      '</div>';
    var khungCanh = document.getElementById('mh-canh');
    var bang = document.getElementById('mh-bang');
    var elGhiChu = document.getElementById('mh-ghi-chu');
    var elDem = document.getElementById('mh-dem');

    /* ---------- Three.js: cảnh, camera, điều khiển ---------- */
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.localClippingEnabled = true;
    khungCanh.insertBefore(renderer.domElement, khungCanh.firstChild);
    var nhanRenderer = new T.CSS2DRenderer();
    nhanRenderer.domElement.className = 'mh-nhan-lop';
    khungCanh.insertBefore(nhanRenderer.domElement, renderer.domElement.nextSibling);

    var canh = new T.Scene();
    var camera = new T.PerspectiveCamera(32, 1, 0.05, 500);
    canh.add(new T.HemisphereLight(0xffffff, 0xB8C4DA, 1.7));
    var den = new T.DirectionalLight(0xffffff, 1.4); den.position.set(5, 9, 7); canh.add(den);

    var dk = new T.OrbitControls(camera, renderer.domElement);
    dk.enableDamping = true; dk.dampingFactor = 0.09;
    dk.rotateSpeed = 0.8; dk.zoomSpeed = 0.9; dk.panSpeed = 0.9;
    dk.autoRotateSpeed = 1.6;
    dk.touches = { ONE: T.TOUCH.ROTATE, TWO: T.TOUCH.DOLLY_PAN };
    dk.mouseButtons = { LEFT: T.MOUSE.ROTATE, MIDDLE: T.MOUSE.DOLLY, RIGHT: T.MOUSE.PAN };
    renderer.domElement.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    var luoiNen = null;
    var nhomKhoi = new T.Group(), nhomDo = new T.Group(), nhomTrai = new T.Group(),
        nhomCat = new T.Group(), nhomDonVi = new T.Group();
    canh.add(nhomKhoi, nhomDo, nhomTrai, nhomCat, nhomDonVi);

    /* ---------- Trạng thái ---------- */
    var TT = {
      dangSang: [],            // id các nút đang bật, theo thứ tự bật
      thoiDiemBat: {},         // id -> thời điểm bật (để nhấp nháy)
      hienTenDinh: true, hienNetKhuat: true, toMat: true, hienLuoi: true,
      traiT: 0, traiDich: 0,   // mức trải hình 0..1
      tocDo: (function () { try { return localStorage.getItem('mh3d_toc_do') || 'vua'; } catch (e) { return 'vua'; } })(),
      catId: null, catT: 0.5, anPhanTren: false,
      donVi: false, donViDem: 0, donViBatDau: 0,   // minh hoạ thể tích (khối / lớp / đổ nước)
    };
    var DD = null;             // hình hiện tại
    var dsVatLieuDuong = [];   // mọi LineMaterial để cập nhật độ phân giải
    var matPhangCat = null;    // THREE.Plane dùng để ẩn phần trên

    /* =====================================================================
       TÍNH HÌNH (đa diện hoặc mặt cong) -> cấu trúc chung DD
       ===================================================================== */
    function tinhHinh() {
      var d, dinh = {}, phu = {}, canhMap = {}, mat, tam, banKinh, minY = Infinity;
      if (cfg.daDien) {
        d = cfg.daDien(ts);
        Object.keys(d.dinh).forEach(function (k) { dinh[k] = v3(d.dinh[k]); });
        tam = new T.Vector3(); var n = 0;
        Object.keys(dinh).forEach(function (k) { tam.add(dinh[k]); n++; minY = Math.min(minY, dinh[k].y); }); tam.divideScalar(n);
        banKinh = 0; Object.keys(dinh).forEach(function (k) { banKinh = Math.max(banKinh, dinh[k].distanceTo(tam)); });
        d.mat.forEach(function (m) {
          for (var i = 0; i < m.dinh.length; i++) {
            var p = m.dinh[i], q = m.dinh[(i + 1) % m.dinh.length], k = khoa(p, q);
            if (!canhMap[k]) canhMap[k] = { p: p, q: q, diem: [dinh[p], dinh[q]], mat: [] };
            canhMap[k].mat.push(m.ten);
          }
        });
        mat = d.mat.map(function (m) {
          var a = dinh[m.dinh[0]], b = dinh[m.dinh[1]], c = dinh[m.dinh[2]];
          var nn = new T.Vector3().subVectors(b, a).cross(new T.Vector3().subVectors(c, a)).normalize();
          var tm = new T.Vector3(); m.dinh.forEach(function (x) { tm.add(dinh[x]); }); tm.divideScalar(m.dinh.length);
          if (nn.dot(new T.Vector3().subVectors(tm, tam)) < 0) nn.negate();
          return { ten: m.ten, dinh: m.dinh, phap: nn, tam: tm };
        });
      } else {
        d = cfg.matCong(ts);
        Object.keys(d.dinh || {}).forEach(function (k) { dinh[k] = v3(d.dinh[k]); });
        Object.keys(d.canh).forEach(function (k) { canhMap[k] = { diem: d.canh[k].map(v3), mat: [] }; });
        mat = d.mat.map(function (m) { return { ten: m.ten, geo: m.geo, tam: v3(m.tam), phap: v3(m.phap).normalize() }; });
        tam = v3(d.tam); banKinh = d.banKinh; minY = d.minY;
      }
      Object.keys(d.diemPhu || {}).forEach(function (k) { phu[k] = v3(d.diemPhu[k]); });
      return { cong: !cfg.daDien, goc: d, dinh: dinh, phu: phu, mat: mat, canh: canhMap, tam: tam, banKinh: banKinh, minY: minY,
               vien: d.vien || null, huongNhan: d.huongNhan || {} };
    }

    function taoDuong(diem, mau, rong, netDut, tuyChon) {
      tuyChon = tuyChon || {};
      var g = new T.LineGeometry();
      var arr = []; diem.forEach(function (p) { arr.push(p.x, p.y, p.z); });
      g.setPositions(arr);
      var m = new T.LineMaterial({
        color: new T.Color(mau), linewidth: rong, dashed: !!netDut,
        dashSize: DD ? DD.banKinh * 0.07 : 0.2, gapSize: DD ? DD.banKinh * 0.05 : 0.15,
        transparent: true, opacity: tuyChon.doMo == null ? 1 : tuyChon.doMo,
      });
      if (tuyChon.depthFunc != null) m.depthFunc = tuyChon.depthFunc;
      if (tuyChon.khongSau) m.depthTest = false;
      var ln = new T.Line2(g, m);
      ln.computeLineDistances();
      ln.renderOrder = tuyChon.thuTu == null ? 3 : tuyChon.thuTu;
      m.resolution.set(khungCanh.clientWidth || 1, khungCanh.clientHeight || 1);
      dsVatLieuDuong.push(m);
      return ln;
    }
    function datDiemDuong(ln, diem) {
      var arr = []; diem.forEach(function (p) { arr.push(p.x, p.y, p.z); });
      ln.geometry.dispose();
      ln.geometry = new T.LineGeometry(); ln.geometry.setPositions(arr);
      ln.computeLineDistances();
    }

    function hinhDaGiac(diemList) {
      // tam giác hoá kiểu quạt (đa giác lồi)
      var g = new T.BufferGeometry(), pos = [];
      for (var i = 1; i < diemList.length - 1; i++) {
        [diemList[0], diemList[i], diemList[i + 1]].forEach(function (p) { pos.push(p.x, p.y, p.z); });
      }
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return g;
    }
    function hinhMat(m) { return m.geo ? m.geo() : hinhDaGiac(m.dinh.map(function (k) { return DD.dinh[k]; })); }

    // Khối lăng trụ đứng từ đa giác đáy [[x,z],...], cao từ y0 đến y0 + cao
    function khoiLangTru(day, y0, cao) {
      var sh = new T.Shape();
      day.forEach(function (p, i) { if (i) sh.lineTo(p[0], -p[1]); else sh.moveTo(p[0], -p[1]); });
      var g = new T.ExtrudeGeometry(sh, { depth: cao, bevelEnabled: false, curveSegments: 48 });
      g.rotateX(-Math.PI / 2); g.translate(0, y0, 0);
      return g;
    }

    var doiTuong = { matMesh: {}, canhLine: {}, nhanDinh: {}, matSau: [], vien: [] };

    function donNhom(nhom) {
      while (nhom.children.length) {
        var c = nhom.children[0];
        c.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            var i = dsVatLieuDuong.indexOf(o.material); if (i >= 0) dsVatLieuDuong.splice(i, 1);
            if (o.material.map && o.material.map !== ketCauO) o.material.map.dispose();
            o.material.dispose();
          }
        });
        nhom.remove(c);
      }
    }

    function clipHienTai() { return matPhangCat && TT.anPhanTren ? [matPhangCat] : []; }

    function xayKhoi() {
      donNhom(nhomKhoi);
      doiTuong = { matMesh: {}, canhLine: {}, nhanDinh: {}, matSau: [], vien: [] };
      var clip = clipHienTai();

      // 1) Lớp chiều sâu (không màu) để phân biệt nét thấy / nét khuất
      DD.mat.forEach(function (m) {
        var s = new T.Mesh(hinhMat(m), new T.MeshBasicMaterial({
          colorWrite: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4, clippingPlanes: clip,
        }));
        s.renderOrder = 0; nhomKhoi.add(s); doiTuong.matSau.push(s);
      });

      // 2) Các mặt (tô màu trong suốt)
      DD.mat.forEach(function (m) {
        var mesh = new T.Mesh(hinhMat(m), new T.MeshLambertMaterial({
          color: MAU_MAT, transparent: true, opacity: 0.28, side: T.DoubleSide, depthWrite: false, clippingPlanes: clip,
        }));
        mesh.renderOrder = 1;
        nhomKhoi.add(mesh); doiTuong.matMesh[m.ten] = mesh;
      });

      // 3) Các cạnh / đường tròn đáy: nét liền (thấy) + nét đứt (khuất)
      Object.keys(DD.canh).forEach(function (k) {
        var ds = DD.canh[k].diem;
        var thay = taoDuong(ds, MAU_CANH, 3, false, { depthFunc: T.LessEqualDepth });
        var khuat = taoDuong(ds, MAU_CANH, 2, true, { depthFunc: T.GreaterDepth, doMo: 0.75 });
        thay.material.clippingPlanes = clip; khuat.material.clippingPlanes = clip;
        nhomKhoi.add(thay, khuat);
        doiTuong.canhLine[k] = { thay: thay, khuat: khuat };
      });

      // 4) Đường viền (đường sinh ngoài cùng, đường bao mặt cầu) — tính lại theo góc nhìn
      if (DD.vien) {
        for (var i = 0; i < 2; i++) {
          var ln = taoDuong([new T.Vector3(), new T.Vector3(0, 0.001, 0)], MAU_CANH, 3, false, { khongSau: true, thuTu: 3 });
          ln.material.clippingPlanes = clip; ln.visible = false;
          nhomKhoi.add(ln); doiTuong.vien.push(ln);
        }
        doiTuong.vienKhoa = '';
      }

      // 5) Tên đỉnh
      Object.keys(DD.dinh).forEach(function (k) {
        var el = document.createElement('div'); el.className = 'nhan-dinh'; el.textContent = tenDinh(k);
        var o = new T.CSS2DObject(el);
        var huong = DD.huongNhan[k] ? v3(DD.huongNhan[k]) : new T.Vector3().subVectors(DD.dinh[k], DD.tam);
        if (huong.lengthSq() < 1e-9) huong.set(0, 1, 0);
        huong.normalize().multiplyScalar(DD.banKinh * 0.12 + 0.12);
        o.position.copy(DD.dinh[k]).add(huong);
        nhomKhoi.add(o); doiTuong.nhanDinh[k] = o;
        // chấm tròn đánh dấu tâm (O, O′, …) hoặc các điểm khai báo trong cfg.chamDinh
        if (cfg.chamDinh ? cfg.chamDinh.indexOf(k) >= 0 : /^O/.test(k)) {
          var cham = new T.Mesh(new T.SphereGeometry(DD.banKinh * 0.022 + 0.035, 16, 12), new T.MeshBasicMaterial({ color: '#1B2540', depthTest: false }));
          cham.position.copy(DD.dinh[k]); cham.renderOrder = 6; nhomKhoi.add(cham);
        }
      });
    }

    function capNhatVien() {
      if (!DD.vien || !doiTuong.vien.length) return;
      var C = camera.position;
      var khoaMoi = [C.x, C.y, C.z].map(function (x) { return x.toFixed(3); }).join(',');
      if (khoaMoi === doiTuong.vienKhoa) return;
      doiTuong.vienKhoa = khoaMoi;
      var ds = DD.vien(C.clone());
      doiTuong.vien.forEach(function (ln, i) {
        if (ds[i]) { datDiemDuong(ln, ds[i]); ln.visible = true; } else ln.visible = false;
      });
    }

    /* =====================================================================
       LÀM SÁNG
       ===================================================================== */
    function dsCanhCua(s) {
      if (!s.canh) return [];
      if (s.canh === 'tatCa') return Object.keys(DD.canh);
      var ds = giaTri(s.canh, ts);
      return ds.map(function (c) { return typeof c === 'string' ? c : khoa(c[0], c[1]); });
    }
    function dsMatCua(s) {
      if (s.khoi) return DD.mat.map(function (m) { return m.ten; });
      if (!s.mat) return [];
      return giaTri(s.mat, ts);
    }

    // Trả về: canh -> id nút, mat -> id nút (nút bật sau cùng thắng)
    function banDoSang() {
      var bdC = {}, bdM = {};
      TT.dangSang.forEach(function (id) {
        var s = mapSang[id];
        dsCanhCua(s).forEach(function (k) { bdC[k] = id; });
        dsMatCua(s).forEach(function (t) { bdM[t] = id; });
      });
      return { canh: bdC, mat: bdM };
    }

    function anKhoiKhiMinhHoa() { return TT.donVi && KIEU_V !== 'nuoc'; }

    function apDungSang() {
      var bd = banDoSang();
      var coSang = TT.dangSang.length > 0;
      var anKhoi = anKhoiKhiMinhHoa();
      Object.keys(doiTuong.canhLine).forEach(function (k) {
        var L = doiTuong.canhLine[k], id = bd.canh[k];
        var mau = id ? mapSang[id].mau : MAU_CANH;
        L.thay.material.color.set(mau); L.khuat.material.color.set(mau);
        L.thay.userData.sang = id || null; L.khuat.userData.sang = id || null;
        L.thay.material.linewidth = id ? 7 : 3;
        L.khuat.material.linewidth = id ? 4 : 2;
        L.khuat.visible = TT.hienNetKhuat && !anKhoi;
        L.thay.material.opacity = (coSang && !id) ? 0.55 : 1;
      });
      Object.keys(doiTuong.matMesh).forEach(function (t) {
        var M = doiTuong.matMesh[t], id = bd.mat[t];
        M.material.color.set(id ? mapSang[id].mau : MAU_MAT);
        M.userData.sang = id || null;
        M.material.opacity = id ? 0.5 : (TT.toMat ? 0.28 : 0);
        // mặt đang làm nổi bật luôn hiện màu, kể cả khi nằm khuất phía sau (ví dụ mặt đáy)
        M.material.depthTest = !id; M.renderOrder = id ? 2 : 1;
        M.visible = !anKhoi || !!id && !mapSang[id].khoi;
      });
      doiTuong.matSau.forEach(function (s) { s.visible = !anKhoi; });
      Object.keys(doiTuong.nhanDinh).forEach(function (k) {
        var an = TT.anPhanTren && matPhangCat && matPhangCat.distanceToPoint(DD.dinh[k]) < -1e-6;
        doiTuong.nhanDinh[k].visible = TT.hienTenDinh && !an;
      });
      // hình trải
      nhomTrai.traverse(function (o) {
        if (o.userData.matTen) {
          var id2 = bd.mat[o.userData.matTen];
          o.material.color.set(id2 ? mapSang[id2].mau : MAU_MAT);
          o.material.opacity = id2 ? 0.75 : 0.45;
          o.userData.sang = id2 || null;
        }
        if (o.userData.canhKhoa) {
          var id3 = bd.canh[o.userData.canhKhoa];
          o.material.color.set(id3 ? mapSang[id3].mau : MAU_CANH);
          o.material.linewidth = id3 ? 6 : 3;
          o.userData.sang = id3 || null;
        }
      });
      xayNhanDo();
      capNhatBangSang();
      capNhatGhiChu();
      capNhatCongThuc();
    }

    function diem(ten) { return DD.dinh[ten] || DD.phu[ten]; }
    function xayNhanDo() {
      donNhom(nhomDo);
      if (TT.traiT > 0.001) return;
      var clip = clipHienTai();
      var daGhiPhu = {};
      function veDiemPhu(t, mau) {
        if (!DD.phu[t] || daGhiPhu[t]) return;
        daGhiPhu[t] = 1;
        var el = document.createElement('div'); el.className = 'nhan-dinh'; el.textContent = tenDinh(t);
        var o = new T.CSS2DObject(el);
        var huong = DD.huongNhan[t] ? v3(DD.huongNhan[t]).normalize() : new T.Vector3(0.5, 0.7, 0.5);
        o.position.copy(DD.phu[t]).add(huong.multiplyScalar(DD.banKinh * 0.12 + 0.12));
        nhomDo.add(o);
        var cham = new T.Mesh(new T.SphereGeometry(DD.banKinh * 0.025 + 0.03, 16, 12), new T.MeshBasicMaterial({ color: mau, depthTest: false }));
        cham.position.copy(DD.phu[t]); cham.renderOrder = 6; nhomDo.add(cham);
      }
      function veDuong(ds, s, id) {
        var thay = taoDuong(ds, s.mau, 6, false, { depthFunc: T.LessEqualDepth, thuTu: 3 });
        var khuat = taoDuong(ds, s.mau, 4, true, { depthFunc: T.GreaterDepth, thuTu: 3 });
        thay.userData = { sang: id, loai: 'thay' }; khuat.userData = { sang: id, loai: 'khuat' };
        thay.material.clippingPlanes = clip; khuat.material.clippingPlanes = clip;
        khuat.visible = TT.hienNetKhuat;
        nhomDo.add(thay, khuat);
      }
      TT.dangSang.forEach(function (id) {
        var s = mapSang[id];
        // Đoạn phụ (không phải cạnh): đường chéo, đường cao, trung đoạn, bán kính...
        if (s.doan) {
          giaTri(s.doan, ts).forEach(function (d) {
            veDuong([diem(d[0]), diem(d[1])], s, id);
            d.forEach(function (t) { veDiemPhu(t, s.mau); });
          });
        }
        // Đường tuỳ ý theo toạ độ (vd: khối so sánh)
        if (s.duong) giaTri(s.duong, ts).forEach(function (ds) { veDuong(ds.map(v3), s, id); });
        // Khối phụ trong suốt (vd: hình trụ ngoại tiếp hình cầu)
        if (s.hinhPhu) giaTri(s.hinhPhu, ts).forEach(function (hp) {
          hp.mat.forEach(function (m) {
            var mesh = new T.Mesh(m.geo(), new T.MeshLambertMaterial({ color: s.mau, transparent: true, opacity: 0.16, side: T.DoubleSide, depthWrite: false, clippingPlanes: clip }));
            mesh.renderOrder = 2; nhomDo.add(mesh);
          });
          Object.keys(hp.canh).forEach(function (k) { veDuong(hp.canh[k].map(v3), s, id); });
        });
        (s.hienDiem || []).forEach(function (t) { veDiemPhu(t, s.mau); });
        if (!s.nhanDo) return;
        s.nhanDo(ts).forEach(function (nd) {
          var el = document.createElement('div'); el.className = 'nhan-do';
          el.style.background = s.mau; el.innerHTML = nd.chu;
          var o = new T.CSS2DObject(el);
          if (nd.doan) {
            var P = diem(nd.doan[0]), Q = diem(nd.doan[1]);
            var giua = P.clone().lerp(Q, nd.t == null ? 0.5 : nd.t);
            var dir = new T.Vector3().subVectors(Q, P).normalize();
            var ra = nd.huong ? v3(nd.huong) : new T.Vector3().subVectors(giua, DD.tam);
            ra.sub(dir.clone().multiplyScalar(ra.dot(dir)));
            if (ra.lengthSq() < 1e-9) ra.set(0, 1, 0);
            ra.normalize().multiplyScalar(DD.banKinh * 0.16 + 0.15);
            o.position.copy(giua).add(ra);
          } else if (nd.mat) {
            var m = DD.mat.filter(function (x) { return x.ten === nd.mat; })[0];
            o.position.copy(m.tam).add(m.phap.clone().multiplyScalar(0.05));
          } else if (nd.viTri) {
            o.position.copy(v3(nd.viTri));
          } else {
            o.position.copy(DD.tam);
          }
          nhomDo.add(o);
        });
      });
    }

    /* =====================================================================
       TRẢI HÌNH (khai triển)
       - Đa diện: tự dựng cây mặt từ mặt gốc, mỗi mặt quay quanh cạnh chung
       - Trụ, nón: uốn phẳng mặt xung quanh (giữ nguyên độ dài), lật hai đáy ra
       ===================================================================== */
    function xayTraiHinh() {
      donNhom(nhomTrai);
      nhomTrai.userData = {};
      nhomTrai.position.set(0, 0, 0);
      if (!cfg.traiHinh) return;
      if (cfg.traiHinh.kieu === 'tru') xayTraiTru();
      else if (cfg.traiHinh.kieu === 'non') xayTraiNon();
      else xayTraiDaDien();
      datMucTrai(TT.traiT);
    }
    function matTrai(geo, ten, doMo) {
      var mesh = new T.Mesh(geo, new T.MeshLambertMaterial({
        color: MAU_MAT, transparent: true, opacity: doMo || 0.45, side: T.DoubleSide, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
      }));
      mesh.userData.matTen = ten; mesh.renderOrder = 1;
      return mesh;
    }
    function xayTraiDaDien() {
      var matTheoTen = {}; DD.mat.forEach(function (m) { matTheoTen[m.ten] = m; });
      var gocTen = cfg.traiHinh.matGoc;
      var cha = {}; cha[gocTen] = null;
      var cay = cfg.traiHinh.cay || {};
      var hang = [gocTen], thuTu = [gocTen];
      while (hang.length) {
        var t = hang.shift();
        DD.mat.forEach(function (m) {
          if (m.ten in cha) return;
          if (cay[m.ten] && cay[m.ten] !== t) return;
          if (canhChung(matTheoTen[t], m)) { cha[m.ten] = t; hang.push(m.ten); thuTu.push(m.ten); }
        });
      }
      var nhomMat = {}, goc0 = new T.Vector3(0, 0, 0);
      thuTu.forEach(function (ten) {
        var m = matTheoTen[ten], g = new T.Group(), goc = goc0;
        if (cha[ten]) {
          var P = matTheoTen[cha[ten]], ch = canhChung(P, m);
          var u = DD.dinh[ch[0]], v = DD.dinh[ch[1]];
          var truc = new T.Vector3().subVectors(v, u).normalize();
          var phi = Math.atan2(new T.Vector3().crossVectors(m.phap, P.phap).dot(truc), m.phap.dot(P.phap));
          g.position.copy(u).sub(nhomMat[cha[ten]].userData.goc);
          g.userData = { goc: u.clone(), truc: truc, phi: phi };
          nhomMat[cha[ten]].add(g);
          goc = u;
        } else {
          g.userData = { goc: goc0.clone(), truc: null, phi: 0 };
          nhomTrai.add(g);
        }
        var ds = m.dinh.map(function (k) { return DD.dinh[k].clone().sub(goc); });
        g.add(matTrai(hinhDaGiac(ds), ten));
        for (var i = 0; i < m.dinh.length; i++) {
          var ln = taoDuong([ds[i], ds[(i + 1) % ds.length]], MAU_CANH, 3, false, { thuTu: 3 });
          ln.userData.canhKhoa = khoa(m.dinh[i], m.dinh[(i + 1) % m.dinh.length]);
          g.add(ln);
        }
        nhomMat[ten] = g;
      });
      nhomTrai.userData.nhomMat = nhomMat;
    }
    function canhChung(A, B) {
      for (var i = 0; i < A.dinh.length; i++) {
        var p = A.dinh[i], q = A.dinh[(i + 1) % A.dinh.length];
        if (B.dinh.indexOf(p) >= 0 && B.dinh.indexOf(q) >= 0) return [p, q];
      }
      return null;
    }
    // Lưới toạ độ (u theo chu vi, v theo chiều cao) cập nhật từng khung hình
    function luoiMat(nu, nv) {
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(new Float32Array((nu + 1) * (nv + 1) * 3), 3));
      var idx = [];
      for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) {
        var a = i * (nv + 1) + j, b = (i + 1) * (nv + 1) + j;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
      g.setIndex(idx);
      return g;
    }
    function dia(r, ten) {
      var g = new T.CircleGeometry(r, 96); g.rotateX(-Math.PI / 2);   // nằm ngang, tâm tại gốc
      var nh = new T.Group();
      nh.add(matTrai(g, ten));
      var vt = vongTron(0, r).map(v3);
      nh.add(taoDuong(vt, MAU_CANH, 3, false, { thuTu: 3 }));
      nh.children[1].userData.canhKhoa = ten;
      return nh;
    }
    function xayTraiTru() {
      var r = DD.goc.r, h = DD.goc.h, NU = 96;
      var geo = luoiMat(NU, 1), mesh = matTrai(geo, 'xungQuanh');
      var vien = taoDuong([new T.Vector3(), new T.Vector3(0, 1, 0)], MAU_CANH, 3, false, { thuTu: 3 });
      // hai đáy: nhóm bản lề đặt tại mép trước (0, y, r)
      var banLeTren = new T.Group(), banLeDuoi = new T.Group();
      var dTren = dia(r, 'dayTren'), dDuoi = dia(r, 'dayDuoi');
      dTren.position.set(0, 0, -r); dDuoi.position.set(0, 0, -r);
      banLeTren.add(dTren); banLeDuoi.add(dDuoi);
      banLeTren.position.set(0, h, r); banLeDuoi.position.set(0, 0, r);
      nhomTrai.add(mesh, vien, banLeTren, banLeDuoi);
      nhomTrai.userData.capNhat = function (e) {
        var pos = geo.attributes.position, R = e > 0.999 ? Infinity : r / (1 - e), bien = [], bienTren = [], bienDuoi = [];
        for (var i = 0; i <= NU; i++) {
          var s = (i / NU - 0.5) * 2 * Math.PI * r, x, z;
          if (R === Infinity) { x = s; z = r; }
          else { var ph = s / R; x = R * Math.sin(ph); z = r - R * (1 - Math.cos(ph)); }
          pos.setXYZ(i * 2, x, 0, z); pos.setXYZ(i * 2 + 1, x, h, z);
          bienDuoi.push(new T.Vector3(x, 0, z)); bienTren.push(new T.Vector3(x, h, z));
        }
        pos.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); geo.computeBoundingBox();
        bien = bienDuoi.concat(bienTren.reverse()); bien.push(bien[0]);
        datDiemDuong(vien, bien);
        banLeTren.rotation.x = e * Math.PI / 2;
        banLeDuoi.rotation.x = -e * Math.PI / 2;
        nhomTrai.position.y = e * 2 * r;
      };
    }
    function xayTraiNon() {
      var r = DD.goc.r, H = DD.goc.h, l = Math.hypot(r, H), NU = 96, NV = 8;
      var geo = luoiMat(NU, NV), mesh = matTrai(geo, 'xungQuanh');
      var vien = taoDuong([new T.Vector3(), new T.Vector3(0, 1, 0)], MAU_CANH, 3, false, { thuTu: 3 });
      var banLe = new T.Group(), d = dia(r, 'dayDuoi');
      d.position.set(0, 0, -r); banLe.add(d);
      nhomTrai.add(mesh, vien, banLe);
      nhomTrai.userData.capNhat = function (e) {
        var rt = r + e * (l - r), Ht = Math.sqrt(Math.max(0, l * l - rt * rt));
        var pos = geo.attributes.position, S = new T.Vector3(0, Ht, 0), cung = [];
        for (var i = 0; i <= NU; i++) {
          var s = (i / NU - 0.5) * 2 * Math.PI * r, a = s / rt;
          var B = new T.Vector3(rt * Math.sin(a), 0, rt * Math.cos(a));
          cung.push(B);
          for (var j = 0; j <= NV; j++) {
            var P = S.clone().lerp(B, j / NV);
            pos.setXYZ(i * (NV + 1) + j, P.x, P.y, P.z);
          }
        }
        pos.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); geo.computeBoundingBox();
        datDiemDuong(vien, [S].concat(cung).concat([S]));
        banLe.position.set(0, 0, rt);
        banLe.rotation.x = e * Math.PI;
      };
    }
    function hopTraiHinh() {
      var cu = TT.traiT, thay = nhomTrai.visible, khoi = nhomKhoi.visible;
      datMucTrai(1); nhomTrai.updateMatrixWorld(true);
      var hop = new T.Box3().setFromObject(nhomTrai);
      datMucTrai(cu); nhomTrai.visible = thay; nhomKhoi.visible = khoi;
      return hop;
    }
    function datMucTrai(t) {
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // êm dịu
      if (nhomTrai.userData.capNhat) nhomTrai.userData.capNhat(e);
      var nm = nhomTrai.userData.nhomMat;
      if (nm) Object.keys(nm).forEach(function (k) {
        var g = nm[k], u = g.userData;
        if (u.truc) g.quaternion.setFromAxisAngle(u.truc, u.phi * e);
      });
      var dangTrai = t > 0.001;
      nhomTrai.visible = dangTrai;
      nhomKhoi.visible = !dangTrai;
    }

    /* =====================================================================
       MẶT CẮT
       ===================================================================== */
    function mcHienTai() { return cfg.matCat.filter(function (x) { return x.id === TT.catId; })[0]; }
    function xayMatCat() {
      donNhom(nhomCat);
      matPhangCat = null;
      if (!TT.catId) return null;
      var mc = mcHienTai();
      var mp = mc.matPhang(ts, TT.catT);
      var n = v3(mp.phapTuyen).normalize(), P0 = v3(mp.diem);
      // Mặt phẳng dùng để ẩn phần "trên" (phần mà pháp tuyến chỉ tới)
      matPhangCat = new T.Plane(n.clone().negate(), n.dot(P0));

      // Mặt phẳng lớn trong suốt
      var kichThuoc = DD.banKinh * 3.2;
      var mpMesh = new T.Mesh(new T.PlaneGeometry(kichThuoc, kichThuoc), new T.MeshBasicMaterial({ color: MAU_CAT, transparent: true, opacity: 0.1, side: T.DoubleSide, depthWrite: false }));
      mpMesh.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), n);
      var chieu = new T.Vector3().subVectors(DD.tam, P0); chieu.sub(n.clone().multiplyScalar(chieu.dot(n)));
      mpMesh.position.copy(P0).add(chieu); mpMesh.renderOrder = 2;
      nhomCat.add(mpMesh);
      nhomCat.add(taoDuong(hinhVuongVien(mpMesh, kichThuoc), MAU_CAT, 1.5, false, { doMo: 0.5, thuTu: 2 }));

      var ds = [], kq;
      if (mc.thietDien) {
        var td = mc.thietDien(ts, TT.catT);
        ds = (td.diem || []).map(v3);
        kq = { soDinh: ds.length, moTa: td.moTa };
      } else {
        Object.keys(DD.canh).forEach(function (k) {
          var c = DD.canh[k], A = c.diem[0], B = c.diem[1];
          var da = n.dot(A) - n.dot(P0), db = n.dot(B) - n.dot(P0);
          if (Math.abs(da) < 1e-7) themDiem(ds, A);
          if (Math.abs(db) < 1e-7) themDiem(ds, B);
          if (da * db < -1e-14) themDiem(ds, A.clone().lerp(B, da / (da - db)));
        });
        if (ds.length >= 3) {
          var tamC = new T.Vector3(); ds.forEach(function (p) { tamC.add(p); }); tamC.divideScalar(ds.length);
          var e1 = new T.Vector3().subVectors(ds[0], tamC).normalize(), e2 = new T.Vector3().crossVectors(n, e1);
          ds.sort(function (a, b) {
            var va = new T.Vector3().subVectors(a, tamC), vb = new T.Vector3().subVectors(b, tamC);
            return Math.atan2(va.dot(e2), va.dot(e1)) - Math.atan2(vb.dot(e2), vb.dot(e1));
          });
          kq = phanLoaiDaGiac(ds, n);
        } else kq = { soDinh: ds.length };
      }
      if (ds.length >= 3) {
        var mesh = new T.Mesh(hinhDaGiac(ds), new T.MeshBasicMaterial({ color: MAU_CAT, transparent: true, opacity: 0.72, side: T.DoubleSide, depthWrite: false, depthTest: false }));
        mesh.renderOrder = 4; nhomCat.add(mesh);
        var dong = ds.concat([ds[0]]);
        nhomCat.add(taoDuong(dong, '#B34700', 4, false, { thuTu: 5, khongSau: true }));
      }
      return kq;
    }
    function themDiem(ds, p) { for (var i = 0; i < ds.length; i++) if (ds[i].distanceTo(p) < 1e-6) return; ds.push(p.clone()); }
    function hinhVuongVien(mesh, s) {
      var h = s / 2, ds = [[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]];
      return ds.map(function (xy) { return new T.Vector3(xy[0], xy[1], 0).applyQuaternion(mesh.quaternion).add(mesh.position); });
    }
    function phanLoaiDaGiac(ds) {
      var k = ds.length, canhL = [], goc = [];
      for (var i = 0; i < k; i++) {
        var A = ds[(i + k - 1) % k], B = ds[i], C = ds[(i + 1) % k];
        canhL.push(B.distanceTo(C));
        var u = new T.Vector3().subVectors(A, B).normalize(), v = new T.Vector3().subVectors(C, B).normalize();
        goc.push(Math.acos(Math.max(-1, Math.min(1, u.dot(v)))) * 180 / Math.PI);
      }
      var dt = 0;
      for (var j = 1; j < k - 1; j++) dt += new T.Vector3().subVectors(ds[j], ds[0]).cross(new T.Vector3().subVectors(ds[j + 1], ds[0])).length() / 2;
      var min = Math.min.apply(null, canhL), max = Math.max.apply(null, canhL);
      var deuCanh = (max - min) < 1e-3 * Math.max(1, max);
      var vuong = goc.every(function (g) { return Math.abs(g - 90) < 0.05; });
      var songSong = function (i, j) {
        var a = new T.Vector3().subVectors(ds[(i + 1) % k], ds[i]).normalize(), b = new T.Vector3().subVectors(ds[(j + 1) % k], ds[j]).normalize();
        return Math.abs(Math.abs(a.dot(b)) - 1) < 1e-4;
      };
      var ten;
      if (k === 3) {
        var c = canhL.slice().sort(function (x, y) { return x - y; });
        ten = deuCanh ? 'tam giác đều' : (Math.abs(c[0] - c[1]) < 1e-3 || Math.abs(c[1] - c[2]) < 1e-3) ? 'tam giác cân' : 'tam giác';
      } else if (k === 4) {
        if (vuong) ten = deuCanh ? 'hình vuông' : 'hình chữ nhật';
        else if (deuCanh) ten = 'hình thoi';
        else if (songSong(0, 2) && songSong(1, 3)) ten = 'hình bình hành';
        else if (songSong(0, 2) || songSong(1, 3)) ten = 'hình thang';
        else ten = 'tứ giác';
      }
      else if (k === 5) ten = 'ngũ giác';
      else if (k === 6) ten = deuCanh && goc.every(function (g) { return Math.abs(g - 120) < 0.05; }) ? 'lục giác đều' : 'lục giác';
      else ten = 'đa giác ' + k + ' cạnh';
      var chiTiet = '';
      if (k === 4 && vuong && !deuCanh) chiTiet = 'kích thước ' + so(Math.max(canhL[0], canhL[1])) + ' × ' + so(Math.min(canhL[0], canhL[1]));
      else if (deuCanh) chiTiet = 'cạnh ' + so(min);
      return { soDinh: k, ten: ten, dienTich: dt, chiTiet: chiTiet };
    }

    /* =====================================================================
       MINH HOẠ THỂ TÍCH
       khoi : xếp khối lập phương 1 cm³      (hình hộp, lập phương)
       lop  : xếp từng lớp đáy dày 1 cm        (lăng trụ, hình trụ)
       nuoc : đổ nước 3 lần sang khối cùng đáy (hình chóp, hình nón)
       ===================================================================== */
    var ketCauO = null;
    function taoKetCauO() {
      if (ketCauO) return ketCauO;
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, 64, 64);
      x.strokeStyle = '#0B5E57'; x.lineWidth = 5; x.strokeRect(2.5, 2.5, 59, 59);
      ketCauO = new T.CanvasTexture(c); ketCauO.colorSpace = T.SRGBColorSpace;
      return ketCauO;
    }
    var MAU_LOP = ['#5EEAD4', '#2DD4BF', '#99F6E4', '#14B8A6'];
    function xayDonVi() {
      donNhom(nhomDonVi);
      nhomDonVi.position.set(0, 0, 0);
      if (!TT.donVi || !KIEU_V) return;
      if (KIEU_V === 'khoi') {
        var kd = cfg.khoiDonVi(ts);
        var nx = kd.n[0], ny = kd.n[1], nz = kd.n[2], g0 = kd.goc, tong = nx * ny * nz;
        var im = new T.InstancedMesh(new T.BoxGeometry(0.97, 0.97, 0.97), new T.MeshLambertMaterial({ map: taoKetCauO(), color: '#ffffff' }), tong);
        var m4 = new T.Matrix4(), mau = new T.Color(), i = 0;
        for (var y = 0; y < ny; y++) for (var z = 0; z < nz; z++) for (var x = 0; x < nx; x++) {
          m4.makeTranslation(g0[0] + x + 0.5, g0[1] + y + 0.5, g0[2] + z + 0.5);
          im.setMatrixAt(i, m4); im.setColorAt(i, mau.set(MAU_LOP[y % MAU_LOP.length])); i++;
        }
        im.count = Math.min(TT.donViDem, tong);
        im.userData = { tong: tong, nx: nx, ny: ny, nz: nz };
        nhomDonVi.add(im);
      } else if (KIEU_V === 'lop') {
        var ld = cfg.lopDay(ts), soLop = Math.ceil(ld.cao - 1e-9);
        for (var k = 0; k < soLop; k++) {
          var day = Math.min(1, ld.cao - k);
          var g = new T.Group();
          var mesh = new T.Mesh(khoiLangTru(ld.day, 0, day * 0.97), new T.MeshLambertMaterial({ color: MAU_LOP[k % MAU_LOP.length], transparent: true, opacity: 0.92 }));
          var vien = new T.LineSegments(new T.EdgesGeometry(mesh.geometry, 20), new T.LineBasicMaterial({ color: '#0B5E57' }));
          g.add(mesh, vien);
          g.userData = { yDich: k, i: k };
          g.position.y = k; g.visible = false;
          nhomDonVi.add(g);
        }
        nhomDonVi.userData = { tong: soLop, sDay: ld.dienTichDay, cao: ld.cao };
      } else if (KIEU_V === 'nuoc') {
        var dn = cfg.doNuoc(ts), lech = v3(dn.lech);
        nhomDonVi.position.copy(lech);
        // bình chứa (khối lăng trụ / hình trụ cùng đáy, cùng chiều cao) — viền + thành kính
        var thanh = new T.Mesh(khoiLangTru(dn.day, 0, dn.cao), new T.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.18, side: T.DoubleSide, depthWrite: false }));
        thanh.renderOrder = 1; nhomDonVi.add(thanh);
        var duoi = dn.day.map(function (p) { return new T.Vector3(p[0], 0, p[1]); }); duoi.push(duoi[0].clone());
        var tren = duoi.map(function (p) { return new T.Vector3(p.x, dn.cao, p.z); });
        nhomDonVi.add(taoDuong(duoi, '#0369A1', 3, false, { thuTu: 5 }), taoDuong(tren, '#0369A1', 3, false, { thuTu: 5 }));
        var dung = dn.tron ? [0, Math.floor(dn.day.length / 2)] : dn.day.map(function (_, i) { return i; });
        dung.forEach(function (i) { nhomDonVi.add(taoDuong([duoi[i], tren[i]], '#0369A1', 3, false, { thuTu: 5 })); });
        var nuoc = new T.Mesh(khoiLangTru(dn.day, 0, 1), new T.MeshLambertMaterial({ color: MAU_NUOC, transparent: true, opacity: 0.6, depthWrite: false }));
        nuoc.scale.y = 0.0001; nuoc.renderOrder = 2; nuoc.userData.laNuoc = true;
        nhomDonVi.add(nuoc);
        var el = document.createElement('div'); el.className = 'nhan-do'; el.style.background = '#0369A1';
        el.innerHTML = dn.ten || 'Bình chứa';
        var nh = new T.CSS2DObject(el); nh.position.set(0, dn.cao + 0.5 + DD.banKinh * 0.1, 0); nhomDonVi.add(nh);
        nhomDonVi.userData = { tong: 3, cao: dn.cao, nuoc: nuoc };
      }
    }
    function capNhatDonVi(now) {
      if (!TT.donVi || !nhomDonVi.children.length) return;
      elDem.style.setProperty('--mau', KIEU_V === 'nuoc' ? '#0369A1' : MAU.theTich);
      var phu = function (s) { return '<div style="font-size:14px;font-weight:600;color:var(--chu-phu)">' + s + '</div>'; };
      var dt = (now - TT.donViBatDau) * (TOC_DO[TT.tocDo] || TOC_DO.vua).hs;
      if (KIEU_V === 'khoi') {
        var im = nhomDonVi.children[0], tong = im.userData.tong;
        if (TT.donViDem < tong) {
          var thoiGian = Math.min(7000, Math.max(2500, tong * 25));
          TT.donViDem = Math.min(tong, Math.ceil(dt / thoiGian * tong));
          im.count = TT.donViDem;
        }
        var ud = im.userData, lop = ud.nx * ud.nz;
        elDem.innerHTML = 'Đã xếp <span class="toan">' + Math.min(TT.donViDem, tong) + '</span> / ' + tong + ' khối' +
          (TT.donViDem >= tong ? phu('Mỗi lớp ' + ud.nx + ' × ' + ud.nz + ' = ' + lop + ' khối · ' + ud.ny + ' lớp') : '');
      } else if (KIEU_V === 'lop') {
        var u = nhomDonVi.userData, moiLop = 700;
        var dem = Math.min(u.tong, Math.floor(dt / moiLop) + 1);
        if (TT.donViDem >= 1e8) dem = u.tong;
        nhomDonVi.children.forEach(function (g) {
          var i = g.userData.i;
          g.visible = i < dem;
          if (i === dem - 1 && dem <= u.tong && TT.donViDem < 1e8) {
            var p = Math.min(1, (dt - i * moiLop) / 450), e = 1 - Math.pow(1 - p, 3);
            g.position.y = i + (1 - e) * 1.6;
          } else g.position.y = i;
        });
        elDem.innerHTML = 'Đã xếp <span class="toan">' + dem + '</span> / ' + u.tong + ' lớp' +
          (dem >= u.tong ? phu('Mỗi lớp dày 1 cm có thể tích = S<sub>đáy</sub> × 1 ≈ ' + so(u.sDay) + ' cm³') : '');
      } else if (KIEU_V === 'nuoc') {
        var U = nhomDonVi.userData, CHU_KY = 2400, lan = Math.min(3, Math.floor(dt / CHU_KY)), trong = dt - lan * CHU_KY;
        var muc, toChop;
        if (lan >= 3) { muc = 1; toChop = 0.12; }
        else if (trong < 600) { muc = lan / 3; toChop = 0.12 + 0.5 * (trong / 600); }
        else if (trong < 1900) { var p2 = (trong - 600) / 1300; muc = (lan + p2) / 3; toChop = 0.62 * (1 - p2) + 0.02; }
        else { muc = (lan + 1) / 3; toChop = 0.02; }
        U.nuoc.scale.y = Math.max(0.0001, muc * U.cao);
        Object.keys(doiTuong.matMesh).forEach(function (k) {
          var M = doiTuong.matMesh[k]; M.material.color.set(MAU_NUOC); M.material.opacity = toChop;
        });
        var lanHien = Math.min(3, lan + (trong >= 600 || lan >= 3 ? 1 : 0));
        elDem.innerHTML = 'Lần đổ: <span class="toan">' + Math.max(1, lanHien) + '</span> / 3' +
          (lan >= 3 ? phu('Đổ 3 lần đầy thì vừa đầy bình → V<sub>chóp</sub> = ⅓ · V<sub>bình</sub>')
                    : phu(trong >= 600 && trong < 1900 ? 'Đang rót nước sang bình…' : 'Mực nước: ' + Math.round(muc * 3) + '/3 chiều cao bình'));
      }
    }

    /* =====================================================================
       CAMERA: góc nhìn nhanh, phóng to/thu nhỏ, đặt lại
       ===================================================================== */
    var hoatCam = null;
    var HUONG = {
      cheo: new T.Vector3(1.05, 0.78, 1.9),
      truoc: new T.Vector3(0, 0.0001, 1),
      tren: new T.Vector3(0, 1, 0.0001),
      ben: new T.Vector3(1, 0.0001, 0),
      traiHinh: new T.Vector3(0.35, 1.5, 1),
    };
    function khoangCach(r) { return r / Math.sin(T.MathUtils.degToRad(camera.fov / 2)) * 1.08 / Math.min(1, camera.aspect * 0.9 + 0.1); }
    function nhinTheo(ten, tucThi, heSo) {
      var r = DD.banKinh * (heSo || 1.4);
      var dich = DD.tam.clone();
      if (ten === 'traiHinh' || (cfg.traiHinh && (TT.traiDich > 0.5 || TT.traiT > 0.5))) {
        var hop = hopTraiHinh(); dich = hop.getCenter(new T.Vector3());
        r = hop.getSize(new T.Vector3()).length() * 0.5 * 1.05;
      } else if (TT.donVi && KIEU_V === 'nuoc') {
        var lech = v3(cfg.doNuoc(ts).lech);
        dich.add(lech.clone().multiplyScalar(0.5));
        r = (DD.banKinh + lech.length() * 0.5) * 1.25;
      }
      var huong = (HUONG[ten] || HUONG.cheo).clone().normalize();
      if (ten === 'traiHinh' && cfg.traiHinh && cfg.traiHinh.kieu === 'tru') huong = new T.Vector3(0.25, 0.35, 1).normalize();
      var vt = huong.multiplyScalar(khoangCach(r)).add(dich);
      if (tucThi) { camera.position.copy(vt); dk.target.copy(dich); dk.update(); return; }
      hoatCam = { t0: performance.now(), tu: camera.position.clone(), den: vt, tuD: dk.target.clone(), denD: dich, dai: 650 };
    }
    function phong(heSo) {
      var v = new T.Vector3().subVectors(camera.position, dk.target);
      var d = Math.max(dk.minDistance || 0.5, Math.min(200, v.length() * heSo));
      hoatCam = { t0: performance.now(), tu: camera.position.clone(), den: dk.target.clone().add(v.setLength(d)), tuD: dk.target.clone(), denD: dk.target.clone(), dai: 250 };
    }

    /* =====================================================================
       BẢNG ĐIỀU KHIỂN
       ===================================================================== */
    var soMuc = 0;
    function muc(tieuDe, noiDung) { soMuc++; return '<section class="muc"><h3><span class="so">' + soMuc + '</span>' + tieuDe + '</h3>' + noiDung + '</section>'; }
    function hienGiaTri(p) { return p.hienThi ? p.hienThi(ts) : so(ts[p.khoa]) + ' ' + (p.donVi || ''); }
    var NHAN_V = { khoi: '▦ Xếp khối lập phương 1 ' + (cfg.donVi || 'cm') + '³', lop: '▤ Xếp từng lớp dày 1 ' + (cfg.donVi || 'cm'), nuoc: '💧 Đổ nước 3 lần' };

    function veBang() {
      var h = '';
      h += muc('Kích thước', cfg.thamSo.map(function (p) {
        var mau = p.mau || 'var(--chinh)';
        return '<div class="tham-so" style="--mau:' + mau + '"><div class="dong"><span>' + p.nhan + '</span>' +
          '<span class="gia-tri" id="gt-' + p.khoa + '">' + hienGiaTri(p) + '</span></div>' +
          '<div class="hang"><button class="buoc" data-buoc="-1" data-k="' + p.khoa + '" aria-label="Giảm">−</button>' +
          '<input type="range" id="ts-' + p.khoa + '" min="' + p.min + '" max="' + p.max + '" step="' + p.buoc + '" value="' + ts[p.khoa] + '">' +
          '<button class="buoc" data-buoc="1" data-k="' + p.khoa + '" aria-label="Tăng">+</button></div></div>';
      }).join(''));
      h += muc('Bấm để làm nổi bật', '<div class="luoi-sang">' + dsSang.map(function (s) {
        return '<button class="nut-sang" data-sang="' + s.id + '" style="--mau:' + s.mau + '"><span class="cham"></span><span>' + s.nhan + '</span></button>';
      }).join('') + '</div><div class="hanh-dong-phu">' +
        (KIEU_V ? '<button class="nut nho" id="nut-don-vi">' + NHAN_V[KIEU_V] + '</button>' : '') +
        '<button class="nut nho" id="nut-tat-het">Tắt hết</button></div>');
      h += muc('Công thức', '<div class="cong-thuc" id="mh-cong-thuc"></div>');
      if (cfg.traiHinh) {
        h += muc('Trải hình (hình khai triển)', '<div class="dong-dieu-khien"><button class="nut chinh" id="nut-trai">Trải hình ra</button>' +
          '<input type="range" id="thanh-trai" min="0" max="1" step="0.001" value="0" aria-label="Mức trải hình"></div>');
      }
      if (cfg.traiHinh || KIEU_V) {
        h += muc('Tốc độ hiệu ứng', '<div class="lua-chon" id="lc-toc">' + Object.keys(TOC_DO).map(function (k) {
          return '<button data-toc="' + k + '"' + (k === TT.tocDo ? ' class="bat"' : '') + '>' + TOC_DO[k].nhan + '</button>';
        }).join('') + '</div><div style="font-size:13px;color:var(--chu-phu);margin-top:6px">Áp dụng cho trải hình / gấp lại' + (KIEU_V ? ' và hiệu ứng thể tích' : '') + '.</div>');
      }
      if (cfg.matCat && cfg.matCat.length) {
        h += muc('Mặt cắt', '<div class="lua-chon" id="lc-cat"><button data-cat="" class="bat">Không cắt</button>' +
          cfg.matCat.map(function (c) { return '<button data-cat="' + c.id + '">' + c.nhan + '</button>'; }).join('') + '</div>' +
          '<div id="dk-cat" class="an"><div class="dong-dieu-khien"><span style="font-weight:600">Vị trí</span><input type="range" id="thanh-cat" min="0.02" max="0.98" step="0.005" value="0.5"></div>' +
          '<label class="cong-tac" style="margin-top:6px">Ẩn phần phía trên mặt cắt <input type="checkbox" id="an-tren"></label>' +
          '<div class="mo-ta-cat" id="mo-ta-cat"></div></div>');
      }
      h += muc('Hiển thị',
        '<label class="cong-tac">' + (DD.cong ? 'Tên điểm' : 'Tên đỉnh') + ' <input type="checkbox" id="hien-ten" checked></label>' +
        '<label class="cong-tac">Nét khuất (nét đứt) <input type="checkbox" id="hien-khuat" checked></label>' +
        '<label class="cong-tac">Tô màu các mặt <input type="checkbox" id="hien-mat" checked></label>' +
        '<label class="cong-tac">Lưới nền <input type="checkbox" id="hien-luoi" checked></label>');
      bang.innerHTML = h;
      ganSuKienBang();
    }

    function ganSuKienBang() {
      cfg.thamSo.forEach(function (p) {
        var inp = document.getElementById('ts-' + p.khoa);
        inp.addEventListener('input', function () { datThamSo(p.khoa, parseFloat(inp.value)); });
      });
      bang.querySelectorAll('.buoc').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = cfg.thamSo.filter(function (x) { return x.khoa === b.dataset.k; })[0];
          var gt = Math.min(p.max, Math.max(p.min, ts[p.khoa] + p.buoc * (+b.dataset.buoc)));
          gt = Math.round(gt / p.buoc) * p.buoc;
          gt = parseFloat(gt.toFixed(6));
          document.getElementById('ts-' + p.khoa).value = gt;
          datThamSo(p.khoa, gt);
        });
      });
      bang.querySelectorAll('.nut-sang').forEach(function (b) {
        b.addEventListener('click', function () { batTatSang(b.dataset.sang); });
      });
      document.getElementById('nut-tat-het').onclick = function () { TT.dangSang = []; if (TT.donVi) batTatDonVi(false); apDungSang(); };
      var nutDV = document.getElementById('nut-don-vi');
      if (nutDV) nutDV.onclick = function () { batTatDonVi(!TT.donVi); };
      var lcToc = document.getElementById('lc-toc');
      if (lcToc) lcToc.querySelectorAll('button').forEach(function (b) {
        b.onclick = function () {
          var cu = TOC_DO[TT.tocDo] || TOC_DO.vua, moi = TOC_DO[b.dataset.toc];
          if (TT.donVi) TT.donViBatDau = performance.now() - (performance.now() - TT.donViBatDau) * cu.hs / moi.hs;   // giữ nguyên tiến độ đang chạy
          TT.tocDo = b.dataset.toc;
          try { localStorage.setItem('mh3d_toc_do', TT.tocDo); } catch (e) {}
          lcToc.querySelectorAll('button').forEach(function (x) { x.classList.toggle('bat', x === b); });
        };
      });
      if (cfg.traiHinh) {
        document.getElementById('nut-trai').onclick = function () {
          var mo = TT.traiDich < 0.5;
          if (mo) { tatCat(); if (TT.donVi) batTatDonVi(false); }
          TT.traiDich = mo ? 1 : 0;
          nhinTheo(mo ? 'traiHinh' : 'cheo');
        };
        document.getElementById('thanh-trai').addEventListener('input', function (e) {
          var v = parseFloat(e.target.value);
          if (v > 0 && TT.traiT === 0) { tatCat(); if (TT.donVi) batTatDonVi(false); }
          TT.traiT = TT.traiDich = v; datMucTrai(v); capNhatNutTrai(); xayNhanDo();
        });
      }
      if (cfg.matCat && cfg.matCat.length) {
        document.querySelectorAll('#lc-cat button').forEach(function (b) {
          b.addEventListener('click', function () { chonCat(b.dataset.cat || null); });
        });
        document.getElementById('thanh-cat').addEventListener('input', function (e) {
          var v = parseFloat(e.target.value), mc = mcHienTai();
          (mc && giaTri(mc.diemDacBiet, ts) || []).forEach(function (d) { if (Math.abs(v - d) < 0.015) v = d; });
          TT.catT = v; capNhatCat();
        });
        document.getElementById('an-tren').addEventListener('change', function (e) { TT.anPhanTren = e.target.checked; capNhatCat(); });
      }
      document.getElementById('hien-ten').onchange = function (e) { TT.hienTenDinh = e.target.checked; apDungSang(); };
      document.getElementById('hien-khuat').onchange = function (e) { TT.hienNetKhuat = e.target.checked; apDungSang(); };
      document.getElementById('hien-mat').onchange = function (e) { TT.toMat = e.target.checked; apDungSang(); };
      document.getElementById('hien-luoi').onchange = function (e) { TT.hienLuoi = e.target.checked; if (luoiNen) luoiNen.visible = TT.hienLuoi; };
    }

    function veCongCu() {
      var cc = document.getElementById('mh-cong-cu');
      function nut(id, icon, nhan, tieuDe) { return '<button class="cc" id="cc-' + id + '" title="' + tieuDe + '">' + ICON[icon] + '<span>' + nhan + '</span></button>'; }
      cc.innerHTML =
        nut('phong', 'phong', 'Phóng to', 'Phóng to') + nut('thu', 'thu', 'Thu nhỏ', 'Thu nhỏ') + '<span class="ngan"></span>' +
        nut('truoc', 'truoc', 'Trước', 'Nhìn từ phía trước') + nut('tren', 'tren', 'Trên', 'Nhìn từ trên xuống') +
        nut('ben', 'ben', 'Bên', 'Nhìn từ bên phải') + nut('cheo', 'cheo', 'Chéo', 'Góc nhìn như hình vẽ trong SGK') + '<span class="ngan"></span>' +
        nut('xoay', 'xoay', 'Tự xoay', 'Tự động xoay chậm') + nut('datlai', 'datLai', 'Đặt lại', 'Đưa hình về ban đầu') + nut('toan', 'toan', 'Toàn MH', 'Toàn màn hình');
      document.getElementById('cc-phong').onclick = function () { phong(0.8); };
      document.getElementById('cc-thu').onclick = function () { phong(1.25); };
      ['truoc', 'tren', 'ben', 'cheo'].forEach(function (h) { document.getElementById('cc-' + h).onclick = function () { nhinTheo(h); }; });
      document.getElementById('cc-xoay').onclick = function () {
        dk.autoRotate = !dk.autoRotate; this.classList.toggle('bat', dk.autoRotate);
      };
      document.getElementById('cc-datlai').onclick = datLai;
      document.getElementById('cc-toan').onclick = function () {
        var el = document.getElementById('mh');
        if (document.fullscreenElement) document.exitFullscreen();
        else if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      };
      document.addEventListener('fullscreenchange', function () {
        document.getElementById('cc-toan').classList.toggle('bat', !!document.fullscreenElement);
        setTimeout(doiKichThuoc, 60);
      });
    }

    /* ---------- Hành động ---------- */
    function batTatSang(id) {
      var i = TT.dangSang.indexOf(id);
      if (i >= 0) { TT.dangSang.splice(i, 1); if (id === idTheTich() && TT.donVi) batTatDonVi(false); }
      else { TT.dangSang.push(id); TT.thoiDiemBat[id] = performance.now(); }
      apDungSang();
    }
    function idTheTich() { var s = dsSang.filter(function (x) { return x.khoi; })[0]; return s ? s.id : null; }

    function gapLai() {
      if (TT.traiDich > 0 || TT.traiT > 0) { TT.traiDich = 0; TT.traiT = 0; datMucTrai(0); capNhatNutTrai(); return true; }
      return false;
    }
    function batTatDonVi(bat) {
      TT.donVi = bat;
      var nut = document.getElementById('nut-don-vi'), coGap = false;
      if (nut) nut.classList.toggle('chinh', bat);
      if (bat) {
        coGap = gapLai();
        tatCat();
        var idV = idTheTich();
        if (idV && TT.dangSang.indexOf(idV) < 0) { TT.dangSang.push(idV); TT.thoiDiemBat[idV] = performance.now(); }
        TT.donViDem = 0; TT.donViBatDau = performance.now();
      }
      xayDonVi(); apDungSang();
      elDem.classList.toggle('an', !bat);
      if (KIEU_V === 'nuoc' || coGap) nhinTheo('cheo');
    }

    function chonCat(id) {
      TT.catId = id;
      document.querySelectorAll('#lc-cat button').forEach(function (b) { b.classList.toggle('bat', (b.dataset.cat || null) === id); });
      document.getElementById('dk-cat').classList.toggle('an', !id);
      if (id) {
        var coGap = gapLai();
        if (TT.donVi) batTatDonVi(false);
        var mc = mcHienTai();
        TT.catT = mc.batDau != null ? giaTri(mc.batDau, ts) : 0.5;
        document.getElementById('thanh-cat').value = TT.catT;
        // Nếu đang nhìn gần như song song với mặt cắt thì xoay camera cho thấy rõ mặt cắt
        var n0 = v3(mc.matPhang(ts, TT.catT).phapTuyen).normalize();
        var huongCam = new T.Vector3().subVectors(camera.position, dk.target).normalize();
        if (Math.abs(huongCam.dot(n0)) < 0.4) {
          var co = HUONG.cheo.clone().normalize();
          if (co.dot(n0) < 0) n0.negate();
          HUONG.catTam = co.add(n0.multiplyScalar(0.9));
          if (HUONG.catTam.y < 0.3) HUONG.catTam.y = 0.3;
          nhinTheo('catTam');
        } else if (coGap) nhinTheo('cheo');
      }
      capNhatCat();
    }
    function tatCat() {
      if (!TT.catId) return;
      TT.catId = null; TT.anPhanTren = false;
      var cb = document.getElementById('an-tren'); if (cb) cb.checked = false;
      chonCat(null);
    }
    function capNhatCat() {
      var kq = xayMatCat();
      xayKhoi(); apDungSang();
      var el = document.getElementById('mo-ta-cat');
      if (!el) return;
      if (!kq || !TT.catId) { el.innerHTML = ''; return; }
      if (kq.soDinh < 3) { el.innerHTML = 'Mặt phẳng chưa cắt qua hình.'; return; }
      if (kq.moTa) { el.innerHTML = kq.moTa; return; }
      var dv = cfg.donVi || 'cm';
      el.innerHTML = 'Mặt cắt là <b>' + kq.ten + '</b>' + (kq.chiTiet ? ' (' + kq.chiTiet + ' ' + dv + ')' : '') +
        '.<br>Diện tích mặt cắt ≈ <b>' + so(kq.dienTich) + ' ' + dv + '²</b>';
    }
    function capNhatNutTrai() {
      var n = document.getElementById('nut-trai'); if (!n) return;
      n.textContent = TT.traiDich > 0.5 ? 'Gấp lại' : 'Trải hình ra';
      document.getElementById('thanh-trai').value = TT.traiT;
    }

    function capNhatGiaTriThamSo() { cfg.thamSo.forEach(function (p) { document.getElementById('gt-' + p.khoa).innerHTML = hienGiaTri(p); }); }
    function datThamSo(k, gt) {
      ts[k] = gt;
      capNhatGiaTriThamSo();
      DD = tinhHinh();
      xayMatCat(); xayKhoi(); xayTraiHinh();
      if (TT.donVi) { TT.donViDem = 1e9; TT.donViBatDau = -1e9; xayDonVi(); }
      datLuoiNen();
      apDungSang();
      if (TT.catId) capNhatCat();
    }

    function datLai() {
      TT.dangSang = []; TT.traiDich = 0; TT.traiT = 0;
      dk.autoRotate = false; document.getElementById('cc-xoay').classList.remove('bat');
      if (TT.donVi) batTatDonVi(false);
      tatCat();
      cfg.thamSo.forEach(function (p) { ts[p.khoa] = p.gt; document.getElementById('ts-' + p.khoa).value = p.gt; });
      capNhatGiaTriThamSo();
      DD = tinhHinh(); xayKhoi(); xayTraiHinh(); datMucTrai(0); capNhatNutTrai(); datLuoiNen();
      apDungSang();
      nhinTheo('cheo');
    }

    function datLuoiNen() {
      if (luoiNen) { canh.remove(luoiNen); luoiNen.geometry.dispose(); luoiNen.material.dispose(); }
      var s = Math.max(10, Math.ceil(DD.banKinh * 6));
      if (cfg.doNuoc) s += Math.ceil(v3(cfg.doNuoc(ts).lech).length() * 2);
      luoiNen = new T.GridHelper(s, s, 0xC5D0E3, 0xDDE4F0);
      luoiNen.position.y = DD.minY - Math.max(0.03, DD.banKinh * 0.01);
      luoiNen.material.transparent = true; luoiNen.material.opacity = 0.7; luoiNen.material.depthWrite = false;
      luoiNen.renderOrder = -1;
      luoiNen.visible = TT.hienLuoi;
      canh.add(luoiNen);
    }

    /* ---------- Cập nhật bảng ---------- */
    function capNhatBangSang() {
      bang.querySelectorAll('.nut-sang').forEach(function (b) { b.classList.toggle('bat', TT.dangSang.indexOf(b.dataset.sang) >= 0); });
    }
    function capNhatGhiChu() {
      var id = TT.dangSang[TT.dangSang.length - 1];
      if (!id || !mapSang[id].ghiChu) { elGhiChu.classList.add('an-mo'); return; }
      var s = mapSang[id];
      elGhiChu.style.borderLeftColor = s.mau;
      datHTML(elGhiChu, giaTri(s.ghiChu, ts));
      elGhiChu.classList.remove('an-mo');
    }
    var CT = {
      // tô màu một ký hiệu theo nút làm sáng: CT.c('a', 'a')
      c: function (id, chu) { var s = mapSang[id]; return '<span class="bien" style="color:' + (s ? s.mau : 'inherit') + '">' + chu + '</span>'; },
      // m: tô màu một phần công thức LaTeX (dùng bên trong $...$)
      m: function (id, tex) { var s = mapSang[id]; return s ? '\\textcolor{' + s.mau + '}{' + tex + '}' : tex; },
      so: so, soL: function (x, le) { return so(x, le).replace(',', '{,}'); },
    };
    function datHTML(el, html) {
      if (!el || el._cu === html) return;
      el._cu = html; el.innerHTML = html;
      if (window.Latex) window.Latex.ve(el);
    }
    function capNhatCongThuc() {
      var el = document.getElementById('mh-cong-thuc'); if (!el || !cfg.congThuc) return;
      datHTML(el, cfg.congThuc(ts, CT).map(function (r) {
        var bat = r.id && TT.dangSang.indexOf(r.id) >= 0;
        var mau = r.id && mapSang[r.id] ? mapSang[r.id].mau : 'var(--chinh)';
        return '<div class="ct' + (bat ? ' bat' : '') + '" style="--mau:' + mau + '"><div class="ten">' + r.ten + '</div><div class="bt">' + r.bt + '</div></div>';
      }).join(''));
    }

    /* =====================================================================
       VÒNG VẼ
       ===================================================================== */
    function doiKichThuoc() {
      var w = khungCanh.clientWidth, h = khungCanh.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false); nhanRenderer.setSize(w, h);
      camera.aspect = w / h;
      camera.setViewOffset(w, h, 0, -Math.min(28, h * 0.04), w, h);
      camera.updateProjectionMatrix();
      dsVatLieuDuong.forEach(function (m) { m.resolution.set(w, h); });
      doiTuong.vienKhoa = '';
    }
    if (window.ResizeObserver) new ResizeObserver(doiKichThuoc).observe(khungCanh);
    window.addEventListener('resize', doiKichThuoc);

    function vong(now) {
      requestAnimationFrame(vong);
      if (hoatCam) {
        var t = Math.min(1, (now - hoatCam.t0) / hoatCam.dai), e = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(hoatCam.tu, hoatCam.den, e);
        dk.target.lerpVectors(hoatCam.tuD, hoatCam.denD, e);
        if (t >= 1) hoatCam = null;
      }
      var buoc = Math.min(0.1, Math.max(0, now - (TT.khungTruoc || now)) / (TOC_DO[TT.tocDo] || TOC_DO.vua).trai); TT.khungTruoc = now;
      if (Math.abs(TT.traiT - TT.traiDich) > 1e-4) {
        TT.traiT += Math.sign(TT.traiDich - TT.traiT) * Math.min(buoc, Math.abs(TT.traiDich - TT.traiT));
        datMucTrai(TT.traiT); capNhatNutTrai();
        if (TT.traiT < 1e-3 || Math.abs(TT.traiT - TT.traiDich) < 1e-4) xayNhanDo();
      }
      var w = khungCanh.clientWidth, h = khungCanh.clientHeight;
      dsVatLieuDuong.forEach(function (m) { m.resolution.set(w, h); });
      // Nhấp nháy phần đang sáng trong 2,4 giây đầu
      function nhip(id, coBan, bienDo) {
        var dt = (now - (TT.thoiDiemBat[id] || 0)) / 1000;
        if (dt > 2.4) return coBan;
        return coBan + bienDo * (0.5 + 0.5 * Math.sin(dt * Math.PI * 2 * 1.6));
      }
      Object.keys(doiTuong.canhLine).forEach(function (k) {
        var L = doiTuong.canhLine[k], id = L.thay.userData.sang;
        if (id) { L.thay.material.linewidth = nhip(id, 7, 5); L.khuat.material.linewidth = nhip(id, 4, 2); }
      });
      nhomDo.children.forEach(function (o) {
        if (o.userData && o.userData.loai) o.material.linewidth = o.userData.loai === 'thay' ? nhip(o.userData.sang, 6, 5) : nhip(o.userData.sang, 4, 2);
      });
      if (!(TT.donVi && KIEU_V === 'nuoc')) {
        Object.keys(doiTuong.matMesh).forEach(function (k) {
          var M = doiTuong.matMesh[k], id = M.userData.sang;
          if (id) M.material.opacity = nhip(id, mapSang[id].khoi ? 0.34 : 0.5, 0.3);
        });
      }
      capNhatDonVi(now);
      dk.update();
      capNhatVien();
      renderer.render(canh, camera);
      nhanRenderer.render(canh, camera);
    }

    /* ---------- Khởi động ---------- */
    DD = tinhHinh();
    veBang(); veCongCu();
    xayKhoi(); xayTraiHinh(); datLuoiNen();
    doiKichThuoc();
    nhinTheo('cheo', true);
    apDungSang();
    requestAnimationFrame(vong);

    return { ts: ts, batTatSang: batTatSang, nhinTheo: nhinTheo };
  }

  window.KhongGian = { tao: tao, MAU: MAU, so: so, hinh: HINH, vongTron: vongTron };
})();
