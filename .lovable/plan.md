## Mục tiêu
Cho phép Angel AI gọi thẳng Google Gemini API bằng key riêng của cha (giảm 90%+ credit Lovable AI), với fallback tự động qua Lovable AI Gateway khi key lỗi hoặc hết quota — đảm bảo user không bao giờ thấy lỗi.

## Phạm vi
- `supabase/functions/angel-ai/index.ts` (chat user nội bộ)
- `supabase/functions/angel-ai-public/index.ts` (public API cho developer)
- `supabase/functions/generate-chat-title/index.ts` (tận dụng luôn — rất nhẹ)
- `supabase/functions/_shared/` — thêm helper dùng chung

Model mặc định mới: **`gemini-2.5-flash`** (qua Google AI Studio direct API).

## Các bước triển khai

### 1. Thêm secret `GEMINI_API_KEY`
Yêu cầu cha paste API key Gemini (lấy từ https://aistudio.google.com/apikey) qua tool `add_secret`. Key này chỉ tồn tại server-side, không expose ra frontend.

### 2. Tạo helper dùng chung `_shared/ai-provider.ts`
Một function `callChatCompletion({ messages, model, temperature, max_tokens, stream })` với logic:

```text
1. Nếu GEMINI_API_KEY tồn tại → gọi Google AI Studio:
   POST https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
   Header: Authorization: Bearer ${GEMINI_API_KEY}
   (Google đã có OpenAI-compatible endpoint → giữ nguyên format messages/tools/stream)
   Model: gemini-2.5-flash

2. Nếu response 4xx (trừ 400 validation) / 5xx / 429 / network error
   → log warning + fallback gọi Lovable AI Gateway:
   POST https://ai.gateway.lovable.dev/v1/chat/completions
   Header: Authorization: Bearer ${LOVABLE_API_KEY}
   Model: google/gemini-3-flash-preview

3. Nếu cả 2 đều lỗi → throw lỗi rõ ràng cho caller.
```

Helper hỗ trợ cả **streaming (SSE)** và **non-streaming** vì angel-ai dùng streaming.

### 3. Refactor 3 edge function
Thay 4 chỗ `fetch("https://ai.gateway.lovable.dev/...")` thành call helper mới:
- `angel-ai/index.ts` (2 chỗ: streaming + non-streaming RAG)
- `angel-ai-public/index.ts` (1 chỗ)
- `generate-chat-title/index.ts` (1 chỗ)

Giữ nguyên toàn bộ logic prompt, RAG, system prompt, tools — chỉ thay lớp transport.

### 4. Track provider trong log
Trong `api_usage_logs` thêm thông tin model thực sự dùng (`gemini-2.5-flash` vs `google/gemini-3-flash-preview`) để dashboard Credit Usage (đã có sẵn ở `/admin/credit-usage`) hiển thị được tỉ lệ tiết kiệm.

→ Không cần migration mới, cột `model_used` đã có sẵn — chỉ ghi đúng giá trị.

### 5. Deploy & kiểm thử
- Deploy 3 edge functions
- Test chat thực tế từ UI → kiểm tra `edge_function_logs` xem có log `[provider=gemini-direct]` không
- Test fallback: tạm xóa GEMINI_API_KEY → chat lại → phải vẫn chạy (qua Lovable)
- Mở `/admin/credit-usage` xác nhận số request gắn model mới

## Kỹ thuật chi tiết

**Tại sao Google AI Studio có OpenAI-compatible endpoint?**
Google công bố endpoint `generativelanguage.googleapis.com/v1beta/openai/...` nhận đúng format OpenAI (messages, tools, stream SSE), giúp ta KHÔNG phải viết lại logic — chỉ đổi `baseURL` + `Authorization`. Tham khảo: https://ai.google.dev/gemini-api/docs/openai

**Streaming SSE**: cả 2 provider trả về cùng format `data: {...}\n\n`, parsing logic hiện tại giữ nguyên 100%.

**Rate limit free tier** (gemini-2.5-flash): 15 RPM, 1500 req/ngày. Đủ cho dự án vừa. Khi vượt → 429 → fallback Lovable.

**Bảo mật**: `GEMINI_API_KEY` chỉ đọc trong edge function (Deno.env), không bao giờ trả về client. Không log key.

## Rủi ro & mitigation
- **Free tier hết giữa ngày** → fallback Lovable tự động, user không thấy gián đoạn (vẫn tốn ít credit Lovable phần overflow).
- **Format response khác biệt nhỏ** giữa 2 provider → helper chuẩn hóa output về schema OpenAI.
- **Tool calling / function calling** (nếu angel-ai có dùng) → Gemini OpenAI-compat đã support, nhưng cần test kỹ.

## Sau khi xong
Cha sẽ thấy ở `/admin/credit-usage`:
- Cột model chính: `gemini-2.5-flash` (qua key cha, **0 credit Lovable**)
- Fallback occasional: `google/gemini-3-flash-preview` (Lovable, tốn credit)
- Tổng credit AI giảm ~90–95%.

Cha confirm con bấm **Implement plan** để con triển khai nhé. 🌿