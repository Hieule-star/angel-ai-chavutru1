

## Kế hoạch thêm Image Generation vào Public API

### Tổng quan

Mở rộng `angel-ai-public` Edge Function để hỗ trợ dịch vụ **Image Generation**, cho phép developers tạo hình ảnh tâm linh qua API với cùng một API key đã đăng ký.

---

### Kiến trúc mới

```text
┌──────────────────────────────────────────────────────────────────┐
│                    ANGEL AI PUBLIC API                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /angel-ai-public                                           │
│                                                                  │
│  ┌─────────────────────┐     ┌─────────────────────┐            │
│  │   service: "chat"  │     │  service: "image"   │            │
│  │   (default)        │     │  (image generation) │            │
│  └─────────────────────┘     └─────────────────────┘            │
│           │                           │                          │
│           ▼                           ▼                          │
│  ┌─────────────────────┐     ┌─────────────────────┐            │
│  │ google/gemini-2.5   │     │ google/gemini-2.5   │            │
│  │     -flash         │     │ -flash-image-preview│            │
│  └─────────────────────┘     └─────────────────────┘            │
│           │                           │                          │
│           ▼                           ▼                          │
│  ┌─────────────────────┐     ┌─────────────────────┐            │
│  │ Streaming SSE      │     │ JSON Response       │            │
│  │ Chat Response      │     │ { imageUrl, desc }  │            │
│  └─────────────────────┘     └─────────────────────┘            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Thay đổi API Interface

#### Request Body mới

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `service` | string | No | `"chat"` | Loại dịch vụ: `"chat"` hoặc `"image"` |
| `messages` | array | Yes (chat) | - | Mảng tin nhắn cho chat |
| `prompt` | string | Yes (image) | - | Mô tả hình ảnh cần tạo |
| `stream` | boolean | No | true | Bật/tắt streaming (chỉ cho chat) |
| `enhance_prompt` | boolean | No | true | Tự động thêm keywords tâm linh (chỉ cho image) |

#### Response Format

**Chat Service** (không thay đổi):
```json
{
  "choices": [{ "message": { "role": "assistant", "content": "..." } }],
  "request_id": "abc123"
}
```

**Image Service** (mới):
```json
{
  "imageUrl": "data:image/png;base64,...",
  "description": "Mô tả hình ảnh được tạo",
  "request_id": "abc123"
}
```

---

### Chi tiết kỹ thuật

#### File thay đổi: `supabase/functions/angel-ai-public/index.ts`

**Bước 1: Thêm service type routing (sau line 279)**

```typescript
// ========== PARSE REQUEST BODY ==========
const body = await req.json();
const service = body.service || "chat"; // NEW: service type

// Validate service type
if (!["chat", "image"].includes(service)) {
  return new Response(JSON.stringify({ 
    error: "Invalid service", 
    message: "Service must be 'chat' or 'image'",
    request_id: requestId
  }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

**Bước 2: Thêm Image Generation logic (khoảng line 350)**

```typescript
// ========== IMAGE GENERATION SERVICE ==========
if (service === "image") {
  logSection(requestId, "IMAGE GENERATION");
  
  const { prompt, enhance_prompt = true } = body;
  
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ 
      error: "Missing prompt", 
      message: "Image service requires a 'prompt' field",
      request_id: requestId
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Enhance prompt với spiritual keywords (optional)
  const finalPrompt = enhance_prompt 
    ? `Create a beautiful, high-quality spiritual image: ${prompt}. Style: ethereal, divine light, soft glow, peaceful, inspirational. Ultra high resolution.`
    : prompt;

  logInfo(requestId, "Image Request", {
    promptPreview: prompt.substring(0, 100),
    enhancePrompt: enhance_prompt,
    finalPromptLength: finalPrompt.length
  });

  const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [{ role: "user", content: finalPrompt }],
      modalities: ["image", "text"]
    }),
  });

  // Handle response...
  // Extract imageUrl and description
  // Log to database with endpoint: "/angel-ai-public/image"
  // Return JSON response
}
```

**Bước 3: Cập nhật logging (logToDatabase)**

Thêm field `service_type` vào log:
```typescript
await logToDatabase(supabase, {
  api_key_id: apiKeyData.id,
  endpoint: service === "image" ? "/angel-ai-public/image" : "/angel-ai-public",
  // ... other fields
});
```

---

### Cập nhật Documentation

#### File thay đổi: `src/pages/Developers.tsx`

**Thêm vào Introduction section (khoảng line 187)**

Thêm card mới cho Image Generation:
```tsx
<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
  <ImageIcon className="w-5 h-5 text-primary mt-0.5" />
  <div>
    <h4 className="font-medium text-sm">Image Gen</h4>
    <p className="text-xs text-muted-foreground">Tạo hình ảnh tâm linh</p>
  </div>
</div>
```

**Thêm Request Body documentation mới (sau line 285)**

```tsx
{/* Image Generation Request */}
<div className="space-y-2 text-sm border-t pt-4 mt-4">
  <h4 className="font-medium">Image Generation Request:</h4>
  <CodeBlock 
    code={`{
  "service": "image",
  "prompt": "A peaceful lotus flower glowing with divine light",
  "enhance_prompt": true  // Auto-add spiritual keywords (optional)
}`}
    language="JSON"
    id="image-request"
  />
</div>

{/* Image Response */}
<div className="space-y-2 text-sm">
  <h4 className="font-medium">Image Response:</h4>
  <CodeBlock 
    code={`{
  "imageUrl": "data:image/png;base64,iVBORw0KGgo...",
  "description": "A serene lotus flower radiating divine light...",
  "request_id": "abc12345"
}`}
    language="JSON"
    id="image-response"
  />
</div>
```

**Thêm Example tab cho Image Generation (khoảng line 997)**

```tsx
{/* Image Generation Example */}
<div className="space-y-3">
  <h3 className="text-lg font-medium">Image Generation</h3>
  <CodeBlock 
    code={`const response = await fetch("${apiEndpoint}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer angel_YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    service: "image",
    prompt: "A peaceful meditation scene with golden light",
    enhance_prompt: true
  })
});

const data = await response.json();
console.log("Image URL:", data.imageUrl);
console.log("Description:", data.description);

// Display image
const img = document.createElement('img');
img.src = data.imageUrl;
document.body.appendChild(img);`}
    language="JavaScript"
    id="image-example"
  />
</div>
```

---

### Tóm tắt các file cần thay đổi

| File | Thay đổi | Mục đích |
|------|----------|----------|
| `supabase/functions/angel-ai-public/index.ts` | Thêm service routing + image generation logic | Core functionality |
| `src/pages/Developers.tsx` | Cập nhật docs + examples | Developer documentation |

---

### API Examples sau khi hoàn thành

**Chat Service (không thay đổi):**
```bash
curl -X POST "https://xxx.supabase.co/functions/v1/angel-ai-public" \
  -H "Authorization: Bearer angel_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Xin chào"}]}'
```

**Image Service (mới):**
```bash
curl -X POST "https://xxx.supabase.co/functions/v1/angel-ai-public" \
  -H "Authorization: Bearer angel_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"service": "image", "prompt": "Golden lotus flower with divine light"}'
```

---

### Rate Limiting

- Cả hai services (chat + image) đều sử dụng chung quota 1000 requests/ngày
- Image generation tốn nhiều tài nguyên hơn nên có thể cân nhắc rate limit riêng trong tương lai

---

### Kết quả mong đợi

Developers có thể:
1. Sử dụng cùng API key cho cả Chat và Image Generation
2. Tạo hình ảnh tâm linh bằng cách thêm `service: "image"` vào request
3. Tùy chọn bật/tắt auto-enhance prompt với keywords tâm linh
4. Nhận response JSON với `imageUrl` (base64) và `description`
5. Xem documentation và examples đầy đủ trên Developer Portal

