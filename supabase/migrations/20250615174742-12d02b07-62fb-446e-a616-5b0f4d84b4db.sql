
-- Update the notifications table check constraint to include session_invite
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('discussion_reply', 'discussion_like', 'reply_like', 'mention', 'system', 'game_approved', 'game_rejected', 'session_invite'));
