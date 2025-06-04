
import { useState, useEffect } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { PreferenciasUsuario } from '@/types/receitas';

export function useSupabasePreferencias() {
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPreferencias = async () => {
    setLoading(true);
    try {
      const { data, error } = await SupabaseService.buscarPreferencias();
      if (!error && data) {
        setPreferencias({
          objetivo: data.objetivo,
          alimentares: data.preferencias_alimentares,
          restricoes: data.restricoes_alimentares || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarPreferencias = async (novasPreferencias: PreferenciasUsuario) => {
    try {
      const { data, error } = await SupabaseService.salvarPreferencias(novasPreferencias);
      if (!error) {
        setPreferencias(novasPreferencias);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    }
  };

  useEffect(() => {
    carregarPreferencias();
  }, []);

  return {
    preferencias,
    loading,
    atualizarPreferencias,
    recarregarPreferencias: carregarPreferencias
  };
}
