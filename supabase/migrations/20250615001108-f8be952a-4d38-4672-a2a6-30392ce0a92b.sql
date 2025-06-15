
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('discussion_reply', 'discussion_like', 'reply_like', 'mention', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE notifications;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when someone replies to a discussion
CREATE OR REPLACE FUNCTION public.notify_discussion_reply()
RETURNS TRIGGER AS $$
DECLARE
  discussion_owner_id UUID;
  discussion_title TEXT;
  replier_username TEXT;
BEGIN
  -- Get discussion owner and title
  SELECT user_id, title INTO discussion_owner_id, discussion_title
  FROM public.discussions 
  WHERE id = NEW.discussion_id;
  
  -- Get replier username
  SELECT COALESCE(username, 'Someone') INTO replier_username
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Don't notify if user is replying to their own discussion
  IF discussion_owner_id != NEW.user_id THEN
    PERFORM public.create_notification(
      discussion_owner_id,
      'discussion_reply',
      'New reply to your discussion',
      replier_username || ' replied to "' || discussion_title || '"',
      jsonb_build_object(
        'discussion_id', NEW.discussion_id,
        'reply_id', NEW.id,
        'replier_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for discussion replies
CREATE TRIGGER notify_discussion_reply_trigger
  AFTER INSERT ON public.discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_discussion_reply();

-- Trigger to create notification when someone likes a discussion
CREATE OR REPLACE FUNCTION public.notify_discussion_like()
RETURNS TRIGGER AS $$
DECLARE
  discussion_owner_id UUID;
  discussion_title TEXT;
  liker_username TEXT;
BEGIN
  -- Get discussion owner and title
  SELECT user_id, title INTO discussion_owner_id, discussion_title
  FROM public.discussions 
  WHERE id = NEW.discussion_id;
  
  -- Get liker username
  SELECT COALESCE(username, 'Someone') INTO liker_username
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Don't notify if user is liking their own discussion
  IF discussion_owner_id != NEW.user_id THEN
    PERFORM public.create_notification(
      discussion_owner_id,
      'discussion_like',
      'Someone liked your discussion',
      liker_username || ' liked your discussion "' || discussion_title || '"',
      jsonb_build_object(
        'discussion_id', NEW.discussion_id,
        'liker_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for discussion likes
CREATE TRIGGER notify_discussion_like_trigger
  AFTER INSERT ON public.discussion_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_discussion_like();
