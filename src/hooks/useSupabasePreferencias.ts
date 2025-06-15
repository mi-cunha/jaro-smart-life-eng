
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
      // First, get the subscriber record to find the usuario_id
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .select('usuario_id')
        .eq('email', user.email)
        .single();

      if (subError || !subscriber?.usuario_id) {
        console.log('❌ No subscriber found for preferences:', subError);
        // Set default preferences if no subscriber found
        setPreferencias({
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        });
        setLoading(false);
        return;
      }

      console.log('✅ Found subscriber with usuario_id:', subscriber.usuario_id);

      // Then get the preferences using the usuario_id
      const { data, error } = await supabase
        .from('preferencias_usuario')
        .select('*')
        .eq('usuario_id', subscriber.usuario_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('❌ Error fetching preferences:', error);
        // Set default preferences on error
        setPreferencias({
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        });
      } else if (data) {
        console.log('✅ Found preferences data:', data);
        
        // Safely handle the preferencias_alimentares field
        let alimentaresValue = 'nenhuma';
        if (data.preferencias_alimentares) {
          if (typeof data.preferencias_alimentares === 'string') {
            alimentaresValue = data.preferencias_alimentares;
          } else if (typeof data.preferencias_alimentares === 'object') {
            // If it's an object (quiz data), we'll use a default value
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
        // Set default preferences if no data found
        setPreferencias({
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        });
      }
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
      // Set default preferences on error
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
      // First, get the subscriber record to find the usuario_id
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .select('usuario_id')
        .eq('email', user.email)
        .single();

      if (subError || !subscriber?.usuario_id) {
        console.log('❌ No subscriber found for updating preferences:', subError);
        return false;
      }

      const { data, error } = await supabase
        .from('preferencias_usuario')
        .upsert({
          usuario_id: subscriber.usuario_id,
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
