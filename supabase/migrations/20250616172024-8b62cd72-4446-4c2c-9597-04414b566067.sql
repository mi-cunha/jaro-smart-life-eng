
-- Remover TODAS as políticas RLS existentes que dependem de usuario_id
DROP POLICY IF EXISTS "Usuário pode ver seu próprio perfil" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Usuário pode editar seu próprio perfil" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Usuário pode criar seu próprio perfil" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.perfil_usuario;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.perfil_usuario;

-- Remover políticas RLS da tabela preferencias_usuario
DROP POLICY IF EXISTS "Usuário pode ver suas preferências" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Usuário pode editar suas preferências" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Usuário pode criar suas preferências" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.preferencias_usuario;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.preferencias_usuario;

-- Garantir que usuarios.email seja unique
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_unique') THEN
        ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);
    END IF;
END $$;

-- Ajustar tabela perfil_usuario
ALTER TABLE public.perfil_usuario DROP COLUMN IF EXISTS usuario_id;
ALTER TABLE public.perfil_usuario ADD COLUMN IF NOT EXISTS user_email TEXT;
UPDATE public.perfil_usuario SET user_email = email WHERE user_email IS NULL AND email IS NOT NULL;
ALTER TABLE public.perfil_usuario ALTER COLUMN user_email SET NOT NULL;

-- Ajustar tabela preferencias_usuario
ALTER TABLE public.preferencias_usuario DROP COLUMN IF EXISTS usuario_id;
ALTER TABLE public.preferencias_usuario ALTER COLUMN user_email SET NOT NULL;

-- Adicionar constraints FK
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_perfil_usuario_email') THEN
        ALTER TABLE public.perfil_usuario ADD CONSTRAINT fk_perfil_usuario_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_preferencias_usuario_email') THEN
        ALTER TABLE public.preferencias_usuario ADD CONSTRAINT fk_preferencias_usuario_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_habitos_email') THEN
        ALTER TABLE public.habitos ADD CONSTRAINT fk_habitos_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_historico_habitos_email') THEN
        ALTER TABLE public.historico_habitos ADD CONSTRAINT fk_historico_habitos_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_historico_peso_email') THEN
        ALTER TABLE public.historico_peso ADD CONSTRAINT fk_historico_peso_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ingredientes_email') THEN
        ALTER TABLE public.ingredientes ADD CONSTRAINT fk_ingredientes_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_lista_compras_email') THEN
        ALTER TABLE public.lista_compras ADD CONSTRAINT fk_lista_compras_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_receitas_email') THEN
        ALTER TABLE public.receitas ADD CONSTRAINT fk_receitas_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subscribers_email') THEN
        ALTER TABLE public.subscribers ADD CONSTRAINT fk_subscribers_email 
          FOREIGN KEY (user_email) REFERENCES public.usuarios(email) ON DELETE CASCADE;
    END IF;
END $$;

-- Recriar políticas RLS usando user_email para perfil_usuario
CREATE POLICY "Users can view their own profile" 
  ON public.perfil_usuario 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own profile" 
  ON public.perfil_usuario 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile" 
  ON public.perfil_usuario 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own profile" 
  ON public.perfil_usuario 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Recriar políticas RLS usando user_email para preferencias_usuario
CREATE POLICY "Users can view their own preferences" 
  ON public.preferencias_usuario 
  FOR SELECT 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own preferences" 
  ON public.preferencias_usuario 
  FOR INSERT 
  WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own preferences" 
  ON public.preferencias_usuario 
  FOR UPDATE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own preferences" 
  ON public.preferencias_usuario 
  FOR DELETE 
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_perfil_usuario_user_email ON public.perfil_usuario(user_email);
CREATE INDEX IF NOT EXISTS idx_preferencias_usuario_user_email ON public.preferencias_usuario(user_email);
CREATE INDEX IF NOT EXISTS idx_habitos_user_email ON public.habitos(user_email);
CREATE INDEX IF NOT EXISTS idx_historico_habitos_user_email ON public.historico_habitos(user_email);
CREATE INDEX IF NOT EXISTS idx_historico_peso_user_email ON public.historico_peso(user_email);
CREATE INDEX IF NOT EXISTS idx_ingredientes_user_email ON public.ingredientes(user_email);
CREATE INDEX IF NOT EXISTS idx_lista_compras_user_email ON public.lista_compras(user_email);
CREATE INDEX IF NOT EXISTS idx_receitas_user_email ON public.receitas(user_email);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_email ON public.subscribers(user_email);
