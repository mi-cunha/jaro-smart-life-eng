
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

    // Get raw body as bytes
    const body = await req.arrayBuffer();
    const bodyUint8Array = new Uint8Array(body);
    
    const signature = req.headers.get("stripe-signature");
    
    logStep("🔒 Verifying Signature", { 
      signature: signature ? signature.substring(0, 20) + "..." : "null",
      contentLength: bodyUint8Array.length
    });
    
    if (!signature) {
      logStep("❌ No signature found");
      throw new Error("No Stripe signature found");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        bodyUint8Array, 
        signature, 
        webhookSecret
      );
      logStep("✅ Signature verified successfully");
    } catch (err: any) {
      logStep("❌ Signature Verification Failed", { error: err.message });
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    logStep("📦 Event Received", { eventType: event.type });

    // Process different event types
    switch (event.type) {
      case "checkout.session.completed":
        logStep("🛒 checkout.session.completed", { 
          customer: event.data.object.customer,
          sessionId: event.data.object.id
        });
        
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.customer) {
          logStep("❌ No customer in session");
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(session.customer as string);
        logStep("👤 Customer fetched", { email: (customer as Stripe.Customer).email });
        
        if (!customer || customer.deleted || !(customer as Stripe.Customer).email) {
          logStep("❌ Invalid customer data");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        logStep("📅 Subscription fetched", { 
          status: subscription.status,
          end: subscription.current_period_end
        });

        // Update subscriber in database
        const { error: updateError } = await supabaseClient
          .from("subscribers")
          .update({
            subscribed: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_tier: "Monthly", // You can determine this from the price
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_email", (customer as Stripe.Customer).email);

        if (updateError) {
          logStep("❌ Database update error", { error: updateError });
        } else {
          logStep("✅ Subscriber marked as subscribed", { 
            email: (customer as Stripe.Customer).email,
            tier: "Monthly"
          });
        }
        break;

      case "invoice.payment_succeeded":
        logStep("📥 Payment succeeded for customer", { 
          email: (event.data.object as any).customer_email 
        });
        
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.subscription) {
          logStep("❌ No subscription in invoice");
          break;
        }

        try {
          const invoiceSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          logStep("📋 Invoice subscription fetched", { 
            status: invoiceSubscription.status,
            customerId: invoiceSubscription.customer
          });

          // Get customer from subscription
          const invoiceCustomer = await stripe.customers.retrieve(invoiceSubscription.customer as string);
          
          if (invoiceCustomer && !invoiceCustomer.deleted && (invoiceCustomer as Stripe.Customer).email) {
            const { error: renewError } = await supabaseClient
              .from("subscribers")
              .update({
                subscribed: true,
                subscription_end: new Date(invoiceSubscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("user_email", (invoiceCustomer as Stripe.Customer).email);

            if (renewError) {
              logStep("❌ Renewal update error", { error: renewError });
            } else {
              logStep("✅ Subscription renewed", { 
                email: (invoiceCustomer as Stripe.Customer).email 
              });
            }
          }
        } catch (subError: any) {
          logStep("❌ Error processing invoice.payment_succeeded", { error: subError.message });
        }
        break;

      case "customer.subscription.deleted":
        logStep("🚫 Subscription cancelled");
        
        const cancelledSub = event.data.object as Stripe.Subscription;
        const cancelledCustomer = await stripe.customers.retrieve(cancelledSub.customer as string);
        
        if (cancelledCustomer && !cancelledCustomer.deleted && (cancelledCustomer as Stripe.Customer).email) {
          const { error: cancelError } = await supabaseClient
            .from("subscribers")
            .update({
              subscribed: false,
              subscription_end: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_email", (cancelledCustomer as Stripe.Customer).email);

          if (cancelError) {
            logStep("❌ Cancellation update error", { error: cancelError });
          } else {
            logStep("✅ Subscription cancelled in database", { 
              email: (cancelledCustomer as Stripe.Customer).email 
            });
          }
        }
        break;

      default:
        logStep("🔄 Unhandled event type", { type: event.type });
    }

    logStep("✅ Webhook processed successfully");
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 WEBHOOK PROCESSING ERROR", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
