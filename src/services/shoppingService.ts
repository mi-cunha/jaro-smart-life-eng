
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

  static async salvarItemCompra(item: ItemCompra, refeicao: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      const { data, error } = await supabase
        .from('lista_compras')
        .insert({
          item: item.nome, // Map nome to item
          quantidade: item.quantidade,
          comprado: item.comprado,
          user_email: user.email
          // Note: preco, categoria, refeicao don't exist in current DB schema
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

  static async buscarItensCompra(refeicao?: string) {
    try {
      const user = await this.getAuthenticatedUser();
      
      let query = supabase
        .from('lista_compras')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching shopping items:', error);
        return { data: [], error };
      }
      
      // Transform database items to frontend format
      const transformedData = (data || []).map(item => ({
        id: item.id,
        nome: item.item, // Map item back to nome
        quantidade: item.quantidade || "1 unit",
        preco: 5, // Default price since not in DB
        comprado: item.comprado || false,
        categoria: undefined // Not in current DB schema
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
      
      // Map frontend fields to database fields
      if (updates.nome) {
        updateData.item = updates.nome;
      }
      if (updates.quantidade !== undefined) {
        updateData.quantidade = updates.quantidade;
      }
      if (updates.comprado !== undefined) {
        updateData.comprado = updates.comprado;
      }
      
      // Skip fields that don't exist in database
      // preco, categoria are not in current schema

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
