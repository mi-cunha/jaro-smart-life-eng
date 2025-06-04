
import { useSupabaseListaCompras } from "./useSupabaseListaCompras";
import { toast } from "sonner";

export function useListaCompras() {
  const {
    itensCompra: itensPorRefeicao,
    adicionarItem,
    atualizarItem,
    removerItem: removerItemSupabase
  } = useSupabaseListaCompras();

  const toggleItem = async (refeicao: string, itemId: string) => {
    const item = itensPorRefeicao[refeicao]?.find(item => item.id === itemId);
    if (!item) return;

    const novoStatus = !item.comprado;
    await atualizarItem(refeicao, itemId, { comprado: novoStatus });
    
    if (novoStatus) {
      toast.success(`'${item.nome}' marcado como comprado! ✅`);
    }
  };

  const toggleTodosItens = async (refeicao: string) => {
    const itens = itensPorRefeicao[refeicao] || [];
    const todosComprados = itens.every(item => item.comprado);
    
    for (const item of itens) {
      await atualizarItem(refeicao, item.id, { comprado: !todosComprados });
    }
    
    toast.success(todosComprados ? "Todos os itens desmarcados" : "Todos os itens marcados como comprados!");
  };

  const removerItem = async (refeicao: string, itemId: string) => {
    await removerItemSupabase(refeicao, itemId);
  };

  const removerItensSelecionados = async (refeicao: string) => {
    const itens = itensPorRefeicao[refeicao] || [];
    const itensComprados = itens.filter(item => item.comprado);
    
    if (itensComprados.length === 0) {
      toast.error("Nenhum item selecionado para remover!");
      return;
    }

    for (const item of itensComprados) {
      await removerItemSupabase(refeicao, item.id);
    }
    
    toast.success(`${itensComprados.length} item(ns) removido(s) da lista!`);
  };

  const calcularTotalRefeicao = (refeicao: string) => {
    const itens = itensPorRefeicao[refeicao] || [];
    return itens.reduce((total, item) => total + item.preco, 0);
  };

  const calcularTotalGeral = () => {
    return Object.values(itensPorRefeicao).flat().reduce((total, item) => total + item.preco, 0);
  };

  const exportarLista = () => {
    const dadosExport = Object.entries(itensPorRefeicao).map(([refeicao, itens]) => ({
      refeicao,
      itens: itens.map(item => ({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
        comprado: item.comprado ? "Sim" : "Não"
      })),
      total: calcularTotalRefeicao(refeicao)
    }));

    console.log("Exportando lista:", dadosExport);
    toast.success("Lista exportada com sucesso! 📊");
  };

  const adicionarItensGerados = async (refeicao: string, novosItens: any[]) => {
    for (const item of novosItens) {
      const novoItem = {
        id: '', // Será gerado pelo Supabase
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
        comprado: false,
        categoria: item.categoria || undefined
      };
      await adicionarItem(refeicao, novoItem);
    }
  };

  const adicionarItemSugerido = async (refeicao: string, nomeItem: string) => {
    const novoItem = {
      id: '', // Será gerado pelo Supabase
      nome: nomeItem,
      quantidade: "1 unidade",
      preco: Math.floor(Math.random() * 20) + 5,
      comprado: false
    };
    await adicionarItem(refeicao, novoItem);
  };

  return {
    itensPorRefeicao,
    toggleItem,
    toggleTodosItens,
    calcularTotalRefeicao,
    calcularTotalGeral,
    exportarLista,
    adicionarItensGerados,
    adicionarItemSugerido,
    removerItem,
    removerItensSelecionados
  };
}
