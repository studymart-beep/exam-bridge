-- Exam Bridge schema — paste into Supabase SQL Editor and Run
-- See SETUP_GUIDE.md

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  phone text,
  role text CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  status text CHECK (status IN ('inactive', 'active', 'expired')) DEFAULT 'inactive',
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  letter text,
  color text DEFAULT '#1D4ED8',
  bg_color text DEFAULT '#DBEAFE',
  order_index int DEFAULT 0,
  is_active bool DEFAULT true,
  general_cbt_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text,
  description text,
  duration text DEFAULT '30 min',
  order_index int DEFAULT 0,
  is_published bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (subject_id, slug)
);

CREATE TABLE IF NOT EXISTS public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  type text CHECK (type IN ('video', 'pdf', 'image')) NOT NULL,
  title text NOT NULL,
  source text,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cbt_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  is_general bool DEFAULT false,
  duration_mins int NOT NULL DEFAULT 30,
  question_count int DEFAULT 0,
  pass_mark int DEFAULT 50,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.subjects
    ADD CONSTRAINT subjects_general_cbt_id_fkey
    FOREIGN KEY (general_cbt_id) REFERENCES public.cbt_exams(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.cbt_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  explanation text,
  image_url text,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cbt_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.cbt_questions(id) ON DELETE CASCADE,
  label text NOT NULL,
  option_text text NOT NULL,
  is_correct bool DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.cbt_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  score int,
  total int,
  passed bool,
  status text CHECK (status IN ('in_progress', 'submitted')) DEFAULT 'in_progress'
);

CREATE TABLE IF NOT EXISTS public.student_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.cbt_attempts(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.cbt_questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES public.cbt_options(id),
  is_correct bool,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.cbt_attempts(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  score int,
  total int,
  passed bool,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text DEFAULT 'bank_transfer',
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  receipt_url text,
  receipt_name text,
  verified_by uuid REFERENCES public.profiles(id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  completed bool DEFAULT false,
  percent int DEFAULT 0,
  last_viewed_at timestamptz DEFAULT now(),
  UNIQUE (student_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  read bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.settings (key, value) VALUES
  ('subscription_price', '5000'),
  ('bank_name', 'Guaranty Trust Bank'),
  ('account_name', 'Exam Bridge Ltd'),
  ('account_number', '0123456789'),
  ('app_name', 'Exam Bridge')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "subjects_select" ON public.subjects;
CREATE POLICY "subjects_select" ON public.subjects FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "subjects_admin_all" ON public.subjects;
CREATE POLICY "subjects_admin_all" ON public.subjects FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "topics_select" ON public.topics;
CREATE POLICY "topics_select" ON public.topics FOR SELECT USING (is_published = true OR public.is_admin());
DROP POLICY IF EXISTS "topics_admin_all" ON public.topics;
CREATE POLICY "topics_admin_all" ON public.topics FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "materials_select" ON public.materials;
CREATE POLICY "materials_select" ON public.materials FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "materials_admin_all" ON public.materials;
CREATE POLICY "materials_admin_all" ON public.materials FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "cbt_exams_select" ON public.cbt_exams;
CREATE POLICY "cbt_exams_select" ON public.cbt_exams FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "cbt_exams_admin_all" ON public.cbt_exams;
CREATE POLICY "cbt_exams_admin_all" ON public.cbt_exams FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "cbt_questions_select" ON public.cbt_questions;
CREATE POLICY "cbt_questions_select" ON public.cbt_questions FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "cbt_questions_admin_all" ON public.cbt_questions;
CREATE POLICY "cbt_questions_admin_all" ON public.cbt_questions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "cbt_options_select" ON public.cbt_options;
CREATE POLICY "cbt_options_select" ON public.cbt_options FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "cbt_options_admin_all" ON public.cbt_options;
CREATE POLICY "cbt_options_admin_all" ON public.cbt_options FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "attempts_select_own" ON public.cbt_attempts;
CREATE POLICY "attempts_select_own" ON public.cbt_attempts FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "attempts_insert_own" ON public.cbt_attempts;
CREATE POLICY "attempts_insert_own" ON public.cbt_attempts FOR INSERT WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "attempts_update_own" ON public.cbt_attempts;
CREATE POLICY "attempts_update_own" ON public.cbt_attempts FOR UPDATE USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "answers_select_own" ON public.student_answers;
CREATE POLICY "answers_select_own" ON public.student_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cbt_attempts a WHERE a.id = attempt_id AND (a.student_id = auth.uid() OR public.is_admin()))
);
DROP POLICY IF EXISTS "answers_insert_own" ON public.student_answers;
CREATE POLICY "answers_insert_own" ON public.student_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.cbt_attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid())
);

DROP POLICY IF EXISTS "results_select_own" ON public.results;
CREATE POLICY "results_select_own" ON public.results FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "results_insert_own" ON public.results;
CREATE POLICY "results_insert_own" ON public.results FOR INSERT WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "payments_admin_update" ON public.payments;
CREATE POLICY "payments_admin_update" ON public.payments FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "progress_all_own" ON public.progress;
CREATE POLICY "progress_all_own" ON public.progress FOR ALL USING (student_id = auth.uid() OR public.is_admin()) WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "activity_select_own" ON public.activity_logs;
CREATE POLICY "activity_select_own" ON public.activity_logs FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "activity_insert_own" ON public.activity_logs;
CREATE POLICY "activity_insert_own" ON public.activity_logs FOR INSERT WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (student_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert" ON public.notifications FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings_select" ON public.settings;
CREATE POLICY "settings_select" ON public.settings FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "settings_admin_all" ON public.settings;
CREATE POLICY "settings_admin_all" ON public.settings FOR ALL USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'student',
    'inactive'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage: create bucket "receipts" (private) in Dashboard → Storage
-- Then optional policies (uncomment after bucket exists):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false) ON CONFLICT DO NOTHING;

-- PROMOTE ADMIN (after creating user in Authentication → Users):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';


-- ==================== v31 additions ====================
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
