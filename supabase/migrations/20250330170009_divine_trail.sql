/*
  # Fix products table migration
  
  1. Changes
    - Add existence checks for policies to prevent errors
    - Keep all other functionality the same
  
  2. Security
    - Maintain RLS policies for public read access
    - Maintain admin write access policy
*/

-- Check if policies exist and drop them if they do
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'Allow public read access'
  ) THEN
    DROP POLICY "Allow public read access" ON products;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'Allow admin write access'
  ) THEN
    DROP POLICY "Allow admin write access" ON products;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Allow public read access"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');