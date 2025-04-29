/*
  # Add Product Reviews

  1. New Tables
    - `product_reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `user_id` (uuid, foreign key to profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `is_visible` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `product_reviews` table
    - Add policies for:
      - Public can read visible reviews
      - Authenticated users can create reviews for products they own
      - Admin can manage all reviews
*/

-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Public can read visible reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_reviews' 
    AND policyname = 'Public can read visible reviews'
  ) THEN
    CREATE POLICY "Public can read visible reviews"
      ON product_reviews
      FOR SELECT
      TO public
      USING (is_visible = true);
  END IF;

  -- Authenticated users can create reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_reviews' 
    AND policyname = 'Users can create reviews'
  ) THEN
    CREATE POLICY "Users can create reviews"
      ON product_reviews
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_reviews' 
    AND policyname = 'Users can update own reviews'
  ) THEN
    CREATE POLICY "Users can update own reviews"
      ON product_reviews
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Admin can manage all reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_reviews' 
    AND policyname = 'Admin can manage all reviews'
  ) THEN
    CREATE POLICY "Admin can manage all reviews"
      ON product_reviews
      TO authenticated
      USING (auth.jwt() ->> 'role' = 'admin')
      WITH CHECK (auth.jwt() ->> 'role' = 'admin');
  END IF;
END
$$;

-- Create updated_at trigger
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
  
  CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END
$$;