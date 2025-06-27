
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Medal {
  name: string;
  icon: string;
  achieved: boolean;
}
interface AchievementsMedalsProps {
  medals: Medal[];
}

export function AchievementsMedals({ medals }: AchievementsMedalsProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-neon-green" />
          Achievements & Medals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {medals.map((medal, index) => (
            <div
              key={index}
              className={`text-center p-4 rounded-lg border transition-all ${
                medal.achieved
                  ? 'bg-neon-green/10 border-neon-green/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="text-3xl mb-2">{medal.icon}</div>
              <div className={`text-sm font-medium ${
                medal.achieved ? 'text-neon-green' : 'text-white/60'
              }`}>
                {medal.name}
              </div>
              {medal.achieved && (
                <Badge className="mt-2 bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                  Achieved
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
