
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabasePreferencias } from "@/hooks/useSupabasePreferencias";

interface PreferencesSectionProps {
  perfil: any;
  onTogglePreferencia: (preferencia: string) => void;
  onChangeAlergias: (alergias: string) => void;
}

export function PreferencesSection({
  perfil,
  onTogglePreferencia,
  onChangeAlergias,
}: PreferencesSectionProps) {
  const { preferencias, atualizarPreferencias } = useSupabasePreferencias();

  const handleUpdateObjectivo = async (objetivo: string) => {
    if (preferencias) {
      await atualizarPreferencias({
        ...preferencias,
        objetivo
      });
    }
  };

  const handleUpdateAlimentares = async (alimentares: string) => {
    if (preferencias) {
      await atualizarPreferencias({
        ...preferencias,
        alimentares
      });
    }
  };

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Preferências Alimentares</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nutritional Goals */}
        <div className="space-y-3">
          <Label className="text-white/80">Objetivo Nutricional</Label>
          <Select value={preferencias?.objetivo || ''} onValueChange={handleUpdateObjectivo}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Selecione seu objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Perda de peso">Perda de peso</SelectItem>
              <SelectItem value="Ganho de massa">Ganho de massa</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Alimentação saudável">Alimentação saudável</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-3">
          <Label className="text-white/80">Preferências Alimentares</Label>
          <Select value={preferencias?.alimentares || ''} onValueChange={handleUpdateAlimentares}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Selecione suas preferências" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhuma">Nenhuma preferência específica</SelectItem>
              <SelectItem value="vegetariana">Vegetariana</SelectItem>
              <SelectItem value="vegana">Vegana</SelectItem>
              <SelectItem value="low carb">Low Carb</SelectItem>
              <SelectItem value="cetogênica">Cetogênica</SelectItem>
              <SelectItem value="mediterrânea">Mediterrânea</SelectItem>
              <SelectItem value="sem glúten">Sem Glúten</SelectItem>
              <SelectItem value="personalizada">Personalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current checkboxes for backward compatibility */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { key: 'vegano', label: 'Vegano' },
            { key: 'vegetariano', label: 'Vegetariano' },
            { key: 'low_carb', label: 'Low Carb' },
            { key: 'sem_gluten', label: 'Sem Glúten' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                checked={perfil[key] as boolean}
                onCheckedChange={() => onTogglePreferencia(key)}
                className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
              />
              <Label className="text-white/80">{label}</Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="alergias" className="text-white/80">Histórico de Alergias</Label>
          <Textarea
            id="alergias"
            value={perfil.alergias || ''}
            onChange={(e) => onChangeAlergias(e.target.value)}
            placeholder="Ex: Lactose, amendoim, frutos do mar..."
            className="bg-white/5 border-white/20 text-white min-h-20"
          />
        </div>
      </CardContent>
    </Card>
  );
}
