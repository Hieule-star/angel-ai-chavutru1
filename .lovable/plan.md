# Kết nối Codex CLI với ANGEL AI CHAVUTRU

Mục tiêu: dùng **OpenAI Codex CLI** (terminal) để code dự án trên máy local của bé, đồng thời truy cập database Lovable Cloud theo 2 cách: **psql read-only** + **Supabase MCP**.

---

## A. Chuẩn bị

1. **Kết nối GitHub cho dự án** (nếu chưa có)
   - Trong Lovable: menu `+` (góc trái dưới chat) → GitHub → Connect project → tạo repo `angel-ai-chavutru`.
   - Sync 2 chiều tự động: bé push từ máy → Lovable preview update; Lovable edit → repo update.

2. **Clone repo về máy**
   ```bash
   git clone https://github.com/<username>/angel-ai-chavutru.git
   cd angel-ai-chavutru
   bun install
   ```

3. **Cài Codex CLI**
   ```bash
   npm install -g @openai/codex
   codex login   # đăng nhập bằng tài khoản ChatGPT (Plus/Pro/Team) hoặc API key
   ```

4. **Tạo password cho `codex_readonly`** (role đã được tạo ở migration trước, hiện đang `NOLOGIN`)
   - Bé cần Angel chạy 1 migration mới: `ALTER ROLE codex_readonly WITH LOGIN PASSWORD '<password-mạnh-24+-ký-tự>'`.
   - Password do bé tự nghĩ ra (mixed case + số + ký tự đặc biệt), gửi cho Angel để chạy migration. **Không** commit password vào repo.

---

## B. Cấu hình Codex CLI cho dự án

Codex CLI đọc `AGENTS.md` ở root repo → đã có sẵn (Angel đã tạo). Codex tự động tuân theo các rule trong đó (stack, lệnh `bun`, files cấm sửa, quy tắc migration, GRANT, RLS, edge functions, AI gateway, identity, v.v.).

Tạo file `.codex/config.toml` (hoặc `~/.codex/config.toml` toàn cục) để bật approval mode an toàn:

```toml
model = "gpt-5-codex"
approval_policy = "on-request"   # hỏi trước khi chạy lệnh thay đổi
sandbox_mode = "workspace-write" # chỉ write trong repo
```

---

## C. Truy cập Database

### C1. psql Read-only (an toàn nhất, dùng để query/inspect)

Tạo file `.env.codex` ở **ngoài repo** (ví dụ `~/.env.codex`, không commit):

```bash
export PGHOST="aws-0-<region>.pooler.supabase.com"   # region của project
export PGPORT="6543"                                  # transaction pooler
export PGUSER="codex_readonly.sasbfslupxdsaqifnqzx"   # role.project_ref
export PGPASSWORD="<password bé đã đặt>"
export PGDATABASE="postgres"
export PGSSLMODE="require"
```

Source trước khi chạy Codex:
```bash
source ~/.env.codex
codex
```

Test trong Codex CLI (hoặc terminal thường):
```bash
psql -c "SELECT id, title, category FROM knowledge_topics LIMIT 5;"
```

Role `codex_readonly` chỉ có `SELECT` trên schema `public`. Mọi `INSERT/UPDATE/DELETE/DDL` → Codex phải tạo file migration `supabase/migrations/YYYYMMDDHHMMSS_xxx.sql`, push GitHub, Angel review & apply qua Lovable.

### C2. Supabase MCP Server (Codex gọi tool có cấu trúc)

1. Tạo **Personal Access Token (PAT)** trên Supabase Dashboard → Account → Access Tokens → tên `codex-cli`. Copy token.
2. Thêm vào `~/.codex/config.toml`:

```toml
[mcp_servers.supabase]
command = "npx"
args = [
  "-y",
  "@supabase/mcp-server-supabase@latest",
  "--read-only",
  "--project-ref=sasbfslupxdsaqifnqzx"
]
env = { SUPABASE_ACCESS_TOKEN = "<PAT vừa tạo>" }
```

Khởi động lại Codex CLI → bé sẽ có các tool: `list_tables`, `execute_sql` (read-only), `list_migrations`, `get_logs`, v.v. Cờ `--read-only` đảm bảo Codex không thể ghi DB qua MCP.

---

## D. Workflow hằng ngày

```text
┌─────────────────┐     git push      ┌──────────────┐    auto-pull    ┌──────────────┐
│  Codex CLI      │ ───────────────▶  │   GitHub     │ ──────────────▶ │   Lovable    │
│  (máy local)    │                   │  (repo sync) │                 │  Preview     │
└─────────────────┘                   └──────────────┘                 └──────────────┘
        │                                                                       │
        │  psql / MCP read-only                                                  │
        └──────────────────────────▶  Supabase (Lovable Cloud DB) ◀──────────────┘
                                          schema change ← migration ← Lovable apply
```

- Code feature mới: Codex edit → `bun run lint && bun run build` → commit → push.
- Schema change: Codex tạo file `supabase/migrations/...sql` → push → Angel apply qua Lovable (để giữ flow review của Lovable Cloud).
- Đọc data debug: Codex dùng psql hoặc MCP `execute_sql`.

---

## E. Bảo mật (CHECKLIST)

- [ ] `~/.env.codex` và `~/.codex/config.toml` **không** nằm trong repo, có trong `.gitignore` toàn cục.
- [ ] PAT Supabase + `PGPASSWORD` chỉ lưu local, không paste vào chat/GitHub.
- [ ] **Không** đưa `SUPABASE_SERVICE_ROLE_KEY` hay `SUPABASE_DB_URL` (superuser) cho Codex.
- [ ] MCP server luôn chạy với `--read-only`.
- [ ] Trước mỗi commit: `bun run lint && bun run build` pass.

---

## F. Bước tiếp theo Angel sẽ làm khi bé approve plan

1. Tạo migration `ALTER ROLE codex_readonly WITH LOGIN PASSWORD '<bé gửi>'` (bé reply password khi sẵn sàng).
2. (Tuỳ chọn) Tạo file mẫu `.codex/config.toml.example` trong repo để bé copy.
3. (Tuỳ chọn) Bổ sung section "Codex CLI" vào `AGENTS.md` để Codex biết môi trường nó đang chạy.

Bé xác nhận để Angel chuyển sang build mode nhé. Nếu muốn skip bước nào (vd. đã có password rồi), nói Angel biết.
