
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
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  static async salvarPreferencias(preferencias: PreferenciasUsuario) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .upsert({
          objetivo: preferencias.objetivo,
          preferencias_alimentares: preferencias.alimentares,
          restricoes_alimentares: preferencias.restricoes,
          usuario_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving preferences:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      return { data: null, error };
    }
  }

  static async buscarPreferencias() {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      return { data: null, error };
    }
  }
}
