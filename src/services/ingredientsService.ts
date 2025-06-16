
import { supabase } from '@/integrations/supabase/client';

export class IngredientsService {
  private static async getAuthenticatedUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
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
        user_email: user.email
      }));

      const { data, error } = await supabase
        .from('ingredientes')
        .upsert(ingredientesData, { 
          onConflict: 'user_email,nome',
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
        .eq('user_email', user.email);

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
