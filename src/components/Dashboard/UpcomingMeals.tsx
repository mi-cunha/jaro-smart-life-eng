
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

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
          <Calendar className="w-5 h-5 text-neon-green" />
          Próximas Refeições
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {refeicoes.map((refeicao, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <h4 className="text-white font-medium">{refeicao.nome}</h4>
                <p className="text-white/60 text-sm">{refeicao.horario}</p>
              </div>
              <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                {refeicao.calorias} kcal
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
