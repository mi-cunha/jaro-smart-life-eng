
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.perfil_usuario;

DROP POLICY IF EXISTS "Users can view their own weight history" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can create their own weight entries" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can update their own weight entries" ON public.historico_peso;
DROP POLICY IF EXISTS "Users can delete their own weight entries" ON public.historico_peso;

-- Enable RLS on both tables
ALTER TABLE public.perfil_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_peso ENABLE ROW LEVEL SECURITY;

-- Create policies for perfil_usuario table
CREATE POLICY "Users can view their own profile" 
  ON public.perfil_usuario 
  FOR SELECT 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own profile" 
  ON public.perfil_usuario 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own profile" 
  ON public.perfil_usuario 
  FOR UPDATE 
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own profile" 
  ON public.perfil_usuario 
  FOR DELETE 
  USING (auth.uid() = usuario_id);

-- Create policies for historico_peso table
CREATE POLICY "Users can view their own weight history" 
  ON public.historico_peso 
  FOR SELECT 
  USING (auth.uid() = usuario_id::uuid);

CREATE POLICY "Users can create their own weight entries" 
  ON public.historico_peso 
  FOR INSERT 
  WITH CHECK (auth.uid() = usuario_id::uuid);

CREATE POLICY "Users can update their own weight entries" 
  ON public.historico_peso 
  FOR UPDATE 
  USING (auth.uid() = usuario_id::uuid);

CREATE POLICY "Users can delete their own weight entries" 
  ON public.historico_peso 
  FOR DELETE 
  USING (auth.uid() = usuario_id::uuid);
