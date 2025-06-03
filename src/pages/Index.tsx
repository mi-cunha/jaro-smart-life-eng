
import { Layout } from "@/components/Layout";
import { ProgressCard } from "@/components/ProgressCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cup, CheckCircle, ForkKnife, Scale, BarChart3, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface DailyProgress {
  chaJaro: number;
  habitos: number;
  refeicoes: number;
  peso: { atual: number; objetivo: number };
}

const Index = () => {
  const navigate = useNavigate();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    chaJaro: 4,
    habitos: 6,
    refeicoes: 3,
    peso: { atual: 75.2, objetivo: 70 }
  });

  const [monthlyProgress] = useState({
    chaJaroDias: 22,
    habitosPercentual: 85,
    receitasConsumidas: 24,
    pesoAlteracao: -2.5
  });

  const chaJaroProgress = (dailyProgress.chaJaro / 6) * 100;
  const habitosProgress = (dailyProgress.habitos / 8) * 100;
  const refeicoesProgress = (dailyProgress.refeicoes / 4) * 100;
  const pesoProgress = ((dailyProgress.peso.atual - dailyProgress.peso.objetivo) / (80 - dailyProgress.peso.objetivo)) * 100;

  // Verificar se 100% do dia foi completado
  useEffect(() => {
    if (chaJaroProgress === 100 && habitosProgress === 100 && refeicoesProgress === 100) {
      toast.success("🎉 Você finalizou 100% do seu dia!", {
        duration: 5000,
        action: {
          label: "Ver Medalhas",
          onClick: () => navigate("/dashboard")
        }
      });
    }
  }, [chaJaroProgress, habitosProgress, refeicoesProgress, navigate]);

  const handleMarcarDose = () => {
    if (dailyProgress.chaJaro < 6) {
      setDailyProgress(prev => ({
        ...prev,
        chaJaro: prev.chaJaro + 1
      }));
      toast.success("Dose de Chá Jaro marcada! ✅");
    }
  };

  const handleRegistrarPeso = () => {
    navigate("/progresso-peso");
  };

  // Heatmap para os últimos 30 dias
  const generateHeatmapData = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const doses = Math.floor(Math.random() * 7); // Simular doses
      days.push({
        date: date.getDate(),
        doses,
        intensity: doses / 6
      });
    }
    return days;
  };

  const heatmapData = generateHeatmapData();

  return (
    <Layout title="Bem-vindo ao JaroSmart" breadcrumb={["Home"]}>
      <div className="space-y-8">
        {/* Cards de Progresso Diário */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">Seu Progresso Hoje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProgressCard
              title="Chá Jaro"
              icon={<Cup className="w-5 h-5 text-neon-green" />}
              progress={chaJaroProgress}
              current={dailyProgress.chaJaro}
              total={6}
              description="doses tomadas"
              buttonText="Ver Receita do Chá"
              onButtonClick={() => navigate("/cha-jaro")}
            />
            
            <ProgressCard
              title="Hábitos do Dia"
              icon={<CheckCircle className="w-5 h-5 text-neon-green" />}
              progress={habitosProgress}
              current={dailyProgress.habitos}
              total={8}
              description="hábitos concluídos"
              buttonText="Ver Habit Tracker"
              onButtonClick={() => navigate("/habit-tracker")}
            />
            
            <ProgressCard
              title="Refeições do Dia"
              icon={<ForkKnife className="w-5 h-5 text-neon-green" />}
              progress={refeicoesProgress}
              current={dailyProgress.refeicoes}
              total={4}
              description="refeições consumidas"
              buttonText="Ver Gerador de Receitas"
              onButtonClick={() => navigate("/gerador-receitas")}
            />
            
            <Card className="bg-dark-bg border-white/10 hover:border-neon-green/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Scale className="w-5 h-5 text-neon-green" />
                  Peso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-white/80 text-sm">
                  Atual: {dailyProgress.peso.atual} kg / Objetivo: {dailyProgress.peso.objetivo} kg
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill h-full"
                    style={{ width: `${Math.max(0, 100 - pesoProgress)}%` }}
                  />
                </div>
                <div className="text-right text-xs text-white/60">
                  {(dailyProgress.peso.atual - dailyProgress.peso.objetivo).toFixed(1)} kg restantes
                </div>
                <Button 
                  onClick={handleRegistrarPeso}
                  className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-medium"
                >
                  Registrar Peso
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Progresso Geral */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">Progresso Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-dark-bg border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Cup className="w-5 h-5 text-neon-green" />
                  Chá Jaro (Mensal)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-neon-green">
                  {monthlyProgress.chaJaroDias}/30 dias
                </div>
                {/* Heatmap */}
                <div className="grid grid-cols-7 gap-1">
                  {heatmapData.slice(-21).map((day, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-sm"
                      style={{
                        backgroundColor: day.intensity > 0 
                          ? `rgba(0, 255, 102, ${day.intensity})` 
                          : '#333'
                      }}
                      title={`${day.date}: ${day.doses}/6 doses`}
                    />
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/cha-jaro")}
                  className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-dark-bg border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  Hábitos (Mês)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-neon-green">
                  {monthlyProgress.habitosPercentual}%
                </div>
                <div className="text-sm text-white/70">
                  cumpridos neste mês
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill h-full"
                    style={{ width: `${monthlyProgress.habitosPercentual}%` }}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/habit-tracker")}
                  className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-dark-bg border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <ForkKnife className="w-5 h-5 text-neon-green" />
                  Receitas (Semana)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-neon-green">
                  {monthlyProgress.receitasConsumidas}/28
                </div>
                <div className="text-sm text-white/70">
                  refeições saudáveis
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill h-full"
                    style={{ width: `${(monthlyProgress.receitasConsumidas / 28) * 100}%` }}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/gerador-receitas")}
                  className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-dark-bg border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-neon-green" />
                  Peso (Período)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-neon-green">
                  {monthlyProgress.pesoAlteracao} kg
                </div>
                <div className="text-sm text-white/70">
                  em 14 dias
                </div>
                <div className="h-8 flex items-center">
                  <div className="w-full h-1 bg-gray-700 rounded-full">
                    <div className="h-full bg-neon-green rounded-full w-3/4" />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/progresso-peso")}
                  className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Ações Rápidas */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleMarcarDose}
              className="h-16 bg-neon-green text-black hover:bg-neon-green/90 font-medium text-lg"
              disabled={dailyProgress.chaJaro >= 6}
            >
              <Cup className="w-6 h-6 mr-2" />
              Marcar Dose de Chá
            </Button>
            
            <Button 
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="h-16 border-neon-green/30 text-neon-green hover:bg-neon-green/10 font-medium text-lg"
            >
              <BarChart3 className="w-6 h-6 mr-2" />
              Ver Dashboard Completo
            </Button>
            
            <Button 
              onClick={() => navigate("/gerador-receitas")}
              variant="outline"
              className="h-16 border-neon-green/30 text-neon-green hover:bg-neon-green/10 font-medium text-lg"
            >
              <ForkKnife className="w-6 h-6 mr-2" />
              Gerar Nova Receita
            </Button>
          </div>
        </section>

        {/* Rodapé */}
        <footer className="border-t border-white/10 pt-8 mt-12">
          <div className="text-center text-white/60 text-sm space-y-2">
            <div className="flex justify-center space-x-6">
              <a href="#" className="hover:text-neon-green transition-colors">Sobre</a>
              <a href="#" className="hover:text-neon-green transition-colors">Privacidade</a>
              <a href="#" className="hover:text-neon-green transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-neon-green transition-colors">Suporte</a>
            </div>
            <div>
              © 2024 JaroSmart. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Index;
