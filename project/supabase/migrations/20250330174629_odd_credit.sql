/*
  # Add test admin user

  1. Changes
    - Creates a test admin user with email/password authentication
    - Sets up admin role and permissions
    - Creates corresponding profile record

  Note: In production, never include user credentials in migrations.
  This is only for development/testing purposes.
*/

-- Enable email/password auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Create test admin user if it doesn't exist
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert the user and get their ID
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) 
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@straighten-up.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@straighten-up.com'
  )
  RETURNING id INTO new_user_id;

  -- If we got a new user ID, create their profile
  IF new_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name)
    VALUES (new_user_id, 'Admin User');
  END IF;
END
$$;