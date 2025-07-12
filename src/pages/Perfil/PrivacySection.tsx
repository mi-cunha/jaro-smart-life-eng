
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Shield, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface PrivacySectionProps {
  perfil: any;
  onTogglePrivacy: (setting: string) => void;
  isSubscribed: boolean;
}

export function PrivacySection({ perfil, onTogglePrivacy, isSubscribed }: PrivacySectionProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSupport = () => {
    const subject = encodeURIComponent("Support Request");
    const body = encodeURIComponent("Hello JaroSmart Support Team,\n\nI need assistance with the app.\n\nBest regards");
    window.location.href = `mailto:suporte@smartjaro.site?subject=${subject}&body=${body}`;
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

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-neon-green" />
          Privacy & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-white font-medium">Usage Data</div>
            <div className="text-white/60 text-sm">Allow anonymous data collection for improvements</div>
          </div>
          <Switch 
            checked={perfil?.dados_uso || false}
            onCheckedChange={() => onTogglePrivacy('dados_uso')}
          />
        </div>
        <Separator className="bg-white/10" />
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Download My Data
          </Button>
          <Button
            onClick={handleSupport}
            variant="outline"
            className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          {isSubscribed && (
            <Button 
              variant="ghost" 
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="w-full text-white/60 hover:text-white/80 hover:bg-white/5 text-sm"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Plan'}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10"
          >
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
