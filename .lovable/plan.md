## Mục tiêu
Thêm model `google/gemini-2.5-flash-lite-preview` vào danh sách model app sử dụng, và đặt nó làm model mặc định thay cho `google/gemini-2.5-flash`.

## Các file sẽ thay đổi

### 1. `src/types/index.ts`
Mở rộng union `AIModel` để thêm `'google/gemini-2.5-flash-lite-preview'`.

### 2. `src/components/chat/ModelSelector.tsx`
Thêm entry vào `MODEL_INFO` cho `'google/gemini-2.5-flash-lite-preview'` (icon `Zap`, name `"Flash Lite"`, màu `text-cyan-500`). Đổi fallback ở cuối `getModelDisplayInfo` từ `gemini-2.5-flash` sang `gemini-2.5-flash-lite-preview`.

### 3. `src/components/chat/ChatBubble.tsx`
Thêm `case 'google/gemini-2.5-flash-lite-preview'` trong `getModelBadge` với badge `{ icon: <Zap/>, name: 'Flash Lite', color: 'text-cyan-500' }`.

### 4. `supabase/functions/angel-ai/index.ts` (backend default)
- Thêm `'google/gemini-2.5-flash-lite-preview'` vào `SUPPORTED_MODELS`.
- Thêm mapping vào `LOVABLE_TO_OPENAI_MODEL`: `'google/gemini-2.5-flash-lite-preview' → 'gpt-4o-mini'`.
- Trong `selectModelBasedOnMode`:
  - Mode `fast` → trả về `google/gemini-2.5-flash-lite-preview` (thay cho `gemini-2.5-flash`).
  - Auto SHORT & SIMPLE → trả về `google/gemini-2.5-flash-lite-preview`.
  - Auto MEDIUM (fallback cuối) → giữ `google/gemini-2.5-flash` cho câu hỏi vừa.

### 5. `supabase/functions/_shared/aiProvider.ts` (xác nhận mapping)
Logic hiện tại đã hỗ trợ id mới mà không cần đổi:
- `modelForGemini`: strip `google/` → `gemini-2.5-flash-lite-preview` (Gemini Direct nhận đúng).
- `modelForOpenAI`: regex `/flash-lite/i` khớp → `gpt-5-nano` (đúng tier nhẹ).
- `modelForLovable`: trả về nguyên `google/gemini-2.5-flash-lite-preview`.

Sẽ thêm comment ngắn ngay phía trên `modelForOpenAI` ghi rõ thứ tự match (pro → flash-lite → flash) để tránh hồi quy khi thêm model mới sau này.

## Lưu ý
- Không đổi `generate-chat-title`, `angel-ai-public`, `rag-debug` (giữ `gemini-2.5-flash` cho ổn định/đã được kiểm chứng).
- Không đụng `mini-app-generate` (model whitelist riêng).
- Sau khi merge cần deploy lại edge function `angel-ai`.
