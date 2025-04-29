/*
  # Fix get_users function

  1. Changes
    - Fix ambiguous column reference by properly qualifying raw_app_meta_data
    - Improve role check by using explicit table reference
    - Add table alias for clarity

  2. Security
    - Maintains security definer setting
    - Keeps admin-only access check
    - Preserves existing permissions
*/

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
  SELECT (auth.users.raw_app_meta_data->>'role')::text INTO current_user_role 
  FROM auth.users 
  WHERE auth.users.id = auth.uid();

  -- Check if user has admin role
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Return users with explicit table references
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_app_meta_data
  FROM auth.users au;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users TO authenticated;