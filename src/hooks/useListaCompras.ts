
import { useSupabaseListaCompras } from "./useSupabaseListaCompras";
import { toast } from "sonner";

export function useListaCompras() {
  const {
    itensCompra,
    adicionarItem,
    adicionarItensLote,
    atualizarItem,
    removerItem: removerItemSupabase,
    limparLista: limparListaSupabase
  } = useSupabaseListaCompras();

  const toggleItem = async (itemId: string) => {
    const item = itensCompra.find(item => item.id === itemId);
    if (!item) return;

    const novoStatus = !item.comprado;
    await atualizarItem(itemId, { comprado: novoStatus });
    
    if (novoStatus) {
      toast.success(`'${item.nome}' marked as purchased! ✅`);
    }
  };

  const updatePreco = async (itemId: string, novoPreco: number) => {
    await atualizarItem(itemId, { preco: novoPreco });
    toast.success("Price updated!");
  };

  const toggleTodosItens = async () => {
    const todosComprados = itensCompra.every(item => item.comprado);
    
    for (const item of itensCompra) {
      await atualizarItem(item.id, { comprado: !todosComprados });
    }
    
    toast.success(todosComprados ? "All items unchecked" : "All items marked as purchased!");
  };

  const removerItem = async (itemId: string) => {
    await removerItemSupabase(itemId);
  };

  const removerItensSelecionados = async () => {
    const itensComprados = itensCompra.filter(item => item.comprado);
    
    if (itensComprados.length === 0) {
      toast.error("No items selected to remove!");
      return;
    }

    for (const item of itensComprados) {
      await removerItemSupabase(item.id);
    }
    
    toast.success(`${itensComprados.length} item(s) removed from list!`);
  };

  const limparLista = async () => {
    await limparListaSupabase();
  };

  const calcularTotal = () => {
    return itensCompra.reduce((total, item) => total + item.preco, 0);
  };

  const exportarLista = () => {
    const dadosExport = {
      itens: itensCompra.map(item => ({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
        comprado: item.comprado ? "Yes" : "No",
        categoria: item.categoria
      })),
      total: calcularTotal()
    };

    console.log("Exporting list:", dadosExport);
    toast.success("List exported successfully! 📊");
  };

  const adicionarItensGerados = async (novosItens: any[]) => {
    const itensFormatados = novosItens.map(item => ({
      id: '', // Will be generated by Supabase
      nome: item.nome,
      quantidade: item.quantidade,
      preco: 0, // Always start with 0.00
      comprado: false,
      categoria: item.categoria
    }));
    
    await adicionarItensLote(itensFormatados);
  };

  const adicionarItemSugerido = async (nomeItem: string) => {
    const novoItem = {
      id: '', // Will be generated by Supabase
      nome: nomeItem,
      quantidade: "1 unit",
      preco: 0, // Start with 0.00
      comprado: false
    };
    await adicionarItem(novoItem);
  };

  return {
    itensCompra,
    toggleItem,
    toggleTodosItens,
    updatePreco,
    calcularTotal,
    exportarLista,
    adicionarItensGerados,
    adicionarItemSugerido,
    removerItem,
    removerItensSelecionados,
    limparLista
  };
}
