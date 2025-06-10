import { supabase } from '@/integrations/supabase/client';
import { Receita, ItemCompra, PreferenciasUsuario } from '@/types/receitas';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export class SupabaseService {
  // Recipe Services - Updated to match database schema
  static async salvarReceita(receita: Receita) {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .insert({
          nome: receita.nome,
          tempo_preparo: receita.tempo, // Map tempo to tempo_preparo
          calorias: receita.calorias,
          ingredientes: receita.ingredientes,
          instrucoes: receita.preparo?.join('\n') || '', // Map preparo array to instrucoes string
          usuario_id: DEFAULT_USER_ID
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      return { data: null, error };
    }
  }

  static async buscarReceitas(refeicao?: string) {
    try {
      let query = supabase
        .from('receitas')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (data) {
        return {
          data: data.map(item => ({
            id: item.id,
            nome: item.nome,
            tempo: item.tempo_preparo || 30, // Map tempo_preparo back to tempo
            calorias: item.calorias || 300,
            refeicao: refeicao || 'Almoço', // Default refeicao since it's not in DB
            ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
            preparo: item.instrucoes ? item.instrucoes.split('\n') : [], // Map instrucoes back to preparo array
            macros: {
              proteinas: 25, // Default values since not in current DB schema
              carboidratos: 30,
              gorduras: 15
            },
            favorita: false // Default since not in current DB schema
          })),
          error
        };
      }

      return { data: [], error };
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      return { data: [], error };
    }
  }

  static async atualizarReceita(id: string, updates: Partial<Receita>) {
    try {
      const updateData: any = { ...updates };
      
      // Map frontend fields to database fields
      if (updates.tempo) {
        updateData.tempo_preparo = updates.tempo;
        delete updateData.tempo;
      }
      
      if (updates.preparo) {
        updateData.instrucoes = updates.preparo.join('\n');
        delete updateData.preparo;
      }

      // Remove fields that don't exist in database
      delete updateData.refeicao;
      delete updateData.macros;
      delete updateData.favorita;

      const { data, error } = await supabase
        .from('receitas')
        .update(updateData)
        .eq('id', id)
        .eq('usuario_id', DEFAULT_USER_ID)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      return { data: null, error };
    }
  }

  static async deletarReceita(id: string) {
    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)
        .eq('usuario_id', DEFAULT_USER_ID);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      return { error };
    }
  }

  // Shopping List Services - Updated to match database schema
  static async salvarItemCompra(item: ItemCompra, refeicao: string) {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .insert({
          item: item.nome, // Map nome to item
          quantidade: item.quantidade,
          comprado: item.comprado,
          usuario_id: DEFAULT_USER_ID
          // Note: preco, categoria, refeicao don't exist in current DB schema
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      return { data: null, error };
    }
  }

  static async buscarItensCompra(refeicao?: string) {
    try {
      let query = supabase
        .from('lista_compras')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      // Transform database items to frontend format
      const transformedData = (data || []).map(item => ({
        id: item.id,
        nome: item.item, // Map item back to nome
        quantidade: item.quantidade || "1 unit",
        preco: 5, // Default price since not in DB
        comprado: item.comprado || false,
        categoria: undefined // Not in current DB schema
      }));

      return { data: transformedData, error };
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return { data: [], error };
    }
  }

  static async atualizarItemCompra(id: string, updates: Partial<ItemCompra>) {
    try {
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
        .eq('usuario_id', DEFAULT_USER_ID)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return { data: null, error };
    }
  }

  static async deletarItemCompra(id: string) {
    try {
      const { error } = await supabase
        .from('lista_compras')
        .delete()
        .eq('id', id)
        .eq('usuario_id', DEFAULT_USER_ID);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      return { error };
    }
  }

  // Ingredients Services - Updated to match database schema
  static async salvarIngredientes(ingredientes: any[], refeicao: string) {
    try {
      const ingredientesData = ingredientes.map(ing => ({
        nome: ing.nome,
        categoria: ing.categoria || null,
        usuario_id: DEFAULT_USER_ID
        // Note: selecionado, refeicao don't exist in current DB schema
      }));

      const { data, error } = await supabase
        .from('ingredientes')
        .upsert(ingredientesData, { 
          onConflict: 'usuario_id,nome',
          ignoreDuplicates: false 
        })
        .select();

      return { data, error };
    } catch (error) {
      console.error('Erro ao salvar ingredientes:', error);
      return { data: null, error };
    }
  }

  static async buscarIngredientes(refeicao?: string) {
    try {
      let query = supabase
        .from('ingredientes')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID);

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
      return { data: [], error };
    }
  }

  // Preferences Services
  static async salvarPreferencias(preferencias: PreferenciasUsuario) {
    try {
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .upsert({
          objetivo: preferencias.objetivo,
          preferencias_alimentares: preferencias.alimentares,
          restricoes_alimentares: preferencias.restricoes,
          usuario_id: DEFAULT_USER_ID
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      return { data: null, error };
    }
  }

  static async buscarPreferencias() {
    try {
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      return { data: null, error };
    }
  }

  // User Profile Services
  static async buscarPerfilUsuario() {
    try {
      const { data, error } = await supabase
        .from('perfil_usuario')
        .select('*')
        .eq('usuario_id', DEFAULT_USER_ID)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return { data: null, error };
    }
  }

  static async atualizarPerfilUsuario(updates: any) {
    try {
      const { data, error } = await supabase
        .from('perfil_usuario')
        .update(updates)
        .eq('usuario_id', DEFAULT_USER_ID)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    }
  }
}
