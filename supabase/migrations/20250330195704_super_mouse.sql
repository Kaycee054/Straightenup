-- Fix get_users function to handle type casting correctly
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  raw_app_meta_data jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get the current user's role using explicit type casting
  SELECT (raw_app_meta_data->>'role')::text INTO current_user_role 
  FROM auth.users 
  WHERE id = auth.uid();

  -- Check if user has admin role
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Return users with explicit type casting
  RETURN QUERY
  SELECT 
    au.id::uuid,
    au.email::text,
    au.created_at::timestamptz,
    au.raw_app_meta_data::jsonb
  FROM auth.users au;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users TO authenticated;