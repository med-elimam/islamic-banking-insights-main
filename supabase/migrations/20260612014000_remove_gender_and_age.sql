-- ==========================================
-- Migration: Remove Gender and Age Columns from responses
-- ==========================================

-- 1. Drop the check constraints on gender and age if they exist
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_gender;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_age;

-- 2. Recreate the INSERT policy for responses without checking gender and age
DROP POLICY IF EXISTS "Anyone can submit responses" ON public.responses;

CREATE POLICY "Anyone can submit responses"
  ON public.responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(education) BETWEEN 1 AND 64
    AND length(bank) BETWEEN 1 AND 128
    AND length(position) BETWEEN 1 AND 128
    AND length(experience) BETWEEN 1 AND 64
    AND (open_answer IS NULL OR length(open_answer) <= 4000)
  );

-- 3. Drop gender and age columns from responses table
ALTER TABLE public.responses DROP COLUMN IF EXISTS gender;
ALTER TABLE public.responses DROP COLUMN IF EXISTS age;
