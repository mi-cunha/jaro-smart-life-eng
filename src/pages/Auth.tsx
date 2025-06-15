

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, loading, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const getRedirectPath = (subscribed: boolean) => {
    const storedPlan = localStorage.getItem('selectedPlan');
    
    if (storedPlan) {
      // User had selected a plan, redirect back to pricing to complete the flow
      console.log('User has stored plan, redirecting to pricing:', storedPlan);
      return `/pricing?plan=${encodeURIComponent(storedPlan)}`;
    }
    
    // Standard redirect logic
    if (subscribed === true) {
      console.log('✅ User is subscribed, redirecting to dashboard');
      return '/dashboard';
    } else {
      console.log('❌ User is not subscribed, redirecting to pricing');
      return '/pricing';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🚀 Starting sign in process for:', formData.email);
    const result = await signIn(formData.email, formData.password);
    
    if (!result.error) {
      console.log('🎯 Sign in result:', { subscribed: result.subscribed });
      const redirectPath = getRedirectPath(result.subscribed);
      navigate(redirectPath);
    } else {
      console.error('❌ Sign in failed:', result.error);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Attempting sign up for:', formData.email);
    const { error } = await signUp(formData.email, formData.password, formData.name);
    
    if (!error) {
      console.log('Sign up successful');
      const storedPlan = localStorage.getItem('selectedPlan');
      
      if (storedPlan) {
        console.log('New user with selected plan, redirecting to pricing:', storedPlan);
        navigate(`/pricing?plan=${encodeURIComponent(storedPlan)}`);
      } else {
        console.log('New user without plan, redirecting to pricing');
        navigate('/pricing');
      }
      
      setFormData({ email: '', password: '', name: '' });
    } else {
      console.error('Sign up error:', error);
    }
    setIsLoading(false);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  }

  // Show redirecting message for authenticated users
  if (user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          <span className="text-white">Redirecting...</span>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-dark-bg border-white/10 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <img
                src="/lovable-uploads/be25c910-c292-4a0f-8934-97cdb0172f59.png"
                alt="JaroSmart Logo"
                className="h-16 w-auto object-contain animate-pulse"
              />
            </div>
            <CardTitle className="text-white text-xl sm:text-2xl">
              Welcome to JaroSmart
            </CardTitle>
            <p className="text-white/60 text-sm sm:text-base">
              Your intelligent nutrition and wellness platform
            </p>
            {planFromUrl && (
              <div className="bg-neon-green/20 text-neon-green px-3 py-2 rounded-lg text-sm">
                Selected Plan: <strong>{planFromUrl}</strong>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-white/10 h-11">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white text-sm sm:text-base"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-neon-green data-[state=active]:text-black text-white text-sm sm:text-base"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white text-sm">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white text-sm">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white text-sm">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
                      placeholder="Create a password (min. 6 characters)"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-neon-green text-black hover:bg-neon-green/90 h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white text-sm">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-dark-bg border-white/20 text-white h-11 text-base focus:border-neon-green"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-neon-green text-black hover:bg-neon-green/90 h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white/60 hover:text-white text-sm"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

