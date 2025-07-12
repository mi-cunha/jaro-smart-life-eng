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
import { usePesoContext } from "@/contexts/PesoContext";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { getHabitosHoje, getProgressoHabitos, loading: habitosLoading } = useHabitos();
  const { pesoAtual, pesoMeta, getProgressoPeso, loading: pesoLoading } = usePesoContext();

  // Debug logs
  useEffect(() => {
    console.log('📊 Index - Dados de peso:', { pesoAtual, pesoMeta, pesoLoading });
  }, [pesoAtual, pesoMeta, pesoLoading]);
  const { perfil } = useSupabasePerfil();

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

  // Handle loading states
  if (habitosLoading || pesoLoading) {
    return (
      <Layout title="Dashboard" breadcrumb={["Dashboard"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

  const habitosHoje = getHabitosHoje();
  const progressoHabitos = getProgressoHabitos();
  const progressoPeso = getProgressoPeso();

  const habitosConcluidos = habitosHoje.filter(h => h.concluido).length;
  const totalHabitos = habitosHoje.length;

  return (
    <Layout title="Dashboard" breadcrumb={["Dashboard"]}>
      <div className="space-y-8">
        <DashboardHeader />
        
        <StatisticsCards 
          habitosConcluidos={habitosConcluidos}
          totalHabitos={totalHabitos}
          progressoPeso={progressoPeso}
          pesoAtual={pesoAtual}
          pesoMeta={pesoMeta}
        />
        
        <ProgressSection 
          progressoPeso={progressoPeso}
          habitosConcluidos={habitosConcluidos}
          totalHabitos={totalHabitos}
          pesoAtual={pesoAtual}
          pesoMeta={pesoMeta}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <TodayHabits habitos={habitosHoje} />
            <UpcomingMeals refeicoes={[]} />
          </div>
          
          <div className="space-y-8">
            <QuickActions />
            <CallToAction />
          </div>
        </div>
      </div>
      
      {showWelcome && <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />}
    </Layout>
  );
};

export default Index;