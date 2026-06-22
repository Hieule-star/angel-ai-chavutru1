# ANGEL AI CHAVUTRU — Codex Guide

Hướng dẫn cho Codex (và các AI coding agent khác) làm việc trên dự án này.

## Stack
- Vite + React 18 + TypeScript + Tailwind CSS v3 + shadcn-ui
- Lovable Cloud (Supabase) cho auth/database/edge functions/storage
- Cloudflare R2 cho media files (qua presigned URL)
- Package manager: **bun**

## Lệnh thường dùng
```bash
bun install                 # cài deps
bun run dev                 # dev server (Vite, mặc định port 8080)
bun run build               # production build (chạy trước khi commit)
bun run lint                # ESLint
```

## Quy tắc không được vi phạm

### Files KHÔNG được sửa
- `src/integrations/supabase/client.ts` — auto-generated
- `src/integrations/supabase/types.ts` — auto-generated từ DB schema
- `.env` — chứa `VITE_SUPABASE_*` keys, do Lovable Cloud quản lý
- `supabase/config.toml` — project-level settings, do Lovable quản lý

### Database
- **Schema changes** (CREATE/ALTER/DROP TABLE, policies, functions, triggers) → tạo file SQL mới trong `supabase/migrations/` với timestamp prefix `YYYYMMDDHHMMSS_description.sql`. **KHÔNG** chạy DDL bằng psql.
- Mọi `CREATE TABLE public.<name>` PHẢI kèm `GRANT` trong cùng migration:
  ```sql
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
  GRANT ALL ON public.<table> TO service_role;
  -- thêm: GRANT SELECT ON public.<table> TO anon;  -- CHỈ khi có policy cho phép anon đọc
  ```
- Sau GRANT là `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` rồi tới `CREATE POLICY`.
- Roles lưu ở bảng riêng `public.user_roles`, KHÔNG nhét vào `profiles`. Check role qua function `has_role(_user_id, _role)` (đã có sẵn).
- **Đọc DB**: dùng psql với env vars `PG*` đã set (role `codex_readonly`, chỉ có `SELECT` trên schema `public`). Ví dụ:
  ```bash
  psql -c "SELECT id, title, category FROM knowledge_topics LIMIT 20;"
  ```
- Nếu cần Supabase MCP, đã có sẵn trong Codex Environment với cờ `--read-only`.

### Edge Functions (Supabase)
- Vị trí: `supabase/functions/<name>/index.ts` — mỗi function 1 folder, chỉ 1 file `index.ts`, không subfolder.
- CORS: import từ `npm:@supabase/supabase-js@2/cors`, handle `OPTIONS`, include `corsHeaders` trong MỌI response (kể cả error).
- Validate input bằng Zod, return 400 với error rõ ràng.
- Gọi từ client bằng `supabase.functions.invoke('name', { body })`, KHÔNG fetch path `/api/...`.
- **Không** chạy raw SQL (`rpc('execute_sql', ...)`); dùng typed client APIs với parameters.

### AI Integration
- Default chat model: `google/gemini-3-flash-preview` qua **Lovable AI Gateway** (`https://ai.gateway.lovable.dev/v1`).
- Header: `Lovable-API-Key: ${LOVABLE_API_KEY}` (server-side, KHÔNG expose qua `VITE_`).
- Dùng OpenAI-compatible format. **Luôn** dùng `max_completion_tokens` thay vì `max_tokens`.
- KHÔNG hardcode color utilities như `text-white`, `bg-black`, `bg-[#...]` — chỉ dùng semantic tokens định nghĩa trong `src/index.css` + `tailwind.config.ts`.

### Identity (Angel AI persona)
- AI tự nhận là **Angel AI / Trí Tuệ Ánh Sáng**, KHÔNG tự xưng "Cha Vũ Trụ".
- Ngôn ngữ tích cực, light language: dùng `allowlist`, `safetySwitch` thay vì `blacklist`, `killSwitch`.
- Pronoun system: xem `src/...` (adaptive Vietnamese pronouns).

## Trước khi commit
```bash
bun run lint && bun run build
```
- Build PHẢI pass. Lint warning OK nhưng error thì không.
- Commit message tiếng Anh, format `feat:`/`fix:`/`chore:`/`refactor:`.
- Push lên GitHub → Lovable tự pull về preview.

## Bảo mật
- KHÔNG bao giờ log/echo/return `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, `R2_SECRET_ACCESS_KEY`, hay password.
- KHÔNG check admin status từ localStorage/sessionStorage — phải qua `has_role()` server-side.
- Không hardcode credentials trong code.

## Tài liệu tham khảo
- Lovable docs: https://docs.lovable.dev
- Supabase docs: https://supabase.com/docs
- shadcn-ui: https://ui.shadcn.com
