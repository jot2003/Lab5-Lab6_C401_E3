# Individual reflection — Hoàng Kim Trí Thành (2A202600372)

## 1) Role cụ thể trong nhóm
Mình phụ trách **Integration & Presentation**: ghép các phần frontend, backend agent, dữ liệu mock thành luồng demo end-to-end; đồng thời chuẩn bị narrative demo để cả nhóm trình bày mạch lạc.

## 2) Phần phụ trách cụ thể (2-3 đóng góp có output rõ)
- Tích hợp luồng chính BKAgent: chat tiếng Việt -> gọi tool -> tạo Plan A/B -> hiển thị citation/rủi ro.
- Hỗ trợ hoàn thiện flow nghiệp vụ cho demo: đăng ký nhóm một chiều, xác nhận lời mời từ tài khoản nhận, tách session theo từng user.
- Chuẩn hóa dữ liệu demo (student/schedule) để các case test quan trọng chạy được ổn định, đặc biệt các môn dễ fail do thiếu lớp.

## 3) SPEC phần nào mạnh nhất, phần nào yếu nhất? Vì sao?
- **Mạnh nhất:** phần failure modes + trust guardrails. Nhóm mô tả được trigger, hậu quả, mitigation khá rõ, bám sát rủi ro thật của bài toán đăng ký tín chỉ.
- **Yếu nhất:** một số giả định ROI/impact còn phụ thuộc dữ liệu vận hành thực tế của trường, chưa có số production để kiểm chứng sâu.

## 4) Đóng góp cụ thể khác với mục 2
- Rà soát lại phạm vi bài toán để tránh nói quá phạm vi kỹ thuật (ví dụ tách rõ: hệ thống tối ưu kế hoạch đăng ký, không giải quyết hạ tầng dk-sis).
- Hỗ trợ chỉnh nội dung tài liệu nộp để đồng bộ giữa spec, prototype và kịch bản demo.
- Tham gia dry-run phần Q&A để đảm bảo mỗi thành viên trả lời được phần mình phụ trách.

## 5) Một điều học được trong hackathon mà trước đó chưa biết
Mình học rõ hơn rằng sản phẩm AI tốt không nằm ở model mạnh nhất, mà ở **ràng buộc sản phẩm + dữ liệu + cơ chế fallback**. Nếu không có guardrail và quy trình xử lý lỗi rõ, demo rất dễ “đẹp lúc đúng nhưng gãy lúc sai”.

## 6) Nếu làm lại, mình sẽ đổi gì?
Mình sẽ chốt sớm hơn “định nghĩa nghiệp vụ” cho các cụm mơ hồ (ví dụ: “tránh sáng” là trước 9h30 hay cả buổi sáng) ngay từ đầu. Làm vậy sẽ giảm vòng sửa logic muộn và giúp thống nhất kỳ vọng giữa nhóm với người dùng.

## 7) AI giúp gì? AI sai/mislead ở đâu?
- **AI giúp:** tăng tốc viết nháp spec, rà checklist demo, và sinh nhanh phương án triển khai để nhóm chọn.
- **AI sai/mislead:** có lúc đưa đề xuất nghe hợp lý nhưng lệch phạm vi thực tế hoặc thiếu ràng buộc nghiệp vụ cụ thể. Bài học là luôn phải kiểm chứng bằng data/code chạy thật và giữ human-in-the-loop ở các quyết định quan trọng.
