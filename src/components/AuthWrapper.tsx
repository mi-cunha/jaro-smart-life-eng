
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading, isSubscribed, refreshSubscriptionStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  console.log('🔐 AuthWrapper - Authentication State:', {
    user: user?.email || 'No user',
    loading,
    isSubscribed,
    currentPath: location.pathname,
    hasUser: !!user,
    hasRedirected
  });

  useEffect(() => {
    if (!loading && !hasRedirected) {
      console.log('🔐 AuthWrapper - Processing auth state:', {
        hasUser: !!user,
        isSubscribed,
        currentPath: location.pathname
      });

      // If user is not authenticated and not on auth page, redirect to auth
      if (!user && location.pathname !== '/auth') {
        console.log('🔐 Redirecting to /auth - user not authenticated');
        setHasRedirected(true);
        navigate('/auth');
        return;
      }

      // If user is authenticated and subscribed
      if (user && isSubscribed === true) {
        // If on auth page or pricing page, redirect to dashboard
        if (location.pathname === '/auth' || location.pathname === '/pricing') {
          console.log('🔐 Redirecting to / - user is authenticated and subscribed');
          setHasRedirected(true);
          navigate('/');
          return;
        }
      }

      // If user is authenticated but not subscribed
      if (user && isSubscribed === false) {
        // If on auth page, redirect to home for quiz
        if (location.pathname === '/auth') {
          console.log('🔐 Redirecting to / - user authenticated but not subscribed, start with quiz');
          setHasRedirected(true);
          navigate('/');
          return;
        }
      }
    }
  }, [user, loading, isSubscribed, navigate, location.pathname, hasRedirected]);

  // Reset redirect flag when location changes
  useEffect(() => {
    setHasRedirected(false);
  }, [location.pathname]);

  // Show loading while checking authentication or subscription
  if (loading || (user && isSubscribed === null)) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-white/60">
            {loading ? 'Loading...' : 'Checking subscription...'}
          </p>
          {user && refreshSubscriptionStatus && (
            <button
              onClick={() => refreshSubscriptionStatus()}
              className="mt-4 text-neon-green hover:text-neon-green/80 text-sm underline"
            >
              Refresh Status
            </button>
          )}
        </div>
      </div>
    );
  }

  // Always render children for authenticated pages
  return <>{children}</>;
}
