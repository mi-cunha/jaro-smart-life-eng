
import { supabase } from '@/integrations/supabase/client';

export class SubscriptionService {
  static async checkSubscription(email: string, session: any): Promise<boolean> {
    try {
      console.log('🔍 Checking subscription for email:', email);
      
      // Always try to insert/update the user record first
      const { error: upsertError } = await supabase
        .from('subscribers')
        .upsert({
          email: email,
          user_email: email,
          subscribed: false, // Default to false, will be updated if subscription is found
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('❌ Error upserting subscriber:', upsertError);
      } else {
        console.log('✅ Subscriber record created/updated');
      }

      // First, try to check subscription via edge function
      try {
        const { data: checkResult, error: checkError } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (checkError) {
          console.error('❌ Error calling check-subscription function:', checkError);
        } else if (checkResult) {
          console.log('✅ Subscription check result from edge function:', checkResult);
          const subscribed = checkResult.subscribed || false;
          
          // If user is subscribed, update the database to ensure consistency
          if (subscribed) {
            console.log('🔄 Updating subscription status in database');
            await supabase
              .from('subscribers')
              .update({ 
                subscribed: true, 
                subscription_tier: checkResult.subscription_tier || 'Basic',
                subscription_end: checkResult.subscription_end,
                updated_at: new Date().toISOString() 
              })
              .eq('email', email);
          }
          
          return subscribed;
        }
      } catch (funcError) {
        console.error('❌ Edge function call failed:', funcError);
      }
      
      // Fallback to direct database check
      console.log('🔄 Checking subscription status from database');
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email)
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
      
      // Check subscription status and expiration
      const isSubscribed = subscriber.subscribed === true;
      const hasValidEndDate = !subscriber.subscription_end || 
        new Date(subscriber.subscription_end) > new Date();
      
      const finalStatus = isSubscribed && hasValidEndDate;
      
      console.log('📊 Final subscription status:', {
        subscribed: subscriber.subscribed,
        subscription_end: subscriber.subscription_end,
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
    
    // Just do a fresh check - the webhook should handle the real updates
    return await this.checkSubscription(email, session);
  }
}
