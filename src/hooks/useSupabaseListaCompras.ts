
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SupabaseService } from '@/services/supabaseService';
import { ItemCompra } from '@/types/receitas';
import { toast } from 'sonner';

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
