
import { supabase } from '@/integrations/supabase/client';

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
  created_at: string;
  updated_at: string;
}

export class HabitosService {
  static async buscarHabitos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: [], error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('habitos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching habits:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in buscarHabitos:', error);
      return { data: [], error };
    }
  }

  static async buscarHistoricoHoje() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: [], error: new Error('User not authenticated') };
      }

      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('historico_habitos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('data', hoje);

      if (error) {
        console.error('Error fetching today\'s habit history:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in buscarHistoricoHoje:', error);
      return { data: [], error };
    }
  }

  static async buscarProgressoSemanal() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: [], error: new Error('User not authenticated') };
      }

      const hoje = new Date();
      const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('historico_habitos')
        .select('data, concluido')
        .eq('usuario_id', user.id)
        .gte('data', seteDiasAtras.toISOString().split('T')[0])
        .lte('data', hoje.toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (error) {
        console.error('Error fetching weekly progress:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in buscarProgressoSemanal:', error);
      return { data: [], error };
    }
  }

  static async marcarHabitoCompleto(habitoId: string, concluido: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const hoje = new Date().toISOString().split('T')[0];

      // First, try to update existing record
      const { data: existing } = await supabase
        .from('historico_habitos')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('habito_id', habitoId)
        .eq('data', hoje)
        .single();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('historico_habitos')
          .update({ concluido, quantidade: concluido ? 1 : 0 })
          .eq('id', existing.id)
          .select()
          .single();

        return { data, error };
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('historico_habitos')
          .insert({
            usuario_id: user.id,
            habito_id: habitoId,
            data: hoje,
            concluido,
            quantidade: concluido ? 1 : 0
          })
          .select()
          .single();

        return { data, error };
      }
    } catch (error) {
      console.error('Error in marcarHabitoCompleto:', error);
      return { data: null, error };
    }
  }

  static async criarHabito(nome: string, descricao?: string, metaDiaria: number = 1) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('habitos')
        .insert({
          usuario_id: user.id,
          nome,
          descricao,
          meta_diaria: metaDiaria,
          ativo: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating habit:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in criarHabito:', error);
      return { data: null, error };
    }
  }
}
