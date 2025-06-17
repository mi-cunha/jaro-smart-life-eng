
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Bot, AlertCircle } from "lucide-react";
import { useSupabasePreferencias } from "@/hooks/useSupabasePreferencias";

interface ConfiguracaoIAProps {
  useAI: boolean;
  onToggleAI: (value: boolean) => void;
}

export function ConfiguracaoIA({ useAI, onToggleAI }: ConfiguracaoIAProps) {
  const { preferencias, atualizarPreferencias } = useSupabasePreferencias();

  const handleToggleAI = (checked: boolean) => {
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
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-bg border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Generator Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-neon-green" />
                <span className="text-white font-medium">Use ChatGPT</span>
                {useAI && (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    Active
                  </Badge>
                )}
              </div>
              <Switch
                checked={useAI}
                onCheckedChange={handleToggleAI}
                className="data-[state=checked]:bg-neon-green"
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium">OpenAI Integration</p>
                  <p className="text-blue-300 mt-1">
                    Make sure the OpenAI API key is configured in Supabase Secrets as "OPENAI_API_KEY" for AI recipe generation to work.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-white/60 space-y-2">
              <p>
                <strong>Disabled:</strong> Uses internal generator based on rules and predefined variations.
              </p>
              <p>
                <strong>Enabled:</strong> Uses ChatGPT to create completely personalized recipes with specialized prompts.
              </p>
            </div>
          </div>

          {/* Food Preferences */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Your Preferences</h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-white/60">Goal:</span>
                <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                  {preferencias?.objetivo || 'Weight loss'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <span className="text-white/60">Preferences:</span>
                <Badge variant="outline" className="border-green-400/30 text-green-400">
                  {preferencias?.alimentares || 'None'}
                </Badge>
              </div>
              {Array.isArray(preferencias?.restricoes) && preferencias.restricoes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-white/60">Restrictions:</span>
                  {preferencias.restricoes.map((restricao, index) => (
                    <Badge key={index} variant="outline" className="border-orange-400/30 text-orange-400">
                      {restricao}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-white/50">
              Configure your preferences in the Profile page for more personalized recipes.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
