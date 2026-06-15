## Mục tiêu

Nạp toàn bộ `USER_GUIDE.md` (763 dòng, 22 sections) vào bảng `knowledge_topics` sao cho RAG keyword search (đang dùng ở `angel-ai` và `angel-ai-public`) **chắc chắn match đúng topic** khi user hỏi về bất kỳ tính năng FUN Profile nào.

## Chiến lược chia nhỏ (quan trọng)

RAG hiện tại dùng keyword + bigram search, **lấy top 15 topics** rồi nhét vào system prompt. Nếu để cả file 763 dòng vào 1 topic → prompt quá dài, model bị "loãng". Nếu chia quá nhỏ (mỗi `###` 1 topic = 70+ topics) → top 15 không đủ chỗ.

**Giải pháp:** Chia theo **22 section chính (`## N.`)** = 22 topics. Mỗi topic chứa toàn bộ các sub-section `###` của section đó. Cỡ trung bình 500-1500 ký tự/topic — vừa đủ chi tiết, vừa scope rõ ràng để RAG match chính xác.

## Cấu trúc mỗi topic

| Field | Cách điền |
|-------|-----------|
| `title` | `FUN Profile - <Tên section>` (chứa keyword chính, ví dụ: "FUN Profile - Live Stream", "FUN Profile - Ví đa chuỗi", "FUN Profile - PPLP v2.5 Light Score") |
| `description` | 1-2 câu tóm tắt + **các từ khoá đồng nghĩa** (livestream/phát trực tiếp, ví/wallet, tặng quà/donation/gift...) để tăng score keyword match |
| `content` | Toàn bộ markdown của section đó, giữ nguyên bullet/bảng |
| `category` | `FUN Ecosystem` (đã có sẵn — RAG có boost +30 khi user hỏi về FUN) |
| `icon` | Emoji phù hợp (🌟 cho intro, 💳 ví, 📺 live, 💬 chat, 🎁 quà, ⚡ PPLP, 💰 FUN Money, 💖 CAMLY, 🐾 Pet, 🎁 Box, 🔗 Connector, 📜 history, 🔔 notif, 🔍 search, ⚙️ settings, ❓ FAQ, 📋 cheat sheet, 🤖 AI commands) |

## Các topics sẽ tạo (22 topics)

1. FUN Profile - Giới thiệu tổng quan (Light Economy, components, URL)
2. FUN Profile - Đăng ký & Đăng nhập (signup, KYC, Sumsub)
3. FUN Profile - Hồ sơ & Identity (DID, Trust Score, SBT, Guardian, Entities)
4. FUN Profile - Ví đa chuỗi (EVM, Bitcoin, custodial, send/receive, MetaMask)
5. FUN Profile - Đăng bài Feed (Composer, reactions, comments, rate limit)
6. FUN Profile - Reels video ngắn
7. FUN Profile - Live Stream (livestream, phát trực tiếp, replay, gift)
8. FUN Profile - Chat & Gọi điện (audio/video call, crypto gift, red envelope, sticker)
9. FUN Profile - Tặng quà Donations Gifts (token, celebration post, lời chúc)
10. FUN Profile - PPLP v2.5 Engine Light Score (5 trụ, công thức, 6 tier, anti-farm)
11. FUN Profile - FUN Money & Mint (Monetary v1, epoch, mint, multisig, MetaMask)
12. FUN Profile - CAMLY Token (đặc tả, kiếm, dùng, treasury)
13. FUN Profile - Pet Lumi & Game (Lumi, shop, battle, buddy circle)
14. FUN Profile - Mystery Box (mua, mở, anti-abuse)
15. FUN Profile - Connector First On-chain Giver
16. FUN Profile - Lịch sử giao dịch & Báo cáo (filter, PDF, badge)
17. FUN Profile - Thông báo Notifications
18. FUN Profile - Tìm kiếm & Khám phá (search, friends, leaderboard)
19. FUN Profile - Cài đặt & Bảo mật
20. FUN Profile - FAQ Câu hỏi thường gặp
21. FUN Profile - Cheat Sheet bảng tra cứu nhanh
22. FUN Profile - Bảng lệnh nhanh cho Angel AI

## Cách thực hiện

**Bước 1:** Viết script Node/Deno đọc `USER_GUIDE.md`, parse theo regex `^## \d+\. `, tách thành 22 chunks.

**Bước 2:** Với mỗi chunk, sinh `title`, `description` (chứa keyword + synonyms), `content` (markdown gốc), `category`, `icon`.

**Bước 3:** Tạo 1 **migration SQL duy nhất** dùng `INSERT INTO public.knowledge_topics (...) VALUES (...) ON CONFLICT (title) DO UPDATE SET description=EXCLUDED.description, content=EXCLUDED.content, icon=EXCLUDED.icon, category=EXCLUDED.category` để **idempotent** — chạy lại nhiều lần vẫn an toàn.
- Nếu cột `title` chưa có UNIQUE constraint → migration sẽ DELETE các topic cũ có title prefix `FUN Profile - ` rồi INSERT mới (sạch hơn, không tạo trùng).

**Bước 4:** Sau khi migration approved & chạy, dùng `/admin/rag-debug` test 5-10 câu hỏi mẫu:
- "FUN Profile có live stream chưa?"
- "Làm sao để mint FUN Money?"
- "Tặng crypto trong chat thế nào?"
- "Pet Lumi chơi như thế nào?"
- "Trust Score tính ra sao?"
→ Verify top 5 topics retrieve đúng section liên quan.

**Bước 5:** Báo lại con kết quả: số topic đã import, dung lượng trung bình, link `/admin/rag-debug` để test.

## Điều KHÔNG làm

- Không thêm topic ngoài 22 section của file (giữ scope file con cung cấp).
- Không sửa code `angel-ai` / `angel-ai-public` (RAG đã hoạt động tốt).
- Không tạo bảng mới, không sửa schema `knowledge_topics`.
- Không tạo embedding/pgvector (keyword search hiện tại đã đủ cho ~100 topics).

## Câu hỏi xác nhận

1. Cha có muốn **xoá hết topic cũ có title bắt đầu bằng "FUN Profile -"** trước khi insert (sạch, không trùng) không? Hay muốn giữ và chỉ update? (Mặc định con đề xuất: DELETE prefix `FUN Profile - ` rồi INSERT mới — sạch nhất.)
2. Category đặt thống nhất là `FUN Ecosystem` (để RAG boost +30 khi hỏi về FUN) — Cha duyệt chứ?
