/* =====================================================================
   MÀN CHÀO HOẠT HÌNH (chạy giống GeoInk): logo hình lập phương tự vẽ từng cạnh
   ở giữa màn hình, trượt sang trái, chữ GeoLab hiện ra bên phải; nền xanh có các
   hình học mờ trôi nhẹ ở nhiều góc nghiêng. Mỗi lần mở (mỗi phiên) chạy một lần,
   khoảng 4,2 giây; bấm vào để bỏ qua.
   ===================================================================== */
(function () {
  'use strict';
  try { if (sessionStorage.getItem('gl_da_chao')) return; } catch (e) { }
  // trang đăng nhập mà đã có phiên: trang sẽ tự chuyển sang thư viện, để thư viện chào
  if (/index\.html$|\/$/.test(location.pathname) && window.DangNhap && window.DangNhap.phien()) return;
  try { sessionStorage.setItem('gl_da_chao', '1'); } catch (e) { }

  var css = '' +
    '#gl-chao{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;overflow:hidden;' +
    'background:radial-gradient(circle at 18% 22%,rgba(255,255,255,.16) 0,rgba(255,255,255,0) 42%),radial-gradient(circle at 85% 80%,rgba(252,211,77,.20) 0,rgba(252,211,77,0) 40%),linear-gradient(150deg,#2A55C8 0%,#3264D6 50%,#3D74E4 100%);' +
    'transition:opacity .45s ease;font-family:"Be Vietnam Pro","Segoe UI",Roboto,Arial,sans-serif}' +
    '#gl-chao.xong{opacity:0;pointer-events:none}' +
    '#gl-chao .gc-nen{position:absolute;inset:0;pointer-events:none}' +
    '#gl-chao .gc-nen svg{position:absolute;fill:none;stroke:#fff;stroke-opacity:.16;stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;opacity:0;animation:gcNenHien 1.2s ease-out forwards,gcTroi 9s ease-in-out infinite alternate}' +
    '#gl-chao .gc-hang{position:relative;display:flex;align-items:center;--dx:0px}' +
    '#gl-chao .gc-truot{flex:none;position:relative;z-index:2;transform:translate3d(var(--dx),0,0);animation:gcVeGiua 1s 2.3s cubic-bezier(.65,0,.35,1) forwards}' +
    '#gl-chao .gc-logo{position:relative;width:min(34vmin,300px);height:min(34vmin,300px);animation:gcHien .9s cubic-bezier(.34,1.56,.64,1) both}' +
    '#gl-chao .gc-logo::before{content:"";position:absolute;inset:4%;border-radius:22%;box-shadow:0 20px 44px rgba(10,30,100,.45)}' +
    '#gl-chao .gc-logo svg{position:relative;display:block;width:100%;height:100%}' +
    '#gl-chao .gc-canh{stroke-dasharray:100;stroke-dashoffset:100;opacity:0;animation:gcVe .8s ease-out forwards}' +
    '#gl-chao .gc-an{opacity:0;animation:gcHienChu .6s 1.55s ease-out forwards}' +
    '#gl-chao .gc-dinh circle{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:gcCham .4s cubic-bezier(.34,1.56,.64,1) forwards}' +
    '#gl-chao .gc-chu{flex:none;position:relative;z-index:1;white-space:nowrap;opacity:0;transform:translate3d(calc(var(--dx) * -.35),0,0);animation:gcChuVao 1s 2.4s cubic-bezier(.22,1,.36,1) forwards}' +
    '#gl-chao .gc-ten{display:block;padding-left:4.5vmin;font-weight:800;font-size:min(15vmin,132px);line-height:1.05;letter-spacing:-.02em;color:#fff;text-shadow:0 6px 24px rgba(10,30,100,.35)}' +
    '#gl-chao .gc-ten b{color:#FCD34D;font-weight:800}' +
    '#gl-chao .gc-phu{display:block;padding:1.6vmin 0 0 5vmin;font-weight:600;font-size:min(3.1vmin,27px);line-height:1.3;color:rgba(255,255,255,.88);opacity:0;animation:gcHienChu .6s 3.1s ease-out forwards}' +
    '#gl-chao .gc-phu i{color:#FCD34D}' +
    '@keyframes gcHien{from{opacity:0;transform:scale(.3) rotate(-14deg)}to{opacity:1;transform:none}}' +
    '@keyframes gcVe{from{stroke-dashoffset:100;opacity:1}to{stroke-dashoffset:0;opacity:1}}' +
    '@keyframes gcCham{to{transform:scale(1)}}' +
    '@keyframes gcVeGiua{to{transform:translate3d(0,0,0)}}' +
    '@keyframes gcChuVao{0%,30%{opacity:0}100%{opacity:1;transform:translate3d(0,0,0)}}' +
    '@keyframes gcHienChu{to{opacity:1}}' +
    '@keyframes gcNenHien{to{opacity:1}}' +
    '@keyframes gcTroi{from{translate:0 0}to{translate:0 22px}}' +
    '@media (prefers-reduced-motion:reduce){#gl-chao *{animation-duration:.01s!important;animation-delay:0s!important}}';

  // các hình nền mờ: [loại, trái %, trên %, cỡ px, góc nghiêng]
  var D = 'stroke-dasharray="5 5"';
  var HINH = {
    tamGiac: '<path d="M50 8 L92 86 H8 Z M50 8 V86"/><path d="M50 78 h8 v8"/>',
    tron: '<circle cx="50" cy="50" r="42"/><path d="M8 50 H92" ' + D + '/><circle cx="50" cy="50" r="2" fill="#fff" fill-opacity=".3"/>',
    lapPhuong: '<path d="M14 34 h50 v50 h-50 z M14 34 l20 -18 h50 l-20 18 M84 16 v50 l-20 18"/><path d="M34 16 v50 l-20 18 M34 66 h50" ' + D + '/>',
    tru: '<ellipse cx="50" cy="16" rx="30" ry="9"/><path d="M20 16 V84 M80 16 V84 M20 84 A30 9 0 0 0 80 84"/><path d="M20 84 A30 9 0 0 1 80 84" ' + D + '/>',
    non: '<path d="M50 8 L16 82 M50 8 L84 82 M16 82 A34 10 0 0 0 84 82"/><path d="M16 82 A34 10 0 0 1 84 82 M50 8 V82 H84" ' + D + '/>',
    chop: '<path d="M50 6 L10 72 L56 92 L92 66 Z M50 6 L56 92"/><path d="M10 72 L46 54 L92 66 M50 6 L46 54" ' + D + '/>',
    lucGiac: '<path d="M8 50 L29 14 H71 L92 50 L71 86 H29 Z"/><path d="M8 50 H92 M29 14 L71 86 M71 14 L29 86" ' + D + '/>',
    cau: '<circle cx="50" cy="50" r="42"/><ellipse cx="50" cy="50" rx="42" ry="12"/><path d="M50 8 V50 H92" ' + D + '/>',
    binhHanh: '<path d="M8 76 L34 22 H92 L66 76 Z M34 22 V76"/><path d="M34 68 h8 v8"/>',
    thang: '<path d="M8 78 L30 24 H72 L92 78 Z"/><path d="M30 24 L92 78 M72 24 L8 78" ' + D + '/>',
    goc: '<path d="M10 80 H92 M10 80 L74 20"/><path d="M36 80 A26 26 0 0 0 29 62"/>',
    quat: '<path d="M8 80 H92 A42 42 0 0 0 8 80 Z M50 80 L80 50"/>',
    thoi: '<path d="M50 6 L86 50 L50 94 L14 50 Z"/><path d="M50 6 V94 M14 50 H86" ' + D + '/>'
  };
  var DAT = [['tamGiac', 6, 10, 120, -14], ['lapPhuong', 24, 64, 130, 12], ['tron', 76, 8, 110, 0], ['chop', 86, 58, 140, -22],
    ['lucGiac', 44, 4, 90, 24], ['tru', 4, 58, 110, -10], ['non', 64, 70, 120, 18], ['cau', 34, 30, 70, 0], ['binhHanh', 58, 30, 100, -28],
    ['thang', 14, 34, 90, 32], ['goc', 82, 34, 90, 40], ['quat', 44, 80, 100, -16], ['thoi', 92, 6, 70, 38], ['tamGiac', 70, 46, 70, 64]];

  // logo hình lập phương (giống biểu tượng app): mỗi cạnh tự vẽ lần lượt
  var CANH = [['M11 15 L22 10', .55], ['M22 10 L30 15', .7], ['M30 15 L30 27', .85], ['M30 27 L19 31', 1], ['M19 31 L11 27', 1.1], ['M11 27 L11 15', 1.2],
    ['M11 15 L19 19', 1.3], ['M19 19 L30 15', 1.4], ['M19 19 L19 31', 1.45]];
  var DINH = [[22, 10, .65], [30, 15, .8], [30, 27, .95], [19, 31, 1.05], [11, 27, 1.15], [11, 15, .55], [19, 19, 1.5]];
  var logo = '<svg viewBox="0 0 1024 1024"><defs><linearGradient id="gc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2453C7"/><stop offset="1" stop-color="#183A98"/></linearGradient></defs>' +
    '<rect x="40" y="40" width="945" height="945" rx="200" fill="url(#gc-g)"/>' +
    '<g transform="translate(512 512) scale(27) translate(-20.5 -20.5)" stroke-linejoin="round" stroke-linecap="round">' +
    '<path class="gc-an" d="M11 15 L22 10 L30 15 L30 27 L19 31 L11 27 Z" fill="#fff" fill-opacity=".14" stroke="none"/>' +
    '<path class="gc-an" d="M22 10 L22 22 L11 27 M22 22 L30 27" fill="none" stroke="#FACC15" stroke-width="1.2" stroke-dasharray="1.6 1.6"/>' +
    CANH.map(function (c) { return '<path class="gc-canh" d="' + c[0] + '" pathLength="100" fill="none" stroke="#fff" stroke-width="1.7" style="animation-delay:' + c[1] + 's"/>'; }).join('') +
    '<g class="gc-dinh" fill="#fff">' + DINH.map(function (d) { return '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="1.5" style="animation-delay:' + d[2] + 's"/>'; }).join('') + '</g>' +
    '</g></svg>';

  function chay() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var m = document.createElement('div'); m.id = 'gl-chao'; m.setAttribute('aria-hidden', 'true');
    m.innerHTML = '<div class="gc-nen">' + DAT.map(function (h, i) {
      return '<svg viewBox="0 0 100 100" style="left:' + h[1] + '%;top:' + h[2] + '%;width:' + h[3] + 'px;height:' + h[3] + 'px;transform:rotate(' + h[4] + 'deg);animation-delay:' + (i * .06) + 's,' + (-i * .9) + 's">' + HINH[h[0]] + '</svg>';
    }).join('') + '</div>' +
      '<div class="gc-hang"><div class="gc-truot"><div class="gc-logo">' + logo + '</div></div>' +
      '<div class="gc-chu"><span class="gc-ten">Geo<b>Lab</b></span><span class="gc-phu">Hình học tương tác THCS · <i>Từ trực quan đến khám phá</i></span></div></div>';
    document.body.appendChild(m);
    // lúc đầu logo nằm giữa: dời sang phải nửa bề rộng phần chữ, rồi CSS trượt về chỗ
    var hang = m.querySelector('.gc-hang'), chu = m.querySelector('.gc-chu');
    hang.style.setProperty('--dx', Math.round(chu.getBoundingClientRect().width / 2) + 'px');
    var tat = function () { if (!m) return; var x = m; m = null; x.classList.add('xong'); setTimeout(function () { x.remove(); st.remove(); }, 500); };
    var hen = setTimeout(tat, 4200);
    m.addEventListener('pointerdown', function () { clearTimeout(hen); tat(); });
  }
  if (document.body) chay(); else document.addEventListener('DOMContentLoaded', chay);
})();
