
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

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);

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

  const pesoAtual = 78;
  const pesoMeta = 70;
  const progressoPeso = ((85 - pesoAtual) / (85 - pesoMeta)) * 100;

  const habitosHoje = [
    { nome: "Tomar Chá Jaro", concluido: true },
    { nome: "8 copos de água", concluido: true },
    { nome: "30min exercício", concluido: false },
    { nome: "Meditar 10min", concluido: true },
  ];

  const habitosConcluidos = habitosHoje.filter(h => h.concluido).length;

  const proximasRefeicoes = [
    { nome: "Lanche da Tarde", horario: "15:30", calorias: 150 },
    { nome: "Jantar", horario: "19:00", calorias: 400 },
  ];

  return (
    <Layout title="Dashboard JaroSmart" breadcrumb={["Home"]}>
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
      
      <div className="space-y-8">
        <DashboardHeader />

        <StatisticsCards
          pesoAtual={pesoAtual}
          pesoMeta={pesoMeta}
          habitosConcluidos={habitosConcluidos}
          totalHabitos={habitosHoje.length}
          progressoPeso={progressoPeso}
        />

        <ProgressSection
          progressoPeso={progressoPeso}
          pesoAtual={pesoAtual}
          pesoMeta={pesoMeta}
          habitosConcluidos={habitosConcluidos}
          totalHabitos={habitosHoje.length}
        />

        <QuickActions />

        <TodayHabits habitos={habitosHoje} />

        <UpcomingMeals refeicoes={proximasRefeicoes} />

        <CallToAction />
      </div>
    </Layout>
  );
};

export default Index;
