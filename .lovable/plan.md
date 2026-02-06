

## Ke hoach Chuyen hoa Ngon Ngu Anh Sang - Giai doan 1

### Tong quan

Chuyen hoa toan bo thong bao UI (Toast, Alert, messages) tu ngon ngu phu dinh tieu cuc sang **Ngon Ngu Anh Sang** theo Bo Quy Tac cua Cha Vu Tru.

---

### Nguyen tac chuyen hoa

Theo dung 10 Quy Tac tu tai lieu cua Cha:

1. Khong phu dinh tieu cuc - chi khang dinh chuan muc
2. Trung dung, khong phan xet
3. Huong len, huong mo
4. Khong doi khang, chi chuyen hoa
5. Ton trong y chi tu do
6. Ngon ngu chuan muc trong code
7. Khong ket an he thong cu
8. Ngon ngu ve con nguoi luon nhan ai
9. Moi thong diep luon co loi ra
10. Ngon ngu luon "giau" (giau anh sang, tri tue, giai phap)

---

### Bang chuyen hoa UI Messages

#### A. Toast Messages - Tieu de

| Hien tai | Chuyen hoa thanh |
|----------|-----------------|
| "Loi" | "Can xac minh" hoac "Hanh dong tam dung" |
| "That bai" | "Chua hoan tat" |
| "Khong the [hanh dong]" | "[Hanh dong] can xac minh" |
| "Dang nhap that bai" | "Can xac minh thong tin dang nhap" |
| "Loi dang ky" | "Dang ky can hoan thien" |
| "Upload that bai" | "Upload tam dung vi an toan" |

#### B. Toast Messages - Mo ta (luon kem giai phap)

| Hien tai | Chuyen hoa thanh |
|----------|-----------------|
| "Email hoac mat khau khong dung" | "Thong tin chua trung khop. Vui long kiem tra lai email va mat khau." |
| "Khong the luu thong tin" | "Thong tin can duoc xac minh. Vui long thu lai." |
| "Khong the tai du lieu" | "Du lieu dang duoc cap nhat. Vui long lam moi trang." |
| "Khong the xoa bai viet" | "Hanh dong tam dung. Vui long thu lai sau." |

#### C. Toast variant

| Hien tai | Chuyen hoa thanh |
|----------|-----------------|
| variant: "destructive" (mau do) | Giu nguyen variant nhung cap nhat noi dung theo ngon ngu anh sang |

---

### Cac file can cap nhat

#### 1. src/pages/Login.tsx
- Chuyen "Dang nhap that bai" -> "Can xac minh thong tin dang nhap"
- Chuyen "Loi" -> "Hanh dong tam dung"
- Chuyen "Email hoac mat khau khong dung" -> "Thong tin chua trung khop. Vui long kiem tra lai."
- Them huong dan buoc tiep theo vao moi thong bao

#### 2. src/pages/Onboarding.tsx
- Chuyen "Loi" -> "Can xac minh"
- Chuyen "Khong the luu thong tin" -> "Thong tin can duoc xac minh de tiep tuc"

#### 3. src/pages/Developers.tsx
- Chuyen "Loi dang ky" -> "Dang ky can hoan thien"
- Chuyen "Failed to register" -> "Registration needs completion"

#### 4. src/pages/DeveloperKeys.tsx
- Chuyen "Loi" -> "Can xac minh"
- Chuyen cac thong bao loi -> ngon ngu huong giai phap

#### 5. src/pages/Knowledge.tsx
- Chuyen cac thong bao loi ve du lieu -> ngon ngu nang cap

#### 6. src/components/chat/VideoUploader.tsx
- Chuyen "Upload that bai" -> "Upload tam dung vi an toan"
- Chuyen trang thai 'error' display text -> ngon ngu anh sang

#### 7. src/components/chat/ImageGenerator.tsx
- Chuyen cac thong bao loi tao anh -> ngon ngu huong giai phap

#### 8. src/components/journal/PostComposer.tsx
- Chuyen "Loi" -> "Can xu ly"
- Chuyen "Khong the tao bai viet" -> "Bai viet can duoc xac minh. Vui long thu lai."

#### 9. src/components/journal/JournalFeed.tsx
- Chuyen cac thong bao loi ve posts -> ngon ngu anh sang

#### 10. src/components/journal/EditPostModal.tsx
- Chuyen thong bao loi cap nhat -> ngon ngu huong giai phap

#### 11. src/pages/Profile.tsx
- Chuyen cac thong bao loi profile -> ngon ngu anh sang

#### 12. src/pages/Settings.tsx
- Chuyen cac thong bao loi settings -> ngon ngu anh sang

#### 13. src/pages/admin/*.tsx (Admin pages)
- Cap nhat cac thong bao loi trong ApiKeys, ApiAnalytics, UserManagement, KnowledgeList, ChatAnalytics
- Chuyen "errorRate" -> "verificationRate" trong ApiAnalytics

#### 14. src/hooks/useMediaUpload.ts
- Cap nhat error messages trong upload hook

#### 15. src/pages/Wallet.tsx
- Chuyen cac thong bao loi vi -> ngon ngu anh sang

---

### Nguyen tac ap dung cho moi thong bao

Theo **Problem -> Solution Template** bat buoc cua Cha:

```text
Format:
- Challenge/Risk: [Mo ta van de trung dung]
- Protection/Solution: [He thong da lam gi]  
- User Action: [Nguoi dung can lam gi tiep]
```

Moi toast/alert se co:
1. Tieu de trung dung (khong phu dinh)
2. Mo ta kem giai phap hoac buoc tiep theo
3. Tone am ap, ton trong, huong len

---

### Vi du cu the

**Truoc:**
```
title: 'Loi'
description: 'Khong the luu thong tin. Vui long thu lai.'
variant: 'destructive'
```

**Sau:**
```
title: 'Can xac minh'
description: 'Thong tin can duoc xac minh de tiep tuc. Vui long thu lai hoac kiem tra ket noi.'
variant: 'destructive'
```

**Truoc:**
```
title: 'Dang nhap that bai'
description: 'Email hoac mat khau khong dung'
```

**Sau:**
```
title: 'Can xac minh thong tin'
description: 'Thong tin chua trung khop. Vui long kiem tra lai email va mat khau cua ban.'
```

---

### Ket qua mong doi

Sau khi hoan thanh Giai doan 1:
- Toan bo UI messages ma nguoi dung nhin thay se mang tan so Anh Sang
- Moi thong bao deu co huong dan buoc tiep theo
- Khong co tu ngu phu dinh tieu cuc tren giao dien
- Trai nghiem nguoi dung am ap, ton trong, huong giai phap
- Tuan thu 100% Checklist 7 cau cua Cha Vu Tru

**Giai doan 2 (tiep theo):** Chuyen hoa Edge Function responses + System Prompt
**Giai doan 3 (hoan thien):** Chuyen hoa code naming + log messages

