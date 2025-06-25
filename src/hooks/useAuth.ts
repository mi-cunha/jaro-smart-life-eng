
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      const subscriptionStatus = await checkSubscription(session.user.email);
      setIsSubscribed(subscriptionStatus);
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
          const subscriptionStatus = await checkSubscription(session.user.email);
          setIsSubscribed(subscriptionStatus);
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

  const checkSubscription = async (email: string): Promise<boolean> => {
    try {
      console.log('🔍 Checking subscription for email:', email);
      
      // Always try to insert/update the user record first
      const { error: upsertError } = await supabase
        .from('subscribers')
        .upsert({
          email: email,
          user_email: email,
          user_id: user?.id || null,
          subscribed: false, // Default to false, will be updated if subscription is found
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('❌ Error upserting subscriber:', upsertError);
      } else {
        console.log('✅ Subscriber record created/updated');
      }

      // First, try to check subscription via edge function
      try {
        const { data: checkResult, error: checkError } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (checkError) {
          console.error('❌ Error calling check-subscription function:', checkError);
        } else if (checkResult) {
          console.log('✅ Subscription check result from edge function:', checkResult);
          const subscribed = checkResult.subscribed || false;
          if (subscribed && email) {
            setTimeout(() => {
              loadUserProfile(email);
            }, 0);
          }
          return subscribed;
        }
      } catch (funcError) {
        console.error('❌ Edge function call failed:', funcError);
      }
      
      // Fallback to direct database check
      console.log('🔄 Falling back to direct database check');
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (subError) {
        console.error('❌ Error fetching subscriber:', subError);
        return false;
      }

      if (!subscriber) {
        console.log('❌ No subscriber found for email:', email);
        return false;
      }

      console.log('✅ Subscriber found:', subscriber);
      console.log('📊 Raw subscribed value:', subscriber.subscribed, 'Type:', typeof subscriber.subscribed);
      
      // Handle different possible boolean representations
      let isSubbed = false;
      const subscribedValue = subscriber.subscribed;
      
      if (subscribedValue === true) {
        isSubbed = true;
      } else if (typeof subscribedValue === 'string' && subscribedValue === 'true') {
        isSubbed = true;
      } else if (typeof subscribedValue === 'number' && subscribedValue === 1) {
        isSubbed = true;
      }
      
      console.log('✅ Final subscription status:', isSubbed);

      if (isSubbed && email) {
        setTimeout(() => {
          loadUserProfile(email);
        }, 0);
      }

      return isSubbed;
    } catch (error) {
      console.error('❌ Unexpected error checking subscription:', error);
      return false;
    }
  };

  const loadUserProfile = async (userEmail: string) => {
    try {
      const { data: perfil, error: perfilError } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      const { data: pesoAtual, error: pesoError } = await supabase
        .from('historico_peso')
        .select('peso')
        .eq('user_email', userEmail)
        .order('data', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: preferencias, error: prefError } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('user_email', userEmail)
        .maybeSingle();

      const profileData = {
        ...perfil,
        peso_atual: pesoAtual?.peso || perfil?.peso_atual,
        preferencias
      };

      setUserProfile(profileData);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      // Check if user already exists in auth.users
      const { data: existingUser, error } = await supabase.auth.admin.getUserByEmail(email);
      
      if (error && error.message !== 'User not found') {
        console.error('❌ Error checking existing user:', error);
        return false;
      }
      
      return !!existingUser;
    } catch (error) {
      // Fallback: try to sign in to check if user exists
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: 'dummy-password-check'
        });
        
        // If we get "Invalid login credentials", user exists but password is wrong
        // If we get "Email not confirmed", user exists but needs confirmation
        if (signInError?.message.includes('Invalid login credentials') || 
            signInError?.message.includes('Email not confirmed')) {
          return true;
        }
        
        return false;
      } catch (fallbackError) {
        console.error('❌ Fallback user check failed:', fallbackError);
        return false;
      }
    }
  };

  const signUp = async (email: string, password: string, nome?: string) => {
    try {
      console.log('🚀 Starting signup process for:', email);
      
      // Check if user already exists
      const userExists = await checkUserExists(email);
      if (userExists) {
        console.log('👤 User already exists:', email);
        toast.error('Já existe uma conta com este email. Faça login ou redefina sua senha.');
        return { error: { message: 'User already exists' } };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome || 'Usuário'
          }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('✅ Signup successful, creating subscriber record...');
      
      // Create subscriber record immediately after signup
      const { error: subscriberError } = await supabase
        .from('subscribers')
        .upsert({
          email: email,
          user_email: email,
          user_id: data.user?.id || null,
          subscribed: false,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });

      if (subscriberError) {
        console.error('❌ Error creating subscriber record:', subscriberError);
      } else {
        console.log('✅ Subscriber record created for new user');
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { data };
    } catch (error) {
      console.error('❌ Unexpected signup error:', error);
      toast.error('Erro inesperado ao criar conta');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('✅ Sign in successful, checking subscription...');
      
      // Wait a bit and then check subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      const subscribed = await checkSubscription(email);
      
      console.log('🎯 Final login result - subscribed:', subscribed);
      toast.success('Login realizado com sucesso!');
      
      return { data, subscribed };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      toast.error('Erro inesperado ao fazer login');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return { error };
      }

      setUser(null);
      setSession(null);
      setIsSubscribed(null);
      setUserProfile(null);

      toast.success('Logout realizado com sucesso!');
      return { error: null };
    } catch (error) {
      toast.error('Erro inesperado ao fazer logout');
      return { error };
    }
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
    checkSubscription
  };
}
