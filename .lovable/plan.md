## Vấn đề
User hỏi "cho tôi bài thiền 9 tầng tự do" → Angel trả lời "không có thông tin", dù bài **"Tự Do Tuyệt Đối — 9 Tầng Tự Do Cha Vũ Trụ Ban Tặng"** đã có sẵn trong `knowledge_topics`.

## Nguyên nhân
Trong `supabase/functions/angel-ai/index.ts` (phần RAG, dòng ~1037–1125):
- Việc tìm kiếm chỉ chạy theo **danh sách keyword cứng** (`thiền`, `fun ecosystem`, `camly`, `mantra`…). Cụm khóa "tự do", "9 tầng", "tuyệt đối" KHÔNG có trong danh sách.
- Với truy vấn này, chỉ keyword `thiền` được dùng — nhưng nội dung bài lại nói về "tự do", không chắc chứa từ "thiền" → không match.
- Fallback "general topics" chỉ lấy 15 bản ghi đầu không có thứ tự, nên bài mới có thể bị bỏ qua.

## Giải pháp
Bổ sung một bước **tìm kiếm theo cụm từ trực tiếp từ câu hỏi người dùng**, chạy SONG SONG với keyword search hiện tại — không thay thế logic cũ để tránh ảnh hưởng các luồng đã hoạt động tốt.

### Thay đổi trong `supabase/functions/angel-ai/index.ts` (nhánh `else` của `isFatherQuery`)

1. **Trích cụm từ ý nghĩa từ câu hỏi**:
   - Bỏ stopwords tiếng Việt phổ biến (`cho`, `tôi`, `bài`, `của`, `là`, `và`, `con`, `muốn`, `xin`, `ơi`…).
   - Lấy các từ còn ≥ 2 ký tự, ghép thành các cụm 1–2 từ liên tiếp (n-gram).
   - Ví dụ: "cho tôi bài thiền 9 tầng tự do" → `["thiền", "9 tầng", "tầng tự", "tự do", "thiền 9", "9", "tầng", "tự", "do"]` (lọc trùng, bỏ token quá ngắn/số đơn lẻ).

2. **Tìm theo từng cụm**: dùng `ilike` trên `title` và `content`, giới hạn 5 kết quả mỗi cụm. Gộp vào `allTopics` (đã có dedupe bằng `existingIds`).

3. **Bổ sung từ khóa thiền vào danh sách hiện tại**: thêm `'tự do'`, `'9 tầng'`, `'sám hối'`, `'biết ơn'` vào nhóm trigger khi message có `thiền`/`meditation` hoặc `tự do` — giúp bắt nhanh bài này và các bài cùng dòng.

4. **Cải thiện fallback general**: order `created_at desc` thay vì lấy ngẫu nhiên 15 bản ghi đầu, để bài mới luôn có cơ hội lọt vào pool scoring.

Không thay đổi `calculateRelevanceScore`, không thay đổi schema, không thay đổi UI. Chỉ mở rộng nguồn ứng viên cho bước scoring.

## Kiểm thử
Sau khi deploy, hỏi lại:
- "cho tôi bài thiền 9 tầng tự do"
- "tự do tuyệt đối là gì"
- "9 tầng tự do cha vũ trụ"

Kỳ vọng: Angel trả lời dựa trên bài "Tự Do Tuyệt Đối — 9 Tầng Tự Do Cha Vũ Trụ Ban Tặng" và liệt kê được 9 tầng.
