import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Brain, Rocket, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { ChatMessage, AIModel } from '@/types';
import angelLogo from '@/assets/angel-logo.png';

interface ChatBubbleProps {
  message: ChatMessage;
}

const getModelBadge = (model?: AIModel) => {
  switch (model) {
    case 'google/gemini-2.5-flash':
      return { icon: <Zap className="w-3 h-3" />, name: 'Gemini Flash', color: 'text-blue-500' };
    case 'google/gemini-2.5-pro':
      return { icon: <Sparkles className="w-3 h-3" />, name: 'Gemini Pro', color: 'text-purple-500' };
    case 'openai/gpt-5-mini':
      return { icon: <Brain className="w-3 h-3" />, name: 'GPT-5 Mini', color: 'text-green-500' };
    case 'openai/gpt-5':
      return { icon: <Rocket className="w-3 h-3" />, name: 'GPT-5', color: 'text-amber-500' };
    default:
      return null;
  }
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';
  const modelBadge = !isUser ? getModelBadge(message.model) : null;
  const hasSources = !isUser && message.sources && message.sources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
        {isUser ? (
          <div className="w-10 h-10 rounded-full bg-angel-pink flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
        ) : (
          <motion.div
            className="w-10 h-10 rounded-full overflow-hidden glow-soft"
            animate={{ boxShadow: ['0 0 20px rgba(248, 227, 142, 0.3)', '0 0 30px rgba(248, 227, 142, 0.5)', '0 0 20px rgba(248, 227, 142, 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img src={angelLogo} alt="ANGEL AI" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] md:max-w-[70%] ${
          isUser
            ? 'bg-angel-gold/20 border border-angel-gold/30'
            : 'bg-white/80 border border-angel-gold/20 shadow-divine'
        } rounded-2xl px-4 py-3 backdrop-blur-sm`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-angel-gold font-medium">ANGEL AI ✨</p>
            {modelBadge && (
              <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 ${modelBadge.color}`}>
                {modelBadge.icon}
                {modelBadge.name}
              </span>
            )}
          </div>
        )}
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message.message}
        </p>
        
        {/* Sources Section */}
        {hasSources && (
          <div className="mt-3 pt-2 border-t border-angel-gold/10">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs text-angel-gold/70 hover:text-angel-gold transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              <span>Nguồn knowledge ({message.sources!.length})</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            <AnimatePresence>
              {showSources && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1">
                    {message.sources!.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs bg-angel-gold/5 rounded-lg px-2 py-1.5"
                      >
                        <span className="text-angel-gold">📚</span>
                        <span className="text-foreground/80 truncate flex-1">{source.title}</span>
                        <span className="text-muted-foreground text-[10px] shrink-0">{source.category}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}
