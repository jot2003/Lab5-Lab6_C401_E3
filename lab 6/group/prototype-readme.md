# Prototype Readme — BKAgent

## Mô tả
BKAgent là trợ lý AI hỗ trợ sinh viên HUST lập kế hoạch đăng ký tín chỉ bằng ngôn ngữ tự nhiên. Hệ thống kiểm tra tiên quyết, tra lịch lớp và chỗ trống, sau đó tạo Plan A/Plan B có trích nguồn để người dùng quyết định nhanh và an toàn hơn.

## Level
**Working prototype**

## Links
- Source code: `vinagent-web/`
- Group spec final: `lab 6/group/spec-final.md`
- Demo script: `lab 6/group/demo-script.md`
- Demo slides: `lab 6/group/demo-slides.pdf`
- Tham chiếu lịch sử (Lab 5 draft): `lab 5/group/E3-C401/spec-draft.md`
- Public deploy/video: chưa đính kèm trong repo (nộp bổ sung trên LMS nếu yêu cầu).

## Tools và stack
- Frontend/Backend: Next.js App Router + React + TypeScript
- Agent framework: LangGraph + LangChain
- LLM: Google Gemini (`gemini-2.5-flash`)
- State: Zustand (+ persist)
- Data: mock JSON (`student.json`, `schedule.json`, `curriculum-cttt.json`, ...)

## Các năng lực prototype đã chạy
1. Chat tiếng Việt để yêu cầu lịch đăng ký.
2. Tool calling theo workflow: profile -> recommended courses -> schedule/prereq -> generate plan.
3. Tạo Plan A/B và hiển thị rủi ro slot (`slotsRemaining`, `seatRisk`).
4. Citation từ dữ liệu tool để giải thích kết quả.
5. Session tách theo user đăng nhập.
6. Group invite một chiều (gửi lời mời đăng ký cùng và xác nhận ở tài khoản nhận).

## Hướng dẫn test cho người chấm
### 1) Chuẩn bị
1. Mở terminal tại `vinagent-web/`.
2. Chạy `npm install`.
3. Chạy `npm run dev`.
4. Truy cập `http://localhost:3000`.

### 2) Tài khoản demo
- MSSV: `20210001` (Nguyễn Văn An), mật khẩu: `1`
- MSSV: `20210042` (Trần Minh Đức), mật khẩu: `1`

### 3) Kịch bản bắt buộc (đúng scope học phần)
Nhập đúng câu:

`Lên lịch HK 20252, tránh sáng, phải có Giải tích II và Vật lý II`

Kỳ vọng:
- Có Plan A và Plan B.
- Cả hai plan đều giữ đủ 2 môn theo yêu cầu.
- Không chọn lớp đã hết chỗ.
- Có citation và cảnh báo khi slot thấp.

### 4) Kịch bản chặn đăng ký lớp hết chỗ
1. Chọn plan có lớp `slotsRemaining <= 0` (nếu có).
2. Nhấn `Đăng ký ngay`.

Kỳ vọng:
- Nút đăng ký bị chặn hoặc hiển thị cảnh báo.
- Hệ thống yêu cầu đổi plan/chỉnh sửa trước khi đăng ký.

### 5) Kịch bản mời bạn đăng ký cùng
1. Tài khoản A đăng ký thành công trước.
2. A gửi lời mời cho B.
3. Đăng nhập tài khoản B và vào Hồ sơ.
4. B xác nhận lời mời.

Kỳ vọng:
- B nhận thông báo.
- B được nạp plan từ lời mời và có thể đăng ký.

## Phân công
| Thành viên | Phần phụ trách chính | Output |
|---|---|---|
| Hoàng Kim Trí Thành (2A202600372) | Tích hợp end-to-end, flow escalation/demo | luồng demo, tài liệu tổng hợp |
| Đặng Đinh Tú Anh (2A202600019) | AI core, prompt, LangGraph flow | `agent.ts`, logic orchestration |
| Quách Gia Được (2A202600423) | Data + scheduling constraints | mock data, scheduler/tool logic |
| Phạm Quốc Dũng (2A202600490) | Frontend + UX implementation | UI panels, forms, interaction |
| Nguyễn Thanh Nam (2A202600205) | Metrics, learning signal, evaluation framing | metrics, confidence/eval notes |
