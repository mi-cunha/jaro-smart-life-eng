
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  logStep("🚀 WEBHOOK FUNCTION STARTED", { 
    method: req.method, 
    url: req.url,
    timestamp: new Date().toISOString()
  });

  if (req.method === "OPTIONS") {
    logStep("OPTIONS request received");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method, url: req.url });
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    logStep("Environment check", { 
      hasStripeKey: !!stripeKey, 
      hasWebhookSecret: !!webhookSecret 
    });
    
    if (!stripeKey || !webhookSecret) {
      logStep("❌ Missing configuration", { stripeKey: !!stripeKey, webhookSecret: !!webhookSecret });
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the request body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    logStep("Request details", { 
      bodyLength: body.length, 
      hasSignature: !!signature,
      signature: signature ? signature.substring(0, 50) + "..." : "none"
    });
    
    if (!signature) {
      logStep("❌ No signature found");
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("✅ Webhook signature verified", { type: event.type, id: event.id });
    } catch (err) {
      logStep("❌ Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Process the event
    logStep("Processing event", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("🛒 Processing checkout.session.completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          subscriptionId: session.subscription
        });

        if (session.mode === "subscription" && session.customer && session.subscription) {
          // Get customer details
          const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
          logStep("👤 Customer retrieved", { customerId: customer.id, email: customer.email });
          
          if (customer.email) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            logStep("📅 Subscription retrieved", { 
              subscriptionId: subscription.id, 
              status: subscription.status,
              currentPeriodEnd: subscription.current_period_end
            });
            
            // Determine subscription tier based on price
            let subscriptionTier = "Basic";
            if (subscription.items.data.length > 0) {
              const priceId = subscription.items.data[0].price.id;
              const price = await stripe.prices.retrieve(priceId);
              const amount = price.unit_amount || 0;
              
              if (amount <= 999) {
                subscriptionTier = "Weekly";
              } else if (amount <= 2000) {
                subscriptionTier = "Monthly";
              } else {
                subscriptionTier = "Quarterly";
              }
            }
            
            logStep("💰 Subscription tier determined", { subscriptionTier, priceAmount: subscription.items.data[0]?.price.unit_amount });

            // Update subscriber record
            const { error } = await supabaseClient
              .from('subscribers')
              .upsert({
                email: customer.email,
                user_email: customer.email,
                stripe_customer_id: customer.id,
                stripe_session_id: session.id,
                stripe_subscription_id: subscription.id,
                subscribed: true,
                subscription_tier: subscriptionTier,
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              }, { 
                onConflict: 'email' 
              });

            if (error) {
              logStep("❌ Error updating subscriber", { error: error.message, details: error });
            } else {
              logStep("✅ Subscriber updated successfully", { 
                email: customer.email, 
                subscribed: true,
                tier: subscriptionTier
              });
            }
          } else {
            logStep("❌ No customer email found");
          }
        } else {
          logStep("ℹ️ Session not eligible for processing", { 
            mode: session.mode, 
            hasCustomer: !!session.customer,
            hasSubscription: !!session.subscription
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("💳 Processing invoice.payment_succeeded", { 
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription
        });

        if (invoice.subscription && invoice.customer) {
          // Get customer and subscription details
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          if (customer.email) {
            // Update subscription end date
            const { error } = await supabaseClient
              .from('subscribers')
              .update({
                subscribed: true,
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('email', customer.email);

            if (error) {
              logStep("❌ Error updating subscription renewal", { error: error.message });
            } else {
              logStep("✅ Subscription renewed successfully", { 
                email: customer.email,
                newEndDate: new Date(subscription.current_period_end * 1000).toISOString()
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("❌ Processing customer.subscription.deleted", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer
        });

        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        
        if (customer.email) {
          // Mark subscription as cancelled
          const { error } = await supabaseClient
            .from('subscribers')
            .update({
              subscribed: false,
              subscription_end: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('email', customer.email);

          if (error) {
            logStep("❌ Error updating subscription cancellation", { error: error.message });
          } else {
            logStep("✅ Subscription cancelled successfully", { email: customer.email });
          }
        }
        break;
      }

      default:
        logStep("ℹ️ Unhandled webhook event", { type: event.type });
    }

    logStep("✅ Webhook processing completed successfully");
    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      eventType: event.type,
      eventId: event.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 WEBHOOK PROCESSING ERROR", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        received: true,
        processed: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
