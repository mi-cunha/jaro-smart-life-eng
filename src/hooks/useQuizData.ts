
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface QuizData {
  age?: number;
  gender?: string;
  activityLevel?: string;
  healthGoals?: string[];
  dietaryRestrictions?: string[];
  mealPreferences?: string[];
  cookingFrequency?: string;
  budgetRange?: string;
  healthConditions?: string[];
  supplementUsage?: string;
}

export function useQuizData() {
  const { user, userProfile } = useAuth();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!user?.email) {
        console.log('🔍 No user email available');
        setLoading(false);
        return;
      }

      console.log('🔍 Loading quiz data for user:', user.email);
      setLoading(true);

      try {
        // First, get the subscriber record to find the usuario_id
        const { data: subscriber, error: subError } = await supabase
          .from('subscribers')
          .select('usuario_id')
          .eq('email', user.email)
          .single();

        if (subError || !subscriber?.usuario_id) {
          console.log('❌ No subscriber found or no usuario_id:', subError);
          setQuizData(null);
          setLoading(false);
          return;
        }

        console.log('✅ Found subscriber with usuario_id:', subscriber.usuario_id);

        // Then get the preferences using the usuario_id
        const { data: preferencias, error: prefError } = await supabase
          .from('preferencias_usuario')
          .select('*')
          .eq('usuario_id', subscriber.usuario_id)
          .single();

        if (prefError) {
          console.log('❌ Error fetching preferences:', prefError);
          setQuizData(null);
          setLoading(false);
          return;
        }

        if (preferencias?.preferencias_alimentares && typeof preferencias.preferencias_alimentares === 'object') {
          console.log('✅ Found quiz data:', preferencias.preferencias_alimentares);
          const data = preferencias.preferencias_alimentares as QuizData;
          setQuizData(data);
        } else {
          console.log('❌ No quiz data found in preferences');
          setQuizData(null);
        }
      } catch (error) {
        console.error('❌ Error loading quiz data:', error);
        setQuizData(null);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [user?.email]);

  const getPersonalizedMessage = () => {
    if (!quizData) return "Welcome to your health journey!";
    
    const { age, gender, healthGoals, activityLevel } = quizData;
    
    let message = "Your personalized health plan";
    
    if (age && age < 30) {
      message += " focuses on building healthy habits for life";
    } else if (age && age >= 30 && age < 50) {
      message += " emphasizes sustainable wellness practices";
    } else if (age && age >= 50) {
      message += " prioritizes longevity and vitality";
    }

    if (healthGoals?.includes('weight-loss')) {
      message += " with targeted weight management";
    }
    
    if (activityLevel === 'high') {
      message += " and high-performance nutrition";
    }

    return message;
  };

  const getRecommendedActions = () => {
    if (!quizData) return [];

    const actions = [];
    const { healthGoals, cookingFrequency, dietaryRestrictions } = quizData;

    if (healthGoals?.includes('weight-loss')) {
      actions.push({
        title: "Track Your Weight Progress",
        description: "Monitor your journey towards your weight goal",
        icon: "scale",
        link: "/progresso-peso",
        priority: "high"
      });
    }

    if (cookingFrequency === 'rarely') {
      actions.push({
        title: "Quick & Easy Recipes",
        description: "Generate simple recipes that fit your lifestyle",
        icon: "chef",
        link: "/gerador-receitas",
        priority: "medium"
      });
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      actions.push({
        title: "Specialized Meal Planning",
        description: `Recipes that respect your ${dietaryRestrictions.join(', ')} needs`,
        icon: "heart",
        link: "/gerador-receitas",
        priority: "high"
      });
    }

    actions.push({
      title: "Build Daily Habits",
      description: "Create sustainable routines for lasting health",
      icon: "check",
      link: "/habit-tracker",
      priority: "medium"
    });

    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const getPersonalizedStats = () => {
    if (!quizData) return null;

    const { age, gender, activityLevel, healthGoals } = quizData;
    
    // Calculate personalized targets based on quiz data
    let recommendedCalories = 2000; // Base value
    let recommendedWater = 8; // glasses
    let recommendedTeaDoses = 2;

    // Adjust based on gender and age
    if (gender === 'male') {
      recommendedCalories = age && age > 50 ? 2200 : 2500;
    } else if (gender === 'female') {
      recommendedCalories = age && age > 50 ? 1800 : 2000;
    }

    // Adjust based on activity level
    if (activityLevel === 'high') {
      recommendedCalories += 300;
      recommendedWater += 2;
    } else if (activityLevel === 'low') {
      recommendedCalories -= 200;
    }

    // Adjust based on health goals
    if (healthGoals?.includes('weight-loss')) {
      recommendedCalories -= 300;
      recommendedTeaDoses = 3; // More tea for weight loss
    }

    return {
      recommendedCalories,
      recommendedWater,
      recommendedTeaDoses
    };
  };

  return {
    quizData,
    loading,
    getPersonalizedMessage,
    getRecommendedActions,
    getPersonalizedStats,
    hasQuizData: !!quizData
  };
}
