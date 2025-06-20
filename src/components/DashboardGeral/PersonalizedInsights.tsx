
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Droplets, Coffee, Target } from "lucide-react";
import { useQuizData } from "@/hooks/useQuizData";
import { useRealDashboardData } from "@/hooks/useRealDashboardData";

export function PersonalizedInsights() {
  const { hasQuizData, getPersonalizedMessage, getRecommendedActions } = useQuizData();
  const { stats } = useRealDashboardData();
  
  const recommendedActions = getRecommendedActions();
  
  if (!hasQuizData) {
    return (
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5" />
            Complete Your Health Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 mb-4">
            Take our personalized health quiz to unlock intelligent recommendations for calories, hydration, and tea consumption based on your unique profile.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-purple-400 text-purple-300">
              🎯 Personalized Goals
            </Badge>
            <Badge variant="outline" className="border-blue-400 text-blue-300">
              📊 Smart Analytics
            </Badge>
            <Badge variant="outline" className="border-green-400 text-green-300">
              🔬 AI-Powered Insights
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-neon-green/10 to-blue-500/10 border-neon-green/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5" />
            Your Personalized Health Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 mb-4">{getPersonalizedMessage()}</p>
          
          {/* Smart Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-neon-green" />
                <span className="text-sm font-medium text-white">Daily Calories</span>
              </div>
              <div className="text-2xl font-bold text-neon-green">
                {stats.recommendedCalories}
              </div>
              <div className="text-xs text-white/60">Personalized target</div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Water Intake</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {stats.recommendedWater}
              </div>
              <div className="text-xs text-white/60">Glasses per day</div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coffee className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-white">Jaro Tea</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {stats.recommendedTeaDoses}
              </div>
              <div className="text-xs text-white/60">Doses per day</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {recommendedActions.slice(0, 3).map((action, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="border-neon-green/30 text-neon-green"
              >
                {action.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
