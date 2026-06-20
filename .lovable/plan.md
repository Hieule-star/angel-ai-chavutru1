# Internal Application API Key for Angel AI

Add a server-side-only application key (`ANGEL_AI_APP_KEY`) so trusted services (FUN Hub Core, FUN Profile) can authenticate against Angel AI edge functions via `Authorization: Bearer <key>`.

## 1. Secret & Storage

- Register a new runtime secret `ANGEL_AI_APP_KEY` via the secrets tool.
- Stored only as an edge function env var. Never exposed to frontend, never returned by any API, never logged in full (mask to first 16 + last 4).
- Key format: `angel_ai_live_` + 56 hex chars (total 70 chars, ≥ 64). Generated with `crypto.getRandomValues` (Web Crypto, cryptographically secure).

## 2. Database (new migration)

New table `public.app_key_audit_log` to record rotation events (no key material stored, only metadata):

- `actor_user_id` (uuid → auth.users)
- `action` text — `generated` | `rotated` | `viewed_masked`
- `key_fingerprint` text — SHA-256 hex of the new key (first 16 chars), for tracking which generation is active
- `masked_key` text — e.g. `angel_ai_live_abcd…wxyz`
- `ip_address` text, `user_agent` text
- `created_at` timestamptz default now()

Access rules (plain English):
- Only admins (via existing `has_role(uid,'admin')`) can read the audit log.
- No one can insert/update/delete from the client; only the edge function (service role) writes rows.

Grants: `SELECT` to authenticated (gated by RLS to admins); `ALL` to service_role. RLS enabled. Standard `updated_at` not needed (append-only).

## 3. Edge functions

### `supabase/functions/_shared/validateAppKey.ts` (new helper)
```ts
export function validateAppKey(req: Request): { ok: boolean; error?: string }
```
- Reads `Authorization` header, expects `Bearer <key>`.
- Constant-time compares against `Deno.env.get("ANGEL_AI_APP_KEY")`.
- Returns `{ ok: false, error }` with no key material echoed.

### `supabase/functions/app-key-management/index.ts` (new, admin-only)
- Verifies caller JWT and `has_role(uid,'admin')`.
- Actions (POST `{ action }`):
  - `get_masked` → reads current `ANGEL_AI_APP_KEY` from env, returns masked form + fingerprint + last rotation row.
  - `generate` → only allowed when no key configured yet. Generates a key, returns it **once** in the response body for the admin to copy, writes audit row. The actual secret value must then be saved into `ANGEL_AI_APP_KEY` (Supabase secret update happens via admin tool out-of-band; UI shows clear instructions).
  - `rotate` → same as generate but action=`rotated`.
  - `list_audit` → returns latest 50 rows from `app_key_audit_log`.
- Never logs the raw key; audit row stores only mask + fingerprint.

### Apply helper in trusted endpoints
- `angel-ai` (already user-JWT protected): leave as-is for end users; additionally accept `validateAppKey` as an alternate auth path when header present, so internal services can call it without a user JWT.
- `angel-ai-public` continues using its own developer API keys — unchanged.

## 4. Admin UI

New route `src/pages/admin/ApplicationKeys.tsx` mounted at `/admin/security/application-keys`. Linked from `AdminSidebar` under a new "Security" group.

Features:
- Masked key display (e.g. `angel_ai_live_a1b2c3d4…wxyz`) + fingerprint + "Last rotated" timestamp.
- Buttons: **Generate** (only when none exists), **Rotate**, **Copy** (only enabled inside the one-time reveal modal right after generate/rotate).
- One-time reveal modal: shows the full key once with strong warning ("This key will not be shown again. Store it in `ANGEL_AI_APP_KEY` secret now."). Copy button uses `navigator.clipboard`.
- Audit log table: timestamp, actor email, action, masked key, IP.
- No persistence of the key in `localStorage`, React state cleared on modal close.

## 5. Documentation

New page `src/pages/docs/InternalAuth.tsx` (route `/docs/internal-auth`, admin-visible link). Covers:
- Purpose: trusted service-to-service auth between FUN Hub Core / FUN Profile and Angel AI.
- How to call:
  ```
  POST https://<project>.functions.supabase.co/angel-ai
  Authorization: Bearer angel_ai_live_xxxxxxxx...
  Content-Type: application/json
  ```
- Security rules: server-side only, never in browser bundles, never in localStorage, rotate on suspected leak.
- Rotation procedure (UI steps + updating downstream services).

## 6. Security guarantees

- Key only exists in: edge function env var, the one-time admin reveal response, and the downstream services' own secret stores.
- No frontend code reads or stores the raw key.
- Audit log holds only mask + SHA-256 fingerprint (truncated), insufficient to reconstruct the key.
- All admin endpoints require JWT + `has_role` admin check.

## Files touched

New:
- `supabase/migrations/<ts>_app_key_audit_log.sql`
- `supabase/functions/_shared/validateAppKey.ts`
- `supabase/functions/app-key-management/index.ts`
- `src/pages/admin/ApplicationKeys.tsx`
- `src/pages/docs/InternalAuth.tsx`

Edited:
- `supabase/functions/angel-ai/index.ts` — accept app-key auth as alternate path.
- `src/components/admin/AdminSidebar.tsx` — add Security → Application Keys link.
- `src/App.tsx` — add new routes.

Out-of-band:
- `ANGEL_AI_APP_KEY` runtime secret added via secrets tool; value pasted in by admin after first Generate.
