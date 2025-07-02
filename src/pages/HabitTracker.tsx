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
  Flame,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHabitos } from "@/hooks/useHabitos";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";

const HabitTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { perfil } = useSupabasePerfil();
  const { 
    getHabitosHoje, 
    getProgressoHabitos, 
    marcarHabito,
    getHistoricoSemanal,
    carregarHabitos, // CRITICAL FIX: Use exposed carregarHabitos
    loading 
  } = useHabitos();

  const [historicoSemanal, setHistoricoSemanal] = useState<any[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [defaultHabitsCreated, setDefaultHabitsCreated] = useState(false);

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

  const createDefaultHabits = async () => {
    if (!user || !perfil || defaultHabitsCreated) return;

    const defaultHabits = [
      {
        nome: 'Completar todas as refeições',
        descricao: 'Café da manhã, almoço e jantar',
        meta_diaria: 3
      },
      {
        nome: 'Tomar todas as doses de chá',
        descricao: `${perfil.doses_cha || 2} doses por dia`,
        meta_diaria: perfil.doses_cha || 2
      },
      {
        nome: 'Beber água suficiente',
        descricao: '8 copos de água por dia',
        meta_diaria: 8
      }
    ];

    try {
      const { data: existingHabits } = await supabase
        .from('habitos')
        .select('nome')
        .eq('user_email', user.email);

      const existingNames = existingHabits?.map(h => h.nome) || [];
      const habitsToCreate = defaultHabits.filter(h => !existingNames.includes(h.nome));

      if (habitsToCreate.length > 0) {
        const { error } = await supabase
          .from('habitos')
          .insert(
            habitsToCreate.map(habit => ({
              ...habit,
              user_email: user.email,
              ativo: true
            }))
          );

        if (!error) {
          setDefaultHabitsCreated(true);
          await carregarHabitos();
        }
      } else {
        setDefaultHabitsCreated(true);
      }
    } catch (error) {
      console.error('Error creating default habits:', error);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('habitos')
        .insert({
          nome: newHabitName.trim(),
          user_email: user.email,
          descricao: '',
          meta_diaria: 1,
          ativo: true
        });

      if (error) {
        console.error('Error adding habit:', error);
        toast.error('Erro ao adicionar hábito');
        return;
      }

      toast.success('Hábito adicionado com sucesso!');
      setNewHabitName('');
      setShowAddHabit(false);
      
      // CRITICAL FIX: Reload habits immediately after adding
      console.log('🔄 Recarregando hábitos após adição...');
      await carregarHabitos();
    } catch (error) {
      console.error('Unexpected error adding habit:', error);
      toast.error('Erro inesperado ao adicionar hábito');
    }
  };

  // Create default habits on first load
  useEffect(() => {
    if (user && perfil && !defaultHabitsCreated) {
      createDefaultHabits();
    }
  }, [user, perfil, defaultHabitsCreated]);

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
      'Completar todas as refeições': <Apple className="w-6 h-6" />,
      'Tomar todas as doses de chá': <Coffee className="w-6 h-6" />,
      'Beber água suficiente': <Droplets className="w-6 h-6" />,
      'Chá Jaro': <Coffee className="w-6 h-6" />,
      'Hydration': <Droplets className="w-6 h-6" />,
      'Walk': <Footprints className="w-6 h-6" />,
      'Healthy Eating': <Apple className="w-6 h-6" />,
      'Quality Sleep': <Moon className="w-6 h-6" />,
      'Exercise': <Dumbbell className="w-6 h-6" />,
      'Meditation': <Heart className="w-6 h-6" />
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-neon-green" />
              Today's Habits
            </CardTitle>
            <Button
              onClick={() => setShowAddHabit(!showAddHabit)}
              className="bg-neon-green text-black hover:bg-neon-green/90"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddHabit && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter habit name..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="flex-1 bg-transparent border border-white/20 rounded px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-neon-green"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
                  />
                  <Button
                    onClick={handleAddHabit}
                    className="bg-neon-green text-black hover:bg-neon-green/90"
                    disabled={!newHabitName.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddHabit(false);
                      setNewHabitName('');
                    }}
                    variant="outline"
                    className="border-white/20 text-white/70 hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {habitosHoje.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/60 mb-4">No habits configured yet</div>
                <div className="text-sm text-white/40">
                  Click "Add Habit" above to create your first habit
                </div>
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
                        className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green w-4 h-4"
                      />
                    
                    <div className={`${habit.concluido ? 'text-neon-green' : 'text-white/70'}`}>
                      {getHabitIcon(habit.nome)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${habit.concluido ? 'text-neon-green' : 'text-white'}`}>
                        {habit.nome}
                      </h3>
                      {habit.descricao && (
                        <p className="text-sm text-white/60 mt-1">
                          {habit.descricao}
                        </p>
                      )}
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
