
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
        setLoading(false);
        return;
      }

      setUser(session.user);
      setSession(session);
      await checkSubscription(session.user.email);
      setLoading(false);
    };

    getSessionAndUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        // Defer Supabase calls to avoid recursion
        setTimeout(() => {
          checkSubscription(session.user.email);
        }, 0);
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

  const checkSubscription = async (email: string) => {
    try {
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Erro ao buscar subscriber:', subError);
        setIsSubscribed(false);
        return false;
      }

      if (!subscriber) {
        setIsSubscribed(false);
        return false;
      }

      setIsSubscribed(subscriber.subscribed);

      if (subscriber.subscribed && subscriber.usuario_id) {
        setTimeout(() => {
          loadUserProfile(subscriber.usuario_id);
        }, 0);
      }

      return subscriber.subscribed;
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setIsSubscribed(false);
      return false;
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: perfil, error: perfilError } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      const { data: pesoAtual, error: pesoError } = await supabase
        .from('historico_peso')
        .select('peso')
        .eq('usuario_id', userId)
        .order('data', { ascending: false })
        .limit(1)
        .single();

      const { data: preferencias, error: prefError } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .single();

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

  const signUp = async (email: string, password: string, nome?: string) => {
    try {
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
        toast.error(error.message);
        return { error };
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { data };
    } catch (error) {
      toast.error('Erro inesperado ao criar conta');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      const subscribed = await checkSubscription(email);
      toast.success('Login realizado com sucesso!');
      return { data, subscribed };
    } catch (error) {
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
