
// Service for healthy nutritional recommendations
export class RecomendacoesNutricionais {
  // List of items not recommended for healthy diets
  private static itensProibidos = [
    'coca cola', 'coca-cola', 'soda', 'soft drink', 'guarana', 'pepsi', 'sprite',
    'chocolate', 'candy', 'sweets', 'sugar', 'artificial honey', 'syrup',
    'oil', 'soybean oil', 'margarine', 'butter', 'lard',
    'fried foods', 'french fries', 'chips', 'snacks',
    'processed meats', 'sausage', 'hot dog', 'bologna', 'ham',
    'fast food', 'burger', 'pizza', 'hot dog',
    'filled cookies', 'crackers', 'wafer', 'donuts',
    'ice cream', 'milkshake', 'açaí with condensed milk',
    'energy drink', 'artificial isotonic', 'alcoholic beverage',
    'instant noodles', 'cup noodles', 'frozen ready meals'
  ];

  // Healthy recommendations by category
  private static recomendacoesSaudaveis = {
    proteinas: [
      'Grilled chicken breast', 'Fresh fish (salmon, tilapia)', 'Organic eggs', 
      'Natural tofu', 'Lentils', 'Black beans', 'Chickpeas', 'Quinoa'
    ],
    vegetais: [
      'Fresh broccoli', 'Spinach', 'Kale', 'Arugula', 'Organic lettuce',
      'Cherry tomatoes', 'Cucumber', 'Carrots', 'Zucchini', 'Eggplant'
    ],
    frutas: [
      'Green apple', 'Banana', 'Organic strawberries', 'Blueberries',
      'Avocado', 'Lemon', 'Orange', 'Papaya', 'Cantaloupe'
    ],
    carboidratos: [
      'Sweet potato', 'Cassava', 'Oat flakes', 'Tricolor quinoa',
      'Brown rice', 'Sugar-free whole grain bread', 'Natural tapioca'
    ],
    gordurasSaudaveis: [
      'Extra virgin olive oil', 'Avocado', 'Brazil nuts', 'Almonds',
      'Chia seeds', 'Flaxseed', 'Extra virgin coconut oil'
    ],
    bebidas: [
      'Mineral water', 'Green tea', 'Hibiscus tea', 'Natural coconut water',
      'Natural green juice', 'Lemon water', 'Natural kombucha'
    ],
    temperos: [
      'Turmeric', 'Ginger', 'Garlic', 'Onion', 'Fine herbs',
      'Oregano', 'Basil', 'Rosemary', 'Himalayan pink salt'
    ]
  };

  static verificarSeItemEhSaudavel(nomeItem: string): boolean {
    const itemLower = nomeItem.toLowerCase().trim();
    
    // Check if item is in the prohibited list
    return !this.itensProibidos.some(proibido => 
      itemLower.includes(proibido) || proibido.includes(itemLower)
    );
  }

  static obterRecomendacoesPorPalavraChave(palavraChave: string): string[] {
    const palavra = palavraChave.toLowerCase().trim();
    let recomendacoes: string[] = [];

    // If the keyword is not healthy, return healthy alternatives
    if (!this.verificarSeItemEhSaudavel(palavra)) {
      // Return alternatives based on the type of unhealthy item
      if (palavra.includes('soda') || palavra.includes('coca') || palavra.includes('soft drink')) {
        return this.recomendacoesSaudaveis.bebidas.slice(0, 5);
      }
      if (palavra.includes('chocolate') || palavra.includes('candy') || palavra.includes('sweets')) {
        return this.recomendacoesSaudaveis.frutas.slice(0, 5);
      }
      if (palavra.includes('oil') || palavra.includes('margarine')) {
        return this.recomendacoesSaudaveis.gordurasSaudaveis.slice(0, 3);
      }
      if (palavra.includes('processed') || palavra.includes('sausage')) {
        return this.recomendacoesSaudaveis.proteinas.slice(0, 4);
      }
      
      // General case: return fruits and vegetables
      return [...this.recomendacoesSaudaveis.frutas.slice(0, 3), ...this.recomendacoesSaudaveis.vegetais.slice(0, 2)];
    }

    // For healthy items, search by category
    if (palavra.includes('fruit') || palavra.includes('apple') || palavra.includes('banana')) {
      recomendacoes = this.recomendacoesSaudaveis.frutas;
    } else if (palavra.includes('vegetable') || palavra.includes('greens') || palavra.includes('veggie')) {
      recomendacoes = this.recomendacoesSaudaveis.vegetais;
    } else if (palavra.includes('protein') || palavra.includes('meat') || palavra.includes('chicken')) {
      recomendacoes = this.recomendacoesSaudaveis.proteinas;
    } else if (palavra.includes('carb') || palavra.includes('rice') || palavra.includes('potato')) {
      recomendacoes = this.recomendacoesSaudaveis.carboidratos;
    } else if (palavra.includes('drink') || palavra.includes('water') || palavra.includes('tea')) {
      recomendacoes = this.recomendacoesSaudaveis.bebidas;
    } else {
      // Search in all categories
      const todasRecomendacoes = Object.values(this.recomendacoesSaudaveis).flat();
      recomendacoes = todasRecomendacoes.filter(item => 
        item.toLowerCase().includes(palavra) || palavra.includes(item.toLowerCase())
      );
      
      // If nothing specific was found, return a healthy mix
      if (recomendacoes.length === 0) {
        recomendacoes = [
          ...this.recomendacoesSaudaveis.vegetais.slice(0, 2),
          ...this.recomendacoesSaudaveis.frutas.slice(0, 2),
          ...this.recomendacoesSaudaveis.proteinas.slice(0, 1)
        ];
      }
    }

    return recomendacoes.slice(0, 8); // Limit to 8 suggestions
  }

  static obterDicaNutricional(item: string): string {
    const itemLower = item.toLowerCase();
    
    if (itemLower.includes('broccoli')) return "Rich in vitamin C and fiber, excellent for the immune system";
    if (itemLower.includes('salmon')) return "Source of omega-3, helps cardiovascular health";
    if (itemLower.includes('oat')) return "Rich in soluble fiber, helps control cholesterol";
    if (itemLower.includes('quinoa')) return "Complete protein and gluten-free, ideal for vegetarians";
    if (itemLower.includes('avocado')) return "Good fats that help in vitamin absorption";
    if (itemLower.includes('green tea')) return "Natural antioxidants that boost metabolism";
    
    return "Healthy choice that contributes to a balanced diet";
  }
}
