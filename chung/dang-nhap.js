/* =====================================================================
   ĐĂNG NHẬP · PHIÊN · GỌI API · BẢO VỆ TRANG
   Nhúng sau cau-hinh.js:
     <script src="../chung/dang-nhap.js" data-goc="../"></script>
   data-goc      : đường dẫn từ trang hiện tại về thư mục gốc
   data-trang    : "dang-nhap" cho trang index (không bảo vệ)
   data-vai-tro  : "admin" nếu trang chỉ dành cho quản trị viên
   ===================================================================== */
(function () {
  'use strict';
  var CH = window.CAU_HINH || {};
  var theScript = document.currentScript;
  var GOC = (theScript && theScript.getAttribute('data-goc')) || './';
  var TRANG = (theScript && theScript.getAttribute('data-trang')) || '';
  var VAI_TRO_CAN = (theScript && theScript.getAttribute('data-vai-tro')) || '';
  var KHOA_PHIEN = 'mh3d_phien';
  var CHAY_THU = !CH.API_URL;

  /* ---------------- Lưu trữ an toàn ---------------- */
  function doc(khoa) { try { return JSON.parse(localStorage.getItem(khoa)); } catch (e) { return null; } }
  function ghi(khoa, gt) { try { localStorage.setItem(khoa, JSON.stringify(gt)); } catch (e) {} }
  function xoa(khoa) { try { localStorage.removeItem(khoa); } catch (e) {} }

  /* ---------------- Mở trực tiếp từ tệp (file://) ----------------
     Một số trình duyệt (Firefox, Zen...) coi mỗi tệp .html là một nơi lưu riêng,
     nên phiên đăng nhập được "mang theo" qua đường dẫn (#p=...) khi chuyển trang. */
  var LA_TEP = location.protocol === 'file:';
  function maHoa(o) { return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(o))))); }
  function giaiMa(s) { return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(s))))); }
  if (LA_TEP) {
    var mh = location.hash.match(/[#&]p=([^&]+)/);
    if (mh) {
      try { var goi = giaiMa(mh[1]); if (goi.phien) ghi(KHOA_PHIEN, goi.phien); if (goi.thu) ghi('mh3d_thu_taikhoan', goi.thu); } catch (e) {}
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }
  }
  function kemPhien(url) {
    if (!LA_TEP) return url;
    var p = doc(KHOA_PHIEN), thu = doc('mh3d_thu_taikhoan');
    if (!p && !thu) return url;
    return url.split('#')[0] + '#p=' + maHoa({ phien: p, thu: thu });
  }
  if (LA_TEP) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var h = a.getAttribute('href');
      if (!h || /^([a-z]+:|#)/i.test(h) || !/\.html(\?|#|$)/.test(h)) return;
      a.setAttribute('href', kemPhien(h));
    }, true);
  }

  /* ---------------- Phiên ---------------- */
  var Phien = {
    lay: function () {
      var p = doc(KHOA_PHIEN);
      if (!p || !p.token || !p.hetHan || Date.now() > p.hetHan) return null;
      return p;
    },
    luu: function (p) { ghi(KHOA_PHIEN, p); },
    xoa: function () { xoa(KHOA_PHIEN); },
  };

  /* ---------------- Máy chủ chạy thử (khi chưa có API_URL) ---------------- */
  var KHOA_THU = 'mh3d_thu_taikhoan';
  var MayThu = {
    ds: function () {
      var ds = doc(KHOA_THU);
      if (!ds) {
        var bay = new Date().toISOString();
        ds = [
          { ten: 'admin', hoTen: 'Quản trị viên', vaiTro: 'admin', lop: '', mk: 'admin123', trangThai: 'hoat-dong', ngayTao: bay, lanCuoi: '', soLan: 0 },
          { ten: 'gv', hoTen: 'Giáo viên mẫu', vaiTro: 'giaovien', lop: '', mk: 'gv123', trangThai: 'hoat-dong', ngayTao: bay, lanCuoi: '', soLan: 0 },
          { ten: 'hs', hoTen: 'Học sinh mẫu', vaiTro: 'hocsinh', lop: '7A1', mk: 'hs123', trangThai: 'hoat-dong', ngayTao: bay, lanCuoi: '', soLan: 0 },
        ];
        ghi(KHOA_THU, ds);
      }
      return ds;
    },
    luu: function (ds) { ghi(KHOA_THU, ds); },
    congKhai: function (tk) {
      return { ten: tk.ten, hoTen: tk.hoTen, vaiTro: tk.vaiTro, lop: tk.lop, trangThai: tk.trangThai, ngayTao: tk.ngayTao, lanCuoi: tk.lanCuoi, soLan: tk.soLan };
    },
    xuLy: function (hd, d) {
      var ds = this.ds();
      var tim = function (ten) { return ds.filter(function (t) { return t.ten === ten; })[0]; };
      var laAdmin = function () { var p = Phien.lay(); return p && p.vaiTro === 'admin'; };
      switch (hd) {
        case 'dangNhap': {
          var tk = tim(String(d.ten || '').trim().toLowerCase());
          if (!tk || tk.mk !== d.matKhau) return { ok: false, loi: 'Sai tên đăng nhập hoặc mật khẩu.' };
          if (tk.trangThai === 'khoa') return { ok: false, loi: 'Tài khoản đang bị khoá. Hãy liên hệ quản trị viên.' };
          tk.lanCuoi = new Date().toISOString(); tk.soLan = (tk.soLan || 0) + 1; this.luu(ds);
          return { ok: true, token: 'thu-' + Math.random().toString(36).slice(2), hoTen: tk.hoTen, vaiTro: tk.vaiTro, lop: tk.lop, ten: tk.ten };
        }
        case 'kiemTra': return { ok: true };
        case 'dangXuat': return { ok: true };
        case 'doiMatKhau': {
          var p = Phien.lay(); var t2 = p && tim(p.ten);
          if (!t2 || t2.mk !== d.cu) return { ok: false, loi: 'Mật khẩu hiện tại không đúng.' };
          t2.mk = d.moi; this.luu(ds); return { ok: true };
        }
        case 'dsTaiKhoan':
          if (!laAdmin()) return { ok: false, loi: 'Không có quyền.' };
          return { ok: true, ds: ds.map(this.congKhai) };
        case 'themTaiKhoan': {
          if (!laAdmin()) return { ok: false, loi: 'Không có quyền.' };
          var ketQua = [], loi = [];
          (d.ds || []).forEach(function (m) {
            var ten = String(m.ten || '').trim().toLowerCase();
            if (!/^[a-z0-9._-]{2,40}$/.test(ten)) { loi.push(ten + ': tên không hợp lệ'); return; }
            if (tim(ten)) { loi.push(ten + ': đã tồn tại'); return; }
            var mk = m.matKhau || taoMatKhau();
            ds.push({ ten: ten, hoTen: m.hoTen || ten, vaiTro: m.vaiTro || 'hocsinh', lop: m.lop || '', mk: mk, trangThai: 'hoat-dong', ngayTao: new Date().toISOString(), lanCuoi: '', soLan: 0 });
            ketQua.push({ ten: ten, hoTen: m.hoTen || ten, matKhau: mk });
          });
          this.luu(ds); return { ok: true, daTao: ketQua, loi: loi };
        }
        case 'capNhatTaiKhoan': {
          if (!laAdmin()) return { ok: false, loi: 'Không có quyền.' };
          var t3 = tim(d.ten); if (!t3) return { ok: false, loi: 'Không tìm thấy tài khoản.' };
          ['hoTen', 'vaiTro', 'lop', 'trangThai'].forEach(function (k) { if (d[k] !== undefined) t3[k] = d[k]; });
          this.luu(ds); return { ok: true };
        }
        case 'datLaiMatKhau': {
          if (!laAdmin()) return { ok: false, loi: 'Không có quyền.' };
          var t4 = tim(d.ten); if (!t4) return { ok: false, loi: 'Không tìm thấy tài khoản.' };
          t4.mk = d.matKhau || taoMatKhau(); this.luu(ds); return { ok: true, matKhau: t4.mk };
        }
        case 'xoaTaiKhoan': {
          if (!laAdmin()) return { ok: false, loi: 'Không có quyền.' };
          var p2 = Phien.lay(); if (p2 && p2.ten === d.ten) return { ok: false, loi: 'Không thể tự xoá tài khoản đang dùng.' };
          this.luu(ds.filter(function (t) { return t.ten !== d.ten; })); return { ok: true };
        }
        // Khảo sát (chạy thử: lưu trong trình duyệt)
        case 'guiKhaoSat': {
          var p5 = Phien.lay(), t5 = p5 && tim(p5.ten); if (!t5) return { ok: false, loi: 'Chưa đăng nhập.' };
          if (t5.vaiTro !== 'giaovien' && t5.vaiTro !== 'hocsinh') return { ok: false, loi: 'Tài khoản quản trị chỉ xem trước phiếu, không gửi được.' };
          var ks = (doc('mh3d_thu_khaosat') || []).filter(function (o) { return o.ten !== t5.ten; });
          var o5 = { thoiGian: new Date().toISOString(), ten: t5.ten, hoTen: t5.hoTen, vaiTro: t5.vaiTro, lop: t5.lop || '' };
          for (var i5 = 1; i5 <= 10; i5++) { var v5 = (d.traLoi || {})['c' + i5]; o5['c' + i5] = Array.isArray(v5) ? v5.join('; ') : (v5 == null ? '' : /^[1-5]$/.test(String(v5)) ? Number(v5) : String(v5)); }
          ks.push(o5); ghi('mh3d_thu_khaosat', ks); return { ok: true };
        }
        case 'khaoSatCuaToi': {
          var p6 = Phien.lay(), c6 = (doc('mh3d_thu_khaosat') || []).filter(function (o) { return p6 && o.ten === p6.ten; })[0];
          if (!c6) return { ok: true, daGui: false };
          var tl6 = {}; for (var i6 = 1; i6 <= 10; i6++) tl6['c' + i6] = c6['c' + i6];
          return { ok: true, daGui: true, thoiGian: c6.thoiGian, traLoi: tl6 };
        }
        case 'dsKhaoSat':
          if (!laAdmin()) return { ok: false, loi: 'Không có quyền.' };
          return { ok: true, ds: doc('mh3d_thu_khaosat') || [] };
      }
      return { ok: false, loi: 'Hành động không hợp lệ.' };
    },
  };

  function taoMatKhau() {
    var bo = 'abcdefghjkmnpqrstuvwxyz23456789', s = '';
    for (var i = 0; i < 6; i++) s += bo[Math.floor(Math.random() * bo.length)];
    return s;
  }

  /* ---------------- Gọi API ---------------- */
  var API = {
    chayThu: CHAY_THU,
    goi: function (hd, duLieu) {
      duLieu = duLieu || {};
      var p = Phien.lay();
      if (CHAY_THU) {
        return new Promise(function (ok) { setTimeout(function () { ok(MayThu.xuLy(hd, duLieu)); }, 250); });
      }
      var goi = Object.assign({ hd: hd, token: p ? p.token : '' }, duLieu);
      // text/plain để không phát sinh yêu cầu CORS "preflight" với Apps Script
      return fetch(CH.API_URL, { method: 'POST', body: JSON.stringify(goi), redirect: 'follow' })
        .then(function (r) { return r.json(); })
        .then(function (kq) {
          if (kq && kq.hetPhien) { Phien.xoa(); veDangNhap(); }
          return kq;
        })
        .catch(function () { return { ok: false, mang: true, loi: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.' }; });
    },
    taoMatKhau: taoMatKhau,
  };

  /* ---------------- Điều hướng ---------------- */
  // ?het=1 : bị trang khác đẩy về -> trang đăng nhập KHÔNG tự chuyển đi nữa (chống lặp vô hạn)
  function veDangNhap(dangXuat) { location.replace(kemPhien(GOC + 'index.html' + (dangXuat ? '?dangxuat=1' : '?het=1'))); }
  function veThuVien() { location.replace(kemPhien(GOC + 'thu-vien.html')); }

  var DangNhap = {
    GOC: GOC,
    phien: function () { return Phien.lay(); },
    dangNhap: function (ten, matKhau) {
      return API.goi('dangNhap', { ten: ten, matKhau: matKhau }).then(function (kq) {
        if (kq.ok) {
          Phien.luu({ token: kq.token, ten: kq.ten || ten, hoTen: kq.hoTen, vaiTro: kq.vaiTro, lop: kq.lop,
                      hetHan: Date.now() + (CH.GIO_PHIEN || 12) * 3600 * 1000 });
        }
        return kq;
      });
    },
    dangXuat: function () {
      var xong = function () { Phien.xoa(); veDangNhap(true); };
      API.goi('dangXuat').then(xong, xong);
    },
    // Hỏi máy chủ phiên còn hợp lệ không (mất mạng thì vẫn cho dùng tiếp)
    kiemTraMayChu: function () {
      if (CHAY_THU || !Phien.lay()) return;
      API.goi('kiemTra').then(function (kq) {
        if (kq && kq.ok === false && !kq.mang) { Phien.xoa(); veDangNhap(); }
      });
    },
    veThuVien: veThuVien,
  };

  /* ---------------- Bảo vệ trang ---------------- */
  (function baoVe() {
    var p = Phien.lay();
    if (TRANG === 'dang-nhap') {
      if (/[?&]dangxuat=1/.test(location.search)) { Phien.xoa(); return; }
      if (p && !/[?&]het=1/.test(location.search)) veThuVien();
      return;
    }
    if (!p) { veDangNhap(); return; }
    if (VAI_TRO_CAN && p.vaiTro !== VAI_TRO_CAN) { veThuVien(); }
  })();

  /* ---------------- Tiện ích giao diện ---------------- */
  var LOGO = '<svg class="logo" viewBox="0 0 40 40" aria-hidden="true">' +
    '<rect x="1" y="1" width="38" height="38" rx="10" fill="#2451C7"/>' +
    '<path d="M11 15 L22 10 L30 15 L30 27 L19 31 L11 27 Z" fill="#fff" fill-opacity=".16" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M11 15 L19 19 L30 15 M19 19 L19 31" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M22 10 L22 22 L11 27 M22 22 L30 27" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 2" opacity=".75"/></svg>';

  var TEN_VAI_TRO = { admin: 'Quản trị', giaovien: 'Giáo viên', hocsinh: 'Học sinh' };

  function thoatHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var GiaoDien = {
    LOGO: LOGO,
    TEN_VAI_TRO: TEN_VAI_TRO,
    thoat: thoatHtml,
    // Vẽ thanh trên cùng vào phần tử #thanh-tren
    thanhTren: function (tuyChon) {
      tuyChon = tuyChon || {};
      var el = document.getElementById('thanh-tren'); if (!el) return;
      var p = Phien.lay() || {};
      var trai = tuyChon.quayLai
        ? '<a class="nut nho" href="' + tuyChon.quayLai + '" title="Về thư viện"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span class="ten-nd">Thư viện</span></a>'
        : '';
      el.className = 'thanh-tren';
      el.innerHTML = trai +
        '<a class="thuong-hieu" href="' + GOC + 'thu-vien.html">' + LOGO +
        '<span>' + thoatHtml(tuyChon.tieuDe || CH.TEN_SAN_PHAM) + '<small>' + thoatHtml(tuyChon.phuDe || CH.KHAU_HIEU) + '</small></span></a>' +
        '<span class="gian"></span>' +
        '<span class="nguoi-dung"><span class="ten-nd"><b>' + thoatHtml(p.hoTen || '') + '</b></span>' +
        '<span class="huy-hieu">' + thoatHtml(TEN_VAI_TRO[p.vaiTro] || '') + '</span>' +
        (p.vaiTro === 'admin' && !tuyChon.anQuanTri ? '<a class="nut nho" href="' + GOC + 'quan-tri.html">Quản trị</a>' : '') +
        '<button class="nut nho" id="nut-dang-xuat">Đăng xuất</button></span>';
      document.getElementById('nut-dang-xuat').onclick = DangNhap.dangXuat;
      if (CHAY_THU && !document.querySelector('.bang-thu')) {
        var b = document.createElement('div'); b.className = 'bang-thu';
        b.textContent = 'Chế độ chạy thử · chưa nối máy chủ';
        document.body.appendChild(b);
        setTimeout(function () { b.style.opacity = '0'; b.style.transition = 'opacity .6s'; }, 4000);
        setTimeout(function () { b.remove(); }, 4800);
      }
    },
    thongBao: function (noiDung, kieu) {
      var el = document.getElementById('thong-bao');
      if (!el) { el = document.createElement('div'); el.id = 'thong-bao'; document.body.appendChild(el); }
      el.textContent = noiDung; el.className = 'hien ' + (kieu || '');
      clearTimeout(el._t); el._t = setTimeout(function () { el.className = ''; }, 2600);
    },
  };


  /* =====================================================================
     CÔNG THỨC LaTeX (KaTeX, lưu sẵn trong thu-vien-ngoai/katex — chạy không cần mạng)
     Latex.ve(el)      : hiển thị mọi đoạn $...$ nằm trong phần tử el
     Latex.chuoi(tex)  : trả về HTML của công thức (null nếu KaTeX chưa nạp xong)
     Chỉ nạp KaTeX khi trang thật sự có công thức.
     ===================================================================== */
  var Latex = (function () {
    var trangThai = 0, cho = [], khiXong = [];   // 0: chưa nạp, 1: đang nạp, 2: sẵn sàng
    function nap() {
      if (trangThai) return;
      if (window.katex) { trangThai = 2; return; }
      trangThai = 1;
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = GOC + 'thu-vien-ngoai/katex/katex.min.css'; document.head.appendChild(l);
      var sc = document.createElement('script'); sc.src = GOC + 'thu-vien-ngoai/katex/katex.min.js';
      sc.onload = function () { trangThai = 2; var ds = cho; cho = []; ds.forEach(ve); khiXong.forEach(function (f) { f(); }); };
      document.head.appendChild(sc);
    }
    function mot(tex) {
      try { return window.katex.renderToString(tex, { throwOnError: false, output: 'html', strict: 'ignore' }); }
      catch (e) { return tex; }
    }
    function ve(el) {
      if (!el || el.innerHTML.indexOf('$') < 0) return;
      nap();
      if (trangThai !== 2) { if (cho.indexOf(el) < 0) cho.push(el); return; }
      var dsNut = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) if (n.nodeValue.indexOf('$') >= 0 && !(n.parentNode && n.parentNode.closest && n.parentNode.closest('.katex'))) dsNut.push(n);
      dsNut.forEach(function (nut) {
        var phan = nut.nodeValue.split('$');
        if (phan.length < 3) return;
        var span = document.createElement('span'), h = '';
        phan.forEach(function (p, i) {
          if (i % 2 === 1 && i < phan.length - 1) h += mot(p);
          else h += (i % 2 === 1 ? '$' : '') + p.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        });
        span.innerHTML = h;
        nut.parentNode.replaceChild(span, nut);
      });
    }
    return {
      ve: ve,
      chuoi: function (tex) { if (trangThai !== 2) { nap(); return null; } return mot(tex); },
      sanSang: function () { return trangThai === 2; },
      khiXong: function (f) { if (trangThai === 2) f(); else { khiXong.push(f); nap(); } },
    };
  })();

  window.Latex = Latex;
  window.API = API;
  window.DangNhap = DangNhap;
  window.GiaoDien = GiaoDien;
})();
