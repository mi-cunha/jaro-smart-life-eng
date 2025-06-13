
-- Primeiro inserir o usuário na tabela usuarios
INSERT INTO public.usuarios (id, nome, email)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Public User',
  'public@jarosmart.com'
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios 
  WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Criar tabela de hábitos
CREATE TABLE IF NOT EXISTS public.habitos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  meta_diaria INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de histórico de hábitos
CREATE TABLE IF NOT EXISTS public.historico_habitos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  habito_id UUID NOT NULL REFERENCES public.habitos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  concluido BOOLEAN DEFAULT false,
  quantidade INTEGER DEFAULT 1,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, habito_id, data)
);

-- Criar tabela de histórico de peso
CREATE TABLE IF NOT EXISTS public.historico_peso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  peso NUMERIC(5,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, data)
);

-- Adicionar colunas que faltam na tabela perfil_usuario
ALTER TABLE public.perfil_usuario 
ADD COLUMN IF NOT EXISTS peso_atual NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS meta_peso NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS notif_tomar_cha BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_marcar_habito BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_gerar_receitas BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_comprar_itens BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_atingir_meta BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS google_fit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS apple_health BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fitbit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dados_uso BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notificacoes_push BOOLEAN DEFAULT true;

-- Adicionar políticas RLS para as novas tabelas
ALTER TABLE public.habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_peso ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela habitos
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habitos;
CREATE POLICY "Users can view their own habits" 
  ON public.habitos 
  FOR SELECT 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can create their own habits" ON public.habitos;
CREATE POLICY "Users can create their own habits" 
  ON public.habitos 
  FOR INSERT 
  WITH CHECK (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can update their own habits" ON public.habitos;
CREATE POLICY "Users can update their own habits" 
  ON public.habitos 
  FOR UPDATE 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habitos;
CREATE POLICY "Users can delete their own habits" 
  ON public.habitos 
  FOR DELETE 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Políticas para tabela historico_habitos
DROP POLICY IF EXISTS "Users can view their own habit history" ON public.historico_habitos;
CREATE POLICY "Users can view their own habit history" 
  ON public.historico_habitos 
  FOR SELECT 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can create their own habit history" ON public.historico_habitos;
CREATE POLICY "Users can create their own habit history" 
  ON public.historico_habitos 
  FOR INSERT 
  WITH CHECK (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can update their own habit history" ON public.historico_habitos;
CREATE POLICY "Users can update their own habit history" 
  ON public.historico_habitos 
  FOR UPDATE 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can delete their own habit history" ON public.historico_habitos;
CREATE POLICY "Users can delete their own habit history" 
  ON public.historico_habitos 
  FOR DELETE 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Políticas para tabela historico_peso
DROP POLICY IF EXISTS "Users can view their own weight history" ON public.historico_peso;
CREATE POLICY "Users can view their own weight history" 
  ON public.historico_peso 
  FOR SELECT 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can create their own weight history" ON public.historico_peso;
CREATE POLICY "Users can create their own weight history" 
  ON public.historico_peso 
  FOR INSERT 
  WITH CHECK (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can update their own weight history" ON public.historico_peso;
CREATE POLICY "Users can update their own weight history" 
  ON public.historico_peso 
  FOR UPDATE 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

DROP POLICY IF EXISTS "Users can delete their own weight history" ON public.historico_peso;
CREATE POLICY "Users can delete their own weight history" 
  ON public.historico_peso 
  FOR DELETE 
  USING (usuario_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Inserir alguns hábitos padrão para o usuário público
INSERT INTO public.habitos (usuario_id, nome, descricao, meta_diaria) 
SELECT '00000000-0000-0000-0000-000000000000'::uuid, 'Drink Jaro Tea', 'Take the daily recommended dose of Jaro tea', 2
WHERE NOT EXISTS (SELECT 1 FROM public.habitos WHERE usuario_id = '00000000-0000-0000-0000-000000000000'::uuid AND nome = 'Drink Jaro Tea');

INSERT INTO public.habitos (usuario_id, nome, descricao, meta_diaria) 
SELECT '00000000-0000-0000-0000-000000000000'::uuid, 'Drink 8 glasses of water', 'Stay hydrated throughout the day', 8
WHERE NOT EXISTS (SELECT 1 FROM public.habitos WHERE usuario_id = '00000000-0000-0000-0000-000000000000'::uuid AND nome = 'Drink 8 glasses of water');

INSERT INTO public.habitos (usuario_id, nome, descricao, meta_diaria) 
SELECT '00000000-0000-0000-0000-000000000000'::uuid, '30min exercise', 'Physical activity for health', 1
WHERE NOT EXISTS (SELECT 1 FROM public.habitos WHERE usuario_id = '00000000-0000-0000-0000-000000000000'::uuid AND nome = '30min exercise');

INSERT INTO public.habitos (usuario_id, nome, descricao, meta_diaria) 
SELECT '00000000-0000-0000-0000-000000000000'::uuid, 'Meditate 10min', 'Mindfulness and mental health', 1
WHERE NOT EXISTS (SELECT 1 FROM public.habitos WHERE usuario_id = '00000000-0000-0000-0000-000000000000'::uuid AND nome = 'Meditate 10min');

-- Inserir perfil padrão para o usuário público (verificar se já existe primeiro)
INSERT INTO public.perfil_usuario (
  usuario_id, nome, email, peso_atual, meta_peso, 
  habitos_diarios, doses_cha, calorias_diarias,
  vegano, vegetariano, low_carb, sem_gluten
)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Public User',
  'public@jarosmart.com',
  78.0,
  70.0,
  4,
  2,
  1800,
  false,
  false,
  false,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.perfil_usuario 
  WHERE usuario_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Atualizar perfil existente se necessário
UPDATE public.perfil_usuario SET
  peso_atual = COALESCE(peso_atual, 78.0),
  meta_peso = COALESCE(meta_peso, 70.0)
WHERE usuario_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Inserir alguns registros de histórico de peso
INSERT INTO public.historico_peso (usuario_id, peso, data) VALUES
('00000000-0000-0000-0000-000000000000', 85.0, CURRENT_DATE - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000000', 83.5, CURRENT_DATE - INTERVAL '25 days'),
('00000000-0000-0000-0000-000000000000', 82.0, CURRENT_DATE - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000000', 80.5, CURRENT_DATE - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000000', 79.0, CURRENT_DATE - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000000', 78.0, CURRENT_DATE - INTERVAL '5 days')
ON CONFLICT (usuario_id, data) DO NOTHING;
