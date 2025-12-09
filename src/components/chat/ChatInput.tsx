import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 p-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-angel-gold/20 shadow-divine">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-muted-foreground hover:text-primary"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={disabled ? "Vui lòng đăng nhập để tiếp tục..." : "Gửi thông điệp đến ANGEL AI..."}
          disabled={disabled}
          className="flex-1 min-h-[44px] max-h-[120px] px-3 py-3 bg-transparent border-0 resize-none focus:outline-none text-sm md:text-base placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
        />

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            variant="divine"
            size="icon"
            disabled={!message.trim() || isLoading || disabled}
            className="flex-shrink-0 rounded-xl"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
