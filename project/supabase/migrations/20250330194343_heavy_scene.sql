-- Create function to get users from auth schema
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
  -- Get the current user's role using explicit table reference
  SELECT role INTO current_user_role 
  FROM auth.users 
  WHERE auth.users.id = auth.uid();

  -- Check if user has admin role
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_app_meta_data
  FROM auth.users u;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users TO authenticated;