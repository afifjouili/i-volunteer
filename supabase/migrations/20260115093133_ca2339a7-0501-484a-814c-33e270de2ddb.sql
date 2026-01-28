-- Fix privilege escalation vulnerability: Always assign 'volunteer' role on signup
-- Admin role must be manually assigned by existing admins

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.email
  );
  
  -- SECURITY FIX: Always assign volunteer role - never trust client metadata
  -- Admin role must be assigned manually by existing admins
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'volunteer'::app_role);
  
  RETURN NEW;
END;
$function$;