
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

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

    console.log('📋 Current subscriber data:', {
      stripe_customer_id: subscriber.stripe_customer_id,
      stripe_subscription_id: subscriber.stripe_subscription_id,
      subscribed: subscriber.subscribed,
      subscription_tier: subscriber.subscription_tier,
      subscription_end: subscriber.subscription_end
    })

    // If subscription data is incomplete, try to sync with Stripe
    const needsSync = !subscriber.stripe_subscription_id || !subscriber.subscription_tier || subscriber.subscribed === false
    
    if (needsSync && subscriber.stripe_customer_id) {
      console.log('🔄 Subscription data incomplete, syncing with Stripe...')
      
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2023-10-16',
        })

        const subscriptions = await stripe.subscriptions.list({
          customer: subscriber.stripe_customer_id,
          status: 'active',
          limit: 1
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          console.log('✅ Found active Stripe subscription:', subscription.id)
          
          // Determine subscription tier
          let subscriptionTier = 'Basic'
          if (subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id
            const price = await stripe.prices.retrieve(priceId)
            const amount = price.unit_amount || 0
            
            if (price.recurring?.interval === 'year') {
              subscriptionTier = 'Annual'
            } else if (price.recurring?.interval === 'month') {
              subscriptionTier = amount >= 1999 ? 'Premium' : 'Basic'
            }
          }

          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString()

          // Update subscriber with Stripe data
          await supabaseClient
            .from('subscribers')
            .update({
              stripe_subscription_id: subscription.id,
              subscribed: true,
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEnd,
              user_id: user.id,
              updated_at: new Date().toISOString()
            })
            .eq('user_email', user.email)

          console.log('✅ Updated subscriber with Stripe data')
          
          return new Response(
            JSON.stringify({ 
              subscribed: true,
              subscription_details: {
                tier: subscriptionTier,
                end_date: subscriptionEnd,
                stripe_customer_id: subscriber.stripe_customer_id,
                stripe_subscription_id: subscription.id
              }
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      } catch (stripeError) {
        console.error('❌ Error syncing with Stripe:', stripeError)
      }
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
