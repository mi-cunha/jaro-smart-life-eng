-- Limpar todas as políticas existentes para preferencias_usuario
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Read own preferencias_usuario" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Update own preferencias_usuario" ON public.preferencias_usuario;

-- Limpar todas as políticas existentes para perfil_usuario  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Read own perfil_usuario" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Update own perfil_usuario" ON public.perfil_usuario;