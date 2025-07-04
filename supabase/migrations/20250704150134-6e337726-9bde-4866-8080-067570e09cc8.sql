-- Add missing fields to perfil_usuario table for health plan calculations
ALTER TABLE public.perfil_usuario 
ADD COLUMN IF NOT EXISTS agua_diaria_ml INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS copos_diarios INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_routine TEXT DEFAULT NULL;

-- Add comment to explain the new fields
COMMENT ON COLUMN public.perfil_usuario.agua_diaria_ml IS 'Daily water intake in milliliters calculated based on body weight';
COMMENT ON COLUMN public.perfil_usuario.copos_diarios IS 'Daily water intake in cups (300ml each)';
COMMENT ON COLUMN public.perfil_usuario.daily_routine IS 'Activity level: sedentary, light, moderate, intense';