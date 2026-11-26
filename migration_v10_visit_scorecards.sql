-- Migration v10: Campus Scorecard
-- A student's own notes and ratings from a campus visit. Works without login
-- (stored on the device); rows land here once the student signs in so the
-- scorecard follows them across devices.

CREATE TABLE IF NOT EXISTS public.visit_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
  college_name TEXT NOT NULL CHECK (char_length(college_name) BETWEEN 1 AND 160),
  visited_on DATE,
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Keep a single scorecard from growing without bound.
  CONSTRAINT visit_scorecards_payload_size
    CHECK (pg_column_size(ratings) + pg_column_size(checks) + pg_column_size(notes) < 16384)
);

CREATE INDEX IF NOT EXISTS visit_scorecards_user_id_idx ON public.visit_scorecards (user_id);
CREATE INDEX IF NOT EXISTS visit_scorecards_tour_id_idx ON public.visit_scorecards (tour_id);

ALTER TABLE public.visit_scorecards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own scorecards" ON public.visit_scorecards;
CREATE POLICY "Users can view their own scorecards"
  ON public.visit_scorecards FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Users can insert their own scorecards" ON public.visit_scorecards;
CREATE POLICY "Users can insert their own scorecards"
  ON public.visit_scorecards FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own scorecards" ON public.visit_scorecards;
CREATE POLICY "Users can update their own scorecards"
  ON public.visit_scorecards FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own scorecards" ON public.visit_scorecards;
CREATE POLICY "Users can delete their own scorecards"
  ON public.visit_scorecards FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE ALL ON public.visit_scorecards FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visit_scorecards TO authenticated;
