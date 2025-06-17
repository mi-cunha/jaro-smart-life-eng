
-- Fix RLS policies to work correctly with existing schema
-- Remove all existing problematic policies and recreate them properly

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.perfil_usuario;

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.preferencias_usuario;

DROP POLICY IF EXISTS "Users can view their own recipes" ON public.receitas;
DROP POLICY IF EXISTS "Users can create their own recipes" ON public.receitas;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.receitas;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.receitas;

DROP POLICY IF EXISTS "Users can view their own shopping list" ON public.lista_compras;
DROP POLICY IF EXISTS "Users can create their own shopping list items" ON public.lista_compras;
DROP POLICY IF EXISTS "Users can update their own shopping list items" ON public.lista_compras;
DROP POLICY IF EXISTS "Users can delete their own shopping list items" ON public.lista_compras;

DROP POLICY IF EXISTS "Users can view their own ingredients" ON public.ingredientes;
DROP POLICY IF EXISTS "Users can create their own ingredients" ON public.ingredientes;
DROP POLICY IF EXISTS "Users can update their own ingredients" ON public.ingredientes;
DROP POLICY IF EXISTS "Users can delete their own ingredients" ON public.ingredientes;

DROP POLICY IF EXISTS "Users can view their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can create their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habitos;

DROP POLICY IF EXISTS "Users can view their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can create their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can update their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can delete their own habit history" ON public.historico_habitos;

DROP POLICY IF EXISTS "Users can view their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can create their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can update their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can delete their own weight history" ON public.historico_peso;

-- Create a helper function to get current user email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER STABLE
AS $$
  SELECT COALESCE(
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    ''
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.perfil_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferencias_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies using the helper function

-- perfil_usuario policies
CREATE POLICY "Users can view their own profile" 
  ON public.perfil_usuario 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own profile" 
  ON public.perfil_usuario 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own profile" 
  ON public.perfil_usuario 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own profile" 
  ON public.perfil_usuario 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- preferencias_usuario policies
CREATE POLICY "Users can view their own preferences" 
  ON public.preferencias_usuario 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own preferences" 
  ON public.preferencias_usuario 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own preferences" 
  ON public.preferencias_usuario 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own preferences" 
  ON public.preferencias_usuario 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- receitas policies
CREATE POLICY "Users can view their own recipes" 
  ON public.receitas 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own recipes" 
  ON public.receitas 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own recipes" 
  ON public.receitas 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own recipes" 
  ON public.receitas 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- lista_compras policies
CREATE POLICY "Users can view their own shopping list" 
  ON public.lista_compras 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own shopping list items" 
  ON public.lista_compras 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own shopping list items" 
  ON public.lista_compras 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own shopping list items" 
  ON public.lista_compras 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- ingredientes policies
CREATE POLICY "Users can view their own ingredients" 
  ON public.ingredientes 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own ingredients" 
  ON public.ingredientes 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own ingredients" 
  ON public.ingredientes 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own ingredients" 
  ON public.ingredientes 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- habitos policies
CREATE POLICY "Users can view their own habits" 
  ON public.habitos 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own habits" 
  ON public.habitos 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own habits" 
  ON public.habitos 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own habits" 
  ON public.habitos 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- historico_habitos policies
CREATE POLICY "Users can view their own habit history" 
  ON public.historico_habitos 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own habit history" 
  ON public.historico_habitos 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own habit history" 
  ON public.historico_habitos 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own habit history" 
  ON public.historico_habitos 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- historico_peso policies
CREATE POLICY "Users can view their own weight history" 
  ON public.historico_peso 
  FOR SELECT 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can create their own weight history" 
  ON public.historico_peso 
  FOR INSERT 
  WITH CHECK (user_email = public.get_current_user_email());

CREATE POLICY "Users can update their own weight history" 
  ON public.historico_peso 
  FOR UPDATE 
  USING (user_email = public.get_current_user_email());

CREATE POLICY "Users can delete their own weight history" 
  ON public.historico_peso 
  FOR DELETE 
  USING (user_email = public.get_current_user_email());

-- usuarios policies (for basic user management)
CREATE POLICY "Users can view their own user record" 
  ON public.usuarios 
  FOR SELECT 
  USING (email = public.get_current_user_email());

CREATE POLICY "Users can create their own user record" 
  ON public.usuarios 
  FOR INSERT 
  WITH CHECK (email = public.get_current_user_email());

CREATE POLICY "Users can update their own user record" 
  ON public.usuarios 
  FOR UPDATE 
  USING (email = public.get_current_user_email());

-- subscribers policies (users can view their own subscription)
CREATE POLICY "Users can view their own subscription" 
  ON public.subscribers 
  FOR SELECT 
  USING (email = public.get_current_user_email());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
