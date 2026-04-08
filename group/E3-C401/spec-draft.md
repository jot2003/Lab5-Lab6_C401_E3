# Product SPEC Draft — VinAgent v2.0

**Team:** E3 (C401)  
**Track:** C - AI cho giáo dục và vận hành trường học  
**Project:** VinAgent — Cố vấn học vụ tự trị và tối ưu hóa đăng ký học phần  
**Deadline Draft:** 23:59 ngày 08/04/2026

**Thành viên nhóm:**
- Hoàng Kim Trí Thành (2A202600372)
- Đặng Đinh Tú Anh (2A202600019)
- Quách Gia Được (2A202600423)
- Phạm Quốc Dũng (2A202600490)
- Nguyễn Thanh Nam (2A202600205)

---

## Tóm tắt dự án

VinAgent là hệ thống Agentic AI đóng vai trò cố vấn học vụ cá nhân cho sinh viên VinUniversity, cho phép lên kế hoạch đăng ký học phần qua ngôn ngữ tự nhiên, tự kiểm tra điều kiện tiên quyết, phát hiện xung đột lịch và đề xuất phương án tối ưu.

Phiên bản v2.0 tập trung 5 cải tiến chính:
1. Social Learning Flywheel
2. Scenario Planning (Plan A + Plan B)
3. Advisor Brief tự động khi cần escalate sang cố vấn
4. Demand Forecasting cho phòng đào tạo
5. Hesitation Signals để học từ hành vi do dự

---

## 1) AI Product Canvas (bám sát template)

## Canvas

|   | Value | Trust | Feasibility |
|---|-------|-------|-------------|
| **Câu hỏi guide** | User nào? Pain gì? AI giải quyết gì mà cách hiện tại không giải được? | Khi AI sai thì user bị ảnh hưởng thế nào? User biết AI sai bằng cách nào? User sửa bằng cách nào? | Cost bao nhiêu/request? Latency bao lâu? Risk chính là gì? |
| **Trả lời** | **User:** Sinh viên (đặc biệt tân sinh viên), chuyên viên tư vấn học vụ. **Pain:** Mất 2-4 giờ/kỳ để tra cứu và xếp lịch thủ công; dễ đăng ký nhầm môn; không phát hiện xung đột/điều kiện tiên quyết kịp thời. **AI giải quyết:** Chat tự nhiên -> Agent phân tích điều kiện, tạo 3 lịch tối ưu, hỗ trợ đăng ký và đưa phương án dự phòng khi dữ liệu thay đổi. | **Ưu tiên:** Precision cao hơn Recall vì đăng ký nhầm môn gây hậu quả trực tiếp. **Khi sai:** Sinh viên đăng ký lỗi, mất thời gian xử lý lại, giảm niềm tin. **Biết sai:** Thất bại khi submit, mismatch với SIS, hoặc kế hoạch không phù hợp preference. **Sửa:** Editable Plan, xác nhận bắt buộc trước action quan trọng, nút escalate sang cố vấn + Advisor Brief tự động. | **Cost ước tính:** GPT-4o-mini ~0.0002 USD/query (ước tính theo bản thử nghiệm), thêm chi phí hạ tầng Streamlit + logging. **Latency mục tiêu:** <3 giây cho đề xuất lịch. **Risk chính:** dữ liệu SIS không đồng bộ theo thời gian thực, hallucination mã môn/prereq, stale cache giờ cao điểm, thay đổi lịch thi phút chót. |

---

## Automation hay augmentation?

☑ Automation — AI thực thi một số thao tác sau khi có xác nhận  
☑ Augmentation — AI gợi ý, user quyết định cuối cùng

**Justify:** VinAgent là mô hình lai. Phần phân tích và đề xuất lịch là augmentation để giữ quyền quyết định cho sinh viên; phần gửi lệnh đăng ký có thể automation có kiểm soát, bắt buộc qua bước xác nhận (human-in-the-loop) để giảm rủi ro.

---

## Learning signal

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| 1 | User correction đi vào đâu? | Correction Log theo từng session: thay đổi môn, đổi khung giờ, rollback plan, lý do chỉnh sửa; dùng để cập nhật policy và re-ranking. |
| 2 | Product thu signal gì để biết tốt lên hay tệ đi? | Implicit (lịch nào được chọn), Explicit (rating + comment), Correction (delta khi edit), Hesitation (hover_time > 8s nhưng không chọn), tỷ lệ kích hoạt Plan B. |
| 3 | Data thuộc loại nào? | User-specific + Domain-specific + Real-time + Human-judgment (advisor feedback). |

**Có marginal value không?**  
Có. Dữ liệu hành vi đăng ký môn theo ngành tại VinUni là dữ liệu đặc thù nội bộ; càng nhiều kỳ đăng ký, model càng hiểu preference cộng đồng, làm giảm edit rate theo thời gian.

---

## 2) User Stories — 5-path Experience (v2.0)

### Path 1 — Happy Path
- Trigger: Sinh viên nhập yêu cầu cụ thể (ví dụ: “Lên lịch HK Xuân 2026, tránh sáng, phải có Giải tích 2”).
- AI action: Parse intent -> query DB -> CSP scheduling -> đề xuất 3 lịch.
- UI: Visual calendar, badge “Conflict-free”.
- Outcome: Chọn Plan A và đăng ký thành công.

### Path 2 — Scenario Planning (mới)
- Trigger: AI phát hiện rủi ro lớp gần đầy.
- AI action: Tạo đồng thời Plan A (tối ưu) + Plan B (dự phòng).
- UI: Hai plan hiển thị song song, cảnh báo rõ rủi ro.
- Outcome: Nếu A fail thì fallback B ngay, tránh đứt mạch trải nghiệm.

### Path 3 — Low-confidence
- Trigger: Intent mơ hồ hoặc thiếu điều kiện.
- AI action: Hỏi làm rõ thay vì tự thực thi.
- UI: Clarification cards + xác nhận bắt buộc.
- Outcome: Giảm overconfidence.

### Path 4 — Failure
- Trigger: Submit thất bại do stale data hoặc conflict.
- AI action: Tự phát hiện lỗi, chuyển sang phương án khả thi nhất tiếp theo.
- UI: Error reason rõ + nút “Dùng Plan B”.
- Outcome: Graceful failure.

### Path 5 — Trust Recovery
- Trigger: User mất niềm tin sau lỗi.
- AI action: Hiển thị reasoning + nguồn dữ liệu + timestamp + Advisor Brief nếu cần escalate.
- UI: Reasoning panel + Human Escalation button.
- Outcome: Khôi phục niềm tin bằng minh bạch.

---

## 3) Năm cải tiến đột phá (v2.0)

1. **Social Learning Flywheel:** học từ pattern chỉnh sửa của cộng đồng theo ngành.
2. **Scenario Planning (A/B):** luôn có phương án dự phòng.
3. **Advisor Brief:** tự tóm tắt bối cảnh cho cố vấn khi escalate.
4. **Demand Forecasting:** dự báo nhu cầu mở lớp từ draft sessions.
5. **Hesitation Signals:** học từ hành vi do dự, không chỉ từ like/dislike.

---

## 4) Evaluation Metrics (v2.0)

| Chỉ số | Ngưỡng deploy | Red flag | Cách đo |
|---|---|---|---|
| Schedule Precision Rate | >85% | <70% trong 24h liên tiếp | So sánh output AI với CSP validator |
| Manual Edit Rate | <25% | >40% | Theo dõi số lần edit/session |
| Time-to-Register | <8 phút | >20 phút | first_message -> register_success |
| Plan B Activation Rate | <15% sessions | >30% | Đếm session fallback B |
| Hesitation Signal Capture | >500/kỳ | <50/kỳ | Đếm hover_time >8s không chọn |

---

## 5) Top Failure Modes (v2.0)

| Failure mode | Trigger | Hậu quả | Mitigation |
|---|---|---|---|
| Prerequisite Hallucination | LLM tự suy diễn prereq | Đăng ký sai, bị hủy môn | Bắt buộc tool call get_prerequisites + validator độc lập |
| Stale Schedule Data | Cache cũ giờ cao điểm | Plan fail khi submit | TTL 5 phút + timestamp + Plan B |
| Ambiguous Intent Overconfidence | Confidence chưa đủ nhưng auto-run | Sai nguyện vọng | Threshold auto-action = 80%, confirm bắt buộc |
| Social Signal Poisoning | Pattern edit bất thường | Lệch community weights | Outlier detection, chỉ học khi >5% population |
| Advisor Brief Data Leak | Gửi nhầm thông tin nhạy cảm | Rủi ro riêng tư/pháp lý | Role-based access + giới hạn dữ liệu trong brief |

---

## 6) ROI — 3 kịch bản + Strategic ROI

Giả định: ~3,000 sinh viên, 2 kỳ/năm, hiện mất ~3 giờ/sinh viên/kỳ.

| Kịch bản | Adoption/Chất lượng | Giờ tiết kiệm/năm | Tác động |
|---|---|---|---|
| Conservative | 20% SV, Precision ~70%, Edit cao | ~1,800 giờ | Giảm tải cơ bản; đủ dữ liệu cho pilot forecasting |
| Realistic | 50% SV, Precision ~87%, Edit ~22% | ~7,500 giờ | ROI tốt; giảm workload tư vấn; dashboard có giá trị vận hành |
| Optimistic | 90% SV, Precision ~93%, Edit ~10% | ~15,120 giờ | Tạo lợi thế chiến lược: dự báo mở lớp sớm, tối ưu toàn trường |

**Learning Flywheel Effect:** Qua 2-3 kỳ, Edit Rate giảm dần nhờ cộng dồn dữ liệu hành vi và correction; ROI tăng theo thời gian mà không tăng chi phí tuyến tính.

---

## 7) Mini AI Spec (1 trang cho giám khảo)

- **Vấn đề:** Đăng ký học phần thủ công tốn thời gian, dễ sai điều kiện.
- **Giải pháp:** VinAgent v2.0 dùng Agentic workflow để đề xuất, xác nhận và thực thi đăng ký có kiểm soát.
- **Stack:** GPT-4o-mini + LangGraph StateGraph + SQLite mock + CSP + Streamlit.
- **Trust & safety:** Confidence threshold, confirm bắt buộc, reasoning panel, Plan A/B, escalate + advisor brief.
- **Metric gates:** Precision >85%, Edit <25%, TTR <8 phút.
- **ROI realistic:** tiết kiệm lớn cho sinh viên và giảm tải tư vấn học vụ.

---

## 8) Phân công nhiệm vụ (bổ sung)

- **Đặng Đinh Tú Anh (2A202600019) — Team Lead & AI Core**
  - Quản lý backlog, viết spec, thiết kế prompt/LangGraph, triển khai confidence scoring.
  - Phụ trách cải tiến #5 Hesitation Signals.

- **Quách Gia Được (2A202600423) — Backend Engineer**
  - Xây dựng DB mock lớp học, CSP algorithm, API đăng ký + prerequisite validator, TTL cache.
  - Phụ trách cải tiến #4 Demand Forecasting.

- **Phạm Quốc Dũng (2A202600490) — Frontend & UX Engineer**
  - Streamlit UI, visual calendar, editable plan, confidence badge, reasoning panel.
  - Phụ trách cải tiến #2 Scenario Planning UI (Plan A/B).

- **Nguyễn Thanh Nam (2A202600205) — ML & Learning Systems**
  - Correction log system, pipeline signal, bộ metrics và cảnh báo red flag.
  - Phụ trách cải tiến #1 Social Learning Flywheel.

- **Hoang Kim Tri Thanh (2A202600372) — Integration & Presentation**
  - Tích hợp end-to-end, human escalation flow, tính ROI 3 kịch bản, chuẩn bị demo.
  - Phụ trách cải tiến #3 Advisor Brief.

