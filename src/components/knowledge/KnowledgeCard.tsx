import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { KnowledgeTopic } from '@/types';

interface KnowledgeCardProps {
  topic: KnowledgeTopic;
  onClick: () => void;
}

export function KnowledgeCard({ topic, onClick }: KnowledgeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-5 bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-angel-gold/20 hover:border-angel-gold/40 rounded-2xl cursor-pointer transition-all shadow-soft hover:shadow-divine group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-angel-gold/20 flex items-center justify-center text-2xl">
          {topic.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-angel-blue/50 text-accent-foreground rounded-full">
              {topic.category}
            </span>
          </div>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-gradient-divine transition-all">
            {topic.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {topic.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
}
