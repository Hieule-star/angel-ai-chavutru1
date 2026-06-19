## Mục tiêu
Khi user hỏi "bài thiền 9 tầng tự do" — hoặc các biến thể như "chín tầng tự do", "bài giảng về tự do", "9 layers of freedom", "thiền giải phóng tâm hồn" — Angel phải tìm đúng bài **"Tự Do Tuyệt Đối — 9 Tầng Tự Do Cha Vũ Trụ Ban Tặng"** trong `knowledge_topics`.

## Tình trạng hiện tại
Sau bước cải thiện trước, RAG đã:
- Trích cụm 1–2 từ động từ câu hỏi (sau khi bỏ stopwords) và `ilike` trên `title` + `content`.
- Thêm các keyword cứng: `tự do`, `tầng`, `tuyệt đối`, `sám hối`, `biết ơn`, `kingdom`, `tuyên ngôn`.
- Fallback lấy 20 bài mới nhất theo `created_at desc`.

Vẫn còn yếu khi:
- User viết số bằng chữ ("chín tầng") thay vì "9 tầng".
- User dùng từ đồng nghĩa ("giải phóng", "tự tại", "freedom").
- User viết tiếng Anh ("9 layers of freedom meditation").
- Có dấu / không dấu ("tu do tuyet doi") — Postgres `ilike` không bỏ dấu.

## Giải pháp (3 lớp, không cần embedding)

### Lớp 1 — Chuẩn hoá truy vấn
Trong `supabase/functions/angel-ai/index.ts`, viết hàm `normalizeQuery(text)`:
- Lowercase, bỏ dấu tiếng Việt (`removeDiacritics`).
- Map số bằng chữ → chữ số: `một→1, hai→2, ba→3, … chín→9, mười→10`.
- Map từ đồng nghĩa cốt lõi (bảng tĩnh nhỏ, dễ mở rộng):
  - `freedom/liberation/giải phóng/tự tại → tự do`
  - `layer/level/cấp/bậc → tầng`
  - `absolute/tuyệt đối/hoàn toàn → tuyệt đối`
  - `meditation/dẫn thiền → thiền`
  - `repent/sám hối → sám hối`
  - `gratitude/biết ơn → biết ơn`
- Trả về cả phiên bản có dấu lẫn không dấu để dùng cho các bước sau.

### Lớp 2 — Sinh tập "candidate phrases"
Từ truy vấn đã chuẩn hoá:
- Bỏ stopwords (mở rộng danh sách hiện có với cả từ tiếng Anh `the/of/for/a/about/please/show/give/me/i/want`).
- Sinh unigram + bigram + trigram (≤ 12 cụm, ưu tiên cụm dài).
- Với mỗi cụm, sinh kèm phiên bản không dấu để match bài có/không dấu.
- Bơm thêm các keyword đã được map đồng nghĩa.

### Lớp 3 — Truy vấn & xếp hạng
1. Với mỗi cụm, chạy `ilike` trên `title` (trọng số ×3), `description` (×2), `content` (×1), giới hạn 8 kết quả mỗi cụm. Gộp dedupe.
2. Khi đếm điểm trong `calculateRelevanceScore` (hoặc viết lớp scoring nhẹ bao quanh), cộng điểm theo:
   - Số cụm khác nhau từ truy vấn xuất hiện trong title (cộng cao nhất).
   - Số cụm xuất hiện trong description.
   - Số cụm xuất hiện trong content (đếm khác nhau, không đếm tần suất để tránh thiên vị bài dài).
   - Bonus nếu cả "tự do" + "tầng" + một số (1–9) cùng xuất hiện → ép bài "9 tầng tự do" lên top.
3. Loại bài có điểm 0 sau scoring (không có cụm nào của user xuất hiện) trước khi đưa vào prompt — tránh nhiễu.
4. Giữ top 8 bài cho prompt (giảm từ 20 → 8 để tăng tỉ trọng tín hiệu).

### Lớp 4 — Log để dễ debug
- `console.log` truy vấn gốc, truy vấn chuẩn hoá, danh sách phrase, top 10 bài kèm điểm.
- Hữu ích khi user báo "Angel không tìm thấy bài X".

## File thay đổi
- `supabase/functions/angel-ai/index.ts` — chỉ chỉnh phần RAG (nhánh non-Father-query), thêm 2 helper `normalizeQuery` và `removeDiacritics` ở đầu file. Không đụng schema, không đụng UI, không đụng các hàm khác.

## Kiểm thử thủ công sau khi deploy
Hỏi lần lượt và kỳ vọng Angel trả lời dựa trên bài "9 Tầng Tự Do":
1. "cho tôi bài thiền 9 tầng tự do"
2. "bài giảng chín tầng tự do của Cha"
3. "tu do tuyet doi la gi" (không dấu)
4. "9 layers of freedom meditation"
5. "thiền giải phóng tâm hồn"

Nếu (5) vẫn không match (vì không có từ "tự do" trực tiếp), đó là giới hạn chấp nhận được của RAG không-embedding — bước nâng cấp tiếp theo sẽ là vector embedding (đề xuất riêng khi cần).
