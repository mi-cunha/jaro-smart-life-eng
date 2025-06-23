
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  activeDaysThisMonth: number;
  recipesCookedThisMonth: number;
  teaDosesThisMonth: number;
  habitCompletionRate: number;
  monthlySpending: number;
  recommendedCalories: number;
  recommendedWater: number;
  recommendedTeaDoses: number;
}

export function useRealDashboardData() {
  const { user, session } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeDaysThisMonth: 0,
    recipesCookedThisMonth: 0,
    teaDosesThisMonth: 0,
    habitCompletionRate: 0,
    monthlySpending: 0,
    recommendedCalories: 2000,
    recommendedWater: 8,
    recommendedTeaDoses: 2
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

        // Get health recommendations
        let recommendations = { recommendedCalories: 2000, recommendedWater: 8, recommendedTeaDoses: 2 };
        try {
          const { data: recData } = await supabase.functions.invoke('calculate-health-recommendations', {
            headers: { Authorization: `Bearer ${session?.access_token}` }
          });
          if (recData) {
            recommendations = recData;
          }
        } catch (error) {
          console.warn('Could not fetch recommendations, using defaults:', error);
        }

        // Get recipes cooked this month
        const { data: recipes } = await supabase
          .from('receitas')
          .select('id, created_at')
          .eq('user_email', user.email)
          .gte('created_at', startOfMonth.toISOString());

        const recipesCookedThisMonth = recipes?.length || 0;

        // Get habit completion for this month
        const { data: habitHistory } = await supabase
          .from('historico_habitos')
          .select('concluido, data')
          .eq('user_email', user.email)
          .gte('data', startOfMonthStr);

        const totalHabitEntries = habitHistory?.length || 0;
        const completedHabits = habitHistory?.filter(h => h.concluido).length || 0;
        const habitCompletionRate = totalHabitEntries > 0 ? (completedHabits / totalHabitEntries) * 100 : 0;

        // Calculate active days (days with any activity)
        const uniqueActivityDates = new Set([
          ...(recipes?.map(r => r.created_at.split('T')[0]) || []),
          ...(habitHistory?.map(h => h.data) || [])
        ]);
        const activeDaysThisMonth = uniqueActivityDates.size;

        // Calculate tea doses based on habit completion and recommendations
        const daysInMonth = now.getDate();
        const teaDosesThisMonth = Math.floor(daysInMonth * recommendations.recommendedTeaDoses * (habitCompletionRate / 100));

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
          teaDosesThisMonth,
          habitCompletionRate,
          monthlySpending,
          recommendedCalories: recommendations.recommendedCalories,
          recommendedWater: recommendations.recommendedWater,
          recommendedTeaDoses: recommendations.recommendedTeaDoses
        });

        console.log('✅ Real dashboard data loaded:', {
          activeDaysThisMonth,
          recipesCookedThisMonth,
          teaDosesThisMonth,
          habitCompletionRate: Math.round(habitCompletionRate),
          monthlySpending: monthlySpending.toFixed(2)
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
