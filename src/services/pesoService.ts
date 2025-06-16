
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: [], error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('historico_peso')
        .select('*')
        .eq('user_email', user.email)
        .order('data', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Error fetching weight history:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in buscarHistoricoPeso:', error);
      return { data: [], error };
    }
  }

  static async adicionarPeso(peso: number, observacoes?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

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
        console.error('Error adding weight record:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in adicionarPeso:', error);
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
        console.error('Error updating weight record:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in atualizarPeso:', error);
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
        console.error('Error deleting weight record:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deletarPeso:', error);
      return { error };
    }
  }
}
