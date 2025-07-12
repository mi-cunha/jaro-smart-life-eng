
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Perfil = () => {
  const { perfil, loading, atualizarPerfil, salvarAvatar } = useSupabasePerfil();
  const { isSubscribed } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        toast.success(data.message);
        // Refresh page to update subscription status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.error || 'Error cancelling subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
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

        {isSubscribed && (
          <Card className="bg-dark-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="w-full"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Plan'}
              </Button>
            </CardContent>
          </Card>
        )}

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
