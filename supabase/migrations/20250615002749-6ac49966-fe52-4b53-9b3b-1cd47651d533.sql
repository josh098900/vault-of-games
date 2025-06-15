
-- Enhance the games table with additional fields for better game data
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS metacritic_score integer;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS steam_id text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS igdb_id text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS submission_status text DEFAULT 'approved' CHECK (submission_status IN ('approved', 'pending', 'rejected'));
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_genre ON public.games(genre);
CREATE INDEX IF NOT EXISTS idx_games_platform ON public.games(platform);
CREATE INDEX IF NOT EXISTS idx_games_release_year ON public.games(release_year);
CREATE INDEX IF NOT EXISTS idx_games_submission_status ON public.games(submission_status);
CREATE INDEX IF NOT EXISTS idx_games_tags ON public.games USING GIN(tags);

-- Create a table for game submission requests
CREATE TABLE IF NOT EXISTS public.game_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  genre text,
  platform text,
  release_year integer,
  developer text,
  publisher text,
  cover_image_url text,
  metacritic_score integer,
  steam_id text,
  igdb_id text,
  tags text[] DEFAULT '{}',
  screenshots text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on game submissions
ALTER TABLE public.game_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own game submissions" 
  ON public.game_submissions 
  FOR SELECT 
  USING (auth.uid() = submitted_by);

-- Users can create game submissions
CREATE POLICY "Users can create game submissions" 
  ON public.game_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own pending submissions
CREATE POLICY "Users can update their own pending submissions" 
  ON public.game_submissions 
  FOR UPDATE 
  USING (auth.uid() = submitted_by AND status = 'pending');

-- Create a function to handle game submission approval
CREATE OR REPLACE FUNCTION public.approve_game_submission(submission_id uuid, admin_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  submission_record RECORD;
  new_game_id uuid;
BEGIN
  -- Get the submission details
  SELECT * INTO submission_record
  FROM public.game_submissions
  WHERE id = submission_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
  
  -- Insert the new game
  INSERT INTO public.games (
    title, description, genre, platform, release_year, developer, publisher,
    cover_image_url, metacritic_score, steam_id, igdb_id, tags, screenshots, videos,
    submission_status, submitted_by
  ) VALUES (
    submission_record.title, submission_record.description, submission_record.genre,
    submission_record.platform, submission_record.release_year, submission_record.developer,
    submission_record.publisher, submission_record.cover_image_url, submission_record.metacritic_score,
    submission_record.steam_id, submission_record.igdb_id, submission_record.tags,
    submission_record.screenshots, submission_record.videos, 'approved', submission_record.submitted_by
  ) RETURNING id INTO new_game_id;
  
  -- Update the submission status
  UPDATE public.game_submissions
  SET status = 'approved', reviewed_at = now(), reviewed_by = admin_user_id
  WHERE id = submission_id;
  
  -- Create notification for the submitter
  PERFORM public.create_notification(
    submission_record.submitted_by,
    'game_approved',
    'Game submission approved!',
    'Your game "' || submission_record.title || '" has been approved and added to GameVault.',
    jsonb_build_object('game_id', new_game_id, 'submission_id', submission_id)
  );
  
  RETURN new_game_id;
END;
$$;

-- Create a function to reject game submission
CREATE OR REPLACE FUNCTION public.reject_game_submission(submission_id uuid, admin_user_id uuid, rejection_reason text DEFAULT '')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  submission_record RECORD;
BEGIN
  -- Get the submission details
  SELECT * INTO submission_record
  FROM public.game_submissions
  WHERE id = submission_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
  
  -- Update the submission status
  UPDATE public.game_submissions
  SET status = 'rejected', reviewed_at = now(), reviewed_by = admin_user_id, admin_notes = rejection_reason
  WHERE id = submission_id;
  
  -- Create notification for the submitter
  PERFORM public.create_notification(
    submission_record.submitted_by,
    'game_rejected',
    'Game submission rejected',
    'Your game submission "' || submission_record.title || '" was not approved. ' || 
    CASE WHEN rejection_reason != '' THEN 'Reason: ' || rejection_reason ELSE '' END,
    jsonb_build_object('submission_id', submission_id, 'reason', rejection_reason)
  );
END;
$$;
