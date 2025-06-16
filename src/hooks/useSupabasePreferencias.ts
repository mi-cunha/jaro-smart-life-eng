
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PreferenciasUsuario } from '@/types/receitas';

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
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar preferências:', error);
        // Create default preferences if none exist
        const defaultPrefs = {
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        };
        console.log('⚠️ Aplicando preferências padrão devido ao erro');
        setPreferencias(defaultPrefs);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('📥 Dados brutos do Supabase:', data);
        
        // Process the preferences data
        let alimentaresValue = 'nenhuma';
        if (data.preferencias_alimentares) {
          if (typeof data.preferencias_alimentares === 'string') {
            alimentaresValue = data.preferencias_alimentares;
          } else if (typeof data.preferencias_alimentares === 'object') {
            // Extract from JSON object
            alimentaresValue = data.preferencias_alimentares.dietType || 
                             data.preferencias_alimentares.dailyRoutine || 
                             'personalizada';
          }
        }
        
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
        console.log('⚠️ Nenhum dado encontrado. Aplicando valores padrão.');
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
      
      const { error } = await supabase
        .from('preferencias_usuario')
        .upsert({
          user_email: user.email,
          objetivo: novasPreferencias.objetivo,
          preferencias_alimentares: novasPreferencias.alimentares,
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
