
import { useState, useEffect } from 'react';
import { RecipesService } from '@/services/recipesService';
import { Receita } from '@/types/receitas';
import { toast } from 'sonner';

// Helper function to transform Supabase receita data to our Receita interface
const transformSupabaseReceita = (supabaseReceita: any): Receita => {
  return {
    id: supabaseReceita.id,
    nome: supabaseReceita.nome,
    tempo: supabaseReceita.tempo,
    calorias: supabaseReceita.calorias,
    refeicao: supabaseReceita.refeicao,
    ingredientes: supabaseReceita.ingredientes || [],
    preparo: supabaseReceita.preparo || [],
    macros: {
      proteinas: supabaseReceita.proteinas || 0,
      carboidratos: supabaseReceita.carboidratos || 0,
      gorduras: supabaseReceita.gorduras || 0,
    },
    favorita: supabaseReceita.favorita || false
  };
};

// Map English meal types to Portuguese and vice versa
const mealTypeMap: { [key: string]: string } = {
  "Breakfast": "Café da Manhã",
  "Lunch": "Almoço", 
  "Snack": "Lanche",
  "Dinner": "Jantar",
  "Café da Manhã": "Breakfast",
  "Almoço": "Lunch",
  "Lanche": "Snack", 
  "Jantar": "Dinner"
};

export function useSupabaseReceitas() {
  const [receitas, setReceitas] = useState<{ [key: string]: Receita[] }>({
    "Café da Manhã": [],
    "Almoço": [],
    "Lanche": [],
    "Jantar": [],
    // Also initialize English keys to handle both languages
    "Breakfast": [],
    "Lunch": [],
    "Snack": [],
    "Dinner": []
  });
  const [loading, setLoading] = useState(false);

  const carregarReceitas = async () => {
    setLoading(true);
    try {
      const receitasPorRefeicao: { [key: string]: Receita[] } = {
        "Café da Manhã": [],
        "Almoço": [],
        "Lanche": [],
        "Jantar": [],
        "Breakfast": [],
        "Lunch": [],
        "Snack": [],
        "Dinner": []
      };

      // Load all recipes at once instead of by meal type
      const { data, error } = await RecipesService.buscarReceitas();
      if (error) {
        console.error('Error loading recipes:', error);
      } else {
        // Group recipes by meal type
        data.forEach(receita => {
          const transformedReceita = transformSupabaseReceita(receita);
          const mealType = transformedReceita.refeicao;
          
          // Add to both the original key and mapped key if exists
          if (receitasPorRefeicao[mealType]) {
            receitasPorRefeicao[mealType].push(transformedReceita);
          }
          
          // Also add to the mapped key (English/Portuguese equivalent)
          const mappedMealType = mealTypeMap[mealType];
          if (mappedMealType && receitasPorRefeicao[mappedMealType]) {
            receitasPorRefeicao[mappedMealType].push(transformedReceita);
          }
        });
      }

      setReceitas(receitasPorRefeicao);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast.error('Error loading recipes');
    } finally {
      setLoading(false);
    }
  };

  const salvarReceita = async (receita: Receita) => {
    try {
      const { data, error } = await RecipesService.salvarReceita(receita);
      if (error) {
        toast.error('Error saving recipe');
        return;
      }

      // Transform and update local state
      const receitaTransformada = transformSupabaseReceita(data);
      const mealType = receita.refeicao;
      
      setReceitas(prev => {
        const newState = { ...prev };
        
        // Ensure the meal type exists in state
        if (!newState[mealType]) {
          newState[mealType] = [];
        }
        
        // Add to the original meal type
        newState[mealType] = [...newState[mealType], receitaTransformada];
        
        // Also add to the mapped meal type if it exists
        const mappedMealType = mealTypeMap[mealType];
        if (mappedMealType && newState[mappedMealType]) {
          newState[mappedMealType] = [...newState[mappedMealType], receitaTransformada];
        }
        
        return newState;
      });

      toast.success('Recipe saved successfully!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Error saving recipe');
    }
  };

  const toggleFavorito = async (refeicao: string, receitaId: string) => {
    // Find the recipe in the current meal type or its mapped equivalent
    let receita = receitas[refeicao]?.find(r => r.id === receitaId);
    if (!receita) {
      const mappedMealType = mealTypeMap[refeicao];
      if (mappedMealType) {
        receita = receitas[mappedMealType]?.find(r => r.id === receitaId);
      }
    }
    
    if (!receita) return;

    try {
      const { error } = await RecipesService.atualizarReceita(receitaId, {
        favorita: !receita.favorita
      });

      if (error) {
        toast.error('Error updating favorite');
        return;
      }

      // Update state for both meal type and its mapped equivalent
      setReceitas(prev => {
        const newState = { ...prev };
        
        [refeicao, mealTypeMap[refeicao]].forEach(mealType => {
          if (mealType && newState[mealType]) {
            newState[mealType] = newState[mealType].map(r => 
              r.id === receitaId ? { ...r, favorita: !r.favorita } : r
            );
          }
        });
        
        return newState;
      });

      toast.success(receita.favorita ? 'Removed from favorites' : 'Added to favorites!');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error updating favorite');
    }
  };

  const removerReceita = async (refeicao: string, receitaId: string) => {
    try {
      const { error } = await RecipesService.deletarReceita(receitaId);
      if (error) {
        toast.error('Error removing recipe');
        return;
      }

      // Update state for both meal type and its mapped equivalent
      setReceitas(prev => {
        const newState = { ...prev };
        
        [refeicao, mealTypeMap[refeicao]].forEach(mealType => {
          if (mealType && newState[mealType]) {
            newState[mealType] = newState[mealType].filter(r => r.id !== receitaId);
          }
        });
        
        return newState;
      });

      toast.success('Recipe removed!');
    } catch (error) {
      console.error('Error removing recipe:', error);
      toast.error('Error removing recipe');
    }
  };

  useEffect(() => {
    carregarReceitas();
  }, []);

  return {
    receitas,
    loading,
    salvarReceita,
    toggleFavorito,
    removerReceita,
    carregarReceitas
  };
}
