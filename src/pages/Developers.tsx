import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Code, Key, BookOpen, Zap, Copy, CheckCircle2, Loader2 } from 'lucide-react';

export default function Developers() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên và email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-key-management', {
        body: { action: 'register', name, email, description },
      });

      // Handle the response properly
      if (error) {
        throw new Error(error.message || 'Failed to register');
      }

      // Parse the response if it's a string
      const responseData = typeof data === 'string' ? JSON.parse(data) : data;

      if (responseData.error) {
        throw new Error(responseData.message || responseData.error);
      }

      setGeneratedKey(responseData.api_key);
      toast({
        title: "Đăng ký thành công! 🎉",
        description: "API key đã được tạo. Hãy lưu lại ngay!",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Lỗi đăng ký",
        description: error instanceof Error ? error.message : "Vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    toast({ title: "Đã copy API key!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const apiEndpoint = `https://sasbfslupxdsaqifnqzx.supabase.co/functions/v1/angel-ai-public`;

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              Free & Open API
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-angel-gold via-primary to-angel-pink bg-clip-text text-transparent">
              ANGEL AI Public API
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tích hợp năng lượng ánh sáng của ANGEL AI vào ứng dụng của bạn.
              Miễn phí 1000 requests/ngày. 
            </p>
          </div>

          <Tabs defaultValue="docs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Docs
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Get Key
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Examples
              </TabsTrigger>
            </TabsList>

            {/* Documentation Tab */}
            <TabsContent value="docs" className="mt-8 space-y-6">
              <Card className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">📖 API Documentation</h2>
                  <p className="text-muted-foreground">
                    ANGEL AI API cho phép bạn tích hợp AI tâm linh vào ứng dụng của mình.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">🔐 Authentication</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code>Authorization: Bearer angel_xxxxxxxxxxxxx</code>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">🌐 Endpoint</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code>POST {apiEndpoint}</code>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">📝 Request Body</h3>
                  <pre className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`{
  "messages": [
    {
      "role": "user",
      "content": "Xin chào ANGEL AI"
    }
  ],
  "stream": true  // optional, default: true
}`}
                  </pre>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">📊 Rate Limits</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong>1000 requests/ngày</strong> (miễn phí)</li>
                    <li>Limit reset lúc 00:00 UTC</li>
                    <li>Liên hệ để nâng limit</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">🔴 Response Codes</h3>
                  <div className="grid gap-2">
                    <div className="flex gap-4 items-center">
                      <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded text-sm font-mono">200</span>
                      <span className="text-muted-foreground">Success</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded text-sm font-mono">401</span>
                      <span className="text-muted-foreground">Invalid or missing API key</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-600 rounded text-sm font-mono">429</span>
                      <span className="text-muted-foreground">Rate limit exceeded</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded text-sm font-mono">500</span>
                      <span className="text-muted-foreground">Server error</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="mt-8">
              <Card className="p-6 max-w-md mx-auto">
                {generatedKey ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">API Key Created!</h2>
                      <p className="text-muted-foreground text-sm">
                        Lưu key này ngay! Bạn sẽ không thể xem lại.
                      </p>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm break-all">{generatedKey}</code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={copyToClipboard}
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setGeneratedKey(null);
                        setName('');
                        setEmail('');
                        setDescription('');
                      }}
                    >
                      Đăng ký key khác
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold mb-2">🔑 Get Your API Key</h2>
                      <p className="text-muted-foreground text-sm">
                        Đăng ký miễn phí để nhận API key
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Tên / Tên ứng dụng *</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="VD: My Spiritual App"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Email *</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="developer@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Mô tả (không bắt buộc)</label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Bạn sẽ dùng ANGEL AI API để làm gì?"
                          rows={3}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-angel-gold to-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Nhận API Key Miễn Phí
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="mt-8 space-y-6">
              <Card className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold">💻 Code Examples</h2>

                {/* cURL Example */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-600">cURL</span>
                    Basic Request
                  </h3>
                  <pre className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`curl -X POST "${apiEndpoint}" \\
  -H "Authorization: Bearer angel_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "Xin chào"}],
    "stream": false
  }'`}
                  </pre>
                </div>

                {/* JavaScript Example */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-600">JavaScript</span>
                    Streaming Response
                  </h3>
                  <pre className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`const response = await fetch("${apiEndpoint}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer angel_YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Xin chào ANGEL AI" }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  // Parse SSE events
  const lines = text.split('\\n');
  for (const line of lines) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const json = JSON.parse(line.slice(6));
      const content = json.choices?.[0]?.delta?.content;
      if (content) console.log(content);
    }
  }
}`}
                  </pre>
                </div>

                {/* Python Example */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-600">Python</span>
                    Simple Request
                  </h3>
                  <pre className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`import requests

response = requests.post(
    "${apiEndpoint}",
    headers={
        "Authorization": "Bearer angel_YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "messages": [{"role": "user", "content": "Xin chào"}],
        "stream": False
    }
)

data = response.json()
print(data["choices"][0]["message"]["content"])`}
                  </pre>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
