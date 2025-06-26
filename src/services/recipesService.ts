
import { supabase } from '@/integrations/supabase/client';
import { Receita } from '@/types/receitas';

export class RecipesService {
  // Helper method to get authenticated user with better error handling
  private static async getAuthenticatedUser() {
    try {
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session');
      }
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Then get the user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User authentication error:', userError);
        throw new Error('Authentication failed');
      }
      
      if (!user?.email) {
        throw new Error('User not authenticated');
      }
      
      return user;
    } catch (error) {
      console.error('Authentication process failed:', error);
      throw error;
    }
  }

  static async salvarReceita(receita: Receita) {
    try {
      const user = await this.getAuthenticatedUser();
      
      console.log('🔍 RecipesService - Salvando receita com dados:', {
        nome: receita.nome,
        macros: receita.macros,
        preparo: receita.preparo?.length || 0,
        ingredientes: receita.ingredientes?.length || 0
      });

      // Ensure we have valid macros from the recipe with better defaults
      const macrosData = receita.macros || { 
        proteinas: Math.round(Math.random() * 10 + 15), // 15-25g
        carboidratos: Math.round(Math.random() * 15 + 20), // 20-35g
        gorduras: Math.round(Math.random() * 8 + 5) // 5-13g
      };
      
      // Ensure we have valid preparation steps with more detailed defaults
      const preparoInstrucoes = receita.preparo && receita.preparo.length > 0 
        ? receita.preparo.join('\n') 
        : `Prepare all ingredients according to the recipe.\nFollow the cooking method appropriate for the ingredients.\nSeason to taste and adjust flavors as needed.\nServe immediately while fresh.`;

      console.log('🔍 RecipesService - Dados processados para salvar:', {
        proteinas: macrosData.proteinas,
        carboidratos: macrosData.carboidratos,
        gorduras: macrosData.gorduras,
        instrucoes: preparoInstrucoes.substring(0, 100) + '...'
      });

      const { data, error } = await supabase
        .from('receitas')
        .insert({
          nome: receita.nome,
          tempo_preparo: receita.tempo,
          calorias: receita.calorias,
          ingredientes: receita.ingredientes,
          instrucoes: preparoInstrucoes,
          proteinas: macrosData.proteinas,
          carboidratos: macrosData.carboidratos,
          gorduras: macrosData.gorduras,
          favorita: receita.favorita || false,
          refeicao: receita.refeicao || 'Almoço',
          user_email: user.email
        })
        .select()
        .single();

      if (error) {
        console.error('🚨 RecipesService - Error saving recipe:', error);
        return { data: null, error };
      }

      console.log('✅ RecipesService - Receita salva com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('🚨 RecipesService - Erro ao salvar receita:', error);
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
        console.error('🚨 RecipesService - Error fetching recipes:', error);
        return { data: [], error };
      }
      
      if (data) {
        const receitasProcessadas = data.map(item => {
          // Improved preparation steps processing
          let preparoSteps = ['Prepare ingredients as directed', 'Cook according to recipe requirements', 'Season to taste and serve'];
          
          if (item.instrucoes && item.instrucoes.trim()) {
            const steps = item.instrucoes.split('\n').filter(step => step.trim());
            if (steps.length > 0) {
              preparoSteps = steps;
            }
          }

          const receita = {
            id: item.id,
            nome: item.nome,
            tempo: item.tempo_preparo || 30,
            calorias: item.calorias || 300,
            refeicao: item.refeicao || 'Almoço',
            ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
            preparo: preparoSteps,
            macros: {
              proteinas: item.proteinas || 15,
              carboidratos: item.carboidratos || 25,
              gorduras: item.gorduras || 8
            },
            favorita: item.favorita || false
          };

          console.log('🔍 RecipesService - Receita processada:', {
            nome: receita.nome,
            macros: receita.macros,
            preparoSteps: receita.preparo.length
          });

          return receita;
        });

        return {
          data: receitasProcessadas,
          error: null
        };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('🚨 RecipesService - Erro ao buscar receitas:', error);
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

      console.log('🔍 RecipesService - Updating recipe:', { id, updateData });

      const { data, error } = await supabase
        .from('receitas')
        .update(updateData)
        .eq('id', id)
        .eq('user_email', user.email)
        .select()
        .single();

      if (error) {
        console.error('🚨 RecipesService - Error updating recipe:', error);
        return { data: null, error };
      }

      console.log('✅ RecipesService - Recipe updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('🚨 RecipesService - Erro ao atualizar receita:', error);
      return { data: null, error };
    }
  }

  static async deletarReceita(id: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      console.log('🔍 RecipesService - Deleting recipe:', id);

      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)
        .eq('user_email', user.email);

      if (error) {
        console.error('🚨 RecipesService - Error deleting recipe:', error);
        return { error };
      }

      console.log('✅ RecipesService - Recipe deleted successfully');
      return { error: null };
    } catch (error) {
      console.error('🚨 RecipesService - Erro ao deletar receita:', error);
      return { error };
    }
  }
}
