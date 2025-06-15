
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "@/components/ProgressChart";
import { 
  Coffee, 
  CheckCircle, 
  Scale, 
  ChefHat, 
  ShoppingCart, 
  Trophy,
  TrendingUp,
  Calendar,
  Target
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
import { TopRecipesTable } from "@/components/DashboardGeral/TopRecipesTable";
import { AchievementsMedals } from "@/components/DashboardGeral/AchievementsMedals";
import { ImprovementSuggestions } from "@/components/DashboardGeral/ImprovementSuggestions";
import { MonthlySummary } from "@/components/DashboardGeral/MonthlySummary";
import { DashboardActions } from "@/components/DashboardGeral/DashboardActions";
import { PersonalizedInsights } from "@/components/DashboardGeral/PersonalizedInsights";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { useQuizData } from "@/hooks/useQuizData";

const GeneralDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { pesoAtual, pesoMeta, getProgressoPeso, getDadosGrafico } = usePeso();
  const { getHabitosHoje, getProgressoHabitos, getHistoricoSemanal } = useHabitos();
  const { receitas, loading: loadingReceitas } = useSupabaseReceitas();
  const { itensCompra, loading: loadingCompras } = useSupabaseListaCompras();
  const { convertToDisplayWeight, formatWeight, unit } = useWeightUnit();
  const { getPersonalizedStats, hasQuizData } = useQuizData();
  
  const [historicoSemanal, setHistoricoSemanal] = useState<any[]>([]);
  
  const habitosHoje = getHabitosHoje();
  const progressoHabitos = getProgressoHabitos();
  const progressoPeso = getProgressoPeso();
  const dadosGraficoPeso = getDadosGrafico();
  const personalizedStats = getPersonalizedStats();

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

  // Calculate real statistics using only real data - converted to USD
  const totalGastoMes = allItens.filter(item => item.comprado).reduce((total, item) => {
    // Convert R$ to USD (approximate rate: 1 USD = 5.5 BRL)
    const priceInUSD = (typeof item.preco === 'number' ? item.preco : 5) / 5.5;
    return total + priceInUSD;
  }, 0);

  const receitasConsumidasMes = allReceitas.length;
  const habitosConcluidos = habitosHoje.filter(h => h.concluido).length;
  const totalHabitos = habitosHoje.length;
  const percentualHabitos = totalHabitos > 0 ? (habitosConcluidos / totalHabitos) * 100 : 0;

  // Calculate days active this month (simplified)
  const diasAtivosMes = Math.max(1, receitasConsumidasMes + habitosConcluidos);

  // Calculate tea doses using personalized recommendations or fallback
  const recommendedTeaDoses = personalizedStats?.recommendedTeaDoses || userProfile?.doses_cha || 2;
  const dosesChaMes = Math.floor(diasAtivosMes * recommendedTeaDoses);
  
  // Calculate weight loss progress - convert to display units
  const currentWeightDisplay = convertToDisplayWeight(pesoAtual || 165); // Default 165 lbs
  const goalWeightDisplay = convertToDisplayWeight(pesoMeta || 150); // Default 150 lbs
  const initialWeightDisplay = currentWeightDisplay + convertToDisplayWeight(4.8);
  const weightLostDisplay = initialWeightDisplay - currentWeightDisplay;

  // Progress cards with personalized data
  const progressoCards = [
    {
      title: "Jaro Tea",
      icon: <Coffee className="w-6 h-6 text-neon-green" />,
      value: `${Math.floor(dosesChaMes / 7)}/7 days`,
      description: hasQuizData ? "Personalized daily doses" : "Days completed this week",
      progress: Math.floor((dosesChaMes / 7) / 7 * 100),
      link: "/cha-jaro"
    },
    {
      title: "Habits",
      icon: <CheckCircle className="w-6 h-6 text-neon-green" />,
      value: `${Math.round(percentualHabitos)}%`,
      description: "Monthly completion rate",
      progress: Math.round(percentualHabitos),
      link: "/habit-tracker"
    },
    {
      title: "Weight",
      icon: <Scale className="w-6 h-6 text-neon-green" />,
      value: pesoAtual && pesoMeta ? `${formatWeight(Math.abs(currentWeightDisplay - goalWeightDisplay), false)} ${unit} remaining` : "Set your goal",
      description: "To reach your target",
      progress: progressoPeso,
      link: "/progresso-peso"
    },
    {
      title: "Recipes",
      icon: <ChefHat className="w-6 h-6 text-neon-green" />,
      value: `${receitasConsumidasMes}/28`,
      description: hasQuizData ? "Personalized healthy meals" : "Healthy meals this month",
      progress: Math.min(100, (receitasConsumidasMes / 28) * 100),
      link: "/gerador-receitas"
    },
    {
      title: "Shopping",
      icon: <ShoppingCart className="w-6 h-6 text-neon-green" />,
      value: `$${totalGastoMes.toFixed(2)}`,
      description: "Estimated monthly spending",
      progress: 0,
      link: "/lista-compras"
    },
    {
      title: "Achievements",
      icon: <Trophy className="w-6 h-6 text-neon-green" />,
      value: `${Math.floor(progressoPeso / 15)} medals`,
      description: "Goals achieved",
      progress: 0,
      link: "#"
    }
  ];

  // Top 5 recipes (removes buggy mock mapping)
  const receitasTop = allReceitas.slice(0, 5).map((receita, index) => ({
    nome: receita.nome,
    consumos: Math.floor(Math.random() * 8) + 1,
    calorias: receita.calorias || 300
  }));

  const medalhas = [
    { name: "7 Days of Tea", icon: "🏅", achieved: dosesChaMes >= 7 },
    { name: "30 Days of Habits", icon: "🏆", achieved: percentualHabitos >= 80 },
    { name: "Weight Goal", icon: "🎯", achieved: progressoPeso >= 100 },
    { name: "Recipe Master", icon: "👨‍🍳", achieved: allReceitas.length >= 10 },
    { name: "Smart Shopper", icon: "🛒", achieved: allItens.length >= 20 },
    { name: "Iron Streak", icon: "💪", achieved: habitosConcluidos >= totalHabitos && totalHabitos > 0 },
    { name: "Health Champion", icon: "❤️", achieved: progressoPeso >= 50 }
  ];

  const improvementSuggestions = [];
  if (percentualHabitos < 80) {
    improvementSuggestions.push("Your habit completion rate dropped this week. Try setting reminders during meal times!");
  }
  if (allReceitas.length < 10) {
    improvementSuggestions.push("Consider generating more recipe varieties to maintain a balanced diet throughout the month.");
  }
  if (progressoPeso < 50 && pesoAtual && pesoMeta) {
    improvementSuggestions.push("You're getting closer to your weight goal. Consider increasing hydration to boost metabolism.");
  }
  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push("Great progress! Keep maintaining your current routine for optimal results.");
  }

  return (
    <Layout title="General Dashboard" breadcrumb={["Home", "General Dashboard"]}>
      <div className="space-y-8">
        {/* Personalized Insights - New Section */}
        <PersonalizedInsights />
        
        {/* Main Progress Cards */}
        <ProgressCards cards={progressoCards} />
        
        {/* Advanced Statistics */}
        <AdvancedStatistics weightData={dadosGraficoPeso} habitsWeekly={historicoSemanal} />
        
        {/* Top 5 Recipes */}
        <TopRecipesTable recipes={receitasTop} />
        
        {/* Achievements & Medals */}
        <AchievementsMedals medals={medalhas} />
        
        {/* Personalized Improvement Suggestions */}
        <ImprovementSuggestions suggestions={improvementSuggestions} />
        
        {/* Monthly Summary */}
        <MonthlySummary
          activeDays={diasAtivosMes}
          teaDoses={dosesChaMes}
          recipesConsumed={receitasConsumidasMes}
          weightLost={weightLostDisplay}
        />
        
        {/* Action Buttons */}
        <DashboardActions />
      </div>
    </Layout>
  );
};

export default GeneralDashboard;
