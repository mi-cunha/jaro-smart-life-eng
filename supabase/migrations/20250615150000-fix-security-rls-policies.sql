
-- Fix RLS policies to use proper authentication instead of hardcoded user ID

-- Remove old policies that used hardcoded user ID
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

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.preferencias_usuario;

-- Enable RLS on all tables
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferencias_usuario ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies for receitas table
CREATE POLICY "Users can view their own recipes" 
  ON public.receitas 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own recipes" 
  ON public.receitas 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own recipes" 
  ON public.receitas 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own recipes" 
  ON public.receitas 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Create new RLS policies for lista_compras table
CREATE POLICY "Users can view their own shopping list" 
  ON public.lista_compras 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own shopping list items" 
  ON public.lista_compras 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own shopping list items" 
  ON public.lista_compras 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own shopping list items" 
  ON public.lista_compras 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Create new RLS policies for ingredientes table
CREATE POLICY "Users can view their own ingredients" 
  ON public.ingredientes 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own ingredients" 
  ON public.ingredientes 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own ingredients" 
  ON public.ingredientes 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own ingredients" 
  ON public.ingredientes 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Create new RLS policies for preferencias_usuario table
CREATE POLICY "Users can view their own preferences" 
  ON public.preferencias_usuario 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own preferences" 
  ON public.preferencias_usuario 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.preferencias_usuario 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own preferences" 
  ON public.preferencias_usuario 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Update existing RLS policies for habitos table to use auth.uid()
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can create their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habitos;

CREATE POLICY "Users can view their own habits" 
  ON public.habitos 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own habits" 
  ON public.habitos 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own habits" 
  ON public.habitos 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own habits" 
  ON public.habitos 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Update existing RLS policies for historico_habitos table to use auth.uid()
DROP POLICY IF EXISTS "Users can view their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can create their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can update their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can delete their own habit history" ON public.historico_habitos;

CREATE POLICY "Users can view their own habit history" 
  ON public.historico_habitos 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own habit history" 
  ON public.historico_habitos 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own habit history" 
  ON public.historico_habitos 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own habit history" 
  ON public.historico_habitos 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Update existing RLS policies for historico_peso table to use auth.uid()
DROP POLICY IF EXISTS "Users can view their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can create their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can update their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can delete their own weight history" ON public.historico_peso;

CREATE POLICY "Users can view their own weight history" 
  ON public.historico_peso 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own weight history" 
  ON public.historico_peso 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own weight history" 
  ON public.historico_peso 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own weight history" 
  ON public.historico_peso 
  FOR DELETE 
  USING (auth.uid() = usuario_id);
