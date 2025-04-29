-- Create forum categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Forum categories policies
  CREATE POLICY "Everyone can view categories"
    ON forum_categories
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Staff can manage categories"
    ON forum_categories
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    );

  -- Forum topics policies
  CREATE POLICY "Everyone can view topics"
    ON forum_topics
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Authenticated users can create topics"
    ON forum_topics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own topics"
    ON forum_topics
    FOR UPDATE
    TO authenticated
    USING (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    )
    WITH CHECK (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    );

  CREATE POLICY "Staff can delete topics"
    ON forum_topics
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    );

  -- Forum replies policies
  CREATE POLICY "Everyone can view replies"
    ON forum_replies
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Authenticated users can create replies"
    ON forum_replies
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = user_id AND
      NOT EXISTS (
        SELECT 1 FROM forum_topics
        WHERE id = topic_id AND is_locked = true
      )
    );

  CREATE POLICY "Users can update own replies"
    ON forum_replies
    FOR UPDATE
    TO authenticated
    USING (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    )
    WITH CHECK (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    );

  CREATE POLICY "Staff can delete replies"
    ON forum_replies
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
    );
END
$$;

-- Create updated_at triggers
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_forum_categories_updated_at ON forum_categories;
  DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON forum_topics;
  DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON forum_replies;
  
  CREATE TRIGGER update_forum_categories_updated_at
    BEFORE UPDATE ON forum_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_forum_topics_updated_at
    BEFORE UPDATE ON forum_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_forum_replies_updated_at
    BEFORE UPDATE ON forum_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END
$$;

-- Insert default categories
INSERT INTO forum_categories (name, description, order_index)
VALUES 
  ('General Discussion', 'General discussions about posture and health', 1),
  ('Product Support', 'Get help with your Straighten-Up device', 2),
  ('Tips & Tricks', 'Share and learn posture improvement tips', 3),
  ('Success Stories', 'Share your posture improvement journey', 4);

-- Enable realtime for forum
ALTER PUBLICATION supabase_realtime ADD TABLE forum_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;