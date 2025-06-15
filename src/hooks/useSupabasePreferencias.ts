
import { useState, useEffect } from 'react';
import { PreferencesService } from '@/services/preferencesService';
import { PreferenciasUsuario } from '@/types/receitas';

export function useSupabasePreferencias() {
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPreferencias = async () => {
    setLoading(true);
    try {
      const { data, error } = await PreferencesService.buscarPreferencias();
      if (!error && data) {
        setPreferencias({
          objetivo: data.objetivo || 'Perda de peso',
          alimentares: data.preferencias_alimentares || 'nenhuma',
          restricoes: data.restricoes_alimentares || []
        });
      } else {
        // Se não há preferências, criar padrões
        setPreferencias({
          objetivo: 'Perda de peso',
          alimentares: 'nenhuma',
          restricoes: []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      // Definir preferências padrão em caso de erro
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
    try {
      const { data, error } = await PreferencesService.salvarPreferencias(novasPreferencias);
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
