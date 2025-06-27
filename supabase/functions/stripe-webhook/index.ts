
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

    // Verify webhook signature using async method
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
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
          metadata: session.metadata,
          status: session.status
        });
        
        // Extract email from customer_details or metadata
        const customerEmail = session.customer_details?.email || session.metadata?.user_email;
        
        if (!customerEmail) {
          console.error("❌ No customer email found");
          return new Response("Customer email not found", { status: 400, headers: corsHeaders });
        }

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
          
          // Determine subscription tier based on plan from metadata
          let subscriptionTier = "Monthly"; // default
          const planFromMetadata = session.metadata?.plan;
          
          if (planFromMetadata) {
            if (planFromMetadata.toLowerCase().includes('weekly')) {
              subscriptionTier = "Weekly";
            } else if (planFromMetadata.toLowerCase().includes('monthly')) {
              subscriptionTier = "Monthly";
            } else if (planFromMetadata.toLowerCase().includes('quarterly')) {
              subscriptionTier = "Quarterly";
            }
            console.log(`Plan from metadata: ${planFromMetadata}, Tier set to: ${subscriptionTier}`);
          } else {
            // Fallback: check price amount if no metadata
            if (subscription.items.data.length > 0) {
              const priceId = subscription.items.data[0].price.id;
              const price = await stripe.prices.retrieve(priceId);
              const amount = price.unit_amount || 0;
              
              // Based on your pricing: Weekly $9.99, Monthly $19.99, Quarterly $35
              if (amount <= 1000) {
                subscriptionTier = "Weekly";
              } else if (amount <= 2000) {
                subscriptionTier = "Monthly";
              } else {
                subscriptionTier = "Quarterly";
              }
              console.log(`Price fallback: ${priceId}, Amount: ${amount}, Tier: ${subscriptionTier}`);
            }
          }

          // Update subscriber record - EXPLICIT Boolean true for active subscriptions
          const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
          const isActiveSubscription = subscription.status === 'active' || subscription.status === 'trialing';
          
          console.log(`🔧 Setting subscription data:`, {
            user_email: customerEmail,
            subscribed: isActiveSubscription,
            subscription_status: subscription.status,
            subscription_tier: subscriptionTier,
            subscription_end: subscriptionEndDate
          });
          
          // Use user_email as conflict resolution - REMOVED user_id to avoid foreign key issues
          const { data: updateResult, error } = await supabase
            .from("subscribers")
            .upsert({
              user_email: customerEmail,
              // user_id: removed to avoid foreign key constraint errors
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              stripe_session_id: session.id,
              subscribed: isActiveSubscription, // EXPLICIT Boolean true for active subscriptions
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEndDate,
              updated_at: new Date().toISOString(),
            }, { 
              onConflict: 'user_email',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error("❌ Database update error:", error);
            return new Response(`Database error: ${error.message}`, { status: 500, headers: corsHeaders });
          } else {
            console.log(`✅ Subscription activated for ${customerEmail}:`, {
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
                .eq("user_email", customer.email);

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
              .eq("user_email", customer.email);

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
