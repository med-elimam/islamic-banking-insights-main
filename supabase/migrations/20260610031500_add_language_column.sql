-- ==========================================
-- Add language column to public.responses table
-- ==========================================

ALTER TABLE public.responses
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'ar';

-- Add check constraint to ensure only supported language values are stored
ALTER TABLE public.responses
  ADD CONSTRAINT chk_responses_language
  CHECK (language IN ('ar', 'fr', 'en'));
