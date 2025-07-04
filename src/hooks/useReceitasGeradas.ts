
import { useState } from "react";
import { toast } from "sonner";
import { Receita } from "@/types/receitas";
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
    objetivo: string = "alimentação saudável",
    caloriesMax?: number
  ) => {
    console.log('🔍 useReceitasGeradas - Iniciando geração de receitas com IA');
    console.log('🔍 useReceitasGeradas - Parâmetros:', {
      refeicao,
      ingredientesSelecionados,
      itensComprados,
      preferenciasAlimentares,
      restricoesAlimentares,
      objetivo
    });

    if (ingredientesSelecionados.length === 0 && (!itensComprados || itensComprados.length === 0)) {
      console.log('❌ useReceitasGeradas - Nenhum ingrediente selecionado');
      toast.error("Please select at least one ingredient or have purchased items in your list!");
      return;
    }

    console.log('🍳 Gerando receitas com IA:', {
      refeicao,
      ingredientesSelecionados,
      itensComprados,
      preferenciasAlimentares,
      restricoesAlimentares,
      objetivo
    });

    try {
      // Always use AI for recipe generation
      console.log('🤖 useReceitasGeradas - Gerando receita com IA');
      await generateRecipeWithAI(
        refeicao,
        ingredientesSelecionados,
        preferenciasAlimentares,
        restricoesAlimentares,
        objetivo,
        itensComprados,
        caloriesMax
      );
    } catch (error) {
      console.error("🚨 useReceitasGeradas - Error in AI recipe generation:", error);
      toast.error("Error generating recipe with AI. Please try again.");
    }
  };

  return {
    receitasGeradas: receitasSupabase,
    toggleFavorito,
    gerarNovasReceitas,
    removerReceita,
    loading: loadingSupabase || isGenerating
  };
}
