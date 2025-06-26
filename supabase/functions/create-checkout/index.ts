
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan } = await req.json();
    
    console.log('🏁 Starting checkout creation for plan:', plan);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log('👤 User authenticated:', user.email);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('🔍 Found existing Stripe customer:', customerId);
    } else {
      console.log('🆕 Will create new Stripe customer');
    }

    // Get price ID based on plan
    let priceId;
    switch (plan) {
      case "Weekly Plan":
        priceId = Deno.env.get("STRIPE_WEEKLY_PRICE_ID_EN");
        break;
      case "Monthly Plan":
        priceId = Deno.env.get("STRIPE_MONTHLY_PRICE_ID_EN");
        break;
      case "Quarterly Plan":
        priceId = Deno.env.get("STRIPE_QUARTERLY_PRICE_ID_EN");
        break;
      default:
        priceId = Deno.env.get("STRIPE_MONTHLY_PRICE_ID_EN");
    }

    console.log('💰 Using price ID:', priceId);

    // Update subscriber record before creating checkout
    console.log('📝 Updating subscriber record...');
    const { error: upsertError } = await supabaseClient
      .from('subscribers')
      .upsert({
        email: user.email,
        user_email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: false, // Will be updated after successful payment
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('❌ Error updating subscriber record:', upsertError);
    } else {
      console.log('✅ Subscriber record updated');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan: plan
      }
    });

    console.log('✅ Stripe checkout session created:', session.id);

    // Update subscriber record with session info
    await supabaseClient
      .from('subscribers')
      .update({
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('email', user.email);

    console.log('🎯 Checkout process completed successfully');

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error creating checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
