# Angel AI — Roadmap 30/60/90 ngày

## Hiện trạng (đánh giá nhanh)

**Điểm mạnh**
- KB đã có **120 topic** (FUN 40, Bé Ly 54, Mantras 9, Cha 9, …) — nền tảng RAG đủ giàu để bắt đầu đo chất lượng.
- Edge function `angel-ai` 1489 dòng, có `rag.ts` tách riêng (test được), có `/admin/rag-debug` để soi điểm số.
- Auth, role qua `has_role`, admin pages (KnowledgeManager, RoleManagement, ApiAnalytics) đã hoàn chỉnh.
- Public API + app key system + Light Points + Journal + MetaMask đã chạy.

**Điểm yếu**
- RAG là **keyword scoring thuần** (token + phrase + synonym tay). Không có embeddings → query đồng nghĩa / câu dài / typo dễ miss.
- File `angel-ai/index.ts` 1489 dòng → khó maintain, dễ lẫn logic prompt/RAG/tool.
- Security scan còn **5 warning** (SECURITY DEFINER lộ EXECUTE cho anon/authenticated, public bucket listing, RLS `USING (true)`, HIBP off).
- Chưa có observability: không log RAG hit/miss, không đo latency token cost theo endpoint.
- UX: `Chat.tsx` 809 dòng — cần tách component, kiểm tra mobile, streaming, error states.
- Auto-deploy edge function chỉ chạy khi sửa qua Lovable chat → workflow hiện tại dễ "code mới mà function cũ".

---

## Giai đoạn 1 — 30 ngày: Nền tảng RAG + Bảo mật

Mục tiêu: RAG đo được, KB sạch, bịt lỗ bảo mật cơ bản.

1. **RAG eval harness**
   - Tạo `supabase/functions/angel-ai/rag_eval.ts` + bộ ~50 câu hỏi vàng (mỗi category 5–10 câu, kèm topic_id kỳ vọng).
   - Script chạy local: in MRR, Recall@3, Recall@5 trước/sau mỗi thay đổi `rag.ts`.
2. **Embeddings song song với keyword (hybrid)**
   - Bật `pgvector`, thêm cột `embedding vector(1536)` cho `knowledge_topics` (dùng `openai/text-embedding-3-small` qua Lovable AI Gateway để rẻ).
   - Migration backfill embeddings cho 120 topic hiện tại + trigger re-embed khi update.
   - Trong `rag.ts`: kết hợp `0.6 * cosine + 0.4 * keyword_score` (chuẩn hoá min-max).
3. **Dọn KB**
   - Query phát hiện topic trùng/title rỗng/content < 100 ký tự.
   - Chuẩn hoá category (đang có "Bảo Mật & An Toàn" 1 topic — gộp/đổi tên cho gọn).
4. **Bảo mật (đóng 5 warning)**
   - `REVOKE EXECUTE ... FROM anon, authenticated` cho các SECURITY DEFINER không cần public.
   - Siết RLS `USING (true)` về điều kiện đúng (đặc biệt bảng có INSERT/UPDATE/DELETE).
   - Bucket `generated-images`: thêm policy chặn LIST, chỉ cho phép GET theo path.
   - Bật HIBP qua `configure_auth`.
5. **Workflow deploy rõ ràng**
   - Thêm GitHub Action (hoặc script `bin/deploy-fn.sh`) gọi `supabase functions deploy angel-ai` để team push code từ Codex/local vẫn deploy được mà không phải nhờ Lovable chat.

## Giai đoạn 2 — 60 ngày: UX + Observability

Mục tiêu: trải nghiệm chat mượt, đo được mọi thứ.

6. **Refactor `Chat.tsx` (809 dòng) → các sub-component**
   - `ChatMessages`, `ChatComposer`, `ModelSwitcher`, `GuestBanner` (đã có một số), tách hook `useChatStream`.
   - Streaming token thật sự (SSE) thay vì chờ full response; markdown render + code highlight.
7. **Refactor `angel-ai/index.ts` (1489 dòng)**
   - Tách `prompt.ts` (system prompt, pronoun), `tools.ts`, `rag-pipeline.ts`, `index.ts` chỉ còn HTTP handler.
   - Thêm unit test cho prompt builder + pronoun guard.
8. **Mobile + a11y pass**
   - Audit toàn bộ `/admin/*` và `/chat` ở 360–414px, fix overflow, tap target ≥ 44px.
   - Aria-label, focus ring, contrast theo design tokens (không hardcode màu).
9. **Observability**
   - Bảng `ai_request_logs` (user_id, model, prompt_tokens, completion_tokens, latency_ms, rag_hits jsonb, error).
   - Edge function ghi log async; admin dashboard hiển thị p50/p95 latency, top RAG miss, cost/ngày.
10. **Onboarding tighten**
    - Đo funnel: visit → signup → first message → mint FUN Money.
    - Cải thiện step nào drop nhiều nhất (suy đoán: connect wallet).

## Giai đoạn 3 — 90 ngày: Production hoá + mở rộng

Mục tiêu: chạy production ổn định, mở cho dev ngoài, chuẩn bị scale.

11. **Reranker nhẹ (tuỳ chọn)**
    - Sau hybrid retrieve top 10, gọi 1 lượt Gemini Flash phân loại "topic này có trả lời được câu hỏi không?" → giữ top 3.
    - Bật/tắt bằng feature flag, đo có cải thiện MRR không.
12. **Knowledge ingestion pipeline**
    - `/admin/knowledge-upload` hỗ trợ PDF/MD batch, auto chunk 800–1200 ký tự, auto-embed.
    - Versioning topic (giữ history) để rollback nội dung sai.
13. **Public API v1 cứng hoá**
    - Rate limit theo app_key (đã có log), thêm quota tháng + email cảnh báo.
    - Trang docs `/developers` có ví dụ curl + SDK JS/Python tối thiểu.
    - SLA + status page (UptimeRobot hoặc Better Stack).
14. **FUN ecosystem deepening**
    - MetaMask: verify chain BNB Testnet đúng trước mọi tx, UX lỗi rõ ràng.
    - Light Points → leaderboard public (opt-in), tích hợp Journal post = +N điểm.
15. **Launch checklist**
    - Security scan 0 finding critical/high.
    - p95 latency `/chat` < 3.5s, edge function error rate < 1%.
    - Backup migrations + seed KB snapshot vào repo (`supabase/seed/knowledge_topics.csv`).
    - Bật custom domain + cập nhật OG/Twitter meta.

---

## Chi tiết kỹ thuật

**RAG hybrid scoring (Giai đoạn 1)**
```text
final_score = 0.6 * normalize(cosine_sim) + 0.4 * normalize(keyword_score)
keyword_score: giữ nguyên rag.ts hiện tại
embedding: openai/text-embedding-3-small, 1536 dims
query embed: cache 5 phút theo hash(query)
```

**Bảng log đề xuất**
```sql
create table public.ai_request_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  endpoint text not null,
  model text,
  prompt_tokens int, completion_tokens int,
  latency_ms int,
  rag_topic_ids uuid[],
  rag_scores jsonb,
  error text,
  created_at timestamptz default now()
);
-- + GRANT + RLS: chỉ admin SELECT, service_role INSERT
```

**Files dự kiến đụng**
- `supabase/functions/angel-ai/` (tách thành 4–5 file)
- `supabase/migrations/` (3 migration mới: embeddings, ai_request_logs, security tighten)
- `src/pages/Chat.tsx` + `src/components/chat/*`
- `src/pages/admin/AiAnalytics.tsx` (mới)

## Ngoài phạm vi
- Đổi model mặc định (giữ `google/gemini-3-flash-preview`).
- Đổi tech stack, đổi storage (giữ R2 + Supabase).
- Viết lại Knowledge Manager admin (vừa làm xong).
