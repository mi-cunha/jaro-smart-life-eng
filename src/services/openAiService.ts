
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
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
}

export class OpenAIService {
  static async generateRecipe(request: RecipeRequest): Promise<RecipeResponse> {
    try {
      console.log('🔍 OpenAI Service - Iniciando generateRecipe');
      console.log('🤖 OpenAI Service - Starting recipe generation request:', {
        ingredientes: request.ingredientes,
        preferenciasAlimentares: request.preferenciasAlimentares,
        restricoesAlimentares: request.restricoesAlimentares,
        tipoRefeicao: request.tipoRefeicao,
        objetivo: request.objetivo,
        tempoDisponivel: request.tempoDisponivel,
        itensComprados: request.itensComprados?.length || 0
      });

      console.log('📡 OpenAI Service - Chamando supabase.functions.invoke("generate-recipe")');
      
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

      console.log('📨 OpenAI Service - Resposta da Edge Function recebida');
      console.log('🤖 OpenAI Service - Edge function response:', { data, error });

      if (error) {
        console.error('🚨 OpenAI Service - Erro da função Supabase:', error);
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
        console.error('🚨 OpenAI Service - Nenhum dado recebido da Edge Function');
        console.error('🚨 No data received from Edge Function');
        throw new Error('No data received from recipe generation service');
      }

      console.log('✅ OpenAI Service - Received recipe data:', data);

      // Log the raw data to debug macros and preparation steps
      console.log('🔍 OpenAI Service - Raw macros data:', {
        proteinas: data.proteinas,
        carboidratos: data.carboidratos,
        gorduras: data.gorduras,
        type: typeof data.proteinas
      });

      console.log('🔍 OpenAI Service - Raw preparation data:', {
        preparo: data.preparo,
        type: typeof data.preparo,
        isArray: Array.isArray(data.preparo),
        length: data.preparo?.length
      });

      // Validate and normalize the response with proper data structure
      const recipeResponse: RecipeResponse = {
        nome: data.nome && data.nome.trim() ? data.nome.trim() : 'Healthy Recipe',
        tempo: Math.max(Number(data.tempo) || 20, 5),
        calorias: Math.max(Number(data.calorias) || 300, 50),
        ingredientes: Array.isArray(data.ingredientes) && data.ingredientes.length > 0 
          ? data.ingredientes.filter(ing => ing && typeof ing === 'string' && ing.trim()) 
          : ['Selected ingredients'],
        preparo: Array.isArray(data.preparo) && data.preparo.length > 0 
          ? data.preparo.filter(step => step && typeof step === 'string' && step.trim()) 
          : ['Prepare ingredients as directed', 'Cook according to recipe requirements', 'Season to taste and serve'],
        macros: {
          proteinas: Number(data.proteinas) || 15,
          carboidratos: Number(data.carboidratos) || 25,
          gorduras: Number(data.gorduras) || 8
        }
      };

      console.log('✅ OpenAI Service - Final normalized recipe response:', recipeResponse);
      console.log('🔍 OpenAI Service - Final preparation steps:', recipeResponse.preparo);
      console.log('🔍 OpenAI Service - Final macros:', recipeResponse.macros);

      // Final validation to ensure we have complete data
      if (recipeResponse.ingredientes.length === 0) {
        throw new Error('Recipe generation returned no valid ingredients');
      }

      if (recipeResponse.preparo.length === 0) {
        console.warn('🚨 OpenAI Service - No preparation steps found, adding default steps');
        recipeResponse.preparo = ['Prepare ingredients as directed', 'Cook according to recipe requirements', 'Season to taste and serve'];
      }

      // Validate macros are valid numbers
      if (isNaN(recipeResponse.macros.proteinas) || isNaN(recipeResponse.macros.carboidratos) || isNaN(recipeResponse.macros.gorduras)) {
        console.warn('🚨 OpenAI Service - Invalid macros detected, using defaults');
        recipeResponse.macros = {
          proteinas: 15,
          carboidratos: 25,
          gorduras: 8
        };
      }

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
