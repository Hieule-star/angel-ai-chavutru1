## Mini App / Mini Game Builder — Implementation Plan

A safe in-browser builder where Angel AI generates self-contained React+TS+Tailwind mini apps, renders them in a sandboxed iframe, and lets users iterate before "deploying" (Phase 1 = preview-only).

---

### 1. Database (1 migration)

**`ai_generated_apps`** — generated app drafts
- `user_id`, `title`, `description`, `app_type` (quiz/memory/clicker/puzzle/spin/breathing/platformer/reaction/custom)
- `status` enum: `draft | preview | approved | deployed | failed`
- `source_code` jsonb (multi-file: `{ "App.tsx": "...", "styles.css": "..." }`)
- `build_logs` text, `preview_url` text (nullable, Phase 2)
- `model_used`, `prompt`, `tokens_used`
- RLS: owner-only read/write; admin read all

**`mini_app_quotas`** — configurable per-role quotas (admin-editable)
- `role` (guest/user/premium/coordinator/admin), `daily_limit`, `monthly_limit`, `burst_per_hour`, `token_budget`, `bonus_quota`
- Seed defaults: 2 / 5 / 20 / 100 / NULL(unlimited)
- RLS: anyone authenticated reads; admin writes

**`mini_app_quota_overrides`** — per-user bonus/override (admin grants)
- `user_id`, `extra_daily`, `extra_monthly`, `expires_at`, `reason`

**`mini_app_generation_log`** — audit + analytics
- `user_id`, `app_id`, `action` (generate/regenerate/preview/approve/deploy/block), `tokens`, `model`, `safety_flags` jsonb, `ip`

**`get_mini_app_quota_status(user_id)`** RPC → returns `{ role, daily_used, daily_limit, monthly_used, monthly_limit, remaining }`

---

### 2. Edge function: `mini-app-generate`

Single endpoint, JWT-verified.
- Validate input (Zod): `prompt`, `template?`, `app_id?` (for regenerate), `model?`
- Check quota via RPC → 429 with friendly message if exceeded
- Safety pre-filter: regex/keyword blocklist for phishing, wallet drain, credential theft, scam, malicious patterns (`eval(`, `document.cookie`, `localStorage.getItem('sb-`, fetch to suspicious hosts)
- Model routing (reuses `_shared/aiProvider.ts`):
  - Simple template: `gemini-2.5-flash`
  - Complex/custom: `gemini-2.5-pro`
  - Fallback: Lovable Gateway
- System prompt enforces:
  - Output strict JSON: `{ title, description, app_type, files: { "App.tsx": "..." }, entry: "App.tsx", summary }`
  - Only React/TS/Tailwind/shadcn (allowlist of imports)
  - No network calls, no secrets, no DB, no auth, no external URLs except whitelisted CDNs
  - Self-contained, no npm installs beyond React + Tailwind CDN
- Safety post-filter on generated code (same blocklist + AST-lite regex)
- Insert into `ai_generated_apps` (status=`draft`), log to `mini_app_generation_log`
- Return app record

---

### 3. In-browser sandbox runtime

`src/components/miniapp/MiniAppPreview.tsx`
- Sandboxed `<iframe sandbox="allow-scripts">` (no `allow-same-origin` → blocks localStorage/cookies leak)
- `srcdoc` built from template:
  - Tailwind via CDN
  - React 18 + ReactDOM UMD
  - Babel standalone for TSX in-browser compile
  - Inject generated `App.tsx` and mount
- `postMessage` bridge: iframe → parent for runtime errors (shown as build_logs)
- CSP meta tag: no external connects, no inline scripts beyond Babel

---

### 4. Frontend pages & UX

**`src/pages/MiniApps.tsx`** (new route `/mini-apps`)
- Header: "Mini App Builder" + remaining quota badge ("3/5 today")
- Template gallery: 8 cards (Quiz, Memory, Clicker, Puzzle, Spin Wheel, Breathing, Platformer, Reaction)
- "My Apps" grid — user's drafts with status badges
- Click template or "Custom" → opens Builder

**`src/pages/MiniAppBuilder.tsx`** (`/mini-apps/:id?`)
- Left pane: chat-style builder (reuses ChatInput pattern)
  - Angel asks clarifying questions if prompt vague
  - Shows generated spec summary BEFORE coding (user confirms)
- Right pane: `<MiniAppPreview>` live iframe
- Action bar: **Preview** · **Edit prompt** · **Regenerate** · **Approve** (sets status=approved) · **Deploy** (disabled w/ tooltip "Phase 2")
- Build log drawer

**`src/pages/Chat.tsx`** — add quick-access button "✨ Create Mini App" beside ModelSelector → navigates to `/mini-apps`

**`src/pages/admin/MiniAppQuotas.tsx`** (new admin route)
- Table to edit per-role quotas
- Grant per-user bonus quota
- Analytics: top creators, total generations, blocked attempts

Sidebar: add "Mini Apps" (user) + "Mini App Quotas" (admin).

---

### 5. Safety layer

- Centralized blocklist in `supabase/functions/_shared/miniAppSafety.ts` (used by edge function)
- Frontend `src/lib/miniAppSafety.ts` mirrors blocklist for last-mile check before iframe render
- All generations logged with `safety_flags`
- Iframe sandbox attribute strictly `allow-scripts` only

---

### 6. Quota system (configurable, no code changes)

- Reads from `mini_app_quotas` table (cached 5min client-side)
- `get_mini_app_quota_status` RPC counts today's generations from `mini_app_generation_log`
- Admin UI = single source of truth for limits
- Frontend shows remaining quota; edge function enforces

---

### Technical notes

- Models via existing `_shared/aiProvider.ts` (Gemini direct → Gateway fallback already implemented)
- No new secrets needed
- Phase 1 explicitly skips real deployment; `preview_url` stays null; "Deploy" button shows roadmap toast
- All 4 new tables include GRANTs + RLS per project conventions
- Role detection: extends existing `user_roles` enum (may need `premium`, `coordinator` — will add via migration if missing, or map to existing `user`/`moderator`/`admin` and document mapping)

---

### Deliverables checklist

1. Migration: 4 tables + 1 RPC + seed quotas
2. Edge function `mini-app-generate` + shared safety module
3. `MiniAppPreview` iframe sandbox component
4. Pages: `/mini-apps`, `/mini-apps/:id`, `/admin/mini-app-quotas`
5. Chat integration button
6. Sidebar entries (user + admin)
7. 8 template prompt presets in `src/data/miniAppTemplates.ts`
