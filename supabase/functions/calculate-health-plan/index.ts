import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log(`🔍 Calculating health plan for user: ${user.email}`);

    // Get user preferences data and weight history
    const [preferencesRes, historicoRes] = await Promise.all([
      supabase
        .from('preferencias_usuario')
        .select('preferencias_alimentares')
        .eq('user_email', user.email)
        .single(),
      supabase
        .from('historico_peso')
        .select('peso, data')
        .eq('user_email', user.email)
        .order('data', { ascending: false })
        .limit(1)
        .single()
    ]);

    if (preferencesRes.error && preferencesRes.error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', preferencesRes.error);
      throw new Error('Failed to fetch user preferences');
    }

    // Get current weight and daily routine from preferences first, fallback to history
    let peso_atual = null;
    let daily_routine = null;
    
    // First try to get from preferences
    if (preferencesRes.data?.preferencias_alimentares) {
      const prefs = preferencesRes.data.preferencias_alimentares as any;
      peso_atual = prefs.currentWeight;
      daily_routine = prefs.dailyRoutine;
      console.log('Using weight from preferences:', peso_atual);
      console.log('Using activity level from preferences:', daily_routine);
    }
    
    // Fallback to weight history if not found in preferences
    if (!peso_atual && !historicoRes.error && historicoRes.data) {
      peso_atual = historicoRes.data.peso;
      console.log('Using weight from history:', peso_atual);
    }
    
    if (!peso_atual) {
      console.log('No weight available, cannot calculate health plan');
      throw new Error('Current weight not available. Please set your weight first.');
    }

    console.log(`📊 User data - Weight: ${peso_atual}kg, Activity: ${daily_routine || 'not set'}`);

    // Set default activity level if missing
    let activityLevel = daily_routine;
    if (!activityLevel || !['sedentary', 'light', 'moderate', 'intense'].includes(activityLevel)) {
      activityLevel = 'moderate';
      console.log(`⚠️ Setting default activity level: ${activityLevel}`);
      
      // Update preferences with default activity level
      const currentPrefs = preferencesRes.data?.preferencias_alimentares || {};
      await supabase
        .from('preferencias_usuario')
        .upsert({
          user_email: user.email,
          preferencias_alimentares: {
            ...currentPrefs,
            dailyRoutine: activityLevel
          }
        });
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const TMB = 24 * peso_atual;
    
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      intense: 1.725
    };
    
    const TDEE = Math.round((TMB * multipliers[activityLevel as keyof typeof multipliers]) - 500);

    // Calculate water intake
    const total_ml = peso_atual * 35;
    const copos_diarios = Math.ceil(total_ml / 300);

    console.log(`🧮 Calculations - TMB: ${TMB}, TDEE: ${TDEE}, Water: ${total_ml}ml (${copos_diarios} cups)`);

    // Update user profile with calculated values
    const { error: updateError } = await supabase
      .from('perfil_usuario')
      .update({
        calorias_diarias: TDEE,
        agua_diaria_ml: total_ml,
        copos_diarios: copos_diarios,
        daily_routine: activityLevel
      })
      .eq('user_email', user.email);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      throw new Error('Failed to update user profile: ' + updateError.message);
    }

    console.log('✅ Profile updated successfully');

    // Check if "Beber Água" habit exists
    const { data: existingHabit, error: habitError } = await supabase
      .from('habitos')
      .select('id, meta_diaria')
      .eq('user_email', user.email)
      .ilike('nome', '%água%')
      .maybeSingle();

    if (habitError) {
      console.error('❌ Error checking existing habit:', habitError);
    }

    if (existingHabit) {
      // Update existing habit
      const { error: updateHabitError } = await supabase
        .from('habitos')
        .update({
          meta_diaria: copos_diarios,
          nome: 'Beber Água',
          descricao: `Beber ${copos_diarios} copos de água por dia`
        })
        .eq('id', existingHabit.id);

      if (updateHabitError) {
        console.error('❌ Error updating habit:', updateHabitError);
      } else {
        console.log(`✅ Updated existing water habit - Goal: ${copos_diarios} cups`);
      }
    } else {
      // Create new habit
      const { error: createHabitError } = await supabase
        .from('habitos')
        .insert({
          user_email: user.email,
          nome: 'Beber Água',
          descricao: `Beber ${copos_diarios} copos de água por dia`,
          meta_diaria: copos_diarios,
          ativo: true
        });

      if (createHabitError) {
        console.error('❌ Error creating habit:', createHabitError);
      } else {
        console.log(`✅ Created new water habit - Goal: ${copos_diarios} cups`);
      }
    }

    // Return calculated values
    const response = {
      success: true,
      calculations: {
        TMB: TMB,
        TDEE: TDEE,
        recommendedCalories: TDEE,
        waterIntake: {
          total_ml: total_ml,
          cups_per_day: copos_diarios
        },
        activityLevel: activityLevel
      },
      profile_updated: true,
      habit_updated: true
    };

    console.log('🎉 Health plan calculation completed successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in calculate-health-plan function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});