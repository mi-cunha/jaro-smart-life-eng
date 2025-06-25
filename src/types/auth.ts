
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSubscribed: boolean | null;
  userProfile: any;
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, nome?: string) => Promise<{ error?: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any; data?: any; subscribed?: boolean }>;
  signOut: () => Promise<{ error: any }>;
  checkSubscription: (email: string) => Promise<boolean>;
}
