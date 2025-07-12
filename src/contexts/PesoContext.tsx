
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PesoService } from '@/services/pesoService';
import { UserProfileService } from '@/services/userProfileService';
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
      // Load weight history and profile in parallel
      const [historicoRes, perfilRes] = await Promise.all([
        PesoService.buscarHistoricoPeso(30),
        UserProfileService.buscarPerfilUsuario()
      ]);

      console.log('📊 PesoContext - Resultado histórico peso:', { 
        success: !historicoRes.error, 
        dataLength: historicoRes.data?.length || 0 
      });
      
      console.log('👤 PesoContext - Resultado perfil:', { 
        success: !perfilRes.error, 
        hasData: !!perfilRes.data,
        pesoAtual: perfilRes.data?.peso_atual,
        pesoObjetivo: perfilRes.data?.peso_objetivo
      });

      // Handle profile data first to get quiz values
      let profileCurrentWeight = null;
      let profileTargetWeight = null;
      let profileInitialWeight = null;

      if (perfilRes.data && !perfilRes.error) {
        profileCurrentWeight = perfilRes.data.peso_atual;
        profileTargetWeight = perfilRes.data.peso_objetivo || perfilRes.data.meta_peso;
        profileInitialWeight = perfilRes.data.peso_atual; // Use current weight as initial weight from quiz

        // Set target weight from profile
        setPesoMeta(profileTargetWeight || null);
        console.log('✅ PesoContext - Meta de peso definida do perfil:', profileTargetWeight);
      } else {
        console.error('❌ PesoContext - Erro ao carregar perfil:', perfilRes.error);
        setPesoMeta(null);
      }

      // Handle weight history
      const historico = historicoRes.data || [];
      setHistoricoPeso(historico);

      if (historico.length > 0) {
        // Use weight history for current and initial weights
        const sortedHistorico = [...historico].sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        const latestWeight = sortedHistorico[0].peso;
        setPesoAtual(latestWeight);
        console.log('✅ PesoContext - Peso atual do histórico:', latestWeight);

        // Use oldest weight from history as initial weight
        const oldestWeight = [...historico].sort((a, b) => 
          new Date(a.data).getTime() - new Date(b.data).getTime()
        )[0].peso;
        setPesoInicial(oldestWeight);
        console.log('✅ PesoContext - Peso inicial do histórico:', oldestWeight);
      } else {
        // No weight history - use profile data and create initial entry
        console.log('📝 PesoContext - Sem histórico, usando dados do perfil');
        
        if (profileCurrentWeight) {
          // Create initial weight entry from profile data automatically
          console.log('💾 PesoContext - Criando entrada inicial no histórico com peso do quiz:', profileCurrentWeight);
          
          const { error: addError } = await PesoService.adicionarPeso(profileCurrentWeight, 'Peso inicial do quiz');
          if (!addError) {
            console.log('✅ PesoContext - Entrada inicial criada com sucesso');
            // Reload to get the new history entry
            await carregarDados();
            return;
          } else {
            console.error('❌ PesoContext - Erro ao criar entrada inicial:', addError);
            // Use profile values directly if can't create history entry
            setPesoAtual(profileCurrentWeight);
            setPesoInicial(profileCurrentWeight);
            console.log('✅ PesoContext - Usando dados do perfil diretamente:', profileCurrentWeight);
          }
        } else {
          // No profile data either - show zero values instead of defaults
          console.log('ℹ️ PesoContext - Sem dados do perfil, mostrando valores zerados');
          setPesoAtual(null);
          setPesoInicial(null);
        }
      }
    } catch (error) {
      console.error('❌ PesoContext - Erro inesperado ao carregar dados:', error);
      // Only show toast if not on auth page to prevent error messages before login
      if (window.location.pathname !== '/auth') {
        toast.error('Erro ao carregar dados de peso');
      }
      // Set fallback values as null to show empty state
      if (!pesoAtual) {
        setPesoAtual(null);
      }
      if (!pesoMeta) {
        setPesoMeta(null);
      }
      if (!pesoInicial) {
        setPesoInicial(null);
      }
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
