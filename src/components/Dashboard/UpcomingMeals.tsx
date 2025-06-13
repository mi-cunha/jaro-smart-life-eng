
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Utensils } from "lucide-react";

interface Meal {
  nome: string;
  horario: string;
  calorias: number;
}

interface UpcomingMealsProps {
  refeicoes: Meal[];
}

export function UpcomingMeals({ refeicoes }: UpcomingMealsProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Utensils className="w-5 h-5 text-neon-green" />
          Upcoming Meals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {refeicoes.map((refeicao, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                <div>
                  <h3 className="text-white font-medium">{refeicao.nome}</h3>
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Clock className="w-3 h-3" />
                    <span>{refeicao.horario}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-neon-green font-semibold">{refeicao.calorias}</span>
                <span className="text-white/60 text-sm ml-1">kcal</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
