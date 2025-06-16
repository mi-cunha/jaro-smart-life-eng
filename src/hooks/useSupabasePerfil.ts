
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { PerfilService } from '@/services/perfilService';

export function useSupabasePerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const carregarPerfil = async () => {
    if (!user?.email) {
      console.warn('🚫 Nenhum email de usuário disponível para carregar perfil');
      setLoading(false);
      return;
    }

    console.log('🔍 Carregando perfil para email:', user.email);
    setLoading(true);

    try {
      const { data, error } = await PerfilService.buscarPerfil();
      
      if (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        // Create default profile if error
        const defaultProfile = {
          email: user.email,
          nome: user.user_metadata?.nome || 'Usuário',
          user_email: user.email,
          vegano: false,
          vegetariano: false,
          low_carb: false,
          sem_gluten: false,
          peso_atual: null,
          meta_peso: null,
          peso_objetivo: null,
          calorias_diarias: 2000,
          doses_cha: 2,
          habitos_diarios: 8,
          notif_tomar_cha: true,
          notif_marcar_habito: true,
          notif_gerar_receitas: true,
          notif_comprar_itens: true,
          notif_atingir_meta: true,
          google_fit: false,
          apple_health: false,
          fitbit: false,
          dados_uso: true,
          notificacoes_push: true,
          avatar_url: null,
          alergias: ''
        };
        setPerfil(defaultProfile);
      } else if (data) {
        console.log('📥 Dados do perfil carregados:', data);
        setPerfil({
          ...data,
          email: user.email,
          nome: data.nome || user.user_metadata?.nome || 'Usuário'
        });
      } else {
        // No profile found, create default
        console.log('⚠️ Nenhum perfil encontrado, criando padrão');
        const defaultProfile = {
          email: user.email,
          nome: user.user_metadata?.nome || 'Usuário',
          user_email: user.email,
          vegano: false,
          vegetariano: false,
          low_carb: false,
          sem_gluten: false,
          peso_atual: null,
          meta_peso: null,
          peso_objetivo: null,
          calorias_diarias: 2000,
          doses_cha: 2,
          habitos_diarios: 8,
          notif_tomar_cha: true,
          notif_marcar_habito: true,
          notif_gerar_receitas: true,
          notif_comprar_itens: true,
          notif_atingir_meta: true,
          google_fit: false,
          apple_health: false,
          fitbit: false,
          dados_uso: true,
          notificacoes_push: true,
          avatar_url: null,
          alergias: ''
        };
        setPerfil(defaultProfile);
      }
    } catch (err) {
      console.error('❌ Erro inesperado ao carregar perfil:', err);
      // Fallback profile
      setPerfil({
        email: user.email,
        nome: user.user_metadata?.nome || 'Usuário',
        user_email: user.email,
        vegano: false,
        vegetariano: false,
        low_carb: false,
        sem_gluten: false,
        peso_atual: null,
        meta_peso: null,
        peso_objetivo: null,
        calorias_diarias: 2000,
        doses_cha: 2,
        habitos_diarios: 8,
        notif_tomar_cha: true,
        notif_marcar_habito: true,
        notif_gerar_receitas: true,
        notif_comprar_itens: true,
        notif_atingir_meta: true,
        google_fit: false,
        apple_health: false,
        fitbit: false,
        dados_uso: true,
        notificacoes_push: true,
        avatar_url: null,
        alergias: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const atualizarPerfil = async (dadosAtualizacao: any) => {
    if (!user?.email || !perfil) {
      console.error('🚫 Email do usuário ou perfil ausente na atualização');
      return false;
    }

    try {
      console.log('💾 Salvando dados do perfil:', dadosAtualizacao);
      
      const { data, error } = await PerfilService.atualizarPerfil(dadosAtualizacao);
      
      if (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return false;
      }

      // Update local state optimistically
      setPerfil(prev => ({ ...prev, ...dadosAtualizacao }));
      console.log('✅ Perfil atualizado com sucesso');
      return true;
    } catch (err) {
      console.error('❌ Erro inesperado ao atualizar perfil:', err);
      return false;
    }
  };

  const salvarAvatar = async (file: File) => {
    try {
      const { data, error } = await PerfilService.salvarAvatar(file);
      
      if (error) {
        console.error('❌ Erro ao salvar avatar:', error);
        return false;
      }

      if (data?.avatar_url) {
        setPerfil(prev => ({ ...prev, avatar_url: data.avatar_url }));
        console.log('✅ Avatar salvo com sucesso');
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('❌ Erro inesperado ao salvar avatar:', err);
      return false;
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, [user?.email]);

  return {
    perfil,
    loading,
    atualizarPerfil,
    salvarAvatar,
    carregarPerfil
  };
}
