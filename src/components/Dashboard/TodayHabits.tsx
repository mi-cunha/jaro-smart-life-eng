
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useHabitos } from "@/hooks/useHabitos";
import { useEffect } from "react";

interface Habit {
  nome: string;
  concluido: boolean;
}

interface TodayHabitsProps {
  habitos: Habit[];
}

export function TodayHabits({ habitos: initialHabitos }: TodayHabitsProps) {
  const { getHabitosHoje, marcarHabito, loading, carregarHabitos } = useHabitos();
  
  // Use real-time data from the hook
  const habitosAtuais = getHabitosHoje();

  const handleToggleHabito = async (habitoId: string, concluido: boolean) => {
    await marcarHabito(habitoId, !concluido);
    // Force refresh to ensure UI updates immediately
    setTimeout(() => {
      carregarHabitos();
    }, 500);
  };

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-neon-green" />
          Today's Habits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habitosAtuais.map((habito) => (
            <div key={habito.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className={habito.concluido ? "text-neon-green" : "text-white/70"}>
                {habito.nome}
              </span>
              <div className="flex items-center gap-2">
                {habito.concluido ? (
                  <Badge 
                    className="bg-neon-green/20 text-neon-green border-neon-green/30 cursor-pointer hover:bg-neon-green/30 transition-colors"
                    onClick={() => handleToggleHabito(habito.id, habito.concluido)}
                  >
                    Completed ✓
                  </Badge>
                ) : (
                  <Badge 
                    variant="outline" 
                    className="border-white/30 text-white/60 cursor-pointer hover:border-neon-green/30 hover:text-neon-green transition-colors"
                    onClick={() => handleToggleHabito(habito.id, habito.concluido)}
                  >
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        {loading && (
          <div className="text-center text-white/60 py-2">
            Loading habits...
          </div>
        )}
        {habitosAtuais.length === 0 && !loading && (
          <div className="text-center text-white/60 py-4">
            No habits configured for today
          </div>
        )}
      </CardContent>
    </Card>
  );
}
