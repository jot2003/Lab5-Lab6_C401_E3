# Prototype Readme — BKAgent

## Mô tả
BKAgent là trợ lý AI hỗ trợ sinh viên HUST lập kế hoạch đăng ký tín chỉ bằng ngôn ngữ tự nhiên. Hệ thống kiểm tra tiên quyết, tra lịch lớp và chỗ trống, sau đó tạo Plan A/Plan B có trích nguồn để người dùng quyết định nhanh và an toàn hơn.

## Level
**Working prototype**

## Links
- Source code: `vinagent-web/`
- Group spec (Lab 5): `lab 5/group/E3-C401/spec-draft.md`
- SPEC final (Lab 6): `lab 6/spec-final.md`
- Demo script: `lab 6/demo-script.md`
- TODO: bổ sung link video demo/public deploy nếu cần nộp ngoài repo.

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

## Phân công
| Thành viên | Phần phụ trách chính | Output |
|---|---|---|
| Hoàng Kim Trí Thành (2A202600372) | Tích hợp end-to-end, flow escalation/demo | luồng demo, tài liệu tổng hợp |
| Đặng Đinh Tú Anh (2A202600019) | AI core, prompt, LangGraph flow | `agent.ts`, logic orchestration |
| Quách Gia Được (2A202600423) | Data + scheduling constraints | mock data, scheduler/tool logic |
| Phạm Quốc Dũng (2A202600490) | Frontend + UX implementation | UI panels, forms, interaction |
| Nguyễn Thanh Nam (2A202600205) | Metrics, learning signal, evaluation framing | metrics, confidence/eval notes |
