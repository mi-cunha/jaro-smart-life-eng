
import { supabase } from '@/integrations/supabase/client';

export interface Habito {
  id: string;
  user_email: string;
  nome: string;
  descricao?: string;
  meta_diaria: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface HistoricoHabito {
  id: string;
  user_email: string;
  habito_id: string;
  data: string;
  concluido: boolean;
  quantidade: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export class HabitosService {
  static async criarHabitosPadrao() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      console.log('🌟 Criando hábitos padrão para:', user.email);

      const habitosPadrao = [
        { nome: 'Chá Jaro', descricao: 'Tomar chá verde para acelerar metabolismo', meta_diaria: 2 },
        { nome: 'Beber água suficiente', descricao: 'Beber pelo menos 2L de água por dia', meta_diaria: 8 },
        { nome: 'Healthy Eating', descricao: 'Seguir plano alimentar saudável', meta_diaria: 1 },
        { nome: 'Exercise', descricao: 'Fazer pelo menos 30min de exercício', meta_diaria: 1 },
        { nome: 'Quality Sleep', descricao: 'Dormir pelo menos 7 horas', meta_diaria: 1 }
      ];

      const habitosData = habitosPadrao.map(habito => ({
        user_email: user.email,
        nome: habito.nome,
        descricao: habito.descricao,
        meta_diaria: habito.meta_diaria,
        ativo: true
      }));

      const { data, error } = await supabase
        .from('habitos')
        .upsert(habitosData, { 
          onConflict: 'user_email,nome',
          ignoreDuplicates: true 
        })
        .select();

      if (error) {
        console.error('❌ Erro ao criar hábitos padrão:', error);
        return { data: null, error };
      }

      console.log('✅ Hábitos padrão criados:', data?.length);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao criar hábitos padrão:', error);
      return { data: null, error };
    }
  }

  static async buscarHabitos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: [], error: new Error('User not authenticated') };
      }

      console.log('🔍 Buscando hábitos para:', user.email);

      const { data, error } = await supabase
        .from('habitos')
        .select('*')
        .eq('user_email', user.email)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar hábitos:', error);
        return { data: [], error };
      }

      // Se não há hábitos, criar os padrão
      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum hábito encontrado, criando padrão...');
        await this.criarHabitosPadrao();
        
        // Buscar novamente após criar os padrão
        const { data: newData, error: newError } = await supabase
          .from('habitos')
          .select('*')
          .eq('user_email', user.email)
          .eq('ativo', true)
          .order('created_at', { ascending: false });

        return { data: newData || [], error: newError };
      }

      console.log('✅ Hábitos encontrados:', data.length);
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar hábitos:', error);
      return { data: [], error };
    }
  }

  static async buscarHistoricoHoje() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: [], error: new Error('User not authenticated') };
      }

      const hoje = new Date().toISOString().split('T')[0];
      console.log('🔍 Buscando histórico de hoje:', hoje, 'para:', user.email);

      const { data, error } = await supabase
        .from('historico_habitos')
        .select('*')
        .eq('user_email', user.email)
        .eq('data', hoje);

      if (error) {
        console.error('❌ Erro ao buscar histórico de hoje:', error);
        return { data: [], error };
      }

      console.log('✅ Histórico de hoje encontrado:', data?.length || 0, 'registros');
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar histórico de hoje:', error);
      return { data: [], error };
    }
  }

  static async buscarProgressoSemanal() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: [], error: new Error('User not authenticated') };
      }

      const hoje = new Date();
      const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('historico_habitos')
        .select('data, concluido')
        .eq('user_email', user.email)
        .gte('data', seteDiasAtras.toISOString().split('T')[0])
        .lte('data', hoje.toISOString().split('T')[0])
        .order('data', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar progresso semanal:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar progresso semanal:', error);
      return { data: [], error };
    }
  }

  static async marcarHabitoCompleto(habitoId: string, concluido: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const hoje = new Date().toISOString().split('T')[0];
      console.log('💾 Marcando hábito:', habitoId, 'como', concluido ? 'concluído' : 'pendente');

      // Primeiro, tentar atualizar registro existente
      const { data: existing } = await supabase
        .from('historico_habitos')
        .select('id')
        .eq('user_email', user.email)
        .eq('habito_id', habitoId)
        .eq('data', hoje)
        .single();

      if (existing) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('historico_habitos')
          .update({ 
            concluido, 
            quantidade: concluido ? 1 : 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar histórico:', error);
          return { data: null, error };
        }

        console.log('✅ Histórico atualizado:', data);
        return { data, error: null };
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('historico_habitos')
          .insert({
            user_email: user.email,
            habito_id: habitoId,
            data: hoje,
            concluido,
            quantidade: concluido ? 1 : 0
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao criar histórico:', error);
          return { data: null, error };
        }

        console.log('✅ Histórico criado:', data);
        return { data, error: null };
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao marcar hábito:', error);
      return { data: null, error };
    }
  }

  static async criarHabito(nome: string, descricao?: string, metaDiaria: number = 1) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('habitos')
        .insert({
          user_email: user.email,
          nome,
          descricao,
          meta_diaria: metaDiaria,
          ativo: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar hábito:', error);
        return { data: null, error };
      }

      console.log('✅ Hábito criado:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao criar hábito:', error);
      return { data: null, error };
    }
  }
}
