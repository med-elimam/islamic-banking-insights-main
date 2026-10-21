-- Apply before deploying the updated bank options.
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_bank;
UPDATE public.responses SET bank = CASE bank
  WHEN 'BPM' THEN 'ABM'
  WHEN 'SGM' THEN 'BII'
  WHEN 'Société Générale Mauritanie' THEN 'BII'
  ELSE bank END
WHERE bank IN ('BPM', 'SGM', 'Société Générale Mauritanie');
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_bank
  CHECK (bank IN ('BMCI', 'BCI', 'BNM', 'BII', 'ABM', 'بنك آخر'));

-- Keep existing table privileges and RLS policies unchanged; submissions use the RPC.

CREATE OR REPLACE FUNCTION public.submit_survey_response(
  p_response_id uuid,
  p_gender text,
  p_age text,
  p_education text,
  p_bank text,
  p_position text,
  p_experience text,
  p_islamic_training text,
  p_open_answer text,
  p_language text,
  p_answers jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_answer_count integer;
  v_distinct_count integer;
  v_invalid_count integer;
  v_inserted_count integer;
BEGIN
  -- Normalize submissions from browser tabs opened before the rollout.
  p_bank := CASE p_bank
    WHEN 'SGM' THEN 'BII'
    WHEN 'Société Générale Mauritanie' THEN 'BII'
    WHEN 'BPM' THEN 'ABM'
    ELSE p_bank
  END;

  IF p_gender IS NULL OR p_gender NOT IN ('ذكر', 'أنثى')
     OR p_age IS NULL OR p_age NOT IN ('أقل من 30 سنة', 'من 30 إلى 40 سنة', 'من 41 إلى 50 سنة')
     OR p_education IS NULL OR p_education NOT IN ('ثانوي', 'ليسانس / إجازة', 'ماستر', 'دكتوراه', 'تكوين مهني', 'أخرى')
     OR p_bank IS NULL OR p_bank NOT IN ('BMCI', 'BCI', 'BNM', 'BII', 'ABM', 'بنك آخر')
     OR p_position IS NULL OR p_position NOT IN ('مدير', 'رئيس مصلحة', 'موظف عمليات مصرفية', 'موظف تمويل أو ائتمان', 'موظف إداري', 'موظف خدمة أخرى')
     OR p_experience IS NULL OR p_experience NOT IN ('أقل من 5 سنوات', 'من 5 إلى 10 سنوات', 'من 11 إلى 15 سنة', 'أكثر من 15 سنة')
     OR p_islamic_training IS NULL OR p_islamic_training NOT IN ('نعم', 'لا')
     OR p_language IS NULL OR p_language NOT IN ('ar', 'fr', 'en')
     OR (p_open_answer IS NOT NULL AND char_length(p_open_answer) > 4000)
  THEN
    RAISE EXCEPTION 'Invalid survey demographics' USING ERRCODE = '22023';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'array' OR jsonb_array_length(p_answers) <> 27 THEN
    RAISE EXCEPTION 'Exactly 27 answers are required' USING ERRCODE = '22023';
  END IF;

  SELECT count(*), count(DISTINCT a.question_number),
         count(*) FILTER (
           WHERE a.question_number NOT BETWEEN 1 AND 27
              OR a.answer_value NOT BETWEEN 1 AND 3
         )
  INTO v_answer_count, v_distinct_count, v_invalid_count
  FROM jsonb_to_recordset(p_answers) AS a(question_number integer, answer_value integer);

  IF v_answer_count <> 27 OR v_distinct_count <> 27 OR v_invalid_count <> 0 THEN
    RAISE EXCEPTION 'Answers must contain each question from 1 to 27 exactly once' USING ERRCODE = '22023';
  END IF;

  -- Safe retry after a lost network response: the client reuses the same UUID.
  IF EXISTS (SELECT 1 FROM public.responses WHERE id = p_response_id) THEN
    RETURN p_response_id;
  END IF;

  INSERT INTO public.responses (
    id, gender, age, education, bank, position, experience,
    islamic_training, open_answer, language
  ) VALUES (
    p_response_id, p_gender, p_age, p_education, p_bank, p_position,
    p_experience, p_islamic_training, NULLIF(btrim(p_open_answer), ''), p_language
  );

  INSERT INTO public.answers (
    response_id, question_number, axis_name, answer_text, answer_value
  )
  SELECT
    p_response_id,
    q.number,
    q.axis_name,
    CASE a.answer_value WHEN 3 THEN 'أوافق' WHEN 2 THEN 'محايد' ELSE 'لا أوافق' END,
    a.answer_value
  FROM jsonb_to_recordset(p_answers) AS a(question_number integer, answer_value integer)
  JOIN public.survey_questions AS q
    ON q.number = a.question_number
   AND q.active = true;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  IF v_inserted_count <> 27 THEN
    RAISE EXCEPTION 'The active questionnaire is not aligned with questions 1 to 27' USING ERRCODE = '22023';
  END IF;

  RETURN p_response_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_survey_response(
  uuid, text, text, text, text, text, text, text, text, text, jsonb
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_survey_response(
  uuid, text, text, text, text, text, text, text, text, text, jsonb
) TO anon, authenticated, service_role;

