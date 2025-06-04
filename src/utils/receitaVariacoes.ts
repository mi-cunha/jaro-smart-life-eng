
// Sistema de variações inteligentes
export const variacoesReceitas = {
  temperos: ["ervas finas", "manjericão", "orégano", "tomilho", "alecrim"],
  proteinas: {
    animal: ["frango", "peixe", "ovos", "iogurte"],
    vegetal: ["tofu", "grão-de-bico", "quinoa", "oleaginosas"]
  },
  vegetais: ["brócolis", "abobrinha", "couve-flor", "espinafre", "cogumelos"],
  carboidratos: ["quinoa", "batata doce", "aveia", "frutas"]
};

export const criarVariacaoReceita = (receitaBase: any, ingredientesDisponiveis: string[]) => {
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

export const gerarReceitaAdaptativa = (refeicao: string, ingredientesDisponiveis: string[]) => {
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
