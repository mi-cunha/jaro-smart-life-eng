
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('🔐 AuthWrapper - Authentication State:', {
    user: user?.email || 'No user',
    loading,
    isSubscribed,
    currentPath: location.pathname,
    hasUser: !!user
  });

  useEffect(() => {
    if (!loading) {
      console.log('🔐 AuthWrapper - Processing auth state:', {
        hasUser: !!user,
        isSubscribed,
        currentPath: location.pathname,
        shouldRedirectToAuth: !user && location.pathname !== '/auth',
        shouldRedirectToPricing: user && isSubscribed === false && location.pathname !== '/pricing' && location.pathname !== '/auth'
      });

      // If user is not authenticated and not on auth page, redirect to auth
      if (!user && location.pathname !== '/auth') {
        console.log('🔐 Redirecting to /auth - user not authenticated');
        navigate('/auth');
        return;
      }

      // If user is authenticated but not subscribed, redirect to pricing (unless already on pricing or auth)
      if (user && isSubscribed === false && location.pathname !== '/pricing' && location.pathname !== '/auth') {
        console.log('🔐 Redirecting to /pricing - user not subscribed');
        navigate('/pricing');
        return;
      }

      // If user is authenticated and subscribed but on auth page, redirect to home
      if (user && isSubscribed === true && location.pathname === '/auth') {
        console.log('🔐 Redirecting to / - user is authenticated and subscribed');
        navigate('/');
        return;
      }
    }
  }, [user, loading, isSubscribed, navigate, location.pathname]);

  // Show loading while checking authentication or subscription
  if (loading || (user && isSubscribed === null)) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-white/60">
            {loading ? 'Loading authentication...' : 'Checking subscription...'}
          </p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not authenticated and on auth route
  if (!user && location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Show pricing page if user is authenticated but not subscribed and on pricing route
  if (user && isSubscribed === false && location.pathname === '/pricing') {
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

  // Show loading if user is authenticated but not subscribed and not on pricing route (redirect in progress)
  if (user && isSubscribed === false && location.pathname !== '/pricing') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-white/60">Redirecting to pricing...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and subscribed (or subscription check is null but we allow access), show protected content
  return <>{children}</>;
}
