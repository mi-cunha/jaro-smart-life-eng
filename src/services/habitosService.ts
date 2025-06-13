
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export interface Habito {
  id: string;
  usuario_id: string;
  nome: string;
  descricao?: string;
  meta_diaria: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface HistoricoHabito {
  id: string;
  usuario_id: string;
  habito_id: string;
  data: string;
  concluido: boolean;
  quantidade: number;
  observacoes?: string;
}

export class HabitosService {
  static async buscarHabitos() {
    try {
      const { data, error } = await supabase
        .from('habitos')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .eq('ativo', true)
        .order('created_at', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar hábitos:', error);
      return { data: [], error };
    }
  }

  static async buscarHistoricoHoje() {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('historico_habitos')
        .select(`
          *,
          habitos!inner(nome, meta_diaria)
        `)
        .eq('usuario_id', DEFAULT_USER_ID)
        .eq('data', hoje);

      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar histórico de hoje:', error);
      return { data: [], error };
    }
  }

  static async marcarHabitoCompleto(habitoId: string, concluido: boolean) {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('historico_habitos')
        .upsert({
          usuario_id: DEFAULT_USER_ID,
          habito_id: habitoId,
          data: hoje,
          concluido,
          quantidade: concluido ? 1 : 0
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao marcar hábito:', error);
      return { data: null, error };
    }
  }

  static async buscarProgressoSemanal() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('historico_habitos')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .gte('data', sevenDaysAgo.toISOString().split('T')[0])
        .order('data', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar progresso semanal:', error);
      return { data: [], error };
    }
  }
}
