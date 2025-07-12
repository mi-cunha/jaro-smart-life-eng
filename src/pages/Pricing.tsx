
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, CheckCircle, LogOut } from 'lucide-react';
import { JaroSmartLogo } from '@/components/JaroSmartLogo';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionService } from '@/services/subscriptionService';
import { toast } from 'sonner';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, isSubscribed, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check for session_id in URL params (returned from successful Stripe checkout)
  const sessionId = searchParams.get('session_id');

  // Check for plan from URL params or localStorage on component mount
  useEffect(() => {
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl) {
      localStorage.setItem('selectedPlan', planFromUrl);
    }

    // Auto-sync subscription if returning from Stripe checkout
    if (sessionId && user && isSubscribed === false) {
      console.log('🎯 Returned from Stripe checkout, auto-syncing subscription...');
      toast.info('Verificando status da assinatura...');
      // Wait a moment for Stripe webhook to process, then sync
      setTimeout(() => {
        handleSyncSubscription();
      }, 3000);
    }
  }, [sessionId, user, isSubscribed]);

  // Check for user login and stored plan
  useEffect(() => {
    // If user is logged in and subscribed, redirect to home (unless we just completed checkout)
    if (user && isSubscribed === true && !sessionId) {
      console.log('User is already subscribed, redirecting to home');
      navigate('/');
      return;
    }

    // If user is logged in and there's a stored plan, proceed to checkout
    if (user && !loading && isSubscribed === false && !sessionId) {
      const storedPlan = localStorage.getItem('selectedPlan');
      if (storedPlan) {
        console.log('User is logged in with stored plan:', storedPlan);
        localStorage.removeItem('selectedPlan');
        handleChoosePlan(storedPlan);
      }
    }
  }, [user, loading, isSubscribed, sessionId]);

  const plans = [
    {
      name: "Weekly Plan",
      price: "$9.99",
      period: "/week",
      features: [
        "Personalized meal plans",
        "Custom workout routines",
        "Progress tracking",
        "24/7 AI coaching"
      ],
      popular: false,
      priceId: "STRIPE_WEEKLY_PRICE_ID_EN"
    },
    {
      name: "Monthly Plan",
      price: "$19.99",
      period: "/month",
      features: [
        "Personalized meal plans",
        "Custom workout routines",
        "Progress tracking",
        "24/7 AI coaching"
      ],
      popular: true,
      priceId: "STRIPE_MONTHLY_PRICE_ID_EN"
    },
    {
      name: "Annual Plan",
      price: "$99",
      period: "/year",
      features: [
        "Personalized meal plans",
        "Custom workout routines",
        "Progress tracking",
        "24/7 AI coaching"
      ],
      popular: false,
      badge: "Best Value",
      priceId: "STRIPE_ANNUAL_PRICE_ID_EN"
    }
  ];

  const handleChoosePlan = async (planName: string) => {
    // Don't proceed if auth is still loading
    if (loading) {
      toast.error('Loading authentication status...');
      return;
    }

    if (!user) {
      console.log('User not logged in, storing plan and redirecting to auth:', planName);
      localStorage.setItem('selectedPlan', planName);
      toast.error('Please create an account to choose a plan');
      navigate(`/auth?plan=${encodeURIComponent(planName)}`);
      return;
    }

    setIsLoading(true);
    console.log('Creating checkout for plan:', planName);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planName }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message);
      }

      console.log('Checkout response:', data);

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        // Clear stored plan since we're proceeding to checkout
        localStorage.removeItem('selectedPlan');
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Error creating checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Clear any stored plans and navigate properly
    localStorage.removeItem('selectedPlan');
    if (user) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleSyncSubscription = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    toast.info('Sincronizando dados da assinatura...');
    
    try {
      const session = await supabase.auth.getSession();
      const result = await SubscriptionService.syncWithStripe(user.email!, session.data.session);
      
      if (result.success) {
        toast.success(result.message || 'Dados sincronizados com sucesso!');
        if (result.subscribed) {
          // Force a page reload to update auth state
          window.location.reload();
        }
      } else {
        toast.error(result.message || 'Erro ao sincronizar dados');
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro inesperado ao sincronizar dados');
    } finally {
      setIsSyncing(false);
    }
  };

  // If user is already subscribed, show different content
  if (user && isSubscribed === true) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <div className="bg-dark-bg border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <JaroSmartLogo size="md" />
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-neon-green mr-4" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              You're All Set!
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Your subscription is active and you have full access to all features.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-neon-green text-black hover:bg-neon-green/90 font-medium py-3 px-8"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-bg border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <JaroSmartLogo size="md" />
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="text-white/70 text-sm hidden sm:inline">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-white/60 hover:text-white flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={handleBackToLogin}
              className="text-white/60 hover:text-white"
            >
              {user ? 'Dashboard' : 'Login'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          
          {/* Show sync button if we have a session_id (just returned from checkout) */}
          {sessionId && user && !isSubscribed && (
            <div className="mb-8 p-4 bg-white/5 border border-neon-green/20 rounded-lg">
              <p className="text-white/80 mb-4">
                Checkout concluído! Clique no botão abaixo para ativar sua assinatura.
              </p>
              <Button
                onClick={handleSyncSubscription}
                disabled={isSyncing}
                className="bg-neon-green text-black hover:bg-neon-green/90 font-medium py-2 px-6"
              >
                {isSyncing ? 'Sincronizando...' : 'Ativar Assinatura'}
              </Button>
            </div>
          )}

          <p className="text-white/70 text-lg mb-8">
            Start your transformation today
          </p>


          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative bg-dark-bg border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-neon-green shadow-lg shadow-neon-green/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-neon-green to-green-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                
                {/* Discount badges */}
                {plan.name === "Monthly Plan" && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold">
                      50% OFF
                    </div>
                  </div>
                )}
                
                {plan.name === "Annual Plan" && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold">
                      80% OFF
                    </div>
                  </div>
                )}

                <CardContent className="p-8 pt-10">
                  <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/60">{plan.period}</span>
                    
                    {plan.badge && (
                      <div className="mt-2">
                        <span className="bg-neon-green text-black px-3 py-1 rounded-full text-sm font-medium">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-white/80">
                        <Check className="w-5 h-5 text-neon-green flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleChoosePlan(plan.name)}
                    disabled={isLoading || loading}
                    className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-medium py-3"
                  >
                    {loading ? 'Loading...' : isLoading ? 'Creating checkout...' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-white/50 text-sm">
            Cancel anytime. No commitments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
