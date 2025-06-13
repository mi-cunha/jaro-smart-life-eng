
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Target, CheckCircle2, TrendingUp } from "lucide-react";

interface StatisticsCardsProps {
  pesoAtual: number;
  pesoMeta: number;
  habitosConcluidos: number;
  totalHabitos: number;
  progressoPeso: number;
}

export function StatisticsCards({
  pesoAtual,
  pesoMeta,
  habitosConcluidos,
  totalHabitos,
  progressoPeso
}: StatisticsCardsProps) {
  const percentualHabitos = totalHabitos > 0 ? (habitosConcluidos / totalHabitos) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 border-neon-green/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Current Weight</p>
              <p className="text-2xl font-bold text-white">{pesoAtual} kg</p>
            </div>
            <Scale className="w-8 h-8 text-neon-green" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Goal Weight</p>
              <p className="text-2xl font-bold text-white">{pesoMeta} kg</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Today's Habits</p>
              <p className="text-2xl font-bold text-white">{habitosConcluidos}/{totalHabitos}</p>
              <p className="text-sm text-white/60">{percentualHabitos.toFixed(0)}% completed</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-purple-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Weight Progress</p>
              <p className="text-2xl font-bold text-white">{progressoPeso.toFixed(1)}%</p>
              <p className="text-sm text-white/60">towards goal</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
