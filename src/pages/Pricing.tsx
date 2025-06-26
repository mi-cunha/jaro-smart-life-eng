
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, CheckCircle } from 'lucide-react';
import { JaroSmartLogo } from '@/components/JaroSmartLogo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, isSubscribed } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check for plan from URL params or localStorage on component mount
  useEffect(() => {
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl) {
      localStorage.setItem('selectedPlan', planFromUrl);
    }

    // If user is logged in and subscribed, redirect to home
    if (user && isSubscribed === true) {
      console.log('User is already subscribed, redirecting to home');
      navigate('/');
      return;
    }

    // If user is logged in and there's a stored plan, proceed to checkout
    if (user && !loading && isSubscribed === false) {
      const storedPlan = localStorage.getItem('selectedPlan');
      if (storedPlan) {
        console.log('User is logged in with stored plan:', storedPlan);
        localStorage.removeItem('selectedPlan');
        handleChoosePlan(storedPlan);
      }
    }
  }, [user, loading, searchParams, isSubscribed]);

  const plans = [
    {
      name: "Weekly Plan",
      price: "$9.99",
      period: "/week",
      features: [
        "7-day free trial",
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
        "7-day free trial",
        "Personalized meal plans",
        "Custom workout routines",
        "Progress tracking",
        "24/7 AI coaching"
      ],
      popular: true,
      priceId: "STRIPE_MONTHLY_PRICE_ID_EN"
    },
    {
      name: "Quarterly Plan",
      price: "$35",
      period: "/3 months",
      features: [
        "7-day free trial",
        "Personalized meal plans",
        "Custom workout routines",
        "Progress tracking",
        "24/7 AI coaching"
      ],
      popular: false,
      badge: "Best Value",
      priceId: "STRIPE_QUARTERLY_PRICE_ID_EN"
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
          <Button
            variant="ghost"
            onClick={handleBackToLogin}
            className="text-white/60 hover:text-white"
          >
            {user ? 'Back to Dashboard' : 'Back to Login'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          
          <div className="inline-flex items-center gap-2 bg-neon-green/20 text-neon-green px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4" />
            <span className="font-medium">7 Days Free Trial Included!</span>
          </div>

          <p className="text-white/70 text-lg mb-12">
            Start your transformation today with zero risk
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
                
                {plan.badge && !plan.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <CardContent className="p-8 pt-10">
                  <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/60">{plan.period}</span>
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
            All plans include 7 days free trial. Cancel anytime during the trial period.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
