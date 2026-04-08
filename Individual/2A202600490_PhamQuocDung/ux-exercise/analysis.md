# UX exercise — Vietnam Airlines NEO Chatbot

**Sinh viên:** Phạm Quốc Dũng — 2A202600490

---

## Sản phẩm: Vietnam Airlines — Chatbot NEO (tra cứu thông tin chuyến bay & quy định hàng không)

---

## Khả năng chính của sản phẩm

- Tra cứu thông tin về máy bay, chuyến bay
- Giải đáp thông tin về quy định bay (hành lý, thủ tục...)

---

## Test case thực tế

- User hỏi "Ngày mai có các chuyến bay nào?" → bot đưa ra lựa chọn tra cứu → user chọn "tra cứu theo số hiệu" → bot yêu cầu cấp số hiệu chuyến bay → user hỏi "gợi ý số hiệu chuyến bay" → bot hỏi lại ý định lựa chọn tra cứu

---

## 4 paths

### 1. AI đúng
- User hỏi về quy định hành lý xách tay, phân loại tiêu chuẩn hành lý
- Bot trả lời đúng, trong tầm câu hỏi về quy định, hành lý xách tay
- UI: hiện kết quả trực tiếp, không cần xác nhận thêm

### 2. AI không chắc
- User viết sai chính tả trong câu hỏi
- AI không hỏi lại để làm rõ, tự động hiểu nghĩa → đưa ra trả lời chung chung
- Vấn đề: thiếu cơ chế xác nhận lại ý định của user khi input không rõ ràng

### 3. AI sai
- AI không nhớ được lịch sử trả lời trong cùng một phiên chat
- AI trả lời sai → user không tự phát hiện được, phải tự nhận ra sau
- Vấn đề: không có feedback loop, không có cơ chế để user đánh dấu câu trả lời sai

### 4. Mất tin tưởng
- User báo không khớp với website nhưng chatbot không có link verify
- User không có cách nào kiểm chứng thông tin AI đưa ra
- Không có fallback rõ ràng (ví dụ: link đến trang chính thức, hotline, hoặc "liên hệ CSKH")

---

## Path yếu nhất: Path 3 + Path 4

- Khi AI trả lời sai, không có recovery flow — user phải tự phát hiện, không biết phải làm gì tiếp
- Không có feedback loop: user sửa hoặc phản ánh nhưng không rõ AI có ghi nhận không
- Thiếu link verify đến nguồn chính thức → mất niềm tin, không có lối thoát an toàn

---

## Gap marketing vs thực tế

- **Marketing:** NEO được giới thiệu là trợ lý thông minh, hỗ trợ hành khách hiệu quả
- **Thực tế:** Chủ yếu hoạt động tốt với FAQ rule-based + input theo lệnh pattern cố định; các trường hợp câu hỏi liên tiếp, ngữ cảnh phức tạp thì lặp lại hoặc mất mạch hội thoại
- **Gap lớn nhất:** Kỳ vọng thông minh và cập nhật thông tin liên tục — thực tế thiếu khả năng nhớ ngữ cảnh và không có cơ chế xác minh thông tin real-time

---

## Sketch

*(Ảnh đính kèm: sketch1.jpg, sketch2.jpg)*

### As-is
- User: "phản ánh thái độ nhân viên"
- AI không hiểu câu hỏi → yêu cầu hỏi lại
- User phản ánh chi tiết vấn đề
- AI vẫn không hiểu → yêu cầu hỏi lại
- → **Vòng lặp** (loop không thoát được)

### To-be
- User: "phản ánh thái độ nhân viên"
- AI không hiểu → yêu cầu chi tiết vấn đề *(chỉ hỏi 1 lần)*
- AI hiểu → hiển thị thông tin liên hệ với bộ phận hỗ trợ

### Kết luận từ sketch
- NEO ổn cho các câu hỏi được hỏi đúng form (FAQ-style)
- Với các câu hỏi mang tính liên tiếp hoặc ngữ cảnh phức tạp → cần thêm khả năng **nhớ lại thông tin phiên làm việc** để tránh vòng lặp
- Cần bổ sung **fallback rõ ràng** (link CSKH, hotline) khi AI không xử lý được
