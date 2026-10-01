/* =====================================================================
   DANH MỤC MÔ HÌNH
   Thêm một mô hình mới = thêm một dòng vào mảng dưới đây.
   trangThai: 'san-sang' (mở được) | 'sap-co' (hiện ô mờ "Sắp có")
   hinh: tên hình minh hoạ trong BIEU_TUONG bên dưới
   ===================================================================== */
window.DANH_MUC = [
  /* ---------- HÌNH HỌC KHÔNG GIAN ---------- */
  { id: 'lap-phuong',        nhom: 'khong-gian', lop: 7, ten: 'Hình lập phương',            moTa: 'Cạnh, diện tích xung quanh, thể tích, trải hình, mặt cắt', duongDan: 'khong-gian/lap-phuong.html', hinh: 'lapPhuong', trangThai: 'san-sang' },
  { id: 'hop-chu-nhat',      nhom: 'khong-gian', lop: 7, ten: 'Hình hộp chữ nhật',          moTa: 'Chiều dài, chiều rộng, chiều cao, thể tích',              duongDan: 'khong-gian/hop-chu-nhat.html', hinh: 'hopChuNhat', trangThai: 'san-sang' },
  { id: 'lang-tru-tam-giac', nhom: 'khong-gian', lop: 7, ten: 'Lăng trụ đứng tam giác',     moTa: 'Mặt đáy, mặt bên, chiều cao',                            duongDan: 'khong-gian/lang-tru-tam-giac.html', hinh: 'langTruTamGiac', trangThai: 'san-sang' },
  { id: 'lang-tru-tu-giac',  nhom: 'khong-gian', lop: 7, ten: 'Lăng trụ đứng tứ giác',      moTa: 'Mặt đáy, mặt bên, chiều cao',                            duongDan: 'khong-gian/lang-tru-tu-giac.html', hinh: 'langTruTuGiac', trangThai: 'san-sang' },
  { id: 'chop-tam-giac-deu', nhom: 'khong-gian', lop: 8, ten: 'Hình chóp tam giác đều',     moTa: 'Cạnh bên, đường cao, trung đoạn',                        duongDan: 'khong-gian/chop-tam-giac-deu.html', hinh: 'chopTamGiac', trangThai: 'san-sang' },
  { id: 'chop-tu-giac-deu',  nhom: 'khong-gian', lop: 8, ten: 'Hình chóp tứ giác đều',      moTa: 'Cạnh bên, đường cao, trung đoạn',                        duongDan: 'khong-gian/chop-tu-giac-deu.html', hinh: 'chopTuGiac', trangThai: 'san-sang' },
  { id: 'hinh-tru',          nhom: 'khong-gian', lop: 9, ten: 'Hình trụ',                   moTa: 'Bán kính đáy, chiều cao, mặt cắt',                       duongDan: 'khong-gian/hinh-tru.html', hinh: 'tru', trangThai: 'san-sang' },
  { id: 'hinh-non',          nhom: 'khong-gian', lop: 9, ten: 'Hình nón',                   moTa: 'Bán kính đáy, chiều cao, đường sinh',                    duongDan: 'khong-gian/hinh-non.html', hinh: 'non', trangThai: 'san-sang' },
  { id: 'hinh-cau',          nhom: 'khong-gian', lop: 9, ten: 'Hình cầu',                   moTa: 'Tâm, bán kính, đường tròn lớn',                          duongDan: 'khong-gian/hinh-cau.html', hinh: 'cau', trangThai: 'san-sang' },

  /* ---------- HÌNH HỌC PHẲNG · LỚP 6 ---------- */
  { id: 'doan-thang',     nhom: 'phang', lop: 6, ten: 'Đoạn thẳng',         moTa: 'Vẽ, đo độ dài bằng thước; trung điểm',  duongDan: 'phang/lop6/doan-thang.html', hinh: 'doanThang', trangThai: 'san-sang' },
  { id: 'goc-l6',         nhom: 'phang', lop: 6, ten: 'Góc',                moTa: 'Tia, đỉnh – cạnh – góc, đo và vẽ góc bằng thước đo góc',  duongDan: 'phang/lop6/goc.html', hinh: 'gocL6', trangThai: 'san-sang' },
  { id: 'tam-giac',       nhom: 'phang', lop: 6, ten: 'Hình tam giác',      moTa: 'Ba cạnh, ba góc, chu vi, diện tích',  duongDan: 'phang/lop6/tam-giac.html', hinh: 'tamGiac', trangThai: 'san-sang' },
  { id: 'tam-giac-deu',   nhom: 'phang', lop: 6, ten: 'Tam giác đều',       moTa: 'Vẽ bằng compa, ê ke 60°; chu vi; đối xứng',  duongDan: 'phang/lop6/tam-giac-deu.html', hinh: 'tamGiacDeu', trangThai: 'san-sang' },
  { id: 'hinh-vuong',     nhom: 'phang', lop: 6, ten: 'Hình vuông',         moTa: 'Vẽ bằng ê ke, gấp cắt giấy, chu vi, diện tích',  duongDan: 'phang/lop6/hinh-vuong.html', hinh: 'vuong', trangThai: 'san-sang' },
  { id: 'luc-giac-deu',   nhom: 'phang', lop: 6, ten: 'Lục giác đều',       moTa: 'Góc 120°, đường chéo chính, cắt ghép 6 tam giác đều',             duongDan: 'phang/lop6/luc-giac-deu.html', hinh: 'lucGiac', trangThai: 'san-sang' },
  { id: 'hinh-chu-nhat',  nhom: 'phang', lop: 6, ten: 'Hình chữ nhật',      moTa: 'Vẽ bằng ê ke, đường chéo, chu vi, diện tích',                    duongDan: 'phang/lop6/hinh-chu-nhat.html', hinh: 'chuNhat', trangThai: 'san-sang' },
  { id: 'hinh-thoi',      nhom: 'phang', lop: 6, ten: 'Hình thoi',          moTa: 'Vẽ bằng thước hai lề, gấp cắt giấy, diện tích',             duongDan: 'phang/lop6/hinh-thoi.html', hinh: 'thoi', trangThai: 'san-sang' },
  { id: 'hinh-binh-hanh', nhom: 'phang', lop: 6, ten: 'Hình bình hành',     moTa: 'Vẽ bằng thước hai lề, cắt ghép thành hình chữ nhật',         duongDan: 'phang/lop6/hinh-binh-hanh.html', hinh: 'binhHanh', trangThai: 'san-sang' },
  { id: 'hinh-thang-can', nhom: 'phang', lop: 6, ten: 'Hình thang cân',     moTa: 'Cạnh bên, đường chéo, gấp cắt giấy, diện tích',          duongDan: 'phang/lop6/hinh-thang-can.html', hinh: 'thangCan', trangThai: 'san-sang' },
  { id: 'doi-xung',       nhom: 'phang', lop: 6, ten: 'Trục và tâm đối xứng', moTa: 'Chữ cái, chữ số, hình SGK, hình thực tế, trò Đoán xem',            duongDan: 'phang/lop6/doi-xung.html', hinh: 'doiXung', trangThai: 'san-sang' },

  /* ---------- HÌNH HỌC PHẲNG · LỚP 7 ---------- */
  { id: 'goc-ke-nhau', nhom: 'phang', lop: 7, ten: 'Hai góc kề nhau', moTa: 'Chung đỉnh, chung một cạnh, cộng số đo', duongDan: 'phang/lop7/goc-ke-nhau.html', hinh: 'gocKeNhau', trangThai: 'san-sang' },
  { id: 'goc-ke-bu', nhom: 'phang', lop: 7, ten: 'Hai góc kề bù', moTa: 'Tổng bằng 180°, tia quay', duongDan: 'phang/lop7/goc-ke-bu.html', hinh: 'gocKeBu', trangThai: 'san-sang' },
  { id: 'goc-doi-dinh', nhom: 'phang', lop: 7, ten: 'Hai góc đối đỉnh', moTa: 'Quay nửa vòng, hai góc bằng nhau', duongDan: 'phang/lop7/goc-doi-dinh.html', hinh: 'gocDoiDinh', trangThai: 'san-sang' },
  { id: 'tia-phan-giac', nhom: 'phang', lop: 7, ten: 'Tia phân giác của một góc', moTa: 'Gấp giấy, vẽ bằng thước đo góc và compa', duongDan: 'phang/lop7/tia-phan-giac.html', hinh: 'tiaPhanGiac', trangThai: 'san-sang' },
  { id: 'hai-duong-song-song', nhom: 'phang', lop: 7, ten: 'Hai đường thẳng song song', moTa: 'Góc so le trong, góc đồng vị, dấu hiệu', duongDan: 'phang/lop7/hai-duong-song-song.html', hinh: 'songSong', trangThai: 'san-sang' },
  { id: 'tong-ba-goc', nhom: 'phang', lop: 7, ten: 'Tổng ba góc của tam giác', moTa: 'Xé ba góc ghép lại thành 180°', duongDan: 'phang/lop7/tong-ba-goc.html', hinh: 'tongBaGoc', trangThai: 'san-sang' },
  { id: 'bang-nhau-ccc', nhom: 'phang', lop: 7, ten: 'Tam giác bằng nhau (c.c.c)', moTa: 'Gộp hình, lật hình, hướng dẫn vẽ', duongDan: 'phang/lop7/bang-nhau-ccc.html', hinh: 'bangNhauCcc', trangThai: 'san-sang' },
  { id: 'bang-nhau-cgc', nhom: 'phang', lop: 7, ten: 'Tam giác bằng nhau (c.g.c)', moTa: 'Gộp hình, lật hình, hướng dẫn vẽ', duongDan: 'phang/lop7/bang-nhau-cgc.html', hinh: 'bangNhauCgc', trangThai: 'san-sang' },
  { id: 'bang-nhau-gcg', nhom: 'phang', lop: 7, ten: 'Tam giác bằng nhau (g.c.g)', moTa: 'Gộp hình, lật hình, hướng dẫn vẽ', duongDan: 'phang/lop7/bang-nhau-gcg.html', hinh: 'bangNhauGcg', trangThai: 'san-sang' },
  { id: 'tam-giac-vuong-bang-nhau', nhom: 'phang', lop: 7, ten: 'Tam giác vuông bằng nhau', moTa: 'Bốn trường hợp bằng nhau của tam giác vuông', duongDan: 'phang/lop7/tam-giac-vuong-bang-nhau.html', hinh: 'vuongBangNhau', trangThai: 'san-sang' },
  { id: 'tam-giac-can', nhom: 'phang', lop: 7, ten: 'Tam giác cân · vuông cân · đều', moTa: 'Tính chất, dấu hiệu, gấp giấy, vẽ bằng compa', duongDan: 'phang/lop7/tam-giac-can.html', hinh: 'tamGiacCan', trangThai: 'san-sang' },
  { id: 'trung-tuyen', nhom: 'phang', lop: 7, ten: 'Đường trung tuyến – Trọng tâm', moTa: 'Ba trung tuyến đồng quy, AG = ⅔ AM', duongDan: 'phang/lop7/trung-tuyen.html', hinh: 'trungTuyen', trangThai: 'san-sang' },
  { id: 'duong-cao', nhom: 'phang', lop: 7, ten: 'Đường cao – Trực tâm', moTa: 'Tam giác nhọn, vuông, tù; vẽ bằng ê ke', duongDan: 'phang/lop7/duong-cao.html', hinh: 'duongCao', trangThai: 'san-sang' },
  { id: 'phan-giac-tam-giac', nhom: 'phang', lop: 7, ten: 'Đường phân giác – Nội tiếp', moTa: 'Giao điểm cách đều ba cạnh, đường tròn nội tiếp', duongDan: 'phang/lop7/phan-giac-tam-giac.html', hinh: 'phanGiacTG', trangThai: 'san-sang' },
  { id: 'trung-truc', nhom: 'phang', lop: 7, ten: 'Đường trung trực', moTa: 'Của đoạn thẳng (MA = MB) và của tam giác, đường tròn ngoại tiếp', duongDan: 'phang/lop7/trung-truc.html', hinh: 'trungTruc', trangThai: 'san-sang' },

  /* ---------- HÌNH HỌC PHẲNG · LỚP 8 ---------- */
  { id: 'pythagore', nhom: 'phang', lop: 8, ten: 'Định lí Pythagore', moTa: 'Định lí thuận và đảo, chứng minh bằng cắt ghép', duongDan: 'phang/lop8/pythagore.html', hinh: 'pythagore', trangThai: 'san-sang' },
  { id: 'l8-tu-giac', nhom: 'phang', lop: 8, ten: 'Tứ giác – Nhận biết', moTa: 'Kéo tự do, tự nhận biết loại tứ giác; tổng bốn góc', duongDan: 'phang/lop8/tu-giac.html', hinh: 'tuGiac', trangThai: 'san-sang' },
  { id: 'l8-hinh-thang', nhom: 'phang', lop: 8, ten: 'Hình thang', moTa: 'Hai đáy song song, đường cao, góc kề cạnh bên', duongDan: 'phang/lop8/hinh-thang.html', hinh: 'thang', trangThai: 'san-sang' },
  { id: 'l8-hinh-thang-can', nhom: 'phang', lop: 8, ten: 'Hình thang cân', moTa: 'Cạnh bên, góc kề đáy, đường chéo bằng nhau', duongDan: 'phang/lop8/hinh-thang-can.html', hinh: 'thangCan', trangThai: 'san-sang' },
  { id: 'l8-hinh-thang-vuong', nhom: 'phang', lop: 8, ten: 'Hình thang vuông', moTa: 'Hai góc vuông, cạnh bên là đường cao', duongDan: 'phang/lop8/hinh-thang-vuong.html', hinh: 'thangVuong', trangThai: 'san-sang' },
  { id: 'l8-hinh-binh-hanh', nhom: 'phang', lop: 8, ten: 'Hình bình hành', moTa: 'Cạnh đối, góc đối, đường chéo; 5 dấu hiệu', duongDan: 'phang/lop8/hinh-binh-hanh.html', hinh: 'binhHanh', trangThai: 'san-sang' },
  { id: 'l8-hinh-chu-nhat', nhom: 'phang', lop: 8, ten: 'Hình chữ nhật', moTa: 'Bốn góc vuông, đường chéo bằng nhau, tam giác vuông', duongDan: 'phang/lop8/hinh-chu-nhat.html', hinh: 'chuNhat', trangThai: 'san-sang' },
  { id: 'l8-trung-tuyen-canh-huyen', nhom: 'phang', lop: 8, ten: 'Trung tuyến ứng với cạnh huyền', moTa: 'Định lí thuận và đảo, áp dụng hình chữ nhật', duongDan: 'phang/lop8/trung-tuyen-canh-huyen.html', hinh: 'trungTuyenHuyen', trangThai: 'san-sang' },
  { id: 'l8-hinh-thoi', nhom: 'phang', lop: 8, ten: 'Hình thoi', moTa: 'Bốn cạnh bằng nhau, đường chéo vuông góc, phân giác', duongDan: 'phang/lop8/hinh-thoi.html', hinh: 'thoi', trangThai: 'san-sang' },
  { id: 'l8-hinh-vuong', nhom: 'phang', lop: 8, ten: 'Hình vuông', moTa: 'Vừa là hình chữ nhật vừa là hình thoi', duongDan: 'phang/lop8/hinh-vuong.html', hinh: 'vuong', trangThai: 'san-sang' },
  { id: 'thales', nhom: 'phang', lop: 8, ten: 'Định lí Thalès', moTa: 'Đoạn thẳng tỉ lệ', duongDan: 'phang/lop8/thales.html', hinh: 'thales', trangThai: 'san-sang' },
  { id: 'duong-trung-binh', nhom: 'phang', lop: 8, ten: 'Đường trung bình', moTa: 'Của tam giác', duongDan: 'phang/lop8/duong-trung-binh.html', hinh: 'trungBinh', trangThai: 'san-sang' },
  { id: 'dong-dang-ccc', nhom: 'phang', lop: 8, ten: 'Tam giác đồng dạng (c.c.c)', moTa: 'Tỉ số k, xoay, lật, gộp hình, hướng dẫn vẽ', duongDan: 'phang/lop8/dong-dang-ccc.html', hinh: 'dongDang', trangThai: 'san-sang' },
  { id: 'dong-dang-cgc', nhom: 'phang', lop: 8, ten: 'Tam giác đồng dạng (c.g.c)', moTa: 'Tỉ số k, xoay, lật, gộp hình, hướng dẫn vẽ', duongDan: 'phang/lop8/dong-dang-cgc.html', hinh: 'dongDang', trangThai: 'san-sang' },
  { id: 'dong-dang-gg', nhom: 'phang', lop: 8, ten: 'Tam giác đồng dạng (g.g)', moTa: 'Tỉ số k, xoay, lật, gộp hình, hướng dẫn vẽ', duongDan: 'phang/lop8/dong-dang-gg.html', hinh: 'dongDang', trangThai: 'san-sang' },
  { id: 'tam-giac-vuong-dong-dang', nhom: 'phang', lop: 8, ten: 'Tam giác vuông đồng dạng', moTa: 'Các trường hợp đồng dạng của tam giác vuông', duongDan: 'phang/lop8/tam-giac-vuong-dong-dang.html', hinh: 'dongDangVuong', trangThai: 'san-sang' },

  /* ---------- HÌNH HỌC PHẲNG · LỚP 9 ---------- */
  { id: 'l9-ti-so-luong-giac', nhom: 'phang', lop: 9, ten: 'Tỉ số lượng giác của góc nhọn', moTa: 'sin, cos, tan, cot; góc đặc biệt; hai góc phụ nhau', duongDan: 'phang/lop9/ti-so-luong-giac.html', hinh: 'tiSoLG', trangThai: 'san-sang' },
  { id: 'l9-duong-tron', nhom: 'phang', lop: 9, ten: 'Đường tròn – Đối xứng', moTa: 'Tâm đối xứng, vô số trục; gấp giấy, điểm chạy', duongDan: 'phang/lop9/duong-tron.html', hinh: 'duongTron', trangThai: 'san-sang' },
  { id: 'l9-goc-o-tam', nhom: 'phang', lop: 9, ten: 'Góc ở tâm – Số đo cung', moTa: 'Cung nhỏ, cung lớn, quét góc', duongDan: 'phang/lop9/goc-o-tam.html', hinh: 'gocOTam', trangThai: 'san-sang' },
  { id: 'l9-do-dai-cung', nhom: 'phang', lop: 9, ten: 'Độ dài cung, hình quạt, vành khuyên', moTa: 'Duỗi cung, quét quạt, khoét hình tròn', duongDan: 'phang/lop9/do-dai-cung.html', hinh: 'hinhQuat', trangThai: 'san-sang' },
  { id: 'l9-vi-tri-duong-thang', nhom: 'phang', lop: 9, ten: 'Đường thẳng và đường tròn', moTa: 'Cắt nhau (cát tuyến), tiếp xúc (tiếp tuyến), không giao', duongDan: 'phang/lop9/vi-tri-duong-thang.html', hinh: 'dtVaDt', trangThai: 'san-sang' },
  { id: 'l9-tiep-tuyen', nhom: 'phang', lop: 9, ten: 'Tiếp tuyến của đường tròn', moTa: 'Tính chất hai tiếp tuyến cắt nhau, cách vẽ', duongDan: 'phang/lop9/tiep-tuyen.html', hinh: 'tiepTuyen', trangThai: 'san-sang' },
  { id: 'l9-vi-tri-hai-duong-tron', nhom: 'phang', lop: 9, ten: 'Vị trí tương đối hai đường tròn', moTa: 'Cho đường tròn di chuyển để nhận biết', duongDan: 'phang/lop9/vi-tri-hai-duong-tron.html', hinh: 'haiDt', trangThai: 'san-sang' },
  { id: 'l9-goc-noi-tiep', nhom: 'phang', lop: 9, ten: 'Góc nội tiếp', moTa: 'Bằng nửa số đo cung bị chắn và các hệ quả', duongDan: 'phang/lop9/goc-noi-tiep.html', hinh: 'gocNoiTiep', trangThai: 'san-sang' },
  { id: 'l9-ngoai-tiep-noi-tiep', nhom: 'phang', lop: 9, ten: 'Đường tròn ngoại tiếp, nội tiếp', moTa: 'Của tam giác; tam giác vuông, tam giác đều', duongDan: 'phang/lop9/ngoai-tiep-noi-tiep.html', hinh: 'ngoaiNoiTiep', trangThai: 'san-sang' },
  { id: 'l9-tu-giac-noi-tiep', nhom: 'phang', lop: 9, ten: 'Tứ giác nội tiếp', moTa: 'Tổng hai góc đối bằng 180°, dấu hiệu', duongDan: 'phang/lop9/tu-giac-noi-tiep.html', hinh: 'tuGiacNT', trangThai: 'san-sang' },
  { id: 'l9-da-giac-deu', nhom: 'phang', lop: 9, ten: 'Đa giác đều và phép quay', moTa: 'Phép quay giữ nguyên đa giác đều', duongDan: 'phang/lop9/da-giac-deu.html', hinh: 'daGiacDeu', trangThai: 'san-sang' },
];

/* =====================================================================
   HÌNH MINH HOẠ NHỎ CHO TỪNG Ô (SVG, khung 120 × 90)
   ===================================================================== */
(function () {
  var N = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  var K = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 4" opacity=".6"';
  var T = 'fill="currentColor" fill-opacity=".12" stroke="none"';
  function p(d, a) { return '<path d="' + d + '" ' + (a || N) + '/>'; }
  window.BIEU_TUONG = {
    lapPhuong: p('M34 34 L64 34 L64 72 L34 72 Z M34 34 L50 20 L80 20 L64 34 M80 20 L80 58 L64 72', N) + p('M34 34 H64 V72 H34 Z', T) + p('M34 72 L50 58 L80 58 M50 58 L50 20', K),
    hopChuNhat: p('M22 38 L72 38 L72 72 L22 72 Z M22 38 L44 22 L94 22 L72 38 M94 22 L94 56 L72 72') + p('M22 72 L44 56 L94 56 M44 56 L44 22', K),
    langTruTamGiac: p('M30 30 L94 40 L78 24 Z M30 30 V74 L94 82 V40') + p('M30 74 L78 68 L94 82 M78 24 V68', K),
    langTruTuGiac: p('M24 36 L66 36 L66 76 L24 76 Z M24 36 L46 20 L98 24 L66 36 M98 24 L98 62 L66 76') + p('M24 76 L46 60 L98 62 M46 60 L46 20', K),
    chopTamGiac: p('M60 12 L26 72 L90 80 Z M60 12 L100 60 L90 80') + p('M26 72 L100 60', K),
    chopTuGiac: p('M60 12 L22 64 L74 78 Z M60 12 L102 60 L74 78') + p('M22 64 L50 50 L102 60 M60 12 L50 50', K),
    tru: p('M34 22 L34 70 M86 22 L86 70') + '<ellipse cx="60" cy="22" rx="26" ry="8" ' + N + '/>' + p('M34 70 A26 8 0 0 0 86 70') + p('M34 70 A26 8 0 0 1 86 70', K),
    non: p('M60 12 L32 70 M60 12 L88 70') + p('M32 70 A28 9 0 0 0 88 70') + p('M32 70 A28 9 0 0 1 88 70', K),
    cau: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M28 46 A32 10 0 0 0 92 46') + p('M28 46 A32 10 0 0 1 92 46', K),
    tamGiacDeu: p('M60 14 L96 76 L24 76 Z') + p('M60 14 L96 76 L24 76 Z', T),
    tamGiac: p('M44 14 L100 76 L18 76 Z') + p('M44 14 L100 76 L18 76 Z', T) + p('M44 14 V76', K),
    doanThang: p('M16 50 H104') + '<circle cx="16" cy="50" r="5" fill="currentColor"/><circle cx="104" cy="50" r="5" fill="currentColor"/><circle cx="60" cy="50" r="4" fill="currentColor"/>' + p('M12 62 H108 V76 H12 Z M24 62 v6 M36 62 v6 M48 62 v6 M60 62 v9 M72 62 v6 M84 62 v6 M96 62 v6', K),
    gocL6: p('M20 76 H108 M20 76 L84 16') + p('M50 76 a30 30 0 0 0 -8 -21', K) + '<circle cx="20" cy="76" r="5" fill="currentColor"/>',
    vuong: p('M32 16 H90 V74 H32 Z') + p('M32 16 L90 74', K),
    lucGiac: p('M40 14 H80 L100 46 L80 78 H40 L20 46 Z') + p('M40 14 L80 78 M80 14 L40 78 M20 46 H100', K),
    chuNhat: p('M18 24 H102 V70 H18 Z') + p('M18 24 H102 V70 H18 Z', T),
    thoi: p('M60 10 L96 46 L60 82 L24 46 Z') + p('M60 10 V82 M24 46 H96', K),
    binhHanh: p('M36 22 H104 L84 72 H16 Z') + p('M36 22 V72', K),
    thangCan: p('M40 22 H80 L102 72 H18 Z') + p('M40 22 V72', K),
    doiXung: p('M60 8 V84', K) + p('M60 18 L28 44 L40 74 H60 M60 18 L92 44 L80 74 H60'),
    gocDoiDinh: p('M14 72 L106 20 M20 24 L100 70') + p('M52 44 m-10 5 a12 12 0 0 1 -1 -9', N),
    songSong: p('M10 30 H110 M10 64 H110 M40 10 L80 84'),
    tongBaGoc: p('M24 76 L58 16 L100 76 Z') + p('M32 76 a8 8 0 0 0 -4 -7 M92 76 a8 8 0 0 1 4 -7 M54 23 a8 8 0 0 0 9 0', N),
    gocKeNhau: p('M18 76 H106 M18 76 L98 34 M18 76 L56 12') + p('M42 76 a24 24 0 0 0 -2 -11 M38 64 a24 24 0 0 0 -7 -9', N),
    gocKeBu: p('M8 70 H112 M60 70 L86 16') + p('M78 70 a18 18 0 0 0 -10 -16 M52 70 a8 8 0 0 1 12 -7', N),
    tiaPhanGiac: p('M18 76 H106 M18 76 L66 10') + p('M18 76 L104 34', K) + p('M44 76 a26 26 0 0 0 -3 -12 M40 64 a26 26 0 0 0 -7 -9', N),
    bangNhauCcc: p('M8 76 L30 24 L54 76 Z M66 76 L88 24 L112 76 Z') + p('M17 48 l5 3 M44 48 l-5 3 M31 72 v8 M75 48 l5 3 M102 48 l-5 3 M89 72 v8', N),
    bangNhauCgc: p('M8 76 L30 24 L54 76 Z M66 76 L88 24 L112 76 Z') + p('M17 48 l5 3 M75 48 l5 3 M31 72 v8 M89 72 v8', N) + p('M18 76 a10 10 0 0 0 -4 -9 M76 76 a10 10 0 0 0 -4 -9', N),
    bangNhauGcg: p('M8 76 L30 24 L54 76 Z M66 76 L88 24 L112 76 Z') + p('M31 72 v8 M89 72 v8', N) + p('M18 76 a10 10 0 0 0 -4 -9 M44 76 a10 10 0 0 1 4 -9 M76 76 a10 10 0 0 0 -4 -9 M102 76 a10 10 0 0 1 4 -9', N),
    vuongBangNhau: p('M10 78 V24 L52 78 Z M68 78 V24 L110 78 Z') + p('M10 70 h8 v8 M68 70 h8 v8', N),
    trungTuyen: p('M16 78 L52 12 L104 78 Z') + p('M52 12 L60 78 M16 78 L78 45 M104 78 L34 45', K) + '<circle cx="57" cy="56" r="4" fill="currentColor"/>',
    duongCao: p('M16 78 L44 12 L104 78 Z') + p('M44 12 V78', K) + p('M44 70 h8 v8', N),
    phanGiacTG: p('M16 78 L50 12 L104 78 Z') + '<circle cx="52" cy="56" r="17" ' + N + '/>',
    trungTruc: p('M14 62 H106 M60 10 V86') + p('M60 54 h8 v8 M34 58 v8 M86 58 v8', N),
    thang: p('M36 24 H84 L106 72 H14 Z') + p('M36 24 V72', K),
    thangVuong: p('M20 24 H70 L104 72 H20 Z') + p('M20 64 h8 v8 M20 32 h8 v-8', N),
    dongDangVuong: p('M10 80 V50 L34 80 Z M58 80 V24 L108 80 Z') + p('M10 74 h6 v6 M58 72 h8 v8', N),
    tiSoLG: p('M14 76 H96 V22 Z') + p('M88 76 v-8 h8', N) + p('M34 76 a20 20 0 0 0 -2 -10', N),
    duongTron: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M60 8 V84 M22 46 H98', K) + '<circle cx="60" cy="46" r="3" fill="currentColor"/>',
    gocOTam: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M60 46 L92 46 M60 46 L76 18') + p('M76 46 a16 16 0 0 0 -8 -14', N),
    hinhQuat: p('M60 46 L92 46 A32 32 0 0 0 44 18 Z') + p('M60 46 L92 46 A32 32 0 0 0 44 18 Z', T) + p('M92 46 A32 32 0 1 1 44 18', K),
    dtVaDt: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M8 20 H112 M8 78 H112') + p('M8 50 H112', K),
    tiepTuyen: '<circle cx="44" cy="46" r="26" ' + N + '/>' + p('M108 46 L40 20.5 M108 46 L40 71.5') + p('M44 46 L108 46', K),
    haiDt: '<circle cx="44" cy="46" r="28" ' + N + '/><circle cx="84" cy="46" r="20" ' + N + '/>',
    gocNoiTiep: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M48 16 L32 60 M48 16 L90 58'),
    ngoaiNoiTiep: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M60 14 L32 62 L88 62 Z'),
    tuGiacNT: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M36 26 L88 28 L84 72 L30 60 Z'),
    daGiacDeu: '<circle cx="60" cy="46" r="32" ' + N + '/>' + p('M92 46 L76 73.7 L44 73.7 L28 46 L44 18.3 L76 18.3 Z'),
    trungTuyenHuyen: '<circle cx="60" cy="58" r="30" ' + K + '/>' + p('M30 58 H90 L42 32 Z') + p('M60 58 L42 32', N) + p('M42 40 l6 -3 l3 6', N),
    tamGiacCan: p('M60 12 L94 78 L26 78 Z') + p('M60 12 V78', K) + p('M41 44 l5 3 M79 44 l-5 3'),
    dongQuy: p('M20 78 L60 12 L102 78 Z') + p('M20 78 L81 45 M102 78 L40 45 M60 12 L61 78', K),
    pythagore: p('M46 58 L46 38 L72 58 Z') + p('M46 58 L46 38 L26 38 L26 58 Z M46 58 L72 58 L72 84 L46 84 Z M46 38 L66 12 L92 32 L72 58'),
    tuGiac: p('M22 70 L38 20 L96 26 L104 72 Z') + p('M22 70 L96 26 M38 20 L104 72', K),
    thales: p('M20 80 L60 10 L104 80 Z') + p('M40 45 H82'),
    trungBinh: p('M20 80 L50 12 L104 80 Z') + p('M35 46 H77') + '<circle cx="35" cy="46" r="3" fill="currentColor"/><circle cx="77" cy="46" r="3" fill="currentColor"/>',
    dongDang: p('M10 80 L25 50 L36 80 Z M62 80 L92 20 L114 80 Z'),
  };
})();
