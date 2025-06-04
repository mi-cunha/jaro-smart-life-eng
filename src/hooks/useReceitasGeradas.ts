
import { useState } from "react";
import { toast } from "sonner";
import { Receita } from "@/types/receitas";

// Base expandida de receitas recomendadas por nutricionistas
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
      macros: { proteinas: 16, carboidratos: 48, gorduras: 12 },
      categoria: "proteico-energético"
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
      macros: { proteinas: 22, carboidratos: 6, gorduras: 18 },
      categoria: "proteico"
    },
    {
      nome: "Panqueca de Banana e Aveia",
      ingredientes: ["Banana", "Aveia", "Ovos", "Canela"],
      preparo: [
        "Amasse 1 banana madura até formar uma pasta lisa",
        "Adicione 1/2 xícara de aveia em flocos e misture bem",
        "Quebre 1 ovo e incorpore à mistura",
        "Adicione uma pitada de canela em pó",
        "Deixe a massa descansar por 5 minutos para hidratar a aveia",
        "Aqueça uma frigideira antiaderente em fogo médio",
        "Despeje pequenas porções da massa formando panquecas",
        "Cozinhe por 2-3 minutos de cada lado até dourar",
        "Sirva quente com frutas frescas ou mel"
      ],
      calorias: 260,
      tempo: 18,
      macros: { proteinas: 14, carboidratos: 42, gorduras: 8 },
      categoria: "energético"
    },
    {
      nome: "Smoothie Verde Detox",
      ingredientes: ["Espinafre", "Banana", "Abacate", "Iogurte Natural", "Chia"],
      preparo: [
        "Lave bem 1 punhado de folhas de espinafre fresco",
        "Corte 1 banana e 1/4 de abacate maduro",
        "Coloque todos os ingredientes no liquidificador",
        "Adicione 200ml de iogurte natural",
        "Adicione 1 colher de chá de sementes de chia",
        "Bata por 1-2 minutos até obter consistência cremosa",
        "Sirva imediatamente em copo gelado",
        "Decore com sementes de chia por cima"
      ],
      calorias: 290,
      tempo: 8,
      macros: { proteinas: 12, carboidratos: 38, gorduras: 14 },
      categoria: "detox"
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
      macros: { proteinas: 38, carboidratos: 32, gorduras: 16 },
      categoria: "proteico-premium"
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
      macros: { proteinas: 35, carboidratos: 28, gorduras: 12 },
      categoria: "proteico-tradicional"
    },
    {
      nome: "Bowl Mediterrâneo com Grão-de-Bico",
      ingredientes: ["Grão-de-Bico", "Quinoa", "Abobrinha", "Azeite", "Limão"],
      preparo: [
        "Cozinhe 1/2 xícara de quinoa em água com sal por 15 minutos",
        "Escorra e tempere 1 xícara de grão-de-bico cozido",
        "Corte a abobrinha em cubos e refogue com azeite por 5 minutos",
        "Tempere o grão-de-bico com azeite, limão, sal e cominho",
        "Monte o bowl com quinoa como base",
        "Adicione o grão-de-bico temperado e a abobrinha refogada",
        "Finalize com azeite extra virgem e suco de limão",
        "Adicione ervas frescas como salsa ou coentro"
      ],
      calorias: 360,
      tempo: 20,
      macros: { proteinas: 18, carboidratos: 52, gorduras: 10 },
      categoria: "vegetariano"
    },
    {
      nome: "Peixe Assado com Legumes",
      ingredientes: ["Peixe Branco", "Brócolis", "Batata Doce", "Azeite"],
      preparo: [
        "Pré-aqueça o forno a 180°C",
        "Corte a batata doce em fatias e o brócolis em floretes",
        "Tempere o peixe (150g) com sal, pimenta e ervas",
        "Disponha os legumes em uma assadeira com azeite",
        "Asse os legumes por 15 minutos",
        "Adicione o peixe à assadeira e asse por mais 12 minutos",
        "Regue com azeite e sirva quente"
      ],
      calorias: 340,
      tempo: 35,
      macros: { proteinas: 32, carboidratos: 28, gorduras: 12 },
      categoria: "leve-nutritivo"
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
      macros: { proteinas: 12, carboidratos: 18, gorduras: 14 },
      categoria: "nutritivo"
    },
    {
      nome: "Vitamina de Abacate com Cacau",
      ingredientes: ["Abacate", "Iogurte Natural", "Cacau", "Mel"],
      preparo: [
        "Corte 1/2 abacate maduro e retire o caroço",
        "Coloque o abacate no liquidificador com 200ml de iogurte",
        "Adicione 1 colher de sopa de cacau em pó",
        "Adicione 1 colher de chá de mel para adoçar",
        "Bata por 1 minuto até obter consistência cremosa",
        "Sirva gelado em copo alto",
        "Decore com cacau em pó polvilhado por cima"
      ],
      calorias: 280,
      tempo: 7,
      macros: { proteinas: 10, carboidratos: 22, gorduras: 20 },
      categoria: "cremoso"
    },
    {
      nome: "Toast de Cottage com Frutas",
      ingredientes: ["Cottage", "Frutas Vermelhas", "Mel"],
      preparo: [
        "Corte 2 fatias de pão integral e toste levemente",
        "Espalhe 3 colheres de sopa de cottage sobre as torradas",
        "Distribua frutas vermelhas frescas por cima",
        "Regue com 1 colher de chá de mel",
        "Adicione uma pitada de canela se desejar",
        "Sirva imediatamente"
      ],
      calorias: 240,
      tempo: 8,
      macros: { proteinas: 16, carboidratos: 28, gorduras: 6 },
      categoria: "proteico-leve"
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
      macros: { proteinas: 18, carboidratos: 14, gorduras: 16 },
      categoria: "vegano"
    },
    {
      nome: "Sopa Detox de Couve-flor",
      ingredientes: ["Couve-flor", "Abobrinha", "Azeite", "Espinafre"],
      preparo: [
        "Corte 1 couve-flor média em floretes pequenos",
        "Corte 1 abobrinha em cubos médios",
        "Refogue os vegetais em uma panela com azeite por 5 minutos",
        "Adicione 500ml de água ou caldo de vegetais",
        "Cozinhe por 15 minutos até os vegetais ficarem macios",
        "Adicione folhas de espinafre nos últimos 2 minutos",
        "Tempere com sal, pimenta e ervas finas",
        "Sirva quente com um fio de azeite por cima"
      ],
      calorias: 180,
      tempo: 25,
      macros: { proteinas: 8, carboidratos: 16, gorduras: 10 },
      categoria: "detox"
    },
    {
      nome: "Berinjela Recheada com Quinoa",
      ingredientes: ["Berinjela", "Quinoa", "Cogumelos", "Azeite"],
      preparo: [
        "Corte 1 berinjela ao meio no sentido longitudinal",
        "Retire a polpa deixando uma borda de 1cm",
        "Pique a polpa retirada em cubos pequenos",
        "Cozinhe 1/2 xícara de quinoa em água com sal",
        "Refogue a polpa da berinjela com cogumelos em cubos",
        "Misture a quinoa cozida com os vegetais refogados",
        "Recheie as cascas da berinjela com a mistura",
        "Asse no forno a 180°C por 25 minutos",
        "Sirva quente regado com azeite"
      ],
      calorias: 240,
      tempo: 40,
      macros: { proteinas: 10, carboidratos: 32, gorduras: 8 },
      categoria: "vegetariano-elaborado"
    },
    {
      nome: "Peixe no Vapor com Aspargos",
      ingredientes: ["Peixe Branco", "Aspargos", "Azeite", "Limão"],
      preparo: [
        "Tempere o peixe (150g) com sal, pimenta e suco de limão",
        "Prepare os aspargos retirando a parte mais dura",
        "Coloque água para ferver em uma panela com cesto de vapor",
        "Cozinhe o peixe no vapor por 8-10 minutos",
        "Adicione os aspargos nos últimos 5 minutos",
        "Retire e tempere com azeite e ervas frescas",
        "Sirva imediatamente com gotas de limão"
      ],
      calorias: 220,
      tempo: 18,
      macros: { proteinas: 28, carboidratos: 8, gorduras: 8 },
      categoria: "leve-premium"
    }
  ]
};

// Sistema de variações inteligentes
const variacoesReceitas = {
  temperos: ["ervas finas", "manjericão", "orégano", "tomilho", "alecrim"],
  proteinas: {
    animal: ["frango", "peixe", "ovos", "iogurte"],
    vegetal: ["tofu", "grão-de-bico", "quinoa", "oleaginosas"]
  },
  vegetais: ["brócolis", "abobrinha", "couve-flor", "espinafre", "cogumelos"],
  carboidratos: ["quinoa", "batata doce", "aveia", "frutas"]
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

  const calcularCompatibilidade = (receitaIngredientes: string[], ingredientesDisponiveis: string[]) => {
    const matches = receitaIngredientes.filter(ingredienteReceita => 
      ingredientesDisponiveis.some(ingredienteDisponivel => {
        const nomeReceita = ingredienteReceita.toLowerCase();
        const nomeDisponivel = ingredienteDisponivel.toLowerCase();
        
        // Verificações mais inteligentes de compatibilidade
        return nomeReceita.includes(nomeDisponivel) || 
               nomeDisponivel.includes(nomeReceita) ||
               // Sinônimos comuns
               (nomeReceita.includes('frango') && nomeDisponivel.includes('peito de frango')) ||
               (nomeReceita.includes('oleaginosas') && (nomeDisponivel.includes('castanha') || nomeDisponivel.includes('amêndoa') || nomeDisponivel.includes('noz'))) ||
               (nomeReceita.includes('frutas vermelhas') && (nomeDisponivel.includes('morango') || nomeDisponivel.includes('mirtilo'))) ||
               (nomeReceita.includes('peixe') && (nomeDisponivel.includes('salmão') || nomeDisponivel.includes('tilápia')));
      })
    );
    
    return {
      score: matches.length / receitaIngredientes.length,
      matchedIngredients: matches
    };
  };

  const selecionarReceitaInteligente = (refeicao: string, ingredientesDisponiveis: string[]) => {
    const receitasCandidatas = receitasBase[refeicao as keyof typeof receitasBase] || [];
    
    // Filtra receitas já geradas para evitar repetição
    const receitasDisponiveis = receitasCandidatas.filter(receita => 
      !receitasJaGeradas.has(`${refeicao}-${receita.nome}`)
    );
    
    if (receitasDisponiveis.length === 0) {
      // Se todas as receitas já foram geradas, limpa o histórico e permite repetir
      setReceitasJaGeradas(new Set());
      return receitasCandidatas[Math.floor(Math.random() * receitasCandidatas.length)];
    }
    
    // Calcula compatibilidade para cada receita disponível
    const receitasComScore = receitasDisponiveis.map(receita => ({
      ...receita,
      compatibilidade: calcularCompatibilidade(receita.ingredientes, ingredientesDisponiveis)
    }));
    
    // Ordena por compatibilidade e seleciona uma das 3 melhores aleatoriamente
    const melhoresReceitas = receitasComScore
      .sort((a, b) => b.compatibilidade.score - a.compatibilidade.score)
      .slice(0, 3);
    
    return melhoresReceitas[Math.floor(Math.random() * melhoresReceitas.length)];
  };

  const criarVariacaoReceita = (receitaBase: any, ingredientesDisponiveis: string[]) => {
    const ingredientesAdaptados = receitaBase.ingredientes.map((ingrediente: string) => {
      // Encontra ingrediente compatível disponível
      const compativel = ingredientesDisponiveis.find(disp => 
        disp.toLowerCase().includes(ingrediente.toLowerCase()) ||
        ingrediente.toLowerCase().includes(disp.toLowerCase())
      );
      return compativel || ingrediente;
    });
    
    // Adiciona variação no nome se ingredientes foram adaptados
    const nomeVariado = ingredientesAdaptados.some((ing: string, index: number) => 
      ing !== receitaBase.ingredientes[index]
    ) ? `${receitaBase.nome} (Variação)` : receitaBase.nome;
    
    return {
      ...receitaBase,
      nome: nomeVariado,
      ingredientes: ingredientesAdaptados
    };
  };

  const gerarReceitaAdaptativa = (refeicao: string, ingredientesDisponiveis: string[]) => {
    const categoriasPorRefeicao = {
      "Café da Manhã": ["proteico", "energético", "detox"],
      "Almoço": ["proteico", "vegetariano", "leve"],
      "Lanche": ["nutritivo", "cremoso", "proteico-leve"],
      "Jantar": ["vegano", "detox", "leve-premium"]
    };
    
    const categoria = categoriasPorRefeicao[refeicao as keyof typeof categoriasPorRefeicao]?.[
      Math.floor(Math.random() * 3)
    ] || "nutritivo";
    
    const preparosPersonalizados = {
      "proteico": [
        "Prepare a proteína temperando com sal, pimenta e ervas aromáticas",
        "Cozinhe em fogo médio até dourar uniformemente",
        "Adicione os vegetais e refogue rapidamente para manter nutrientes",
        "Finalize com temperos frescos e sirva quente"
      ],
      "vegetariano": [
        "Prepare todos os vegetais cortando em tamanhos uniformes",
        "Refogue em azeite começando pelos mais duros",
        "Tempere com ervas frescas e especiarias naturais",
        "Sirva acompanhado de grãos integrais"
      ],
      "detox": [
        "Lave bem todos os ingredientes em água corrente",
        "Prepare no vapor para preservar máximo de nutrientes",
        "Use apenas temperos naturais como limão e ervas",
        "Consuma preferencialmente quente e fresco"
      ]
    };
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: `Receita ${categoria.charAt(0).toUpperCase() + categoria.slice(1)} com ${ingredientesDisponiveis.slice(0, 2).join(' e ')}`,
      tempo: Math.floor(Math.random() * 25) + 10,
      calorias: Math.floor(Math.random() * 250) + 200,
      refeicao,
      ingredientes: ingredientesDisponiveis.slice(0, Math.min(6, ingredientesDisponiveis.length)),
      preparo: preparosPersonalizados[categoria as keyof typeof preparosPersonalizados] || preparosPersonalizados["proteico"],
      macros: {
        proteinas: Math.floor(Math.random() * 20) + 10,
        carboidratos: Math.floor(Math.random() * 30) + 15,
        gorduras: Math.floor(Math.random() * 15) + 5
      },
      favorita: false
    };
  };

  const gerarNovasReceitas = (refeicao: string, ingredientesSelecionados: string[], itensComprados?: string[]) => {
    if (ingredientesSelecionados.length === 0 && (!itensComprados || itensComprados.length === 0)) {
      toast.error("Selecione pelo menos um ingrediente ou tenha itens comprados na lista!");
      return;
    }

    toast.loading("Analisando ingredientes e gerando receita personalizada...", { duration: 2500 });
    
    setTimeout(() => {
      // Prioriza itens comprados, mas combina com ingredientes selecionados
      const todosIngredientes = [
        ...(itensComprados || []),
        ...ingredientesSelecionados
      ].filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicatas
      
      let novaReceita;
      
      // Tenta selecionar receita da base primeiro
      const receitaSelecionada = selecionarReceitaInteligente(refeicao, todosIngredientes);
      
      if (receitaSelecionada && receitaSelecionada.compatibilidade?.score > 0.3) {
        // Usa receita da base com possível variação
        novaReceita = criarVariacaoReceita(receitaSelecionada, todosIngredientes);
        setReceitasJaGeradas(prev => new Set(prev).add(`${refeicao}-${receitaSelecionada.nome}`));
      } else {
        // Cria receita completamente adaptativa
        novaReceita = gerarReceitaAdaptativa(refeicao, todosIngredientes);
      }
      
      // Garante ID único
      novaReceita.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setReceitasGeradas(prev => ({
        ...prev,
        [refeicao]: [...prev[refeicao], novaReceita]
      }));

      const tipoReceita = itensComprados && itensComprados.length > 0 
        ? "baseada nos seus itens comprados" 
        : "personalizada com seus ingredientes";
        
      toast.success(`Nova receita ${tipoReceita} gerada com sucesso! 🍽️`);
    }, 2500);
  };

  return {
    receitasGeradas,
    toggleFavorito,
    gerarNovasReceitas,
    removerReceita
  };
}
