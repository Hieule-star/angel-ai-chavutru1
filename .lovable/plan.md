## Mục tiêu

Thêm 1 bài vào `knowledge_topics` để khi user hỏi "Angel AI hoạt động ra sao", "Angel AI dùng AI nào", "tốn credit không"... thì RAG match được và trả lời chính xác.

## Thay đổi

**1 thao tác duy nhất**: `INSERT` vào `public.knowledge_topics` (dùng insert tool, không phải migration vì không đổi schema).

### Nội dung bài

- **title**: `Cách Angel AI hoạt động – Kiến trúc & Cơ chế AI`
- **category**: `Angel AI Platform` (category mới, để gom các bài giải thích sản phẩm)
- **icon**: `🧠`
- **description**: 1-2 câu tóm tắt: Angel AI chạy 3-tier fallback (Gemini → OpenAI → Lovable) + RAG từ knowledge_topics, ưu tiên BYOK để tiết kiệm credit.
- **content**: Markdown đầy đủ gồm các phần:
  1. Kiến trúc tổng thể (Frontend → Edge Function `angel-ai` → AI Provider)
  2. **3-tier fallback** (bảng Gemini/OpenAI/Lovable, khi nào dùng, ai trả tiền)
  3. **RAG pipeline** (normalize → n-gram → ILIKE search → weighted scoring → top 15 inject)
  4. **System prompt layers** (identity guard, pronoun "mình-bạn", knowledge block)
  5. **Model mặc định** & cách map model khi fallback
  6. **Chi phí**: chỉ tier 3 (Lovable) mới tốn credit workspace
  7. **Monitoring**: `/admin/credit-usage`, `/admin/rag-debug`, edge function logs
  8. Các từ khóa thường gặp (giúp RAG match: "tốn credit", "dùng gemini", "openai", "fallback", "hoạt động ra sao"...)

### RAG keyword optimization

Để câu hỏi đa dạng của user match được, content sẽ chứa các cụm:
- "Angel AI hoạt động", "cơ chế trả lời", "dùng AI nào", "Gemini API", "OpenAI", "Lovable AI Gateway"
- "tốn credit", "tiết kiệm chi phí", "BYOK", "fallback", "3 tầng"
- "RAG", "knowledge base", "retrieval"

## Verify sau khi insert

1. Truy vấn `SELECT title FROM knowledge_topics WHERE category = 'Angel AI Platform'` để xác nhận đã có.
2. Gợi ý user test trong chat: hỏi "Angel AI hoạt động ra sao?" → kỳ vọng câu trả lời tham chiếu đúng kiến trúc 3-tier.

## Không thay đổi

- Không sửa code edge function, RAG, frontend.
- Không tạo bảng/column mới.
- Không đổi cấu hình AI provider.
