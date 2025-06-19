
-- Add missing columns to the receitas table
ALTER TABLE public.receitas 
ADD COLUMN IF NOT EXISTS proteinas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS carboidratos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gorduras INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorita BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refeicao TEXT DEFAULT 'Almoço';

-- Update the existing recipes to have default values
UPDATE public.receitas 
SET proteinas = 15, carboidratos = 25, gorduras = 8, favorita = false, refeicao = 'Almoço'
WHERE proteinas IS NULL OR carboidratos IS NULL OR gorduras IS NULL OR favorita IS NULL OR refeicao IS NULL;
