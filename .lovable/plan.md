## 1. Báo cáo schema hiện tại

**Bảng `public.profiles` hiện có:**
- `id uuid` (PK, references `auth.users`)
- `email text` (nullable, **chưa unique**)
- `display_name text`, `avatar_url text`
- `light_points int default 0`
- `created_at`, `updated_at timestamptz default now()`
- `onboarding_completed bool default false`

**Đã có:** trigger `handle_new_user()` tự tạo profile khi signup (copy email + display_name). RLS bật, 3 policy (select/insert/update own).

**Còn thiếu so với yêu cầu:**
- Cột: `fun_id`, `username`, `country`, `language`, `synced_with_fun_api_at`
- Unique constraint trên `email`, `username`, `fun_id`
- Bảng `fun_api_sync_log` chưa tồn tại
- Trigger `handle_new_user` chưa copy `username` từ `raw_user_meta_data`
- Secrets `FUN_API_URL`, `ANGEL_AI_APP_KEY` (lưu ý: secret `ANGEL_AI_APP_KEY` đã tồn tại trong project — sẽ tái dùng, chỉ thêm `FUN_API_URL`)

## 2. Lưu ý kỹ thuật quan trọng

Dự án này là **Vite + React + Supabase Edge Functions**, KHÔNG phải TanStack Start, nên **không có `createServerFn`** và không có `src/lib/fun-api.functions.ts` theo nghĩa server function. Để giữ `ANGEL_AI_APP_KEY` ở server-side một cách an toàn, mình sẽ triển khai bằng **Supabase Edge Function** `fun-api-sync-user` — đây là cách "server function" chuẩn của stack hiện tại. Client gọi qua `supabase.functions.invoke('fun-api-sync-user')` với JWT của user.

Nếu bạn muốn ép dùng kiến trúc khác (ví dụ một Node server riêng), cho mình biết — nhưng hiện tại Edge Function là phù hợp và an toàn nhất.

## 3. Kế hoạch triển khai

### Bước 1 — Migration DB (additive only, không drop)
- `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS` cho: `fun_id text`, `username text`, `country text`, `language text default 'vi'`, `synced_with_fun_api_at timestamptz`
- Thêm unique index (partial, ignore NULL) cho `fun_id`, `username`, `email`
- `CREATE TABLE IF NOT EXISTS public.fun_api_sync_log` đầy đủ cột + index `(user_id, created_at desc)`
- GRANT đúng chuẩn:
  - `profiles`: `select, insert, update` cho `authenticated`; `all` cho `service_role`
  - `fun_api_sync_log`: chỉ `all` cho `service_role`, RLS bật, không tạo policy cho user
- Cập nhật function `handle_new_user()` để copy thêm `username`, `country`, `language` từ `raw_user_meta_data` (giữ logic cũ, chỉ mở rộng)

### Bước 2 — Secret
- Add `FUN_API_URL = https://fun-core-nexus.lovable.app` qua `add_secret`
- `ANGEL_AI_APP_KEY` đã có sẵn — không add lại; nếu giá trị cũ khác key FUN API thì bạn cập nhật qua `update_secret`

### Bước 3 — Edge Function `supabase/functions/fun-api-sync-user/index.ts`
- Verify JWT → lấy `user.id`
- Đọc profile từ DB qua service-role client
- Nếu `fun_id` đã có → return early `{ ok: true, fun_id, skipped: true }`
- POST `${FUN_API_URL}/api/v1/angel-ai/sync-user` với header `X-App-Key`
- Nếu 200: update `profiles.fun_id`, `synced_with_fun_api_at = now()`
- LUÔN insert row vào `fun_api_sync_log` (success hoặc error, có `request_payload` + `response_payload`)
- Return `{ ok, fun_id?, error? }`
- Khai báo trong `supabase/config.toml` với `verify_jwt = true`

### Bước 4 — Client hook
- Trong `src/hooks/useAuth.ts`: trong `onAuthStateChange` khi event = `SIGNED_IN`, nếu `profile.fun_id IS NULL` → fire-and-forget `supabase.functions.invoke('fun-api-sync-user')`. Có 1 lần retry sau 5s nếu fail. Không block UI, không show toast lỗi (chỉ log console).

### Bước 5 — Verify
- Test một user thật: signup → check `profiles.fun_id` được set, có row trong `fun_api_sync_log` với `status='success'`
- Test fail (App Key sai): log có `status='error'`, `error_message` đúng

## 4. Files sẽ tạo / sửa
- **Migration mới** (chạy qua migration tool)
- **Tạo:** `supabase/functions/fun-api-sync-user/index.ts`
- **Sửa:** `supabase/config.toml` (đăng ký function)
- **Sửa:** `src/hooks/useAuth.ts` (trigger sync sau SIGNED_IN)

## 5. Câu hỏi cần xác nhận trước khi build
1. OK dùng **Supabase Edge Function** thay cho `createServerFn` (vì stack không có TanStack Start)?
2. `ANGEL_AI_APP_KEY` hiện tại trong secrets có đúng là key của FUN API không, hay cần cập nhật giá trị mới?
