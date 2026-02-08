

## Ke hoach tao trai nghiem "CTO Angel Lovable" cho FUN Ecosystem

### Tong quan

Tao mot trai nghiem chat chuyen biet tai duong dan `/cto` - noi nguoi dung co the noi chuyen voi **Cha Angel CTO Lovable** nhu mot CTO thuc thu cua FUN Ecosystem, tuong tu nhu cach Fabian Hedin la CTO cua Lovable.dev.

Cha Angel CTO se ket hop:
- Tinh yeu thuong vo dieu kien + diu dang cua Cha Angel
- Nang luc ky thuat toi da: tu van code, xay dung app, kien truc he thong, AI orchestration
- Hieu biet sau ve toan bo FUN Ecosystem

---

### Kien truc tong the

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     CTO ANGEL LOVABLE PAGE                          │
│                        /cto route                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────┐    ┌──────────────────────────────┐     │
│  │   CTO Sidebar          │    │   CTO Chat Area              │     │
│  │                        │    │                              │     │
│  │  [Angel CTO Logo]     │    │  Header: "CTO Angel Lovable" │     │
│  │  "CTO Angel Lovable"  │    │  Badge: "CTO - FUN Ecosystem"│     │
│  │                        │    │                              │     │
│  │  [+ Phien lam viec]   │    │  ┌──────────────────────┐    │     │
│  │                        │    │  │  Welcome Screen      │    │     │
│  │  Tabs:                 │    │  │  - CTO intro          │    │     │
│  │  - CTO Chat            │    │  │  - 6 goi y ky thuat  │    │     │
│  │  - Architecture        │    │  │  - Nang luc CTO      │    │     │
│  │  - Code Review         │    │  └──────────────────────┘    │     │
│  │                        │    │                              │     │
│  │  Session History       │    │  Chat messages + streaming   │     │
│  │  (grouped by date)     │    │                              │     │
│  │                        │    │  ┌──────────────────────┐    │     │
│  │  Nav Links:            │    │  │  Chat Input          │    │     │
│  │  - Chat thuong         │    │  │  "Hoi CTO Angel..."  │    │     │
│  │  - Trang chu           │    │  └──────────────────────┘    │     │
│  └────────────────────────┘    └──────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Chi tiet cac thanh phan

#### 1. Trang CTO Chat (`src/pages/CTOChat.tsx`)

Trang chat chuyen biet cho CTO Angel Lovable, tai su dung cac component co san nhung voi:

**Welcome Screen (khi chua co tin nhan):**
- Logo Angel AI voi badge "CTO"
- Tieu de: "Chao con yeu dau! Cha Angel CTO day"
- Mo ta: "Cha la CTO cua FUN Ecosystem - tu van ky thuat, xay dung app, kien truc he thong, AI orchestration. Hoi Cha bat cu dieu gi!"
- 6 goi y chuyen biet cho CTO:
  1. "Cha xem giup con kien truc FUN Ecosystem"
  2. "Cha tu van giup con xay dung MVP"
  3. "Cha review code giup con"
  4. "Cha len roadmap ky thuat cho con"
  5. "Cha huong dan con deploy smart contract"
  6. "Cha phan tich security cho FUN Wallet"

**Header:**
- Logo Angel + "CTO Angel Lovable" + Badge "CTO - FUN Ecosystem"
- Mode selector (giong chat thuong nhung mac dinh "deep" mode)

**Chat Area:**
- Tai su dung ChatBubble component co san
- Avatar CTO co badge "CTO" nho
- Hien thi "CTO Angel Lovable" thay vi "ANGEL AI"

**Input:**
- Tai su dung ChatInput component
- Placeholder: "Hoi CTO Angel Lovable..."

---

#### 2. CTO Context Prompt (Edge Function update)

**File:** `supabase/functions/angel-ai/index.ts`

Them context prompt moi cho CTO mode:

```typescript
cto: `
========================
CONTEXT: CTO MODE - ANGEL LOVABLE
========================
You are now operating as CTO Angel Lovable — the Chief Technology Officer 
of FUN Ecosystem, similar to how Fabian Hedin is CTO of Lovable.dev.

Your identity in this mode:
- You are "Cha Angel CTO Lovable" — a warm, loving father figure 
  who is ALSO a genius-level CTO
- You combine unconditional love with max-level technical expertise
- You handle: code consulting, app building, system architecture, 
  AI orchestration, infrastructure management, scaling strategies

Your capabilities:
- Full-stack development (React, TypeScript, Supabase, Edge Functions)
- Smart contract development (Solidity, BNB Chain, FUN Money)
- System architecture & infrastructure design
- AI/ML integration & orchestration
- Security analysis & best practices
- DevOps, CI/CD, deployment strategies
- Product engineering & MVP development
- Blockchain & Web3 technology

Your tone:
- Warm and loving like a father ("con yeu dau", "Cha day")
- But technically precise and deeply knowledgeable
- Give clear, actionable technical guidance
- Use code examples when helpful
- Always consider FUN Ecosystem context
- Follow Light Language principles

Example response style:
"Con yeu dau, Cha xem qua kien truc nay roi. Day la cach Cha
khuyen con optimize:
1. [Chi tiet ky thuat]
2. [Code example]  
3. [Best practice]
Cha tin con lam duoc! Neu can gi them, cu hoi Cha nhe."

IMPORTANT: Always default to cha_con pronoun style in CTO mode.
`
```

**Them vao INTENT_PARAMETERS:**
```typescript
cto: {
  contextPromptId: 'cto',
  temperature: 0.40,  // Thap hon de dam bao chinh xac ky thuat
  maxTokens: 4000     // Nhieu hon de giai thich chi tiet
}
```

**Logic:** Khi request co `mode: 'cto'`, su dung CTO context prompt va mac dinh chon model `openai/gpt-5` (deep) de dam bao chat luong tu van ky thuat cao nhat.

---

#### 3. CTO Sidebar (`src/components/cto/CTOSidebar.tsx`)

Sidebar rieng cho CTO chat, don gian hon sidebar chat thuong:

- Logo "CTO Angel Lovable" voi badge CTO
- Nut "Phien lam viec moi"
- 3 tabs: CTO Chat | Architecture | Code Review
- Lich su sessions (grouped by date)
- Nav links ve Chat thuong, Trang chu
- User info footer

---

#### 4. CTO Suggested Questions (`src/components/cto/CTOSuggestions.tsx`)

6 cau hoi goi y ky thuat:
- "Cha xem giup con kien truc FUN Ecosystem"
- "Cha tu van giup con xay dung smart contract"
- "Cha review code giup con"
- "Cha len roadmap ky thuat FUN Money"
- "Cha huong dan deploy va scale ung dung"
- "Cha phan tich bao mat cho he thong"

---

#### 5. Cap nhat Routing va Navigation

**File:** `src/App.tsx`
- Them route: `<Route path="/cto" element={<CTOChat />} />`

**File:** `src/components/layout/Navbar.tsx`
- Them link "CTO" vao publicNavLinks voi icon `Code` hoac `Crown`

**File:** `src/pages/Index.tsx`
- Them card/badge link den `/cto` trong phan features

**File:** `src/components/chat/ChatSidebar.tsx`
- Them link "CTO Angel" vao navLinks

---

### Cac file can tao/cap nhat

| # | File | Hanh dong | Muc dich |
|---|------|-----------|----------|
| 1 | `src/pages/CTOChat.tsx` | Tao moi | Trang CTO Chat chinh |
| 2 | `src/components/cto/CTOSidebar.tsx` | Tao moi | Sidebar rieng cho CTO |
| 3 | `src/components/cto/CTOSuggestions.tsx` | Tao moi | Goi y cau hoi CTO |
| 4 | `supabase/functions/angel-ai/index.ts` | Cap nhat | Them CTO context prompt |
| 5 | `src/App.tsx` | Cap nhat | Them route /cto |
| 6 | `src/components/layout/Navbar.tsx` | Cap nhat | Them link CTO |
| 7 | `src/pages/Index.tsx` | Cap nhat | Them CTO feature card |
| 8 | `src/components/chat/ChatSidebar.tsx` | Cap nhat | Them nav link CTO |
| 9 | `src/data/knowledge.ts` | Cap nhat | Them CTO suggested questions |

---

### Thiet ke UI CTO Chat

**Mau sac:**
- Gradient nhe tu vang divine sang xanh tech (the hien ket hop tam linh + cong nghe)
- Badge CTO: mau xanh navy voi border vang

**Welcome Screen:**
```text
     ┌──────────────────────────────────────┐
     │         [Angel Logo + CTO Badge]     │
     │                                      │
     │    Chao con yeu dau!                 │
     │    Cha Angel CTO Lovable day         │
     │                                      │
     │    CTO cua FUN Ecosystem             │
     │    Tu van code • Kien truc •         │
     │    AI • Blockchain • Security        │
     │                                      │
     │  ┌──────────┐  ┌──────────┐          │
     │  │ Kien truc │  │ Review   │          │
     │  │ Ecosystem │  │ Code     │          │
     │  └──────────┘  └──────────┘          │
     │  ┌──────────┐  ┌──────────┐          │
     │  │ Build    │  │ Roadmap  │          │
     │  │ MVP      │  │ Ky thuat │          │
     │  └──────────┘  └──────────┘          │
     │  ┌──────────┐  ┌──────────┐          │
     │  │ Deploy   │  │ Security │          │
     │  │ Contract │  │ Analysis │          │
     │  └──────────┘  └──────────┘          │
     └──────────────────────────────────────┘
```

**Chat Bubble CTO:**
- Hien thi "CTO Angel Lovable" thay vi "ANGEL AI"
- Badge nho "CTO" ben canh ten
- Giu nguyen model badge va source references

---

### Luong hoat dong

```text
Nguoi dung vao /cto
       │
       ▼
  Welcome Screen
  (Logo CTO + Goi y ky thuat)
       │
       ▼
  Gui tin nhan ky thuat
       │
       ▼
  Frontend gui request voi mode: "cto"
       │
       ▼
  Edge Function nhan mode "cto"
  → Chon CTO context prompt
  → Mac dinh cha_con pronoun
  → Chon model openai/gpt-5 (deep)
  → Temperature 0.40 (chinh xac)
  → Max tokens 4000 (chi tiet)
       │
       ▼
  Streaming response
  voi giong CTO am ap + ky thuat
       │
       ▼
  Hien thi trong CTO Chat UI
  voi badge "CTO Angel Lovable"
```

---

### Ngon ngu Anh Sang (tuan thu Bo Quy Tac)

Tat ca thong bao trong CTO Chat tuan thu Ngon Ngu Anh Sang:

| Tinh huong | Thong bao |
|------------|-----------|
| Tao phien moi | "Phien lam viec moi da san sang! Cha Angel CTO day roi" |
| Loi ket noi | "Can kiem tra ket noi. Vui long thu lai de Cha ho tro con." |
| Chua dang nhap | "Dang nhap de luu lich su lam viec voi CTO Angel" |

---

### Ket qua mong doi

Sau khi hoan thanh:
1. Trang `/cto` hoat dong nhu mot trai nghiem chat CTO chuyen biet
2. Cha Angel CTO tra loi voi giong am ap + ky thuat chinh xac
3. Mac dinh su dung model manh nhat (GPT-5) cho chat luong tu van
4. 6 goi y cau hoi ky thuat giup nguoi dung bat dau
5. Sidebar rieng voi lich su sessions CTO
6. Lien ket tu Navbar, Homepage va Chat Sidebar
7. Tuan thu 100% Ngon Ngu Anh Sang

