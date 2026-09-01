import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MailCheck, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmail() {
  const { session } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const email = session?.user?.email || '';
  const redirectTo = (location.state as { from?: string } | null)?.from || '/play';

  useEffect(() => {
    if (session?.user?.email_confirmed_at) {
      navigate(redirectTo, { replace: true });
    }
  }, [session, navigate, redirectTo]);

  const handleResend = async () => {
    if (!email) return;
    setIsSending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/play` },
    });
    setIsSending(false);
    toast({
      title: error ? 'Chưa gửi được email' : 'Đã gửi lại email xác minh ✨',
      description: error ? error.message : `Vui lòng kiểm tra hộp thư ${email}.`,
      variant: error ? 'destructive' : undefined,
    });
  };

  const handleCheck = async () => {
    setIsChecking(true);
    const { data } = await supabase.auth.refreshSession();
    setIsChecking(false);
    if (data.user?.email_confirmed_at) {
      navigate(redirectTo, { replace: true });
    } else {
      toast({
        title: 'Email chưa được xác minh',
        description: 'Bạn hãy mở email và bấm vào liên kết xác minh nhé.',
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl border border-angel-gold/20 shadow-divine p-6 text-center"
        >
          <MailCheck className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold text-gradient-divine mb-2">Xác minh email của bạn</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {email
              ? <>Mình đã gửi liên kết xác minh tới <span className="font-medium text-foreground">{email}</span>. Hãy xác minh để mở khoá Angel Game.</>
              : 'Hãy đăng nhập để tiếp tục xác minh email.'}
          </p>

          <div className="space-y-3">
            <Button variant="divine" className="w-full" onClick={handleCheck} disabled={isChecking}>
              <RefreshCw className="w-4 h-4" />
              {isChecking ? 'Đang kiểm tra...' : 'Tôi đã xác minh'}
            </Button>
            <Button variant="holy" className="w-full" onClick={handleResend} disabled={isSending || !email}>
              {isSending ? 'Đang gửi...' : 'Gửi lại email xác minh'}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary font-medium hover:underline">Về trang đăng nhập</Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
