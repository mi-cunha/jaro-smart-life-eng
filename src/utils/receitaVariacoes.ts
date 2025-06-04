
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
    ingredientes: ingredientesAdaptados,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    favorita: false
  };
};

export const gerarReceitaAdaptativa = (refeicao: string, ingredientesDisponiveis: string[]) => {
  const categoriasPorRefeicao = {
    "Café da Manhã": ["proteico", "energético", "detox"],
    "Almoço": ["proteico", "vegetariano", "leve"],
    "Lanche": ["nutritivo", "cremoso", "proteico-leve"],
    "Jantar": ["vegano", "detox", "leve-premium"]
  };
  
  const categorias = categoriasPorRefeicao[refeicao as keyof typeof categoriasPorRefeicao] || ["nutritivo"];
  const categoria = categorias[Math.floor(Math.random() * categorias.length)];
  
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
    ],
    "energético": [
      "Combine carboidratos complexos com proteínas",
      "Adicione frutas para energia natural",
      "Misture ingredientes preservando texturas",
      "Sirva imediatamente para manter propriedades"
    ],
    "leve": [
      "Prepare os ingredientes de forma simples e natural",
      "Use métodos de cocção que preservem leveza",
      "Tempere sutilmente para realçar sabores naturais",
      "Sirva em porções adequadas"
    ],
    "nutritivo": [
      "Combine diferentes grupos alimentares",
      "Preserve nutrientes durante o preparo",
      "Use temperos naturais e ervas frescas",
      "Sirva balanceando sabores e texturas"
    ],
    "cremoso": [
      "Misture ingredientes até obter textura homogênea",
      "Adicione elementos cremosos naturais",
      "Tempere delicadamente",
      "Sirva na temperatura ideal"
    ],
    "proteico-leve": [
      "Combine proteínas magras com vegetais frescos",
      "Prepare de forma simples e saudável",
      "Tempere com ervas e especiarias naturais",
      "Sirva fresco e nutritivo"
    ],
    "vegano": [
      "Use apenas ingredientes de origem vegetal",
      "Combine proteínas vegetais para completude nutricional",
      "Tempere com especiarias e ervas naturais",
      "Sirva colorido e nutritivo"
    ],
    "leve-premium": [
      "Selecione ingredientes de alta qualidade",
      "Prepare com técnicas que realcem sabores",
      "Apresente de forma elegante e balanceada",
      "Sirva na temperatura perfeita"
    ]
  };
  
  const preparo = preparosPersonalizados[categoria as keyof typeof preparosPersonalizados] || preparosPersonalizados["nutritivo"];
  
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nome: `Receita ${categoria.charAt(0).toUpperCase() + categoria.slice(1)} com ${ingredientesDisponiveis.slice(0, 2).join(' e ')}`,
    tempo: Math.floor(Math.random() * 25) + 10,
    calorias: Math.floor(Math.random() * 250) + 200,
    refeicao,
    ingredientes: ingredientesDisponiveis.slice(0, Math.min(6, ingredientesDisponiveis.length)),
    preparo,
    macros: {
      proteinas: Math.floor(Math.random() * 20) + 10,
      carboidratos: Math.floor(Math.random() * 30) + 15,
      gorduras: Math.floor(Math.random() * 15) + 5
    },
    favorita: false
  };
};
