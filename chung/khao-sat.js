/* =====================================================================
   PHIẾU KHẢO SÁT SAU TRẢI NGHIỆM — câu hỏi dùng chung cho trang khảo sát
   và trang kết quả. Muốn sửa câu hỏi: sửa ở đây (giữ nguyên mã c1, c2…).
     loai 'thang' : thang 1–5 (1 = Hoàn toàn không đồng ý … 5 = Hoàn toàn đồng ý)
     loai 'chon'  : chọn nhiều phương án
     loai 'mo'    : câu trả lời tự do (không bắt buộc)
   ===================================================================== */
window.KHAO_SAT = {
  THANG: ['Hoàn toàn không đồng ý', 'Không đồng ý', 'Phân vân', 'Đồng ý', 'Hoàn toàn đồng ý'],

  giaovien: {
    tieuDe: 'Phiếu khảo sát dành cho giáo viên',
    loiDan: 'Sau khi trải nghiệm GeoLab, thầy/cô vui lòng cho biết mức độ đồng ý với mỗi nhận định dưới đây. Phiếu gồm 8 câu, mất khoảng 2 phút. Xin cảm ơn thầy/cô!',
    cau: [
      { ma: 'c1', loai: 'thang', nd: 'GeoLab giúp tôi minh hoạ hình học trực quan, rõ ràng hơn so với vẽ hình trên bảng.' },
      { ma: 'c2', loai: 'thang', nd: 'Nội dung các mô hình chính xác, phù hợp với chương trình và SGK Toán THCS hiện hành.' },
      { ma: 'c3', loai: 'thang', nd: 'GeoLab giúp tôi tiết kiệm thời gian chuẩn bị bài và vẽ hình khi dạy.' },
      { ma: 'c4', loai: 'thang', nd: 'Khi tôi dùng GeoLab, học sinh hiểu bài và nắm tính chất, công thức nhanh hơn.' },
      { ma: 'c5', loai: 'thang', nd: 'Học sinh hứng thú và tích cực tham gia tiết học hơn.' },
      { ma: 'c6', loai: 'thang', nd: 'GeoLab dễ sử dụng, thao tác thuận tiện khi trình chiếu trên lớp.' },
      { ma: 'c7', loai: 'thang', nd: 'Tôi sẽ tiếp tục sử dụng GeoLab trong dạy học và giới thiệu cho đồng nghiệp.' },
      { ma: 'c8', loai: 'mo', nd: 'Góp ý của thầy/cô để GeoLab hỗ trợ việc dạy tốt hơn (bài học, tính năng muốn bổ sung…).' },
    ],
  },

  hocsinh: {
    tieuDe: 'Phiếu khảo sát dành cho học sinh',
    loiDan: 'Sau khi học với GeoLab, em hãy cho biết mức độ đồng ý của em với mỗi ý dưới đây. Phiếu gồm 8 câu, chỉ mất khoảng 2 phút. Cảm ơn em!',
    cau: [
      { ma: 'c1', loai: 'thang', nd: 'Nhờ GeoLab, em dễ hình dung các hình hơn (nhất là hình không gian).' },
      { ma: 'c2', loai: 'thang', nd: 'Kéo, xoay hình và xem hoạt hình giúp em hiểu tính chất, công thức rõ hơn.' },
      { ma: 'c3', loai: 'thang', nd: 'Em có thể dùng GeoLab để tự học, tự ôn bài ở nhà.' },
      { ma: 'c4', loai: 'thang', nd: 'Em thấy hứng thú hơn với môn Hình học khi học cùng GeoLab.' },
      { ma: 'c5', loai: 'thang', nd: 'GeoLab dễ sử dụng đối với em.' },
      { ma: 'c6', loai: 'thang', nd: 'Em muốn thầy cô sử dụng GeoLab thường xuyên hơn trong giờ học.' },
      { ma: 'c7', loai: 'chon', nd: 'Tính năng nào giúp em học tốt nhất? (chọn một hoặc nhiều)',
        ds: ['Xoay, phóng to hình khối 3D', 'Kéo điểm để thay đổi hình', 'Hoạt hình dựng hình, cắt ghép, chứng minh', 'Nút làm nổi bật cạnh, góc, công thức', 'Số đo và công thức tự cập nhật'] },
      { ma: 'c8', loai: 'mo', nd: 'Em muốn góp ý gì để GeoLab giúp em học tốt hơn?' },
    ],
  },
};
