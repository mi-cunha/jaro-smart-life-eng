-- Corrigir políticas RLS para preferencias_usuario
-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Read own preferencias_usuario" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Update own preferencias_usuario" ON public.preferencias_usuario;

-- Criar políticas RLS corretas usando get_current_user_email()
CREATE POLICY "Users can view their own preferences" 
ON public.preferencias_usuario 
FOR SELECT 
USING (user_email = get_current_user_email());

CREATE POLICY "Users can insert their own preferences" 
ON public.preferencias_usuario 
FOR INSERT 
WITH CHECK (user_email = get_current_user_email());

CREATE POLICY "Users can update their own preferences" 
ON public.preferencias_usuario 
FOR UPDATE 
USING (user_email = get_current_user_email());

CREATE POLICY "Users can delete their own preferences" 
ON public.preferencias_usuario 
FOR DELETE 
USING (user_email = get_current_user_email());

-- Corrigir políticas RLS para perfil_usuario
-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Read own perfil_usuario" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Update own perfil_usuario" ON public.perfil_usuario;

-- Criar políticas RLS corretas usando get_current_user_email()
CREATE POLICY "Users can view their own profile" 
ON public.perfil_usuario 
FOR SELECT 
USING (user_email = get_current_user_email());

CREATE POLICY "Users can insert their own profile" 
ON public.perfil_usuario 
FOR INSERT 
WITH CHECK (user_email = get_current_user_email());

CREATE POLICY "Users can update their own profile" 
ON public.perfil_usuario 
FOR UPDATE 
USING (user_email = get_current_user_email());

CREATE POLICY "Users can delete their own profile" 
ON public.perfil_usuario 
FOR DELETE 
USING (user_email = get_current_user_email());