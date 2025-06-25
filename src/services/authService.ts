
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserService } from './userService';
import { SubscriptionService } from './subscriptionService';

export class AuthService {
  static async signUp(email: string, password: string, nome?: string) {
    try {
      console.log('🚀 Starting signup process for:', email);
      
      // Check if user already exists
      const userExists = await UserService.checkUserExists(email);
      if (userExists) {
        console.log('👤 User already exists:', email);
        toast.error('An account with this email already exists. Please sign in or reset your password.');
        return { error: { message: 'User already exists' } };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome || 'User'
          }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('✅ Signup successful, creating subscriber record...');
      
      // Create subscriber record immediately after signup
      const { error: subscriberError } = await supabase
        .from('subscribers')
        .upsert({
          email: email,
          user_email: email,
          subscribed: false,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });

      if (subscriberError) {
        console.error('❌ Error creating subscriber record:', subscriberError);
      } else {
        console.log('✅ Subscriber record created for new user');
      }

      toast.success('Account created successfully! Please check your email.');
      return { data };
    } catch (error) {
      console.error('❌ Unexpected signup error:', error);
      toast.error('Unexpected error creating account');
      return { error };
    }
  }

  static async signIn(email: string, password: string, session: any) {
    try {
      console.log('🔑 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('✅ Sign in successful, checking subscription...');
      
      // Wait a bit and then check subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      const subscribed = await SubscriptionService.checkSubscription(email, session);
      
      console.log('🎯 Final login result - subscribed:', subscribed);
      toast.success('Login successful!');
      
      return { data, subscribed };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      toast.error('Unexpected error signing in');
      return { error };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Logout successful!');
      return { error: null };
    } catch (error) {
      toast.error('Unexpected error signing out');
      return { error };
    }
  }
}
