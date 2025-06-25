
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
              .update({ subscribed: true, updated_at: new Date().toISOString() })
              .eq('email', email);
          }
          
          return subscribed;
        }
      } catch (funcError) {
        console.error('❌ Edge function call failed:', funcError);
      }
      
      // Fallback to direct database check
      console.log('🔄 Falling back to direct database check');
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
      console.log('📊 Raw subscribed value:', subscriber.subscribed, 'Type:', typeof subscriber.subscribed);
      
      // Handle different possible boolean representations
      let isSubbed = false;
      const subscribedValue = subscriber.subscribed;
      
      if (subscribedValue === true || subscribedValue === 'true' || subscribedValue === 1) {
        isSubbed = true;
      }
      
      console.log('✅ Final subscription status from database:', isSubbed);
      return isSubbed;
    } catch (error) {
      console.error('❌ Unexpected error checking subscription:', error);
      return false;
    }
  }

  // Helper method to manually fix subscription status for testing
  static async fixSubscriptionStatus(email: string): Promise<boolean> {
    try {
      console.log('🔧 Fixing subscription status for:', email);
      
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscribed: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('email', email);

      if (error) {
        console.error('❌ Error fixing subscription status:', error);
        return false;
      }

      console.log('✅ Subscription status fixed successfully');
      return true;
    } catch (error) {
      console.error('❌ Unexpected error fixing subscription status:', error);
      return false;
    }
  }
}
