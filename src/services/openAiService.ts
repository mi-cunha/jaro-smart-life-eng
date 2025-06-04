
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
      // Buscar a chave da API do Supabase Secrets
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: request
      });

      if (error) {
        throw new Error(`Erro na API: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao gerar receita com OpenAI:', error);
      throw error;
    }
  }
}
