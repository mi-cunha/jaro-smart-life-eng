
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "@/components/ProgressChart";
import { 
  Cup, 
  Droplets, 
  Footprints, 
  Apple, 
  Moon, 
  Dumbbell, 
  Heart,
  CheckCircle,
  Trophy,
  Flame
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  tip: string;
}

const HabitTracker = () => {
  const navigate = useNavigate();
  
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Chá Jaro',
      description: '6 doses diárias',
      icon: <Cup className="w-6 h-6" />,
      completed: false,
      tip: 'Tome 15 minutos antes das refeições para melhor absorção'
    },
    {
      id: '2',
      name: 'Hidratação',
      description: '2 litros de água',
      icon: <Droplets className="w-6 h-6" />,
      completed: true,
      tip: 'Beba um copo de água ao acordar para ativar o metabolismo'
    },
    {
      id: '3',
      name: 'Caminhada',
      description: '30 minutos',
      icon: <Footprints className="w-6 h-6" />,
      completed: true,
      tip: 'Caminhe em ritmo moderado, preferencialmente pela manhã'
    },
    {
      id: '4',
      name: 'Alimentação Saudável',
      description: '5 porções de frutas/vegetais',
      icon: <Apple className="w-6 h-6" />,
      completed: false,
      tip: 'Varie as cores dos alimentos para garantir diferentes nutrientes'
    },
    {
      id: '5',
      name: 'Sono de Qualidade',
      description: '7-8 horas',
      icon: <Moon className="w-6 h-6" />,
      completed: true,
      tip: 'Evite telas 1 hora antes de dormir para melhor qualidade do sono'
    },
    {
      id: '6',
      name: 'Exercícios',
      description: '20 min de atividade física',
      icon: <Dumbbell className="w-6 h-6" />,
      completed: false,
      tip: 'Inclua exercícios de força pelo menos 2x por semana'
    },
    {
      id: '7',
      name: 'Meditação',
      description: '10 minutos',
      icon: <Heart className="w-6 h-6" />,
      completed: true,
      tip: 'Pratique a respiração consciente para reduzir o estresse'
    },
    {
      id: '8',
      name: 'Suplementação',
      description: 'Vitaminas e minerais',
      icon: <CheckCircle className="w-6 h-6" />,
      completed: false,
      tip: 'Tome os suplementos sempre no mesmo horário'
    }
  ]);

  const [streakData] = useState({
    current: 5,
    best: 12,
    thisWeek: 85
  });

  const completedHabits = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const completionPercentage = (completedHabits / totalHabits) * 100;

  const handleToggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = !habit.completed;
        if (newCompleted) {
          toast.success(`Hábito '${habit.name}' concluído! ✅`);
        }
        return { ...habit, completed: newCompleted };
      }
      return habit;
    }));
  };

  // Dados do gráfico semanal
  const weeklyData = [
    { date: 'Seg', value: 87 },
    { date: 'Ter', value: 92 },
    { date: 'Qua', value: 78 },
    { date: 'Qui', value: 95 },
    { date: 'Sex', value: 88 },
    { date: 'Sáb', value: 90 },
    { date: 'Dom', value: 85 },
  ];

  return (
    <Layout title="Habit Tracker" breadcrumb={["Home", "Habit Tracker & Progresso Diário"]}>
      <div className="space-y-8">
        {/* Resumo do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-neon-green mb-2">
                {completedHabits}/{totalHabits}
              </div>
              <div className="text-white/70">Hábitos Concluídos Hoje</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-neon-green mb-2">
                {completionPercentage.toFixed(0)}%
              </div>
              <div className="text-white/70">Taxa de Conclusão</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-neon-green mb-2">
                {streakData.current}
              </div>
              <div className="text-white/70">Dias Consecutivos</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Hábitos */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-neon-green" />
              Hábitos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border transition-all ${
                  habit.completed
                    ? 'bg-neon-green/10 border-neon-green/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={habit.completed}
                    onCheckedChange={() => handleToggleHabit(habit.id)}
                    className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                  />
                  
                  <div className={`${habit.completed ? 'text-neon-green' : 'text-white/70'}`}>
                    {habit.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${habit.completed ? 'text-neon-green' : 'text-white'}`}>
                      {habit.name}
                    </h3>
                    <p className="text-sm text-white/60">{habit.description}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-neon-green"
                    onClick={() => toast.info(habit.tip)}
                  >
                    Dica
                  </Button>
                  
                  {habit.completed && (
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                      Concluído
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Progresso Semanal */}
        <ProgressChart
          title="Progresso Semanal (%)"
          data={weeklyData}
          type="bar"
          unit="%"
        />

        {/* Streaks e Conquistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-neon-green" />
                Streak Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-neon-green mb-2">
                  {streakData.current}
                </div>
                <div className="text-white/70">dias consecutivos com 100% de hábitos</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Progresso para próxima conquista:</span>
                  <span className="text-neon-green">{streakData.current}/7 dias</span>
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill h-full"
                    style={{ width: `${(streakData.current / 7) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-neon-green" />
                Maior Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-neon-green mb-2">
                  {streakData.best}
                </div>
                <div className="text-white/70">seu melhor recorde</div>
              </div>
              
              <div className="space-y-2 text-center">
                <div className="text-sm text-white/70">
                  Você está a {streakData.best - streakData.current + 1} dias do seu recorde!
                </div>
                <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                  🏆 Streak Master
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Avançadas */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">{streakData.thisWeek}%</div>
                <div className="text-sm text-white/70">Taxa de Conclusão</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">6/7</div>
                <div className="text-sm text-white/70">Dias Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">42</div>
                <div className="text-sm text-white/70">Hábitos Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">3</div>
                <div className="text-sm text-white/70">Dias Perfeitos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            Ver Progresso Geral
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="bg-neon-green text-black hover:bg-neon-green/90"
          >
            Voltar ao Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default HabitTracker;
