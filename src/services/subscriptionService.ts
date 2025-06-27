
import { supabase } from '@/integrations/supabase/client';

export class SubscriptionService {
  static async checkSubscription(email: string, session: any): Promise<boolean> {
    try {
      console.log('🔍 Checking subscription for email:', email);
      
      // Always try to insert/update the user record first
      const { error: upsertError } = await supabase
        .from('subscribers')
        .upsert({
          user_email: email,
          subscribed: false, // Default to false, will be updated if subscription is found
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_email',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('❌ Error upserting subscriber:', upsertError);
      } else {
        console.log('✅ Subscriber record created/updated');
      }

      // First, check subscription status from database
      console.log('🔄 Checking subscription status from database');
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_email', email)
        .maybeSingle();

      if (subError) {
        console.error('❌ Error fetching subscriber:', subError);
        return false;
      }

      if (!subscriber) {
        console.log('❌ No subscriber found for email:', email);
        return false;
      }

      console.log('✅ Subscriber found:', subscriber);
      
      // Enhanced subscription logic with fallbacks
      const hasExplicitSubscription = subscriber.subscribed === true;
      const hasValidStripeData = subscriber.stripe_subscription_id && subscriber.stripe_customer_id;
      const hasValidEndDate = !subscriber.subscription_end || 
        new Date(subscriber.subscription_end) > new Date();
      
      // Primary check: explicit subscribed field
      if (hasExplicitSubscription && hasValidEndDate) {
        console.log('✅ Primary check passed: explicit subscription active');
        return true;
      }
      
      // Fallback check: if we have valid Stripe data but subscribed is false/null
      if (hasValidStripeData && hasValidEndDate && !hasExplicitSubscription) {
        console.log('🔄 Fallback check: has valid Stripe data, attempting to verify with edge function');
        
        try {
          const { data: checkResult, error: checkError } = await supabase.functions.invoke('check-subscription', {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          });

          if (checkError) {
            console.error('❌ Error calling check-subscription function:', checkError);
            // If edge function fails but we have valid data, assume subscribed
            console.log('🔄 Edge function failed, but we have valid Stripe data - assuming subscribed');
            return hasValidStripeData && hasValidEndDate;
          } else if (checkResult) {
            console.log('✅ Subscription check result from edge function:', checkResult);
            const subscribed = checkResult.subscribed || false;
            
            // If user is subscribed, update the database to fix the inconsistency  
            if (subscribed) {
              console.log('🔄 Updating subscription status in database to fix inconsistency');
              await supabase
                .from('subscribers')
                .update({ 
                  subscribed: true, 
                  subscription_tier: checkResult.subscription_tier || 'Basic',
                  subscription_end: checkResult.subscription_end,
                  updated_at: new Date().toISOString() 
                })
                .eq('user_email', email);
            }
            
            return subscribed;
          }
        } catch (funcError) {
          console.error('❌ Edge function call failed:', funcError);
          // Fallback to local logic if edge function completely fails
          console.log('🔄 Using local fallback logic');
          return hasValidStripeData && hasValidEndDate;
        }
      }
      
      const finalStatus = hasExplicitSubscription && hasValidEndDate;
      
      console.log('📊 Final subscription status:', {
        subscribed: subscriber.subscribed,
        stripe_subscription_id: subscriber.stripe_subscription_id,
        stripe_customer_id: subscriber.stripe_customer_id,
        subscription_end: subscriber.subscription_end,
        hasExplicitSubscription,
        hasValidStripeData,
        hasValidEndDate,
        final_status: finalStatus
      });
      
      return finalStatus;
    } catch (error) {
      console.error('❌ Unexpected error checking subscription:', error);
      return false;
    }
  }

  static async refreshSubscriptionStatus(email: string, session: any): Promise<boolean> {
    console.log('🔄 Refreshing subscription status for:', email);
    
    // Force refresh by calling edge function first
    try {
      const { data: checkResult, error: checkError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!checkError && checkResult) {
        console.log('✅ Edge function refresh successful:', checkResult);
      }
    } catch (error) {
      console.error('❌ Error in edge function refresh:', error);
    }
    
    // Then do a fresh check with updated data
    return await this.checkSubscription(email, session);
  }
}
