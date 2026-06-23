## Sửa thông tin sai về auto-deploy trong AGENTS.md

### Vấn đề
File `AGENTS.md` (project knowledge) hiện ghi:
> Edge functions: edit file trong `supabase/functions/<name>/index.ts` rồi push → Lovable auto-deploy.
> Schema/DB changes: tạo file SQL mới ... push qua Lovable → migration tool tự apply.

Điều này **sai** với trường hợp push từ bên ngoài (GitHub, Codex CLI, local). Auto-deploy chỉ xảy ra khi Lovable agent (in-chat) là người sửa file, vì nó chủ động gọi tool deploy/migration ngay trong cùng turn.

### Thay đổi
Cập nhật section **"Files KHÔNG được sửa"** và **"Edge Functions / Database"** trong `AGENTS.md` để mô tả chính xác:

**Edge functions**
- Khi sửa qua **Lovable chat**: agent tự deploy ngay (qua `deploy_edge_functions` tool).
- Khi **push code từ ngoài** (GitHub / Codex CLI / local): code về preview repo nhưng **edge function KHÔNG tự deploy**. Phải:
  1. Yêu cầu trong Lovable chat ("deploy edge function X"), HOẶC
  2. Dùng Supabase CLI local: `supabase functions deploy <name> --project-ref sasbfslupxdsaqifnqzx` (cần `supabase login` + `supabase link` trước — có thể không khả dụng nếu tài khoản không phải owner managed project).

**Migrations**
- Khi tạo qua **Lovable chat**: dùng migration tool, user confirm → apply.
- Khi **push file `supabase/migrations/*.sql` từ ngoài**: KHÔNG tự apply. Phải yêu cầu Lovable agent apply lại trong chat, hoặc dùng `supabase db push` qua CLI local.

**Frontend (`src/`)**
- Push từ ngoài → Lovable preview tự rebuild (Vite). Cái này thực sự auto.

### Files thay đổi
- `AGENTS.md` — sửa 2 bullet trong section workflow + thêm 1 callout "⚠️ Auto-deploy chỉ áp dụng khi sửa qua Lovable chat".

Không động vào code app.
