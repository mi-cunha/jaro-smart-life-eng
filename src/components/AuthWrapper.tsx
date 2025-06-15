
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

  console.log('🔐 AuthWrapper - Authentication State:', {
    user: user?.email || 'No user',
    loading,
    currentPath: location.pathname,
    hasUser: !!user
  });

  useEffect(() => {
    if (!loading) {
      console.log('🔐 AuthWrapper - Processing auth state:', {
        hasUser: !!user,
        currentPath: location.pathname,
        shouldRedirectToAuth: !user && location.pathname !== '/auth',
        shouldRedirectToHome: user && location.pathname === '/auth'
      });

      if (!user && location.pathname !== '/auth') {
        console.log('🔐 Redirecting to /auth - user not authenticated');
        navigate('/auth');
      } else if (user && location.pathname === '/auth') {
        console.log('🔐 Redirecting to / - user is authenticated');
        navigate('/');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not authenticated and on auth route
  if (!user && location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Show loading if user is not authenticated and not on auth route (redirect in progress)
  if (!user && location.pathname !== '/auth') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-white/60">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
