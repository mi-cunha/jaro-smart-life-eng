
import { useState } from 'react';
import { toast } from 'sonner';
import { OpenAIService } from '@/services/openAiService';
import { Receita } from '@/types/receitas';

interface UseOpenAIRecipesProps {
  onRecipeGenerated: (receita: Receita) => Promise<void>;
}

export function useOpenAIRecipes({ onRecipeGenerated }: UseOpenAIRecipesProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecipeWithAI = async (
    refeicao: string,
    ingredientesSelecionados: string[],
    preferenciasAlimentares: string,
    restricoesAlimentares: string[],
    objetivo: string,
    itensComprados?: string[]
  ) => {
    if (ingredientesSelecionados.length === 0 && (!itensComprados || itensComprados.length === 0)) {
      toast.error("Please select at least one ingredient or have purchased items in your list!");
      return;
    }

    setIsGenerating(true);
    toast.loading("Generating personalized recipe with AI...", { duration: 10000 });

    try {
      console.log('Starting AI recipe generation with params:', {
        refeicao,
        ingredientesSelecionados,
        preferenciasAlimentares,
        restricoesAlimentares,
        objetivo,
        itensComprados
      });

      const recipeData = await OpenAIService.generateRecipe({
        ingredientes: ingredientesSelecionados,
        preferenciasAlimentares: preferenciasAlimentares || 'none',
        restricoesAlimentares: restricoesAlimentares || [],
        tipoRefeicao: refeicao,
        objetivo: objetivo || 'healthy eating',
        tempoDisponivel: 45,
        itensComprados
      });

      console.log('AI recipe generated successfully:', recipeData);

      const novaReceita: Receita = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: recipeData.nome,
        tempo: recipeData.tempo,
        calorias: recipeData.calorias,
        refeicao,
        ingredientes: recipeData.ingredientes,
        preparo: recipeData.preparo,
        macros: {
          proteinas: recipeData.proteinas,
          carboidratos: recipeData.carboidratos,
          gorduras: recipeData.gorduras
        },
        favorita: false
      };

      await onRecipeGenerated(novaReceita);

      const tipoReceita = itensComprados && itensComprados.length > 0 
        ? "based on your purchased items" 
        : "personalized with your ingredients";
        
      toast.success(`AI recipe ${tipoReceita} generated successfully! 🤖🍽️`);
    } catch (error) {
      console.error("Error generating AI recipe:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          toast.error("OpenAI API key not configured. Please check your settings.");
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          toast.error("Network error. Please check your connection and try again.");
        } else {
          toast.error(`Recipe generation failed: ${error.message}`);
        }
      } else {
        toast.error("Unknown error during recipe generation. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRecipeWithAI,
    isGenerating
  };
}
