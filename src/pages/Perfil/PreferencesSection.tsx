
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Preferências Alimentares</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
