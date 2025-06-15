
-- Create a table for direct messages between users
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for message conversations (to group messages between users)
CREATE TABLE public.message_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users NOT NULL,
  user2_id UUID REFERENCES auth.users NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Add Row Level Security (RLS) to ensure users can only see their own messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for direct_messages
CREATE POLICY "Users can view their own messages" 
  ON public.direct_messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
  ON public.direct_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
  ON public.direct_messages 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- RLS policies for message_conversations
CREATE POLICY "Users can view their conversations" 
  ON public.message_conversations 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" 
  ON public.message_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations" 
  ON public.message_conversations 
  FOR UPDATE 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to update conversation last message time
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  conversation_id UUID;
BEGIN
  -- Find or create conversation
  SELECT id INTO conversation_id
  FROM public.message_conversations
  WHERE (user1_id = NEW.sender_id AND user2_id = NEW.recipient_id)
     OR (user1_id = NEW.recipient_id AND user2_id = NEW.sender_id);
  
  IF conversation_id IS NULL THEN
    -- Create new conversation with consistent ordering (smaller UUID first)
    INSERT INTO public.message_conversations (user1_id, user2_id, last_message_at)
    VALUES (
      LEAST(NEW.sender_id, NEW.recipient_id),
      GREATEST(NEW.sender_id, NEW.recipient_id),
      NEW.created_at
    );
  ELSE
    -- Update existing conversation
    UPDATE public.message_conversations
    SET last_message_at = NEW.created_at
    WHERE id = conversation_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger to update conversation when a new message is sent
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();
