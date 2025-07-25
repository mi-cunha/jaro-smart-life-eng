
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Coffee, Heart, TrendingUp } from "lucide-react";
import { useWeightUnit } from "@/hooks/useWeightUnit";

interface MonthlySummaryProps {
  activeDays: number;
  teaDoses: number;
  recipesConsumed: number;
  weightLost: number;
}

export function MonthlySummary({ activeDays, teaDoses, recipesConsumed, weightLost }: MonthlySummaryProps) {
  const { formatWeight } = useWeightUnit();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-dark-bg border-white/10">
        <CardContent className="p-6 text-center">
          <Calendar className="w-8 h-8 text-neon-green mx-auto mb-3" />
          <div className="text-2xl font-bold text-neon-green">{activeDays}</div>
          <div className="text-sm text-white/70">Active days this month</div>
        </CardContent>
      </Card>
      <Card className="bg-dark-bg border-white/10">
        <CardContent className="p-6 text-center">
          <Coffee className="w-8 h-8 text-neon-green mx-auto mb-3" />
          <div className="text-2xl font-bold text-neon-green">{teaDoses}</div>
          <div className="text-sm text-white/70">Tea doses taken</div>
        </CardContent>
      </Card>
      <Card className="bg-dark-bg border-white/10">
        <CardContent className="p-6 text-center">
          <Heart className="w-8 h-8 text-neon-green mx-auto mb-3" />
          <div className="text-2xl font-bold text-neon-green">{recipesConsumed}</div>
          <div className="text-sm text-white/70">Favorited recipes</div>
        </CardContent>
      </Card>
      <Card className="bg-dark-bg border-white/10">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-neon-green mx-auto mb-3" />
          <div className="text-2xl font-bold text-neon-green">{formatWeight(weightLost, false)}</div>
          <div className="text-sm text-white/70">Lost since start</div>
        </CardContent>
      </Card>
    </div>
  );
}
