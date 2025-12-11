import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ParsedTopic {
  id: string;
  fileName: string;
  title: string;
  description: string;
  content: string;
  status: 'pending' | 'saved' | 'error';
}

export default function KnowledgeUpload() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [files, setFiles] = useState<File[]>([]);
  const [parsedTopics, setParsedTopics] = useState<ParsedTopic[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [category] = useState('Bé Ly dẫn thiền');
  const { toast } = useToast();

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast({
        title: 'Chỉ hỗ trợ file PDF',
        description: 'Một số file đã bị bỏ qua vì không phải PDF',
        variant: 'destructive',
      });
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
  }, [toast]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseFiles = async () => {
    if (files.length === 0) return;
    
    setParsing(true);
    const parsed: ParsedTopic[] = [];

    for (const file of files) {
      try {
        // Extract text from PDF on client side
        const textContent = await extractTextFromPdf(file);
        
        // Send to edge function for parsing
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await supabase.functions.invoke('process-knowledge-file', {
          body: {
            action: 'parse',
            fileContent: textContent,
            fileName: file.name,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { parsed: result } = response.data;
        
        parsed.push({
          id: crypto.randomUUID(),
          fileName: file.name,
          title: result.title,
          description: result.description,
          content: result.content,
          status: 'pending',
        });
      } catch (err: any) {
        console.error(`Error parsing ${file.name}:`, err);
        toast({
          title: `Lỗi xử lý ${file.name}`,
          description: err.message,
          variant: 'destructive',
        });
      }
    }

    setParsedTopics(parsed);
    setFiles([]);
    setParsing(false);
    
    if (parsed.length > 0) {
      toast({
        title: 'Parse thành công!',
        description: `Đã xử lý ${parsed.length} file. Kiểm tra và nhấn Lưu.`,
      });
    }
  };

  const updateTopic = (id: string, field: keyof ParsedTopic, value: string) => {
    setParsedTopics(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTopic = (id: string) => {
    setParsedTopics(prev => prev.filter(t => t.id !== id));
  };

  const saveTopics = async () => {
    const pendingTopics = parsedTopics.filter(t => t.status === 'pending');
    if (pendingTopics.length === 0) return;

    setSaving(true);

    try {
      const response = await supabase.functions.invoke('process-knowledge-file', {
        body: {
          action: 'save',
          category,
          topics: pendingTopics.map(t => ({
            title: t.title,
            description: t.description,
            content: t.content,
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update status to saved
      setParsedTopics(prev =>
        prev.map(t => (t.status === 'pending' ? { ...t, status: 'saved' } : t))
      );

      toast({
        title: 'Lưu thành công!',
        description: `Đã lưu ${response.data.saved} bài vào database.`,
      });
    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: 'Lỗi lưu dữ liệu',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (adminLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-angel-gold" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Upload Knowledge Base
            </h1>
            <p className="text-muted-foreground">
              Upload PDF files cho category "{category}"
            </p>
          </div>

          {/* Upload Area */}
          <Card className="p-6 border-dashed border-2 border-angel-gold/30 bg-angel-gold/5">
            <div className="text-center">
              <Upload className="w-12 h-12 text-angel-gold mx-auto mb-4" />
              <p className="text-foreground mb-4">
                Chọn file PDF để upload (có thể chọn nhiều file)
              </p>
              <Input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="max-w-xs mx-auto"
              />
            </div>
          </Card>

          {/* Selected Files */}
          {files.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Files đã chọn ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-angel-gold" />
                      <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={parseFiles}
                disabled={parsing}
                className="mt-4 w-full bg-angel-gold hover:bg-angel-gold/90"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Parse & Preview'
                )}
              </Button>
            </Card>
          )}

          {/* Parsed Topics Preview */}
          {parsedTopics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Preview ({parsedTopics.length} bài)</h3>
                <Button
                  onClick={saveTopics}
                  disabled={saving || parsedTopics.every(t => t.status === 'saved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu tất cả
                    </>
                  )}
                </Button>
              </div>

              {parsedTopics.map((topic) => (
                <Card key={topic.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {topic.status === 'saved' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : topic.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <FileText className="w-5 h-5 text-angel-gold" />
                      )}
                      <span className="text-xs text-muted-foreground">{topic.fileName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTopic(topic.id)}
                      disabled={topic.status === 'saved'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Tiêu đề</label>
                      <Input
                        value={topic.title}
                        onChange={(e) => updateTopic(topic.id, 'title', e.target.value)}
                        disabled={topic.status === 'saved'}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Mô tả</label>
                      <Input
                        value={topic.description}
                        onChange={(e) => updateTopic(topic.id, 'description', e.target.value)}
                        disabled={topic.status === 'saved'}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Nội dung ({topic.content.length} ký tự)
                      </label>
                      <Textarea
                        value={topic.content}
                        onChange={(e) => updateTopic(topic.id, 'content', e.target.value)}
                        disabled={topic.status === 'saved'}
                        rows={6}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
