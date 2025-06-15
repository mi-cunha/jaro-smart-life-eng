
import { supabase } from '@/integrations/supabase/client';
import { Receita } from '@/types/receitas';

export class RecipesService {
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

  static async salvarReceita(receita: Receita) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { data, error } = await supabase
        .from('receitas')
        .insert({
          nome: receita.nome,
          tempo_preparo: receita.tempo, // Map tempo to tempo_preparo
          calorias: receita.calorias,
          ingredientes: receita.ingredientes,
          instrucoes: receita.preparo?.join('\n') || '', // Map preparo array to instrucoes string
          usuario_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving recipe:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      return { data: null, error };
    }
  }

  static async buscarReceitas(refeicao?: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      let query = supabase
        .from('receitas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching recipes:', error);
        return { data: [], error };
      }
      
      if (data) {
        return {
          data: data.map(item => ({
            id: item.id,
            nome: item.nome,
            tempo: item.tempo_preparo || 30, // Map tempo_preparo back to tempo
            calorias: item.calorias || 300,
            refeicao: refeicao || 'Almoço', // Default refeicao since it's not in DB
            ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
            preparo: item.instrucoes ? item.instrucoes.split('\n') : [], // Map instrucoes back to preparo array
            macros: {
              proteinas: 25, // Default values since not in current DB schema
              carboidratos: 30,
              gorduras: 15
            },
            favorita: false // Default since not in current DB schema
          })),
          error: null
        };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return { data: [], error };
    }
  }

  static async atualizarReceita(id: string, updates: Partial<Receita>) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const updateData: any = { ...updates };
      
      // Map frontend fields to database fields
      if (updates.tempo) {
        updateData.tempo_preparo = updates.tempo;
        delete updateData.tempo;
      }
      
      if (updates.preparo) {
        updateData.instrucoes = updates.preparo.join('\n');
        delete updateData.preparo;
      }

      // Remove fields that don't exist in database
      delete updateData.refeicao;
      delete updateData.macros;
      delete updateData.favorita;

      const { data, error } = await supabase
        .from('receitas')
        .update(updateData)
        .eq('id', id)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating recipe:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      return { data: null, error };
    }
  }

  static async deletarReceita(id: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error deleting recipe:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      return { error };
    }
  }
}
