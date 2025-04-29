/*
  # Fix get_users function ambiguous column reference

  1. Changes
    - Fix ambiguous column reference by properly qualifying raw_app_meta_data
    - Use explicit table alias for clarity
    - Add proper type casting

  2. Security
    - Maintain security definer setting
    - Keep admin-only access check
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_users;

-- Create function with fixed column references
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
  -- Check if user has admin role
  IF (auth.jwt() ->> 'role')::text != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Return users with explicit table alias and qualified column names
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