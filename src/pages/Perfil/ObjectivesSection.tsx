
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator } from "lucide-react";

interface ObjectivesSectionProps {
  perfil: any;
  onChangeObjetivo: (objetivo: string, valor: string) => void;
}

export function ObjectivesSection({ perfil, onChangeObjetivo }: ObjectivesSectionProps) {
  const { convertToDisplayWeight, convertToStorageWeight, formatWeight, unit } = useWeightUnit();
  const [displayWeight, setDisplayWeight] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (perfil?.peso_objetivo) {
      const converted = convertToDisplayWeight(perfil.peso_objetivo);
      setDisplayWeight(converted.toFixed(1));
    }
  }, [perfil?.peso_objetivo, unit]);

  const handleWeightChange = (value: string) => {
    setDisplayWeight(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const storageWeight = convertToStorageWeight(numValue);
      onChangeObjetivo('peso_objetivo', storageWeight.toString());
    }
  };

  const handleWeightBlur = () => {
    const numValue = parseFloat(displayWeight);
    if (!isNaN(numValue) && numValue > 0) {
      const storageWeight = convertToStorageWeight(numValue);
      onChangeObjetivo('peso_objetivo', storageWeight.toString());
    }
  };

  const calculateHealthPlan = async () => {
    if (!perfil?.peso_atual) {
      toast.error('Please set your current weight first');
      return;
    }

    setIsCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-health-plan');
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Health plan calculated successfully!');
        // Trigger a refresh of the profile data
        window.location.reload();
      } else {
        throw new Error(data?.error || 'Calculation failed');
      }
    } catch (error) {
      console.error('Error calculating health plan:', error);
      toast.error('Failed to calculate health plan');
    } finally {
      setIsCalculating(false);
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
              onBlur={handleWeightBlur}
              className="bg-white/5 border-white/20 text-white"
              step="0.1"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="habitosDiarios" className="text-white/80">Daily Habits Goal</Label>
            <Input
              id="habitosDiarios"
              type="number"
              value={perfil?.habitos_diarios || 8}
              onChange={(e) => onChangeObjetivo('habitos_diarios', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dosesCha" className="text-white/80">Daily Tea Doses Goal</Label>
            <Input
              id="dosesCha"
              type="number"
              value={perfil?.doses_cha || 2}
              onChange={(e) => onChangeObjetivo('doses_cha', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caloriasDiarias" className="text-white/80">Daily Calories Goal</Label>
            <Input
              id="caloriasDiarias"
              type="number"
              value={perfil?.calorias_diarias || 2000}
              onChange={(e) => onChangeObjetivo('calorias_diarias', e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              min="1000"
              readOnly
            />
            <div className="text-xs text-white/60">
              {perfil?.calorias_diarias ? 'Calculated based on your profile' : 'Default value - complete your profile for personalized calculation'}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aguaDiaria" className="text-white/80">Daily Water Goal</Label>
            <div className="flex gap-2">
              <Input
                id="aguaDiaria"
                type="number"
                value={perfil?.copos_diarios || 8}
                className="bg-white/5 border-white/20 text-white"
                readOnly
              />
              <span className="text-white/60 text-sm self-center">cups</span>
            </div>
            <div className="text-xs text-white/60">
              {perfil?.agua_diaria_ml ? `${perfil.agua_diaria_ml}ml total - Calculated based on your weight` : 'Default value - complete your profile for personalized calculation'}
            </div>
          </div>
        </div>
        
        {/* Calculate Health Plan Button */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <Button
            onClick={calculateHealthPlan}
            disabled={isCalculating || !perfil?.peso_atual}
            className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-medium"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? 'Calculating...' : 'Calculate Personalized Health Plan'}
          </Button>
          <div className="text-xs text-white/60 mt-2 text-center">
            This will calculate your daily calories and water intake based on your current weight and activity level
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
