/*
  # Support System Schema

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `status` (text)
      - `assigned_to` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `unread_count` (integer)
    
    - `support_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references support_tickets)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `is_staff_reply` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `viewed_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for user and staff access
*/

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  CONSTRAINT valid_status CHECK (status IN ('open', 'assigned', 'closed'))
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_staff_reply boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  viewed_at timestamptz
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Safely create policies with existence checks
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
  DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
  DROP POLICY IF EXISTS "Staff can update tickets" ON support_tickets;
  DROP POLICY IF EXISTS "Users can view messages for their tickets" ON support_messages;
  DROP POLICY IF EXISTS "Users can create messages for their tickets" ON support_messages;

  -- Support tickets policies
  CREATE POLICY "Users can view own tickets"
    ON support_tickets
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = user_id OR
      auth.uid() = assigned_to OR
      (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
    );

  CREATE POLICY "Users can create tickets"
    ON support_tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Staff can update tickets"
    ON support_tickets
    FOR UPDATE
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text IN ('admin', 'manager'))
    WITH CHECK ((auth.jwt() ->> 'role')::text IN ('admin', 'manager'));

  -- Support messages policies
  CREATE POLICY "Users can view messages for their tickets"
    ON support_messages
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM support_tickets st
        WHERE st.id = ticket_id
        AND (
          st.user_id = auth.uid() OR
          st.assigned_to = auth.uid() OR
          (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
        )
      )
    );

  CREATE POLICY "Users can create messages for their tickets"
    ON support_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM support_tickets st
        WHERE st.id = ticket_id
        AND (
          st.user_id = auth.uid() OR
          st.assigned_to = auth.uid() OR
          (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
        )
      )
    );
END $$;

-- Create updated_at triggers
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
  DROP TRIGGER IF EXISTS update_support_messages_updated_at ON support_messages;
  
  CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_support_messages_updated_at
    BEFORE UPDATE ON support_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Function to update unread count
CREATE OR REPLACE FUNCTION update_ticket_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update unread count for the ticket
  UPDATE support_tickets
  SET unread_count = (
    SELECT COUNT(*)
    FROM support_messages
    WHERE ticket_id = NEW.ticket_id
    AND viewed_at IS NULL
    AND is_staff_reply = false
  )
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for unread count
DROP TRIGGER IF EXISTS update_ticket_unread_count_trigger ON support_messages;

CREATE TRIGGER update_ticket_unread_count_trigger
AFTER INSERT OR UPDATE OF viewed_at ON support_messages
FOR EACH ROW
EXECUTE FUNCTION update_ticket_unread_count();

-- Enable realtime for support chat
DO $$
BEGIN
  -- Check if tables are already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'support_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'support_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
  END IF;
END $$;