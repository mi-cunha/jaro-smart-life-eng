
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

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { getHabitosHoje, getProgressoHabitos, loading: habitosLoading } = useHabitos();
  const { pesoAtual, pesoMeta, getProgressoPeso, loading: pesoLoading } = usePeso();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  // Get real data
  const habitosHoje = getHabitosHoje();
  const progressoHabitos = getProgressoHabitos();
  const progressoPeso = getProgressoPeso();

  // Transform habits data for TodayHabits component
  const habitosFormatados = habitosHoje.map(habito => ({
    nome: habito.nome,
    concluido: habito.concluido
  }));

  const proximasRefeicoes = [
    { nome: "Afternoon Snack", horario: "3:30 PM", calorias: 150 },
    { nome: "Dinner", horario: "7:00 PM", calorias: 400 },
  ];

  return (
    <Layout title="JaroSmart Dashboard" breadcrumb={["Home"]}>
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
      
      <div className="space-y-8">
        <DashboardHeader />

        <StatisticsCards
          pesoAtual={pesoAtual || 78}
          pesoMeta={pesoMeta || 70}
          habitosConcluidos={progressoHabitos.concluidos}
          totalHabitos={progressoHabitos.total}
          progressoPeso={progressoPeso}
        />

        <ProgressSection
          progressoPeso={progressoPeso}
          pesoAtual={pesoAtual || 78}
          pesoMeta={pesoMeta || 70}
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
