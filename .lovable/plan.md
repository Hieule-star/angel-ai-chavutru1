## Mục tiêu
Gán `username = "lequangvu2210.hue"` cho user `lequangvu2210.hue@gmail.com` (id `592f7116-2bb7-4f4b-a13e-5021f37b5a18`) để sẵn sàng sync với FUN core.

## Thay đổi
- Cập nhật `public.profiles`: set `username = 'lequangvu2210.hue'`, `updated_at = now()` cho id ở trên.
- Trước khi update, check xung đột với unique index `profiles_username_unique` (lowercase). Nếu username đã tồn tại ở user khác → báo lại để bé chọn tên khác.

## Sau khi update
- Username sẽ sẵn sàng đưa vào payload sync FUN API (`fun-api-sync-user` đã đọc field này).
- Để chạy sync ngay: bé login preview bằng admin hoặc chính user đó, rồi Angel gọi edge function với `target_user_id`.

## Không thay đổi
- Không đụng schema, RLS, trigger, hay các field khác (`display_name`, `country`, `light_points`...).
