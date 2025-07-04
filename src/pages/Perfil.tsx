
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";
import { PersonalInfoSection } from "./Perfil/PersonalInfoSection";
import { PreferencesSection } from "./Perfil/PreferencesSection";
import { ObjectivesSection } from "./Perfil/ObjectivesSection";
import { PrivacySection } from "./Perfil/PrivacySection";
import { SaveConfigBar } from "./Perfil/SaveConfigBar";
import { useState } from "react";

const Perfil = () => {
  const { perfil, loading, atualizarPerfil, salvarAvatar } = useSupabasePerfil();
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = async (field: string, value: any) => {
    if (perfil) {
      const updatedPerfil = { ...perfil, [field]: value };
      const success = await atualizarPerfil({ [field]: value });
      if (success) {
        setHasChanges(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Error updating profile');
        setHasChanges(true);
      }
    }
  };

  const handleTogglePreferencia = (preferencia: string) => {
    if (perfil) {
      const newValue = !perfil[preferencia];
      handleInputChange(preferencia, newValue);
    }
  };

  const handleChangeObjetivo = (objetivo: string, valor: string) => {
    handleInputChange(objetivo, valor);
  };

  const handleChangeAlergias = (alergias: string) => {
    handleInputChange('alergias', alergias);
  };

  const handleNomeChange = (nome: string) => {
    handleInputChange('nome', nome);
  };

  const handleActivityLevelChange = (level: string) => {
    handleInputChange('daily_routine', level);
  };

  const handleTogglePrivacy = (setting: string) => {
    if (perfil) {
      const newValue = !perfil[setting];
      handleInputChange(setting, newValue);
    }
  };

  const handleSave = async () => {
    if (perfil) {
      const success = await atualizarPerfil(perfil);
      if (success) {
        toast.success('Profile saved successfully!');
        setHasChanges(false);
      } else {
        toast.error('Error saving profile');
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Profile Settings" breadcrumb={["Profile", "Settings"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Loading profile...</div>
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
          <TabsList className="grid w-full grid-cols-2 bg-dark-bg border-white/10">
            <TabsTrigger value="personal" className="text-white data-[state=active]:bg-neon-green data-[state=active]:text-black">
              Personal
            </TabsTrigger>
            <TabsTrigger value="objectives" className="text-white data-[state=active]:bg-neon-green data-[state=active]:text-black">
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <PersonalInfoSection 
              nome={perfil?.nome || ''}
              email={perfil?.email}
              perfil={perfil}
              onNomeChange={handleNomeChange}
              onActivityLevelChange={handleActivityLevelChange}
            />
            <PrivacySection 
              perfil={perfil} 
              onTogglePrivacy={handleTogglePrivacy}
            />
          </TabsContent>


          <TabsContent value="objectives" className="space-y-6">
            <ObjectivesSection 
              perfil={perfil} 
              onChangeObjetivo={handleChangeObjetivo}
            />
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <SaveConfigBar onClick={handleSave} />
        )}
      </div>
    </Layout>
  );
};

export default Perfil;
