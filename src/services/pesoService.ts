
import { supabase } from '@/integrations/supabase/client';

export interface HistoricoPeso {
  id: string;
  user_email: string;
  peso: number;
  data: string;
  observacoes?: string;
  created_at: string;
}

export class PesoService {
  static async buscarHistoricoPeso(limite: number = 30) {
    try {
      console.log('🔄 PesoService - buscarHistoricoPeso chamado');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 PesoService - Usuário atual:', { user: user?.email, id: user?.id });
      
      if (!user?.email) {
        console.error('❌ Usuário não autenticado');
        return { data: [], error: new Error('User not authenticated') };
      }

      console.log('🔍 Buscando histórico de peso para:', user.email);

      const { data, error } = await supabase
        .from('historico_peso')
        .select('*')
        .eq('user_email', user.email)
        .order('data', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('❌ Erro ao buscar histórico de peso:', error);
        return { data: [], error };
      }

      console.log('✅ Histórico de peso encontrado:', data?.length, 'registros');
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar histórico:', error);
      return { data: [], error };
    }
  }

  static async adicionarPeso(peso: number, observacoes?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      console.log('💾 Adicionando peso:', peso, 'para:', user.email);

      const { data, error } = await supabase
        .from('historico_peso')
        .insert({
          user_email: user.email,
          peso,
          observacoes,
          data: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao adicionar peso:', error);
        return { data: null, error };
      }

      console.log('✅ Peso adicionado:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao adicionar peso:', error);
      return { data: null, error };
    }
  }

  static async atualizarPeso(id: string, peso: number, observacoes?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('historico_peso')
        .update({ peso, observacoes })
        .eq('id', id)
        .eq('user_email', user.email)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar peso:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar peso:', error);
      return { data: null, error };
    }
  }

  static async deletarPeso(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { error: new Error('User not authenticated') };
      }

      const { error } = await supabase
        .from('historico_peso')
        .delete()
        .eq('id', id)
        .eq('user_email', user.email);

      if (error) {
        console.error('❌ Erro ao deletar peso:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao deletar peso:', error);
      return { error };
    }
  }
}
