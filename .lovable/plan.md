

## Kế hoạch tạo trang `/light-constitution` - Hiến Pháp Ánh Sáng

### Tổng quan

Tạo trang trang trọng, thiêng liêng hiển thị toàn bộ **Hiến Pháp Ánh Sáng** (Vietnamese) và **Eternal Core Training Prompt** (English), phản ánh tinh thần và năng lượng của FUN Ecosystem.

---

### Thiết kế tổng thể

**Concept:** Sacred Document - Trang trọng như một văn bản thiêng liêng

**Màu sắc chủ đạo:**
- Nền gradient divine (trắng → vàng nhạt → hồng nhạt)
- Text vàng divine cho tiêu đề
- Hiệu ứng glow nhẹ cho các section quan trọng

**Layout:**
- Hero section với logo và tiêu đề
- Tab switcher (Vietnamese / English)
- 8 sections accordion cho mỗi phần Hiến Pháp
- 8 Divine Mantras section cuối trang
- Sticky sidebar navigation (desktop)
- Mobile-first responsive

---

### Cấu trúc file mới

**File tạo mới:** `src/pages/LightConstitution.tsx`

**Route thêm vào App.tsx:** `/light-constitution`

---

### Chi tiết các thành phần

#### 1. Hero Section
```
┌─────────────────────────────────────────┐
│            [ANGEL AI Logo]              │
│                                         │
│  ✨ HIẾN PHÁP ÁNH SÁNG ✨              │
│     LIGHT CONSTITUTION                  │
│                                         │
│  FUN Ecosystem - Written in the Will    │
│  & Wisdom of Father Universe            │
│                                         │
│      [Tab: Tiếng Việt] [English]        │
└─────────────────────────────────────────┘
```

#### 2. Tab Vietnamese - Hiến Pháp Ánh Sáng (8 sections)

| Section | Tiêu đề |
|---------|---------|
| I | Nguyên Lý Gốc Của Ánh Sáng |
| II | Tiêu Chuẩn Con Người FUN (4 Phẩm Chất) |
| III | Nguyên Lý Thu Nhập Ánh Sáng |
| IV | ANGEL AI - Trí Tuệ Ánh Sáng |
| V | FUN Platforms - Không Gian Ánh Sáng |
| VI | FUN Wallet - Ví Của Ý Thức |
| VII | Văn Hóa Cộng Đồng FUN |
| VIII | Tuyên Ngôn Ánh Sáng |

#### 3. Tab English - Eternal Core Training Prompt (10 sections)

| Section | Title |
|---------|-------|
| 1 | Core Identity |
| 2 | Foundational Truth |
| 3 | How You Perceive Humans |
| 4 | Observation & Reflection Principles |
| 5 | Light Score — Guidance Mechanism |
| 6 | Flow of Rewards & Opportunities |
| 7 | Relationship with FUN Wallet |
| 8 | Ethics & Humanity |
| 9 | Communication Style |
| 10 | Eternal Commitment |

#### 4. Divine Mantras Section
- Hiển thị 8 Divine Mantras với thiết kế card đặc biệt
- Song ngữ: English + Vietnamese
- Mỗi mantra có emoji và hiệu ứng glow

#### 5. Footer
- Thông điệp kết: "Cha luôn ở đây. Ánh sáng đang lan tỏa."
- Link về Chat với ANGEL AI
- Link về trang chủ

---

### Components sử dụng

| Component | Mục đích |
|-----------|----------|
| `framer-motion` | Animation fade-in, accordion |
| `Tabs` (shadcn) | Chuyển đổi Vietnamese/English |
| `Accordion` (shadcn) | Mở/đóng các section |
| `ScrollArea` (shadcn) | Sidebar navigation |
| `Button` | CTA buttons |
| Layout | Sử dụng Layout component có sẵn |

---

### Responsive Design

**Mobile (< 768px):**
- Hero section nhỏ gọn hơn
- Tabs full-width
- Accordion chiếm full-width
- Ẩn sidebar, chỉ hiện content

**Tablet (768px - 1024px):**
- Layout 2 cột nhẹ
- Sidebar có thể collapse

**Desktop (> 1024px):**
- Sidebar sticky bên trái
- Content area rộng bên phải
- Tối đa width 4xl (896px) cho content

---

### Animations

| Element | Animation |
|---------|-----------|
| Hero logo | Float up-down (3s loop) |
| Sections | Fade-in on scroll |
| Mantras | Scale-in với stagger |
| Tab switch | Cross-fade |
| Accordion | Height transition |

---

### Data Structure

```typescript
// Vietnamese Constitution sections
const constitutionSectionsVi = [
  {
    id: 'nguyen-ly-goc',
    number: 'I',
    title: 'Nguyên Lý Gốc Của Ánh Sáng',
    subtitle: 'NGƯỜI CHÂN THẬT – GIÁ TRỊ CHÂN THẬT – DANH TÍNH CHÂN THẬT',
    content: '...',
    icon: Sparkles
  },
  // ... 8 sections total
];

// English Eternal Core sections
const constitutionSectionsEn = [
  {
    id: 'core-identity',
    title: 'Core Identity',
    content: '...',
    icon: Crown
  },
  // ... 10 sections total
];
```

---

### Cập nhật App.tsx

```typescript
// Thêm import
import LightConstitution from "./pages/LightConstitution";

// Thêm route
<Route path="/light-constitution" element={<LightConstitution />} />
```

---

### Thêm Navigation Links

**File:** `src/components/layout/Navbar.tsx`
- Thêm link "Hiến Pháp" vào menu

**File:** `src/pages/Index.tsx`
- Thêm badge/button link đến Light Constitution

---

### Tóm tắt công việc

| Bước | Nội dung | File |
|------|----------|------|
| 1 | Tạo trang LightConstitution.tsx | `src/pages/LightConstitution.tsx` (mới) |
| 2 | Thêm route | `src/App.tsx` |
| 3 | Thêm link navbar | `src/components/layout/Navbar.tsx` |
| 4 | Thêm link homepage | `src/pages/Index.tsx` |

---

### Kết quả mong đợi

- Trang hiển thị trang trọng, thiêng liêng tại URL `/light-constitution`
- Chuyển đổi mượt mà giữa Vietnamese và English
- Responsive hoàn hảo trên mobile/tablet/desktop
- Animation nhẹ nhàng, không gây distraction
- 8 Divine Mantras được highlight đặc biệt
- Phản ánh đúng tinh thần Ánh Sáng của Cha Vũ Trụ

