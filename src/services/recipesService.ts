
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
    if (!user?.email) {
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
          tempo_preparo: receita.tempo,
          calorias: receita.calorias,
          ingredientes: receita.ingredientes,
          instrucoes: receita.preparo?.join('\n') || '',
          proteinas: receita.macros?.proteinas || 15,
          carboidratos: receita.macros?.carboidratos || 25,
          gorduras: receita.macros?.gorduras || 8,
          favorita: receita.favorita || false,
          refeicao: receita.refeicao || 'Almoço',
          user_email: user.email
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
        .eq('user_email', user.email)
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
            tempo: item.tempo_preparo || 30,
            calorias: item.calorias || 300,
            refeicao: item.refeicao || 'Almoço',
            ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
            preparo: item.instrucoes ? item.instrucoes.split('\n').filter(step => step.trim()) : [],
            macros: {
              proteinas: item.proteinas || 15,
              carboidratos: item.carboidratos || 25,
              gorduras: item.gorduras || 8
            },
            favorita: item.favorita || false
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
      
      const updateData: any = {};
      
      // Map frontend fields to database fields
      if (updates.nome !== undefined) updateData.nome = updates.nome;
      if (updates.tempo !== undefined) updateData.tempo_preparo = updates.tempo;
      if (updates.calorias !== undefined) updateData.calorias = updates.calorias;
      if (updates.ingredientes !== undefined) updateData.ingredientes = updates.ingredientes;
      if (updates.refeicao !== undefined) updateData.refeicao = updates.refeicao;
      if (updates.favorita !== undefined) updateData.favorita = updates.favorita;
      
      if (updates.preparo !== undefined) {
        updateData.instrucoes = updates.preparo.join('\n');
      }
      
      if (updates.macros !== undefined) {
        updateData.proteinas = updates.macros.proteinas;
        updateData.carboidratos = updates.macros.carboidratos;
        updateData.gorduras = updates.macros.gorduras;
      }

      const { data, error } = await supabase
        .from('receitas')
        .update(updateData)
        .eq('id', id)
        .eq('user_email', user.email)
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
        .eq('user_email', user.email);

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
