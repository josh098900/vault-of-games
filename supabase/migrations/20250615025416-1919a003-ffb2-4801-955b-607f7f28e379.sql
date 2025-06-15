
-- Create table for tracking user activities
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activities from people they follow
CREATE POLICY "Users can view activities from followed users" 
  ON public.user_activities 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_follows 
      WHERE follower_id = auth.uid() AND following_id = user_activities.user_id
    )
  );

-- Policy: Users can create their own activities
CREATE POLICY "Users can create their own activities" 
  ON public.user_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to create activity when user completes a game
CREATE OR REPLACE FUNCTION public.create_game_completion_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  game_title TEXT;
BEGIN
  -- Only create activity when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get game title
    SELECT title INTO game_title FROM public.games WHERE id = NEW.game_id;
    
    -- Create activity
    INSERT INTO public.user_activities (
      user_id,
      activity_type,
      title,
      description,
      data
    ) VALUES (
      NEW.user_id,
      'game_completed',
      'Completed a game',
      'Completed ' || COALESCE(game_title, 'Unknown Game'),
      jsonb_build_object(
        'game_id', NEW.game_id,
        'game_title', game_title,
        'user_game_id', NEW.id,
        'rating', NEW.user_rating,
        'hours_played', NEW.hours_played
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to create activity when user writes a review
CREATE OR REPLACE FUNCTION public.create_review_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  game_title TEXT;
BEGIN
  -- Get game title
  SELECT title INTO game_title FROM public.games WHERE id = NEW.game_id;
  
  -- Create activity
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    title,
    description,
    data
  ) VALUES (
    NEW.user_id,
    'review_posted',
    'Posted a review',
    'Reviewed ' || COALESCE(game_title, 'Unknown Game'),
    jsonb_build_object(
      'game_id', NEW.game_id,
      'game_title', game_title,
      'review_id', NEW.id,
      'rating', NEW.rating,
      'review_title', NEW.title
    )
  );
  
  RETURN NEW;
END;
$$;

-- Function to create activity when user follows someone
CREATE OR REPLACE FUNCTION public.create_follow_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  followed_username TEXT;
  followed_display_name TEXT;
BEGIN
  -- Get followed user's info
  SELECT username, display_name INTO followed_username, followed_display_name
  FROM public.profiles WHERE id = NEW.following_id;
  
  -- Create activity
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    title,
    description,
    data
  ) VALUES (
    NEW.follower_id,
    'user_followed',
    'Started following someone',
    'Started following ' || COALESCE(followed_display_name, followed_username, 'Unknown User'),
    jsonb_build_object(
      'followed_user_id', NEW.following_id,
      'followed_username', followed_username,
      'followed_display_name', followed_display_name
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_user_game_status_change
  AFTER UPDATE ON public.user_games
  FOR EACH ROW
  EXECUTE FUNCTION public.create_game_completion_activity();

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.create_review_activity();

CREATE TRIGGER on_user_follow_created
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_activity();

-- Add indexes for better performance
CREATE INDEX idx_user_activities_user_id_created_at ON public.user_activities(user_id, created_at DESC);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
