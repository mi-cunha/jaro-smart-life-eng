
export interface Receita {
  id: string;
  nome: string;
  tempo: number;
  calorias: number;
  refeicao: string;
  ingredientes: string[];
  preparo: string[];
  macros: {
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
  favorita: boolean;
}

export interface Ingrediente {
  nome: string;
  selecionado: boolean;
}

export interface Filtros {
  objetivo: string;
  preferencias: string;
  caloriesMax: number[];
}

export interface ItemCompra {
  id: string;
  nome: string;
  quantidade: string;
  preco: number;
  comprado: boolean;
  categoria?: string;
}

// Updated interface to match the actual database structure
export interface PreferenciasUsuario {
  objetivo: string;
  alimentares: string; // This matches how it's stored in the database
  restricoes: string[]; // This matches how it's stored in the database
}

// Helper type for the actual JSON structure in preferencias_alimentares column
export interface PreferenciasAlimentaresJSON {
  dietType?: string;
  mealPreferences?: string[];
  cookingStyle?: string;
  dailyRoutine?: string;
  [key: string]: any;
}
