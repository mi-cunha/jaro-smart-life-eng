
import { useSupabaseListaCompras } from "./useSupabaseListaCompras";

export function useIntegracaoListaReceitas() {
  const { itensCompra } = useSupabaseListaCompras();

  const getItensCompradosPorRefeicao = (refeicao: string) => {
    return (itensCompra[refeicao] || []).filter(item => item.comprado).map(item => item.nome);
  };

  const hasItensComprados = (refeicao: string) => {
    return (itensCompra[refeicao] || []).some(item => item.comprado);
  };

  return {
    getItensCompradosPorRefeicao,
    hasItensComprados
  };
}
