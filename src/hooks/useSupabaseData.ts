
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabaseService';
import { Receita, ItemCompra } from '@/types/receitas';
import { toast } from 'sonner';

export function useSupabaseReceitas() {
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<{ [key: string]: Receita[] }>({
    "Café da Manhã": [],
    "Almoço": [],
    "Lanche": [],
    "Jantar": []
  });
  const [loading, setLoading] = useState(false);

  const carregarReceitas = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const receitasPorRefeicao: { [key: string]: Receita[] } = {
        "Café da Manhã": [],
        "Almoço": [],
        "Lanche": [],
        "Jantar": []
      };

      for (const refeicao of Object.keys(receitasPorRefeicao)) {
        const { data, error } = await SupabaseService.buscarReceitas(refeicao);
        if (error) {
          console.error(`Erro ao carregar receitas de ${refeicao}:`, error);
        } else {
          receitasPorRefeicao[refeicao] = data;
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
    if (!user) return;

    try {
      const { data, error } = await SupabaseService.salvarReceita(receita);
      if (error) {
        toast.error('Erro ao salvar receita');
        return;
      }

      // Atualizar estado local
      setReceitas(prev => ({
        ...prev,
        [receita.refeicao]: [...prev[receita.refeicao], data]
      }));

      toast.success('Receita salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
    }
  };

  const toggleFavorito = async (refeicao: string, receitaId: string) => {
    if (!user) return;

    const receita = receitas[refeicao].find(r => r.id === receitaId);
    if (!receita) return;

    try {
      const { error } = await SupabaseService.atualizarReceita(receitaId, {
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
    if (!user) return;

    try {
      const { error } = await SupabaseService.deletarReceita(receitaId);
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
    if (user) {
      carregarReceitas();
    }
  }, [user]);

  return {
    receitas,
    loading,
    salvarReceita,
    toggleFavorito,
    removerReceita,
    carregarReceitas
  };
}

export function useSupabaseListaCompras() {
  const { user } = useAuth();
  const [itensCompra, setItensCompra] = useState<{ [key: string]: ItemCompra[] }>({
    "Café da Manhã": [],
    "Almoço": [],
    "Lanche": [],
    "Jantar": []
  });
  const [loading, setLoading] = useState(false);

  const carregarItens = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const itensPorRefeicao: { [key: string]: ItemCompra[] } = {
        "Café da Manhã": [],
        "Almoço": [],
        "Lanche": [],
        "Jantar": []
      };

      for (const refeicao of Object.keys(itensPorRefeicao)) {
        const { data, error } = await SupabaseService.buscarItensCompra(refeicao);
        if (error) {
          console.error(`Erro ao carregar itens de ${refeicao}:`, error);
        } else {
          itensPorRefeicao[refeicao] = data;
        }
      }

      setItensCompra(itensPorRefeicao);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar lista de compras');
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = async (refeicao: string, item: ItemCompra) => {
    if (!user) return;

    try {
      const { data, error } = await SupabaseService.salvarItemCompra(item, refeicao);
      if (error) {
        toast.error('Erro ao adicionar item');
        return;
      }

      // Atualizar estado local
      setItensCompra(prev => ({
        ...prev,
        [refeicao]: [...prev[refeicao], data]
      }));

      toast.success('Item adicionado!');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const atualizarItem = async (refeicao: string, itemId: string, updates: Partial<ItemCompra>) => {
    if (!user) return;

    try {
      const { error } = await SupabaseService.atualizarItemCompra(itemId, updates);
      if (error) {
        toast.error('Erro ao atualizar item');
        return;
      }

      // Atualizar estado local
      setItensCompra(prev => ({
        ...prev,
        [refeicao]: prev[refeicao].map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      }));
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const removerItem = async (refeicao: string, itemId: string) => {
    if (!user) return;

    try {
      const { error } = await SupabaseService.deletarItemCompra(itemId);
      if (error) {
        toast.error('Erro ao remover item');
        return;
      }

      // Atualizar estado local
      setItensCompra(prev => ({
        ...prev,
        [refeicao]: prev[refeicao].filter(item => item.id !== itemId)
      }));

      toast.success('Item removido!');
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item');
    }
  };

  useEffect(() => {
    if (user) {
      carregarItens();
    }
  }, [user]);

  return {
    itensCompra,
    loading,
    adicionarItem,
    atualizarItem,
    removerItem,
    carregarItens
  };
}
