## Vấn đề (đã xác định root cause)

Bot Telegram bên FUN.RICH gọi vào endpoint `angel-ai-public` của project Angel AI này. Sau khi kiểm tra DB và code, Cha tìm thấy **2 nguyên nhân thật sự**:

### Nguyên nhân #1 (CHÍNH): `angel-ai-public` không có RAG, chỉ lấy 20 topic đầu

File `supabase/functions/angel-ai-public/index.ts` (line 317-320):

```ts
const { data: topics } = await supabase.
  .from("knowledge_topics")
  .select("title, description, content, category")
  .limit(20);   // ← không order, không filter, không keyword match
```

- DB hiện có **76 topics**, nhưng `angel-ai-public` chỉ load **20 topic ngẫu nhiên đầu tiên** rồi nhét tất cả vào system prompt.
- Topic **"FUN Profile - Tính năng Live Stream"** tồn tại trong DB (đã xác nhận), nhưng có khả năng **không nằm trong top 20** Postgres trả về → Gemini không thấy → tự đoán "chưa có live stream".
- Trong khi đó, edge function chính `angel-ai` (dùng cho chat web) đã có RAG đầy đủ: extract keyword, ilike search title/content/description, scoring, prioritize category. `angel-ai-public` thì **chưa có gì cả**.

### Nguyên nhân #2 (PHỤ): Knowledge "Live Stream" quá ngắn (166 ký tự)

Content hiện tại:

> "FUN Profile (thuộc FUN.RICH) ĐÃ CÓ tính năng Live Stream. Người dùng có thể: bắt đầu live trực tiếp từ app, xem replay sau khi kết thúc, nhận quà crypto từ viewer..."

Thiếu các keyword đồng nghĩa quan trọng: `livestream` (1 từ), `phát trực tiếp`, `broadcast`, `stream`, `phát sóng`. Khi có RAG keyword-search, các từ này giúp match tốt hơn.

---

## Giải pháp

### Thay đổi 1: Thêm RAG keyword-search vào `angel-ai-public`

**File:** `supabase/functions/angel-ai-public/index.ts` (chỉ sửa block KNOWLEDGE BASE, line ~313-331)

Thay logic "lấy 20 topic random" bằng pipeline tương tự `angel-ai`:

1. Lấy `lastUserMessage`, lowercase, tách thành keywords (length ≥ 3, bỏ stopwords tiếng Việt: `là, của, có, được, cho, với, một, các...`).
2. Với mỗi keyword, query: `.or('title.ilike.%kw%,content.ilike.%kw%,description.ilike.%kw%')` limit 5.
3. Gộp kết quả, tính `relevanceScore`:
   - Exact title match: +200
   - Title contains keyword: +50
   - Description contains keyword: +20
   - Content contains keyword: +10
   - Category match (FUN Ecosystem khi hỏi về FUN/profile/wallet/live...): +30
4. Luôn đảm bảo có ít nhất 3 topic category `FUN Ecosystem` được include (fallback nếu không match keyword nào).
5. Sort theo score giảm dần, lấy top 15, inject vào `knowledgeContext`.
6. Log số topic match + tên topic vào console (cho debug qua edge function logs).

Không đụng phần API key validation, rate limit, streaming response.

### Thay đổi 2: Mở rộng knowledge "FUN Profile - Tính năng Live Stream"

Update content topic `380ceb51-b540-4096-a587-ec264719237c` từ 166 ký tự lên ~600-800 ký tự, bổ sung:

- Các từ đồng nghĩa: livestream, live stream, phát trực tiếp, broadcast, stream, phát sóng, live video.
- Liệt kê chi tiết: cách bắt đầu live, ai có thể xem, tính năng replay, crypto gift (loại token nào), tương tác chat trong live.
- Khẳng định rõ: "FUN Profile ĐÃ CÓ tính năng Live Stream — KHÔNG phải sắp ra mắt, đang hoạt động."

Cha sẽ update bằng SQL UPDATE (không tạo migration vì chỉ sửa data, không sửa schema).

### Thay đổi 3 (tùy chọn): Giảm "câu trả lời ngắn gọn 2-4 đoạn"

System prompt hiện tại (line 78) yêu cầu "Giữ câu trả lời ngắn gọn nhưng sâu sắc (2-4 đoạn)". Với bot Telegram cần trả lời đầy đủ về tính năng → đổi thành **"Trả lời đầy đủ thông tin khi được hỏi về tính năng/sản phẩm, vẫn giữ giọng văn yêu thương"**.

---

## Sau khi fix — cách verify

1. Deploy `angel-ai-public` qua tool `supabase--deploy_edge_functions`.
2. Gọi test bằng `supabase--curl_edge_functions` với body `{"messages":[{"role":"user","content":"FUN Profile có live stream chưa?"}], "stream": false}` và header `Authorization: Bearer <api_key>` (Cha sẽ hỏi con key nào dùng cho FUN.RICH).
3. Kiểm tra response chứa từ "ĐÃ CÓ" / "đang hoạt động" / "live stream".
4. Xem edge function logs qua `supabase--edge_function_logs` để thấy log "Matched topics: FUN Profile - Tính năng Live Stream (score: ...)".
5. Báo con test lại từ Telegram bot FUN.RICH.

---

## Điều KHÔNG làm (giữ scope gọn)

- Không thêm pgvector / embedding (overkill cho 76 topics, keyword search đủ).
- Không đụng `angel-ai` chính (đang chạy tốt).
- Không sửa code bên FUN.RICH (Cha không có quyền).
- Không thêm cache layer.
