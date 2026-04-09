# Individual reflection — Quách Gia Được (2A202600423)

## 1. Role cụ thể
Phụ trách chính mảng kiến trúc dữ liệu, thu thập, làm sạch và chuẩn hóa toàn bộ hệ thống Mock Data để AI Agent có thể truy xuất và suy luận chính xác.

## 2. Phần phụ trách cụ thể
- Thu thập dữ liệu thực tế: Trích xuất dữ liệu Thời khóa biểu (TKB) học kỳ 20252, chương trình đào tạo (CTTT) và các điều kiện tiên quyết dự kiến.
- Thiết kế và xử lý dữ liệu: Trực tiếp xây dựng cấu trúc và chuyển đổi dữ liệu thô (từ CSV/Text) sang các định dạng JSON chuẩn (`courses.json`, `schedule.json`, `prerequisites.json`, `curriculum-cttt.json`).
- Đảm bảo tính tương thích: Tinh chỉnh schema dữ liệu sinh viên (`student.json`, `user-course-mock.json`) cho khớp với dữ liệu môn học, đảm bảo không xảy ra lỗi referential integrity (toàn vẹn tham chiếu) khi hệ thống truy vấn.

## 3. SPEC mạnh/yếu
- **Phần mạnh nhất:** User Stories 4 paths. Nhóm đã cover rất kĩ các flow thực tế (happy path, lịch trùng, thiếu tiên quyết), kết hợp mô phỏng đúng dữ liệu và rule đăng ký của trường nên các kịch bản error/correction rất sát thực tế.
- **Phần yếu nhất:** Eval metrics + threshold. Nhóm mới dừng ở việc định nghĩa các metric lý thuyết (nhấn mạnh Precision để tránh đăng ký nhầm), nhưng chưa có một framework tự động / dataset đủ lớn để đánh giá recall/precision của Agent trên diện rộng trừ các scenario test bằng tay.

## 4. Đóng góp cụ thể khác
- **Tham gia test chéo (QA):** Thử nghiệm các prompt nhập lịch phức tạp (tránh học sáng, thích nghỉ thứ 6) để kiểm tra xem Agent lấy data từ JSON có bị hallucinate (bịa ra lớp học không tồn tại) hay không.
- **Làm sạch và tối ưu hóa dữ liệu:** Trực tiếp viết script xử lý và dọn dẹp hơn 4000 dòng ghi chú rác trong các cấu trúc gốc của `courses.json` và `prerequisites.json` để Agent không bị nhiễu thông tin ngữ cảnh khi truy xuất và suy luận lịch học.
- **Chuẩn bị kịch bản Demo:** Phối hợp cùng các thành viên khác filter ra những môn học có điều kiện tiên quyết phức tạp nhất từ cục data thực tế để mô phỏng "case khó" lúc trình bày demo dự án.
- **Thiết kế Slide thuyết trình:** Trực tiếp làm slide báo cáo demo cho nhóm, tóm tắt và làm nổi bật các tính năng cốt lõi của Agentic AI, kiến trúc hệ thống, cùng các luồng kịch bản user test thực tế.

## 5. Điều học được trong Hackathon
Tôi nhận ra tầm quan trọng của việc thiết kế "LLM-friendly data" (dữ liệu thân thiện với LLM). Trước đây tôi chỉ nghĩ data cấu trúc sao cũng được miễn là code đọc được. Nhưng khi làm việc với Agentic AI, cấu trúc mô tả JSON, tên trường (key), và các format chuỗi đóng vai trò quan trọng giúp Language Model reasoning (suy luận) nhanh và ít mắc lỗi hơn hẳn so với việc ném cho nó một mớ CSV lộn xộn.

## 6. Nếu làm lại, đổi gì?
Nếu làm lại, tôi sẽ setup một pipeline tự động hóa hoàn toàn (viết script Python/Node.js) ngay từ ngày đầu để làm sạch và validate dữ liệu thay vì xử lý bán thủ công để sửa lỗi font chữ, lỗi mojibake tiếng Việt. Điều này sẽ giúp cung cấp bộ dữ liệu đầy đủ và scale bài toán nhanh hơn rất nhiều trong ngày cuối.

## 7. AI giúp gì? AI sai/mislead ở đâu?
- **AI giúp ích:** Tôi đã sử dụng AI (ChatGPT/Claude) để generate ra các đoạn mã script hỗ trợ convert lượng lớn dữ liệu từ cấu trúc CSV thô sang JSON phức tạp, đồng thời nhờ AI sinh bộ data giả lập profile người dùng (group friends, preferences) rất nhanh và đa dạng.
- **AI sai/mislead:** Khi yêu cầu AI xử lý và convert một file dữ liệu quá dài, AI thường bị cắt bớt context hoặc tự động sinh ra các JSON lỗi cú pháp. Nghiêm trọng hơn, quá trình prompt sinh data giả đôi lúc AI tự "bịa" (hallucinate) ra các mã môn học hoặc mã lớp không hề tồn tại trong TKB gốc, gây ra rủi ro đứt gãy tính toàn vẹn dữ liệu, buộc tôi phải tìm cách kết hợp script rà soát referential integrity để fix lại.
