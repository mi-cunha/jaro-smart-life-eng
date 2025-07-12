import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Buscar dados da assinatura no Supabase
    const { data: subscriberData, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_email", user.email)
      .single();

    if (subscriberError || !subscriberData?.stripe_subscription_id) {
      throw new Error("No active subscription found");
    }

    logStep("Found subscription data", subscriberData);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Buscar dados da assinatura no Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriberData.stripe_subscription_id);
    logStep("Retrieved Stripe subscription", { subscriptionId: subscription.id });

    // Buscar o payment intent mais recente para esta assinatura
    const invoices = await stripe.invoices.list({
      subscription: subscription.id,
      limit: 1,
      status: 'paid'
    });

    if (invoices.data.length === 0) {
      throw new Error("No paid invoice found for this subscription");
    }

    const latestInvoice = invoices.data[0];
    const paymentIntent = latestInvoice.payment_intent as string;
    
    if (!paymentIntent) {
      throw new Error("No payment intent found for the latest invoice");
    }

    logStep("Found payment intent", { paymentIntent, invoiceId: latestInvoice.id });

    // Verificar a data da cobrança (created date da invoice)
    const chargeDate = new Date(latestInvoice.created * 1000);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - chargeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    logStep("Checking charge date", { chargeDate, daysDifference });

    let message = "";
    let shouldRefund = false;

    if (daysDifference < 7) {
      // Emitir reembolso e cancelar imediatamente
      logStep("Charge is less than 7 days old, processing refund");
      
      await stripe.refunds.create({
        payment_intent: paymentIntent,
        reason: 'requested_by_customer'
      });
      
      await stripe.subscriptions.del(subscription.id);
      
      message = "Your plan has been cancelled and refunded.";
      shouldRefund = true;
      
      logStep("Refund and immediate cancellation completed");
    } else {
      // Cancelar no final do período
      logStep("Charge is 7+ days old, setting cancel_at_period_end");
      
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      
      message = "Your subscription will not renew after this period.";
      
      logStep("Set subscription to cancel at period end");
    }

    // Atualizar status no Supabase
    const { error: updateError } = await supabaseClient
      .from("subscribers")
      .update({ 
        subscribed: shouldRefund ? false : true, // Manter true se só cancelou no final do período
        updated_at: new Date().toISOString() 
      })
      .eq("user_email", user.email);

    if (updateError) {
      logStep("Error updating subscriber status", updateError);
    } else {
      logStep("Updated subscriber status in database");
    }

    // Registrar log do cancelamento
    logStep("Cancellation completed", { 
      userEmail: user.email, 
      subscriptionId: subscription.id,
      refunded: shouldRefund,
      message 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message,
      refunded: shouldRefund 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});