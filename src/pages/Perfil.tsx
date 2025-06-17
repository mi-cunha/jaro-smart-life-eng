
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";
import { PersonalInfoSection } from "./Perfil/PersonalInfoSection";
import { PreferencesSection } from "./Perfil/PreferencesSection";
import { ObjectivesSection } from "./Perfil/ObjectivesSection";
import { NotificationsSection } from "./Perfil/NotificationsSection";
import { PrivacySection } from "./Perfil/PrivacySection";
import { AvatarSection } from "./Perfil/AvatarSection";
import { SaveConfigBar } from "./Perfil/SaveConfigBar";
import { useState } from "react";

const Perfil = () => {
  const { perfil, loading, atualizarPerfil, salvarAvatar } = useSupabasePerfil();
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    if (perfil) {
      const updatedPerfil = { ...perfil, [field]: value };
      atualizarPerfil({ [field]: value });
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    if (perfil) {
      const success = await atualizarPerfil(perfil);
      if (success) {
        toast.success('Perfil salvo com sucesso!');
        setHasChanges(false);
      } else {
        toast.error('Erro ao salvar perfil');
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Profile Settings" breadcrumb={["Profile", "Settings"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Carregando perfil...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile Settings" breadcrumb={["Profile", "Settings"]}>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-white/70">Manage your personal information and preferences</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-dark-bg border-white/10">
            <TabsTrigger value="personal" className="text-white data-[state=active]:bg-neon-green data-[state=active]:text-black">
              Personal
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-neon-green data-[state=active]:text-black">
              Dietary
            </TabsTrigger>
            <TabsTrigger value="objectives" className="text-white data-[state=active]:bg-neon-green data-[state=active]:text-black">
              Goals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-neon-green data-[state=active]:text-black">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-white data-[state=active]:bg-neon-green data-[state=active]:text-black">
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <AvatarSection 
              perfil={perfil} 
              onAvatarChange={salvarAvatar}
            />
            <PersonalInfoSection 
              perfil={perfil} 
              onInputChange={handleInputChange} 
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <PreferencesSection 
              perfil={perfil} 
              onInputChange={handleInputChange} 
            />
          </TabsContent>

          <TabsContent value="objectives" className="space-y-6">
            <ObjectivesSection 
              perfil={perfil} 
              onInputChange={handleInputChange} 
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSection 
              perfil={perfil} 
              onInputChange={handleInputChange} 
            />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <PrivacySection 
              perfil={perfil} 
              onInputChange={handleInputChange} 
            />
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <SaveConfigBar onSave={handleSave} />
        )}
      </div>
    </Layout>
  );
};

export default Perfil;
