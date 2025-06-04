
import { supabase } from '@/integrations/supabase/client';
import { Receita, ItemCompra, PreferenciasUsuario } from '@/types/receitas';

export class SupabaseService {
  // Serviços de Receitas
  static async salvarReceita(receita: Receita) {
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
        usuario_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    return { data, error };
  }

  static async buscarReceitas(refeicao?: string) {
    let query = supabase
      .from('receitas')
      .select('*')
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
  }

  static async atualizarReceita(id: string, updates: Partial<Receita>) {
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
      .select()
      .single();

    return { data, error };
  }

  static async deletarReceita(id: string) {
    const { error } = await supabase
      .from('receitas')
      .delete()
      .eq('id', id);

    return { error };
  }

  // Serviços de Lista de Compras
  static async salvarItemCompra(item: ItemCompra, refeicao: string) {
    const { data, error } = await supabase
      .from('lista_compras')
      .insert({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
        comprado: item.comprado,
        refeicao: refeicao,
        categoria: item.categoria,
        usuario_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    return { data, error };
  }

  static async buscarItensCompra(refeicao?: string) {
    let query = supabase
      .from('lista_compras')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (refeicao) {
      query = query.eq('refeicao', refeicao);
    }

    const { data, error } = await query;
    return { data: data || [], error };
  }

  static async atualizarItemCompra(id: string, updates: Partial<ItemCompra>) {
    const { data, error } = await supabase
      .from('lista_compras')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  static async deletarItemCompra(id: string) {
    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('id', id);

    return { error };
  }

  // Serviços de Ingredientes
  static async salvarIngredientes(ingredientes: any[], refeicao: string) {
    const ingredientesData = ingredientes.map(ing => ({
      nome: ing.nome,
      selecionado: ing.selecionado,
      refeicao: refeicao,
      usuario_id: null // Será preenchido pelo trigger
    }));

    const { data, error } = await supabase
      .from('ingredientes')
      .upsert(ingredientesData, { 
        onConflict: 'usuario_id,nome,refeicao',
        ignoreDuplicates: false 
      })
      .select();

    return { data, error };
  }

  static async buscarIngredientes(refeicao?: string) {
    let query = supabase
      .from('ingredientes')
      .select('*');

    if (refeicao) {
      query = query.eq('refeicao', refeicao);
    }

    const { data, error } = await query;
    return { data: data || [], error };
  }

  // Serviços de Preferências
  static async salvarPreferencias(preferencias: PreferenciasUsuario) {
    const { data, error } = await supabase
      .from('preferencias_usuario')
      .upsert({
        objetivo: preferencias.objetivo,
        alimentares: preferencias.alimentares,
        restricoes: preferencias.restricoes,
        usuario_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    return { data, error };
  }

  static async buscarPreferencias() {
    const { data, error } = await supabase
      .from('preferencias_usuario')
      .select('*')
      .single();

    return { data, error };
  }
}
