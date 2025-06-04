
import { useState } from "react";
import { Ingrediente } from "@/types/receitas";

export function useIngredientes() {
  const [ingredientesPorRefeicao, setIngredientesPorRefeicao] = useState<{ [key: string]: Ingrediente[] }>({
    "Café da Manhã": [
      { nome: "Aveia", selecionado: true },
      { nome: "Banana", selecionado: true },
      { nome: "Ovos", selecionado: false },
      { nome: "Espinafre", selecionado: false },
      { nome: "Iogurte Natural", selecionado: true },
      { nome: "Chia", selecionado: false },
      { nome: "Frutas Vermelhas", selecionado: true }
    ],
    "Almoço": [
      { nome: "Peito de Frango", selecionado: true },
      { nome: "Quinoa", selecionado: true },
      { nome: "Brócolis", selecionado: true },
      { nome: "Azeite", selecionado: false },
      { nome: "Batata Doce", selecionado: false },
      { nome: "Salmão", selecionado: false },
      { nome: "Couve-flor", selecionado: true }
    ],
    "Lanche": [
      { nome: "Iogurte Natural", selecionado: true },
      { nome: "Oleaginosas", selecionado: true },
      { nome: "Frutas", selecionado: true },
      { nome: "Cottage", selecionado: false },
      { nome: "Abacate", selecionado: false }
    ],
    "Jantar": [
      { nome: "Tofu", selecionado: true },
      { nome: "Abobrinha", selecionado: true },
      { nome: "Berinjela", selecionado: false },
      { nome: "Cogumelos", selecionado: true },
      { nome: "Peixe Branco", selecionado: false },
      { nome: "Aspargos", selecionado: false }
    ]
  });

  const toggleIngrediente = (refeicao: string, indice: number) => {
    setIngredientesPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map((item, i) => 
        i === indice ? { ...item, selecionado: !item.selecionado } : item
      )
    }));
  };

  const toggleTodosIngredientes = (refeicao: string) => {
    const todosAtivos = ingredientesPorRefeicao[refeicao].every(item => item.selecionado);
    setIngredientesPorRefeicao(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(item => ({ ...item, selecionado: !todosAtivos }))
    }));
  };

  const adicionarIngrediente = (refeicao: string, nomeIngrediente: string) => {
    setIngredientesPorRefeicao(prev => {
      const ingredientesExistentes = prev[refeicao] || [];
      const jaExiste = ingredientesExistentes.some(item => 
        item.nome.toLowerCase() === nomeIngrediente.toLowerCase()
      );
      
      if (jaExiste) {
        // Se já existe, apenas marca como selecionado
        return {
          ...prev,
          [refeicao]: ingredientesExistentes.map(item =>
            item.nome.toLowerCase() === nomeIngrediente.toLowerCase()
              ? { ...item, selecionado: true }
              : item
          )
        };
      } else {
        // Se não existe, adiciona como novo ingrediente selecionado
        return {
          ...prev,
          [refeicao]: [
            ...ingredientesExistentes,
            { nome: nomeIngrediente, selecionado: true }
          ]
        };
      }
    });
  };

  const getIngredientesSelecionados = (refeicao: string) => {
    return ingredientesPorRefeicao[refeicao]
      .filter(item => item.selecionado)
      .map(item => item.nome);
  };

  return {
    ingredientesPorRefeicao,
    toggleIngrediente,
    toggleTodosIngredientes,
    adicionarIngrediente,
    getIngredientesSelecionados
  };
}
