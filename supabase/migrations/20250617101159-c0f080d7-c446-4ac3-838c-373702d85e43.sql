
-- Corrigir políticas RLS para usar user_email em vez de usuario_id inexistente

-- Remover políticas antigas da tabela habitos
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can create their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habitos;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habitos;

-- Criar novas políticas para habitos usando user_email
CREATE POLICY "Users can view their own habits" 
  ON public.habitos 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own habits" 
  ON public.habitos 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own habits" 
  ON public.habitos 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own habits" 
  ON public.habitos 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Remover políticas antigas da tabela historico_habitos
DROP POLICY IF EXISTS "Users can view their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can create their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can update their own habit history" ON public.historico_habitos;
DROP POLICY IF EXISTS "Users can delete their own habit history" ON public.historico_habitos;

-- Criar novas políticas para historico_habitos usando user_email
CREATE POLICY "Users can view their own habit history" 
  ON public.historico_habitos 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own habit history" 
  ON public.historico_habitos 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own habit history" 
  ON public.historico_habitos 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own habit history" 
  ON public.historico_habitos 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Remover políticas antigas da tabela historico_peso
DROP POLICY IF EXISTS "Users can view their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can create their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can update their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can delete their own weight history" ON public.historico_peso;

-- Criar novas políticas para historico_peso usando user_email
CREATE POLICY "Users can view their own weight history" 
  ON public.historico_peso 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own weight history" 
  ON public.historico_peso 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own weight history" 
  ON public.historico_peso 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own weight history" 
  ON public.historico_peso 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Remover políticas antigas das outras tabelas e recriar usando user_email
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.receitas;
DROP POLICY IF EXISTS "Users can create their own recipes" ON public.receitas;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.receitas;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.receitas;

CREATE POLICY "Users can view their own recipes" 
  ON public.receitas 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own recipes" 
  ON public.receitas 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own recipes" 
  ON public.receitas 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own recipes" 
  ON public.receitas 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Políticas para lista_compras
DROP POLICY IF EXISTS "Users can view their own shopping list" ON public.lista_compras;
DROP POLICY IF EXISTS "Users can create their own shopping list items" ON public.lista_compras;
DROP POLICY IF EXISTS "Users can update their own shopping list items" ON public.lista_compras;
DROP POLICY IF EXISTS "Users can delete their own shopping list items" ON public.lista_compras;

CREATE POLICY "Users can view their own shopping list" 
  ON public.lista_compras 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own shopping list items" 
  ON public.lista_compras 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own shopping list items" 
  ON public.lista_compras 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own shopping list items" 
  ON public.lista_compras 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Políticas para ingredientes
DROP POLICY IF EXISTS "Users can view their own ingredients" ON public.ingredientes;
DROP POLICY IF EXISTS "Users can create their own ingredients" ON public.ingredientes;
DROP POLICY IF EXISTS "Users can update their own ingredients" ON public.ingredientes;
DROP POLICY IF EXISTS "Users can delete their own ingredients" ON public.ingredientes;

CREATE POLICY "Users can view their own ingredients" 
  ON public.ingredientes 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own ingredients" 
  ON public.ingredientes 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own ingredients" 
  ON public.ingredientes 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own ingredients" 
  ON public.ingredientes 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
