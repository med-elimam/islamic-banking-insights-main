-- Migration: Add delete policy for admins on responses
CREATE POLICY "Admins can delete responses"
  ON public.responses FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
