
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
    
    // AUDIT: Log all request headers
    const allHeaders = {};
    req.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    logStep("📋 ALL REQUEST HEADERS", allHeaders);
    
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

    // AUDIT: Get request body as raw bytes AND as text for comparison
    const bodyArrayBuffer = await req.arrayBuffer();
    const bodyUint8Array = new Uint8Array(bodyArrayBuffer);
    
    // AUDIT: Try to read as text for comparison (create new request to read as text)
    const bodyAsText = new TextDecoder().decode(bodyUint8Array);
    
    // AUDIT: Get signature and log detailed info
    const signature = req.headers.get("stripe-signature");
    const contentType = req.headers.get("content-type");
    
    logStep("🔍 DETAILED REQUEST AUDIT", { 
      bodyByteLength: bodyArrayBuffer.byteLength,
      bodyTextLength: bodyAsText.length,
      contentType: contentType,
      hasSignature: !!signature,
      signatureLength: signature ? signature.length : 0,
      fullSignature: signature,
      // Log first 200 chars of body for inspection
      bodyPreview: bodyAsText.substring(0, 200) + (bodyAsText.length > 200 ? "..." : ""),
      // Log body as hex for corruption check
      bodyHexPreview: Array.from(bodyUint8Array.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join(' '),
    });
    
    // AUDIT: Parse signature components
    if (signature) {
      const sigParts = signature.split(',');
      const parsedSig = {};
      sigParts.forEach(part => {
        const [key, value] = part.split('=');
        parsedSig[key] = value;
      });
      logStep("🔐 SIGNATURE BREAKDOWN", parsedSig);
    }
    
    if (!signature) {
      logStep("❌ No signature found");
      throw new Error("No Stripe signature found");
    }

    // AUDIT: Try multiple approaches to verify signature
    logStep("🧪 TESTING SIGNATURE VERIFICATION METHODS");
    
    // Method 1: Using Uint8Array (current approach)
    try {
      logStep("Testing Method 1: Uint8Array");
      const event1 = stripe.webhooks.constructEvent(
        bodyUint8Array, 
        signature, 
        webhookSecret
      );
      logStep("✅ Method 1 SUCCESS", { type: event1.type, id: event1.id });
    } catch (err) {
      logStep("❌ Method 1 FAILED", { error: err.message, stack: err.stack });
    }

    // Method 2: Using original text body
    try {
      logStep("Testing Method 2: Text body");
      const event2 = stripe.webhooks.constructEvent(
        bodyAsText, 
        signature, 
        webhookSecret
      );
      logStep("✅ Method 2 SUCCESS", { type: event2.type, id: event2.id });
    } catch (err) {
      logStep("❌ Method 2 FAILED", { error: err.message, stack: err.stack });
    }

    // Method 3: Using Buffer (if available in Deno)
    try {
      logStep("Testing Method 3: Buffer");
      const bodyBuffer = Buffer.from(bodyArrayBuffer);
      const event3 = stripe.webhooks.constructEvent(
        bodyBuffer, 
        signature, 
        webhookSecret
      );
      logStep("✅ Method 3 SUCCESS", { type: event3.type, id: event3.id });
    } catch (err) {
      logStep("❌ Method 3 FAILED", { error: err.message, stack: err.stack });
    }

    // AUDIT: Check if body contains valid JSON
    try {
      const jsonBody = JSON.parse(bodyAsText);
      logStep("📝 BODY JSON STRUCTURE", { 
        hasId: !!jsonBody.id,
        hasObject: !!jsonBody.object,
        hasType: !!jsonBody.type,
        hasData: !!jsonBody.data,
        type: jsonBody.type,
        object: jsonBody.object
      });
    } catch (err) {
      logStep("❌ BODY NOT VALID JSON", { error: err.message });
    }

    // AUDIT: Environment checks
    logStep("🔧 ENVIRONMENT AUDIT", {
      webhookSecretLength: webhookSecret.length,
      webhookSecretPrefix: webhookSecret.substring(0, 8) + "...",
      stripeKeyPrefix: stripeKey.substring(0, 8) + "...",
      denoVersion: Deno.version.deno,
    });

    // For now, return audit info instead of throwing
    return new Response(JSON.stringify({ 
      audit: "completed",
      message: "Check logs for detailed audit information",
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 WEBHOOK PROCESSING ERROR", { error: errorMessage, stack: error.stack });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        audit: "failed"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
