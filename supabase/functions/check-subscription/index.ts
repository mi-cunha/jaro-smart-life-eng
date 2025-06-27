
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    
    if (userError || !user) {
      console.error('❌ Error getting user:', userError)
      return new Response(
        JSON.stringify({ subscribed: false, error: 'User not authenticated' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔍 Checking subscription for user:', user.email)

    // Check subscription in subscribers table using user_email
    const { data: subscriber, error: subError } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('user_email', user.email)
      .maybeSingle()

    if (subError) {
      console.error('❌ Error fetching subscriber:', subError)
      return new Response(
        JSON.stringify({ subscribed: false, error: 'Database error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!subscriber) {
      console.log('❌ No subscriber found for email:', user.email)
      return new Response(
        JSON.stringify({ subscribed: false, message: 'No subscription found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // IMPROVED subscription check logic - prioritize explicit subscription status
    const hasExplicitSubscription = subscriber.subscribed === true
    const hasValidEndDate = !subscriber.subscription_end || new Date(subscriber.subscription_end) > new Date()
    const hasStripeData = subscriber.stripe_customer_id && subscriber.stripe_subscription_id
    
    // If explicitly subscribed AND has valid end date OR no end date set, consider active
    let finalStatus = hasExplicitSubscription && hasValidEndDate
    
    // If not explicitly subscribed but has Stripe data and valid end date, still consider active
    if (!finalStatus && hasStripeData && hasValidEndDate) {
      console.log('🔄 Using Stripe data fallback - subscription should be active')
      finalStatus = true
      
      // Update the database to fix the inconsistency
      await supabaseClient
        .from('subscribers')
        .update({ 
          subscribed: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_email', user.email)
      
      console.log('✅ Fixed subscription status inconsistency in database')
    }

    console.log('✅ Subscription check result:', {
      subscribed: subscriber.subscribed,
      subscription_end: subscriber.subscription_end,
      hasValidEndDate,
      hasStripeData,
      final_status: finalStatus
    })

    return new Response(
      JSON.stringify({ 
        subscribed: finalStatus,
        subscription_details: {
          tier: subscriber.subscription_tier,
          end_date: subscriber.subscription_end,
          stripe_customer_id: subscriber.stripe_customer_id
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error in check-subscription:', error)
    return new Response(
      JSON.stringify({ subscribed: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
