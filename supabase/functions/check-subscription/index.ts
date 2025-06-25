
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

    // Check subscription in subscribers table
    const { data: subscriber, error: subError } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('email', user.email)
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

    // Simplified subscription check logic
    // For perpetual subscriptions (no end date), only check the subscribed field
    // For subscriptions with end dates, check both subscribed field and end date
    const isSubscribed = subscriber.subscribed === true
    const hasValidEndDate = !subscriber.subscription_end || new Date(subscriber.subscription_end) > new Date()
    
    const finalStatus = isSubscribed && hasValidEndDate

    console.log('✅ Subscription check result:', {
      subscribed: subscriber.subscribed,
      subscription_end: subscriber.subscription_end,
      hasValidEndDate,
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
