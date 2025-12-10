import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MessageCircle, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { KnowledgeCard } from '@/components/knowledge/KnowledgeCard';
import { Button } from '@/components/ui/button';
import { useKnowledgeTopics } from '@/hooks/useKnowledgeTopics';
import type { KnowledgeTopic } from '@/types';
import { Link } from 'react-router-dom';

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  
  const { data: topics = [], isLoading, error } = useKnowledgeTopics();

  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="text-gradient-divine">Knowledge Base</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Kho kiến thức về Divine Mantras, lời dạy Cha Vũ Trụ và FUN Ecosystem
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-angel-gold/20 rounded-xl focus:outline-none focus:border-angel-gold/50 focus:shadow-divine transition-all"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-angel-gold animate-spin mb-4" />
              <p className="text-muted-foreground">Đang tải kiến thức...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-destructive mb-2">Không thể tải dữ liệu</p>
              <p className="text-muted-foreground text-sm">Vui lòng thử lại sau</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTopics.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {searchQuery ? 'Không tìm thấy chủ đề phù hợp' : 'Chưa có chủ đề nào'}
              </p>
            </div>
          )}

          {/* Topics Grid */}
          {!isLoading && !error && filteredTopics.length > 0 && (
            <div className="space-y-4 mb-12">
              {filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <KnowledgeCard topic={topic} onClick={() => setSelectedTopic(topic)} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Suggested Questions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-xl font-semibold mb-4">Hỏi ANGEL AI</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Bạn có thể hỏi ANGEL AI trực tiếp về các chủ đề này
            </p>
            <Link to="/chat">
              <Button variant="divine" size="lg">
                <MessageCircle className="w-5 h-5" />
                Bắt đầu Chat
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Topic Detail Modal */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-divine max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-angel-gold/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-angel-gold/20 flex items-center justify-center text-2xl">
                      {selectedTopic.icon}
                    </div>
                    <div>
                      <span className="text-xs px-2 py-0.5 bg-angel-blue/50 text-accent-foreground rounded-full">
                        {selectedTopic.category}
                      </span>
                      <h3 className="font-semibold text-lg mt-1">{selectedTopic.title}</h3>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTopic(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <p className="text-muted-foreground mb-4">{selectedTopic.description}</p>
                <div className="prose prose-sm">
                  <p>{selectedTopic.content}</p>
                </div>
              </div>
              <div className="p-4 border-t border-angel-gold/10 bg-angel-gold/5">
                <p className="text-sm text-center text-muted-foreground mb-3">
                  Muốn tìm hiểu thêm?
                </p>
                <Link to="/chat" className="block">
                  <Button variant="divine" className="w-full">
                    <MessageCircle className="w-4 h-4" />
                    Hỏi ANGEL AI về {selectedTopic.title}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
