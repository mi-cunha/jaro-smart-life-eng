
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
      console.log('🔍 No user email available for preferences');
      setLoading(false);
      return;
    }

    console.log('🔍 Loading preferences for user:', user.email);
    setLoading(true);
    
    try {
      // Buscar preferências usando user_email diretamente
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('user_email', user.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('❌ Error fetching preferences:', error);
        setPreferencias({
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        });
      } else if (data) {
        console.log('✅ Found preferences data:', data);
        
        let alimentaresValue = 'nenhuma';
        if (data.preferencias_alimentares) {
          if (typeof data.preferencias_alimentares === 'string') {
            alimentaresValue = data.preferencias_alimentares;
          } else if (typeof data.preferencias_alimentares === 'object') {
            alimentaresValue = 'personalizada';
          }
        }

        setPreferencias({
          objetivo: data.objetivo || 'Perda de peso',
          alimentares: alimentaresValue,
          restricoes: data.restricoes_alimentares || []
        });
      } else {
        console.log('❌ No preferences found, setting defaults');
        setPreferencias({
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        });
      }
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
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
      console.log('❌ No user email available for updating preferences');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .upsert({
          user_email: user.email,
          objetivo: novasPreferencias.objetivo,
          preferencias_alimentares: novasPreferencias.alimentares,
          restricoes_alimentares: novasPreferencias.restricoes
        })
        .select()
        .single();

      if (!error) {
        setPreferencias(novasPreferencias);
        console.log('✅ Preferences updated successfully');
        return true;
      } else {
        console.error('❌ Error updating preferences:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
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
