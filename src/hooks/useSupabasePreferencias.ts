
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PreferenciasUsuario, PreferenciasAlimentaresJSON } from '@/types/receitas';

// Helper function to extract string from preferences JSON or return string directly
function extractPreferenciasString(preferenciasData: any): string {
  if (typeof preferenciasData === 'string') {
    return preferenciasData;
  }
  
  if (preferenciasData && typeof preferenciasData === 'object') {
    // Try to extract a meaningful string from the object
    return preferenciasData.dietType || 
           preferenciasData.dailyRoutine || 
           (Array.isArray(preferenciasData.mealPreferences) ? preferenciasData.mealPreferences.join(', ') : '') ||
           'personalizada';
  }
  
  return 'nenhuma';
}

export function useSupabasePreferencias() {
  const { user } = useAuth();
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPreferencias = async () => {
    if (!user?.email) {
      console.warn('🚫 Nenhum email de usuário disponível');
      setLoading(false);
      return;
    }

    console.log('🔍 Carregando preferências para email:', user.email);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('user_email', user.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar preferências:', error);
      }

      if (data) {
        console.log('📥 Dados brutos do Supabase:', data);
        
        // Extract alimentares preference from the JSON structure or use as string
        const alimentaresValue = extractPreferenciasString(data.preferencias_alimentares);
        
        // Ensure restricoes is an array
        const restricoesValue = Array.isArray(data.restricoes_alimentares) 
          ? data.restricoes_alimentares 
          : [];

        const preferenciasProcessadas = {
          objetivo: data.objetivo || 'Perda de peso',
          alimentares: alimentaresValue,
          restricoes: restricoesValue
        };

        console.log('✅ Preferências processadas:', preferenciasProcessadas);
        setPreferencias(preferenciasProcessadas);
      } else {
        console.warn('⚠️ Nenhum dado de preferência encontrado. Aplicando valores padrão.');
        setPreferencias({
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        });
      }
    } catch (err) {
      console.error('❌ Erro inesperado ao carregar preferências:', err);
      setPreferencias({
        objetivo: 'Perda de peso',
        alimentares: 'nenhuma',
        restricoes: []
      });
    } finally {
      setLoading(false);
    }
  };

  const atualizarPreferencias = async (novasPreferencias: PreferenciasUsuario) => {
    if (!user?.email) {
      console.error('🚫 Email do usuário ausente na atualização');
      return false;
    }

    try {
      console.log('💾 Salvando preferências:', novasPreferencias);
      
      // Save in the format expected by the database
      const { error } = await supabase
        .from('preferencias_usuario')
        .upsert({
          user_email: user.email,
          objetivo: novasPreferencias.objetivo,
          preferencias_alimentares: novasPreferencias.alimentares, // Save as string
          restricoes_alimentares: novasPreferencias.restricoes
        });

      if (error) {
        console.error('❌ Erro ao atualizar preferências:', error);
        return false;
      }

      setPreferencias(novasPreferencias);
      console.log('✅ Preferências atualizadas com sucesso');
      return true;
    } catch (err) {
      console.error('❌ Erro inesperado ao atualizar preferências:', err);
      return false;
    }
  };

  useEffect(() => {
    carregarPreferencias();
  }, [user?.email]);

  return {
    preferencias,
    loading,
    atualizarPreferencias,
    recarregarPreferencias: carregarPreferencias
  };
}
