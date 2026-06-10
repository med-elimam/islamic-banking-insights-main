-- ==========================================
-- PREFLIGHT AUDIT: Run these queries in your Supabase SQL editor
-- to verify that all existing database rows conform to the strict
-- options allowed by the application. If they do not, update or
-- clean those records before running the ALTER TABLE statements.
-- ==========================================

-- SELECT 'gender' AS field, gender AS value, COUNT(*) FROM public.responses GROUP BY gender
-- UNION ALL
-- SELECT 'age' AS field, age AS value, COUNT(*) FROM public.responses GROUP BY age
-- UNION ALL
-- SELECT 'education' AS field, education AS value, COUNT(*) FROM public.responses GROUP BY education
-- UNION ALL
-- SELECT 'bank' AS field, bank AS value, COUNT(*) FROM public.responses GROUP BY bank
-- UNION ALL
-- SELECT 'position' AS field, position AS value, COUNT(*) FROM public.responses GROUP BY position
-- UNION ALL
-- SELECT 'experience' AS field, experience AS value, COUNT(*) FROM public.responses GROUP BY experience;

-- ==========================================
-- 1. Add CHECK constraints to responses
-- ==========================================

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_gender
  CHECK (gender IN ('ذكر', 'أنثى'));

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_age
  CHECK (age IN ('أقل من 30 سنة', 'من 30 إلى 40 سنة', 'من 41 إلى 50 سنة', 'أكثر من 50 سنة'));

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_education
  CHECK (education IN ('ثانوي', 'ليسانس / إجازة', 'ماستر', 'دكتوراه', 'تكوين مهني', 'أخرى'));

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_bank
  CHECK (bank IN ('BMCI', 'BCI', 'BNM', 'Société Générale Mauritanie', 'BPM', 'بنك آخر'));

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_position
  CHECK (position IN ('مدير', 'رئيس مصلحة', 'موظف عمليات مصرفية', 'موظف تمويل أو ائتمان', 'موظف إداري', 'موظف خدمة عملاء', 'أخرى'));

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_experience
  CHECK (experience IN ('أقل من 5 سنوات', 'من 5 إلى 10 سنوات', 'من 11 إلى 15 سنة', 'أكثر من 15 سنة'));

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_open_answer
  CHECK (open_answer IS NULL OR char_length(open_answer) <= 4000);

-- ==========================================
-- 2. Add CHECK constraints to answers
-- ==========================================

ALTER TABLE public.answers ADD CONSTRAINT chk_answers_question_number
  CHECK (question_number BETWEEN 1 AND 200);

ALTER TABLE public.answers ADD CONSTRAINT chk_answers_axis_name
  CHECK (char_length(axis_name) BETWEEN 1 AND 200);

ALTER TABLE public.answers ADD CONSTRAINT chk_answers_answer_text
  CHECK (char_length(answer_text) BETWEEN 1 AND 200);

-- ==========================================
-- 3. Add Foreign Key linking to survey_questions
-- ==========================================

ALTER TABLE public.answers
  ADD CONSTRAINT fk_answers_question_number
  FOREIGN KEY (question_number)
  REFERENCES public.survey_questions(number)
  ON UPDATE CASCADE;

-- ==========================================
-- 4. Add index for performance optimization
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_responses_created_at ON public.responses(created_at DESC);
