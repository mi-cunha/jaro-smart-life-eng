
-- Primeiro, remover todas as políticas RLS que dependem da coluna email
DROP POLICY IF EXISTS "user can select their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Allow user to read their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscribers;

-- Remove a constraint única da coluna email
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_email_key;

-- Remove a coluna email
ALTER TABLE public.subscribers DROP COLUMN IF EXISTS email;

-- Adiciona constraint única na coluna user_email
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_email_key UNIQUE (user_email);

-- Recria as políticas RLS usando user_email ao invés de email
CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own subscription" ON public.subscribers
  FOR UPDATE USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own subscription" ON public.subscribers
  FOR INSERT WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own subscription" ON public.subscribers
  FOR DELETE USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
