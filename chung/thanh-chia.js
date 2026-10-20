/* =====================================================================
   THANH CHIA GIỮA KHUNG HÌNH VÀ BẢNG BÊN PHẢI
   Kéo thanh sang trái/phải để đổi bề rộng bảng; bấm đúp để về mặc định.
   Bề rộng được nhớ cho lần mở sau (trên máy này).
   ===================================================================== */
(function () {
  var KHOA = 'geolab_rong_bang', MAC_DINH = 372, NHO_NHAT = 260, CHUA_HINH = 320;
  function doc() { try { return +localStorage.getItem(KHOA) || 0; } catch (e) { return 0; } }
  function ghi(v) { try { if (v) localStorage.setItem(KHOA, String(Math.round(v))); else localStorage.removeItem(KHOA); } catch (e) {} }

  function gan() {
    var mh = document.getElementById('mh');
    if (!mh || mh.querySelector('.mh-chia')) return;
    var thanh = document.createElement('div');
    thanh.className = 'mh-chia';
    thanh.setAttribute('role', 'separator');
    thanh.setAttribute('aria-orientation', 'vertical');
    thanh.setAttribute('aria-label', 'Kéo để đổi bề rộng bảng bên phải');
    thanh.title = 'Kéo để đổi bề rộng bảng · bấm đúp để về mặc định';
    thanh.tabIndex = 0;
    thanh.innerHTML = '<span class="mh-chia-nam"></span>';
    mh.appendChild(thanh);

    function gioiHan(w) { var tong = mh.clientWidth; return Math.max(NHO_NHAT, Math.min(w, Math.max(NHO_NHAT, tong - CHUA_HINH))); }
    function datRong(w, luu) {
      if (!w) { mh.style.removeProperty('--rong-bang'); if (luu) ghi(0); return; }
      w = gioiHan(w); mh.style.setProperty('--rong-bang', w + 'px'); if (luu) ghi(w);
    }
    function rongHienTai() { var b = document.getElementById('mh-bang'); return b ? b.getBoundingClientRect().width : MAC_DINH; }
    datRong(doc(), false);

    var dangKeo = false;
    thanh.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dangKeo = true; thanh.setPointerCapture(e.pointerId);
      document.body.classList.add('dang-chia'); e.preventDefault();
    });
    thanh.addEventListener('pointermove', function (e) {
      if (!dangKeo) return;
      datRong(mh.getBoundingClientRect().right - e.clientX, false);
    });
    function tha(e) {
      if (!dangKeo) return;
      dangKeo = false; document.body.classList.remove('dang-chia');
      try { thanh.releasePointerCapture(e.pointerId); } catch (x) {}
      ghi(rongHienTai());
    }
    thanh.addEventListener('pointerup', tha);
    thanh.addEventListener('pointercancel', tha);
    thanh.addEventListener('dblclick', function () { datRong(0, true); });
    // Bàn phím: mũi tên trái/phải đổi 20px
    thanh.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowLeft' ? 20 : e.key === 'ArrowRight' ? -20 : 0;
      if (!d) return; e.preventDefault(); datRong(rongHienTai() + d, true);
    });
    // Cửa sổ thu nhỏ: giữ bảng không lấn hết khung hình
    window.addEventListener('resize', function () { var v = doc(); if (v) datRong(v, false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', gan); else gan();
})();
