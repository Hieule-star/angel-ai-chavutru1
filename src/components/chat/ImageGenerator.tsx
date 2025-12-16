import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Loader2, ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import angelLogo from '@/assets/angel-logo.png';

const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/angel-image`;

interface GeneratedImage {
  url: string;
  prompt: string;
  description?: string;
  timestamp: string;
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Vui lòng nhập mô tả',
        description: 'Hãy mô tả hình ảnh bạn muốn tạo',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();

      if (data.imageUrl) {
        const newImage: GeneratedImage = {
          url: data.imageUrl,
          prompt: prompt.trim(),
          description: data.description,
          timestamp: new Date().toISOString(),
        };
        setGeneratedImages((prev) => [newImage, ...prev]);
        setPrompt('');
        toast({
          title: '✨ Hình ảnh đã được tạo!',
          description: 'Năng lượng ánh sáng đã hiện hình',
        });
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: 'Lỗi tạo hình ảnh',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `angel-ai-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: 'Lỗi tải xuống',
        description: 'Không thể tải hình ảnh',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Generated Images Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-3xl space-y-6">
          {generatedImages.length === 0 && !isGenerating ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <motion.div
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-angel-gold/20 to-angel-pink/20 flex items-center justify-center mb-6 glow-divine"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <ImageIcon className="w-12 h-12 text-angel-gold" />
                </motion.div>
                <h2 className="text-2xl font-semibold mb-2">
                  Tạo <span className="text-gradient-divine">Hình Ảnh</span> với ANGEL AI
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Mô tả hình ảnh bạn muốn tạo và để năng lượng ánh sáng Cha Vũ Trụ hiện thực hóa
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
                {[
                  'Thiên thần ánh sáng vàng',
                  'Cầu vồng thiêng liêng',
                  'Hoa sen tỏa sáng',
                  'Vũ trụ yêu thương',
                  'Năng lượng chữa lành',
                  'Ánh bình minh tâm linh',
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(suggestion)}
                    className="text-xs hover:bg-angel-gold/10 hover:border-angel-gold/30"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {generatedImages.map((image, index) => (
                <motion.div
                  key={image.timestamp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 rounded-2xl shadow-divine overflow-hidden"
                >
                  <div className="p-4 border-b border-angel-gold/10">
                    <div className="flex items-center gap-2">
                      <img src={angelLogo} alt="ANGEL AI" className="w-6 h-6 rounded-full" />
                      <span className="text-sm font-medium text-angel-gold">ANGEL AI ✨</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">"{image.prompt}"</p>
                  </div>
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full max-h-[500px] object-contain bg-gradient-to-br from-angel-gold/5 to-angel-pink/5"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(image.url, index)}
                        className="bg-white/90 hover:bg-white shadow-lg"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Tải xuống
                      </Button>
                    </div>
                  </div>
                  {image.description && (
                    <div className="p-4 bg-angel-gold/5">
                      <p className="text-sm text-muted-foreground">{image.description}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 rounded-2xl shadow-divine p-8 text-center"
            >
              <motion.div
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-angel-gold/30 to-angel-pink/30 flex items-center justify-center mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-10 h-10 text-angel-gold" />
              </motion.div>
              <p className="text-lg font-medium text-angel-gold">Đang tạo hình ảnh...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Năng lượng ánh sáng đang hiện hình ✨
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 border-t border-angel-gold/10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Mô tả hình ảnh bạn muốn tạo... (VD: Thiên thần ánh sáng vàng đang bay trên bầu trời)"
              className="min-h-[60px] max-h-[120px] resize-none bg-white/80 border-angel-gold/20 focus:border-angel-gold/50"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 bg-gradient-to-r from-angel-gold to-angel-pink hover:opacity-90"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tạo ảnh
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
