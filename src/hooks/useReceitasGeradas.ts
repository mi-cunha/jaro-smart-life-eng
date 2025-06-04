
import { useState } from "react";
import { toast } from "sonner";
import { Receita } from "@/types/receitas";

// Base de receitas reais recomendadas por nutricionistas
const receitasBase = {
  "Café da Manhã": [
    {
      nome: "Bowl de Aveia com Frutas e Oleaginosas",
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
      calorias: 340,
      tempo: 12,
      macros: { proteinas: 16, carboidratos: 48, gorduras: 12 }
    },
    {
      nome: "Omelete Nutritiva com Vegetais",
      ingredientes: ["Ovos", "Espinafre", "Cogumelos", "Queijo", "Azeite"],
      preparo: [
        "Quebre 2 ovos orgânicos em uma tigela e bata bem com um garfo",
        "Tempere os ovos com sal marinho e pimenta-do-reino a gosto",
        "Lave e pique finamente 1 punhado de folhas de espinafre fresco",
        "Corte 3-4 cogumelos em fatias finas",
        "Aqueça 1 colher de chá de azeite extra virgem em uma frigideira antiaderente",
        "Refogue os cogumelos por 2 minutos até ficarem dourados",
        "Adicione o espinafre e refogue por 1 minuto até murchar",
        "Despeje os ovos batidos na frigideira, cobrindo os vegetais",
        "Cozinhe em fogo baixo por 3-4 minutos até as bordas firmarem",
        "Adicione queijo ralado de sua preferência em metade da omelete",
        "Dobre a omelete ao meio com uma espátula",
        "Sirva imediatamente acompanhada de fatias de tomate"
      ],
      calorias: 280,
      tempo: 15,
      macros: { proteinas: 22, carboidratos: 6, gorduras: 18 }
    }
  ],
  "Almoço": [
    {
      nome: "Salmão Grelhado com Quinoa e Vegetais",
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
      calorias: 420,
      tempo: 25,
      macros: { proteinas: 38, carboidratos: 32, gorduras: 16 }
    },
    {
      nome: "Frango Grelhado com Batata Doce e Salada",
      ingredientes: ["Peito de Frango", "Batata Doce", "Couve-flor", "Azeite"],
      preparo: [
        "Corte 1 batata doce média em cubos de 2cm e tempere com sal",
        "Asse a batata doce no forno a 200°C por 25 minutos até dourar",
        "Tempere o peito de frango (150g) com sal, pimenta e ervas secas",
        "Deixe o frango marinando por 15 minutos para absorver os sabores",
        "Corte a couve-flor em floretes e cozinhe no vapor por 8 minutos",
        "Aqueça uma grelha com 1 colher de chá de azeite",
        "Grelhe o frango por 6-7 minutos de cada lado até dourar",
        "Verifique se o frango está bem cozido cortando no centro",
        "Tempere a couve-flor com azeite, sal e pimenta preta",
        "Monte o prato com a batata doce, couve-flor e frango fatiado",
        "Regue com azeite extra virgem e ervas frescas",
        "Acompanhe com uma salada verde simples se desejar"
      ],
      calorias: 380,
      tempo: 30,
      macros: { proteinas: 35, carboidratos: 28, gorduras: 12 }
    }
  ],
  "Lanche": [
    {
      nome: "Mix de Oleaginosas com Frutas Frescas",
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
      calorias: 220,
      tempo: 5,
      macros: { proteinas: 12, carboidratos: 18, gorduras: 14 }
    }
  ],
  "Jantar": [
    {
      nome: "Tofu Refogado com Vegetais Asiáticos",
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
      calorias: 260,
      tempo: 20,
      macros: { proteinas: 18, carboidratos: 14, gorduras: 16 }
    }
  ]
};

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

  const gerarReceitaInteligente = (refeicao: string, ingredientesDisponiveis: string[]) => {
    const receitasCandidatas = receitasBase[refeicao as keyof typeof receitasBase] || [];
    
    // Encontra a receita que mais combina com os ingredientes disponíveis
    let melhorReceita = null;
    let maiorCompatibilidade = 0;

    for (const receita of receitasCandidatas) {
      const ingredientesNecessarios = receita.ingredientes;
      const ingredientesCompartilhados = ingredientesNecessarios.filter(ing => 
        ingredientesDisponiveis.some(disp => 
          disp.toLowerCase().includes(ing.toLowerCase()) || 
          ing.toLowerCase().includes(disp.toLowerCase())
        )
      );
      
      const compatibilidade = ingredientesCompartilhados.length / ingredientesNecessarios.length;
      
      if (compatibilidade > maiorCompatibilidade) {
        maiorCompatibilidade = compatibilidade;
        melhorReceita = receita;
      }
    }

    // Se não encontrou uma receita adequada, cria uma adaptada
    if (!melhorReceita || maiorCompatibilidade < 0.3) {
      return gerarReceitaAdaptada(refeicao, ingredientesDisponiveis);
    }

    return {
      id: Date.now().toString(),
      nome: melhorReceita.nome,
      tempo: melhorReceita.tempo,
      calorias: melhorReceita.calorias,
      refeicao,
      ingredientes: melhorReceita.ingredientes.filter(ing => 
        ingredientesDisponiveis.some(disp => 
          disp.toLowerCase().includes(ing.toLowerCase()) || 
          ing.toLowerCase().includes(disp.toLowerCase())
        )
      ),
      preparo: melhorReceita.preparo,
      macros: melhorReceita.macros,
      favorita: false
    };
  };

  const gerarReceitaAdaptada = (refeicao: string, ingredientesDisponiveis: string[]) => {
    const preparosBasicos = {
      "Café da Manhã": [
        "Prepare todos os ingredientes em uma tigela limpa",
        "Misture delicadamente os ingredientes secos primeiro",
        "Adicione os ingredientes líquidos gradualmente",
        "Misture até obter uma consistência homogênea",
        "Sirva imediatamente para manter a qualidade nutricional"
      ],
      "Almoço": [
        "Tempere os ingredientes proteicos com sal e pimenta",
        "Aqueça uma frigideira com um fio de azeite",
        "Cozinhe a proteína até dourar dos dois lados",
        "Adicione os vegetais e refogue rapidamente",
        "Tempere a gosto e sirva quente"
      ],
      "Lanche": [
        "Organize os ingredientes em porções adequadas",
        "Combine os sabores de forma equilibrada",
        "Consuma imediatamente para melhor aproveitamento nutricional"
      ],
      "Jantar": [
        "Prepare os vegetais cortando-os uniformemente",
        "Aqueça a frigideira com azeite em fogo médio",
        "Refogue os ingredientes mais duros primeiro",
        "Adicione temperos naturais a gosto",
        "Sirva quente acompanhado de salada verde"
      ]
    };

    return {
      id: Date.now().toString(),
      nome: `Receita Saudável com ${ingredientesDisponiveis.slice(0, 2).join(' e ')}`,
      tempo: Math.floor(Math.random() * 20) + 10,
      calorias: Math.floor(Math.random() * 200) + 200,
      refeicao,
      ingredientes: ingredientesDisponiveis.slice(0, 5),
      preparo: preparosBasicos[refeicao as keyof typeof preparosBasicos] || preparosBasicos["Almoço"],
      macros: {
        proteinas: Math.floor(Math.random() * 15) + 10,
        carboidratos: Math.floor(Math.random() * 25) + 15,
        gorduras: Math.floor(Math.random() * 10) + 5
      },
      favorita: false
    };
  };

  const gerarNovasReceitas = (refeicao: string, ingredientesSelecionados: string[], itensComprados?: string[]) => {
    if (ingredientesSelecionados.length === 0 && (!itensComprados || itensComprados.length === 0)) {
      toast.error("Selecione pelo menos um ingrediente ou tenha itens comprados na lista!");
      return;
    }

    toast.loading("Gerando receitas nutritivas...", { duration: 2000 });
    
    setTimeout(() => {
      // Usa os itens comprados se disponíveis, senão usa os ingredientes selecionados
      const ingredientesParaUsar = itensComprados && itensComprados.length > 0 
        ? itensComprados 
        : ingredientesSelecionados;
      
      const novaReceita = gerarReceitaInteligente(refeicao, ingredientesParaUsar);

      setReceitasGeradas(prev => ({
        ...prev,
        [refeicao]: [...prev[refeicao], novaReceita]
      }));

      toast.success("Nova receita nutricional gerada com base nos seus ingredientes!");
    }, 2000);
  };

  return {
    receitasGeradas,
    toggleFavorito,
    gerarNovasReceitas,
    removerReceita
  };
}
