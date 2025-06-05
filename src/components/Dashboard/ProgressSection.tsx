
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

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
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-neon-green" />
          Resumo do Progresso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80">Progresso do Peso</span>
            <span className="text-neon-green font-semibold">{progressoPeso.toFixed(1)}%</span>
          </div>
          <Progress value={progressoPeso} className="h-2" />
          <p className="text-sm text-white/60 mt-1">
            Faltam apenas {(pesoAtual - pesoMeta).toFixed(1)}kg para sua meta!
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80">Hábitos Diários</span>
            <span className="text-neon-green font-semibold">
              {((habitosConcluidos / totalHabitos) * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={(habitosConcluidos / totalHabitos) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
