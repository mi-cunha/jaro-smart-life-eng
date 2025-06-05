import { supabase } from '@/integrations/supabase/client';
import { Receita, ItemCompra, PreferenciasUsuario } from '@/types/receitas';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export class SupabaseService {
  // Serviços de Receitas
  static async salvarReceita(receita: Receita) {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .insert({
          nome: receita.nome,
          tempo: receita.tempo,
          calorias: receita.calorias,
          refeicao: receita.refeicao,
          ingredientes: receita.ingredientes,
          preparo: receita.preparo,
          proteinas: receita.macros.proteinas,
          carboidratos: receita.macros.carboidratos,
          gorduras: receita.macros.gorduras,
          favorita: receita.favorita,
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
        .order('data_criacao', { ascending: false });

      if (refeicao) {
        query = query.eq('refeicao', refeicao);
      }

      const { data, error } = await query;
      
      if (data) {
        return {
          data: data.map(item => ({
            id: item.id,
            nome: item.nome,
            tempo: item.tempo,
            calorias: item.calorias,
            refeicao: item.refeicao,
            ingredientes: item.ingredientes,
            preparo: item.preparo,
            macros: {
              proteinas: item.proteinas,
              carboidratos: item.carboidratos,
              gorduras: item.gorduras
            },
            favorita: item.favorita
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
      
      if (updates.macros) {
        updateData.proteinas = updates.macros.proteinas;
        updateData.carboidratos = updates.macros.carboidratos;
        updateData.gorduras = updates.macros.gorduras;
        delete updateData.macros;
      }

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

  // Serviços de Lista de Compras
  static async salvarItemCompra(item: ItemCompra, refeicao: string) {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .insert({
          nome: item.nome,
          quantidade: item.quantidade,
          preco: item.preco,
          comprado: item.comprado,
          refeicao: refeicao,
          categoria: item.categoria,
          usuario_id: DEFAULT_USER_ID
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
        .order('data_criacao', { ascending: false });

      if (refeicao) {
        query = query.eq('refeicao', refeicao);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return { data: [], error };
    }
  }

  static async atualizarItemCompra(id: string, updates: Partial<ItemCompra>) {
    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .update(updates)
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

  // Serviços de Ingredientes
  static async salvarIngredientes(ingredientes: any[], refeicao: string) {
    try {
      const ingredientesData = ingredientes.map(ing => ({
        nome: ing.nome,
        selecionado: ing.selecionado,
        refeicao: refeicao,
        usuario_id: DEFAULT_USER_ID
      }));

      const { data, error } = await supabase
        .from('ingredientes')
        .upsert(ingredientesData, { 
          onConflict: 'usuario_id,nome,refeicao',
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

      if (refeicao) {
        query = query.eq('refeicao', refeicao);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
      return { data: [], error };
    }
  }

  // Serviços de Preferências
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

  // Serviços de Perfil do Usuário
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
