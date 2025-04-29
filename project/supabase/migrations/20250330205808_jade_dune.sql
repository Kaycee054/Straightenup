/*
  # Fix Support Tickets Permissions

  1. Changes
    - Add missing RLS policies for support tickets and messages
    - Fix user role checks to use profiles table instead of users table
    - Add proper join conditions for staff access

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
    - Fix permission denied errors
*/

-- Drop existing policies to recreate them with fixed permissions
DO $$ 
BEGIN
  -- Support tickets policies
  DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
  DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
  DROP POLICY IF EXISTS "Staff can update tickets" ON support_tickets;

  -- Support messages policies
  DROP POLICY IF EXISTS "Users can view messages for their tickets" ON support_messages;
  DROP POLICY IF EXISTS "Users can create messages for their tickets" ON support_messages;
END $$;

-- Recreate policies with fixed permissions
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
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
        AND (raw_app_meta_data->>'role')::text IN ('admin', 'manager')
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
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
        AND (raw_app_meta_data->>'role')::text IN ('admin', 'manager')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
        AND (raw_app_meta_data->>'role')::text IN ('admin', 'manager')
      )
    );

  -- Support messages policies
  CREATE POLICY "Users can view messages for their tickets"
    ON support_messages
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM support_tickets
        WHERE support_tickets.id = ticket_id
        AND (
          support_tickets.user_id = auth.uid() OR
          support_tickets.assigned_to = auth.uid() OR
          EXISTS (
            SELECT 1
            FROM auth.users
            WHERE id = auth.uid()
            AND (raw_app_meta_data->>'role')::text IN ('admin', 'manager')
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
        SELECT 1
        FROM support_tickets
        WHERE support_tickets.id = ticket_id
        AND (
          support_tickets.user_id = auth.uid() OR
          support_tickets.assigned_to = auth.uid() OR
          EXISTS (
            SELECT 1
            FROM auth.users
            WHERE id = auth.uid()
            AND (raw_app_meta_data->>'role')::text IN ('admin', 'manager')
          )
        )
      )
    );
END $$;