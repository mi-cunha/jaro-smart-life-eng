
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock user for public access
const mockUser: User = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'publico@jarosmart.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmation_sent_at: '',
  confirmed_at: '',
  last_sign_in_at: '',
  app_metadata: {},
  user_metadata: { nome: 'Usuário Público' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false
} as User;

export function useAuth() {
  const [user, setUser] = useState<User | null>(mockUser);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Set mock user immediately for public access
    setUser(mockUser);
    setLoading(false);
  }, []);

  const checkSubscription = async (email: string) => {
    try {
      console.log('Checking subscription for email:', email);
      
      // Buscar na tabela subscribers
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Erro ao buscar subscriber:', subError);
        return false;
      }

      if (!subscriber) {
        console.log('Subscriber não encontrado para email:', email);
        setIsSubscribed(false);
        return false;
      }

      console.log('Subscriber encontrado:', subscriber);
      setIsSubscribed(subscriber.subscribed);

      if (subscriber.subscribed && subscriber.usuario_id) {
        // Buscar dados do perfil usando usuario_id
        await loadUserProfile(subscriber.usuario_id);
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
      // Buscar perfil completo do usuário
      const { data: perfil, error: perfilError } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      if (perfilError && perfilError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', perfilError);
        return;
      }

      // Buscar histórico de peso mais recente
      const { data: pesoAtual, error: pesoError } = await supabase
        .from('historico_peso')
        .select('peso')
        .eq('usuario_id', userId)
        .order('data', { ascending: false })
        .limit(1)
        .single();

      if (pesoError && pesoError.code !== 'PGRST116') {
        console.error('Erro ao buscar peso atual:', pesoError);
      }

      // Buscar preferências
      const { data: preferencias, error: prefError } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      if (prefError && prefError.code !== 'PGRST116') {
        console.error('Erro ao buscar preferências:', prefError);
      }

      const profileData = {
        ...perfil,
        peso_atual: pesoAtual?.peso || perfil?.peso_atual,
        preferencias: preferencias
      };

      setUserProfile(profileData);
      console.log('Dados do usuário carregados:', profileData);
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

      // Verificar assinatura após login bem-sucedido
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
      
      // Reset states
      setUser(mockUser);
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
