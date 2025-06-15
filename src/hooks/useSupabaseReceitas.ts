
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

export function useSupabaseReceitas() {
  const [receitas, setReceitas] = useState<{ [key: string]: Receita[] }>({
    "Café da Manhã": [],
    "Almoço": [],
    "Lanche": [],
    "Jantar": []
  });
  const [loading, setLoading] = useState(false);

  const carregarReceitas = async () => {
    setLoading(true);
    try {
      const receitasPorRefeicao: { [key: string]: Receita[] } = {
        "Café da Manhã": [],
        "Almoço": [],
        "Lanche": [],
        "Jantar": []
      };

      for (const refeicao of Object.keys(receitasPorRefeicao)) {
        const { data, error } = await RecipesService.buscarReceitas(refeicao);
        if (error) {
          console.error(`Erro ao carregar receitas de ${refeicao}:`, error);
        } else {
          receitasPorRefeicao[refeicao] = data.map(transformSupabaseReceita);
        }
      }

      setReceitas(receitasPorRefeicao);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  const salvarReceita = async (receita: Receita) => {
    try {
      const { data, error } = await RecipesService.salvarReceita(receita);
      if (error) {
        toast.error('Erro ao salvar receita');
        return;
      }

      // Transform and update local state
      const receitaTransformada = transformSupabaseReceita(data);
      setReceitas(prev => ({
        ...prev,
        [receita.refeicao]: [...prev[receita.refeicao], receitaTransformada]
      }));

      toast.success('Receita salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
    }
  };

  const toggleFavorito = async (refeicao: string, receitaId: string) => {
    const receita = receitas[refeicao].find(r => r.id === receitaId);
    if (!receita) return;

    try {
      const { error } = await RecipesService.atualizarReceita(receitaId, {
        favorita: !receita.favorita
      });

      if (error) {
        toast.error('Erro ao atualizar favorito');
        return;
      }

      // Atualizar estado local
      setReceitas(prev => ({
        ...prev,
        [refeicao]: prev[refeicao].map(r => 
          r.id === receitaId ? { ...r, favorita: !r.favorita } : r
        )
      }));

      toast.success(receita.favorita ? 'Removido dos favoritos' : 'Adicionado aos favoritos!');
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      toast.error('Erro ao atualizar favorito');
    }
  };

  const removerReceita = async (refeicao: string, receitaId: string) => {
    try {
      const { error } = await RecipesService.deletarReceita(receitaId);
      if (error) {
        toast.error('Erro ao remover receita');
        return;
      }

      // Atualizar estado local
      setReceitas(prev => ({
        ...prev,
        [refeicao]: prev[refeicao].filter(r => r.id !== receitaId)
      }));

      toast.success('Receita removida!');
    } catch (error) {
      console.error('Erro ao remover receita:', error);
      toast.error('Erro ao remover receita');
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
