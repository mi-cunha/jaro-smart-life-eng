
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressChart } from "@/components/ProgressChart";
import { QuizBasedRecommendations } from "./QuizBasedRecommendations";
import { TrendingUp, BarChart } from "lucide-react";

interface AdvancedStatisticsProps {
  weightData: any[];
  habitsWeekly: any[];
}

export function AdvancedStatistics({ weightData, habitsWeekly }: AdvancedStatisticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weight Progress Chart */}
      <Card className="bg-dark-bg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-green" />
            Weight Progress Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart data={weightData} />
        </CardContent>
      </Card>

      {/* Habits Weekly Progress */}
      <Card className="bg-dark-bg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart className="w-5 h-5 text-neon-green" />
            Weekly Habits Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {habitsWeekly.length > 0 ? (
              habitsWeekly.slice(0, 5).map((day, index) => {
                const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neon-green transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium min-w-[3rem]">
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-white/60 text-center py-4">
                No habit data available for this week
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz-Based Recommendations - Full Width */}
      <div className="lg:col-span-2">
        <QuizBasedRecommendations />
      </div>
    </div>
  );
}
