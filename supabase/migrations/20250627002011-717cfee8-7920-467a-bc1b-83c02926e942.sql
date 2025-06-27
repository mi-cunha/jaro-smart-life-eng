
-- Add missing columns to subscribers table for better webhook support
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for better performance on webhook lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer_id ON public.subscribers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_session_id ON public.subscribers(stripe_session_id);
