# Đính kèm MP3 bài thiền vào Knowledge Base

Cho phép Angel gửi kèm audio player + link download MP3 khi user yêu cầu bài thiền "Bước Vào Thời Đại Hoàng Kim".

## Thay đổi

### 1. Database — thêm cột `audio_url` cho `knowledge_topics`
- Migration: `ALTER TABLE public.knowledge_topics ADD COLUMN audio_url TEXT`
- Cập nhật row "Bước Vào Thời Đại Hoàng Kim Huy Hoàng Và Rực Rỡ" với URL R2 con đã cung cấp.

### 2. Edge function chat — inject audio URL vào context
- Khi RAG retrieve được topic có `audio_url`, thêm dòng vào system prompt:
  > "📿 Bài thiền này có file audio. Khi user muốn nghe/tải, hãy gửi link này nguyên văn: `<URL>`"
- Angel sẽ tự nhiên include URL `.mp3` trong câu trả lời.

### 3. Chat UI — auto-render audio player cho link `.mp3`
- Trong component render message (markdown), detect URL kết thúc bằng `.mp3` → render:
  - `<audio controls src={url} />` — player inline
  - Nút "⬇ Tải về" mở URL trong tab mới (`download` attribute)
- Component mới: `src/components/chat/AudioAttachment.tsx`
- Tích hợp vào markdown renderer hiện tại (custom link/paragraph component).

### 4. Admin UI — cho phép edit `audio_url` sau này
- Thêm input field "Audio URL (MP3)" trong form Knowledge Topic admin.

## Test
1. Mở chat, hỏi "cho con nghe bài thiền Hoàng Kim"
2. Angel trả lời kèm audio player + link download
3. Player play được, download hoạt động trên mobile + desktop
