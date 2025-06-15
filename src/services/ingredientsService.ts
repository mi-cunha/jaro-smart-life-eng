
import { supabase } from '@/integrations/supabase/client';

export class IngredientsService {
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

  static async salvarIngredientes(ingredientes: any[], refeicao: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const ingredientesData = ingredientes.map(ing => ({
        nome: ing.nome,
        categoria: ing.categoria || null,
        usuario_id: user.id
        // Note: selecionado, refeicao don't exist in current DB schema
      }));

      const { data, error } = await supabase
        .from('ingredientes')
        .upsert(ingredientesData, { 
          onConflict: 'usuario_id,nome',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Error saving ingredients:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao salvar ingredientes:', error);
      return { data: null, error };
    }
  }

  static async buscarIngredientes(refeicao?: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      let query = supabase
        .from('ingredientes')
        .select('*')
        .eq('usuario_id', user.id);

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching ingredients:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
      return { data: [], error };
    }
  }
}
