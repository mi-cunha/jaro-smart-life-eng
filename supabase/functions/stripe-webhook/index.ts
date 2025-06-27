
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Log every request received
  console.log(`🚀 Webhook received: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  
  if (req.method === "OPTIONS") {
    console.log("OPTIONS request handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    console.log(`Environment check - Has Stripe Key: ${!!stripeKey}, Has Webhook Secret: ${!!webhookSecret}`);
    
    if (!stripeKey || !webhookSecret) {
      console.error("Missing environment variables");
      return new Response("Missing configuration", { status: 500, headers: corsHeaders });
    }

    // Initialize clients
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get request body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    console.log(`Request details - Body length: ${body.length}, Has signature: ${!!signature}`);
    
    if (!signature) {
      console.error("No Stripe signature found");
      return new Response("No signature", { status: 400, headers: corsHeaders });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ Event verified: ${event.type} (ID: ${event.id})`);
    } catch (err) {
      console.error(`❌ Signature verification failed: ${err.message}`);
      return new Response("Signature verification failed", { status: 400, headers: corsHeaders });
    }

    // Process events
    console.log(`Processing event: ${event.type}`);
    
    switch (event.type) {
      case "checkout.session.completed":
        console.log("🛒 Processing checkout completion");
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.customer && session.subscription) {
          try {
            // Get customer and subscription details
            const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            
            console.log(`Customer: ${customer.email}, Subscription: ${subscription.id}`);
            
            if (customer.email) {
              // Update subscriber record
              const { error } = await supabase
                .from("subscribers")
                .upsert({
                  email: customer.email,
                  user_email: customer.email,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: session.subscription as string,
                  stripe_session_id: session.id,
                  subscribed: true,
                  subscription_tier: "Monthly",
                  subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'email' });

              if (error) {
                console.error("❌ Database update error:", error);
              } else {
                console.log(`✅ Subscription activated for ${customer.email}`);
              }
            }
          } catch (err) {
            console.error("❌ Error processing checkout:", err.message);
          }
        }
        break;

      case "invoice.payment_succeeded":
        console.log("💰 Processing invoice payment");
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
            
            if (customer.email) {
              const { error } = await supabase
                .from("subscribers")
                .update({
                  subscribed: true,
                  subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("email", customer.email);

              if (error) {
                console.error("❌ Renewal update error:", error);
              } else {
                console.log(`✅ Subscription renewed for ${customer.email}`);
              }
            }
          } catch (err) {
            console.error("❌ Error processing invoice:", err.message);
          }
        }
        break;

      case "customer.subscription.deleted":
        console.log("🚫 Processing subscription cancellation");
        const cancelledSub = event.data.object as Stripe.Subscription;
        
        try {
          const customer = await stripe.customers.retrieve(cancelledSub.customer as string) as Stripe.Customer;
          
          if (customer.email) {
            const { error } = await supabase
              .from("subscribers")
              .update({
                subscribed: false,
                subscription_end: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("email", customer.email);

            if (error) {
              console.error("❌ Cancellation update error:", error);
            } else {
              console.log(`✅ Subscription cancelled for ${customer.email}`);
            }
          }
        } catch (err) {
          console.error("❌ Error processing cancellation:", err.message);
        }
        break;

      default:
        console.log(`🔄 Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("💥 Webhook error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
