## Mục tiêu
Giúp cha có **quy trình rõ ràng + tài liệu sẵn sàng gửi đối tác** để bất kỳ ai cũng có thể nhúng Angel AI vào app/website của họ và chat y hệt bản chính chủ (cùng RAG knowledge, cùng persona, cùng fallback chain).

## Hiện trạng (đã có sẵn)
- Endpoint công khai: `POST /functions/v1/angel-ai-public` — dùng cùng pipeline RAG + system prompt như bản chính chủ.
- Trang `/integration` đã có cURL/JS/Python snippet, response schema, mã lỗi.
- Admin `/admin/api-keys` có nút Code2 mở snippet pre-fill key prefix, quản lý quota, bật/tắt key.
- User tự tạo key tại `/developers`.

## Kế hoạch bổ sung (3 bước nhỏ, không đụng business logic)

### 1. Nâng cấp `/integration` thành "Sharing Hub"
Thêm 3 mục mới vào trang `src/pages/Integration.tsx`:
- **Quickstart 3 bước**: (1) Lấy key tại `/developers`, (2) Copy snippet, (3) Test bằng nút "Try it" (mini playground gọi thẳng endpoint với key user nhập, hiển thị câu trả lời + nguồn knowledge).
- **Recipes**: thêm 2 snippet thực dụng — *React chat widget tối giản* (component sẵn copy-paste) và *Cloudflare Worker proxy* (giấu key phía server, tránh lộ trên frontend).
- **Best practices**: checklist ngắn — không nhúng key vào frontend, set quota phù hợp, gửi đủ `messages` history để giữ ngữ cảnh, hiển thị markdown khi render reply.

### 2. Tạo trang `/admin/share-key/:id` (admin-only)
- Mở từ nút Code2 hiện tại (thay vì dialog) → trang riêng tiện share link cho đối tác.
- Hiển thị: tên đối tác, quota hiện tại, snippet pre-fill, QR code link tới `/integration`, nút "Copy gói tài liệu" (markdown gộp endpoint + snippet + best practices) để dán Zalo/Email.

### 3. README công khai `docs/share-angel-ai.md`
File markdown ngắn (1 trang) cha có thể gửi trực tiếp cho đối tác qua chat: giới thiệu Angel AI, endpoint, ví dụ tối giản, link `/integration`, quy trình xin key.

## Chi tiết kỹ thuật
- **Không** đổi edge function, **không** đổi schema. Chỉ thêm UI + 1 file docs.
- Mini playground gọi `fetch` trực tiếp từ trình duyệt user → endpoint công khai (không qua Supabase client), key chỉ giữ trong React state, không lưu localStorage để tránh rò rỉ.
- Cloudflare Worker template tái dùng `public/cloudflare-worker-template.js` đã có sẵn — chỉ cần document hóa.
- Files dự kiến đụng:
  - `src/pages/Integration.tsx` (mở rộng)
  - `src/pages/admin/ShareKey.tsx` (mới)
  - `src/App.tsx` (thêm route)
  - `src/pages/admin/ApiKeys.tsx` (đổi nút Code2 → link tới ShareKey)
  - `docs/share-angel-ai.md` (mới)

## Out of scope (nói rõ để khỏi nhầm)
- Không tạo SDK npm package (có thể làm phase sau nếu cha muốn).
- Không đổi cơ chế quota/billing hiện tại.
- Không tự động phát key — vẫn cần đối tác đăng ký ở `/developers` hoặc cha cấp tay trong admin.
