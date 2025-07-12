
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scale, CheckCircle2 } from "lucide-react";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { usePesoContext } from "@/contexts/PesoContext";

interface ProgressSectionProps {
  progressoPeso: number;
  pesoAtual: number | null;
  pesoMeta: number | null;
  habitosConcluidos: number;
  totalHabitos: number;
}

export function ProgressSection({
  progressoPeso,
  pesoAtual,
  pesoMeta,
  habitosConcluidos,
  totalHabitos
}: ProgressSectionProps) {
  const { formatWeight, convertToDisplayWeight } = useWeightUnit();
  const { historicoPeso } = usePesoContext();
  const percentualHabitos = totalHabitos > 0 ? (habitosConcluidos / totalHabitos) * 100 : 0;
  
  const currentWeight = pesoAtual ? convertToDisplayWeight(pesoAtual) : null;
  const goalWeight = pesoMeta ? convertToDisplayWeight(pesoMeta) : null;
  
  // Calculate initial weight from history
  const initialWeight = historicoPeso.length > 0 ? 
    convertToDisplayWeight(historicoPeso[historicoPeso.length - 1].peso) : 
    currentWeight;
  
  // Calculate remaining weight to lose - only if we have both values
  const remainingWeight = currentWeight && goalWeight ? Math.max(0, currentWeight - goalWeight) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-dark-bg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-neon-green" />
            Weight Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressoPeso} className="h-3" />
          <div className="text-center">
            <span className="text-neon-green font-semibold text-lg">
              {progressoPeso.toFixed(1)}%
            </span>
            <p className="text-white/60 text-sm">
              {remainingWeight ? `${formatWeight(remainingWeight, false)} remaining` : "No data available"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dark-bg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            Today's Habits Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm text-white/70">
            <span>Completed: {habitosConcluidos}</span>
            <span>Total: {totalHabitos}</span>
          </div>
          <Progress value={percentualHabitos} className="h-3" />
          <div className="text-center">
            <span className="text-purple-400 font-semibold text-lg">
              {percentualHabitos.toFixed(0)}%
            </span>
            <p className="text-white/60 text-sm">
              {totalHabitos - habitosConcluidos} habits remaining
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
