// Teste temporário para verificar se os serviços estão funcionando
import { PesoService } from '@/services/pesoService';
import { PreferencesService } from '@/services/preferencesService';
import { UserProfileService } from '@/services/userProfileService';

export const testPesoServices = async () => {
  console.log('🧪 TESTE - Iniciando testes dos serviços de peso...');
  
  try {
    // Teste 1: Buscar histórico de peso
    console.log('🧪 TESTE 1 - Buscando histórico de peso...');
    const historicoRes = await PesoService.buscarHistoricoPeso(30);
    console.log('🧪 TESTE 1 - Resultado histórico:', { 
      error: historicoRes.error, 
      dataLength: historicoRes.data?.length || 0,
      data: historicoRes.data 
    });

    // Teste 2: Buscar preferências
    console.log('🧪 TESTE 2 - Buscando preferências...');
    const preferencesRes = await PreferencesService.buscarPreferencias();
    console.log('🧪 TESTE 2 - Resultado preferências:', { 
      error: preferencesRes.error, 
      hasData: !!preferencesRes.data,
      data: preferencesRes.data 
    });

    if (preferencesRes.data && !preferencesRes.error) {
      const preferencesData = preferencesRes.data.preferencias_alimentares;
      console.log('🧪 TESTE 2 - preferencias_alimentares:', preferencesData);
      
      if (preferencesData && typeof preferencesData === 'object') {
        const currentWeight = preferencesData.currentWeight;
        const targetWeight = preferencesData.targetWeight;
        console.log('🧪 TESTE 2 - Extraído:', { currentWeight, targetWeight });
      }
    }

    // Teste 3: Buscar perfil do usuário
    console.log('🧪 TESTE 3 - Buscando perfil do usuário...');
    const perfilRes = await UserProfileService.buscarPerfilUsuario();
    console.log('🧪 TESTE 3 - Resultado perfil:', { 
      error: perfilRes.error, 
      hasData: !!perfilRes.data,
      pesoAtual: perfilRes.data?.peso_atual,
      pesoObjetivo: perfilRes.data?.peso_objetivo,
      data: perfilRes.data 
    });

  } catch (error) {
    console.error('🧪 TESTE - Erro nos testes:', error);
  }
};

// Função para adicionar ao window para testar no console
declare global {
  interface Window {
    testPesoServices: typeof testPesoServices;
  }
}

if (typeof window !== 'undefined') {
  window.testPesoServices = testPesoServices;
}