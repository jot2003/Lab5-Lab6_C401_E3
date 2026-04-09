# SPEC Final — BKAgent (HUST Course Registration Copilot)

**Nhóm:** E3-C401  
**Track:** C - AI cho giáo dục và vận hành trường học  
**Problem statement:** Sinh viên HUST mất nhiều thời gian thử-sai để ghép lịch tín chỉ khả thi do ràng buộc tiên quyết, trùng lịch, và biến động chỗ trống; BKAgent dùng Agentic AI để tạo Plan A/B có thể hành động nhanh và an toàn hơn.

---

## 1) AI Product Canvas

|   | Value | Trust | Feasibility |
|---|-------|-------|-------------|
| **Câu hỏi** | User nào? Pain gì? AI giải gì? | Khi AI sai thì sao? User sửa bằng cách nào? | Cost/latency bao nhiêu? Risk chính? |
| **Trả lời** | **User:** Sinh viên HUST (đặc biệt năm 1-2), chuyên viên phòng đào tạo. **Pain:** môn đại cương hết chỗ nhanh, ghép LT-BT-TN phức tạp, đổi mã môn gây nhầm lẫn, tốn nhiều giờ thử-sai. **AI giải:** chat tự nhiên -> gọi tool học vụ -> tạo Plan A/B giảm lỗi chọn môn, giảm trùng lịch, tăng tốc ra quyết định. | **Khi sai:** chọn nhầm plan hoặc lệch preference. **Phát hiện:** mismatch với dữ liệu SIS/slot thực tế hoặc user review thấy sai. **Sửa:** editable plan, xác nhận bắt buộc trước action, hiển thị citation + reasoning, escalate cố vấn. | **Cost ước tính:** Gemini Flash ~0.0001 USD/query + hạ tầng Next.js. **Latency mục tiêu:** <3 giây cho đề xuất lịch. **Risk:** thiếu dữ liệu lớp cho một số môn, hallucinates mã môn/prereq, dữ liệu slot stale theo thời điểm. |

**Automation hay augmentation?**  
- Automation: có (chuẩn bị danh sách đăng ký sau xác nhận)  
- Augmentation: có (AI gợi ý, user quyết định cuối)

**Learning signal**
1. User correction đi vào đâu? -> correction log theo session (đổi môn, đổi giờ, rollback, lý do).
2. Signal đánh giá tốt/xấu? -> implicit chọn plan, explicit rating, edit delta, hesitation, tỷ lệ Plan B, tỷ lệ đăng ký thành công.
3. Data loại gì? -> user-specific + domain-specific + real-time + human-judgment; có marginal value cao theo từng kỳ đăng ký.

---

## 2) User Stories — 4 paths

### Feature A: Lập kế hoạch đăng ký (Plan A/B)

| Path | Mô tả |
|------|-------|
| Happy | User nêu môn + ràng buộc, hệ thống trả Plan A/B không trùng lịch, còn chỗ, user chọn plan để đi tiếp. |
| Low-confidence | User nhập mơ hồ hoặc thiếu điều kiện, agent hỏi làm rõ trước khi xếp lịch. |
| Failure | Plan hiện tại không khả thi (xung đột/thiếu tiên quyết/hết chỗ), hệ thống cảnh báo rõ lý do và đề xuất fallback Plan B. |
| Correction | User sửa môn hoặc khung giờ trực tiếp, hệ thống re-generate và ghi nhận chỉnh sửa để cải thiện ranking. |

### Feature B: Đăng ký nhóm (Group Invite)

| Path | Mô tả |
|------|-------|
| Happy | User đã đăng ký plan và gửi lời mời cho bạn; bạn xác nhận trong profile, hệ thống nạp plan và auto-flow đăng ký. |
| Low-confidence | Slot nhóm không ổn định, hệ thống yêu cầu user xác nhận lại danh sách môn ưu tiên. |
| Failure | Không có slot chung cho cả nhóm, hiển thị phương án gần nhất và cho tách nhóm có kiểm soát. |
| Correction | Người nhận từ chối lời mời hoặc đổi plan, hệ thống cập nhật trạng thái invite và cho gửi lại. |

---

## 3) Eval metrics + threshold

**Tối ưu:** Precision (ưu tiên đúng trước, vì đăng ký sai gây hậu quả trực tiếp).

| Metric | Threshold | Red flag |
|--------|-----------|----------|
| Schedule Precision Rate | >= 85% | < 70% trong 24h liên tiếp |
| Manual Edit Rate | < 25% | > 40% |
| Time-to-Register-Ready | < 10 phút | > 30 phút |
| Plan B Activation Rate | < 20% session | > 40% |

---

## 4) Top 3 failure modes

| # | Trigger | Hậu quả | Mitigation |
|---|---------|---------|------------|
| 1 | LLM suy diễn sai tiên quyết | User chọn môn không hợp lệ | Bắt buộc tool `check_prerequisites` + validator độc lập |
| 2 | Dữ liệu lịch/chỗ ngồi stale | Plan đẹp nhưng áp dụng thực tế fail | Timestamp rõ + TTL ngắn + luôn có Plan B |
| 3 | Không ghép đúng LT-BT-TN | Thiếu thành phần môn, xung đột lịch | Ràng buộc cứng trong scheduler + cảnh báo sớm |

---

## 5) ROI 3 kịch bản

Giả định: ~35,000 sinh viên, 2 kỳ/năm, trung bình tốn ~4 giờ/kỳ để lên và chỉnh plan.

|   | Conservative | Realistic | Optimistic |
|---|-------------|-----------|------------|
| Assumption | 10% adoption, precision ~70% | 30% adoption, precision ~87% | 60% adoption, precision ~93% |
| Benefit | ~28,000 giờ tiết kiệm/năm | ~75,600 giờ tiết kiệm/năm | ~151,200 giờ tiết kiệm/năm |
| Tác động | Pilot vận hành | ROI rõ, giảm tải học vụ | Lợi thế dự báo mở lớp và tối ưu điều phối |

**Kill criteria:** Precision < 70% liên tục 24h hoặc edit rate > 40% kéo dài.

---

## 6) Mini AI spec

BKAgent là AI copilot cho đăng ký tín chỉ tại HUST, tập trung giải quyết bài toán lập kế hoạch khả thi thay vì xử lý hạ tầng SIS. Hệ thống nhận yêu cầu tiếng Việt, gọi tool học vụ để kiểm tra tiên quyết/lịch/slot, rồi tạo Plan A/B có citation rõ ràng. Cơ chế human-in-the-loop được giữ ở bước xác nhận quan trọng để tránh auto-action sai. Dữ liệu hành vi chỉnh sửa và lựa chọn plan tạo data flywheel theo ngành/chương trình, giúp giảm edit rate qua từng kỳ.  

Stack: Next.js + Zustand + LangGraph/LangChain + Gemini + mock SIS datasets.
