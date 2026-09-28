/* =====================================================================
   CẤU HÌNH CHUNG — anh chỉ cần sửa tệp này khi đổi tên, tác giả, API
   ===================================================================== */
window.CAU_HINH = {
  // Tên sản phẩm (hiện ở trang bìa, thanh trên cùng, tiêu đề tab)
  TEN_SAN_PHAM: 'Mô hình hình học tương tác cho học sinh Trung học cơ sở',
  TEN_NGAN: 'Hình học tương tác',   // dùng cho tiêu đề tab trình duyệt
  KHAU_HIEU: 'Nhóm nghiên cứu khoa học · Trường TH-THCS An Lạc',

  // Thông tin tác giả
  TAC_GIA: [
    { vaiTro: 'Học sinh', ten: 'Nguyễn Khuê (lớp 9.1)' },
    { vaiTro: 'Học sinh', ten: 'Trần Quang Huy (lớp 9.7)' },
    { vaiTro: 'Giáo viên hướng dẫn', ten: 'Cô Đinh Thanh Tuyền (GVBM Toán)' },
  ],
  DON_VI: 'Nhóm nghiên cứu khoa học trường TH-THCS An Lạc',
  NAM_HOC: '2026 – 2027',

  // Địa chỉ Apps Script (web app). ĐỂ TRỐNG = CHẠY THỬ, không cần mạng:
  //   tài khoản mẫu  admin / admin123  ·  gv / gv123  ·  hs / hs123
  API_URL: 'https://script.google.com/macros/s/AKfycbyDF-5Rkt6jlgPU1SoAExgp3gzU7hmgel7WP8cMqKc0YclwLS-eGdHNXCyhlzcwYu72RQ/exec',

  // Phiên đăng nhập giữ trong bao nhiêu giờ
  GIO_PHIEN: 12,
};
