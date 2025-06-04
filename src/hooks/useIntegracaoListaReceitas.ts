
import { useListaCompras } from "./useListaCompras";

export function useIntegracaoListaReceitas() {
  const { itensPorRefeicao } = useListaCompras();

  const getItensCompradosPorRefeicao = (refeicao: string): string[] => {
    const itens = itensPorRefeicao[refeicao] || [];
    return itens
      .filter(item => item.comprado)
      .map(item => item.nome);
  };

  const getAllItensComprados = (): string[] => {
    const todasRefeicoes = Object.keys(itensPorRefeicao);
    const todosItens: string[] = [];
    
    todasRefeicoes.forEach(refeicao => {
      const itensComprados = getItensCompradosPorRefeicao(refeicao);
      todosItens.push(...itensComprados);
    });
    
    return [...new Set(todosItens)]; // Remove duplicatas
  };

  const hasItensComprados = (refeicao: string): boolean => {
    return getItensCompradosPorRefeicao(refeicao).length > 0;
  };

  return {
    getItensCompradosPorRefeicao,
    getAllItensComprados,
    hasItensComprados
  };
}
