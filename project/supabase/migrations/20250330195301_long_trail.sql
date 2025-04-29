/*
  # Support Chat Implementation

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `status` (text)
      - `assigned_to` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `support_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references support_tickets)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `is_staff_reply` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for user and staff access
    - Add function to assign tickets to staff

  3. Changes
    - Add support ticket management
    - Add real-time messaging capabilities
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
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Support tickets policies
  CREATE POLICY "Users can view own tickets"
    ON support_tickets
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = user_id OR
      auth.uid() = assigned_to OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_app_meta_data->>'role' IN ('admin', 'manager')
      )
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

  -- Support messages policies
  CREATE POLICY "Users can view messages for their tickets"
    ON support_messages
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM support_tickets
        WHERE support_tickets.id = ticket_id
        AND (
          support_tickets.user_id = auth.uid() OR
          support_tickets.assigned_to = auth.uid() OR
          EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_app_meta_data->>'role' IN ('admin', 'manager')
          )
        )
      )
    );

  CREATE POLICY "Users can create messages for their tickets"
    ON support_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM support_tickets
        WHERE support_tickets.id = ticket_id
        AND (
          support_tickets.user_id = auth.uid() OR
          support_tickets.assigned_to = auth.uid() OR
          EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_app_meta_data->>'role' IN ('admin', 'manager')
          )
        )
      )
    );
END
$$;

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
END
$$;

-- Function to assign ticket to staff
CREATE OR REPLACE FUNCTION assign_support_ticket(
  ticket_id uuid,
  staff_id uuid
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  staff_role text;
BEGIN
  -- Check if staff member has correct role
  SELECT raw_app_meta_data->>'role' INTO staff_role
  FROM auth.users
  WHERE id = staff_id;

  IF staff_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Only admin or manager can be assigned to tickets';
  END IF;

  -- Update ticket
  UPDATE support_tickets
  SET 
    assigned_to = staff_id,
    status = 'assigned',
    updated_at = now()
  WHERE id = ticket_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION assign_support_ticket TO authenticated;

-- Enable realtime for support chat
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;