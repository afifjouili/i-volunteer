-- Add event_type and poster_url columns to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'in_person';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS poster_url text;

-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event posters
CREATE POLICY "Public can view event posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-posters');

CREATE POLICY "Admins can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-posters' AND is_admin());

CREATE POLICY "Admins can update event posters"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-posters' AND is_admin());

CREATE POLICY "Admins can delete event posters"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-posters' AND is_admin());