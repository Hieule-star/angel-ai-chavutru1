import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();

  useEffect(() => {
    async function checkAdminRole() {
      if (!isAuthenticated || !user) {
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
          if (!data) {
            navigate('/');
          }
        }
      } catch (err) {
        console.error('Admin check failed:', err);
        setIsAdmin(false);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    checkAdminRole();
  }, [isAuthenticated, user, navigate]);

  return { isAdmin, loading };
}
