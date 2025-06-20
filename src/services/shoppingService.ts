
import { supabase } from '@/integrations/supabase/client';
import { ItemCompra } from '@/types/receitas';

export class ShoppingService {
  // Helper method to get authenticated user
  private static async getAuthenticatedUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
    if (!user?.email) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  static async salvarItemCompra(item: ItemCompra) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { data, error } = await supabase
        .from('lista_compras')
        .insert({
          item: item.nome,
          quantidade: item.quantidade,
          comprado: item.comprado,
          user_email: user.email
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving shopping item:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      return { data: null, error };
    }
  }

  static async buscarItensCompra() {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { data, error } = await supabase
        .from('lista_compras')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shopping items:', error);
        return { data: [], error };
      }
      
      // Transform database items to frontend format
      const transformedData = (data || []).map(item => ({
        id: item.id,
        nome: item.item,
        quantidade: item.quantidade || "1 unit",
        preco: 0, // Always start with 0.00 for manual editing
        comprado: item.comprado || false,
        categoria: undefined // Will be set by categorization logic
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return { data: [], error };
    }
  }

  static async atualizarItemCompra(id: string, updates: Partial<ItemCompra>) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const updateData: any = {};
      
      if (updates.nome) {
        updateData.item = updates.nome;
      }
      if (updates.quantidade !== undefined) {
        updateData.quantidade = updates.quantidade;
      }
      if (updates.comprado !== undefined) {
        updateData.comprado = updates.comprado;
      }

      const { data, error } = await supabase
        .from('lista_compras')
        .update(updateData)
        .eq('id', id)
        .eq('user_email', user.email)
        .select()
        .single();

      if (error) {
        console.error('Error updating shopping item:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return { data: null, error };
    }
  }

  static async deletarItemCompra(id: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { error } = await supabase
        .from('lista_compras')
        .delete()
        .eq('id', id)
        .eq('user_email', user.email);

      if (error) {
        console.error('Error deleting shopping item:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      return { error };
    }
  }
}
