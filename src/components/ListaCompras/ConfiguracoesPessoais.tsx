
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RestrictionsModal } from "@/components/RestrictionsModal";

interface ConfiguracoesPessoaisProps {
  preferenciasAlimentares: string;
  setPreferenciasAlimentares: (value: string) => void;
  restricoesAlimentares: string[];
  setRestricoesAlimentares: (restrictions: string[]) => void;
}

export function ConfiguracoesPessoais({
  preferenciasAlimentares,
  setPreferenciasAlimentares,
  restricoesAlimentares,
  setRestricoesAlimentares
}: ConfiguracoesPessoaisProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Personal Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Dietary Preferences</label>
            <Select value={preferenciasAlimentares} onValueChange={setPreferenciasAlimentares}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-bg border-white/20">
                <SelectItem value="nenhuma">No preference</SelectItem>
                <SelectItem value="vegetariano">Vegetarian</SelectItem>
                <SelectItem value="vegano">Vegan</SelectItem>
                <SelectItem value="low-carb">Low Carb</SelectItem>
                <SelectItem value="cetogenico">Ketogenic</SelectItem>
                <SelectItem value="mediterraneo">Mediterranean</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="sem-gluten">Gluten Free</SelectItem>
                <SelectItem value="sem-lactose">Lactose Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <RestrictionsModal 
              restrictions={restricoesAlimentares}
              onUpdate={setRestricoesAlimentares}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
