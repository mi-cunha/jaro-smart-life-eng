
import { useState, useEffect } from 'react';
import { ShoppingService } from '@/services/shoppingService';
import { ItemCompra } from '@/types/receitas';
import { toast } from 'sonner';

export function useSupabaseListaCompras() {
  const [itensCompra, setItensCompra] = useState<ItemCompra[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarItens = async () => {
    setLoading(true);
    try {
      const { data, error } = await ShoppingService.buscarItensCompra();
      if (error) {
        console.error('Error loading items:', error);
        toast.error('Error loading shopping list');
      } else {
        setItensCompra(data);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Error loading shopping list');
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = async (item: ItemCompra) => {
    try {
      const { data, error } = await ShoppingService.salvarItemCompra(item);
      if (error) {
        toast.error('Error adding item');
        return;
      }

      // Update local state
      setItensCompra(prev => [...prev, { ...item, id: data?.id || Date.now().toString() }]);
      toast.success('Item added!');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Error adding item');
    }
  };

  const adicionarItensLote = async (itens: ItemCompra[]) => {
    try {
      for (const item of itens) {
        const { data, error } = await ShoppingService.salvarItemCompra(item);
        if (!error && data) {
          setItensCompra(prev => [...prev, { ...item, id: data.id }]);
        }
      }
      toast.success(`${itens.length} items added to shopping list!`);
    } catch (error) {
      console.error('Error adding items in batch:', error);
      toast.error('Error adding items');
    }
  };

  const atualizarItem = async (itemId: string, updates: Partial<ItemCompra>) => {
    try {
      const { error } = await ShoppingService.atualizarItemCompra(itemId, updates);
      if (error) {
        toast.error('Error updating item');
        return;
      }

      // Update local state
      setItensCompra(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Error updating item');
    }
  };

  const removerItem = async (itemId: string) => {
    try {
      const { error } = await ShoppingService.deletarItemCompra(itemId);
      if (error) {
        toast.error('Error removing item');
        return;
      }

      // Update local state
      setItensCompra(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed!');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error removing item');
    }
  };

  const limparLista = async () => {
    try {
      for (const item of itensCompra) {
        await ShoppingService.deletarItemCompra(item.id);
      }
      setItensCompra([]);
      toast.success('Shopping list cleared!');
    } catch (error) {
      console.error('Error clearing list:', error);
      toast.error('Error clearing list');
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  return {
    itensCompra,
    loading,
    adicionarItem,
    adicionarItensLote,
    atualizarItem,
    removerItem,
    limparLista,
    carregarItens
  };
}
