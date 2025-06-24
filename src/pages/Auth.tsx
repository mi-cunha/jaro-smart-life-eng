
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLoadingState } from '@/components/auth/AuthLoadingState';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, user, isSubscribed } = useAuth();

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
      console.log('🔐 Auth page - User is authenticated:', {
        email: user.email,
        isSubscribed,
        planFromUrl
      });

      const storedPlan = localStorage.getItem('selectedPlan');
      
      // If user has a stored plan or plan from URL, always go to pricing
      if (storedPlan || planFromUrl) {
        const targetPlan = planFromUrl || storedPlan;
        console.log('✅ User has plan context, redirecting to pricing:', targetPlan);
        navigate(`/pricing?plan=${encodeURIComponent(targetPlan)}`);
        return;
      }

      // If user is subscribed, go to dashboard
      if (isSubscribed === true) {
        console.log('✅ User is subscribed, redirecting to dashboard');
        navigate('/');
        return;
      }

      // If user is not subscribed, go to pricing
      if (isSubscribed === false) {
        console.log('❌ User is not subscribed, redirecting to pricing');
        navigate('/pricing');
        return;
      }

      // If subscription status is still loading (null), wait a bit then default to pricing
      if (isSubscribed === null) {
        console.log('⏳ Subscription status unknown, waiting...');
        setTimeout(() => {
          if (isSubscribed === null) {
            console.log('⏳ Subscription check timeout, redirecting to pricing');
            navigate('/pricing');
          }
        }, 3000);
      }
    }
  }, [user, loading, isSubscribed, navigate, planFromUrl]);

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
