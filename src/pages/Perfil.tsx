import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Bell, Shield, Link as LinkIcon, Save } from "lucide-react";
import { useRef } from "react";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";
import { AvatarSection } from "./Perfil/AvatarSection";
import { PersonalInfoSection } from "./Perfil/PersonalInfoSection";
import { PreferencesSection } from "./Perfil/PreferencesSection";
import { ObjectivesSection } from "./Perfil/ObjectivesSection";
import { NotificationsSection } from "./Perfil/NotificationsSection";
import { IntegrationsSection } from "./Perfil/IntegrationsSection";
import { SaveConfigBar } from "./Perfil/SaveConfigBar";
import { PrivacySection } from "./Perfil/PrivacySection";

const Perfil = () => {
  const { perfil, loading, atualizarPerfil, salvarAvatar, carregarPerfil } = useSupabasePerfil();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <Layout title="Perfil & Configurações" breadcrumb={["Home", "Perfil"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Carregando perfil...</div>
        </div>
      </Layout>
    );
  }

  if (!perfil) {
    return (
      <Layout title="Perfil & Configurações" breadcrumb={["Home", "Perfil"]}>
        <div className="flex items-center justify-center min-h-64 flex-col">
          <div className="text-white mb-4">Erro ao carregar perfil</div>
          <Button className="bg-neon-green text-black" onClick={carregarPerfil}>
            Tentar Novamente
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSalvarConfiguracao = () => {
    // Dados já são salvos automaticamente
  };

  const handleTogglePreferencia = async (preferencia: string) => {
    await atualizarPerfil({
      [preferencia]: !perfil[preferencia as keyof typeof perfil]
    });
  };

  const handleToggleNotificacao = async (notificacao: string) => {
    await atualizarPerfil({
      [notificacao]: !perfil[notificacao as keyof typeof perfil]
    });
  };

  const handleToggleIntegracao = async (integracao: string) => {
    await atualizarPerfil({
      [integracao]: !perfil[integracao as keyof typeof perfil]
    });
  };

  const handleChangeObjetivo = async (objetivo: string, valor: string) => {
    await atualizarPerfil({
      [objetivo]: parseFloat(valor) || 0
    });
  };

  const handleChangeNome = async (nome: string) => {
    await atualizarPerfil({ nome });
  };

  const handleChangeAlergias = async (alergias: string) => {
    await atualizarPerfil({ alergias });
  };

  const handleAvatarChange = async (file: File) => {
    await salvarAvatar(file);
  };

  return (
    <Layout title="Perfil & Configurações" breadcrumb={["Home", "Perfil"]}>
      <div className="space-y-8">
        {/* Avatar and Infos */}
        <AvatarSection
          nome={perfil.nome || ""}
          avatar_url={perfil.avatar_url}
          onAvatarChange={handleAvatarChange}
        />
        <PersonalInfoSection
          nome={perfil.nome || ""}
          email={perfil.email}
          onNomeChange={handleChangeNome}
        />
        <PreferencesSection
          perfil={perfil}
          onTogglePreferencia={handleTogglePreferencia}
          onChangeAlergias={handleChangeAlergias}
        />
        <ObjectivesSection
          perfil={perfil}
          onChangeObjetivo={handleChangeObjetivo}
        />
        <NotificationsSection
          perfil={perfil}
          onToggleNotificacao={handleToggleNotificacao}
        />
        <IntegrationsSection
          perfil={perfil}
          onToggleIntegracao={handleToggleIntegracao}
        />
        <SaveConfigBar onClick={handleSalvarConfiguracao} />
        <PrivacySection
          perfil={perfil}
          onToggleNotificacao={handleToggleNotificacao}
        />
      </div>
    </Layout>
  );
};

export default Perfil;
