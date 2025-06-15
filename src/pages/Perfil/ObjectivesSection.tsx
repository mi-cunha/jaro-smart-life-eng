
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useState, useEffect } from "react";

interface ObjectivesSectionProps {
  perfil: any;
  onChangeObjetivo: (objetivo: string, valor: string) => void;
}

export function ObjectivesSection({ perfil, onChangeObjetivo }: ObjectivesSectionProps) {
  const { convertToDisplayWeight, convertToStorageWeight, formatWeight, unit } = useWeightUnit();
  const [displayWeight, setDisplayWeight] = useState("");

  useEffect(() => {
    if (perfil.peso_objetivo) {
      const converted = convertToDisplayWeight(perfil.peso_objetivo);
      setDisplayWeight(converted.toFixed(1));
    }
  }, [perfil.peso_objetivo, unit]);

  const handleWeightChange = (value: string) => {
    setDisplayWeight(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const storageWeight = convertToStorageWeight(numValue);
      onChangeObjetivo('peso_objetivo', storageWeight.toString());
    }
  };

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Goals & Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pesoObjetivo" className="text-white/80">Target Weight ({unit})</Label>
            <Input
              id="pesoObjetivo"
              type="number"
              value={displayWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="habitosDiarios" className="text-white/80">Daily Habits Goal</Label>
            <Input
              id="habitosDiarios"
              type="number"
              value={perfil.habitos_diarios}
              onChange={(e) => onChangeObjetivo('habitos_diarios', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosesCha" className="text-white/80">Daily Tea Doses Goal</Label>
            <Input
              id="dosesCha"
              type="number"
              value={perfil.doses_cha}
              onChange={(e) => onChangeObjetivo('doses_cha', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caloriasDiarias" className="text-white/80">Daily Calories Goal</Label>
            <Input
              id="caloriasDiarias"
              type="number"
              value={perfil.calorias_diarias}
              onChange={(e) => onChangeObjetivo('calorias_diarias', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
