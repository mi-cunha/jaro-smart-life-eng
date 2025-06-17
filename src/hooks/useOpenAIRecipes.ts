
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
    console.log('🔍 useOpenAIRecipes - Iniciando geração com IA');
    console.log('🔍 useOpenAIRecipes - Parâmetros recebidos:', {
      refeicao,
      ingredientesSelecionados,
      preferenciasAlimentares,
      restricoesAlimentares,
      objetivo,
      itensComprados
    });

    if (ingredientesSelecionados.length === 0 && (!itensComprados || itensComprados.length === 0)) {
      console.log('❌ useOpenAIRecipes - Nenhum ingrediente selecionado');
      toast.error("Please select at least one ingredient or have purchased items in your list!");
      return;
    }

    setIsGenerating(true);
    console.log('🤖 useOpenAIRecipes - Starting AI recipe generation:', {
      refeicao,
      ingredientesSelecionados,
      preferenciasAlimentares,
      restricoesAlimentares,
      objetivo,
      itensComprados
    });

    // Show loading toast with longer duration for AI generation
    const loadingToast = toast.loading("🤖 Generating personalized recipe with ChatGPT...", { 
      duration: 15000,
      description: "This may take a few moments..."
    });

    try {
      console.log('🚀 useOpenAIRecipes - Chamando OpenAIService.generateRecipe');
      
      const recipeData = await OpenAIService.generateRecipe({
        ingredientes: ingredientesSelecionados,
        preferenciasAlimentares: preferenciasAlimentares || 'none',
        restricoesAlimentares: restricoesAlimentares || [],
        tipoRefeicao: refeicao,
        objetivo: objetivo || 'healthy eating',
        tempoDisponivel: 45,
        itensComprados
      });

      console.log('✅ useOpenAIRecipes - AI recipe generated successfully:', recipeData);

      const novaReceita: Receita = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

      console.log('💾 useOpenAIRecipes - Salvando receita gerada:', novaReceita);
      await onRecipeGenerated(novaReceita);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      const tipoReceita = itensComprados && itensComprados.length > 0 
        ? "based on your purchased items" 
        : "personalized with your ingredients";
        
      toast.success(`🤖 AI recipe ${tipoReceita} generated successfully!`, {
        description: `Created "${recipeData.nome}" with ChatGPT`
      });
    } catch (error) {
      console.error("🚨 useOpenAIRecipes - Error generating AI recipe:", error);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          toast.error("🔑 OpenAI API Key Required", {
            description: "Please configure OPENAI_API_KEY in Supabase Secrets to use AI recipe generation."
          });
        } else if (error.message.includes('Invalid OpenAI API key')) {
          toast.error("🔑 Invalid API Key", {
            description: "Your OpenAI API key appears to be invalid. Please check your configuration."
          });
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          toast.error("🌐 Network Error", {
            description: "Please check your internet connection and try again."
          });
        } else {
          toast.error("🤖 AI Recipe Generation Failed", {
            description: error.message
          });
        }
      } else {
        toast.error("❌ Unknown Error", {
          description: "An unexpected error occurred during AI recipe generation."
        });
      }
    } finally {
      setIsGenerating(false);
      console.log('🏁 useOpenAIRecipes - Finalizando geração');
    }
  };

  return {
    generateRecipeWithAI,
    isGenerating
  };
}
