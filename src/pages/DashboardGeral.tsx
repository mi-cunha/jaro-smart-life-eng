import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  CheckCircle, 
  Scale, 
  ShoppingCart, 
  Trophy,
  Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePeso } from "@/hooks/usePeso";
import { useHabitos } from "@/hooks/useHabitos";
import { useSupabaseReceitas } from "@/hooks/useSupabaseReceitas";
import { useSupabaseListaCompras } from "@/hooks/useSupabaseListaCompras";
import { useEffect, useState } from "react";
import { ProgressCards } from "@/components/DashboardGeral/ProgressCards";
import { AdvancedStatistics } from "@/components/DashboardGeral/AdvancedStatistics";
import { AchievementsMedals } from "@/components/DashboardGeral/AchievementsMedals";
import { ImprovementSuggestions } from "@/components/DashboardGeral/ImprovementSuggestions";
import { MonthlySummary } from "@/components/DashboardGeral/MonthlySummary";
import { DashboardActions } from "@/components/DashboardGeral/DashboardActions";
import { PersonalizedInsights } from "@/components/DashboardGeral/PersonalizedInsights";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useQuizData } from "@/hooks/useQuizData";
import { useRealDashboardData } from "@/hooks/useRealDashboardData";

const GeneralDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { pesoAtual, pesoMeta, getProgressoPeso } = usePeso();
  const { getHabitosHoje, getProgressoHabitos, getHistoricoSemanal } = useHabitos();
  const { receitas, loading: loadingReceitas } = useSupabaseReceitas();
  const { itensCompra, loading: loadingCompras } = useSupabaseListaCompras();
  const { convertToDisplayWeight, formatWeight, unit } = useWeightUnit();
  const { getPersonalizedStats, hasQuizData } = useQuizData();
  const { stats: realStats, loading: loadingStats } = useRealDashboardData();
  
  const [historicoSemanal, setHistoricoSemanal] = useState<any[]>([]);
  
  const habitosHoje = getHabitosHoje();
  const progressoHabitos = getProgressoHabitos();
  const progressoPeso = getProgressoPeso();

  useEffect(() => {
    const loadHistorico = async () => {
      const data = await getHistoricoSemanal();
      setHistoricoSemanal(data);
    };
    loadHistorico();
  }, []);

  // Flatten all comidas and compras arrays
  const allReceitas = Object.values(receitas || {}).flat();
  const allItens = Object.values(itensCompra || {}).flat();

  // Use real statistics
  const habitosConcluidos = habitosHoje.filter(h => h.concluido).length;
  const totalHabitos = habitosHoje.length;

  // Calculate weight loss progress - convert to display units
  const currentWeightDisplay = convertToDisplayWeight(pesoAtual || 165);
  const goalWeightDisplay = convertToDisplayWeight(pesoMeta || 150);
  const weightLostDisplay = convertToDisplayWeight(realStats.weightLostSinceStart);

  // Progress cards with real data
  const progressoCards = [
    {
      title: "Jaro Tea",
      icon: <Coffee className="w-6 h-6 text-neon-green" />,
      value: `${realStats.teaDosesThisMonth}/${realStats.recommendedTeaDoses * 30}`,
      description: hasQuizData ? "Personalized doses this month" : "Doses consumed this month",
      progress: Math.min(100, (realStats.teaDosesThisMonth / (realStats.recommendedTeaDoses * 30)) * 100),
      link: "/cha-jaro"
    },
    {
      title: "Habits",
      icon: <CheckCircle className="w-6 h-6 text-neon-green" />,
      value: `${Math.round(realStats.habitCompletionRate)}%`,
      description: "Monthly completion rate",
      progress: Math.round(realStats.habitCompletionRate),
      link: "/habit-tracker"
    },
    {
      title: "Weight",
      icon: <Scale className="w-6 h-6 text-neon-green" />,
      value: pesoAtual && pesoMeta ? `${formatWeight(Math.abs(currentWeightDisplay - goalWeightDisplay), false)} ${unit} remaining` : "Set goal",
      description: "To reach your objective",
      progress: progressoPeso,
      link: "/progresso-peso"
    },
    {
      title: "Favorited Recipes",
      icon: <Heart className="w-6 h-6 text-neon-green" />,
      value: `${realStats.favoritedRecipesCount}`,
      description: hasQuizData ? "Personalized favorite recipes" : "Recipes marked as favorites",
      progress: Math.min(100, (realStats.favoritedRecipesCount / 10) * 100),
      link: "/gerador-receitas"
    },
    {
      title: "Shopping",
      icon: <ShoppingCart className="w-6 h-6 text-neon-green" />,
      value: `$${realStats.monthlySpending.toFixed(2)}`,
      description: "Estimated monthly expenses",
      progress: 0,
      link: "/lista-compras"
    },
    {
      title: "Achievements",
      icon: <Trophy className="w-6 h-6 text-neon-green" />,
      value: `${Math.floor(progressoPeso / 15)} medals`,
      description: "Objectives achieved",
      progress: 0,
      link: "#"
    }
  ];

  // Top 5 recipes - removed since there's no real consumption tracking data

  // Real achievements based on user data
  const medalhas = [
    { name: "7 Days of Tea", icon: "🏅", achieved: realStats.teaDosesThisMonth >= 7 },
    { name: "30 Days of Habits", icon: "🏆", achieved: realStats.habitCompletionRate >= 80 },
    { name: "Weight Goal", icon: "🎯", achieved: progressoPeso >= 100 },
    { name: "Recipe Master", icon: "👨‍🍳", achieved: realStats.favoritedRecipesCount >= 5 },
    { name: "Smart Shopper", icon: "🛒", achieved: allItens.length >= 20 },
    { name: "Iron Streak", icon: "💪", achieved: realStats.habitCompletionRate >= 90 },
    { name: "Health Champion", icon: "❤️", achieved: progressoPeso >= 50 && realStats.habitCompletionRate >= 70 }
  ];

  const improvementSuggestions = [];
  if (realStats.habitCompletionRate < 80) {
    improvementSuggestions.push("Your habit completion rate has decreased this week. Try setting reminders during meals!");
  }
  if (realStats.favoritedRecipesCount < 5) {
    improvementSuggestions.push("Consider favoriting more recipes to make it easier to access your favorites.");
  }
  if (progressoPeso < 50 && pesoAtual && pesoMeta) {
    improvementSuggestions.push("You're approaching your weight goal. Consider increasing hydration to boost metabolism.");
  }
  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push("Great progress! Keep maintaining your current routine for optimal results.");
  }

  if (loadingStats) {
    return (
      <Layout title="General Dashboard" breadcrumb={["Home", "General Dashboard"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="General Dashboard" breadcrumb={["Home", "General Dashboard"]}>
      <div className="space-y-8">
        {/* Personalized Insights - New Section */}
        <PersonalizedInsights />
        
        {/* Main Progress Cards */}
        <ProgressCards cards={progressoCards} />
        
        {/* Advanced Statistics */}
        <AdvancedStatistics habitsWeekly={historicoSemanal} />
        
        {/* Achievements & Medals */}
        <AchievementsMedals medals={medalhas} />
        
        {/* Personalized Improvement Suggestions */}
        <ImprovementSuggestions suggestions={improvementSuggestions} />
        
        {/* Monthly Summary with Real Data */}
        <MonthlySummary
          activeDays={realStats.activeDaysThisMonth}
          teaDoses={realStats.teaDosesThisMonth}
          recipesConsumed={realStats.favoritedRecipesCount}
          weightLost={weightLostDisplay}
        />
        
        {/* Action Buttons */}
        <DashboardActions />
      </div>
    </Layout>
  );
};

export default GeneralDashboard;
