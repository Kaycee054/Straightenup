/*
  # Fix get_users function access denied error

  1. Changes
    - Fix role check to properly access JWT claims
    - Add proper error handling
    - Add explicit type casting
    - Add proper schema qualification

  2. Security
    - Maintain security definer setting
    - Keep admin-only access check
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
DECLARE
  current_role text;
BEGIN
  -- Get the current user's role from JWT claims
  SELECT COALESCE(auth.jwt() ->> 'role', 'user') INTO current_role;

  -- Check if user has admin role with proper error handling
  IF current_role IS NULL OR current_role != 'admin' THEN
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