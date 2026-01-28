-- Update the handle_new_user function to support admin role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  requested_role text;
BEGIN
  -- Get role from metadata (only 'admin' is allowed to be set this way)
  requested_role := NEW.raw_user_meta_data->>'role';
  
  -- Insert profile with appropriate status
  INSERT INTO public.profiles (user_id, full_name, email, phone, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    CASE WHEN requested_role = 'admin' THEN 'approved' ELSE 'pending' END
  );
  
  -- Insert user role - admin if code validated on frontend, otherwise volunteer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN requested_role = 'admin' THEN 'admin'::app_role ELSE 'volunteer'::app_role END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;