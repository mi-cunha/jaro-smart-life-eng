
import { supabase } from '@/integrations/supabase/client';

export class UserService {
  static async loadUserProfile(userEmail: string) {
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

      return profileData;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  static async checkUserExists(email: string): Promise<boolean> {
    try {
      // Try to check if user exists by querying subscribers table first
      const { data: existingSubscriber, error: subError } = await supabase
        .from('subscribers')
        .select('user_email')
        .eq('user_email', email)
        .maybeSingle();
      
      if (!subError && existingSubscriber) {
        console.log('👤 User found in subscribers table:', email);
        return true;
      }

      // Fallback: try to sign in to check if user exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-check-123'
      });
      
      // If we get "Invalid login credentials", user exists but password is wrong
      // If we get "Email not confirmed", user exists but needs confirmation
      if (signInError && 
          (signInError.message.includes('Invalid login credentials') || 
           signInError.message.includes('Email not confirmed'))) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking if user exists:', error);
      return false;
    }
  }
}
