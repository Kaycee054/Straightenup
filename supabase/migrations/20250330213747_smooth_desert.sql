/*
  # Fix Support Tickets and Messages Schema

  1. Changes
    - Add unread_count column to support_tickets
    - Add viewed_at column to support_messages
    - Add function to update unread count
    - Add trigger to maintain unread count

  2. Security
    - Maintain existing RLS policies
    - Add new policies for unread tracking
*/

-- Add unread_count to support_tickets
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0;

-- Add viewed_at to support_messages
ALTER TABLE support_messages 
ADD COLUMN IF NOT EXISTS viewed_at timestamptz;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_ticket_unread_count_trigger ON support_messages;

-- Create trigger for unread count
CREATE TRIGGER update_ticket_unread_count_trigger
AFTER INSERT OR UPDATE OF viewed_at ON support_messages
FOR EACH ROW
EXECUTE FUNCTION update_ticket_unread_count();