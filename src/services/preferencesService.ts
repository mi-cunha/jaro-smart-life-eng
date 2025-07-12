
import { supabase } from '@/integrations/supabase/client';
import { PreferenciasUsuario } from '@/types/receitas';

export class PreferencesService {
  // Helper method to get authenticated user
  private static async getAuthenticatedUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
    if (!user?.email) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  static async salvarPreferencias(preferencias: PreferenciasUsuario) {
    try {
      const user = await this.getAuthenticatedUser();
      
      console.log('💾 PreferencesService: Salvando preferências:', preferencias);
      
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .upsert({
          user_email: user.email,
          objetivo: preferencias.objetivo,
          preferencias_alimentares: preferencias.alimentares, // Save as string
          restricoes_alimentares: preferencias.restricoes
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving preferences:', error);
        return { data: null, error };
      }

      console.log('✅ PreferencesService: Preferências salvas:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      return { data: null, error };
    }
  }

  static async buscarPreferencias() {
    try {
      console.log('🔄 PreferencesService - buscarPreferencias chamado');
      const user = await this.getAuthenticatedUser();
      console.log('👤 PreferencesService - Usuário autenticado:', user.email);
      
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('user_email', user.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return { data: null, error };
      }

      console.log('📥 PreferencesService: Dados brutos:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      return { data: null, error };
    }
  }
}
