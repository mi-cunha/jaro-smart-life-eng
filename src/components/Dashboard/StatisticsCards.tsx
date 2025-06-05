
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, CheckCircle, BarChart3 } from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 border-neon-green/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neon-green/80 text-sm font-medium">Peso Atual</p>
              <h3 className="text-2xl font-bold text-neon-green">{pesoAtual}kg</h3>
            </div>
            <Target className="h-8 w-8 text-neon-green" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dark-bg border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Meta</p>
              <h3 className="text-2xl font-bold text-white">{pesoMeta}kg</h3>
            </div>
            <TrendingUp className="h-8 w-8 text-white/70" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dark-bg border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Hábitos Hoje</p>
              <h3 className="text-2xl font-bold text-white">{habitosConcluidos}/{totalHabitos}</h3>
            </div>
            <CheckCircle className="h-8 w-8 text-white/70" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400/80 text-sm font-medium">Progresso</p>
              <h3 className="text-2xl font-bold text-purple-400">{progressoPeso.toFixed(0)}%</h3>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
