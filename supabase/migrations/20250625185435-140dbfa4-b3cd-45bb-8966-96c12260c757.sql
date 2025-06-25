
-- Add unique constraint to email field in subscribers table to prevent duplicates
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_email_unique UNIQUE (email);

-- Also add user_id column if it doesn't exist (for better data consistency)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'user_id') THEN
        ALTER TABLE public.subscribers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS policies to be more secure
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create more restrictive RLS policies
CREATE POLICY "Users can view own subscription" ON public.subscribers
    FOR SELECT USING (email = auth.email() OR user_id = auth.uid());

CREATE POLICY "Users can update own subscription" ON public.subscribers
    FOR UPDATE USING (email = auth.email() OR user_id = auth.uid());

CREATE POLICY "Service can insert subscriptions" ON public.subscribers
    FOR INSERT WITH CHECK (true);
