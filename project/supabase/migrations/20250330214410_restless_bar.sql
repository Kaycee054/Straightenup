/*
  # Fix get_users function

  1. Changes
    - Remove variable declaration
    - Use direct role check from JWT
    - Add proper error message
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_users;

-- Create function with fixed role check
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
BEGIN
  -- Check if user has admin role with proper error message
  IF (auth.jwt() ->> 'role')::text != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Return users with explicit table alias and qualified column names
  RETURN QUERY
  SELECT 
    u.id::uuid,
    u.email::text,
    u.created_at::timestamptz,
    u.raw_app_meta_data::jsonb
  FROM auth.users u;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users TO authenticated;