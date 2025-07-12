import { useState, useEffect } from 'react';
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

export function usePeso() {
  const [historicoPeso, setHistoricoPeso] = useState<HistoricoPeso[]>([]);
  const [pesoAtual, setPesoAtual] = useState<number | null>(null);
  const [pesoMeta, setPesoMeta] = useState<number | null>(null);
  const [pesoInicial, setPesoInicial] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    console.log('🔍 Carregando dados de peso...');
    
    try {
      // Load weight history and profile in parallel
      const [historicoRes, perfilRes] = await Promise.all([
        PesoService.buscarHistoricoPeso(30),
        PerfilService.buscarPerfil()
      ]);

      console.log('📊 Resultado histórico peso:', { 
        success: !historicoRes.error, 
        dataLength: historicoRes.data?.length || 0 
      });
      
      console.log('👤 Resultado perfil:', { 
        success: !perfilRes.error, 
        hasData: !!perfilRes.data,
        peso_atual: perfilRes.data?.peso_atual,
        peso_objetivo: perfilRes.data?.peso_objetivo
      });

      const historico = historicoRes.data || [];
      setHistoricoPeso(historico);

      // Handle profile data FIRST to get correct initial values
      if (perfilRes.data) {
        // Use peso_objetivo as target weight
        const targetWeight = perfilRes.data.peso_objetivo || perfilRes.data.meta_peso || 70.0;
        setPesoMeta(targetWeight);
        console.log('✅ Meta de peso definida do perfil:', targetWeight);
        
        // Use peso_atual from profile as initial weight
        const initialWeight = perfilRes.data.peso_atual || 78.0;
        setPesoInicial(initialWeight);
        console.log('✅ Peso inicial definido do perfil:', initialWeight);
        
        // PRIORITY: If no weight history exists, create initial entry and use profile data
        if (historico.length === 0 && perfilRes.data.peso_atual) {
          console.log('📝 Criando registro inicial de peso no histórico:', perfilRes.data.peso_atual);
          
          // Create initial weight entry from profile data
          try {
            await PesoService.adicionarPeso(perfilRes.data.peso_atual, 'Peso inicial do perfil');
            // Set current weight from profile since no history exists
            setPesoAtual(perfilRes.data.peso_atual);
            console.log('✅ Peso atual definido do perfil (criou histórico inicial):', perfilRes.data.peso_atual);
          } catch (error) {
            console.error('❌ Erro ao criar registro inicial:', error);
            // Still use profile weight even if history creation fails
            setPesoAtual(perfilRes.data.peso_atual);
            console.log('✅ Peso atual definido do perfil (falha no histórico):', perfilRes.data.peso_atual);
          }
        } else if (historico.length > 0) {
          // Use most recent weight from history
          const sortedHistorico = historico.sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
          );
          const latestWeight = sortedHistorico[0].peso;
          setPesoAtual(latestWeight);
          console.log('✅ Peso atual definido do histórico mais recente:', latestWeight);
        } else {
          // Use profile weight as fallback
          setPesoAtual(perfilRes.data.peso_atual || 78.0);
          console.log('✅ Peso atual definido do perfil (fallback):', perfilRes.data.peso_atual || 78.0);
        }
      } else {
        // No profile data, handle weight history or use defaults
        console.warn('⚠️ Nenhum dado de perfil encontrado');
        
        if (historico.length > 0) {
          const sortedHistorico = historico.sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
          );
          const latestWeight = sortedHistorico[0].peso;
          setPesoAtual(latestWeight);
          setPesoInicial(historico[historico.length - 1].peso); // First entry as initial
          console.log('✅ Dados de peso do histórico (sem perfil)');
        } else {
          // No profile, no history - use defaults
          setPesoAtual(78.0);
          setPesoInicial(78.0);
          console.log('ℹ️ Usando valores padrão - sem perfil nem histórico');
        }
        
        setPesoMeta(70.0); // Default target
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar dados:', error);
      toast.error('Erro ao carregar dados de peso');
      // Set fallback values
      setPesoAtual(78.0);
      setPesoMeta(70.0);
      setPesoInicial(78.0);
      setHistoricoPeso([]);
    } finally {
      setLoading(false);
    }
  };

  const adicionarPeso = async (peso: number, observacoes?: string) => {
    try {
      console.log('💾 Adicionando registro de peso:', peso);
      const { error } = await PesoService.adicionarPeso(peso, observacoes);
      
      if (error) {
        console.error('❌ Erro ao adicionar peso:', error);
        toast.error('Erro ao adicionar registro de peso');
        return false;
      }

      // Reload data after successful addition
      await carregarDados();
      toast.success('Registro de peso adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao adicionar peso:', error);
      toast.error('Erro ao adicionar registro de peso');
      return false;
    }
  };

  const definirMeta = async (meta: number) => {
    try {
      console.log('🎯 Definindo meta de peso:', meta);
      const { error } = await PerfilService.atualizarPerfil({ peso_objetivo: meta });
      
      if (error) {
        console.error('❌ Erro ao definir meta:', error);
        toast.error('Erro ao definir meta de peso');
        return false;
      }

      setPesoMeta(meta);
      toast.success('Meta de peso definida com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao definir meta:', error);
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

  return {
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
  };
}
