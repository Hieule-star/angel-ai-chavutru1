import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Zap, Brain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AIModel } from '@/types';

interface ModelOption {
  id: AIModel;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini Flash',
    description: 'Nhanh & cân bằng',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-blue-500',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini Pro',
    description: 'Mạnh mẽ nhất',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-purple-500',
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    description: 'Thông minh & tiết kiệm',
    icon: <Brain className="w-4 h-4" />,
    color: 'text-green-500',
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    description: 'Cao cấp nhất',
    icon: <Rocket className="w-4 h-4" />,
    color: 'text-amber-500',
  },
];

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs h-8 px-3 bg-white/60 hover:bg-white/80 border border-angel-gold/20 rounded-full"
      >
        <span className={currentModel.color}>{currentModel.icon}</span>
        <span className="font-medium">{currentModel.name}</span>
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
              className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl border border-angel-gold/20 shadow-divine overflow-hidden z-50"
            >
              <div className="p-1">
                {MODEL_OPTIONS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      selectedModel === model.id
                        ? 'bg-angel-gold/10'
                        : 'hover:bg-angel-gold/5'
                    }`}
                  >
                    <span className={model.color}>{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                    {selectedModel === model.id && (
                      <motion.div
                        layoutId="selected-model"
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

export function getModelDisplayInfo(modelId: AIModel) {
  return MODEL_OPTIONS.find((m) => m.id === modelId) || MODEL_OPTIONS[0];
}
