
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
  const { user } = useAuth();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!user?.email) {
        console.log('🔍 No user email available for quiz data');
        setLoading(false);
        return;
      }

      console.log('🔍 Loading quiz data for user:', user.email);
      setLoading(true);

      try {
        // Try to get preferences with error handling
        const { data: preferencias, error: prefError } = await supabase
          .from('preferencias_usuario')
          .select('preferencias_alimentares, objetivo, restricoes_alimentares')
          .eq('user_email', user.email)
          .maybeSingle();

        if (prefError) {
          console.log('❌ Error fetching quiz data from preferences:', prefError);
          // Set basic quiz data from fallback
          setQuizData({
            dietaryRestrictions: ['nenhuma']
          });
          setLoading(false);
          return;
        }

        console.log('📊 Raw preferences data:', preferencias);

        if (!preferencias) {
          console.log('❌ No preferences found for user');
          setQuizData(null);
          setLoading(false);
          return;
        }

        // Extract quiz data from preferencias_alimentares if it exists and is an object
        if (preferencias?.preferencias_alimentares && 
            typeof preferencias.preferencias_alimentares === 'object' &&
            !Array.isArray(preferencias.preferencias_alimentares)) {
          
          const quizDataFromDB = preferencias.preferencias_alimentares as any;
          console.log('✅ Found quiz data in preferencias_alimentares:', quizDataFromDB);
          
          const mappedQuizData: QuizData = {
            age: quizDataFromDB.age,
            gender: quizDataFromDB.gender,
            activityLevel: quizDataFromDB.activityLevel,
            healthGoals: quizDataFromDB.healthGoals,
            dietaryRestrictions: quizDataFromDB.dietaryRestrictions,
            mealPreferences: quizDataFromDB.mealPreferences,
            cookingFrequency: quizDataFromDB.cookingFrequency,
            budgetRange: quizDataFromDB.budgetRange,
            healthConditions: quizDataFromDB.healthConditions,
            supplementUsage: quizDataFromDB.supplementUsage
          };
          
          setQuizData(mappedQuizData);
        } else if (typeof preferencias.preferencias_alimentares === 'string') {
          console.log('ℹ️ Found string preference:', preferencias.preferencias_alimentares);
          
          const basicQuizData: QuizData = {
            dietaryRestrictions: [preferencias.preferencias_alimentares]
          };
          
          if (preferencias.objetivo) {
            if (preferencias.objetivo.includes('peso') || preferencias.objetivo.includes('weight')) {
              basicQuizData.healthGoals = ['weight-loss'];
            }
          }
          
          setQuizData(basicQuizData);
        } else {
          console.log('❌ No valid quiz data found in preferencias_alimentares');
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
    if (!quizData) return "Complete your health profile to get personalized recommendations!";
    
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
    if (!quizData) return [
      {
        title: "Complete Health Quiz",
        description: "Take our assessment to get personalized recommendations",
        icon: "user",
        link: "/quiz",
        priority: "high"
      }
    ];

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
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    });
  };

  const getPersonalizedStats = () => {
    if (!quizData) return null;

    const { age, gender, activityLevel, healthGoals } = quizData;
    
    let recommendedCalories = 2000;
    let recommendedWater = 8;
    let recommendedTeaDoses = 2;

    if (gender === 'male') {
      recommendedCalories = age && age > 50 ? 2200 : 2500;
    } else if (gender === 'female') {
      recommendedCalories = age && age > 50 ? 1800 : 2000;
    }

    if (activityLevel === 'high') {
      recommendedCalories += 300;
      recommendedWater += 2;
    } else if (activityLevel === 'low') {
      recommendedCalories -= 200;
    }

    if (healthGoals?.includes('weight-loss')) {
      recommendedCalories -= 300;
      recommendedTeaDoses = 3;
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
