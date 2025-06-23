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
    console.log('🤖 useOpenAIRecipes - Starting recipe generation:', {
      refeicao,
      ingredientesSelecionados,
      preferenciasAlimentares,
      restricoesAlimentares,
      objetivo,
      itensComprados
    });

    // Show loading toast with simpler message
    const loadingToast = toast.loading("🍳 Creating your personalized recipe...", { 
      duration: 10000,
      description: "Generating nutritious and delicious meal..."
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

      console.log('✅ useOpenAIRecipes - Recipe generated successfully:', recipeData);
      
      // Debug the received data structure
      console.log('🔍 useOpenAIRecipes - Dados recebidos da IA:', {
        nome: recipeData.nome,
        macros: recipeData.macros,
        preparoSteps: recipeData.preparo?.length || 0,
        ingredientes: recipeData.ingredientes?.length || 0
      });

      const novaReceita: Receita = {
        id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: recipeData.nome,
        tempo: recipeData.tempo,
        calorias: recipeData.calorias,
        refeicao,
        ingredientes: recipeData.ingredientes,
        preparo: recipeData.preparo,
        macros: recipeData.macros,
        favorita: false
      };

      console.log('💾 useOpenAIRecipes - Receita final preparada para salvar:', {
        nome: novaReceita.nome,
        macros: novaReceita.macros,
        preparoSteps: novaReceita.preparo?.length || 0,
        ingredientes: novaReceita.ingredientes?.length || 0
      });

      await onRecipeGenerated(novaReceita);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      const tipoReceita = itensComprados && itensComprados.length > 0 
        ? "using your purchased items" 
        : "with your selected ingredients";
        
      toast.success(`🍳 New recipe created successfully!`, {
        description: `"${recipeData.nome}" - ${tipoReceita}`
      });
    } catch (error) {
      console.error("🚨 useOpenAIRecipes - Error generating recipe:", error);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          toast.error("🔑 API Key Required", {
            description: "Please configure your API key in settings to generate recipes."
          });
        } else if (error.message.includes('Invalid OpenAI API key')) {
          toast.error("🔑 Invalid API Key", {
            description: "Your API key appears to be invalid. Please check your configuration."
          });
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          toast.error("🌐 Connection Error", {
            description: "Please check your internet connection and try again."
          });
        } else {
          toast.error("🍳 Recipe Generation Failed", {
            description: "Unable to create recipe. Please try again with different ingredients."
          });
        }
      } else {
        toast.error("❌ Unexpected Error", {
          description: "An unexpected error occurred. Please try again."
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
