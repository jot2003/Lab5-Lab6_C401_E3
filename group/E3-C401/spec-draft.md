# SPEC draft — Nhóm E3 (C401)

**Track / chủ đề:** VinUni — AI trợ lý học tập (Q&A nội bộ)

---

## Problem statement (1 câu)

Sinh viên/giảng viên cần tra cứu nhanh thông tin môn học (deadline, rubric, tài liệu, quy định, FAQ). Hiện tại thông tin rải rác nhiều kênh (LMS, PDF, chat), dễ hỏi lặp và dễ hiểu sai. AI trợ lý Q&A nội bộ giúp trả lời nhanh dựa trên tài liệu chính thức và **trích dẫn nguồn**, giảm thời gian tìm kiếm và giảm sai thông tin.

---

## Canvas draft (copy từ `03-canvas-template.md` và chỉnh)

|   | Value | Trust | Feasibility |
|---|-------|-------|-------------|
| **Trả lời** | **User:** sinh viên, TA, giảng viên. **Pain:** tìm thông tin lâu; hỏi lặp; nhầm deadline/rubric. **AI giải quyết:** hỏi 1 câu → trả lời ngắn + trích dẫn đoạn nguồn + gợi ý bước tiếp theo. | **Sai gây gì:** hiểu sai deadline/rubric → trễ hạn; tin nhầm quy định. **Biết sai:** đối chiếu LMS/PDF; feedback từ TA. **Sửa/Recover:** luôn trích dẫn nguồn; khi low-confidence → hỏi làm rõ; có nút “mở nguồn gốc” + “gặp TA”. | **Cost:** RAG + LLM; có thể cache; order ~0.005–0.02 USD/lượt. **Latency:** <3s câu đơn, <6s câu dài. **Risk:** tài liệu không cập nhật; hallucination nếu không grounded; quyền truy cập tài liệu nội bộ. |

**Auto hay aug?** Augmentation — AI gợi ý/tra cứu, người dùng quyết định; luôn có link nguồn.

**Learning signal:** user click vào nguồn, thumbs up/down, report “sai”, câu hỏi không trả lời được → thêm tài liệu/FAQ; corrections từ TA làm ground truth.

---

## Hướng đi chính (V0)

- Chọn 1–2 môn học hoặc 1 chủ đề (VD: Day05/Day06 lab) làm pilot
- Ingest nguồn: syllabus, rubric, slide PDF, announcements, FAQ (chỉ nguồn chính thức)
- Output format: Answer ngắn + “Sources” (link/đoạn trích) + “Need to clarify” (nếu thiếu thông tin)
- UX 4 paths: đúng / không chắc / sai / mất tin (fallback gặp TA)

---

## Eval (thô, đủ để draft)

- **Citation support rate:** % câu trả lời có nguồn và nguồn support đúng
- **Resolution rate:** % câu hỏi user giải quyết không cần hỏi TA
- **Clarification loops:** số vòng làm rõ trung bình
- **Top failure modes:** thiếu tài liệu, câu hỏi mơ hồ, trích dẫn sai đoạn

---

## Phân công (điền tên)

- Canvas + Failure modes:
- User stories 4 paths:
- Eval + ROI:
- Prototype / demo:

