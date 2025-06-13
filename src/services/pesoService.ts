
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export interface HistoricoPeso {
  id: string;
  usuario_id: string;
  peso: number;
  data: string;
  observacoes?: string;
}

export class PesoService {
  static async buscarHistoricoPeso(limite?: number) {
    try {
      let query = supabase
        .from('historico_peso')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .order('data', { ascending: false });

      if (limite) {
        query = query.limit(limite);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar histórico de peso:', error);
      return { data: [], error };
    }
  }

  static async adicionarPeso(peso: number, observacoes?: string) {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('historico_peso')
        .upsert({
          usuario_id: DEFAULT_USER_ID,
          peso,
          data: hoje,
          observacoes
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao adicionar peso:', error);
      return { data: null, error };
    }
  }

  static async buscarPesoAtual() {
    try {
      const { data, error } = await supabase
        .from('historico_peso')
        .select('peso')
        .eq('usuario_id', DEFAULT_USER_ID)
        .order('data', { ascending: false })
        .limit(1)
        .single();

      return { data: data?.peso || null, error };
    } catch (error) {
      console.error('Erro ao buscar peso atual:', error);
      return { data: null, error };
    }
  }
}
