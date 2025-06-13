
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scale, CheckCircle2 } from "lucide-react";

interface ProgressSectionProps {
  progressoPeso: number;
  pesoAtual: number;
  pesoMeta: number;
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
  const percentualHabitos = totalHabitos > 0 ? (habitosConcluidos / totalHabitos) * 100 : 0;

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
          <div className="flex justify-between text-sm text-white/70">
            <span>Current: {pesoAtual} kg</span>
            <span>Goal: {pesoMeta} kg</span>
          </div>
          <Progress value={progressoPeso} className="h-3" />
          <div className="text-center">
            <span className="text-neon-green font-semibold text-lg">
              {progressoPeso.toFixed(1)}%
            </span>
            <p className="text-white/60 text-sm">
              {(pesoAtual - pesoMeta).toFixed(1)} kg remaining
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
