
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
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
        
        console.log(`Session details:`, {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email,
          metadata: session.metadata
        });
        
        // Check if we have customer and subscription
        if (!session.customer || !session.subscription) {
          console.error("❌ Missing customer or subscription in session:", {
            customer: session.customer,
            subscription: session.subscription
          });
          return new Response("Missing required session data", { status: 400, headers: corsHeaders });
        }

        try {
          // Get customer and subscription details
          const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          console.log(`Customer: ${customer.email}, Subscription: ${subscription.id}, Status: ${subscription.status}`);
          
          if (!customer.email) {
            console.error("❌ No email found for customer");
            return new Response("Customer email not found", { status: 400, headers: corsHeaders });
          }

          // Determine subscription tier based on price
          let subscriptionTier = "Monthly"; // default
          if (subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            const price = await stripe.prices.retrieve(priceId);
            const amount = price.unit_amount || 0;
            
            if (amount <= 999) {
              subscriptionTier = "Basic";
            } else if (amount <= 1999) {
              subscriptionTier = "Premium";
            } else if (amount >= 2000) {
              subscriptionTier = "Enterprise";
            }
            
            console.log(`Price details: ${priceId}, Amount: ${amount}, Tier: ${subscriptionTier}`);
          }

          // Update subscriber record - CRITICAL FIX: Ensure subscribed is explicitly set to true
          const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
          const isActiveSubscription = subscription.status === 'active' || subscription.status === 'trialing';
          
          console.log(`🔧 Setting subscription data:`, {
            email: customer.email,
            subscribed: isActiveSubscription,
            subscription_status: subscription.status,
            subscription_end: subscriptionEndDate
          });
          
          const { data: updateResult, error } = await supabase
            .from("subscribers")
            .upsert({
              email: customer.email,
              user_email: customer.email,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              stripe_session_id: session.id,
              subscribed: isActiveSubscription, // EXPLICIT Boolean true for active subscriptions
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEndDate,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });

          if (error) {
            console.error("❌ Database update error:", error);
            return new Response(`Database error: ${error.message}`, { status: 500, headers: corsHeaders });
          } else {
            console.log(`✅ Subscription activated for ${customer.email}:`, {
              subscribed: isActiveSubscription,
              tier: subscriptionTier,
              end_date: subscriptionEndDate,
              customer_id: session.customer,
              subscription_id: session.subscription,
              subscription_status: subscription.status
            });
          }
        } catch (err) {
          console.error("❌ Error processing checkout:", err.message);
          return new Response(`Processing error: ${err.message}`, { status: 500, headers: corsHeaders });
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
              const isActive = subscription.status === 'active' || subscription.status === 'trialing';
              
              const { error } = await supabase
                .from("subscribers")
                .update({
                  subscribed: isActive, // EXPLICIT Boolean for renewal
                  subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("email", customer.email);

              if (error) {
                console.error("❌ Renewal update error:", error);
              } else {
                console.log(`✅ Subscription renewed for ${customer.email}, active: ${isActive}`);
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
                subscribed: false, // EXPLICIT Boolean false for cancellation
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
    return new Response(JSON.stringify({ received: true, processed: true }), {
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
