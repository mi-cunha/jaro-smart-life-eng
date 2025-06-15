
import { useState, useEffect } from 'react';
import { PerfilService, PerfilUsuario } from '@/services/perfilService';
import { UserProfileService } from '@/services/userProfileService';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useSupabasePerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPerfil = async () => {
    if (!user) {
      console.log('🔍 useSupabasePerfil - No user available, skipping profile load');
      setPerfil(null);
      setLoading(false);
      return;
    }

    console.log('🔍 useSupabasePerfil - Loading profile for user:', user.email);
    setLoading(true);
    
    try {
      // Try to use the existing PerfilService first, then fallback to UserProfileService
      let data, error;
      try {
        const result = await PerfilService.buscarPerfil();
        data = result.data;
        error = result.error;
        console.log('✅ PerfilService result:', { data: !!data, error: !!error });
      } catch (serviceError) {
        console.log('❌ PerfilService failed, trying UserProfileService:', serviceError);
        // Fallback to UserProfileService if PerfilService fails
        const result = await UserProfileService.buscarPerfilUsuario();
        data = result.data;
        error = result.error;
        console.log('✅ UserProfileService result:', { data: !!data, error: !!error });
      }

      if (error) {
        console.error('❌ Error loading profile:', error);
        toast.error('Erro ao carregar perfil');
        setPerfil(null);
      } else if (data) {
        console.log('✅ Profile loaded successfully:', data);
        setPerfil(data);
      } else {
        console.log('❌ No profile data returned');
        setPerfil(null);
      }
    } catch (error) {
      console.error('❌ Exception loading profile:', error);
      toast.error('Erro ao carregar perfil');
      setPerfil(null);
    } finally {
      setLoading(false);
    }
  };

  const atualizarPerfil = async (updates: Partial<PerfilUsuario>) => {
    if (!user) {
      console.log('❌ No user available for profile update');
      toast.error('User not authenticated');
      return false;
    }

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
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

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

  // Load profile when user changes
  useEffect(() => {
    carregarPerfil();
  }, [user?.id]); // Use user.id instead of just user to avoid unnecessary re-renders

  return {
    perfil,
    loading,
    atualizarPerfil,
    salvarAvatar,
    carregarPerfil
  };
}
