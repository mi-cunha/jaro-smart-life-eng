
import { supabase } from '@/integrations/supabase/client';

interface RecipeRequest {
  ingredientes: string[];
  preferenciasAlimentares: string;
  restricoesAlimentares: string[];
  tipoRefeicao: string;
  objetivo: string;
  tempoDisponivel: number;
  itensComprados?: string[];
}

interface RecipeResponse {
  nome: string;
  tempo: number;
  calorias: number;
  ingredientes: string[];
  preparo: string[];
  proteinas: number;
  carboidratos: number;
  gorduras: number;
}

export class OpenAIService {
  static async generateRecipe(request: RecipeRequest): Promise<RecipeResponse> {
    try {
      // Call the Supabase Edge Function for recipe generation
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: {
          ingredients: request.ingredientes,
          dietaryPreferences: request.preferenciasAlimentares,
          restrictions: request.restricoesAlimentares,
          mealType: request.tipoRefeicao,
          goal: request.objetivo,
          timeAvailable: request.tempoDisponivel,
          purchasedItems: request.itensComprados || []
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`API Error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data received from recipe generation service');
      }

      // Transform the response to match our interface
      return {
        nome: data.name || data.nome || 'Generated Recipe',
        tempo: data.prepTime || data.tempo || 30,
        calorias: data.calories || data.calorias || 300,
        ingredientes: data.ingredients || data.ingredientes || [],
        preparo: data.instructions || data.preparo || [],
        proteinas: data.protein || data.proteinas || 25,
        carboidratos: data.carbs || data.carboidratos || 30,
        gorduras: data.fats || data.gorduras || 15
      };
    } catch (error) {
      console.error('Error generating recipe with OpenAI:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API') || error.message.includes('OpenAI')) {
          throw new Error('OpenAI API Error. Please check your API key configuration.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          throw new Error(`Recipe generation failed: ${error.message}`);
        }
      } else {
        throw new Error('Unknown error occurred during recipe generation. Please try again.');
      }
    }
  }

  static async saveRecipeToSupabase(recipe: RecipeResponse, mealType: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .insert({
          nome: recipe.nome,
          tempo_preparo: recipe.tempo,
          calorias: recipe.calorias,
          ingredientes: recipe.ingredientes,
          instrucoes: recipe.preparo.join('\n'),
          usuario_id: '00000000-0000-0000-0000-000000000000' // Default user ID
        });

      if (error) {
        console.error('Error saving recipe to Supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving recipe:', error);
      return false;
    }
  }
}
