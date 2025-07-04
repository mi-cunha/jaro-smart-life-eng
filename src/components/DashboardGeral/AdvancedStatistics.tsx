
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QuizBasedRecommendations } from "./QuizBasedRecommendations";
import { BarChart } from "lucide-react";

interface AdvancedStatisticsProps {
  habitsWeekly: any[];
}

export function AdvancedStatistics({ habitsWeekly }: AdvancedStatisticsProps) {
  // Generate full week data (Sunday to Saturday)
  const generateWeekData = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekData = [];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Create data for all 7 days of the week
    for (let i = 0; i < 7; i++) {
      const dayIndex = i;
      const dayName = dayNames[dayIndex];
      
      // Find matching data from habitsWeekly
      const matchingData = habitsWeekly.find(day => {
        const dayOfWeek = new Date(day.date).getDay();
        return dayOfWeek === dayIndex;
      });
      
      const completionRate = matchingData && matchingData.total > 0 
        ? (matchingData.completed / matchingData.total) * 100 
        : 0;
      
      weekData.push({
        dayName,
        completionRate,
        hasData: !!matchingData
      });
    }
    
    return weekData;
  };

  const weekData = generateWeekData();

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Habits Weekly Progress - Full Width */}
      <Card className="bg-dark-bg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart className="w-5 h-5 text-neon-green" />
            Weekly Habits Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weekData.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white/80 text-sm w-20">
                  {day.dayName}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        day.hasData ? 'bg-neon-green' : 'bg-white/20'
                      }`}
                      style={{ width: `${day.completionRate}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium min-w-[3rem] ${
                    day.hasData ? 'text-white' : 'text-white/40'
                  }`}>
                    {Math.round(day.completionRate)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz-Based Recommendations - Full Width */}
      <div>
        <QuizBasedRecommendations />
      </div>
    </div>
  );
}
