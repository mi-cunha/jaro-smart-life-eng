
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
    logStep("📨 STRIPE WEBHOOK RECEIVED", { 
      method: req.method, 
      url: req.url,
      timestamp: new Date().toISOString()
    });
    
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    for (const [key, value] of req.headers.entries()) {
      headers[key] = value;
    }
    logStep("📋 ALL REQUEST HEADERS", headers);
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    logStep("🔧 ENVIRONMENT CHECK", { 
      hasStripeKey: !!stripeKey, 
      hasWebhookSecret: !!webhookSecret,
      webhookSecretLength: webhookSecret?.length || 0
    });
    
    if (!stripeKey || !webhookSecret) {
      logStep("❌ MISSING ENVIRONMENT VARIABLES", { 
        stripeKey: !!stripeKey, 
        webhookSecret: !!webhookSecret 
      });
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
    
    logStep("📦 REQUEST BODY DETAILS", { 
      bodyLength: bodyUint8Array.length,
      bodyPreview: bodyText.substring(0, 500),
      contentType: req.headers.get("content-type"),
      hasBody: bodyUint8Array.length > 0
    });
    
    const signature = req.headers.get("stripe-signature");
    
    logStep("🔐 STRIPE SIGNATURE CHECK", { 
      hasSignature: !!signature,
      signatureLength: signature?.length || 0,
      signaturePreview: signature ? signature.substring(0, 100) + "..." : "null"
    });
    
    if (!signature) {
      logStep("❌ NO STRIPE SIGNATURE FOUND");
      return new Response(
        JSON.stringify({ 
          error: "No Stripe signature found",
          received: true,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Parse signature components for debugging
    const sigParts = signature.split(',');
    const timestamp = sigParts.find(part => part.startsWith('t='))?.substring(2);
    const v1Signature = sigParts.find(part => part.startsWith('v1='))?.substring(3);
    
    logStep("🔍 SIGNATURE COMPONENTS", {
      timestamp,
      v1Signature: v1Signature ? v1Signature.substring(0, 20) + "..." : null,
      totalParts: sigParts.length,
      webhookSecretPrefix: webhookSecret.substring(0, 10) + "..."
    });

    let event;
    try {
      logStep("🔐 ATTEMPTING SIGNATURE VERIFICATION");
      
      event = stripe.webhooks.constructEvent(
        bodyText, 
        signature, 
        webhookSecret
      );
      
      logStep("✅ SIGNATURE VERIFIED SUCCESSFULLY");
    } catch (verifyError: any) {
      logStep("❌ SIGNATURE VERIFICATION FAILED", { 
        error: verifyError.message,
        errorType: verifyError.constructor.name,
        webhookSecretLength: webhookSecret.length
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Invalid signature",
          details: verifyError.message,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    logStep("🎉 EVENT SUCCESSFULLY PARSED", { 
      eventType: event.type,
      eventId: event.id,
      created: event.created,
      livemode: event.livemode
    });

    // Process different event types
    switch (event.type) {
      case "checkout.session.completed":
        logStep("🛒 PROCESSING CHECKOUT COMPLETED");
        
        const session = event.data.object as Stripe.Checkout.Session;
        
        logStep("📋 SESSION DETAILS", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          paymentStatus: session.payment_status
        });
        
        if (!session.customer) {
          logStep("❌ NO CUSTOMER IN SESSION");
          break;
        }

        // Get customer details
        const customer = await stripe.customers.retrieve(session.customer as string);
        logStep("👤 CUSTOMER RETRIEVED", { 
          customerId: session.customer,
          email: (customer as Stripe.Customer).email,
          deleted: customer.deleted
        });
        
        if (!customer || customer.deleted || !(customer as Stripe.Customer).email) {
          logStep("❌ INVALID CUSTOMER DATA");
          break;
        }

        // Get subscription details if present
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          logStep("📅 SUBSCRIPTION RETRIEVED", { 
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
            logStep("❌ DATABASE UPDATE ERROR", { error: updateError });
          } else {
            logStep("✅ SUBSCRIBER UPDATED SUCCESSFULLY", { 
              email: (customer as Stripe.Customer).email,
              subscribed: true,
              tier: "Monthly"
            });
          }
        }
        break;

      case "invoice.payment_succeeded":
        logStep("💰 PROCESSING INVOICE PAYMENT");
        
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.subscription) {
          logStep("❌ NO SUBSCRIPTION IN INVOICE");
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
              logStep("❌ RENEWAL UPDATE ERROR", { error: renewError });
            } else {
              logStep("✅ SUBSCRIPTION RENEWED", { 
                email: (invoiceCustomer as Stripe.Customer).email 
              });
            }
          }
        } catch (subError: any) {
          logStep("❌ ERROR PROCESSING INVOICE", { error: subError.message });
        }
        break;

      case "customer.subscription.deleted":
        logStep("🚫 PROCESSING SUBSCRIPTION CANCELLATION");
        
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
            logStep("❌ CANCELLATION UPDATE ERROR", { error: cancelError });
          } else {
            logStep("✅ SUBSCRIPTION CANCELLED IN DATABASE", { 
              email: (cancelledCustomer as Stripe.Customer).email 
            });
          }
        }
        break;

      default:
        logStep("🔄 UNHANDLED EVENT TYPE", { type: event.type });
    }

    logStep("✅ WEBHOOK PROCESSED SUCCESSFULLY");
    return new Response(JSON.stringify({ 
      received: true,
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 WEBHOOK PROCESSING ERROR", { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        received: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
