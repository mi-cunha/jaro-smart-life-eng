
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export interface PerfilUsuario {
  id?: string;
  usuario_id?: string;
  nome: string;
  email?: string;
  avatar_url?: string;
  
  // Preferências alimentares
  vegano: boolean;
  vegetariano: boolean;
  low_carb: boolean;
  sem_gluten: boolean;
  
  // Alergias e restrições
  alergias?: string;
  
  // Objetivos e metas
  peso_objetivo?: number;
  habitos_diarios: number;
  doses_cha: number;
  calorias_diarias: number;
  
  // Configurações de notificações
  notif_tomar_cha: boolean;
  notif_marcar_habito: boolean;
  notif_gerar_receitas: boolean;
  notif_comprar_itens: boolean;
  notif_atingir_meta: boolean;
  
  // Integrações
  google_fit: boolean;
  apple_health: boolean;
  fitbit: boolean;
  
  // Configurações de privacidade
  dados_uso: boolean;
  notificacoes_push: boolean;
}

export class PerfilService {
  static async buscarPerfil() {
    try {
      const { data, error } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return { data: null, error };
    }
  }

  static async atualizarPerfil(updates: Partial<PerfilUsuario>) {
    try {
      const { data, error } = await supabase
        .from('perfil_usuario')
        .update(updates)
        .eq('usuario_id', DEFAULT_USER_ID)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    }
  }

  static async salvarAvatar(file: File) {
    try {
      const fileName = `avatar-${Date.now()}-${file.name}`;
      
      // Por enquanto, vamos apenas simular o upload e retornar uma URL
      // Em uma implementação real, você faria upload para o Supabase Storage
      const avatarUrl = URL.createObjectURL(file);
      
      const { data, error } = await this.atualizarPerfil({
        avatar_url: avatarUrl
      });

      return { data, error };
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
      return { data: null, error };
    }
  }
}
