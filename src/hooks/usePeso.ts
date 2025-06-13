
import { useState, useEffect } from 'react';
import { PesoService, HistoricoPeso } from '@/services/pesoService';
import { PerfilService } from '@/services/perfilService';
import { toast } from 'sonner';

export function usePeso() {
  const [historicoPeso, setHistoricoPeso] = useState<HistoricoPeso[]>([]);
  const [pesoAtual, setPesoAtual] = useState<number | null>(null);
  const [pesoMeta, setPesoMeta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [historicoRes, perfilRes] = await Promise.all([
        PesoService.buscarHistoricoPeso(30), // últimos 30 registros
        PerfilService.buscarPerfil()
      ]);

      if (historicoRes.error) {
        console.error('Erro ao carregar histórico de peso:', historicoRes.error);
      } else {
        setHistoricoPeso(historicoRes.data);
        // Usar o peso mais recente do histórico como peso atual
        if (historicoRes.data.length > 0) {
          setPesoAtual(historicoRes.data[0].peso);
        }
      }

      if (perfilRes.error) {
        console.error('Erro ao carregar perfil:', perfilRes.error);
      } else if (perfilRes.data) {
        setPesoMeta(perfilRes.data.meta_peso);
        // Se não há histórico, usar peso_atual do perfil
        if (historicoRes.data.length === 0 && perfilRes.data.peso_atual) {
          setPesoAtual(perfilRes.data.peso_atual);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de peso:', error);
      toast.error('Error loading weight data');
    } finally {
      setLoading(false);
    }
  };

  const adicionarPeso = async (peso: number, observacoes?: string) => {
    try {
      const { error } = await PesoService.adicionarPeso(peso, observacoes);
      
      if (error) {
        toast.error('Error adding weight record');
        return;
      }

      await carregarDados();
      toast.success('Weight record added successfully!');
    } catch (error) {
      console.error('Erro ao adicionar peso:', error);
      toast.error('Error adding weight record');
    }
  };

  const getProgressoPeso = () => {
    if (!pesoAtual || !pesoMeta) return 0;
    
    // Assumindo que o objetivo é perder peso (peso inicial maior que meta)
    const pesoInicial = historicoPeso.length > 0 ? historicoPeso[historicoPeso.length - 1].peso : pesoAtual;
    const progressoTotal = pesoInicial - pesoMeta;
    const progressoAtual = pesoInicial - pesoAtual;
    
    return progressoTotal > 0 ? Math.max(0, Math.min(100, (progressoAtual / progressoTotal) * 100)) : 0;
  };

  const getDadosGrafico = () => {
    return historicoPeso
      .slice()
      .reverse()
      .map(registro => ({
        date: new Date(registro.data).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: registro.peso
      }));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return {
    historicoPeso,
    pesoAtual,
    pesoMeta,
    loading,
    carregarDados,
    adicionarPeso,
    getProgressoPeso,
    getDadosGrafico
  };
}
