
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
