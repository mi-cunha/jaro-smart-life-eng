
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ObjectivesSectionProps {
  perfil: any;
  onChangeObjetivo: (objetivo: string, valor: string) => void;
}

export function ObjectivesSection({ perfil, onChangeObjetivo }: ObjectivesSectionProps) {
  const { convertToDisplayWeight, convertToStorageWeight, formatWeight, unit } = useWeightUnit();
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const { user } = useAuth();

  // Fetch current weight from preferencias_usuario
  useEffect(() => {
    const fetchCurrentWeight = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('preferencias_usuario')
          .select('preferencias_alimentares')
          .eq('user_email', user.email)
          .single();

        if (!error && data?.preferencias_alimentares) {
          const prefs = data.preferencias_alimentares as any;
          setCurrentWeight(prefs.currentWeight || null);
        }
      } catch (err) {
        console.error('Error fetching current weight:', err);
      }
    };

    fetchCurrentWeight();
  }, [user?.email]);

  const calculateHealthPlan = async () => {
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
            <Label className="text-white/80">Daily Tea Doses Goal</Label>
            <Input
              type="number"
              value={perfil?.doses_cha || 2}
              className="bg-white/5 border-white/20 text-white"
              readOnly
            />
            <div className="text-xs text-white/60">
              Set in your profile preferences
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Daily Calories Goal</Label>
            <Input
              type="number"
              value={perfil?.calorias_diarias || 2000}
              className="bg-white/5 border-white/20 text-white"
              readOnly
            />
            <div className="text-xs text-white/60">
              {perfil?.calorias_diarias ? 'Calculated based on your profile' : 'Default value - calculate your personalized plan'}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Daily Water Goal</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={perfil?.copos_diarios || 8}
                className="bg-white/5 border-white/20 text-white"
                readOnly
              />
              <span className="text-white/60 text-sm self-center">cups</span>
            </div>
            <div className="text-xs text-white/60">
              {perfil?.agua_diaria_ml ? `${perfil.agua_diaria_ml}ml total - Calculated based on your weight` : 'Default value - calculate your personalized plan'}
            </div>
          </div>
        </div>
        
        {/* Calculate Health Plan Button */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <Button
            onClick={calculateHealthPlan}
            disabled={isCalculating || !currentWeight}
            className="w-full bg-neon-green hover:bg-neon-green/80 text-black font-medium disabled:opacity-50"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? 'Calculating...' : 'Calculate Personalized Health Plan'}
          </Button>
          <div className="text-xs text-white/60 mt-2 text-center">
            {!currentWeight 
              ? 'Please set your current weight in preferences to calculate your plan'
              : 'This will calculate your daily calories and water intake based on your weight and activity level'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
