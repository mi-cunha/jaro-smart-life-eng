
import { useState } from "react";
import { Ingrediente } from "@/types/receitas";

export function useIngredientes() {
  const [ingredientesPorRefeicao, setIngredientesPorRefeicao] = useState<{ [key: string]: Ingrediente[] }>({
    "Breakfast": [
      { nome: "Oats", selecionado: true },
      { nome: "Banana", selecionado: true },
      { nome: "Eggs", selecionado: false },
      { nome: "Spinach", selecionado: false },
      { nome: "Greek Yogurt", selecionado: true },
      { nome: "Chia Seeds", selecionado: false },
      { nome: "Berries", selecionado: true }
    ],
    "Lunch": [
      { nome: "Chicken Breast", selecionado: true },
      { nome: "Quinoa", selecionado: true },
      { nome: "Broccoli", selecionado: true },
      { nome: "Olive Oil", selecionado: false },
      { nome: "Sweet Potato", selecionado: false },
      { nome: "Salmon", selecionado: false },
      { nome: "Cauliflower", selecionado: true }
    ],
    "Snack": [
      { nome: "Greek Yogurt", selecionado: true },
      { nome: "Nuts", selecionado: true },
      { nome: "Fruits", selecionado: true },
      { nome: "Cottage Cheese", selecionado: false },
      { nome: "Avocado", selecionado: false }
    ],
    "Dinner": [
      { nome: "Tofu", selecionado: true },
      { nome: "Zucchini", selecionado: true },
      { nome: "Eggplant", selecionado: false },
      { nome: "Mushrooms", selecionado: true },
      { nome: "White Fish", selecionado: false },
      { nome: "Asparagus", selecionado: false }
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
        return {
          ...prev,
          [refeicao]: ingredientesExistentes.map(item =>
            item.nome.toLowerCase() === nomeIngrediente.toLowerCase()
              ? { ...item, selecionado: true }
              : item
          )
        };
      } else {
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
