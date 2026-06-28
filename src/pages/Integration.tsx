import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, Sparkles, Shield, Gauge, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const ENDPOINT =
  "https://sasbfslupxdsaqifnqzx.supabase.co/functions/v1/angel-ai-public";

export default function Integration() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("angel_xxxxxxxxxxxxxxxx");

  const copy = (text: string, label = "Đã copy") => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} ✨` });
  };

  const curlSnippet = `curl -X POST ${ENDPOINT} \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      { "role": "user", "content": "Giải thích 8 Thần Chú giúp mình" }
    ]
  }'`;

  const jsSnippet = `const res = await fetch("${ENDPOINT}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Giải thích 8 Thần Chú giúp mình" },
    ],
  }),
});
const data = await res.json();
console.log(data.message);`;

  const pySnippet = `import requests

res = requests.post(
    "${ENDPOINT}",
    headers={
        "Authorization": "Bearer ${apiKey}",
        "Content-Type": "application/json",
    },
    json={
        "messages": [
            {"role": "user", "content": "Giải thích 8 Thần Chú giúp mình"},
        ],
    },
    timeout=60,
)
print(res.json()["message"])`;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" /> Public API
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tích hợp Angel AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Gọi Angel AI từ ứng dụng của bạn với cùng knowledge base như bản
            chính chủ — RAG đầy đủ về FUN Ecosystem, 8 Thần Chú, Hiến Pháp FUN
            Kingdom, các bài dẫn thiền và hơn thế.
          </p>
        </div>

        {/* Key input */}
        <Card className="p-5 space-y-3 border-primary/20">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <p className="font-medium">API key của bạn</p>
          </div>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="angel_xxxxxxxxxxxxxxxx"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Dán key vào đây để các snippet bên dưới tự nhúng key thật. Key chỉ
            lưu trong trình duyệt — không gửi đi đâu cả.
          </p>
        </Card>

        {/* Endpoint */}
        <Card className="p-5 space-y-3">
          <p className="font-medium">Endpoint</p>
          <div className="flex items-center gap-2 bg-muted rounded-md p-3">
            <code className="text-xs md:text-sm flex-1 break-all">{`POST ${ENDPOINT}`}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copy(ENDPOINT, "Đã copy endpoint")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Header bắt buộc:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              Authorization: Bearer angel_xxx
            </code>
          </p>
        </Card>

        {/* Snippets */}
        <Card className="p-5 space-y-4">
          <p className="font-medium">Ví dụ tích hợp</p>
          <Tabs defaultValue="curl">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="py">Python</TabsTrigger>
            </TabsList>
            {[
              { v: "curl", code: curlSnippet },
              { v: "js", code: jsSnippet },
              { v: "py", code: pySnippet },
            ].map(({ v, code }) => (
              <TabsContent key={v} value={v}>
                <div className="relative">
                  <pre className="bg-muted rounded-md p-4 text-xs md:text-sm overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copy(code, "Đã copy snippet")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        {/* Response schema */}
        <Card className="p-5 space-y-3">
          <p className="font-medium">Response</p>
          <pre className="bg-muted rounded-md p-4 text-xs md:text-sm overflow-x-auto">
            <code>{`{
  "message": "...câu trả lời của Angel AI (đã RAG knowledge base)...",
  "model": "google/gemini-3-flash-preview",
  "usage": { "prompt_tokens": 1234, "completion_tokens": 256 }
}`}</code>
          </pre>
          <p className="text-sm text-muted-foreground">
            Trường <code>messages</code> theo chuẩn OpenAI:{" "}
            <code>{`{ role: "user" | "assistant" | "system", content: string }`}</code>
            . Gửi nguyên lịch sử hội thoại để Angel AI giữ ngữ cảnh.
          </p>
        </Card>

        {/* Limits / errors */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              <p className="font-medium">Giới hạn</p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Mặc định 1.000 requests / ngày / key</li>
              <li>Quota có thể nâng theo thoả thuận</li>
              <li>Mỗi key được log chi tiết để minh bạch sử dụng</li>
            </ul>
          </Card>
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <p className="font-medium">Mã lỗi</p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">401</code>{" "}
                — thiếu hoặc sai API key
              </li>
              <li>
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">429</code>{" "}
                — vượt quota ngày, thử lại sau
              </li>
              <li>
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">5xx</code>{" "}
                — lỗi tạm thời, retry với backoff
              </li>
            </ul>
          </Card>
        </div>

        {/* CTA */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <p className="font-medium">Lấy API key</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Đăng nhập rồi vào{" "}
            <Link to="/developers" className="text-primary underline">
              /developers
            </Link>{" "}
            để tự tạo developer key, hoặc liên hệ admin để được cấp key riêng
            cho ứng dụng / tổ chức.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/developers">Tạo key ngay</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/docs/platform">Xem docs đầy đủ</Link>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
