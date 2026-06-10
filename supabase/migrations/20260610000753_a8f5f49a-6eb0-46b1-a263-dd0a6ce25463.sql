GRANT SELECT ON public.survey_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.survey_questions TO authenticated;
GRANT ALL ON public.survey_questions TO service_role;