
import { Layout } from "@/components/Layout";
import { WelcomeModal } from "@/components/WelcomeModal";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatisticsCards } from "@/components/Dashboard/StatisticsCards";
import { ProgressSection } from "@/components/Dashboard/ProgressSection";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { TodayHabits } from "@/components/Dashboard/TodayHabits";
import { UpcomingMeals } from "@/components/Dashboard/UpcomingMeals";
import { CallToAction } from "@/components/Dashboard/CallToAction";
import { useState, useEffect } from "react";
import { useHabitos } from "@/hooks/useHabitos";
import { usePeso } from "@/hooks/usePeso";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { getHabitosHoje, getProgressoHabitos, loading: habitosLoading, carregarHabitos } = useHabitos();
  const { pesoAtual, pesoMeta, getProgressoPeso, loading: pesoLoading } = usePeso();
  const { perfil } = useSupabasePerfil();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  // Force refresh habits data when component mounts or when habits change
  useEffect(() => {
    if (!habitosLoading) {
      carregarHabitos();
    }
  }, [carregarHabitos]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  // Get real data from Supabase - these will update when carregarHabitos is called
  const habitosHoje = getHabitosHoje();
  const progressoHabitos = getProgressoHabitos();
  const progressoPeso = getProgressoPeso();

  // Use real weight data from hooks - pesoMeta comes from usePeso hook
  const currentWeight = pesoAtual || 0;
  const targetWeight = pesoMeta || 0;

  // Transform habits data for TodayHabits component - show empty state if no habits
  const habitosFormatados = habitosHoje.length > 0 ? habitosHoje.map(habito => ({
    nome: habito.nome,
    concluido: habito.concluido
  })) : [];

  // Generate upcoming meals based on time of day
  const generateUpcomingMeals = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const meals = [
      { nome: "Breakfast", horario: "7:00 AM", calorias: 350 },
      { nome: "Morning Snack", horario: "10:00 AM", calorias: 150 },
      { nome: "Lunch", horario: "12:30 PM", calorias: 450 },
      { nome: "Afternoon Snack", horario: "3:30 PM", calorias: 150 },
      { nome: "Dinner", horario: "7:00 PM", calorias: 400 },
    ];

    // Return next 2 meals based on current time
    const upcomingMeals = meals.filter((meal) => {
      const mealHour = parseInt(meal.horario.split(':')[0]);
      const isPM = meal.horario.includes('PM');
      const adjustedHour = isPM && mealHour !== 12 ? mealHour + 12 : mealHour;
      return adjustedHour > currentHour;
    }).slice(0, 2);

    return upcomingMeals.length > 0 ? upcomingMeals : [
      { nome: "Breakfast", horario: "7:00 AM", calorias: 350 },
      { nome: "Lunch", horario: "12:30 PM", calorias: 450 }
    ];
  };

  const proximasRefeicoes = generateUpcomingMeals();

  if (habitosLoading || pesoLoading) {
    return (
      <Layout title="JaroSmart Dashboard" breadcrumb={["Home"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="JaroSmart Dashboard" breadcrumb={["Home"]}>
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
      
      <div className="space-y-8">
        <DashboardHeader />

        <StatisticsCards
          pesoAtual={currentWeight}
          pesoMeta={targetWeight}
          habitosConcluidos={progressoHabitos.concluidos}
          totalHabitos={progressoHabitos.total}
          progressoPeso={progressoPeso}
        />

        <ProgressSection
          progressoPeso={progressoPeso}
          pesoAtual={currentWeight}
          pesoMeta={targetWeight}
          habitosConcluidos={progressoHabitos.concluidos}
          totalHabitos={progressoHabitos.total}
        />

        <QuickActions />

        <TodayHabits habitos={habitosFormatados} />

        <UpcomingMeals refeicoes={proximasRefeicoes} />

        <CallToAction />
      </div>
    </Layout>
  );
};

export default Index;
