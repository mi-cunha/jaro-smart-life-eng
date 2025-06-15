
import { Card, CardHeader, CardTitle, CardContent, Separator } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PrivacySectionProps {
  perfil: any;
  onToggleNotificacao: (notificacao: string) => void;
}

export function PrivacySection({ perfil, onToggleNotificacao }: PrivacySectionProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-neon-green" />
          Privacidade & Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-white font-medium">Dados de Uso</div>
            <div className="text-white/60 text-sm">Permitir coleta anônima para melhorias</div>
          </div>
          <Switch 
            checked={perfil.dados_uso}
            onCheckedChange={() => onToggleNotificacao('dados_uso')}
          />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-white font-medium">Notificações Push</div>
            <div className="text-white/60 text-sm">Receber notificações no dispositivo</div>
          </div>
          <Switch 
            checked={perfil.notificacoes_push}
            onCheckedChange={() => onToggleNotificacao('notificacoes_push')}
          />
        </div>
        <Separator className="bg-white/10" />
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Baixar Meus Dados
          </Button>
          <Button
            variant="outline"
            className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10"
          >
            Excluir Conta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
