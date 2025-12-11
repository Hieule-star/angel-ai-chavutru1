import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { List, Search, Loader2, Trash2, Eye, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface KnowledgeTopic {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string | null;
  created_at: string | null;
}

export default function KnowledgeList() {
  const [topics, setTopics] = useState<KnowledgeTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [viewTopic, setViewTopic] = useState<KnowledgeTopic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<KnowledgeTopic | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    try {
      const { data, error } = await supabase
        .from('knowledge_topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTopics(data || []);

      // Extract unique categories
      const uniqueCategories = [...new Set((data || []).map((t) => t.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTopic) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('knowledge_topics')
        .delete()
        .eq('id', deleteTopic.id);

      if (error) throw error;

      setTopics((prev) => prev.filter((t) => t.id !== deleteTopic.id));
      toast({ title: 'Đã xóa topic thành công!' });
      setDeleteTopic(null);
    } catch (err: any) {
      toast({
        title: 'Lỗi xóa topic',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  }

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(search.toLowerCase()) ||
      topic.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || topic.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <List className="w-8 h-8 text-primary" />
            Knowledge List
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý tất cả knowledge topics
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tất cả categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Topics Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Độ dài</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {search || categoryFilter !== 'all'
                        ? 'Không tìm thấy topic nào'
                        : 'Chưa có topic nào'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTopics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">{topic.title}</p>
                          {topic.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {topic.category ? (
                          <Badge variant="secondary">{topic.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {topic.content?.length || 0} ký tự
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {topic.created_at
                          ? format(new Date(topic.created_at), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewTopic(topic)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTopic(topic)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredTopics.length} / {topics.length} topics
        </div>

        {/* View Dialog */}
        <Dialog open={!!viewTopic} onOpenChange={() => setViewTopic(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewTopic?.title}</DialogTitle>
              <DialogDescription>
                {viewTopic?.category && (
                  <Badge variant="secondary" className="mt-2">
                    {viewTopic.category}
                  </Badge>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {viewTopic?.description && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Mô tả</h4>
                  <p className="text-sm">{viewTopic.description}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Nội dung</h4>
                <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {viewTopic?.content || 'Không có nội dung'}
                  </pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTopic} onOpenChange={() => setDeleteTopic(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa topic "{deleteTopic?.title}"? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTopic(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  'Xóa'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
