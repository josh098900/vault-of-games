
-- Add view count tracking functionality
CREATE OR REPLACE FUNCTION increment_discussion_views(discussion_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.discussions 
  SET views_count = COALESCE(views_count, 0) + 1,
      last_activity_at = now()
  WHERE id = discussion_uuid;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for discussions table
ALTER TABLE public.discussions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.discussions;

-- Enable realtime for discussion_replies table
ALTER TABLE public.discussion_replies REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.discussion_replies;

-- Enable realtime for discussion_likes table
ALTER TABLE public.discussion_likes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.discussion_likes;
