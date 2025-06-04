
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

export interface PreferenciasUsuario {
  alimentares: string;
  restricoes: string[];
  objetivo: string;
}
