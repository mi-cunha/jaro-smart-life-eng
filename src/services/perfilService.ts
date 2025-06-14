
import { supabase } from '@/integrations/supabase/client';

export interface PerfilUsuario {
  id?: string;
  usuario_id?: string;
  nome: string;
  email?: string;
  avatar_url?: string;
  
  // Dietary preferences
  vegano: boolean;
  vegetariano: boolean;
  low_carb: boolean;
  sem_gluten: boolean;
  
  // Allergies and restrictions
  alergias?: string;
  
  // Goals and targets
  peso_objetivo?: number;
  habitos_diarios: number;
  doses_cha: number;
  calorias_diarias: number;
  
  // Notification settings
  notif_tomar_cha: boolean;
  notif_marcar_habito: boolean;
  notif_gerar_receitas: boolean;
  notif_comprar_itens: boolean;
  notif_atingir_meta: boolean;
  
  // Integrations
  google_fit: boolean;
  apple_health: boolean;
  fitbit: boolean;
  
  // Privacy settings
  dados_uso: boolean;
  notificacoes_push: boolean;
}

export class PerfilService {
  static async buscarPerfil() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error };
      }

      // If no profile exists, create a default one
      if (!data) {
        const defaultProfile = {
          usuario_id: user.id,
          nome: user.user_metadata?.nome || user.email?.split('@')[0] || 'User',
          email: user.email || 'user@jarosmart.com',
          vegano: false,
          vegetariano: false,
          low_carb: false,
          sem_gluten: false,
          habitos_diarios: 8,
          doses_cha: 2,
          calorias_diarias: 2000,
          notif_tomar_cha: true,
          notif_marcar_habito: true,
          notif_gerar_receitas: true,
          notif_comprar_itens: true,
          notif_atingir_meta: true,
          google_fit: false,
          apple_health: false,
          fitbit: false,
          dados_uso: true,
          notificacoes_push: true
        };

        const { data: newProfile, error: createError } = await supabase
          .from('perfil_usuario')
          .insert(defaultProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating default profile:', createError);
          return { data: null, error: createError };
        }

        return { data: newProfile, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in buscarPerfil:', error);
      return { data: null, error };
    }
  }

  static async atualizarPerfil(updates: Partial<PerfilUsuario>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('perfil_usuario')
        .update(updates)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in atualizarPerfil:', error);
      return { data: null, error };
    }
  }

  static async salvarAvatar(file: File) {
    try {
      const fileName = `avatar-${Date.now()}-${file.name}`;
      
      // For now, simulate upload and return a URL
      // In a real implementation, you would upload to Supabase Storage
      const avatarUrl = URL.createObjectURL(file);
      
      const { data, error } = await this.atualizarPerfil({
        avatar_url: avatarUrl
      });

      return { data, error };
    } catch (error) {
      console.error('Error saving avatar:', error);
      return { data: null, error };
    }
  }
}
