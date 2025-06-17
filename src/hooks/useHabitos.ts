
import { useState, useEffect } from 'react';
import { HabitosService } from '@/services/habitosService';
import { toast } from 'sonner';

// Atualizada para corresponder ao schema atual
interface Habito {
  id: string;
  user_email: string;
  nome: string;
  descricao?: string;
  meta_diaria: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface HistoricoSemanalItem {
  data: string;
  concluido: boolean;
}

export function useHabitos() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [historicoHoje, setHistoricoHoje] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarHabitos = async () => {
    setLoading(true);
    console.log('🔍 useHabitos: Carregando dados de hábitos...');
    
    try {
      const [habitosRes, historicoRes] = await Promise.all([
        HabitosService.buscarHabitos(),
        HabitosService.buscarHistoricoHoje()
      ]);

      console.log('📊 useHabitos: Resultado hábitos:', { 
        success: !habitosRes.error, 
        dataLength: habitosRes.data?.length || 0 
      });
      
      console.log('📊 useHabitos: Resultado histórico:', { 
        success: !historicoRes.error, 
        dataLength: historicoRes.data?.length || 0 
      });

      if (habitosRes.error) {
        console.error('❌ useHabitos: Erro ao carregar hábitos:', habitosRes.error);
        toast.error('Erro ao carregar hábitos');
        setHabitos([]);
      } else {
        setHabitos(habitosRes.data || []);
        console.log('✅ useHabitos: Hábitos carregados:', habitosRes.data?.length || 0);
      }

      if (historicoRes.error) {
        console.error('❌ useHabitos: Erro ao carregar histórico:', historicoRes.error);
        setHistoricoHoje([]);
      } else {
        setHistoricoHoje(historicoRes.data || []);
        console.log('✅ useHabitos: Histórico carregado:', historicoRes.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ useHabitos: Erro inesperado ao carregar dados:', error);
      toast.error('Erro ao carregar dados dos hábitos');
      setHabitos([]);
      setHistoricoHoje([]);
    } finally {
      setLoading(false);
    }
  };

  const marcarHabito = async (habitoId: string, concluido: boolean) => {
    try {
      console.log('💾 useHabitos: Marcando hábito:', habitoId, 'como', concluido ? 'concluído' : 'pendente');
      
      const { error } = await HabitosService.marcarHabitoCompleto(habitoId, concluido);

      if (error) {
        console.error('❌ useHabitos: Erro ao marcar hábito:', error);
        toast.error('Erro ao atualizar hábito');
        return;
      }

      // Recarregar dados após sucesso
      await carregarHabitos();
      toast.success(concluido ? 'Hábito marcado como concluído!' : 'Hábito desmarcado');
    } catch (error) {
      console.error('❌ useHabitos: Erro inesperado ao marcar hábito:', error);
      toast.error('Erro ao atualizar hábito');
    }
  };

  const getHabitosHoje = () => {
    return habitos.map(habito => {
      const historico = historicoHoje.find(h => h.habito_id === habito.id);
      return {
        id: habito.id,
        nome: habito.nome,
        descricao: habito.descricao,
        concluido: historico?.concluido || false,
        meta_diaria: habito.meta_diaria
      };
    });
  };

  const getHistoricoSemanal = async () => {
    try {
      const { data, error } = await HabitosService.buscarProgressoSemanal();

      if (error || !data) {
        console.error('❌ useHabitos: Erro ao buscar histórico semanal:', error);
        return [];
      }

      const groupedByDate = (data as HistoricoSemanalItem[]).reduce(
        (acc, item) => {
          const dataStr = item.data;
          if (!acc[dataStr]) {
            acc[dataStr] = { total: 0, completed: 0 };
          }
          acc[dataStr].total += 1;
          if (item.concluido) {
            acc[dataStr].completed += 1;
          }
          return acc;
        },
        {} as Record<string, { total: number; completed: number }>
      );

      return Object.entries(groupedByDate).map(([date, stats]) => {
        const { total, completed } = stats;
        return {
          date,
          percentual: total > 0 ? (completed / total) * 100 : 0
        };
      });
    } catch (error) {
      console.error('❌ useHabitos: Erro ao buscar histórico semanal:', error);
      return [];
    }
  };

  const getProgressoHabitos = () => {
    const habitosHoje = getHabitosHoje();
    const concluidos = habitosHoje.filter(h => h.concluido).length;
    const total = habitosHoje.length;
    const percentual = total > 0 ? (concluidos / total) * 100 : 0;

    // Calcular streak simples (se 100% hoje = streak de 1)
    const streakAtual = percentual === 100 ? 1 : 0;
    const melhorStreak = streakAtual;

    return {
      concluidos,
      total,
      percentual,
      streakAtual,
      melhorStreak
    };
  };

  useEffect(() => {
    carregarHabitos();
  }, []);

  return {
    habitos,
    historicoHoje,
    loading,
    carregarHabitos,
    marcarHabito,
    getHabitosHoje,
    getProgressoHabitos,
    getHistoricoSemanal
  };
}
