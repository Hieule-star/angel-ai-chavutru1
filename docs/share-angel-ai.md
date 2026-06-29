# Chia sẻ Angel AI cho đối tác

Angel AI Public API cho phép bất kỳ app/website nào nhúng Angel AI với cùng
knowledge base như bản chính chủ (FUN Ecosystem, 8 Thần Chú, Hiến Pháp FUN
Kingdom, các bài dẫn thiền, Light Constitution…) và cùng persona "Trí Tuệ Ánh Sáng".

## 1. Endpoint

```
POST https://sasbfslupxdsaqifnqzx.supabase.co/functions/v1/angel-ai-public
Authorization: Bearer angel_xxxxxxxxxxxxxxxx
Content-Type: application/json
```

Body theo chuẩn OpenAI chat:

```json
{
  "messages": [
    { "role": "user", "content": "Giải thích 8 Thần Chú giúp mình" }
  ]
}
```

Response:

```json
{
  "message": "…câu trả lời của Angel AI (đã RAG knowledge)…",
  "model": "google/gemini-3-flash-preview",
  "usage": { "prompt_tokens": 1234, "completion_tokens": 256 }
}
```

## 2. Quy trình cấp key

| Trường hợp | Hướng dẫn |
|---|---|
| **Developer cá nhân tự đăng ký** | Vào `/developers`, tạo key miễn phí 1.000 req/ngày |
| **Đối tác / tổ chức cần quota cao** | Liên hệ admin → admin tạo trong `/admin/api-keys` và set `daily_limit` riêng |
| **Đối tác cần gói tài liệu sẵn** | Admin mở `/admin/share-key/:id` → bấm "Copy markdown" → dán vào Zalo/Email |

## 3. Hướng dẫn đầy đủ cho đối tác

Gửi 1 link duy nhất: **`https://angel-ai-chavutru.lovable.app/integration`**

Trang này có:
- Quickstart 3 bước
- Ô dán API key + nút "Try it" gọi thật ngay trên trình duyệt
- 5 snippet copy-paste: cURL, JavaScript, Python, React Widget, Cloudflare Worker
- Best practices + bảng mã lỗi

## 4. Best practices nhắc đối tác

- **KHÔNG** nhúng key trực tiếp ở frontend production. Proxy qua server hoặc Cloudflare Worker (đã có sẵn snippet ở tab "Cloudflare Worker").
- Gửi nguyên `messages` history (~20 lượt gần nhất) để Angel giữ ngữ cảnh.
- Render reply bằng markdown (`react-markdown` hoặc tương đương).
- Bật retry exponential backoff cho lỗi 5xx; dừng ngay khi 401 hoặc 429.

## 5. Monitoring

- Admin: `/admin/api-keys` xem trạng thái + quota từng key, bật/tắt nhanh.
- Admin: `/admin/api-analytics` xem usage theo key/route.
- Admin: `/admin/credit-usage` xem chi phí AI theo ngày.

## 6. Bảo mật

- Key có prefix `angel_` + hash trong DB. Full key chỉ hiện 1 lần lúc tạo — admin
  cần copy gửi đối tác ngay tại thời điểm đó.
- Mỗi request được log: timestamp, key_id, route, status, latency (KHÔNG log nội dung).
- Quota daily reset tự động theo UTC.
- Tạm ngưng đối tác lạm dụng: toggle `is_active` ở `/admin/api-keys`.
