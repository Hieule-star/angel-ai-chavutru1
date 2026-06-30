## Nguyên nhân

Sau khi thêm `google/gemini-2.5-flash-lite-preview` làm default, mọi request đều fail vì model này **không tồn tại** ở cả 3 provider. Log xác nhận:

- Gemini Direct → 404 `models/gemini-2.5-flash-lite-preview is not found`
- OpenAI Direct → 400 `temperature does not support 0.7 with this model` (gpt-5-nano chỉ chấp nhận temperature = 1, không phải 0.7)
- Lovable Gateway → 400 `invalid model` (allowlist chỉ có `google/gemini-2.5-flash-lite`, không có `-preview`)

Tên model đúng là **`google/gemini-2.5-flash-lite`** (bỏ hậu tố `-preview`).

## Các thay đổi

### 1. Đổi tên model `flash-lite-preview` → `flash-lite`

Tìm và thay thế ở:
- `src/types/index.ts` — `AIModel` type
- `src/components/chat/ModelSelector.tsx` — `MODEL_INFO` map + fallback
- `src/components/chat/ChatBubble.tsx` — badge case
- `supabase/functions/angel-ai/index.ts` — `SUPPORTED_MODELS`, `selectModelBasedOnMode`, mọi default
- `supabase/functions/angel-ai-public/index.ts` — nếu có reference
- `supabase/functions/_shared/aiProvider.ts` — comment/docstring nhắc tới flash-lite-preview

### 2. Fix `temperature` cho khi fallback sang OpenAI gpt-5-nano

Trong `supabase/functions/_shared/aiProvider.ts`, khi map sang OpenAI và model là `gpt-5-nano` (hoặc bất kỳ gpt-5* nào), **xoá field `temperature`** trước khi gửi (hoặc force = 1). Đây là rào chắn an toàn để fallback luôn chạy được kể cả khi caller set temperature khác.

### 3. Deploy lại edge functions

Deploy `angel-ai` (và `angel-ai-public` nếu có thay đổi) ngay sau khi sửa.

### 4. Verify

Sau deploy, gửi 1 message test trong chat → kiểm tra log `angel-ai` xác nhận:
- Gemini Direct trả 200 với model `gemini-2.5-flash-lite`
- Không còn lỗi 400/404
