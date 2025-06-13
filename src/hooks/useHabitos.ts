
import { useState, useEffect } from 'react';
import { HabitosService, Habito } from '@/services/habitosService';
import { toast } from 'sonner';

export function useHabitos() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [historicoHoje, setHistoricoHoje] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarHabitos = async () => {
    setLoading(true);
    try {
      const [habitosRes, historicoRes] = await Promise.all([
        HabitosService.buscarHabitos(),
        HabitosService.buscarHistoricoHoje()
      ]);

      if (habitosRes.error) {
        console.error('Erro ao carregar hábitos:', habitosRes.error);
      } else {
        setHabitos(habitosRes.data);
      }

      if (historicoRes.error) {
        console.error('Erro ao carregar histórico:', historicoRes.error);
      } else {
        setHistoricoHoje(historicoRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos hábitos:', error);
      toast.error('Error loading habits data');
    } finally {
      setLoading(false);
    }
  };

  const marcarHabito = async (habitoId: string, concluido: boolean) => {
    try {
      const { error } = await HabitosService.marcarHabitoCompleto(habitoId, concluido);
      
      if (error) {
        toast.error('Error updating habit');
        return;
      }

      // Recarregar dados
      await carregarHabitos();
      toast.success(concluido ? 'Habit completed!' : 'Habit marked as pending');
    } catch (error) {
      console.error('Erro ao marcar hábito:', error);
      toast.error('Error updating habit');
    }
  };

  const getHabitosHoje = () => {
    return habitos.map(habito => {
      const historico = historicoHoje.find(h => h.habito_id === habito.id);
      return {
        id: habito.id,
        nome: habito.nome,
        concluido: historico?.concluido || false,
        meta_diaria: habito.meta_diaria
      };
    });
  };

  const getProgressoHabitos = () => {
    const habitosHoje = getHabitosHoje();
    const concluidos = habitosHoje.filter(h => h.concluido).length;
    const total = habitosHoje.length;
    return { concluidos, total, percentual: total > 0 ? (concluidos / total) * 100 : 0 };
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
    getProgressoHabitos
  };
}
