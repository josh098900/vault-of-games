
-- Check if notifications table has RLS policies for INSERT operations
-- If not, we need to add them

-- First, let's check what policies exist (this is just a comment for reference)
-- We need to allow authenticated users to insert notifications for other users

-- Allow authenticated users to insert notifications (for sending invites, etc.)
CREATE POLICY "Authenticated users can create notifications" 
  ON public.notifications 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Also ensure we have a policy for the notification creator/system to insert notifications
CREATE POLICY "System can create notifications for users" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
