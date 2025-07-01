
import { supabase } from '@/integrations/supabase/client';

export class PerfilService {
  static async buscarPerfil() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      console.log('🔍 Buscando perfil para email:', user.email);

      const { data, error } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return { data: null, error };
      }

      console.log('✅ Perfil encontrado:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar perfil:', error);
      return { data: null, error };
    }
  }

  static async atualizarPerfil(dadosAtualizacao: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      console.log('💾 Atualizando perfil para:', user.email, dadosAtualizacao);

      const { data, error } = await supabase
        .from('perfil_usuario')
        .upsert({
          user_email: user.email,
          ...dadosAtualizacao,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return { data: null, error };
      }

      console.log('✅ Perfil atualizado:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar perfil:', error);
      return { data: null, error };
    }
  }

  static async salvarAvatar(file: File) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // For now, just return a placeholder since storage isn't configured
      // In a real implementation, you would upload to Supabase Storage
      const avatar_url = `https://placeholder-avatar.com/${user.email}`;
      
      const { data, error } = await this.atualizarPerfil({ avatar_url });
      
      return { data: { avatar_url }, error };
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar avatar:', error);
      return { data: null, error };
    }
  }
}
