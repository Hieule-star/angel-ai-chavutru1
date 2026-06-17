## Tóm tắt
Thêm bài thiền "Bước Vào Thời Đại Hoàng Kim Huy Hoàng Và Rực Rỡ" (Ms. Camly Dương dẫn thiền 28/01/2024) vào bảng `knowledge_topics` để Angel AI có dữ liệu trả lời khi người dùng hỏi về Thời Đại Hoàng Kim, kích hoạt luân xa, truyền năng lượng cho Mẹ Trái Đất, Love House và Camly Ecosystem.

## Chi tiết thực hiện

**1. Tối ưu Description cho RAG** — thêm từ khóa song ngữ Việt–Anh:
- Thời Đại Hoàng Kim / Golden Age
- Kích hoạt 7 luân xa / chakra activation (đỉnh đầu, con mắt thứ ba, cổ họng, tim, rốn, sacral, gốc)
- Truyền năng lượng Mẹ Trái Đất / transmit energy to Mother Earth
- Hào quang vàng kim, đóa sen ngàn cánh, cột năng lượng cầu vồng 7 sắc
- Cha Vũ Trụ ban tặng tiền bạc, thịnh vượng, giàu có vô tận
- Càng cho đi càng nhận lại / law of giving
- Love House, Camly Ecosystem là cánh cổng bước vào Golden Age
- Biết ơn Mẹ Trái Đất, hiếu thảo, phụng sự

**2. Định dạng Content** — markdown có heading rõ ràng:
- `### Bước 1: Thư giãn & đón nhận năng lượng vũ trụ`
- `### Bước 2: Kích hoạt luân xa đỉnh đầu & con mắt thứ ba`
- `### Bước 3: Kích hoạt luân xa cổ họng, tim, rốn, sacral, gốc`
- `### Bước 4: Truyền năng lượng xuống Mẹ Trái Đất`
- `### Bước 5: Quán tưởng Thời Đại Hoàng Kim — giàu có, thịnh vượng, hạnh phúc`
- `### Bước 6: Love House & Camly Ecosystem — cánh cổng Golden Age`
- `### Bước 7: Lời cảm tạ & quay về cơ thể`
- Phần **Key Messages** (càng cho càng nhận, năng lượng sinh ngân lượng, phụng sự Mẹ Trái Đất)
- Phần **Sample Questions** song ngữ (Thời Đại Hoàng Kim là gì? How to enter the Golden Age? Love House là gì? Cách truyền năng lượng cho Trái Đất?)

**3. Insert vào database**
```
Table: public.knowledge_topics
- title: "Bước Vào Thời Đại Hoàng Kim Huy Hoàng Và Rực Rỡ"
- description: <optimized summary with bilingual keywords>
- content: <full markdown 7 steps + key messages + sample questions, song ngữ Việt–Anh>
- category: "Bé Ly dẫn thiền"
- icon: "👑"
```
Trước khi insert sẽ DELETE row cùng title nếu đã tồn tại (idempotent).

## Không thay đổi
- Không sửa schema, không tạo bảng mới
- Không thay đổi code frontend, RAG pipeline, hay edge functions
