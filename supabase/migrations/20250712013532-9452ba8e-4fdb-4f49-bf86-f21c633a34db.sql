-- Recriar políticas RLS para preferencias_usuario usando get_current_user_email()
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

-- Recriar políticas RLS para perfil_usuario usando get_current_user_email()
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