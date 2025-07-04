
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  activeDaysThisMonth: number;
  recipesCookedThisMonth: number;
  favoritedRecipesCount: number;
  teaDosesThisMonth: number;
  habitCompletionRate: number;
  monthlySpending: number;
  recommendedCalories: number;
  recommendedWater: number;
  recommendedTeaDoses: number;
  weightLostSinceStart: number;
}

export function useRealDashboardData() {
  const { user, session } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeDaysThisMonth: 0,
    recipesCookedThisMonth: 0,
    favoritedRecipesCount: 0,
    teaDosesThisMonth: 0,
    habitCompletionRate: 0,
    monthlySpending: 0,
    recommendedCalories: 2000,
    recommendedWater: 8,
    recommendedTeaDoses: 2,
    weightLostSinceStart: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('🔍 Loading real dashboard data for:', user.email);

      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
        const todayStr = now.toISOString().split('T')[0];

        // Get health recommendations
        let recommendations = { recommendedCalories: 2000, recommendedWater: 8, recommendedTeaDoses: 2 };
        try {
          const { data: recData } = await supabase.functions.invoke('calculate-health-plan', {
            headers: { Authorization: `Bearer ${session?.access_token}` }
          });
          if (recData?.success) {
            recommendations = {
              recommendedCalories: recData.calculations.recommendedCalories,
              recommendedWater: recData.calculations.waterIntake.cups_per_day,
              recommendedTeaDoses: 2 // Keep tea doses as before
            };
            console.log('✅ Health plan calculated:', recData.calculations);
          }
        } catch (error) {
          console.warn('Could not calculate health plan, using defaults:', error);
        }

        // Get recipes cooked this month
        const { data: recipes } = await supabase
          .from('receitas')
          .select('id, created_at')
          .eq('user_email', user.email)
          .gte('created_at', startOfMonth.toISOString());

        const recipesCookedThisMonth = recipes?.length || 0;

        // Get favorited recipes count
        const { data: favoritedRecipes } = await supabase
          .from('receitas')
          .select('id')
          .eq('user_email', user.email)
          .eq('favorita', true);

        const favoritedRecipesCount = favoritedRecipes?.length || 0;

        // Get habit completion for this month - buscar dados reais da tabela
        const { data: habitHistory } = await supabase
          .from('historico_habitos')
          .select('concluido, data, habito_id')
          .eq('user_email', user.email)
          .gte('data', startOfMonthStr);

        const totalHabitEntries = habitHistory?.length || 0;
        const completedHabits = habitHistory?.filter(h => h.concluido).length || 0;
        const habitCompletionRate = totalHabitEntries > 0 ? (completedHabits / totalHabitEntries) * 100 : 0;

        // Calculate REAL tea doses based on actual habit data for "Chá Jaro"
        const { data: chajaroHabit } = await supabase
          .from('habitos')
          .select('id')
          .eq('user_email', user.email)
          .ilike('nome', '%chá%jaro%')
          .single();

        let teaDosesThisMonth = 0;
        if (chajaroHabit) {
          const { data: teaHistory } = await supabase
            .from('historico_habitos')
            .select('concluido, quantidade')
            .eq('user_email', user.email)
            .eq('habito_id', chajaroHabit.id)
            .gte('data', startOfMonthStr);

          teaDosesThisMonth = teaHistory?.reduce((total, entry) => {
            return total + (entry.concluido ? (entry.quantidade || 1) : 0);
          }, 0) || 0;
        }

        // Calculate REAL weight lost since start
        const { data: weightHistory } = await supabase
          .from('historico_peso')
          .select('peso, data')
          .eq('user_email', user.email)
          .order('data', { ascending: true });

        let weightLostSinceStart = 0;
        if (weightHistory && weightHistory.length > 1) {
          const initialWeight = weightHistory[0].peso;
          const currentWeight = weightHistory[weightHistory.length - 1].peso;
          weightLostSinceStart = initialWeight - currentWeight;
        }

        // Calculate active days (days with any activity)
        const uniqueActivityDates = new Set([
          ...(recipes?.map(r => r.created_at.split('T')[0]) || []),
          ...(habitHistory?.map(h => h.data) || [])
        ]);
        const activeDaysThisMonth = uniqueActivityDates.size;

        // Get shopping items count (no price calculation since column doesn't exist)
        const { data: shoppingItems } = await supabase
          .from('lista_compras')
          .select('id, comprado')
          .eq('user_email', user.email)
          .eq('comprado', true)
          .gte('updated_at', startOfMonth.toISOString());

        // For now, set monthly spending to 0 since we don't have price data in the table
        const monthlySpending = 0;

        setStats({
          activeDaysThisMonth,
          recipesCookedThisMonth,
          favoritedRecipesCount,
          teaDosesThisMonth,
          habitCompletionRate,
          monthlySpending,
          recommendedCalories: recommendations.recommendedCalories,
          recommendedWater: recommendations.recommendedWater,
          recommendedTeaDoses: recommendations.recommendedTeaDoses,
          weightLostSinceStart: Math.max(0, weightLostSinceStart)
        });

        console.log('✅ Real dashboard data loaded:', {
          activeDaysThisMonth,
          recipesCookedThisMonth,
          favoritedRecipesCount,
          teaDosesThisMonth,
          habitCompletionRate: Math.round(habitCompletionRate),
          monthlySpending: monthlySpending.toFixed(2),
          weightLostSinceStart: weightLostSinceStart.toFixed(1)
        });

      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.email, session?.access_token]);

  return { stats, loading };
}
