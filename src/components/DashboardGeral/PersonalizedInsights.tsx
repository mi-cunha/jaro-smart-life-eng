
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuizData } from "@/hooks/useQuizData";
import { 
  Target, 
  Heart, 
  Scale, 
  ChefHat, 
  CheckCircle,
  ArrowRight,
  User,
  Activity
} from "lucide-react";

const iconMap = {
  scale: Scale,
  chef: ChefHat,
  heart: Heart,
  check: CheckCircle,
  target: Target
};

export function PersonalizedInsights() {
  const navigate = useNavigate();
  const { 
    quizData, 
    loading, 
    getPersonalizedMessage, 
    getRecommendedActions,
    getPersonalizedStats,
    hasQuizData 
  } = useQuizData();

  if (loading) {
    return (
      <Card className="bg-dark-bg border-white/10">
        <CardContent className="p-6">
          <div className="text-white/60">Loading personalized insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (!hasQuizData) {
    return (
      <Card className="bg-dark-bg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-neon-green" />
            Complete Your Health Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/80">
            Take our quick health assessment to get personalized recommendations for your wellness journey.
          </p>
          <Button 
            onClick={() => navigate('/quiz')} 
            className="bg-neon-green text-black hover:bg-neon-green/80"
          >
            Take Health Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const recommendedActions = getRecommendedActions();
  const personalizedStats = getPersonalizedStats();

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Message */}
      <Card className="bg-gradient-to-r from-neon-green/10 to-blue-500/10 border-neon-green/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-6 h-6 text-neon-green" />
            <h3 className="text-lg font-semibold text-white">Your Personalized Plan</h3>
          </div>
          <p className="text-white/90 text-base leading-relaxed">
            {getPersonalizedMessage()}
          </p>
          
          {/* User Profile Summary */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quizData?.age && (
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                Age: {quizData.age}
              </Badge>
            )}
            {quizData?.gender && (
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                {quizData.gender}
              </Badge>
            )}
            {quizData?.activityLevel && (
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                <Activity className="w-3 h-3 mr-1" />
                {quizData.activityLevel} activity
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Stats */}
      {personalizedStats && (
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-green" />
              Your Personalized Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-neon-green">
                  {personalizedStats.recommendedCalories}
                </div>
                <div className="text-sm text-white/70">Daily Calories</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-neon-green">
                  {personalizedStats.recommendedWater}
                </div>
                <div className="text-sm text-white/70">Glasses of Water</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-neon-green">
                  {personalizedStats.recommendedTeaDoses}
                </div>
                <div className="text-sm text-white/70">Tea Doses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      <Card className="bg-dark-bg border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recommended Actions for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedActions.slice(0, 4).map((action, index) => {
              const IconComponent = iconMap[action.icon] || Target;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-neon-green/50 hover:bg-white/5 ${
                    action.priority === 'high' 
                      ? 'border-neon-green/30 bg-neon-green/5' 
                      : 'border-white/10 bg-white/5'
                  }`}
                  onClick={() => navigate(action.link)}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 text-neon-green mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{action.title}</h4>
                      <p className="text-sm text-white/70">{action.description}</p>
                      {action.priority === 'high' && (
                        <Badge className="mt-2 bg-neon-green/20 text-neon-green border-neon-green/30">
                          Priority
                        </Badge>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
