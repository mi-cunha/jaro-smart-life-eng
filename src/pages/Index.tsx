import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, TrendingUp, Coffee, ChefHat, ShoppingCart, BookOpen, BarChart3, CheckCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WelcomeModal } from "@/components/WelcomeModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
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
        {/* Header com Theme Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Olá! Bem-vindo ao <span className="text-neon-green">JaroSmart</span> 👋
            </h1>
            <p className="text-white/70">Sua jornada de emagrecimento inteligente</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 border-neon-green/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neon-green/80 text-sm font-medium">Peso Atual</p>
                  <h3 className="text-2xl font-bold text-neon-green">{pesoAtual}kg</h3>
                </div>
                <Target className="h-8 w-8 text-neon-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Meta</p>
                  <h3 className="text-2xl font-bold text-white">{pesoMeta}kg</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-white/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Hábitos Hoje</p>
                  <h3 className="text-2xl font-bold text-white">{habitosConcluidos}/{habitosHoje.length}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-white/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400/80 text-sm font-medium">Progresso</p>
                  <h3 className="text-2xl font-bold text-purple-400">{progressoPeso.toFixed(0)}%</h3>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Progresso */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-green" />
              Resumo do Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">Progresso do Peso</span>
                <span className="text-neon-green font-semibold">{progressoPeso.toFixed(1)}%</span>
              </div>
              <Progress value={progressoPeso} className="h-2" />
              <p className="text-sm text-white/60 mt-1">
                Faltam apenas {(pesoAtual - pesoMeta).toFixed(1)}kg para sua meta!
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">Hábitos Diários</span>
                <span className="text-neon-green font-semibold">
                  {((habitosConcluidos / habitosHoje.length) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={(habitosConcluidos / habitosHoje.length) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate("/cha-jaro")}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 h-auto py-4 flex flex-col items-center gap-2"
              >
                <Coffee className="w-6 h-6" />
                <span className="text-sm">Chá Jaro</span>
              </Button>

              <Button
                onClick={() => navigate("/gerador-receitas")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 h-auto py-4 flex flex-col items-center gap-2"
              >
                <ChefHat className="w-6 h-6" />
                <span className="text-sm">Receitas</span>
              </Button>

              <Button
                onClick={() => navigate("/lista-compras")}
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 h-auto py-4 flex flex-col items-center gap-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-sm">Compras</span>
              </Button>

              <Button
                onClick={() => navigate("/colecao-receitas")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 h-auto py-4 flex flex-col items-center gap-2"
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Coleção</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hábitos de Hoje */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-neon-green" />
              Hábitos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habitosHoje.map((habito, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className={habito.concluido ? "text-neon-green" : "text-white/70"}>
                    {habito.nome}
                  </span>
                  {habito.concluido ? (
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                      Concluído ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/30 text-white/60">
                      Pendente
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximas Refeições */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neon-green" />
              Próximas Refeições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proximasRefeicoes.map((refeicao, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{refeicao.nome}</h4>
                    <p className="text-white/60 text-sm">{refeicao.horario}</p>
                  </div>
                  <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                    {refeicao.calorias} kcal
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-neon-green/20 to-transparent border-neon-green/30">
          <CardContent className="p-6 text-center">
            <Zap className="w-12 h-12 text-neon-green mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Continue sua jornada!</h3>
            <p className="text-white/70 mb-4">
              Cada passo conta. Mantenha o foco nos seus objetivos e celebrate cada conquista.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate("/habit-tracker")}
                className="bg-neon-green text-black hover:bg-neon-green/90"
              >
                Ver Todos os Hábitos
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
              >
                Dashboard Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
