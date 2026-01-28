-- Add policy to allow volunteers to register for events
CREATE POLICY "Volunteers can register for events" 
ON public.task_assignments 
FOR INSERT 
WITH CHECK (auth.uid() = volunteer_id);