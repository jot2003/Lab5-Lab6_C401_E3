# Demo Script — BKAgent (10 phút)

## 0) Setup trước demo (30-60s)
- Mở app ở `vinagent-web`.
- Đăng nhập bằng 1 trong 2 tài khoản demo:
  - `20210001` / password `1` (Nguyen Van An)
  - `20210042` / password `1` (Duc)
- Vào trang tạo kế hoạch.

## 1) Problem -> Solution fit (1 phút)
- Nói pain ngắn gọn: sinh viên tốn thời gian thử-sai để ghép lịch khả thi, dễ trùng lịch/thiếu tiên quyết/hết chỗ.
- Nói giải pháp: BKAgent nhận yêu cầu tiếng Việt, gọi dữ liệu học vụ và tạo Plan A/B có citation.

## 2) Live flow chính (4 phút)
1. Nhập prompt:  
   "Lên lịch HK 20252 cho MI1134, MI2021, IT4110, IT3292, tránh sáng."
2. Cho thấy agent đang chạy theo step/tool.
3. Trình bày kết quả Plan A/B + thông tin slot còn trống.
4. Chỉ ra citation và giải thích nguồn dữ liệu.
5. Chọn plan để đi tiếp.

## 3) Failure + recovery flow (2 phút)
1. Nhập yêu cầu khó/khắt khe để tạo tình huống fail.
2. Cho thấy hệ thống cảnh báo rõ lý do và đề xuất Plan B hoặc chỉnh ràng buộc.
3. Nhấn mạnh nguyên tắc: luôn có fallback thay vì fail im lặng.

## 4) Group registration flow (1.5 phút)
1. User A gửi lời mời đăng ký cùng cho user B.
2. Đăng xuất, đăng nhập user B.
3. Chỉ ra thông báo lời mời và xác nhận lời mời từ trang hồ sơ.

## 5) Kết thúc: trust + metrics + ROI (1.5 phút)
- Trust: có confirm step, citation, editable plan, confidence per plan.
- Metric gates: precision, edit rate, time-to-register-ready, plan B activation.
- ROI realistic: giảm đáng kể thời gian lập kế hoạch ở quy mô toàn trường.

## Q&A backup (nếu còn thời gian)
- Vì sao không giao hết cho LLM?
- Cách xử lý khi dữ liệu slot thay đổi liên tục?
- Ranh giới hệ thống: tối ưu lập kế hoạch, không giải bài toán hạ tầng SIS.
