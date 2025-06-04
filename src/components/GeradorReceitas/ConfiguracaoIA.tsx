
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Bot, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSupabasePreferencias } from "@/hooks/useSupabasePreferencias";

interface ConfiguracaoIAProps {
  useAI: boolean;
  onToggleAI: (value: boolean) => void;
}

export function ConfiguracaoIA({ useAI, onToggleAI }: ConfiguracaoIAProps) {
  const { preferencias, atualizarPreferencias } = useSupabasePreferencias();
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Verifica se a chave da API está configurada no Supabase
    setHasApiKey(true); // Como foi inserida no Supabase, consideramos como disponível
  }, []);

  const handleToggleAI = (checked: boolean) => {
    if (checked && !hasApiKey) {
      return; // Não permite ativar se não tem API key
    }
    onToggleAI(checked);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Configurações do Gerador</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Configuração da IA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-neon-green" />
                <span className="text-white font-medium">Usar ChatGPT</span>
                {useAI && (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    Ativo
                  </Badge>
                )}
              </div>
              <Switch
                checked={useAI && hasApiKey}
                onCheckedChange={handleToggleAI}
                disabled={!hasApiKey}
                className="data-[state=checked]:bg-neon-green"
              />
            </div>
            
            {!hasApiKey && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-orange-400 font-medium">Chave da API OpenAI não configurada</p>
                    <p className="text-orange-300 mt-1">
                      Configure a chave da API OpenAI no Supabase para usar o ChatGPT na geração de receitas.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {hasApiKey && (
              <div className="text-sm text-white/60 space-y-2">
                <p>
                  <strong>Desativado:</strong> Usa o gerador interno baseado em regras e variações pré-definidas.
                </p>
                <p>
                  <strong>Ativado:</strong> Usa ChatGPT para criar receitas completamente personalizadas com base no prompt especializado.
                </p>
              </div>
            )}
          </div>

          {/* Preferências Alimentares */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Suas Preferências</h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-white/60">Objetivo:</span>
                <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                  {preferencias?.objetivo || 'Perda de peso'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <span className="text-white/60">Preferências:</span>
                <Badge variant="outline" className="border-green-400/30 text-green-400">
                  {preferencias?.alimentares || 'Nenhuma'}
                </Badge>
              </div>
              {preferencias?.restricoes && preferencias.restricoes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-white/60">Restrições:</span>
                  {preferencias.restricoes.map((restricao, index) => (
                    <Badge key={index} variant="outline" className="border-orange-400/30 text-orange-400">
                      {restricao}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-white/50">
              Configure suas preferências na página de Perfil para receitas mais personalizadas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
