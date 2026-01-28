-- Change default status to 'pending' for new profiles
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';

-- Update the handle_new_user function to set status as 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile with pending status
  INSERT INTO public.profiles (user_id, full_name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.email,
    'pending'
  );
  
  -- SECURITY FIX: Always assign volunteer role - never trust client metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'volunteer'::app_role);
  
  RETURN NEW;
END;
$function$;