
-- Create table for live gaming sessions
CREATE TABLE public.live_gaming_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('playing', 'streaming', 'looking_for_party')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  max_participants INTEGER DEFAULT NULL,
  current_participants INTEGER DEFAULT 1,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create table for session participants
CREATE TABLE public.gaming_session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_gaming_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('host', 'participant', 'spectator')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(session_id, user_id)
);

-- Create table for achievement notifications
CREATE TABLE public.achievement_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_title TEXT NOT NULL,
  achievement_description TEXT,
  achievement_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Enhance user_presence table with gaming data
ALTER TABLE public.user_presence 
ADD COLUMN IF NOT EXISTS current_game_id UUID,
ADD COLUMN IF NOT EXISTS game_status TEXT DEFAULT 'offline' CHECK (game_status IN ('offline', 'playing', 'paused', 'menu', 'lobby')),
ADD COLUMN IF NOT EXISTS mood TEXT,
ADD COLUMN IF NOT EXISTS custom_status TEXT,
ADD COLUMN IF NOT EXISTS progress_data JSONB DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_gaming_sessions_user_id ON public.live_gaming_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_gaming_sessions_game_id ON public.live_gaming_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_live_gaming_sessions_status ON public.live_gaming_sessions(status);
CREATE INDEX IF NOT EXISTS idx_gaming_session_participants_session_id ON public.gaming_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_user_id ON public.achievement_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_created_at ON public.achievement_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_current_game_id ON public.user_presence(current_game_id);

-- Enable RLS
ALTER TABLE public.live_gaming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_gaming_sessions
CREATE POLICY "Users can view public sessions and their own sessions"
  ON public.live_gaming_sessions
  FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own sessions"
  ON public.live_gaming_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
  ON public.live_gaming_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for gaming_session_participants
CREATE POLICY "Users can view participants of sessions they can see"
  ON public.gaming_session_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_gaming_sessions 
      WHERE id = session_id 
      AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can join sessions"
  ON public.gaming_session_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave sessions"
  ON public.gaming_session_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for achievement_notifications
CREATE POLICY "Users can view their own achievement notifications"
  ON public.achievement_notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own achievement notifications"
  ON public.achievement_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to update session participant count
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.live_gaming_sessions 
    SET current_participants = current_participants + 1,
        updated_at = now()
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.left_at IS NULL AND NEW.left_at IS NOT NULL THEN
    UPDATE public.live_gaming_sessions 
    SET current_participants = current_participants - 1,
        updated_at = now()
    WHERE id = NEW.session_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for participant count updates
CREATE TRIGGER update_session_participant_count_trigger
  AFTER INSERT OR UPDATE ON public.gaming_session_participants
  FOR EACH ROW EXECUTE FUNCTION update_session_participant_count();

-- Enable realtime for new tables
ALTER TABLE public.live_gaming_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.gaming_session_participants REPLICA IDENTITY FULL;
ALTER TABLE public.achievement_notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_gaming_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gaming_session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievement_notifications;
