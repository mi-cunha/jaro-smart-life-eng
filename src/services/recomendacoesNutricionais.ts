
// Serviço para recomendações nutricionais saudáveis
export class RecomendacoesNutricionais {
  // Lista de itens não recomendados para dietas saudáveis
  private static itensProibidos = [
    'coca cola', 'coca-cola', 'refrigerante', 'guaraná', 'pepsi', 'sprite',
    'chocolate', 'bombom', 'doce', 'açúcar', 'mel artificial', 'xarope',
    'óleo', 'óleo de soja', 'margarina', 'manteiga', 'banha',
    'frituras', 'batata frita', 'salgadinho', 'chips',
    'embutidos', 'salsicha', 'linguiça', 'mortadela', 'presunto',
    'fast food', 'hambúrguer', 'pizza', 'hot dog',
    'biscoito recheado', 'bolacha', 'wafer', 'rosquinha',
    'sorvete', 'milkshake', 'açaí com leite condensado',
    'energético', 'isotônico artificial', 'bebida alcoólica',
    'macarrão instantâneo', 'miojo', 'comida pronta congelada'
  ];

  // Recomendações saudáveis por categoria
  private static recomendacoesSaudaveis = {
    proteinas: [
      'Peito de frango grelhado', 'Peixe fresco (salmão, tilápia)', 'Ovos orgânicos', 
      'Tofu natural', 'Lentilhas', 'Feijão preto', 'Grão-de-bico', 'Quinoa'
    ],
    vegetais: [
      'Brócolis fresco', 'Espinafre', 'Couve', 'Rúcula', 'Alface orgânica',
      'Tomate cereja', 'Pepino', 'Cenoura', 'Abobrinha', 'Berinjela'
    ],
    frutas: [
      'Maçã verde', 'Banana prata', 'Morango orgânico', 'Mirtilo',
      'Abacate', 'Limão', 'Laranja', 'Mamão papaya', 'Melão'
    ],
    carboidratos: [
      'Batata doce', 'Mandioca', 'Aveia em flocos', 'Quinoa tricolor',
      'Arroz integral', 'Pão integral sem açúcar', 'Tapioca natural'
    ],
    gordurasSaudaveis: [
      'Azeite extra virgem', 'Abacate', 'Castanha do Pará', 'Amêndoas',
      'Chia', 'Linhaça', 'Óleo de coco extravirgem'
    ],
    bebidas: [
      'Água mineral', 'Chá verde', 'Chá de hibisco', 'Água de coco natural',
      'Suco verde natural', 'Água com limão', 'Kombucha natural'
    ],
    temperos: [
      'Cúrcuma', 'Gengibre', 'Alho', 'Cebola', 'Ervas finas',
      'Oregano', 'Manjericão', 'Alecrim', 'Sal rosa do Himalaia'
    ]
  };

  static verificarSeItemEhSaudavel(nomeItem: string): boolean {
    const itemLower = nomeItem.toLowerCase().trim();
    
    // Verifica se o item está na lista de proibidos
    return !this.itensProibidos.some(proibido => 
      itemLower.includes(proibido) || proibido.includes(itemLower)
    );
  }

  static obterRecomendacoesPorPalavraChave(palavraChave: string): string[] {
    const palavra = palavraChave.toLowerCase().trim();
    let recomendacoes: string[] = [];

    // Se a palavra-chave não é saudável, retorna alternativas saudáveis
    if (!this.verificarSeItemEhSaudavel(palavra)) {
      // Retorna alternativas baseadas no tipo de item não saudável
      if (palavra.includes('refrigerante') || palavra.includes('coca') || palavra.includes('guaraná')) {
        return this.recomendacoesSaudaveis.bebidas.slice(0, 5);
      }
      if (palavra.includes('chocolate') || palavra.includes('doce')) {
        return this.recomendacoesSaudaveis.frutas.slice(0, 5);
      }
      if (palavra.includes('óleo') || palavra.includes('margarina')) {
        return this.recomendacoesSaudaveis.gordurasSaudaveis.slice(0, 3);
      }
      if (palavra.includes('embutido') || palavra.includes('salsicha')) {
        return this.recomendacoesSaudaveis.proteinas.slice(0, 4);
      }
      
      // Caso geral: retorna frutas e vegetais
      return [...this.recomendacoesSaudaveis.frutas.slice(0, 3), ...this.recomendacoesSaudaveis.vegetais.slice(0, 2)];
    }

    // Para itens saudáveis, busca por categoria
    if (palavra.includes('fruta') || palavra.includes('maçã') || palavra.includes('banana')) {
      recomendacoes = this.recomendacoesSaudaveis.frutas;
    } else if (palavra.includes('vegetal') || palavra.includes('verdura') || palavra.includes('legume')) {
      recomendacoes = this.recomendacoesSaudaveis.vegetais;
    } else if (palavra.includes('proteína') || palavra.includes('carne') || palavra.includes('frango')) {
      recomendacoes = this.recomendacoesSaudaveis.proteinas;
    } else if (palavra.includes('carboidrato') || palavra.includes('arroz') || palavra.includes('batata')) {
      recomendacoes = this.recomendacoesSaudaveis.carboidratos;
    } else if (palavra.includes('bebida') || palavra.includes('água') || palavra.includes('chá')) {
      recomendacoes = this.recomendacoesSaudaveis.bebidas;
    } else {
      // Busca em todas as categorias
      const todasRecomendacoes = Object.values(this.recomendacoesSaudaveis).flat();
      recomendacoes = todasRecomendacoes.filter(item => 
        item.toLowerCase().includes(palavra) || palavra.includes(item.toLowerCase())
      );
      
      // Se não encontrou nada específico, retorna uma mistura saudável
      if (recomendacoes.length === 0) {
        recomendacoes = [
          ...this.recomendacoesSaudaveis.vegetais.slice(0, 2),
          ...this.recomendacoesSaudaveis.frutas.slice(0, 2),
          ...this.recomendacoesSaudaveis.proteinas.slice(0, 1)
        ];
      }
    }

    return recomendacoes.slice(0, 8); // Limita a 8 sugestões
  }

  static obterDicaNutricional(item: string): string {
    const itemLower = item.toLowerCase();
    
    if (itemLower.includes('brócolis')) return "Rico em vitamina C e fibras, excelente para o sistema imunológico";
    if (itemLower.includes('salmão')) return "Fonte de ômega-3, ajuda na saúde cardiovascular";
    if (itemLower.includes('aveia')) return "Rica em fibras solúveis, ajuda a controlar o colesterol";
    if (itemLower.includes('quinoa')) return "Proteína completa e sem glúten, ideal para vegetarianos";
    if (itemLower.includes('abacate')) return "Gorduras boas que ajudam na absorção de vitaminas";
    if (itemLower.includes('chá verde')) return "Antioxidantes naturais que aceleram o metabolismo";
    
    return "Escolha saudável que contribui para uma alimentação equilibrada";
  }
}
