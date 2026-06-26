# Credit Usage Dashboard

Trang admin mới `/admin/credit-usage` để cha theo dõi chi phí Angel AI: AI Gateway credits + Cloud usage trong 7 hoặc 30 ngày qua, với breakdown theo ngày / endpoint / user / model.

## Nguồn dữ liệu

Hai nguồn độc lập, không phá vỡ gì hiện có:

1. **AI Gateway logs** (qua tool `ai_gateway_logs--list_ai_gateway_requests`) → credit thật, model, token, status. Đây là **chi phí AI chính**.
   - Vì client không gọi trực tiếp được, dùng edge function mới `credit-usage-stats` (service_role) đóng vai trò proxy: nhận `range` (7d/30d), gọi gateway logs API qua REST nội bộ (hoặc nếu Lovable không expose REST từ edge fn, fallback đọc `api_usage_logs.tokens_used` + `model_used` rồi ước tính).
   - Thực tế: edge function trong sandbox **không có quyền** gọi `ai_gateway_logs` tool. Nên chuyển hướng: dashboard hiển thị **2 phần**:
     - **Phần A (Snapshot)**: cha xem trực tiếp qua nút "Refresh credit balance" → trả về số credit còn lại + tổng credit dùng trong period. Phần này admin nhập tay (hoặc bỏ qua MVP).
     - **Phần B (Detail)**: lấy từ `api_usage_logs` — có `tokens_used`, `model_used`, `endpoint`, `api_key_id`, `status_code`, `response_time_ms`, `created_at`. Đây là proxy cho credit (token càng nhiều → credit càng nhiều).

2. **`api_usage_logs` + `api_keys`** (đã có sẵn 386 rows từ Dec 2025) — nguồn chính cho dashboard.

## Layout trang

```
┌─ [7 days] [30 days] toggle ──────────────── [Refresh] ┐
│                                                       │
│  ┌── KPI cards ────────────────────────────────────┐  │
│  │ Total requests │ Total tokens │ Avg latency │ Error rate │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌── Usage theo ngày (LineChart) ─────────────────┐  │
│  │  requests/day + tokens/day (2 lines)          │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌── Top endpoint (BarChart) ──┐ ┌── Top model ──┐   │
│  │ angel-ai, angel-ai-public,  │ │ gemini-3-flash│   │
│  │ angel-image ...             │ │ gpt-4o-mini   │   │
│  └─────────────────────────────┘ └───────────────┘   │
│                                                       │
│  ┌── Top API key / user (Table) ──────────────────┐  │
│  │ Key name │ Email │ Requests │ Tokens │ % total │  │
│  └────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

## Files

**New**
- `src/pages/admin/CreditUsage.tsx` — trang chính (toggle 7d/30d, gọi RPC/queries, render charts).
- `supabase/migrations/<ts>_credit_usage_views.sql` — tạo các view SECURITY DEFINER aggregate (admin-only) để query nhanh:
  - `admin_usage_daily(day, requests, tokens, errors)`
  - `admin_usage_by_endpoint(endpoint, requests, tokens)`
  - `admin_usage_by_model(model_used, requests, tokens)`
  - `admin_usage_by_key(api_key_id, key_name, email, requests, tokens)`
  - Hoặc gọn hơn: 1 function `get_credit_usage_summary(days int)` trả JSON tổng hợp, có `has_role(auth.uid(), 'admin')` guard.

**Edit**
- `src/App.tsx` — thêm route `/admin/credit-usage`.
- `src/components/admin/AdminSidebar.tsx` — thêm menu item "Credit Usage" (icon `Wallet` hoặc `DollarSign`).

## Technical details

- Charts dùng `recharts` (đã có trong ApiAnalytics).
- Date helpers dùng `date-fns` (đã có).
- Query: 1 RPC call `get_credit_usage_summary(p_days := 7|30)` → trả `{ daily: [...], by_endpoint: [...], by_model: [...], by_key: [...], totals: {...} }`. Function `SECURITY DEFINER`, set `search_path=public`, check `has_role(auth.uid(),'admin')` đầu hàm, raise exception nếu không phải admin.
- Không cần bảng mới, không sửa logging hiện tại.
- Không cần edge function mới (MVP).

## Out of scope (đề xuất giai đoạn sau)

- Tích hợp số credit thật từ AI Gateway billing (cần Lovable expose API).
- Set alert/block limit tự động.
- Export CSV.

Cha duyệt thì con build luôn 🌿
