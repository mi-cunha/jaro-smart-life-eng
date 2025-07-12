
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PesoService } from '@/services/pesoService';
import { UserProfileService } from '@/services/userProfileService';
import { PreferencesService } from '@/services/preferencesService';
import { toast } from 'sonner';

interface HistoricoPeso {
  id: string;
  user_email: string;
  peso: number;
  data: string;
  observacoes?: string;
  created_at: string;
}

interface PesoContextType {
  historicoPeso: HistoricoPeso[];
  pesoAtual: number | null;
  pesoMeta: number | null;
  pesoInicial: number | null;
  loading: boolean;
  carregarDados: () => Promise<void>;
  adicionarPeso: (peso: number, observacoes?: string) => Promise<boolean>;
  definirMeta: (meta: number) => Promise<boolean>;
  getProgressoPeso: () => number;
  getWeightLoss: () => number;
  getDadosGrafico: () => Array<{ date: string; value: number }>;
}

const PesoContext = createContext<PesoContextType | undefined>(undefined);

export function PesoProvider({ children }: { children: React.ReactNode }) {
  const [historicoPeso, setHistoricoPeso] = useState<HistoricoPeso[]>([]);
  const [pesoAtual, setPesoAtual] = useState<number | null>(null);
  const [pesoMeta, setPesoMeta] = useState<number | null>(null);
  const [pesoInicial, setPesoInicial] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    console.log('🔍 PesoContext - Carregando dados de peso...');
    
    try {
      // 1. First try to load from weight history
      const historicoRes = await PesoService.buscarHistoricoPeso(30);
      const historico = historicoRes.data || [];
      setHistoricoPeso(historico);

      if (historico.length > 0) {
        // Use weight history data
        const sortedHistorico = [...historico].sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        const latestWeight = sortedHistorico[0].peso;
        const oldestWeight = [...historico].sort((a, b) => 
          new Date(a.data).getTime() - new Date(b.data).getTime()
        )[0].peso;

        setPesoAtual(latestWeight);
        setPesoInicial(oldestWeight);
        console.log('✅ PesoContext - Dados do histórico:', { atual: latestWeight, inicial: oldestWeight });

        // Also try to get target weight from profile
        const perfilRes = await UserProfileService.buscarPerfilUsuario();
        if (perfilRes.data && !perfilRes.error) {
          const targetWeight = perfilRes.data.peso_objetivo || perfilRes.data.meta_peso;
          setPesoMeta(targetWeight || null);
        }
      } else {
        // 2. No weight history - try preferences
        console.log('📝 PesoContext - Histórico vazio, buscando preferências...');
        
        const preferencesRes = await PreferencesService.buscarPreferencias();
        if (preferencesRes.data && !preferencesRes.error) {
          const preferencesData = preferencesRes.data.preferencias_alimentares;
          if (preferencesData && typeof preferencesData === 'object') {
            const currentWeight = preferencesData.currentWeight;
            const targetWeight = preferencesData.targetWeight;
            
            if (currentWeight) {
              setPesoAtual(currentWeight);
              setPesoInicial(currentWeight);
              setPesoMeta(targetWeight || null);
              console.log('✅ PesoContext - Dados das preferências:', { atual: currentWeight, meta: targetWeight });
            } else {
              // 3. No data anywhere - set to null
              setPesoAtual(null);
              setPesoInicial(null);
              setPesoMeta(null);
              console.log('ℹ️ PesoContext - Nenhum dado encontrado');
            }
          } else {
            setPesoAtual(null);
            setPesoInicial(null);
            setPesoMeta(null);
            console.log('ℹ️ PesoContext - Preferências inválidas');
          }
        } else {
          setPesoAtual(null);
          setPesoInicial(null);
          setPesoMeta(null);
          console.log('ℹ️ PesoContext - Erro ao carregar preferências');
        }
      }
    } catch (error) {
      console.error('❌ PesoContext - Erro ao carregar dados:', error);
      setPesoAtual(null);
      setPesoInicial(null);
      setPesoMeta(null);
      setHistoricoPeso([]);
    } finally {
      setLoading(false);
    }
  };

  const adicionarPeso = async (peso: number, observacoes?: string) => {
    try {
      console.log('💾 PesoContext - Adicionando registro de peso:', peso);
      const { error } = await PesoService.adicionarPeso(peso, observacoes);
      
      if (error) {
        console.error('❌ PesoContext - Erro ao adicionar peso:', error);
        toast.error('Erro ao adicionar registro de peso');
        return false;
      }

      // Immediately update the current weight to the new value
      setPesoAtual(peso);
      console.log('✅ PesoContext - Peso atual atualizado imediatamente:', peso);
      
      // Reload data after successful addition to sync across all components
      await carregarDados();
      toast.success('Registro de peso adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ PesoContext - Erro inesperado ao adicionar peso:', error);
      toast.error('Erro ao adicionar registro de peso');
      return false;
    }
  };

  const definirMeta = async (meta: number) => {
    try {
      console.log('🎯 PesoContext - Definindo meta de peso:', meta);
      const { error } = await UserProfileService.atualizarPerfilUsuario({ peso_objetivo: meta });
      
      if (error) {
        console.error('❌ PesoContext - Erro ao definir meta:', error);
        toast.error('Erro ao definir meta de peso');
        return false;
      }

      setPesoMeta(meta);
      toast.success('Meta de peso definida com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ PesoContext - Erro inesperado ao definir meta:', error);
      toast.error('Erro ao definir meta de peso');
      return false;
    }
  };

  const getProgressoPeso = () => {
    if (!pesoAtual || !pesoMeta || !pesoInicial) return 0;
    
    // If current weight is higher than initial weight, return 0
    if (pesoAtual > pesoInicial) return 0;
    
    // Calculate progress using the formula: ((pesoInicial - pesoAtual) / (pesoInicial - pesoMeta)) * 100
    const totalWeightToLose = pesoInicial - pesoMeta;
    const weightLostSoFar = pesoInicial - pesoAtual;
    
    if (totalWeightToLose <= 0) return 0;
    
    const progress = (weightLostSoFar / totalWeightToLose) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getWeightLoss = () => {
    if (!pesoAtual || !pesoInicial) return 0;
    
    // Calculate weight loss: peso inicial - peso atual
    const weightLoss = pesoInicial - pesoAtual;
    return Math.max(0, weightLoss); // Don't show negative weight loss
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

  return (
    <PesoContext.Provider value={{
      historicoPeso,
      pesoAtual,
      pesoMeta,
      pesoInicial,
      loading,
      carregarDados,
      adicionarPeso,
      definirMeta,
      getProgressoPeso,
      getWeightLoss,
      getDadosGrafico
    }}>
      {children}
    </PesoContext.Provider>
  );
}

export function usePesoContext() {
  const context = useContext(PesoContext);
  if (context === undefined) {
    throw new Error('usePesoContext must be used within a PesoProvider');
  }
  return context;
}
