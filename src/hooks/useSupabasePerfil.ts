
import { useState, useEffect } from 'react';
import { PerfilService, PerfilUsuario } from '@/services/perfilService';
import { toast } from 'sonner';

export function useSupabasePerfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPerfil = async () => {
    setLoading(true);
    try {
      const { data, error } = await PerfilService.buscarPerfil();
      if (error) {
        toast.error('Erro ao carregar perfil');
        console.error('Erro ao carregar perfil:', error);
      } else if (data) {
        setPerfil(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const atualizarPerfil = async (updates: Partial<PerfilUsuario>) => {
    try {
      const { data, error } = await PerfilService.atualizarPerfil(updates);
      if (error) {
        toast.error('Erro ao atualizar perfil');
        return false;
      } else if (data) {
        setPerfil(data);
        toast.success('Perfil atualizado com sucesso!');
        return true;
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
      return false;
    }
    return false;
  };

  const salvarAvatar = async (file: File) => {
    try {
      const { data, error } = await PerfilService.salvarAvatar(file);
      if (error) {
        toast.error('Erro ao salvar avatar');
        return false;
      } else if (data) {
        setPerfil(data);
        toast.success('Avatar atualizado com sucesso!');
        return true;
      }
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
      toast.error('Erro ao salvar avatar');
      return false;
    }
    return false;
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  return {
    perfil,
    loading,
    atualizarPerfil,
    salvarAvatar,
    carregarPerfil
  };
}
