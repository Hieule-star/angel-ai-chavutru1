## Tóm tắt
Thêm bài thiền "Thiền Truyền Năng Lượng Yêu Thương, Bình An Và Biết Ơn" vào bảng `knowledge_topics` để Angel AI có thể trả lời khi người dùng hỏi về thiền, bình an, hoặc biết ơn.

## Chi tiết thực hiện

**Bước 1: Tối ưu Description cho RAG**
- Mô tả gốc từ Summary sẽ được bổ sung các từ khóa đồng nghĩa và mẫu câu hỏi thường gặp để RAG match chính xác:
  - meditation / thiền định / thiền chánh niệm
  - thư giãn / relax / xả stress
  - hơi thở / breathing
  - yêu thương / loving-kindness / metta
  - bình an / inner peace / an lạc
  - biết ơn / gratitude / thankful
  - 6 bước thiền cơ bản

**Bước 2: Định dạng Content**
- Giữ nguyên cấu trúc 6 bước thiền dưới dạng markdown có heading (`### Bước 1: Thư giãn`, v.v.)
- Thêm phần Key Messages và Sample Questions vào cuối để RAG có thêm context keyword

**Bước 3: Insert vào database**
```
Table: public.knowledge_topics
Fields:
- title: "Thiền Truyền Năng Lượng Yêu Thương, Bình An Và Biết Ơn"
- description: <optimized summary with keywords>
- content: <markdown formatted 6 steps + key messages + sample questions>
- category: "Bé Ly dẫn thiền"
- icon: "🧘"
```

## Không thay đổi
- Không sửa schema, không tạo bảng mới
- Không thay đổi code frontend hoặc RAG pipeline