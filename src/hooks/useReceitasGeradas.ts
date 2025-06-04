
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
    loading 
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
      toast.error("Selecione pelo menos um ingrediente ou tenha itens comprados na lista!");
      return;
    }

    // Se o usuário ativou IA e tem chave configurada, usa ChatGPT
    if (useAI) {
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

    // Caso contrário, usa a lógica original
    toast.loading("Analisando ingredientes e gerando receita personalizada...", { duration: 2500 });
    
    setTimeout(async () => {
      try {
        // Prioriza itens comprados, mas combina com ingredientes selecionados
        const todosIngredientes = [
          ...(itensComprados || []),
          ...ingredientesSelecionados
        ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicatas
        
        let novaReceita;
        
        // Tenta selecionar receita da base primeiro
        const receitaSelecionada = selecionarReceitaInteligente(refeicao, todosIngredientes, receitasBase, receitasJaGeradas);
        
        if (receitaSelecionada && receitaSelecionada.compatibilidade?.score > 0.3) {
          // Usa receita da base com possível variação
          novaReceita = criarVariacaoReceita(receitaSelecionada, todosIngredientes);
          setReceitasJaGeradas(prev => new Set(prev).add(`${refeicao}-${receitaSelecionada.nome}`));
        } else {
          // Cria receita completamente adaptativa
          novaReceita = gerarReceitaAdaptativa(refeicao, todosIngredientes);
        }
        
        // Garante ID único e adiciona refeicao
        if (!novaReceita.id) {
          novaReceita.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        novaReceita.refeicao = refeicao;

        // Salva no Supabase - agora com as políticas RLS funcionando
        await salvarReceita(novaReceita);

        const tipoReceita = itensComprados && itensComprados.length > 0 
          ? "baseada nos seus itens comprados" 
          : "personalizada com seus ingredientes";
          
        toast.success(`Nova receita ${tipoReceita} gerada com sucesso! 🍽️`);
      } catch (error) {
        console.error("Erro ao gerar receita:", error);
        toast.error("Erro ao gerar receita. Tente novamente.");
      }
    }, 2500);
  };

  return {
    receitasGeradas: receitasSupabase,
    toggleFavorito,
    gerarNovasReceitas,
    removerReceita,
    loading: loading || isGenerating,
    useAI,
    setUseAI
  };
}
