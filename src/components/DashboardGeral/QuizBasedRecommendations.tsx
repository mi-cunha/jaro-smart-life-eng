
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuizData } from "@/hooks/useQuizData";
import { 
  Heart, 
  Utensils, 
  Shield, 
  Zap,
  Clock,
  DollarSign,
  AlertTriangle
} from "lucide-react";

export function QuizBasedRecommendations() {
  const navigate = useNavigate();
  const { quizData, hasQuizData } = useQuizData();

  if (!hasQuizData || !quizData) {
    return null;
  }

  const {
    healthGoals,
    dietaryRestrictions,
    mealPreferences,
    cookingFrequency,
    budgetRange,
    healthConditions,
    supplementUsage
  } = quizData;

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-neon-green" />
          Your Health Profile Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Health Goals */}
        {healthGoals && healthGoals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Health Goals
            </h4>
            <div className="flex flex-wrap gap-2">
              {healthGoals.map((goal, index) => (
                <Badge key={index} className="bg-neon-green/20 text-neon-green border-neon-green/30">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Restrictions */}
        {dietaryRestrictions && dietaryRestrictions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Dietary Restrictions
            </h4>
            <div className="flex flex-wrap gap-2">
              {dietaryRestrictions.map((restriction, index) => (
                <Badge key={index} className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {restriction}
                </Badge>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-white border-white/20 hover:bg-white/5"
              onClick={() => navigate('/gerador-receitas')}
            >
              Generate Compatible Recipes
            </Button>
          </div>
        )}

        {/* Meal Preferences */}
        {mealPreferences && mealPreferences.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Meal Preferences
            </h4>
            <div className="flex flex-wrap gap-2">
              {mealPreferences.map((preference, index) => (
                <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {preference}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cooking & Budget Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cookingFrequency && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">Cooking Frequency</span>
              </div>
              <div className="text-white font-medium">{cookingFrequency}</div>
              {cookingFrequency === 'rarely' && (
                <div className="text-xs text-neon-green mt-1">
                  We'll focus on quick, simple recipes for you!
                </div>
              )}
            </div>
          )}

          {budgetRange && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">Budget Range</span>
              </div>
              <div className="text-white font-medium">{budgetRange}</div>
            </div>
          )}
        </div>

        {/* Health Conditions Alert */}
        {healthConditions && healthConditions.length > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Health Considerations</span>
            </div>
            <div className="space-y-1">
              {healthConditions.map((condition, index) => (
                <div key={index} className="text-sm text-white/80">• {condition}</div>
              ))}
            </div>
            <div className="text-xs text-yellow-400 mt-2">
              Our recommendations will consider these health factors
            </div>
          </div>
        )}

        {/* Supplement Usage */}
        {supplementUsage && (
          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-sm text-white/80 mb-1">Supplement Usage</div>
            <div className="text-white font-medium">{supplementUsage}</div>
            {supplementUsage === 'regularly' && (
              <div className="text-xs text-neon-green mt-1">
                Great! We'll complement your supplement routine with targeted nutrition
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
