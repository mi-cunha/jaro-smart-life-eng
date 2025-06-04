
import { useState } from "react";
import { toast } from "sonner";

interface ItemCompra {
  id: string;
  nome: string;
  quantidade: string;
  preco: number;
  comprado: boolean;
}

export function useListaCompras() {
  const [itensPorRefeicao, setItensPorRefeicao] = useState<{ [key: string]: ItemCompra[] }>({
    "Café da Manhã": [
      { id: "1", nome: "Aveia em Flocos", quantidade: "500g", preco: 4.50, comprado: false },
      { id: "2", nome: "Banana Prata", quantidade: "1kg", preco: 3.20, comprado: true },
      { id: "3", nome: "Ovos Orgânicos", quantidade: "12 unidades", preco: 8.90, comprado: false },
      { id: "4", nome: "Iogurte Natural", quantidade: "500ml", preco: 6.80, comprado: false },
      { id: "5", nome: "Chia", quantidade: "200g", preco: 12.50, comprado: true },
      { id: "6", nome: "Frutas Vermelhas", quantidade: "300g", preco: 15.90, comprado: false },
      { id: "7", nome: "Mel Orgânico", quantidade: "250ml", preco: 18.00, comprado: false }
    ],
    "Almoço": [
      { id: "8", nome: "Peito de Frango", quantidade: "1kg", preco: 14.90, comprado: false },
      { id: "9", nome: "Quinoa", quantidade: "500g", preco: 12.80, comprado: true },
      { id: "10", nome: "Brócolis", quantidade: "500g", preco: 4.20, comprado: false },
      { id: "11", nome: "Azeite Extra Virgem", quantidade: "500ml", preco: 16.50, comprado: false },
      { id: "12", nome: "Batata Doce", quantidade: "1kg", preco: 5.80, comprado: true },
      { id: "13", nome: "Salmão", quantidade: "500g", preco: 28.90, comprado: false },
      { id: "14", nome: "Couve-flor", quantidade: "1 unidade", preco: 3.50, comprado: false }
    ],
    "Lanche": [
      { id: "15", nome: "Castanha do Pará", quantidade: "200g", preco: 18.90, comprado: false },
      { id: "16", nome: "Amêndoas", quantidade: "200g", preco: 22.50, comprado: true },
      { id: "17", nome: "Maçã Gala", quantidade: "1kg", preco: 6.90, comprado: false },
      { id: "18", nome: "Queijo Cottage", quantidade: "200g", preco: 8.40, comprado: false },
      { id: "19", nome: "Abacate", quantidade: "2 unidades", preco: 7.80, comprado: false }
    ],
    "Jantar": [
      { id: "20", nome: "Tofu", quantidade: "300g", preco: 9.80, comprado: false },
      { id: "21", nome: "Abobrinha", quantidade: "500g", preco: 3.90, comprado: true },
      { id: "22", nome: "Berinjela", quantidade: "500g", preco: 4.60, comprado: false },
      { id: "23", nome: "Cogumelos", quantidade: "300g", preco: 8.50, comprado: false },
      { id: "24", nome: "Peixe Branco", quantidade: "500g", preco: 19.90, comprado: false },
      { id: "25", nome: "Aspargos", quantidade: "300g", preco: 12.80, comprado: true }
    ]
  });

  const toggleItem = (refeicao: string, itemId: string) => {
    setItensPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(item => {
        if (item.id === itemId) {
          const novoStatus = !item.comprado;
          if (novoStatus) {
            toast.success(`'${item.nome}' marcado como comprado! ✅`);
          }
          return { ...item, comprado: novoStatus };
        }
        return item;
      })
    }));
  };

  const toggleTodosItens = (refeicao: string) => {
    const todosComprados = itensPorRefeicao[refeicao].every(item => item.comprado);
    setItensPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(item => ({ ...item, comprado: !todosComprados }))
    }));
    
    toast.success(todosComprados ? "Todos os itens desmarcados" : "Todos os itens marcados como comprados!");
  };

  const calcularTotalRefeicao = (refeicao: string) => {
    return itensPorRefeicao[refeicao].reduce((total, item) => total + item.preco, 0);
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

  const adicionarItensGerados = (refeicao: string, novosItens: any[]) => {
    const itensConvertidos = novosItens.map(item => ({
      id: Date.now().toString() + Math.random().toString(36),
      nome: item.nome,
      quantidade: item.quantidade,
      preco: item.preco,
      comprado: false
    }));

    setItensPorRefeicao(prev => ({
      ...prev,
      [refeicao]: [...prev[refeicao], ...itensConvertidos]
    }));
  };

  const adicionarItemSugerido = (refeicao: string, nomeItem: string) => {
    const novoItem = {
      id: Date.now().toString() + Math.random().toString(36),
      nome: nomeItem,
      quantidade: "1 unidade",
      preco: Math.floor(Math.random() * 20) + 5,
      comprado: false
    };

    setItensPorRefeicao(prev => ({
      ...prev,
      [refeicao]: [...prev[refeicao], novoItem]
    }));
  };

  return {
    itensPorRefeicao,
    toggleItem,
    toggleTodosItens,
    calcularTotalRefeicao,
    calcularTotalGeral,
    exportarLista,
    adicionarItensGerados,
    adicionarItemSugerido
  };
}
