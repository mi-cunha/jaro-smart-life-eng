
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PesoService } from '@/services/pesoService';
import { PerfilService } from '@/services/perfilService';
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
        PerfilService.buscarPerfil()
      ]);

      console.log('📊 PesoContext - Resultado histórico peso:', { 
        success: !historicoRes.error, 
        dataLength: historicoRes.data?.length || 0 
      });
      
      console.log('👤 PesoContext - Resultado perfil:', { 
        success: !perfilRes.error, 
        hasData: !!perfilRes.data 
      });

      // Handle weight history - PRIORITY: Use most recent weight from history
      if (historicoRes.error) {
        console.error('❌ PesoContext - Erro ao carregar histórico:', historicoRes.error);
        setHistoricoPeso([]);
      } else {
        const historico = historicoRes.data || [];
        setHistoricoPeso(historico);
        
        // ALWAYS use the most recent weight from history as current weight
        if (historico.length > 0) {
          // Sort by date descending to get the most recent
          const sortedHistorico = historico.sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
          );
          const latestWeight = sortedHistorico[0].peso;
          setPesoAtual(latestWeight);
          console.log('✅ PesoContext - Peso atual definido do histórico mais recente:', latestWeight);
        }
      }

      // Handle profile data
      if (perfilRes.error) {
        console.error('❌ PesoContext - Erro ao carregar perfil:', perfilRes.error);
        // Set default values when profile fails to load
        setPesoMeta(70.0);
        setPesoInicial(78.0);
        // Only set current weight from profile if no history exists
        if (!historicoRes.data || historicoRes.data.length === 0) {
          setPesoAtual(78.0);
          console.log('ℹ️ PesoContext - Usando peso atual padrão: 78.0');
        }
      } else if (perfilRes.data) {
        // Use peso_objetivo as target weight
        const targetWeight = perfilRes.data.peso_objetivo || perfilRes.data.meta_peso || 70.0;
        setPesoMeta(targetWeight);
        console.log('✅ PesoContext - Meta de peso definida:', targetWeight);
        
        // Use peso_atual from profile as initial weight
        const initialWeight = perfilRes.data.peso_atual || 78.0;
        setPesoInicial(initialWeight);
        console.log('✅ PesoContext - Peso inicial definido do perfil:', initialWeight);
        
        // ONLY use profile current weight if no weight history exists
        if ((!historicoRes.data || historicoRes.data.length === 0) && perfilRes.data.peso_atual) {
          setPesoAtual(perfilRes.data.peso_atual);
          console.log('✅ PesoContext - Peso atual definido do perfil (sem histórico):', perfilRes.data.peso_atual);
        }
      } else {
        // No profile data, set defaults
        setPesoMeta(70.0);
        setPesoInicial(78.0);
        // Only set default current weight if no history exists
        if (!historicoRes.data || historicoRes.data.length === 0) {
          setPesoAtual(78.0);
          console.log('ℹ️ PesoContext - Usando valores padrão - peso: 78.0, meta: 70.0, inicial: 78.0');
        }
      }
    } catch (error) {
      console.error('❌ PesoContext - Erro inesperado ao carregar dados:', error);
      toast.error('Erro ao carregar dados de peso');
      // Set fallback values only if no current weight is set
      if (!pesoAtual) {
        setPesoAtual(78.0);
      }
      if (!pesoMeta) {
        setPesoMeta(70.0);
      }
      if (!pesoInicial) {
        setPesoInicial(78.0);
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
      const { error } = await PerfilService.atualizarPerfil({ peso_objetivo: meta });
      
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
    
    // Calculate progress using initial weight from profile
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
