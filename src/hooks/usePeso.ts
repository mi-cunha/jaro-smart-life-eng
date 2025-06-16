
import { useState, useEffect } from 'react';
import { PesoService } from '@/services/pesoService';
import { PerfilService } from '@/services/perfilService';
import { toast } from 'sonner';

// Atualizada para corresponder ao schema atual
interface HistoricoPeso {
  id: string;
  user_email: string;
  peso: number;
  data: string;
  observacoes?: string;
  created_at: string;
}

export function usePeso() {
  const [historicoPeso, setHistoricoPeso] = useState<HistoricoPeso[]>([]);
  const [pesoAtual, setPesoAtual] = useState<number | null>(null);
  const [pesoMeta, setPesoMeta] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [historicoRes, perfilRes] = await Promise.all([
        PesoService.buscarHistoricoPeso(30),
        PerfilService.buscarPerfil()
      ]);

      if (historicoRes.error) {
        console.error('Erro ao carregar histórico de peso:', historicoRes.error);
      } else {
        setHistoricoPeso(historicoRes.data);
        if (historicoRes.data.length > 0) {
          setPesoAtual(historicoRes.data[0].peso);
        }
      }

      if (perfilRes.error) {
        console.error('Erro ao carregar perfil:', perfilRes.error);
        setPesoMeta(70.0);
        if (historicoRes.data.length === 0) {
          setPesoAtual(78.0);
        }
      } else if (perfilRes.data) {
        setPesoMeta(perfilRes.data.meta_peso || 70.0);
        if (historicoRes.data.length === 0 && perfilRes.data.peso_atual) {
          setPesoAtual(perfilRes.data.peso_atual);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de peso:', error);
      toast.error('Error loading weight data');
      setPesoAtual(78.0);
      setPesoMeta(70.0);
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
