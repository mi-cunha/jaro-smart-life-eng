
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
      console.log('🤖 OpenAI Service - Starting recipe generation request:', {
        ingredientes: request.ingredientes,
        preferenciasAlimentares: request.preferenciasAlimentares,
        restricoesAlimentares: request.restricoesAlimentares,
        tipoRefeicao: request.tipoRefeicao,
        objetivo: request.objetivo,
        tempoDisponivel: request.tempoDisponivel,
        itensComprados: request.itensComprados?.length || 0
      });

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

      console.log('🤖 OpenAI Service - Edge function response:', { data, error });

      if (error) {
        console.error('🚨 Supabase function error:', error);
        
        // Provide specific error messages based on error content
        if (error.message?.includes('API key')) {
          throw new Error('OpenAI API key not configured in Supabase Secrets. Please configure OPENAI_API_KEY.');
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          throw new Error('Network error connecting to OpenAI. Please check your internet connection.');
        } else {
          throw new Error(`Recipe generation failed: ${error.message || 'Unknown error from Edge Function'}`);
        }
      }

      if (!data) {
        console.error('🚨 No data received from Edge Function');
        throw new Error('No data received from recipe generation service');
      }

      console.log('✅ OpenAI Service - Received recipe data:', data);

      // Validate and normalize the response with more strict checks
      const recipeResponse: RecipeResponse = {
        nome: data.nome && data.nome.trim() ? data.nome.trim() : 'Healthy AI Recipe',
        tempo: Math.max(Number(data.tempo) || 20, 5),
        calorias: Math.max(Number(data.calorias) || 300, 50),
        ingredientes: Array.isArray(data.ingredientes) && data.ingredientes.length > 0 
          ? data.ingredientes.filter(ing => ing && ing.trim()) 
          : ['Selected ingredients'],
        preparo: Array.isArray(data.preparo) && data.preparo.length > 0 
          ? data.preparo.filter(step => step && step.trim()) 
          : ['Follow basic preparation steps'],
        proteinas: Math.max(Number(data.proteinas) || 15, 0),
        carboidratos: Math.max(Number(data.carboidratos) || 25, 0),
        gorduras: Math.max(Number(data.gorduras) || 8, 0)
      };

      // Final validation to ensure we have complete data
      if (recipeResponse.ingredientes.length === 0) {
        throw new Error('Recipe generation returned no valid ingredients');
      }

      if (recipeResponse.preparo.length === 0) {
        throw new Error('Recipe generation returned no valid preparation steps');
      }

      console.log('✅ OpenAI Service - Validated recipe response:', recipeResponse);
      return recipeResponse;
    } catch (error) {
      console.error('🚨 OpenAI Service - Error generating recipe:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('OpenAI API key not configured. Please check your API key in Supabase Secrets (OPENAI_API_KEY).');
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
