
import { useState, useEffect } from 'react';
import { PerfilService, PerfilUsuario } from '@/services/perfilService';
import { UserProfileService } from '@/services/userProfileService';
import { toast } from 'sonner';

export function useSupabasePerfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPerfil = async () => {
    setLoading(true);
    try {
      // Try to use the existing PerfilService first, then fallback to UserProfileService
      let data, error;
      try {
        const result = await PerfilService.buscarPerfil();
        data = result.data;
        error = result.error;
      } catch {
        // Fallback to UserProfileService if PerfilService fails
        const result = await UserProfileService.buscarPerfilUsuario();
        data = result.data;
        error = result.error;
      }

      if (error) {
        toast.error('Erro ao carregar perfil');
        console.error('Erro ao carregar perfil:', error);
        setPerfil(null); // limpar perfil em caso de erro
      } else if (data) {
        setPerfil(data);
      } else {
        setPerfil(null); // garantir estado
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
      setPerfil(null);
    } finally {
      setLoading(false);
    }
  };

  const atualizarPerfil = async (updates: Partial<PerfilUsuario>) => {
    try {
      // Try to use the existing PerfilService first, then fallback to UserProfileService
      let data, error;
      try {
        const result = await PerfilService.atualizarPerfil(updates);
        data = result.data;
        error = result.error;
      } catch {
        // Fallback to UserProfileService if PerfilService fails
        const result = await UserProfileService.atualizarPerfilUsuario(updates);
        data = result.data;
        error = result.error;
      }

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

  // Adição: recarregar perfil ao logar/deslogar
  useEffect(() => {
    carregarPerfil();
    // Poderia adicionar listener para evento de login/logout aqui se necessário no futuro
  }, []);

  return {
    perfil,
    loading,
    atualizarPerfil,
    salvarAvatar,
    carregarPerfil
  };
}
