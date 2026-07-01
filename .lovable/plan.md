## Mục tiêu
Đặt **Gemini 3.1 Flash Lite** (`google/gemini-3.1-flash-lite`) làm model mặc định cho toàn bộ Angel AI, thay cho `google/gemini-2.5-flash-lite` hiện tại.

## Thay đổi

### 1. `src/types/index.ts`
- Thêm `'google/gemini-3.1-flash-lite'` vào union `AIModel`.
- Giữ các model cũ để tương thích lịch sử chat.

### 2. `src/components/chat/ModelSelector.tsx`
- Thêm entry `google/gemini-3.1-flash-lite` → label "Flash Lite 3.1", icon Zap, màu cyan.
- Đặt làm default fallback trong `getModelDisplayInfo`.

### 3. `src/components/chat/ChatBubble.tsx`
- Thêm case badge cho `google/gemini-3.1-flash-lite`.

### 4. `supabase/functions/angel-ai/index.ts`
- `selectModelBasedOnMode` trả về `google/gemini-3.1-flash-lite` cho mọi mode/độ dài.

### 5. `supabase/functions/angel-ai-public/index.ts`
- Cập nhật default model tương tự nếu có logic chọn model.

### 6. `supabase/functions/_shared/aiProvider.ts`
- `modelForGemini`: strip prefix `google/` → `gemini-3.1-flash-lite` (đã tự xử lý qua regex hiện tại, không cần thay).
- `modelForOpenAI`: đảm bảo regex `flash-lite` match `gemini-3.1-flash-lite` → `gpt-5-nano` (regex hiện tại đã đúng).
- Không cần đổi logic, chỉ verify.

### 7. Deploy
- Deploy lại `angel-ai` và `angel-ai-public`.

## Ghi chú kỹ thuật
- Model id chính xác theo catalog Lovable: `google/gemini-3.1-flash-lite` (T,I,A,V→T, cost-efficient).
- Gemini Direct API sẽ nhận `gemini-3.1-flash-lite` sau khi strip prefix.
- Fallback chain giữ nguyên: Gemini Direct → OpenAI (`gpt-5-nano`) → Lovable Gateway.
- Không đụng gì tới business logic RAG, chat history, hay UI khác.
