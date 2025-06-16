
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
    console.log('🔍 Loading weight data...');
    
    try {
      const [historicoRes, perfilRes] = await Promise.all([
        PesoService.buscarHistoricoPeso(30),
        PerfilService.buscarPerfil()
      ]);

      console.log('📊 Weight history result:', { 
        success: !historicoRes.error, 
        dataLength: historicoRes.data?.length || 0 
      });
      console.log('👤 Profile result:', { 
        success: !perfilRes.error, 
        hasData: !!perfilRes.data 
      });

      if (historicoRes.error) {
        console.error('❌ Error loading weight history:', historicoRes.error);
        setHistoricoPeso([]);
      } else {
        setHistoricoPeso(historicoRes.data || []);
        if (historicoRes.data && historicoRes.data.length > 0) {
          const latestWeight = historicoRes.data[0].peso;
          setPesoAtual(latestWeight);
          console.log('✅ Current weight set from history:', latestWeight);
        }
      }

      if (perfilRes.error) {
        console.error('❌ Error loading profile:', perfilRes.error);
        // Set default values
        setPesoMeta(70.0);
        if (!pesoAtual && historicoRes.data?.length === 0) {
          setPesoAtual(78.0);
        }
      } else if (perfilRes.data) {
        // Check for peso_objetivo, peso_atual, or meta_peso in profile
        const targetWeight = perfilRes.data.peso_objetivo || perfilRes.data.meta_peso;
        if (targetWeight) {
          setPesoMeta(targetWeight);
          console.log('✅ Target weight set from profile:', targetWeight);
        } else {
          setPesoMeta(70.0);
        }
        
        // If no weight history, check for peso_atual in profile
        if (historicoRes.data?.length === 0 && perfilRes.data.peso_atual) {
          setPesoAtual(perfilRes.data.peso_atual);
          console.log('✅ Current weight set from profile:', perfilRes.data.peso_atual);
        } else if (!pesoAtual && historicoRes.data?.length === 0) {
          setPesoAtual(78.0);
          console.log('ℹ️ Using default current weight: 78.0');
        }
      }
    } catch (error) {
      console.error('❌ Exception loading weight data:', error);
      toast.error('Error loading weight data');
      setPesoAtual(78.0);
      setPesoMeta(70.0);
    } finally {
      setLoading(false);
    }
  };

  const adicionarPeso = async (peso: number, observacoes?: string) => {
    try {
      console.log('💾 Adding weight record:', peso);
      const { error } = await PesoService.adicionarPeso(peso, observacoes);
      
      if (error) {
        console.error('❌ Error adding weight record:', error);
        toast.error('Error adding weight record');
        return;
      }

      await carregarDados();
      toast.success('Weight record added successfully!');
    } catch (error) {
      console.error('❌ Exception adding weight:', error);
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
