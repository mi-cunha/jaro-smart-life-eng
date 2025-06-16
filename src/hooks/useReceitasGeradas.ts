import { useState } from "react";
import { toast } from "sonner";
import { Receita } from "@/types/receitas";
import { receitasBase } from "@/data/receitasBase";
import { selecionarReceitaInteligente } from "@/utils/receitaUtils";
import { criarVariacaoReceita, gerarReceitaAdaptativa } from "@/utils/receitaVariacoes";
import { useSupabaseReceitas } from "./useSupabaseReceitas";
import { useOpenAIRecipes } from "./useOpenAIRecipes";

export function useReceitasGeradas() {
  const { 
    receitas: receitasSupabase, 
    salvarReceita, 
    toggleFavorito: toggleFavoritoSupabase, 
    removerReceita: removerReceitaSupabase,
    loading: loadingSupabase
  } = useSupabaseReceitas();

  const [receitasJaGeradas, setReceitasJaGeradas] = useState<Set<string>>(new Set());
  const [useAI, setUseAI] = useState(false);

  const { generateRecipeWithAI, isGenerating } = useOpenAIRecipes({
    onRecipeGenerated: salvarReceita
  });

  const toggleFavorito = async (refeicao: string, receitaId: string) => {
    await toggleFavoritoSupabase(refeicao, receitaId);
  };

  const removerReceita = async (refeicao: string, receitaId: string) => {
    await removerReceitaSupabase(refeicao, receitaId);
  };

  const gerarNovasReceitas = async (
    refeicao: string, 
    ingredientesSelecionados: string[], 
    itensComprados?: string[],
    preferenciasAlimentares: string = "nenhuma",
    restricoesAlimentares: string[] = [],
    objetivo: string = "alimentação saudável"
  ) => {
    if (ingredientesSelecionados.length === 0 && (!itensComprados || itensComprados.length === 0)) {
      toast.error("Please select at least one ingredient or have purchased items in your list!");
      return;
    }

    console.log('🍳 Gerando receitas com parâmetros:', {
      refeicao,
      ingredientesSelecionados,
      itensComprados,
      useAI,
      preferenciasAlimentares,
      restricoesAlimentares,
      objetivo
    });

    try {
      // If AI mode is enabled, use OpenAI
      if (useAI) {
        console.log('🤖 Usando modo IA - chamando generateRecipeWithAI');
        await generateRecipeWithAI(
          refeicao,
          ingredientesSelecionados,
          preferenciasAlimentares,
          restricoesAlimentares,
          objetivo,
          itensComprados
        );
        return;
      }

      // Otherwise, use the original logic
      console.log('🔧 Usando geração tradicional de receitas');
      toast.loading("Analyzing ingredients and generating personalized recipe...", { duration: 2500 });
      
      setTimeout(async () => {
        try {
          // Prioritize purchased items, but combine with selected ingredients
          const todosIngredientes = [
            ...(itensComprados || []),
            ...ingredientesSelecionados
          ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates
          
          let novaReceita;
          
          // Try to select recipe from base first
          const receitaSelecionada = selecionarReceitaInteligente(refeicao, todosIngredientes, receitasBase, receitasJaGeradas);
          
          if (receitaSelecionada && receitaSelecionada.compatibilidade?.score > 0.3) {
            // Use base recipe with possible variation
            novaReceita = criarVariacaoReceita(receitaSelecionada, todosIngredientes);
            setReceitasJaGeradas(prev => new Set(prev).add(`${refeicao}-${receitaSelecionada.nome}`));
          } else {
            // Create completely adaptive recipe
            novaReceita = gerarReceitaAdaptativa(refeicao, todosIngredientes);
          }
          
          // Ensure unique ID and add meal type
          if (!novaReceita.id) {
            novaReceita.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          novaReceita.refeicao = refeicao;

          // Save to Supabase
          await salvarReceita(novaReceita);

          const tipoReceita = itensComprados && itensComprados.length > 0 
            ? "based on your purchased items" 
            : "personalized with your ingredients";
            
          toast.success(`New recipe ${tipoReceita} generated successfully! 🍽️`);
        } catch (error) {
          console.error("Error generating recipe:", error);
          toast.error("Error generating recipe. Please try again.");
        }
      }, 2500);
    } catch (error) {
      console.error("Error in recipe generation:", error);
      toast.error("Error generating recipe. Please try again.");
    }
  };

  return {
    receitasGeradas: receitasSupabase,
    toggleFavorito,
    gerarNovasReceitas,
    removerReceita,
    loading: loadingSupabase || isGenerating,
    useAI,
    setUseAI
  };
}
