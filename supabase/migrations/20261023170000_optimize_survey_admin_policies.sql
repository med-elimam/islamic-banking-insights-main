DROP POLICY IF EXISTS "Authenticated can read active survey options" ON public.survey_options;
DROP POLICY IF EXISTS "Admins can read survey options" ON public.survey_options;
DROP POLICY IF EXISTS "Authenticated can read allowed survey options" ON public.survey_options;
CREATE POLICY "Authenticated can read allowed survey options"
  ON public.survey_options FOR SELECT TO authenticated
  USING (active = true OR (SELECT private.is_admin()));

DROP POLICY IF EXISTS "Authenticated can read active survey axes" ON public.survey_axes;
DROP POLICY IF EXISTS "Admins can read survey axes" ON public.survey_axes;
DROP POLICY IF EXISTS "Authenticated can read allowed survey axes" ON public.survey_axes;
CREATE POLICY "Authenticated can read allowed survey axes"
  ON public.survey_axes FOR SELECT TO authenticated
  USING (active = true OR (SELECT private.is_admin()));

CREATE INDEX IF NOT EXISTS survey_questions_axis_id_idx
  ON public.survey_questions(axis_id);
