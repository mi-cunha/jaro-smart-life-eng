import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLoadingState } from '@/components/auth/AuthLoadingState';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, user } = useAuth();

  // Get plan from URL if present
  const planFromUrl = searchParams.get('plan');
  
  useEffect(() => {
    // Store plan from URL if present
    if (planFromUrl) {
      localStorage.setItem('selectedPlan', planFromUrl);
    }
  }, [planFromUrl]);

  // Authentication guard - redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      const storedPlan = localStorage.getItem('selectedPlan');
      if (storedPlan) {
        console.log('User already authenticated with stored plan, redirecting to pricing');
        navigate(`/pricing?plan=${encodeURIComponent(storedPlan)}`);
      } else {
        // Standard redirect logic for authenticated users
        // This will be handled by the existing subscription check logic
        const getRedirectPath = (subscribed: boolean) => {
          if (subscribed === true) {
            console.log('✅ User is subscribed, redirecting to dashboard');
            return '/dashboard';
          } else {
            console.log('❌ User is not subscribed, redirecting to pricing');
            return '/pricing';
          }
        };

        // For now, we'll assume user needs to go to pricing if no plan is stored
        // The actual subscription check should happen here but we'll keep it simple
        navigate('/pricing');
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return <AuthLoadingState type="loading" />;
  }

  // Show redirecting message for authenticated users
  if (user) {
    return <AuthLoadingState type="redirecting" />;
  }

  return (
    <AuthCard>
      <AuthForm />
    </AuthCard>
  );
};

export default Auth;
