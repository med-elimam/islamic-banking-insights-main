-- Align the online questionnaire with the approved Arabic, French and English paper editions.

ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS age text;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS islamic_training text;

ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_gender;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_age;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_bank;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_position;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS chk_responses_islamic_training;

ALTER TABLE public.responses ADD CONSTRAINT chk_responses_gender
  CHECK (gender IS NULL OR gender IN ('ذكر', 'أنثى'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_age
  CHECK (age IS NULL OR age IN ('أقل من 30 سنة', 'من 30 إلى 40 سنة', 'من 41 إلى 50 سنة'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_bank
  CHECK (bank IN ('BMCI', 'BCI', 'BNM', 'SGM', 'Société Générale Mauritanie', 'BPM', 'بنك آخر'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_position
  CHECK (position IN ('مدير', 'رئيس مصلحة', 'موظف عمليات مصرفية', 'موظف تمويل أو ائتمان', 'موظف إداري', 'موظف خدمة أخرى', 'موظف خدمة عملاء', 'أخرى'));
ALTER TABLE public.responses ADD CONSTRAINT chk_responses_islamic_training
  CHECK (islamic_training IS NULL OR islamic_training IN ('نعم', 'لا'));

DROP POLICY IF EXISTS "Anyone can submit responses" ON public.responses;
CREATE POLICY "Anyone can submit responses"
  ON public.responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    gender IN ('ذكر', 'أنثى')
    AND age IN ('أقل من 30 سنة', 'من 30 إلى 40 سنة', 'من 41 إلى 50 سنة')
    AND length(education) BETWEEN 1 AND 64
    AND bank IN ('BMCI', 'BCI', 'BNM', 'SGM', 'BPM', 'بنك آخر')
    AND position IN ('مدير', 'رئيس مصلحة', 'موظف عمليات مصرفية', 'موظف تمويل أو ائتمان', 'موظف إداري', 'موظف خدمة أخرى')
    AND length(experience) BETWEEN 1 AND 64
    AND islamic_training IN ('نعم', 'لا')
    AND (open_answer IS NULL OR length(open_answer) <= 4000)
    AND language IN ('ar', 'fr', 'en')
  );

INSERT INTO public.survey_questions (number, axis_id, axis_name, text, order_index, active)
VALUES
  (1, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يشهد السوق المصرفي الموريتاني اهتماماً متزايداً بالخدمات المالية الإسلامية.', 1, true),
  (2, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'كان التحول من بنوك تقليدية إلى بنوك إسلامية استجابة لتزايد الطلب على الخدمات المالية الإسلامية.', 2, true),
  (3, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يسهم التحول إلى الصيرفة الإسلامية في تعزيز ثقة المتعاملين مع البنك.', 3, true),
  (4, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يتزايد توجه بعض البنوك التقليدية إلى إدراج منتجات مصرفية إسلامية إضافية ضمن خدماتها.', 4, true),
  (5, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يشكل نجاح التجارب المصرفية الإسلامية في المنطقة العربية حافزاً للبنوك الموريتانية.', 5, true),
  (6, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يسهم التحول إلى الصيرفة الإسلامية في تحسين القدرة التنافسية للبنوك المتحولة.', 6, true),
  (7, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يساعد التحول في استقطاب شريحة من العملاء الذين يرغبون في تجنب التعاملات المصرفية التقليدية.', 7, true),
  (8, 'axis1', 'المحور الأول: دوافع تحول البنوك التقليدية إلى مصارف إسلامية', 'يمثل إنشاء نوافذ إسلامية داخل البنوك التقليدية مرحلة انتقالية عملية نحو التحول إلى بنوك إسلامية.', 8, true),
  (9, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تواجه البنوك نقصاً في عدد الكفاءات البشرية المتخصصة في الصيرفة الإسلامية.', 1, true),
  (10, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يتطلب التحول تعديلات جوهرية في الهياكل التنظيمية للبنوك.', 2, true),
  (11, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تمثل تكاليف التحول أحد أهم العوائق أمام البنوك التقليدية.', 3, true),
  (12, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تحتاج الأنظمة المعلوماتية المستخدمة حالياً إلى تطوير بما يتلاءم مع متطلبات الصيرفة الإسلامية.', 4, true),
  (13, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'ما تزال بعض الجوانب القانونية والتنظيمية بحاجة إلى مزيد من التكييف لدعم التحول.', 5, true),
  (14, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يواجه العاملون في البنوك تحديات تتعلق باستيعاب صيغ التمويل الإسلامي وآليات تطبيقها.', 6, true),
  (15, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تتم عمليات التحول في ظل هيئات رقابة شرعية متخصصة.', 7, true),
  (16, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تمثل محدودية الخبرة العملية في مجال التحول المصرفي تحدياً للبنوك.', 8, true),
  (17, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تؤدي المخاوف المرتبطة بالمخاطر التشغيلية إلى إبطاء عملية التحول.', 9, true),
  (18, 'axis2', 'المحور الثاني: تحديات تحول البنوك التقليدية إلى الصيرفة الإسلامية', 'برامج التدريب والتأهيل متاحة وميسرة للعاملين.', 10, true),
  (19, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يؤدي التحول إلى توسيع قاعدة المتعاملين مع البنك ويزيد من حجم ودائعه.', 1, true),
  (20, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يساعد التحول على تقديم منتجات مالية أكثر تنوعاً.', 2, true),
  (21, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يسهم التحول في دعم تمويل الأنشطة الاقتصادية والاستثمارية.', 3, true),
  (22, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يعزز التحول قدرة البنك على الاستجابة لاحتياجات السوق المحلية.', 4, true),
  (23, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يسهم التحول في تحسين الصورة المؤسسية للبنك.', 5, true),
  (24, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يمكن أن ينعكس التحول إيجاباً على الأداء المالي للبنك على المدى الطويل.', 6, true),
  (25, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يساعد التحول على زيادة فرص الابتكار في المنتجات المصرفية.', 7, true),
  (26, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'تبدو آفاق الصيرفة الإسلامية واعدة في موريتانيا إذا توافرت الشروط التنظيمية والبشرية اللازمة.', 8, true),
  (27, 'axis3', 'المحور الثالث: النتائج المتوقعة لتحول البنوك التقليدية إلى الصيرفة الإسلامية', 'يسهم التحول في زيادة نضج الصناعة المالية الإسلامية في البلاد.', 9, true)
ON CONFLICT (number) DO UPDATE SET
  axis_id = EXCLUDED.axis_id,
  axis_name = EXCLUDED.axis_name,
  text = EXCLUDED.text,
  order_index = EXCLUDED.order_index,
  active = EXCLUDED.active,
  updated_at = now();

UPDATE public.survey_questions SET active = false, updated_at = now() WHERE number > 27;

DROP POLICY IF EXISTS "Anyone can submit answers" ON public.answers;
CREATE POLICY "Anyone can submit answers"
  ON public.answers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    answer_value BETWEEN 1 AND 3
    AND question_number BETWEEN 1 AND 27
    AND length(axis_name) BETWEEN 1 AND 200
    AND length(answer_text) BETWEEN 1 AND 200
  );

-- Prevent duplicate answers for the same question within one response.
CREATE UNIQUE INDEX IF NOT EXISTS idx_answers_response_question_unique
  ON public.answers(response_id, question_number);

-- Keep authorization helpers out of the exposed public schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'::public.app_role
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

-- Replace permissive/legacy policies with least-privilege policies.
DROP POLICY IF EXISTS "Allow public select responses" ON public.responses;
DROP POLICY IF EXISTS "Allow public insert responses" ON public.responses;
DROP POLICY IF EXISTS "Anyone can submit responses" ON public.responses;
DROP POLICY IF EXISTS "Admins can read responses" ON public.responses;
DROP POLICY IF EXISTS "Admins can delete responses" ON public.responses;

CREATE POLICY "Admins can read responses"
  ON public.responses FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE POLICY "Admins can delete responses"
  ON public.responses FOR DELETE
  TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "Allow public select answers" ON public.answers;
DROP POLICY IF EXISTS "Allow public insert answers" ON public.answers;
DROP POLICY IF EXISTS "Anyone can submit answers" ON public.answers;
DROP POLICY IF EXISTS "Admins can read answers" ON public.answers;

CREATE POLICY "Admins can read answers"
  ON public.answers FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "Anyone can read active questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Public can read active questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Admins can update questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON public.survey_questions;

CREATE POLICY "Public can read active questions"
  ON public.survey_questions FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Authenticated users can read questions"
  ON public.survey_questions FOR SELECT
  TO authenticated
  USING (active = true OR (SELECT private.is_admin()));

CREATE POLICY "Admins can insert questions"
  ON public.survey_questions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "Admins can update questions"
  ON public.survey_questions FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "Admins can delete questions"
  ON public.survey_questions FOR DELETE
  TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
CREATE POLICY "Users can read their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Atomic and idempotent survey submission. The function owns the transaction:
-- either the response and all 27 answers are stored, or nothing is stored.
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
  IF p_gender IS NULL OR p_gender NOT IN ('ذكر', 'أنثى')
     OR p_age IS NULL OR p_age NOT IN ('أقل من 30 سنة', 'من 30 إلى 40 سنة', 'من 41 إلى 50 سنة')
     OR p_education IS NULL OR p_education NOT IN ('ثانوي', 'ليسانس / إجازة', 'ماستر', 'دكتوراه', 'تكوين مهني', 'أخرى')
     OR p_bank IS NULL OR p_bank NOT IN ('BMCI', 'BCI', 'BNM', 'SGM', 'BPM', 'بنك آخر')
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

-- Table privileges are intentionally narrower than the RLS policies. Public
-- submissions go only through the validated transactional RPC above.
REVOKE ALL ON public.responses, public.answers, public.survey_questions, public.user_roles
  FROM anon, authenticated;
GRANT SELECT, DELETE ON public.responses TO authenticated;
GRANT SELECT ON public.answers TO authenticated;
GRANT SELECT ON public.survey_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.survey_questions TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.responses, public.answers, public.survey_questions, public.user_roles
  TO service_role;

-- Remove the legacy exposed security-definer helper after all dependent
-- policies have been replaced by private.is_admin().
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
