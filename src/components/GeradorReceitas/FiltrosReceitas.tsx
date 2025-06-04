
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FiltrosReceitasProps {
  objetivo: string;
  preferencias: string;
  caloriesMax: number[];
  onObjetivoChange: (value: string) => void;
  onPreferenciasChange: (value: string) => void;
  onCaloriesMaxChange: (value: number[]) => void;
}

export function FiltrosReceitas({
  objetivo,
  preferencias,
  caloriesMax,
  onObjetivoChange,
  onPreferenciasChange,
  onCaloriesMaxChange
}: FiltrosReceitasProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Objetivo</label>
            <Select value={objetivo} onValueChange={onObjetivoChange}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-bg border-white/20">
                <SelectItem value="Perda de peso">Perda de peso</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Ganho de massa">Ganho de massa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white/80 text-sm mb-2 block">Preferências Alimentares</label>
            <Select value={preferencias} onValueChange={onPreferenciasChange}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-dark-bg border-white/20">
                <SelectItem value="vegano">Vegano</SelectItem>
                <SelectItem value="low-carb">Low Carb</SelectItem>
                <SelectItem value="sem-gluten">Sem Glúten</SelectItem>
                <SelectItem value="vegetariano">Vegetariano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white/80 text-sm mb-2 block">
              Calorias Máx.: {caloriesMax[0]} kcal
            </label>
            <Slider
              value={caloriesMax}
              onValueChange={onCaloriesMaxChange}
              max={800}
              min={200}
              step={50}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
