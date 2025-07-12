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
    console.log('🔄 Starting Stripe subscription sync...')
    
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
        JSON.stringify({ success: false, error: 'User not authenticated' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔍 Syncing subscription for user:', user.email)

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get current subscriber record
    const { data: subscriber, error: subError } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('user_email', user.email)
      .maybeSingle()

    if (subError) {
      console.error('❌ Error fetching subscriber:', subError)
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!subscriber) {
      console.log('❌ No subscriber found for email:', user.email)
      return new Response(
        JSON.stringify({ success: false, error: 'No subscriber record found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📋 Current subscriber data:', {
      stripe_customer_id: subscriber.stripe_customer_id,
      stripe_subscription_id: subscriber.stripe_subscription_id,
      subscribed: subscriber.subscribed,
      subscription_tier: subscriber.subscription_tier
    })

    // If we don't have a customer ID, try to find it
    let customerId = subscriber.stripe_customer_id
    if (!customerId) {
      console.log('🔍 No customer ID found, searching Stripe...')
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      })
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
        console.log('✅ Found Stripe customer:', customerId)
      } else {
        console.log('❌ No Stripe customer found for email:', user.email)
        return new Response(
          JSON.stringify({ success: false, error: 'No Stripe customer found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Get active subscriptions for this customer
    console.log('🔍 Fetching active subscriptions for customer:', customerId)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10
    })

    console.log(`📊 Found ${subscriptions.data.length} active subscriptions`)

    if (subscriptions.data.length === 0) {
      // No active subscriptions, update database accordingly
      await supabaseClient
        .from('subscribers')
        .update({
          stripe_customer_id: customerId,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          stripe_subscription_id: null,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', user.email)

      console.log('✅ Updated subscriber with no active subscription')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          subscribed: false,
          message: 'No active subscription found'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the most recent active subscription
    const subscription = subscriptions.data[0]
    console.log('📋 Active subscription found:', {
      id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end
    })

    // Determine subscription tier based on price
    let subscriptionTier = 'weekly'
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id
      const price = await stripe.prices.retrieve(priceId)
      
      console.log('💰 Price details:', { priceId, interval: price.recurring?.interval, amount: price.unit_amount })
      
      // Determine tier based on interval and amount
      if (price.recurring?.interval === 'year') {
        subscriptionTier = 'annual'
      } else if (price.recurring?.interval === 'month') {
        subscriptionTier = 'monthly'
      } else if (price.recurring?.interval === 'week') {
        subscriptionTier = 'weekly'
      }
    }

    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString()

    // Update the subscriber record with complete data
    const { error: updateError } = await supabaseClient
      .from('subscribers')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscribed: true,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('user_email', user.email)

    if (updateError) {
      console.error('❌ Error updating subscriber:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update subscription data' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Successfully synced subscription data:', {
      subscribed: true,
      tier: subscriptionTier,
      end_date: subscriptionEnd,
      stripe_subscription_id: subscription.id
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        subscribed: true,
        subscription_details: {
          tier: subscriptionTier,
          end_date: subscriptionEnd,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id
        },
        message: 'Subscription data synchronized successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error in sync-stripe-subscription:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})