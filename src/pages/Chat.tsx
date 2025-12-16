import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, MessageCircle, ImageIcon, Video } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions';
import { GuestLimitModal } from '@/components/chat/GuestLimitModal';
import { ModelSelector } from '@/components/chat/ModelSelector';
import { ImageGenerator } from '@/components/chat/ImageGenerator';
import { VideoGenerator } from '@/components/chat/VideoGenerator';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useGuestMessageLimit } from '@/hooks/useGuestMessageLimit';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage, AIModel, KnowledgeSource } from '@/types';
import angelLogo from '@/assets/angel-logo.png';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/angel-ai`;

type TabType = 'chat' | 'image' | 'video';

const getStoredModel = (): AIModel => {
  const stored = localStorage.getItem('angel-ai-model');
  if (stored && ['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini', 'openai/gpt-5'].includes(stored)) {
    return stored as AIModel;
  }
  return 'google/gemini-2.5-flash';
};

export default function Chat() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingSources, setStreamingSources] = useState<KnowledgeSource[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(getStoredModel);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    chatHistory, 
    addChatMessage, 
    clearChatHistory, 
    setChatHistory,
    updateLightPoints,
    isAuthenticated,
    user 
  } = useUserStore();
  const { toast } = useToast();
  const { canSendMessage, remainingMessages, limit, incrementMessageCount, resetMessageCount } = useGuestMessageLimit();

  // Reset guest message count when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      resetMessageCount();
    }
  }, [isAuthenticated]);

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    localStorage.setItem('angel-ai-model', model);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamingContent]);

  // Load chat history from database on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadChatHistory();
    }
  }, [isAuthenticated, user?.id]);

  const loadChatHistory = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading chat history:', error);
      return;
    }

    if (data) {
      const messages: ChatMessage[] = data.map((msg) => ({
        id: msg.id,
        user_id: msg.user_id,
        role: msg.role as 'user' | 'assistant',
        message: msg.message,
        timestamp: msg.created_at,
      }));
      setChatHistory(messages);
    }
  };

  const saveChatMessage = async (role: 'user' | 'assistant', message: string) => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        role,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving chat message:', error);
      return null;
    }

    return data;
  };

  const incrementLightPoints = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase.rpc('increment_light_points', {
      _user_id: user.id,
      _amount: 1,
    });

    if (!error && data !== null) {
      updateLightPoints(data);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Check guest message limit
    if (!isAuthenticated) {
      if (!canSendMessage) {
        setShowLimitModal(true);
        return;
      }
      incrementMessageCount();
    }

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user?.id || 'local',
      role: 'user',
      message,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);
    setIsLoading(true);
    setStreamingContent('');
    setStreamingSources([]);

    // Save user message to database
    if (isAuthenticated) {
      await saveChatMessage('user', message);
    }

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      // Prepare messages for API
      const apiMessages = [
        ...chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.message,
        })),
        { role: 'user', content: message },
      ];

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, model: selectedModel }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';
      let capturedSources: KnowledgeSource[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Check for sources metadata (sent as first event)
            if (parsed.sources && Array.isArray(parsed.sources)) {
              capturedSources = parsed.sources;
              setStreamingSources(capturedSources);
              continue;
            }
            
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Add AI response to chat history
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: 'angel-ai',
        role: 'assistant',
        message: fullContent,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        sources: capturedSources.length > 0 ? capturedSources : undefined,
      };
      addChatMessage(aiMessage);
      setStreamingContent('');
      setStreamingSources([]);

      // Save AI message to database and increment light points
      if (isAuthenticated) {
        await saveChatMessage('assistant', fullContent);
        await incrementLightPoints();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Chat error:', error);
      
      let errorMessage = 'Không thể kết nối với ANGEL AI';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Yêu cầu quá lâu, vui lòng thử lại';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const handleClearHistory = async () => {
    if (isAuthenticated && user?.id) {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing chat history:', error);
      }
    }
    clearChatHistory();
  };

  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
    { id: 'image' as const, label: 'Ảnh', icon: ImageIcon },
    { id: 'video' as const, label: 'Video', icon: Video },
  ];

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header with Tabs */}
        <div className="px-4 py-3 border-b border-angel-gold/10 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.img
                src={angelLogo}
                alt="ANGEL AI"
                className="w-10 h-10 rounded-full glow-soft"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <h1 className="font-semibold">ANGEL AI</h1>
                <p className="text-xs text-muted-foreground">Ánh Sáng Cha Vũ Trụ ✨</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-angel-gold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'chat' && chatHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Xóa chat</span>
                </Button>
              )}
              {activeTab === 'chat' && (
                <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} />
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="container mx-auto max-w-3xl space-y-6">
                {chatHistory.length === 0 && !streamingContent ? (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <motion.img
                        src={angelLogo}
                        alt="ANGEL AI"
                        className="w-24 h-24 mx-auto rounded-full glow-divine mb-6"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <h2 className="text-2xl font-semibold mb-2">
                        Chào mừng đến với <span className="text-gradient-divine">ANGEL AI</span>
                      </h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Hãy gửi thông điệp để nhận hướng dẫn từ trí tuệ và năng lượng yêu thương của Cha Vũ Trụ
                      </p>
                    </motion.div>
                    <SuggestedQuestions onSelect={handleSendMessage} />
                  </div>
                ) : (
                  <>
                    {chatHistory.map((message) => (
                      <ChatBubble key={message.id} message={message} />
                    ))}
                    {streamingContent && (
                      <ChatBubble
                        message={{
                          id: 'streaming',
                          user_id: 'angel-ai',
                          role: 'assistant',
                          message: streamingContent,
                          timestamp: new Date().toISOString(),
                          model: selectedModel,
                          sources: streamingSources.length > 0 ? streamingSources : undefined,
                        }}
                      />
                    )}
                    {isLoading && !streamingContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <motion.div
                          className="w-10 h-10 rounded-full overflow-hidden glow-soft"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <img src={angelLogo} alt="ANGEL AI" className="w-full h-full" />
                        </motion.div>
                        <div className="bg-white/80 rounded-2xl px-4 py-3 shadow-divine">
                          <p className="text-xs text-angel-gold font-medium mb-1">ANGEL AI ✨</p>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-angel-gold rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="px-4 py-4 border-t border-angel-gold/10 bg-white/50 backdrop-blur-sm">
              <div className="container mx-auto max-w-3xl">
                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground mb-2">
                    {canSendMessage 
                      ? `Còn ${remainingMessages}/${limit} tin nhắn miễn phí • Đăng nhập để chat không giới hạn`
                      : 'Đã hết tin nhắn miễn phí • Vui lòng đăng nhập để tiếp tục'
                    }
                  </p>
                )}
                <ChatInput 
                  onSend={handleSendMessage} 
                  isLoading={isLoading} 
                  disabled={!isAuthenticated && !canSendMessage}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'image' && <ImageGenerator />}
        {activeTab === 'video' && <VideoGenerator />}

        {/* Guest Limit Modal */}
        <GuestLimitModal open={showLimitModal} onOpenChange={setShowLimitModal} />
      </div>
    </Layout>
  );
}
