
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
      console.log('Sending recipe generation request:', request);

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
        throw new Error(`Recipe generation failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data received from recipe generation service');
      }

      console.log('Received recipe data:', data);

      // Validate and normalize the response
      const recipeResponse: RecipeResponse = {
        nome: data.nome || 'Receita Gerada',
        tempo: Number(data.tempo) || 30,
        calorias: Number(data.calorias) || 300,
        ingredientes: Array.isArray(data.ingredientes) ? data.ingredientes : [],
        preparo: Array.isArray(data.preparo) ? data.preparo : [],
        proteinas: Number(data.proteinas) || 25,
        carboidratos: Number(data.carboidratos) || 30,
        gorduras: Number(data.gorduras) || 15
      };

      // Additional validation
      if (recipeResponse.ingredientes.length === 0) {
        throw new Error('Recipe generation returned no ingredients');
      }

      if (recipeResponse.preparo.length === 0) {
        throw new Error('Recipe generation returned no preparation steps');
      }

      return recipeResponse;
    } catch (error) {
      console.error('Error generating recipe with OpenAI:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key not configured. Please check your API key in Supabase settings.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('Recipe generation failed')) {
          throw error; // Re-throw the specific error from the edge function
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.error('User not authenticated');
        return false;
      }

      const { data, error } = await supabase
        .from('receitas')
        .insert({
          nome: recipe.nome,
          tempo_preparo: recipe.tempo,
          calorias: recipe.calorias,
          ingredientes: recipe.ingredientes,
          instrucoes: recipe.preparo.join('\n'),
          user_email: user.email
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
