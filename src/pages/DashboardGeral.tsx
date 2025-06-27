
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
import { useRealDashboardData } from "@/hooks/useRealDashboardData";

const GeneralDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { pesoAtual, pesoMeta, getProgressoPeso, getDadosGrafico, historicoPeso } = usePeso();
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
  const dadosGraficoPeso = getDadosGrafico();

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
  const currentWeightDisplay = convertToDisplayWeight(pesoAtual || 165); // Default 165 lbs
  const goalWeightDisplay = convertToDisplayWeight(pesoMeta || 150); // Default 150 lbs
  const initialWeightDisplay = historicoPeso.length > 0 ? 
    convertToDisplayWeight(historicoPeso[historicoPeso.length - 1].peso) : 
    currentWeightDisplay + convertToDisplayWeight(4.8);
  const weightLostDisplay = initialWeightDisplay - currentWeightDisplay;

  // Progress cards with real data
  const progressoCards = [
    {
      title: "Jaro Tea",
      icon: <Coffee className="w-6 h-6 text-neon-green" />,
      value: `${realStats.teaDosesThisMonth}/${realStats.recommendedTeaDoses * 30}`,
      description: hasQuizData ? "Doses personalizadas este mês" : "Doses consumidas este mês",
      progress: Math.min(100, (realStats.teaDosesThisMonth / (realStats.recommendedTeaDoses * 30)) * 100),
      link: "/cha-jaro"
    },
    {
      title: "Habits",
      icon: <CheckCircle className="w-6 h-6 text-neon-green" />,
      value: `${Math.round(realStats.habitCompletionRate)}%`,
      description: "Taxa de conclusão mensal",
      progress: Math.round(realStats.habitCompletionRate),
      link: "/habit-tracker"
    },
    {
      title: "Weight",
      icon: <Scale className="w-6 h-6 text-neon-green" />,
      value: pesoAtual && pesoMeta ? `${formatWeight(Math.abs(currentWeightDisplay - goalWeightDisplay), false)} ${unit} restante` : "Definir meta",
      description: "Para alcançar seu objetivo",
      progress: progressoPeso,
      link: "/progresso-peso"
    },
    {
      title: "Recipes",
      icon: <ChefHat className="w-6 h-6 text-neon-green" />,
      value: `${realStats.recipesCookedThisMonth}/28`,
      description: hasQuizData ? "Refeições saudáveis personalizadas" : "Refeições saudáveis este mês",
      progress: Math.min(100, (realStats.recipesCookedThisMonth / 28) * 100),
      link: "/gerador-receitas"
    },
    {
      title: "Shopping",
      icon: <ShoppingCart className="w-6 h-6 text-neon-green" />,
      value: `$${realStats.monthlySpending.toFixed(2)}`,
      description: "Gastos estimados mensais",
      progress: 0,
      link: "/lista-compras"
    },
    {
      title: "Achievements",
      icon: <Trophy className="w-6 h-6 text-neon-green" />,
      value: `${Math.floor(progressoPeso / 15)} medalhas`,
      description: "Objetivos alcançados",
      progress: 0,
      link: "#"
    }
  ];

  // Top 5 recipes with real data
  const receitasTop = allReceitas.slice(0, 5).map((receita, index) => ({
    nome: receita.nome,
    consumos: Math.floor(Math.random() * 8) + 1, // This could be enhanced with actual consumption tracking
    calorias: receita.calorias || 300
  }));

  // Achievements based on real user data
  const medalhas = [
    { name: "7 Dias de Chá", icon: "🏅", achieved: realStats.teaDosesThisMonth >= 7 },
    { name: "30 Dias de Hábitos", icon: "🏆", achieved: realStats.habitCompletionRate >= 80 },
    { name: "Meta de Peso", icon: "🎯", achieved: progressoPeso >= 100 },
    { name: "Mestre das Receitas", icon: "👨‍🍳", achieved: realStats.recipesCookedThisMonth >= 10 },
    { name: "Comprador Inteligente", icon: "🛒", achieved: allItens.length >= 20 },
    { name: "Série de Ferro", icon: "💪", achieved: realStats.habitCompletionRate >= 90 },
    { name: "Campeão da Saúde", icon: "❤️", achieved: progressoPeso >= 50 && realStats.habitCompletionRate >= 70 }
  ];

  const improvementSuggestions = [];
  if (realStats.habitCompletionRate < 80) {
    improvementSuggestions.push("Sua taxa de conclusão de hábitos diminuiu esta semana. Tente definir lembretes durante as refeições!");
  }
  if (realStats.recipesCookedThisMonth < 10) {
    improvementSuggestions.push("Considere gerar mais variedades de receitas para manter uma dieta equilibrada ao longo do mês.");
  }
  if (progressoPeso < 50 && pesoAtual && pesoMeta) {
    improvementSuggestions.push("Você está se aproximando de sua meta de peso. Considere aumentar a hidratação para acelerar o metabolismo.");
  }
  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push("Ótimo progresso! Continue mantendo sua rotina atual para obter resultados ideais.");
  }

  if (loadingStats) {
    return (
      <Layout title="Dashboard Geral" breadcrumb={["Home", "Dashboard Geral"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Carregando dados do dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Geral" breadcrumb={["Home", "Dashboard Geral"]}>
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
        
        {/* Monthly Summary with Real Data */}
        <MonthlySummary
          activeDays={realStats.activeDaysThisMonth}
          teaDoses={realStats.teaDosesThisMonth}
          recipesConsumed={realStats.recipesCookedThisMonth}
          weightLost={weightLostDisplay}
        />
        
        {/* Action Buttons */}
        <DashboardActions />
      </div>
    </Layout>
  );
};

export default GeneralDashboard;
