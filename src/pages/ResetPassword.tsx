import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: 'Mật khẩu chưa đủ mạnh',
        description: 'Mật khẩu cần ít nhất 6 ký tự.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: 'Mật khẩu chưa trùng khớp',
        description: 'Vui lòng nhập lại mật khẩu xác nhận.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toast({ title: 'Chưa đặt lại được mật khẩu', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Đã đặt lại mật khẩu ✨', description: 'Bạn có thể tiếp tục sử dụng Angel AI.' });
    navigate('/play', { replace: true });
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl border border-angel-gold/20 shadow-divine p-6"
        >
          <h1 className="text-xl font-bold text-gradient-divine mb-2 text-center">Đặt lại mật khẩu</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            {ready
              ? 'Nhập mật khẩu mới cho tài khoản của bạn.'
              : 'Hãy mở trang này từ liên kết trong email đặt lại mật khẩu.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu mới"
                className="w-full pl-12 pr-12 py-3 bg-white border border-angel-gold/20 rounded-xl focus:outline-none focus:border-angel-gold/50 focus:shadow-divine transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-12 pr-4 py-3 bg-white border border-angel-gold/20 rounded-xl focus:outline-none focus:border-angel-gold/50 focus:shadow-divine transition-all"
              />
            </div>
            <Button type="submit" variant="divine" size="lg" className="w-full" disabled={isLoading || !ready}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary font-medium hover:underline">Về trang đăng nhập</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
