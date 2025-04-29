/*
  # Add Forum Moderation Features

  1. Changes
    - Add moderation fields to forum tables
    - Add moderation-specific policies
    - Add functions for moderation actions

  2. Security
    - Enable RLS on all tables
    - Add policies for user and moderator access
*/

-- Add moderation fields to forum tables
ALTER TABLE forum_topics
ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS moderation_reason text;

ALTER TABLE forum_replies
ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS moderation_reason text;

-- Drop existing policies
DO $$ 
BEGIN
  -- Forum topics policies
  DROP POLICY IF EXISTS "Everyone can view topics" ON forum_topics;
  DROP POLICY IF EXISTS "Authenticated users can create topics" ON forum_topics;
  DROP POLICY IF EXISTS "Users can update own topics" ON forum_topics;
  DROP POLICY IF EXISTS "Staff can delete topics" ON forum_topics;

  -- Forum replies policies
  DROP POLICY IF EXISTS "Everyone can view replies" ON forum_replies;
  DROP POLICY IF EXISTS "Authenticated users can create replies" ON forum_replies;
  DROP POLICY IF EXISTS "Users can update own replies" ON forum_replies;
  DROP POLICY IF EXISTS "Staff can delete replies" ON forum_replies;
END $$;

-- Recreate policies with moderation support
DO $$ 
BEGIN
  -- Forum topics policies
  CREATE POLICY "Everyone can view topics"
    ON forum_topics
    FOR SELECT
    TO public
    USING (moderated_at IS NULL);

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
      (auth.uid() = user_id AND moderated_at IS NULL) OR
      (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
    )
    WITH CHECK (
      (auth.uid() = user_id AND moderated_at IS NULL) OR
      (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
    );

  CREATE POLICY "Staff can delete topics"
    ON forum_topics
    FOR DELETE
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text IN ('admin', 'manager'));

  -- Forum replies policies
  CREATE POLICY "Everyone can view replies"
    ON forum_replies
    FOR SELECT
    TO public
    USING (moderated_at IS NULL);

  CREATE POLICY "Authenticated users can create replies"
    ON forum_replies
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = user_id AND
      NOT EXISTS (
        SELECT 1 FROM forum_topics
        WHERE id = topic_id AND (is_locked = true OR moderated_at IS NOT NULL)
      )
    );

  CREATE POLICY "Users can update own replies"
    ON forum_replies
    FOR UPDATE
    TO authenticated
    USING (
      (auth.uid() = user_id AND moderated_at IS NULL) OR
      (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
    )
    WITH CHECK (
      (auth.uid() = user_id AND moderated_at IS NULL) OR
      (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
    );

  CREATE POLICY "Staff can delete replies"
    ON forum_replies
    FOR DELETE
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text IN ('admin', 'manager'));
END $$;

-- Function to moderate a topic
CREATE OR REPLACE FUNCTION moderate_topic(
  topic_id uuid,
  reason text
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user has moderator role
  IF NOT ((auth.jwt() ->> 'role')::text IN ('admin', 'manager')) THEN
    RAISE EXCEPTION 'Only moderators can moderate topics';
  END IF;

  -- Update topic
  UPDATE forum_topics
  SET 
    moderated_at = now(),
    moderated_by = auth.uid(),
    moderation_reason = reason
  WHERE id = topic_id;
END;
$$;

-- Function to moderate a reply
CREATE OR REPLACE FUNCTION moderate_reply(
  reply_id uuid,
  reason text
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user has moderator role
  IF NOT ((auth.jwt() ->> 'role')::text IN ('admin', 'manager')) THEN
    RAISE EXCEPTION 'Only moderators can moderate replies';
  END IF;

  -- Update reply
  UPDATE forum_replies
  SET 
    moderated_at = now(),
    moderated_by = auth.uid(),
    moderation_reason = reason
  WHERE id = reply_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION moderate_topic TO authenticated;
GRANT EXECUTE ON FUNCTION moderate_reply TO authenticated;