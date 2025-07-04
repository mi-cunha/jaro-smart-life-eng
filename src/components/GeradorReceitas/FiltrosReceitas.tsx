
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FiltrosReceitasProps {
  objetivo: string;
  caloriesMax: number[];
  onObjetivoChange: (value: string) => void;
  onCaloriesMaxChange: (value: number[]) => void;
}

export function FiltrosReceitas({
  objetivo,
  caloriesMax,
  onObjetivoChange,
  onCaloriesMaxChange
}: FiltrosReceitasProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Goal</label>
            <Select value={objetivo} onValueChange={onObjetivoChange}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-bg border-white/20">
                <SelectItem value="Weight loss">Weight loss</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Muscle gain">Muscle gain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white/80 text-sm mb-2 block">
              Max Calories: {caloriesMax[0]} kcal
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
