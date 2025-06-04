
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user && location.pathname !== '/auth') {
        navigate('/auth');
      } else if (user && location.pathname === '/auth') {
        navigate('/');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/auth') {
    return null;
  }

  return <>{children}</>;
}
