
import { supabase } from '@/integrations/supabase/client';

export interface PerfilUsuario {
  id?: string;
  user_email?: string;
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
  peso_atual?: number;
  meta_peso?: number;
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
      if (!user?.email) {
        console.log('❌ User not authenticated or email missing');
        return { data: null, error: new Error('User not authenticated') };
      }

      console.log('🔍 Loading profile for user email:', user.email);

      // Buscar perfil usando user_email
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('user_email', user.email)
        .maybeSingle();

      if (perfilError) {
        console.error('❌ Error fetching profile:', perfilError);
        return { data: null, error: perfilError };
      }

      // Se não existe perfil, criar um padrão
      if (!perfilData) {
        console.log('🔧 Creating default profile for user:', user.email);
        const defaultProfile = {
          user_email: user.email,
          nome: user.user_metadata?.nome || user.email?.split('@')[0] || 'User',
          email: user.email,
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
          console.error('❌ Error creating default profile:', createError);
          return { data: null, error: createError };
        }

        console.log('✅ Default profile created successfully');
        return { data: newProfile, error: null };
      }

      console.log('✅ Profile loaded successfully:', perfilData);
      return { data: perfilData, error: null };
    } catch (error) {
      console.error('❌ Exception in buscarPerfil:', error);
      return { data: null, error };
    }
  }

  static async atualizarPerfil(updates: Partial<PerfilUsuario>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.log('❌ User not authenticated for profile update');
        return { data: null, error: new Error('User not authenticated') };
      }

      console.log('🔧 Updating profile for user:', user.email, 'with updates:', updates);

      const { data, error } = await supabase
        .from('perfil_usuario')
        .update(updates)
        .eq('user_email', user.email)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile:', error);
        return { data: null, error };
      }

      console.log('✅ Profile updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Exception in atualizarPerfil:', error);
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
      console.error('❌ Error saving avatar:', error);
      return { data: null, error };
    }
  }
}
