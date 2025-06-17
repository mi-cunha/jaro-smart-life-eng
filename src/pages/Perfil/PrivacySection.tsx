
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PrivacySectionProps {
  perfil: any;
  onTogglePrivacy: (setting: string) => void;
}

export function PrivacySection({ perfil, onTogglePrivacy }: PrivacySectionProps) {
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
