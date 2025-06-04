
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
      toast.error("Selecione pelo menos um ingrediente ou tenha itens comprados na lista!");
      return;
    }

    setIsGenerating(true);
    toast.loading("Gerando receita personalizada com ChatGPT...", { duration: 5000 });

    try {
      const recipeData = await OpenAIService.generateRecipe({
        ingredientes: ingredientesSelecionados,
        preferenciasAlimentares,
        restricoesAlimentares,
        tipoRefeicao: refeicao,
        objetivo,
        tempoDisponivel: 45,
        itensComprados
      });

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
        ? "baseada nos seus itens comprados" 
        : "personalizada com seus ingredientes";
        
      toast.success(`Receita ${tipoReceita} gerada com ChatGPT! 🤖🍽️`);
    } catch (error) {
      console.error("Erro ao gerar receita com IA:", error);
      
      if (error instanceof Error && error.message.includes('API')) {
        toast.error("Configure sua chave da API OpenAI para usar o ChatGPT");
      } else {
        toast.error("Erro ao gerar receita com IA. Tente novamente.");
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
