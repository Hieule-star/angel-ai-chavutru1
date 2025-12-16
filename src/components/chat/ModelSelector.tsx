import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SelectionMode, AIModel } from '@/types';

interface ModeOption {
  id: SelectionMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'auto',
    name: 'Auto',
    description: 'Thông minh & tự động',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-angel-gold',
  },
  {
    id: 'fast',
    name: 'Nhanh',
    description: 'Phản hồi tức thì',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-blue-500',
  },
  {
    id: 'deep',
    name: 'Sâu',
    description: 'Phân tích chi tiết',
    icon: <Brain className="w-4 h-4" />,
    color: 'text-purple-500',
  },
];

interface ModelSelectorProps {
  selectedMode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
}

export function ModelSelector({ selectedMode, onModeChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentMode = MODE_OPTIONS.find((m) => m.id === selectedMode) || MODE_OPTIONS[0];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs h-8 px-3 bg-white/60 hover:bg-white/80 border border-angel-gold/20 rounded-full"
      >
        <span className={currentMode.color}>{currentMode.icon}</span>
        <span className="font-medium">{currentMode.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl border border-angel-gold/20 shadow-divine overflow-hidden z-50"
            >
              <div className="p-1">
                {MODE_OPTIONS.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      onModeChange(mode.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      selectedMode === mode.id
                        ? 'bg-angel-gold/10'
                        : 'hover:bg-angel-gold/5'
                    }`}
                  >
                    <span className={mode.color}>{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{mode.name}</p>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </div>
                    {selectedMode === mode.id && (
                      <motion.div
                        layoutId="selected-mode"
                        className="w-2 h-2 rounded-full bg-angel-gold"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to get model display info for ChatBubble
export function getModelDisplayInfo(modelId: AIModel) {
  const MODEL_INFO: Record<AIModel, { icon: React.ReactNode; name: string; color: string }> = {
    'google/gemini-2.5-flash': { icon: <Zap className="w-3 h-3" />, name: 'Flash', color: 'text-blue-500' },
    'google/gemini-2.5-pro': { icon: <Sparkles className="w-3 h-3" />, name: 'Pro', color: 'text-purple-500' },
    'openai/gpt-5-mini': { icon: <Brain className="w-3 h-3" />, name: 'GPT-5 Mini', color: 'text-green-500' },
    'openai/gpt-5': { icon: <Brain className="w-3 h-3" />, name: 'GPT-5', color: 'text-amber-500' },
  };
  return MODEL_INFO[modelId] || MODEL_INFO['google/gemini-2.5-flash'];
}

export function getModeDisplayInfo(mode: SelectionMode) {
  return MODE_OPTIONS.find((m) => m.id === mode) || MODE_OPTIONS[0];
}
