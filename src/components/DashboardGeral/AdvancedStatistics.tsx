
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle } from "lucide-react";
import { ProgressChart } from "@/components/ProgressChart";

interface ChartData {
  date: string;
  value: number;
}

interface WeeklyData {
  date: string;
  percentual: number;
}

interface AdvancedStatisticsProps {
  weightData: ChartData[];
  habitsWeekly: WeeklyData[];
}

export function AdvancedStatistics({ weightData, habitsWeekly }: AdvancedStatisticsProps) {
  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Advanced Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {weightData.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-green" />
              Weight Evolution (Last 2 weeks)
            </h3>
            <div className="h-64">
              <ProgressChart
                title=""
                data={weightData}
                type="line"
                unit=" kg"
              />
            </div>
          </div>
        )}
        {habitsWeekly.length > 0 && (
          <div>
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-neon-green" />
              Habit Completion (Last 4 weeks)
            </h3>
            <div className="h-64">
              <ProgressChart
                title=""
                data={habitsWeekly.map(item => ({
                  date: item.date,
                  value: item.percentual
                }))}
                type="bar"
                unit="%"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
