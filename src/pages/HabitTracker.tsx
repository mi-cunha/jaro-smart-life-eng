
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "@/components/ProgressChart";
import { 
  Coffee, 
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
import { useNavigate } from "react-router-dom";
import { useHabitos } from "@/hooks/useHabitos";
import { useState, useEffect } from "react";

const HabitTracker = () => {
  const navigate = useNavigate();
  const { 
    getHabitosHoje, 
    getProgressoHabitos, 
    marcarHabito,
    getHistoricoSemanal,
    loading 
  } = useHabitos();

  const [historicoSemanal, setHistoricoSemanal] = useState<any[]>([]);

  const habitosHoje = getHabitosHoje();
  const progresso = getProgressoHabitos();

  const completedHabits = progresso.concluidos;
  const totalHabits = progresso.total;
  const completionPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  // Calculate streak data from real habits
  const streakData = {
    current: progresso.streakAtual || 0,
    best: progresso.melhorStreak || 0,
    thisWeek: completionPercentage
  };

  const handleToggleHabito = async (habitoId: string) => {
    const habito = habitosHoje.find(h => h.id === habitoId);
    if (habito) {
      await marcarHabito(habitoId, !habito.concluido);
    }
  };

  // Load weekly history data
  useEffect(() => {
    const loadWeeklyData = async () => {
      const data = await getHistoricoSemanal();
      setHistoricoSemanal(data);
    };
    loadWeeklyData();
  }, []);

  // Transform weekly data for chart
  const weeklyData = historicoSemanal.map((item, index) => ({
    date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}`,
    value: item.percentual || 0
  }));

  const getHabitIcon = (nome: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Chá Jaro': <Coffee className="w-6 h-6" />,
      'Hydration': <Droplets className="w-6 h-6" />,
      'Walk': <Footprints className="w-6 h-6" />,
      'Healthy Eating': <Apple className="w-6 h-6" />,
      'Quality Sleep': <Moon className="w-6 h-6" />,
      'Exercise': <Dumbbell className="w-6 h-6" />,
      'Meditation': <Heart className="w-6 h-6" />,
      'Supplementation': <CheckCircle className="w-6 h-6" />
    };
    return iconMap[nome] || <CheckCircle className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <Layout title="Habit Tracker" breadcrumb={["Home", "Habit Tracker & Daily Progress"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Loading habits...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Habit Tracker" breadcrumb={["Home", "Habit Tracker & Daily Progress"]}>
      <div className="space-y-8">
        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-neon-green mb-2">
                {completedHabits}/{totalHabits}
              </div>
              <div className="text-white/70">Habits Completed Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-neon-green mb-2">
                {completionPercentage.toFixed(0)}%
              </div>
              <div className="text-white/70">Completion Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-neon-green mb-2">
                {streakData.current}
              </div>
              <div className="text-white/70">Consecutive Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Habits List */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-neon-green" />
              Today's Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habitosHoje.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/60">No habits configured yet</div>
                <Button
                  onClick={() => navigate("/perfil")}
                  className="mt-4 bg-neon-green text-black hover:bg-neon-green/90"
                >
                  Configure Habits
                </Button>
              </div>
            ) : (
              habitosHoje.map((habit) => (
                <div
                  key={habit.id}
                  className={`p-4 rounded-lg border transition-all ${
                    habit.concluido
                      ? 'bg-neon-green/10 border-neon-green/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={habit.concluido}
                      onCheckedChange={() => handleToggleHabito(habit.id)}
                      className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                    />
                    
                    <div className={`${habit.concluido ? 'text-neon-green' : 'text-white/70'}`}>
                      {getHabitIcon(habit.nome)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${habit.concluido ? 'text-neon-green' : 'text-white'}`}>
                        {habit.nome}
                      </h3>
                    </div>
                    
                    {habit.concluido && (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        {weeklyData.length > 0 && (
          <ProgressChart
            title="Weekly Progress (%)"
            data={weeklyData}
            type="bar"
            unit="%"
          />
        )}

        {/* Streaks and Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="w-6 h-6 text-neon-green" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-neon-green mb-2">
                  {streakData.current}
                </div>
                <div className="text-white/70">consecutive days with 100% habits</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Progress to next achievement:</span>
                  <span className="text-neon-green">{streakData.current}/7 days</span>
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill h-full"
                    style={{ width: `${Math.min((streakData.current / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-neon-green" />
                Best Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-neon-green mb-2">
                  {streakData.best}
                </div>
                <div className="text-white/70">your best record</div>
              </div>
              
              <div className="space-y-2 text-center">
                <div className="text-sm text-white/70">
                  You are {Math.max(streakData.best - streakData.current + 1, 0)} days away from your record!
                </div>
                <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                  🏆 Streak Master
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            View General Progress
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="bg-neon-green text-black hover:bg-neon-green/90"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default HabitTracker;
