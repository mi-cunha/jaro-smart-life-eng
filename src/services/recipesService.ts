
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
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      // Then get the user from the session
      const user = session.user;
      
      if (!user?.email) {
        throw new Error('User email not found in session');
      }
      
      console.log('✅ User authenticated:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Authentication process failed:', error);
      throw error;
    }
  }

  static async salvarReceita(receita: Receita) {
    try {
      const user = await this.getAuthenticatedUser();
      
      console.log('🔍 RecipesService.salvarReceita - Salvando receita com dados:', {
        nome: receita.nome,
        tempo: receita.tempo,
        calorias: receita.calorias,
        macros: receita.macros,
        preparo: receita.preparo?.length || 0,
        ingredientes: receita.ingredientes?.length || 0
      });

      // Ensure we have valid macros from the recipe
      const macrosData = receita.macros || { 
        proteinas: 20,
        carboidratos: 30, 
        gorduras: 10
      };
      
      // Ensure we have valid preparation steps
      const preparoInstrucoes = receita.preparo && receita.preparo.length > 0 
        ? receita.preparo.join('\n') 
        : 'Prepare ingredients according to recipe requirements.';

      console.log('🔍 RecipesService.salvarReceita - Dados processados para salvar:', {
        tempo: receita.tempo,
        calorias: receita.calorias,
        proteinas: macrosData.proteinas,
        carboidratos: macrosData.carboidratos,
        gorduras: macrosData.gorduras,
        instrucoes_length: preparoInstrucoes.length
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
        console.error('🚨 RecipesService.salvarReceita - Error saving recipe:', error);
        return { data: null, error };
      }

      console.log('✅ RecipesService.salvarReceita - Receita salva com sucesso:', {
        id: data.id,
        nome: data.nome,
        tempo_preparo: data.tempo_preparo,
        calorias: data.calorias,
        proteinas: data.proteinas,
        carboidratos: data.carboidratos,
        gorduras: data.gorduras,
        instrucoes_length: data.instrucoes?.length || 0
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('🚨 RecipesService.salvarReceita - Erro ao salvar receita:', error);
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
        console.error('🚨 RecipesService.buscarReceitas - Error fetching recipes:', error);
        return { data: [], error };
      }
      
      console.log('🔍 RecipesService.buscarReceitas - Raw data from database:', data?.length || 0, 'recipes');
      
      if (data && data.length > 0) {
        console.log('🔍 RecipesService.buscarReceitas - Sample raw recipe from DB:', {
          id: data[0].id,
          nome: data[0].nome,
          tempo_preparo: data[0].tempo_preparo,
          calorias: data[0].calorias,
          proteinas: data[0].proteinas,
          carboidratos: data[0].carboidratos,
          gorduras: data[0].gorduras,
          instrucoes_length: data[0].instrucoes?.length || 0,
          instrucoes_preview: data[0].instrucoes?.substring(0, 100),
          ingredientes_type: typeof data[0].ingredientes,
          ingredientes_sample: data[0].ingredientes
        });
      }
      
      if (data) {
        const receitasProcessadas = data.map(item => {
          console.log('🔍 Processing recipe raw data:', {
            nome: item.nome,
            tempo_preparo: item.tempo_preparo,
            calorias: item.calorias,
            proteinas: item.proteinas,
            carboidratos: item.carboidratos,
            gorduras: item.gorduras,
            ingredientes_raw: item.ingredientes
          });

          // Process ingredientes safely - handle Json type conversion
          let processedIngredientes: string[] = [];
          if (item.ingredientes) {
            try {
              if (Array.isArray(item.ingredientes)) {
                // Convert Json[] to string[] by filtering and mapping
                processedIngredientes = item.ingredientes
                  .filter((ing): ing is string => typeof ing === 'string')
                  .map(ing => String(ing));
              } else if (typeof item.ingredientes === 'string') {
                // Handle case where it might be a JSON string
                const parsed = JSON.parse(item.ingredientes);
                if (Array.isArray(parsed)) {
                  processedIngredientes = parsed
                    .filter((ing): ing is string => typeof ing === 'string')
                    .map(ing => String(ing));
                }
              }
            } catch (e) {
              console.warn('🚨 Error processing ingredientes for recipe:', item.nome, e);
              processedIngredientes = [];
            }
          }

          // Process preparation steps more carefully
          let preparoSteps: string[] = [];
          
          if (item.instrucoes && item.instrucoes.trim()) {
            // Split by newlines and filter out empty lines
            const steps = item.instrucoes.split('\n').filter(step => step.trim());
            if (steps.length > 0) {
              preparoSteps = steps;
            }
          }
          
          // Only use fallback if we truly have no instructions
          if (preparoSteps.length === 0) {
            preparoSteps = [
              'Prepare all ingredients according to the recipe requirements.',
              'Follow the cooking method appropriate for the ingredients.',
              'Season to taste and serve as desired.'
            ];
          }

          // Preserve original values from database - don't override with defaults if they exist
          const tempo = item.tempo_preparo || 30;
          const calorias = item.calorias || 300;
          const proteinas = item.proteinas || 20;
          const carboidratos = item.carboidratos || 30;
          const gorduras = item.gorduras || 10;

          const receita: Receita = {
            id: item.id,
            nome: item.nome,
            tempo: tempo,
            calorias: calorias,
            refeicao: item.refeicao || 'Almoço',
            ingredientes: processedIngredientes,
            preparo: preparoSteps,
            macros: {
              proteinas: proteinas,
              carboidratos: carboidratos,
              gorduras: gorduras
            },
            favorita: item.favorita || false
          };

          console.log('🔍 RecipesService.buscarReceitas - Receita processada:', {
            id: receita.id,
            nome: receita.nome,
            tempo: receita.tempo,
            calorias: receita.calorias,
            macros: receita.macros,
            preparoSteps: receita.preparo.length,
            ingredientesCount: receita.ingredientes.length,
            originalValues: {
              tempo_preparo: item.tempo_preparo,
              calorias: item.calorias,
              proteinas: item.proteinas,
              carboidratos: item.carboidratos,
              gorduras: item.gorduras
            }
          });

          return receita;
        });

        console.log('✅ RecipesService.buscarReceitas - Total receitas processadas:', receitasProcessadas.length);

        return {
          data: receitasProcessadas,
          error: null
        };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('🚨 RecipesService.buscarReceitas - Erro ao buscar receitas:', error);
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
