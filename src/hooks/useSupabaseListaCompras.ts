
import { useState, useEffect } from 'react';
import { ShoppingService } from '@/services/shoppingService';
import { ItemCompra } from '@/types/receitas';
import { toast } from 'sonner';

export function useSupabaseListaCompras() {
  const [itensCompra, setItensCompra] = useState<{ [key: string]: ItemCompra[] }>({
    "Breakfast": [],
    "Lunch": [],
    "Snack": [],
    "Dinner": []
  });
  const [loading, setLoading] = useState(false);

  const carregarItens = async () => {
    setLoading(true);
    try {
      const itensPorRefeicao: { [key: string]: ItemCompra[] } = {
        "Breakfast": [],
        "Lunch": [],
        "Snack": [],
        "Dinner": []
      };

      for (const refeicao of Object.keys(itensPorRefeicao)) {
        const { data, error } = await ShoppingService.buscarItensCompra(refeicao);
        if (error) {
          console.error(`Error loading items for ${refeicao}:`, error);
        } else {
          itensPorRefeicao[refeicao] = data;
        }
      }

      setItensCompra(itensPorRefeicao);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Error loading shopping list');
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = async (refeicao: string, item: ItemCompra) => {
    try {
      const { data, error } = await ShoppingService.salvarItemCompra(item, refeicao);
      if (error) {
        toast.error('Error adding item');
        return;
      }

      // Update local state
      setItensCompra(prev => ({
        ...prev,
        [refeicao]: [...(prev[refeicao] || []), { ...item, id: data?.id || Date.now().toString() }]
      }));

      toast.success('Item added!');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Error adding item');
    }
  };

  const atualizarItem = async (refeicao: string, itemId: string, updates: Partial<ItemCompra>) => {
    try {
      const { error } = await ShoppingService.atualizarItemCompra(itemId, updates);
      if (error) {
        toast.error('Error updating item');
        return;
      }

      // Update local state
      setItensCompra(prev => ({
        ...prev,
        [refeicao]: (prev[refeicao] || []).map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      }));
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Error updating item');
    }
  };

  const removerItem = async (refeicao: string, itemId: string) => {
    try {
      const { error } = await ShoppingService.deletarItemCompra(itemId);
      if (error) {
        toast.error('Error removing item');
        return;
      }

      // Update local state
      setItensCompra(prev => ({
        ...prev,
        [refeicao]: (prev[refeicao] || []).filter(item => item.id !== itemId)
      }));

      toast.success('Item removed!');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error removing item');
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  return {
    itensCompra,
    loading,
    adicionarItem,
    atualizarItem,
    removerItem,
    carregarItens
  };
}
