
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserProfile {
  peso_atual?: number
  meta_peso?: number
  calorias_diarias?: number
  doses_cha?: number
  vegano?: boolean
  vegetariano?: boolean
  low_carb?: boolean
}

interface QuizData {
  age?: number
  gender?: string
  activityLevel?: string
  healthGoals?: string[]
}

function calculateRecommendations(profile: UserProfile, quizData?: QuizData) {
  let recommendedCalories = 2000
  let recommendedWater = 8 // glasses
  let recommendedTeaDoses = 2

  // Base calculations
  if (quizData?.gender === 'male') {
    recommendedCalories = quizData?.age && quizData.age > 50 ? 2200 : 2500
  } else if (quizData?.gender === 'female') {
    recommendedCalories = quizData?.age && quizData.age > 50 ? 1800 : 2000
  }

  // Activity level adjustments
  if (quizData?.activityLevel === 'high') {
    recommendedCalories += 300
    recommendedWater += 2
  } else if (quizData?.activityLevel === 'low') {
    recommendedCalories -= 200
  }

  // Weight loss goal adjustments
  if (quizData?.healthGoals?.includes('weight-loss') || (profile.peso_atual && profile.meta_peso && profile.peso_atual > profile.meta_peso)) {
    recommendedCalories -= 300
    recommendedTeaDoses = 3
    recommendedWater += 1
  }

  // Diet type adjustments
  if (profile.vegano || profile.vegetariano) {
    // Vegetarian/vegan diets often require slightly more calories for satiety
    recommendedCalories += 100
  }

  if (profile.low_carb) {
    // Low carb diets typically reduce calories slightly
    recommendedCalories -= 150
    recommendedWater += 1 // More water needed for ketosis
  }

  // Use existing user preferences if available
  if (profile.calorias_diarias && profile.calorias_diarias > 1200) {
    recommendedCalories = profile.calorias_diarias
  }

  if (profile.doses_cha && profile.doses_cha > 0) {
    recommendedTeaDoses = profile.doses_cha
  }

  return {
    recommendedCalories: Math.max(1200, Math.min(3000, recommendedCalories)), // Safety bounds
    recommendedWater: Math.max(6, Math.min(12, recommendedWater)), // Safety bounds
    recommendedTeaDoses: Math.max(1, Math.min(4, recommendedTeaDoses)) // Safety bounds
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user?.email) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔍 Calculating recommendations for user:', user.email)

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('perfil_usuario')
      .select('*')
      .eq('user_email', user.email)
      .maybeSingle()

    // Get quiz data from preferences
    const { data: preferences } = await supabaseClient
      .from('preferencias_usuario')
      .select('preferencias_alimentares')
      .eq('user_email', user.email)
      .maybeSingle()

    let quizData: QuizData | undefined
    if (preferences?.preferencias_alimentares && typeof preferences.preferencias_alimentares === 'object') {
      quizData = preferences.preferencias_alimentares as QuizData
    }

    const recommendations = calculateRecommendations(profile || {}, quizData)

    console.log('✅ Calculated recommendations:', recommendations)

    return new Response(
      JSON.stringify(recommendations),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error calculating recommendations:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
