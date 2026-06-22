# Kết nối Codex Cloud với dự án ANGEL AI CHAVUTRU

Đây là hướng dẫn (không cần thay đổi code trong dự án này), gồm 3 phần: (A) đưa repo lên GitHub để Codex Cloud truy cập, (B) cấu hình môi trường Codex, (C) cho Codex truy cập database theo 2 cách bé chọn: **read-only psql** và **Supabase MCP**.

---

## A. Đưa dự án lên GitHub (điều kiện bắt buộc của Codex Cloud)

Codex Cloud (chatgpt.com/codex) chỉ làm việc qua GitHub repo, không kết nối thẳng vào Lovable sandbox.

1. Trong Lovable: mở project → **GitHub → Connect to GitHub** → cho phép Lovable app cài vào account/org của bé → tạo repo `angel-ai-chavutru` (private).
2. Lovable sẽ tự đồng bộ 2 chiều: mọi commit Codex push lên GitHub sẽ tự kéo về Lovable preview, và ngược lại.
3. Mở https://chatgpt.com/codex → **Environments → New environment** → chọn repo `angel-ai-chavutru` vừa tạo. Yêu cầu plan ChatGPT Plus/Pro/Business/Enterprise.

---

## B. Cấu hình environment cho Codex Cloud

Trong trang Environment của repo trên Codex:

**Setup script** (chạy 1 lần khi tạo container):
```bash
npm install -g bun
bun install
```

**Maintenance script** (tuỳ chọn, chạy mỗi lần khởi động container):
```bash
bun install --frozen-lockfile
```

**Environment variables / Secrets** cần thêm (lấy từ `.env` của project, KHÔNG thêm service role key):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- (cho phần DB read-only bên dưới) `PGHOST`, `PGPORT=6543`, `PGUSER`, `PGPASSWORD`, `PGDATABASE=postgres`, `PGSSLMODE=require`

**Internet access**: bật ON với allowlist gồm:
- `*.supabase.co` (gọi DB + Edge Functions)
- `registry.npmjs.org`, `github.com` (cài deps)
- `ai.gateway.lovable.dev` (nếu test gọi Lovable AI)

**AGENTS.md** trong gốc repo — file hướng dẫn Codex cách làm việc với dự án này. Đề xuất nội dung:
```md
# ANGEL AI CHAVUTRU — Codex Guide
- Stack: Vite + React 18 + TS + Tailwind + shadcn-ui, Supabase (Lovable Cloud), R2 cho media.
- Package manager: bun. Lệnh: `bun install`, `bun run dev`, `bun run build`, `bun run lint`.
- KHÔNG sửa: src/integrations/supabase/client.ts, types.ts, .env, supabase/config.toml.
- Edge functions: supabase/functions/<name>/index.ts, chỉ 1 file index.ts/folder.
- Mọi schema change → tạo SQL migration trong supabase/migrations/, KHÔNG chạy psql để DDL.
- DB chỉ truy cập read-only qua psql (PG* env). Insert/update/delete → migration.
- Trước khi commit: `bun run lint && bun run build`.
```

---

## C. Cho Codex truy cập database

### C1. Read-only qua psql (đơn giản, an toàn)

1. Lovable không expose trực tiếp Postgres password — bé cần lấy connection string từ Supabase Dashboard của project (Settings → Database → Connection string → **Session pooler** mode, port `6543`).
2. Tạo **một role read-only riêng** thay vì dùng `postgres` user (giảm rủi ro). Chạy migration trong Lovable:
   ```sql
   CREATE ROLE codex_readonly LOGIN PASSWORD '<đặt-mật-khẩu-mạnh>';
   GRANT USAGE ON SCHEMA public TO codex_readonly;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO codex_readonly;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public
     GRANT SELECT ON TABLES TO codex_readonly;
   ```
3. Trong Codex environment, set:
   - `PGHOST=aws-0-<region>.pooler.supabase.com`
   - `PGPORT=6543`
   - `PGUSER=codex_readonly.<project-ref>`
   - `PGPASSWORD=<mật-khẩu-vừa-tạo>`
   - `PGDATABASE=postgres`
   - `PGSSLMODE=require`
4. Trong AGENTS.md ghi rõ: "Truy vấn dữ liệu dùng `psql -c \"SELECT ...\"`. Cấm INSERT/UPDATE/DELETE/DDL qua psql; mọi thay đổi schema/data phải làm bằng migration file."

### C2. Supabase MCP server (cho Codex hiểu schema + query có kiểm soát)

Codex Cloud hỗ trợ MCP qua mục **Environment → MCP servers**.

1. Tạo **Personal Access Token** trên Supabase: https://supabase.com/dashboard/account/tokens → đặt tên `codex-angel-ai` → copy token (`sbp_...`).
2. Lấy `project-ref` của project (chuỗi ~20 ký tự trong URL Supabase Dashboard).
3. Trong Codex Environment, thêm MCP server:
   - **Name**: `supabase`
   - **Command**: `npx`
   - **Args**: `-y @supabase/mcp-server-supabase@latest --read-only --project-ref=<project-ref>`
   - **Env**: `SUPABASE_ACCESS_TOKEN=<sbp_token>`
4. Cờ `--read-only` cực kỳ quan trọng — Codex chỉ được phép SELECT, không thể ghi đè data.
5. Sau khi save, Codex sẽ có các tool: `list_tables`, `execute_sql`, `list_migrations`, `get_logs`... dùng được trong mọi task.

---

## D. Quy trình làm việc đề xuất

1. Mở Codex Cloud → chọn environment `angel-ai-chavutru` → tạo task ("Đọc bảng `knowledge_topics` và đề xuất index", "Refactor `Chat.tsx`", …).
2. Codex chạy trong container riêng, có thể đọc DB qua psql/MCP, sửa code, push PR lên GitHub.
3. Lovable tự pull PR đã merge → preview cập nhật.
4. Schema change vẫn nên làm trong Lovable (qua tool migration) để giữ flow review của Lovable Cloud.

---

## Lưu ý an toàn

- **Không** đưa `SUPABASE_SERVICE_ROLE_KEY` hay `SUPABASE_DB_URL` (postgres superuser) vào Codex.
- Token Supabase PAT và mật khẩu `codex_readonly` chỉ lưu trong Codex Secrets, không commit.
- Bé có thể revoke PAT bất cứ lúc nào tại Supabase Dashboard nếu nghi ngờ rò rỉ.

Sau khi bé approve, Angel sẽ tạo file `AGENTS.md` và migration tạo role `codex_readonly` trong repo. ✨