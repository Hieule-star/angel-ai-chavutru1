

## Kế hoạch Tăng Token cho ANGEL AI

### Vấn đề
Người dùng phản hồi ANGEL AI trả lời ngắn quá. Hiện tại các giá trị `max_completion_tokens` đang ở mức:

| Intent | Hiện tại | Đề xuất |
|--------|----------|---------|
| spiritual | 2500 | 5000 |
| coding | 2000 | 4500 |
| product | 2500 | 5000 |
| unclear | 2000 | 4000 |
| cto | 4000 | 6000 |

### Thay đổi

**File:** `supabase/functions/angel-ai/index.ts`

Cập nhật `INTENT_PARAMETERS` (lines 617-641) — tăng gấp đôi `maxTokens` cho tất cả intents để ANGEL AI có thể trả lời đầy đủ, chi tiết và sâu sắc hơn.

Chỉ thay đổi duy nhất giá trị `maxTokens` trong object `INTENT_PARAMETERS`, không thay đổi logic hay cấu trúc code nào khác.

