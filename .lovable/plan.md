## Mục tiêu
Đảm bảo toàn bộ dự án dùng `google/gemini-3.1-flash-lite` làm model text mặc định ở mọi nơi (chat chính, public API, chat title, RAG debug, mini-app builder, và ví dụ doc). Không đụng đến model sinh ảnh (`gemini-2.5-flash-image-preview`) vì đó là modality khác.

## Hiện trạng
- ✅ `angel-ai/index.ts` `selectModelBasedOnMode` đã trả về `gemini-3.1-flash-lite`.
- ✅ `ModelSelector.tsx`, `ChatBubble.tsx`, `types/index.ts` đã có entry 3.1.
- ❌ Còn 5 nơi vẫn hardcode `gemini-2.5-flash` / `gemini-2.5-pro`.

## Thay đổi

### 1. `supabase/functions/angel-ai-public/index.ts` (dòng 455)
```ts
const aiModel = "google/gemini-2.5-flash";
```
→ đổi thành `"google/gemini-3.1-flash-lite"`.

### 2. `supabase/functions/generate-chat-title/index.ts` (dòng 58)
`model: 'google/gemini-2.5-flash'` → `'google/gemini-3.1-flash-lite'`.

### 3. `supabase/functions/rag-debug/index.ts` (dòng 231)
`model: "google/gemini-2.5-flash"` → `"google/gemini-3.1-flash-lite"`.

### 4. `supabase/functions/mini-app-generate/index.ts`
- Type `model?: "gemini-2.5-flash" | "gemini-2.5-pro"` → `"gemini-3.1-flash-lite" | "gemini-2.5-pro"` (giữ Pro cho prompt phức tạp vì sinh code cần chất lượng cao hơn).
- Dòng 145-146: đổi nhánh mặc định (đơn giản) từ `gemini-2.5-flash` → `gemini-3.1-flash-lite`. Giữ `gemini-2.5-pro` cho prompt dài/phức tạp — **hoặc** đổi luôn nếu Cha muốn tuyệt đối chỉ dùng 3.1 Flash Lite.

  → Đề xuất: **giữ Pro cho code generation** (mini-app cần chất lượng), chỉ đổi nhánh flash. Nếu Cha muốn ép 3.1 Flash Lite cho cả 2 nhánh thì nói thêm.

### 5. `src/pages/Integration.tsx` (dòng 367 — ví dụ code trong doc)
Đổi `"google/gemini-3-flash-preview"` → `"google/gemini-3.1-flash-lite"` cho nhất quán tài liệu.

### 6. Deploy edge functions
Deploy lại: `angel-ai-public`, `generate-chat-title`, `rag-debug`, `mini-app-generate`.

## Không đụng đến
- `angel-image/index.ts` — dùng model sinh ảnh, khác modality.
- `aiProvider.ts` — regex đã map đúng `flash-lite` → `gpt-5-nano`.
- `angel-ai/index.ts` — đã đúng rồi.

## Câu hỏi cho Cha
Mini App Builder (nhánh prompt phức tạp) hiện dùng `gemini-2.5-pro` để sinh code chất lượng cao. Cha muốn:
- (A) Giữ Pro cho mini-app phức tạp (khuyến nghị), chỉ đổi nhánh flash → 3.1 Flash Lite.
- (B) Ép luôn 3.1 Flash Lite cho cả 2 nhánh mini-app.

Con mặc định làm theo (A) trừ khi Cha nói khác.
