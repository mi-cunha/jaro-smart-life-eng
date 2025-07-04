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

    // Get user profile data and weight history
    const [profileRes, historicoRes] = await Promise.all([
      supabase
        .from('perfil_usuario')
        .select('peso_atual, daily_routine')
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

    if (profileRes.error && profileRes.error.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileRes.error);
      throw new Error('Failed to fetch user profile');
    }

    // Get current weight - prioritize most recent from history, fallback to profile
    let peso_atual = null;
    
    // First try to get from weight history (most recent entry)
    if (!historicoRes.error && historicoRes.data) {
      peso_atual = historicoRes.data.peso;
      console.log('Using weight from history:', peso_atual);
    } else if (profileRes.data?.peso_atual) {
      peso_atual = profileRes.data.peso_atual;
      console.log('Using weight from profile:', peso_atual);
    }
    
    if (!peso_atual) {
      console.log('No weight available, cannot calculate health plan');
      throw new Error('Current weight not available. Please set your weight first.');
    }

    const daily_routine = profileRes.data?.daily_routine;

    console.log(`📊 User data - Weight: ${peso_atual}kg, Activity: ${daily_routine || 'not set'}`);

    // Set default activity level if missing
    let activityLevel = daily_routine;
    if (!activityLevel || !['sedentary', 'light', 'moderate', 'intense'].includes(activityLevel)) {
      activityLevel = 'moderate';
      console.log(`⚠️ Setting default activity level: ${activityLevel}`);
      
      // Update profile with default activity level
      await supabase
        .from('perfil_usuario')
        .update({ daily_routine: activityLevel })
        .eq('user_email', user.email);
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