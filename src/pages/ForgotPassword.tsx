import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    if (error) {
      toast({ title: 'Chưa gửi được email', description: error.message, variant: 'destructive' });
      return;
    }
    setSent(true);
    toast({
      title: 'Đã gửi email hướng dẫn ✨',
      description: 'Hãy kiểm tra hộp thư để đặt lại mật khẩu.',
    });
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl border border-angel-gold/20 shadow-divine p-6"
        >
          <h1 className="text-xl font-bold text-gradient-divine mb-2 text-center">Quên mật khẩu</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Nhập email của bạn, mình sẽ gửi liên kết đặt lại mật khẩu.
          </p>

          {sent ? (
            <p className="text-sm text-center text-muted-foreground">
              Email đã được gửi tới <span className="font-medium text-foreground">{email}</span>. Liên kết có hiệu lực trong thời gian ngắn.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-angel-gold/20 rounded-xl focus:outline-none focus:border-angel-gold/50 focus:shadow-divine transition-all"
                />
              </div>
              <Button type="submit" variant="divine" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Gửi email hướng dẫn'}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary font-medium hover:underline">Về trang đăng nhập</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
