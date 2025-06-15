
-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.perfil_usuario;

-- Ativa Row Level Security (caso não esteja ativa)
ALTER TABLE public.perfil_usuario ENABLE ROW LEVEL SECURITY;

-- Permite SELECT apenas do próprio usuário autenticado
CREATE POLICY "Users can view their own profile" 
  ON public.perfil_usuario 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

-- Permite INSERT apenas do próprio usuário autenticado
CREATE POLICY "Users can create their own profile" 
  ON public.perfil_usuario 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

-- Permite UPDATE apenas do próprio usuário autenticado
CREATE POLICY "Users can update their own profile" 
  ON public.perfil_usuario 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

-- Permite DELETE apenas do próprio usuário autenticado
CREATE POLICY "Users can delete their own profile" 
  ON public.perfil_usuario 
  FOR DELETE 
  USING (auth.uid() = usuario_id);
