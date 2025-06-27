
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
        hasData: !!perfilRes.data 
      });

      // Handle weight history
      if (historicoRes.error) {
        console.error('❌ Erro ao carregar histórico:', historicoRes.error);
        setHistoricoPeso([]);
      } else {
        const historico = historicoRes.data || [];
        setHistoricoPeso(historico);
        
        // Set current weight from latest entry
        if (historico.length > 0) {
          const latestWeight = historico[0].peso;
          setPesoAtual(latestWeight);
          console.log('✅ Peso atual definido do histórico:', latestWeight);
        }
      }

      // Handle profile data
      if (perfilRes.error) {
        console.error('❌ Erro ao carregar perfil:', perfilRes.error);
        // Set default values when profile fails to load
        setPesoMeta(70.0);
        if (!pesoAtual && (!historicoRes.data || historicoRes.data.length === 0)) {
          setPesoAtual(78.0);
          console.log('ℹ️ Usando peso atual padrão: 78.0');
        }
      } else if (perfilRes.data) {
        // Use peso_objetivo as target weight
        const targetWeight = perfilRes.data.peso_objetivo || perfilRes.data.meta_peso || 70.0;
        setPesoMeta(targetWeight);
        console.log('✅ Meta de peso definida:', targetWeight);
        
        // If no weight history and profile has current weight, use it
        if ((!historicoRes.data || historicoRes.data.length === 0) && perfilRes.data.peso_atual) {
          setPesoAtual(perfilRes.data.peso_atual);
          console.log('✅ Peso atual definido do perfil:', perfilRes.data.peso_atual);
        } else if (!pesoAtual && (!historicoRes.data || historicoRes.data.length === 0)) {
          // Fallback to default if no data anywhere
          setPesoAtual(78.0);
          console.log('ℹ️ Usando peso atual padrão: 78.0');
        }
      } else {
        // No profile data, set defaults
        setPesoMeta(70.0);
        if (!pesoAtual && (!historicoRes.data || historicoRes.data.length === 0)) {
          setPesoAtual(78.0);
          console.log('ℹ️ Usando valores padrão - peso: 78.0, meta: 70.0');
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar dados:', error);
      toast.error('Erro ao carregar dados de peso');
      // Set fallback values
      setPesoAtual(78.0);
      setPesoMeta(70.0);
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
    definirMeta,
    getProgressoPeso,
    getDadosGrafico
  };
}
