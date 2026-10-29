-- Exam Bridge v31 — subject personalisation, support link, payment mode
-- Paste into Supabase SQL Editor → Run. Safe to re-run (also merged into schema.sql).

-- ============================================================
-- 1) student_subjects — which subjects a student picked at sign-up
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, subject_id)
);

CREATE INDEX IF NOT EXISTS student_subjects_student_idx
  ON public.student_subjects (student_id);
CREATE INDEX IF NOT EXISTS student_subjects_subject_idx
  ON public.student_subjects (subject_id);

ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_subjects_select_own" ON public.student_subjects;
CREATE POLICY "student_subjects_select_own" ON public.student_subjects
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "student_subjects_insert_own" ON public.student_subjects;
CREATE POLICY "student_subjects_insert_own" ON public.student_subjects
  FOR INSERT WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "student_subjects_delete_own" ON public.student_subjects;
CREATE POLICY "student_subjects_delete_own" ON public.student_subjects
  FOR DELETE USING (student_id = auth.uid() OR public.is_admin());

-- Students may manage their own picks through the service-role client too.
DROP POLICY IF EXISTS "student_subjects_admin_all" ON public.student_subjects;
CREATE POLICY "student_subjects_admin_all" ON public.student_subjects
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 2) Replace existing picks when a student re-submits registration
--    (used by saveMySubjects server action)
-- ============================================================
CREATE OR REPLACE FUNCTION public.replace_student_subjects(
  p_student uuid,
  p_subjects uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_student IS DISTINCT FROM auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  DELETE FROM public.student_subjects WHERE student_id = p_student;

  INSERT INTO public.student_subjects (student_id, subject_id)
  SELECT p_student, s FROM unnest(coalesce(p_subjects, '{}'::uuid[])) AS s
  ON CONFLICT (student_id, subject_id) DO NOTHING;
END;
$$;

-- ============================================================
-- 3) App settings: Telegram support link + payment mode
--    payment_mode: 'manual' (bank transfer) | 'flutterwave'
-- ============================================================
INSERT INTO public.settings (key, value) VALUES
  ('telegram_support_url', ''),
  ('payment_mode', 'manual'),
  ('flutterwave_public_key', ''),
  ('flutterwave_secret_key', ''),
  ('flutterwave_webhook_secret', '')
ON CONFLICT (key) DO NOTHING;

-- settings rows are readable by any signed-in user, writable by admin only
-- (policies already exist in schema.sql; nothing to change).

-- ============================================================
-- 4) payments: allow Flutterwave references + auto approval
-- ============================================================
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'processing'));

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_method_check
  CHECK (method IN ('bank_transfer', 'flutterwave'));

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS flw_tx_id text,
  ADD COLUMN IF NOT EXISTS flw_status text,
  ADD COLUMN IF NOT EXISTS flw_ref text;

CREATE INDEX IF NOT EXISTS payments_flw_tx_idx ON public.payments (flw_tx_id);

-- ============================================================
-- 5) Convenience view: subject progress per student (My Subjects)
-- ============================================================
CREATE OR REPLACE VIEW public.student_subject_progress AS
SELECT
  ss.student_id,
  ss.subject_id,
  s.name AS subject_name,
  s.slug AS subject_slug,
  s.color,
  s.bg_color,
  count(t.id) AS topic_count,
  coalesce(round(avg(coalesce(p.percent, 0)))::int, 0) AS progress
FROM public.student_subjects ss
JOIN public.subjects s ON s.id = ss.subject_id
LEFT JOIN public.topics t ON t.subject_id = s.id AND t.is_published = true
LEFT JOIN public.progress p ON p.topic_id = t.id AND p.student_id = ss.student_id
GROUP BY ss.student_id, ss.subject_id, s.name, s.slug, s.color, s.bg_color;

-- ============================================================
-- 6) handle_new_user also records subject picks from signup metadata
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  sid uuid;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'student',
    'inactive'
  )
  ON CONFLICT (id) DO NOTHING;

  -- subject_ids is a json array of uuid strings captured at registration
  FOR sid IN
    SELECT (b)->>0 FROM jsonb_array_elements(
      coalesce(NEW.raw_user_meta_data->'subject_ids', '[]'::jsonb)
    ) b
  LOOP
    INSERT INTO public.student_subjects (student_id, subject_id)
    VALUES (NEW.id, sid)
    ON CONFLICT (student_id, subject_id) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 7) app_secrets — server-only secrets (service role, no public read)
--    RLS is enabled with NO select policy, so the anon/authenticated key
--    cannot read these rows at all. Only server code with the service role
--    key (lib/data/secrets.ts) does.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Deliberately no policies: deny everything to anon + authenticated roles.

-- done
