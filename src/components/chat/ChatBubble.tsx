import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types';
import angelLogo from '@/assets/angel-logo.png';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

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
          <p className="text-xs text-angel-gold font-medium mb-1">ANGEL AI ✨</p>
        )}
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message.message}
        </p>
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
