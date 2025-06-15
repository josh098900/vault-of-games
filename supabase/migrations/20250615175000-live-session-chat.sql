
-- Create table for live session chat messages
CREATE TABLE public.live_session_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_gaming_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_live_session_messages_session_id ON public.live_session_messages(session_id);
CREATE INDEX idx_live_session_messages_created_at ON public.live_session_messages(created_at);

-- Enable RLS
ALTER TABLE public.live_session_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live session messages
CREATE POLICY "Users can view messages from sessions they can access"
  ON public.live_session_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_gaming_sessions 
      WHERE id = session_id 
      AND (is_public = true OR user_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM public.gaming_session_participants
             WHERE session_id = live_gaming_sessions.id 
             AND user_id = auth.uid() 
             AND left_at IS NULL
           ))
    )
  );

CREATE POLICY "Users can send messages to sessions they participate in"
  ON public.live_session_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.live_gaming_sessions 
      WHERE id = session_id 
      AND status = 'active'
      AND (user_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM public.gaming_session_participants
             WHERE session_id = live_gaming_sessions.id 
             AND user_id = auth.uid() 
             AND left_at IS NULL
           ))
    )
  );

-- Enable realtime
ALTER TABLE public.live_session_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_session_messages;
