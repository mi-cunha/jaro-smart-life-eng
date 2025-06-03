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

const DashboardGeral = () => {
  const navigate = useNavigate();

  // Dados dos cards principais
  const progressoCards = [
    {
      title: "Chá Jaro",
      icon: <Coffee className="w-6 h-6 text-neon-green" />,
      valor: "5/7 dias",
      descricao: "Dias completados esta semana",
      progresso: 71,
      link: "/cha-jaro"
    },
    {
      title: "Hábitos",
      icon: <CheckCircle className="w-6 h-6 text-neon-green" />,
      valor: "85%",
      descricao: "Cumprimento mensal",
      progresso: 85,
      link: "/habit-tracker"
    },
    {
      title: "Peso",
      icon: <Scale className="w-6 h-6 text-neon-green" />,
      valor: "2.3 kg restantes",
      descricao: "Para atingir o objetivo",
      progresso: 67,
      link: "/progresso-peso"
    },
    {
      title: "Receitas",
      icon: <ChefHat className="w-6 h-6 text-neon-green" />,
      valor: "24/28",
      descricao: "Refeições saudáveis no mês",
      progresso: 86,
      link: "/gerador-receitas"
    },
    {
      title: "Compras",
      icon: <ShoppingCart className="w-6 h-6 text-neon-green" />,
      valor: "R$ 342,80",
      descricao: "Gasto estimado no mês",
      progresso: 0,
      link: "/lista-compras"
    },
    {
      title: "Conquistas",
      icon: <Trophy className="w-6 h-6 text-neon-green" />,
      valor: "7 medalhas",
      descricao: "Objetivos alcançados",
      progresso: 0,
      link: "#"
    }
  ];

  // Dados para gráficos
  const pesoVsChaDados = [
    { date: '01/02', value: 76.8 },
    { date: '03/02', value: 76.5 },
    { date: '05/02', value: 76.2 },
    { date: '07/02', value: 75.9 },
    { date: '09/02', value: 75.6 },
    { date: '11/02', value: 75.3 },
    { date: '13/02', value: 75.0 },
  ];

  const habitosSemanais = [
    { date: 'Sem 1', value: 82 },
    { date: 'Sem 2', value: 88 },
    { date: 'Sem 3', value: 85 },
    { date: 'Sem 4', value: 91 },
  ];

  const receitasTop = [
    { nome: "Bowl de Aveia com Frutas", consumos: 8, calorias: 320 },
    { nome: "Frango Grelhado com Quinoa", consumos: 6, calorias: 380 },
    { nome: "Salada de Quinoa", consumos: 5, calorias: 250 },
    { nome: "Smoothie Verde", consumos: 4, calorias: 180 },
    { nome: "Tofu com Legumes", consumos: 3, calorias: 220 }
  ];

  const medalhas = [
    { nome: "7 Dias de Chá", icone: "🏅", conquistada: true },
    { nome: "30 Dias de Hábitos", icone: "🏆", conquistada: true },
    { nome: "Meta de Peso", icone: "🎯", conquistada: false },
    { nome: "Receita Master", icone: "👨‍🍳", conquistada: true },
    { nome: "Comprador Consciente", icone: "🛒", conquistada: true },
    { nome: "Streak de Ferro", icone: "💪", conquistada: false },
    { nome: "Saúde em Dia", icone: "❤️", conquistada: true }
  ];

  const sugestoesMelhoria = [
    "Notei que sua média de doses de chá caiu 20% esta semana. Tente definir lembretes nos horários das refeições!",
    "Seus hábitos estão indo muito bem! Para manter o foco, que tal adicionar uma caminhada de 10 min após o almoço?",
    "Você está próximo da meta de peso. Considere aumentar a hidratação para acelerar o metabolismo."
  ];

  return (
    <Layout title="Dashboard Geral" breadcrumb={["Home", "Dashboard Geral"]}>
      <div className="space-y-8">
        {/* Cards de Progresso Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {progressoCards.map((card, index) => (
            <Card key={index} className="bg-dark-bg border-white/10 hover:border-neon-green/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  {card.icon}
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-neon-green">
                  {card.valor}
                </div>
                <div className="text-white/70 text-sm">
                  {card.descricao}
                </div>
                {card.progresso > 0 && (
                  <div className="progress-bar h-2">
                    <div 
                      className="progress-fill h-full"
                      style={{ width: `${card.progresso}%` }}
                    />
                  </div>
                )}
                {card.link !== "#" && (
                  <Button 
                    onClick={() => navigate(card.link)}
                    variant="outline" 
                    size="sm" 
                    className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    Ver Mais
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estatísticas Avançadas */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Gráfico Peso vs Tempo */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-green" />
                Evolução do Peso (Últimas 2 semanas)
              </h3>
              <div className="h-64">
                <ProgressChart
                  title=""
                  data={pesoVsChaDados}
                  type="line"
                  unit=" kg"
                />
              </div>
            </div>

            {/* Gráfico Hábitos Semanais */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-neon-green" />
                Cumprimento de Hábitos (Últimas 4 semanas)
              </h3>
              <div className="h-64">
                <ProgressChart
                  title=""
                  data={habitosSemanais}
                  type="bar"
                  unit="%"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Receitas */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-neon-green" />
              Top 5 Receitas Mais Consumidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/80 py-3">#</th>
                    <th className="text-left text-white/80 py-3">Receita</th>
                    <th className="text-left text-white/80 py-3">Consumos</th>
                    <th className="text-left text-white/80 py-3">Calorias Médias</th>
                  </tr>
                </thead>
                <tbody>
                  {receitasTop.map((receita, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-3">
                        <div className="w-8 h-8 bg-neon-green/20 rounded-full flex items-center justify-center">
                          <span className="text-neon-green font-bold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="text-white py-3">{receita.nome}</td>
                      <td className="text-neon-green py-3 font-medium">{receita.consumos}x</td>
                      <td className="text-white/70 py-3">{receita.calorias} kcal</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas & Medalhas */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-neon-green" />
              Conquistas & Medalhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {medalhas.map((medalha, index) => (
                <div
                  key={index}
                  className={`text-center p-4 rounded-lg border transition-all ${
                    medalha.conquistada
                      ? 'bg-neon-green/10 border-neon-green/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{medalha.icone}</div>
                  <div className={`text-sm font-medium ${
                    medalha.conquistada ? 'text-neon-green' : 'text-white/60'
                  }`}>
                    {medalha.nome}
                  </div>
                  {medalha.conquistada && (
                    <Badge className="mt-2 bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                      Conquistada
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sugestões de Melhoria */}
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-green" />
              Sugestões de Melhoria Personalizadas
            </CardTitle>
            <div className="text-sm text-white/70">
              Baseado na sua performance recente
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sugestoesMelhoria.map((sugestao, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-neon-green text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="text-white/80">{sugestao}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resumo Mensal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-neon-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-neon-green">28</div>
              <div className="text-sm text-white/70">Dias ativos este mês</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <Coffee className="w-8 h-8 text-neon-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-neon-green">142</div>
              <div className="text-sm text-white/70">Doses de chá tomadas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <ChefHat className="w-8 h-8 text-neon-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-neon-green">96</div>
              <div className="text-sm text-white/70">Receitas consumidas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-neon-green mx-auto mb-3" />
              <div className="text-2xl font-bold text-neon-green">4.8kg</div>
              <div className="text-sm text-white/70">Perdidos desde o início</div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/")}
            className="bg-neon-green text-black hover:bg-neon-green/90 flex-1"
          >
            Voltar ao Home
          </Button>
          
          <Button
            onClick={() => navigate("/gerador-receitas")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 flex-1"
          >
            Gerar Nova Receita
          </Button>
          
          <Button
            onClick={() => navigate("/habit-tracker")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 flex-1"
          >
            Ver Hábitos de Hoje
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardGeral;
