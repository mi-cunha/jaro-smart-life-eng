
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

interface IntegrationsSectionProps {
  perfil: any;
  onToggleIntegracao: (integracao: string) => void;
}

export function IntegrationsSection({ perfil, onToggleIntegracao }: IntegrationsSectionProps) {
  const integracoes = [
    { key: 'google_fit', label: 'Google Fit' },
    { key: 'apple_health', label: 'Apple Health' },
    { key: 'fitbit', label: 'Fitbit' },
  ];
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-neon-green" />
          Integrações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {integracoes.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <div className="text-white font-medium">{label}</div>
                <div className="text-white/60 text-sm">
                  {perfil[key] ? 'Conectado' : 'Não conectado'}
                </div>
              </div>
            </div>
            <Button
              onClick={() => onToggleIntegracao(key)}
              variant={perfil[key] ? "outline" : "default"}
              className={perfil[key]
                ? "border-red-400/30 text-red-400 hover:bg-red-400/10"
                : "bg-neon-green text-black hover:bg-neon-green/90"
              }
            >
              {perfil[key] ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>
        ))}

        <Separator className="bg-white/10" />

        <div className="space-y-4">
          <h4 className="text-white font-medium">Autenticação Social</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <div className="w-5 h-5 mr-2 bg-white rounded" />
              Google
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <div className="w-5 h-5 mr-2 bg-blue-600 rounded" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <div className="w-5 h-5 mr-2 bg-black rounded" />
              Apple
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
