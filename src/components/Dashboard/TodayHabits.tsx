
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface Habit {
  nome: string;
  concluido: boolean;
}

interface TodayHabitsProps {
  habitos: Habit[];
}

export function TodayHabits({ habitos }: TodayHabitsProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-neon-green" />
          Hábitos de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habitos.map((habito, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className={habito.concluido ? "text-neon-green" : "text-white/70"}>
                {habito.nome}
              </span>
              {habito.concluido ? (
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                  Concluído ✓
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/30 text-white/60">
                  Pendente
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
