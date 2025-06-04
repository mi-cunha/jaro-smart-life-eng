
import { useState } from "react";
import { toast } from "sonner";
import { Receita, Ingrediente } from "@/types/receitas";

export function useReceitasGeradas() {
  const [receitasGeradas, setReceitasGeradas] = useState<{ [key: string]: Receita[] }>({
    "Café da Manhã": [
      {
        id: "1",
        nome: "Bowl de Aveia com Frutas Vermelhas",
        tempo: 10,
        calorias: 320,
        refeicao: "Café da Manhã",
        ingredientes: ["Aveia", "Banana", "Frutas Vermelhas", "Iogurte Natural"],
        preparo: [
          "Misture a aveia com iogurte natural",
          "Adicione a banana cortada em fatias",
          "Finalize com as frutas vermelhas",
          "Sirva imediatamente"
        ],
        macros: { proteinas: 15, carboidratos: 45, gorduras: 8 },
        favorita: false
      }
    ],
    "Almoço": [
      {
        id: "2",
        nome: "Frango Grelhado com Quinoa e Brócolis",
        tempo: 25,
        calorias: 380,
        refeicao: "Almoço",
        ingredientes: ["Peito de Frango", "Quinoa", "Brócolis"],
        preparo: [
          "Tempere e grelhe o peito de frango",
          "Cozinhe a quinoa em água",
          "Refogue o brócolis no vapor",
          "Monte o prato e sirva"
        ],
        macros: { proteinas: 35, carboidratos: 30, gorduras: 10 },
        favorita: false
      }
    ],
    "Lanche": [
      {
        id: "3",
        nome: "Mix de Oleaginosas com Iogurte",
        tempo: 5,
        calorias: 200,
        refeicao: "Lanche",
        ingredientes: ["Iogurte Natural", "Oleaginosas", "Frutas"],
        preparo: [
          "Coloque o iogurte em uma tigela",
          "Adicione as oleaginosas",
          "Corte frutas e misture",
          "Consuma imediatamente"
        ],
        macros: { proteinas: 12, carboidratos: 18, gorduras: 12 },
        favorita: false
      }
    ],
    "Jantar": [
      {
        id: "4",
        nome: "Tofu Grelhado com Abobrinha",
        tempo: 20,
        calorias: 250,
        refeicao: "Jantar",
        ingredientes: ["Tofu", "Abobrinha", "Cogumelos"],
        preparo: [
          "Corte o tofu em fatias e tempere",
          "Grelhe o tofu até dourar",
          "Refogue a abobrinha com cogumelos",
          "Sirva quente"
        ],
        macros: { proteinas: 18, carboidratos: 12, gorduras: 14 },
        favorita: false
      }
    ]
  });

  const toggleFavorito = (refeicao: string, receitaId: string) => {
    setReceitasGeradas(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].map(receita => 
        receita.id === receitaId 
          ? { ...receita, favorita: !receita.favorita }
          : receita
      )
    }));
    
    const receita = receitasGeradas[refeicao].find(r => r.id === receitaId);
    if (receita) {
      toast.success(
        receita.favorita 
          ? "Removido dos favoritos" 
          : `'${receita.nome}' adicionado aos favoritos!`
      );
    }
  };

  const gerarNovasReceitas = (refeicao: string, ingredientesSelecionados: string[]) => {
    if (ingredientesSelecionados.length === 0) {
      toast.error("Selecione pelo menos um ingrediente!");
      return;
    }

    toast.loading("Gerando receitas...", { duration: 2000 });
    
    setTimeout(() => {
      const novasReceitas: Receita[] = [
        {
          id: Date.now().toString(),
          nome: `Receita Saudável com ${ingredientesSelecionados[0]}`,
          tempo: Math.floor(Math.random() * 30) + 10,
          calorias: Math.floor(Math.random() * 200) + 200,
          refeicao,
          ingredientes: ingredientesSelecionados.slice(0, 4),
          preparo: [
            "Prepare os ingredientes",
            "Combine conforme a receita",
            "Cozinhe por alguns minutos",
            "Sirva quente"
          ],
          macros: {
            proteinas: Math.floor(Math.random() * 20) + 10,
            carboidratos: Math.floor(Math.random() * 30) + 15,
            gorduras: Math.floor(Math.random() * 15) + 5
          },
          favorita: false
        }
      ];

      setReceitasGeradas(prev => ({
        ...prev,
        [refeicao]: [...prev[refeicao], ...novasReceitas]
      }));

      toast.success("Novas receitas geradas!");
    }, 2000);
  };

  return {
    receitasGeradas,
    toggleFavorito,
    gerarNovasReceitas
  };
}
