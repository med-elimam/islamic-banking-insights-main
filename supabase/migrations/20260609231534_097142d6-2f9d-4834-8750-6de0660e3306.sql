
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY "Anyone can submit responses" ON public.responses;
DROP POLICY "Anyone can submit answers" ON public.answers;

CREATE POLICY "Anyone can submit responses"
  ON public.responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(gender) BETWEEN 1 AND 32
    AND length(age) BETWEEN 1 AND 64
    AND length(education) BETWEEN 1 AND 64
    AND length(bank) BETWEEN 1 AND 128
    AND length(position) BETWEEN 1 AND 128
    AND length(experience) BETWEEN 1 AND 64
    AND (open_answer IS NULL OR length(open_answer) <= 4000)
  );

CREATE POLICY "Anyone can submit answers"
  ON public.answers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    answer_value BETWEEN 1 AND 5
    AND question_number BETWEEN 1 AND 200
    AND length(axis_name) BETWEEN 1 AND 200
    AND length(answer_text) BETWEEN 1 AND 200
  );
