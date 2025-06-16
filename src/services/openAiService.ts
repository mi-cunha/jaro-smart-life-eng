
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

      // Validate and normalize the response with more strict checks
      const recipeResponse: RecipeResponse = {
        nome: data.nome && data.nome.trim() ? data.nome.trim() : 'Healthy Recipe',
        tempo: Math.max(Number(data.tempo) || 15, 5),
        calorias: Math.max(Number(data.calorias) || 250, 50),
        ingredientes: Array.isArray(data.ingredientes) && data.ingredientes.length > 0 
          ? data.ingredientes.filter(ing => ing && ing.trim()) 
          : ['Basic ingredients'],
        preparo: Array.isArray(data.preparo) && data.preparo.length > 0 
          ? data.preparo.filter(step => step && step.trim()) 
          : ['Follow basic preparation steps'],
        proteinas: Math.max(Number(data.proteinas) || 10, 0),
        carboidratos: Math.max(Number(data.carboidratos) || 20, 0),
        gorduras: Math.max(Number(data.gorduras) || 5, 0)
      };

      // Final validation to ensure we have complete data
      if (recipeResponse.ingredientes.length === 0) {
        throw new Error('Recipe generation returned no valid ingredients');
      }

      if (recipeResponse.preparo.length === 0) {
        throw new Error('Recipe generation returned no valid preparation steps');
      }

      console.log('Validated recipe response:', recipeResponse);
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
}
