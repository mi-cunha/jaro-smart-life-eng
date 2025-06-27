
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
    
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    for (const [key, value] of req.headers.entries()) {
      headers[key] = value;
    }
    logStep("📋 Request Headers", headers);
    
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

    // Get raw body as ArrayBuffer and convert to Uint8Array
    const rawBody = await req.arrayBuffer();
    const bodyUint8Array = new Uint8Array(rawBody);
    
    // Also get text version for logging (first 500 chars)
    const bodyText = new TextDecoder().decode(bodyUint8Array);
    
    logStep("📦 Request Body Analysis", { 
      bodyLength: bodyUint8Array.length,
      bodyPreview: bodyText.substring(0, 500),
      contentType: req.headers.get("content-type"),
      isArrayBuffer: rawBody instanceof ArrayBuffer,
      uint8ArrayLength: bodyUint8Array.length
    });
    
    const signature = req.headers.get("stripe-signature");
    
    logStep("🔒 Signature Analysis", { 
      signature: signature ? signature.substring(0, 50) + "..." : "null",
      signatureLength: signature?.length || 0,
      hasSignature: !!signature
    });
    
    if (!signature) {
      logStep("❌ No signature found in headers");
      throw new Error("No Stripe signature found");
    }

    // Parse signature components for debugging
    const sigParts = signature.split(',');
    const timestamp = sigParts.find(part => part.startsWith('t='))?.substring(2);
    const v1Signature = sigParts.find(part => part.startsWith('v1='))?.substring(3);
    
    logStep("🔍 Signature Components", {
      timestamp,
      v1Signature: v1Signature ? v1Signature.substring(0, 20) + "..." : null,
      totalParts: sigParts.length,
      allParts: sigParts
    });

    let event;
    try {
      logStep("🔐 Attempting signature verification with constructEventAsync");
      
      // Try with constructEventAsync first
      event = await stripe.webhooks.constructEventAsync(
        bodyUint8Array, 
        signature, 
        webhookSecret
      );
      
      logStep("✅ Signature verified successfully with constructEventAsync");
    } catch (asyncError: any) {
      logStep("❌ constructEventAsync failed", { 
        error: asyncError.message,
        errorType: asyncError.constructor.name 
      });
      
      try {
        logStep("🔐 Attempting signature verification with constructEvent (fallback)");
        
        // Fallback to synchronous version
        event = stripe.webhooks.constructEvent(
          bodyUint8Array, 
          signature, 
          webhookSecret
        );
        
        logStep("✅ Signature verified successfully with constructEvent (fallback)");
      } catch (syncError: any) {
        logStep("❌ Both signature verification methods failed", { 
          asyncError: asyncError.message,
          syncError: syncError.message,
          webhookSecretLength: webhookSecret.length,
          webhookSecretPrefix: webhookSecret.substring(0, 10) + "..."
        });
        
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
    }

    logStep("📦 Event Successfully Parsed", { 
      eventType: event.type,
      eventId: event.id,
      created: event.created
    });

    // Process different event types
    switch (event.type) {
      case "checkout.session.completed":
        logStep("🛒 Processing checkout.session.completed", { 
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
        logStep("👤 Customer retrieved", { 
          customerId: session.customer,
          email: (customer as Stripe.Customer).email 
        });
        
        if (!customer || customer.deleted || !(customer as Stripe.Customer).email) {
          logStep("❌ Invalid customer data");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        logStep("📅 Subscription retrieved", { 
          subscriptionId: session.subscription,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end
        });

        // Update subscriber in database
        const { error: updateError } = await supabaseClient
          .from("subscribers")
          .update({
            subscribed: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_tier: "Monthly",
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_email", (customer as Stripe.Customer).email);

        if (updateError) {
          logStep("❌ Database update error", { error: updateError });
        } else {
          logStep("✅ Subscriber updated successfully", { 
            email: (customer as Stripe.Customer).email,
            subscribed: true,
            tier: "Monthly"
          });
        }
        break;

      case "invoice.payment_succeeded":
        logStep("📥 Processing invoice.payment_succeeded");
        
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.subscription) {
          logStep("❌ No subscription in invoice");
          break;
        }

        try {
          const invoiceSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
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
        logStep("🚫 Processing customer.subscription.deleted");
        
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
    logStep("💥 WEBHOOK PROCESSING ERROR", { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
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
