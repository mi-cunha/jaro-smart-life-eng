
import { useState } from "react";
import { toast } from "sonner";
import { Receita } from "@/types/receitas";
import { receitasBase } from "@/data/receitasBase";
import { selecionarReceitaInteligente } from "@/utils/receitaUtils";
import { criarVariacaoReceita, gerarReceitaAdaptativa } from "@/utils/receitaVariacoes";

export function useReceitasGeradas() {
  const [receitasGeradas, setReceitasGeradas] = useState<{ [key: string]: Receita[] }>({
    "Café da Manhã": [
      {
        id: "1",
        nome: "Bowl de Aveia com Frutas e Oleaginosas",
        tempo: 12,
        calorias: 340,
        refeicao: "Café da Manhã",
        ingredientes: ["Aveia", "Banana", "Frutas Vermelhas", "Oleaginosas", "Mel", "Iogurte Natural"],
        preparo: [
          "Deixe 1/2 xícara de aveia de molho em 200ml de água ou leite vegetal por 10 minutos",
          "Em uma tigela, coloque a aveia hidratada como base",
          "Corte 1 banana em rodelas finas e disponha sobre a aveia",
          "Adicione 2 colheres de sopa de frutas vermelhas (morangos, mirtilos, framboesas)",
          "Polvilhe 1 colher de sopa de oleaginosas picadas (castanhas, nozes, amêndoas)",
          "Adicione 2 colheres de sopa de iogurte natural",
          "Regue com 1 colher de chá de mel orgânico",
          "Misture delicadamente e sirva imediatamente",
          "Opcional: adicione uma pitada de canela em pó para potencializar o sabor"
        ],
        macros: { proteinas: 16, carboidratos: 48, gorduras: 12 },
        favorita: false
      }
    ],
    "Almoço": [
      {
        id: "2",
        nome: "Salmão Grelhado com Quinoa e Vegetais",
        tempo: 25,
        calorias: 420,
        refeicao: "Almoço",
        ingredientes: ["Salmão", "Quinoa", "Brócolis", "Abobrinha", "Azeite", "Limão"],
        preparo: [
          "Deixe 1/2 xícara de quinoa de molho por 15 minutos, depois enxágue bem",
          "Cozinhe a quinoa em 1 xícara de água com sal por 15 minutos",
          "Tempere o filé de salmão (150g) com sal, pimenta, suco de limão e ervas",
          "Corte o brócolis em floretes pequenos e a abobrinha em fatias",
          "Aqueça uma grelha ou frigideira com 1 colher de chá de azeite",
          "Grelhe o salmão por 4 minutos de cada lado até ficar rosado por dentro",
          "Em outra panela, refogue os vegetais no vapor por 5 minutos",
          "Tempere os vegetais com azeite, sal e pimenta",
          "Escorra a quinoa e tempere com azeite e ervas frescas",
          "Monte o prato: quinoa como base, vegetais ao lado e salmão por cima",
          "Finalize com gotas de limão e folhas de salsa fresca",
          "Sirva imediatamente enquanto está quente"
        ],
        macros: { proteinas: 38, carboidratos: 32, gorduras: 16 },
        favorita: false
      }
    ],
    "Lanche": [
      {
        id: "3",
        nome: "Mix de Oleaginosas com Frutas Frescas",
        tempo: 5,
        calorias: 220,
        refeicao: "Lanche",
        ingredientes: ["Oleaginosas", "Maçã", "Iogurte Natural"],
        preparo: [
          "Selecione uma mistura de oleaginosas: 2 castanhas-do-pará, 3 nozes, 5 amêndoas",
          "Lave 1 maçã e corte em fatias, mantendo a casca para fibras",
          "Coloque 150ml de iogurte natural em uma tigela",
          "Pique grosseiramente as oleaginosas para facilitar a digestão",
          "Disponha as fatias de maçã ao redor do iogurte",
          "Polvilhe as oleaginosas picadas sobre o iogurte",
          "Opcional: adicione uma pitada de canela sobre as maçãs",
          "Consuma imediatamente para manter a textura crocante das oleaginosas"
        ],
        macros: { proteinas: 12, carboidratos: 18, gorduras: 14 },
        favorita: false
      }
    ],
    "Jantar": [
      {
        id: "4",
        nome: "Tofu Refogado com Vegetais Asiáticos",
        tempo: 20,
        calorias: 260,
        refeicao: "Jantar",
        ingredientes: ["Tofu", "Abobrinha", "Cogumelos", "Brócolis", "Azeite"],
        preparo: [
          "Corte 150g de tofu firme em cubos de 2cm e seque bem com papel toalha",
          "Tempere o tofu com sal, pimenta e um toque de molho de soja (opcional)",
          "Corte a abobrinha em meia-lua, os cogumelos em fatias e o brócolis em floretes",
          "Aqueça 1 colher de sopa de azeite em uma wok ou frigideira grande",
          "Doure o tofu por 3-4 minutos de cada lado até formar crosta dourada",
          "Retire o tofu e reserve em um prato",
          "Na mesma frigideira, adicione os cogumelos e refogue por 2 minutos",
          "Adicione o brócolis e refogue por 3 minutos",
          "Acrescente a abobrinha e cozinhe por mais 2 minutos",
          "Retorne o tofu à frigideira e misture delicadamente",
          "Tempere com sal, pimenta e ervas frescas a gosto",
          "Sirva imediatamente enquanto os vegetais estão al dente"
        ],
        macros: { proteinas: 18, carboidratos: 14, gorduras: 16 },
        favorita: false
      }
    ]
  });

  const [receitasJaGeradas, setReceitasJaGeradas] = useState<Set<string>>(new Set());

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

  const removerReceita = (refeicao: string, receitaId: string) => {
    setReceitasGeradas(prev => ({
      ...prev,
      [refeicao]: prev[refeicao].filter(receita => receita.id !== receitaId)
    }));
    toast.success("Receita removida!");
  };

  const gerarNovasReceitas = (refeicao: string, ingredientesSelecionados: string[], itensComprados?: string[]) => {
    if (ingredientesSelecionados.length === 0 && (!itensComprados || itensComprados.length === 0)) {
      toast.error("Selecione pelo menos um ingrediente ou tenha itens comprados na lista!");
      return;
    }

    toast.loading("Analisando ingredientes e gerando receita personalizada...", { duration: 2500 });
    
    setTimeout(() => {
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
        
        // Garante ID único
        if (!novaReceita.id) {
          novaReceita.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        setReceitasGeradas(prev => ({
          ...prev,
          [refeicao]: [...prev[refeicao], novaReceita]
        }));

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
    receitasGeradas,
    toggleFavorito,
    gerarNovasReceitas,
    removerReceita
  };
}
