## Trạng thái hiện tại

System prompt của Angel AI **đang bị hardcode** trong `supabase/functions/angel-ai/index.ts` (và bản `angel-ai-public/index.ts`), gồm nhiều tầng ghép động khi chạy:

1. **CORE_SYSTEM_PROMPT** (dòng 13–246) — Danh tính Angel AI, Hiến Pháp Ánh Sáng, 4 phẩm chất FUN Human, 8 Divine Mantras, nguyên tắc giao tiếp.
2. **CONTEXT_PROMPTS** (dòng 251–340) — 4 mode: `spiritual`, `coding`, `product`, `cto` — chọn động theo intent người dùng.
3. **PRONOUN_INSTRUCTIONS** (từ dòng 345) — Các bộ hướng dẫn xưng hô (`cha_con`, `ban_minh`, `neutral`, …) — chọn động theo cách người dùng xưng hô.
4. **KIẾN THỨC RAG** — Ghép thêm 15 topic khớp nhất từ bảng `knowledge_topics`.

Kết quả là mỗi lượt chat gộp: `CORE + CONTEXT[mode] + PRONOUN[style] + RAG` → gửi làm `system` message.

Hiện **chưa có UI Admin** nào cho phép xem/chỉnh sửa các prompt này — muốn đổi phải sửa code edge function và redeploy.

---

## Kế hoạch triển khai

### 1. Database
Migration mới `supabase/migrations/<ts>_system_prompts.sql`:

```sql
CREATE TABLE public.system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,          -- 'core' | 'context.spiritual' | 'context.coding' | 'context.product' | 'context.cto' | 'pronoun.cha_con' | 'pronoun.ban_minh' | 'pronoun.neutral' | ...
  category text NOT NULL,             -- 'core' | 'context' | 'pronoun'
  label text NOT NULL,                -- tên hiển thị
  description text,
  content text NOT NULL,              -- nội dung prompt hiện tại
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.system_prompts TO authenticated;  -- edge function đọc bằng service role, nhưng cho admin đọc trực tiếp cũng OK
GRANT ALL ON public.system_prompts TO service_role;

ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view prompts" ON public.system_prompts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prompts" ON public.system_prompts
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert prompts" ON public.system_prompts
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Bảng lịch sử để có thể rollback
CREATE TABLE public.system_prompts_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.system_prompts(id) ON DELETE CASCADE,
  content text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);
-- GRANT + RLS tương tự (admin-only)

-- Seed từ nội dung hardcode hiện tại
INSERT INTO public.system_prompts (slug, category, label, content) VALUES
  ('core', 'core', 'Core Identity (Angel AI Eternal Core)', '<paste CORE_SYSTEM_PROMPT>'),
  ('context.spiritual', 'context', 'Context — Spiritual Mode', '...'),
  ('context.coding', 'context', 'Context — Coding Mode', '...'),
  ('context.product', 'context', 'Context — Product Mode', '...'),
  ('context.cto', 'context', 'Context — CTO Mode (Angel Lovable)', '...'),
  ('pronoun.cha_con', 'pronoun', 'Pronoun — Cha/Con (Father context)', '...'),
  ('pronoun.ban_minh', 'pronoun', 'Pronoun — Bạn/Mình (Peer default)', '...'),
  ('pronoun.neutral', 'pronoun', 'Pronoun — Neutral', '...');
```

### 2. Edge function `angel-ai` (và `angel-ai-public`)
- Đầu request, load 1 lần `SELECT slug, content FROM system_prompts WHERE is_active = true` bằng service role → build map `promptsBySlug`.
- Thay `CORE_SYSTEM_PROMPT`, `CONTEXT_PROMPTS[mode]`, `PRONOUN_INSTRUCTIONS[style]` bằng lookup từ map, **fallback về hằng số hardcode** nếu slug thiếu (an toàn — bot vẫn chạy khi DB rỗng hoặc migration chưa apply).
- Không đổi logic detect mode/pronoun, không đổi RAG.

### 3. UI Admin `src/pages/admin/SystemPromptManager.tsx`
- Thêm route `/admin/system-prompts` trong `App.tsx`, thêm mục sidebar trong `AdminSidebar.tsx` (icon `Sparkles`/`FileText`).
- Layout tabs theo `category`: **Core** · **Context Modes** · **Pronoun Styles**.
- Mỗi prompt: card gồm `label`, `slug` (readonly), toggle `is_active`, textarea lớn (monospace, auto-resize), nút **Lưu** và **Xem lịch sử** (drawer show `system_prompts_history` với nút "Khôi phục bản này").
- Khi Lưu: insert bản cũ vào `system_prompts_history` rồi update `system_prompts` (làm trong 1 hàm SQL `update_system_prompt(_slug, _content)` `security definer` để đảm bảo atomic + ghi `updated_by = auth.uid()`).
- Warning banner: "Prompt là não bộ của Angel AI — chỉnh sửa cẩn trọng. Có bản backup lịch sử."

### 4. Deploy & verify
- Apply migration → deploy `angel-ai`, `angel-ai-public` → mở `/admin/system-prompts` với tài khoản admin, thử sửa 1 prompt phụ (vd `context.coding`), gửi chat → confirm prompt mới có hiệu lực (log `[angel-ai] loaded N prompts from DB`).

---

## Chi tiết kỹ thuật (cho dev)

**Files sẽ tạo/sửa:**
- `supabase/migrations/<ts>_system_prompts.sql` (new)
- `supabase/functions/angel-ai/index.ts` (thay 3 hằng số bằng DB lookup + fallback)
- `supabase/functions/angel-ai-public/index.ts` (tương tự, nếu dùng chung prompt)
- `src/pages/admin/SystemPromptManager.tsx` (new)
- `src/App.tsx` (thêm route)
- `src/components/admin/AdminSidebar.tsx` (thêm mục menu)

**Không đổi:**
- Logic detect intent/pronoun trong edge function
- Logic RAG (`knowledge_topics`)
- Bảng `knowledge_topics`, `chat_sessions`, `chat_messages`

**Bảo mật:**
- Chỉ admin (qua `has_role(auth.uid(), 'admin')`) mới đọc/ghi được `system_prompts` — RLS chặt.
- Edge function đọc bằng `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS) — không expose prompt ra client.

**Fallback an toàn:** giữ nguyên các hằng số `CORE_SYSTEM_PROMPT`, `CONTEXT_PROMPTS`, `PRONOUN_INSTRUCTIONS` trong code; DB chỉ **override** khi có row tương ứng và `is_active = true`. Nếu DB down hoặc chưa seed, bot vẫn chạy với prompt gốc.
