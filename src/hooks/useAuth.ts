
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services/authService';
import { SubscriptionService } from '@/services/subscriptionService';
import { UserService } from '@/services/userService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const getSessionAndUser = async () => {
      setLoading(true);

      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setUser(null);
        setSession(null);
        setIsSubscribed(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      setSession(session);
      
      // Check subscription after setting user
      const subscriptionStatus = await SubscriptionService.checkSubscription(session.user.email, session);
      setIsSubscribed(subscriptionStatus);
      
      // Load user profile if subscribed
      if (subscriptionStatus && session.user.email) {
        setTimeout(async () => {
          const profile = await UserService.loadUserProfile(session.user.email);
          setUserProfile(profile);
        }, 0);
      }
      
      setLoading(false);
    };

    getSessionAndUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔐 Auth state change:', _event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        // Defer subscription check to avoid recursion
        setTimeout(async () => {
          const subscriptionStatus = await SubscriptionService.checkSubscription(session.user.email, session);
          setIsSubscribed(subscriptionStatus);
          
          // Load user profile if subscribed
          if (subscriptionStatus && session.user.email) {
            const profile = await UserService.loadUserProfile(session.user.email);
            setUserProfile(profile);
          }
        }, 100);
      } else {
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setIsSubscribed(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, nome?: string) => {
    return await AuthService.signUp(email, password, nome);
  };

  const signIn = async (email: string, password: string) => {
    return await AuthService.signIn(email, password, session);
  };

  const signOut = async () => {
    const result = await AuthService.signOut();
    if (!result.error) {
      setUser(null);
      setSession(null);
      setIsSubscribed(null);
      setUserProfile(null);
    }
    return result;
  };

  const checkSubscription = async (email: string) => {
    return await SubscriptionService.checkSubscription(email, session);
  };

  const fixSubscriptionStatus = async (email: string) => {
    const result = await SubscriptionService.fixSubscriptionStatus(email);
    if (result) {
      // Refresh subscription status
      const newStatus = await SubscriptionService.checkSubscription(email, session);
      setIsSubscribed(newStatus);
    }
    return result;
  };

  return {
    user,
    session,
    loading,
    isSubscribed,
    userProfile,
    signUp,
    signIn,
    signOut,
    checkSubscription,
    fixSubscriptionStatus
  };
}
