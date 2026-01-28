
-- Add extended columns to profiles table for comprehensive volunteer info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_student boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_affiliated boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS affiliation_details text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS governorate text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line1 text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line2 text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_secondary text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_contact text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS other_skills text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_days text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_hours text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS iwatch_experience boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS iwatch_events text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS iwatch_years text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS iwatch_role text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS other_volunteering boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS other_org_details text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_community_member boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_questions text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create volunteer_languages table for language skills
CREATE TABLE IF NOT EXISTS public.volunteer_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language text NOT NULL,
  level text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.volunteer_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own languages" ON public.volunteer_languages
FOR SELECT USING (volunteer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own languages" ON public.volunteer_languages
FOR ALL USING (volunteer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all languages" ON public.volunteer_languages
FOR SELECT USING (is_admin());

-- Create trainings table
CREATE TABLE IF NOT EXISTS public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  duration_hours integer DEFAULT 2,
  location text,
  trainer text,
  max_participants integer DEFAULT 30,
  status text DEFAULT 'scheduled',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view trainings" ON public.trainings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage trainings" ON public.trainings
FOR ALL USING (is_admin());

-- Create training_participants table
CREATE TABLE IF NOT EXISTS public.training_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'registered',
  attended boolean DEFAULT false,
  completion_date timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(training_id, volunteer_id)
);

ALTER TABLE public.training_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training participation" ON public.training_participants
FOR SELECT USING (volunteer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage training participants" ON public.training_participants
FOR ALL USING (is_admin());

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  issued_date date NOT NULL,
  certificate_type text NOT NULL,
  training_id uuid REFERENCES public.trainings(id) ON DELETE SET NULL,
  file_url text,
  issued_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON public.certificates
FOR SELECT USING (volunteer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage certificates" ON public.certificates
FOR ALL USING (is_admin());

-- Create messages table for volunteer-admin communication
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  parent_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages
FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR (recipient_id IS NULL AND is_admin()));

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can manage all messages" ON public.messages
FOR ALL USING (is_admin());

-- Create attestation_requests table
CREATE TABLE IF NOT EXISTS public.attestation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  details text,
  status text DEFAULT 'pending',
  training_id uuid REFERENCES public.trainings(id) ON DELETE SET NULL,
  processed_by uuid,
  processed_at timestamptz,
  response_notes text,
  file_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.attestation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.attestation_requests
FOR SELECT USING (volunteer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create requests" ON public.attestation_requests
FOR INSERT WITH CHECK (volunteer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all requests" ON public.attestation_requests
FOR ALL USING (is_admin());

-- Add category/type to tasks for events
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category text DEFAULT 'task';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Create trigger for trainings updated_at
CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON public.trainings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
