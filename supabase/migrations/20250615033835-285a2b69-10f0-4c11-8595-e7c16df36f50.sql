
-- Add message reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.direct_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'thumbs_up', 'laugh', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- Add message threading support
ALTER TABLE public.direct_messages 
ADD COLUMN parent_message_id UUID REFERENCES public.direct_messages(id) ON DELETE CASCADE,
ADD COLUMN thread_count INTEGER DEFAULT 0;

-- Create group conversations table
CREATE TABLE public.group_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  member_count INTEGER NOT NULL DEFAULT 1,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_conversation_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.group_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.group_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  parent_message_id UUID REFERENCES public.group_messages(id) ON DELETE CASCADE,
  thread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group message reactions table
CREATE TABLE public.group_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.group_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'thumbs_up', 'laugh', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- Create user presence table for online status
CREATE TABLE public.user_presence (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can view reactions on messages they can see" 
  ON public.message_reactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_messages dm 
      WHERE dm.id = message_id 
      AND (dm.sender_id = auth.uid() OR dm.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can add reactions to messages they can see" 
  ON public.message_reactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.direct_messages dm 
      WHERE dm.id = message_id 
      AND (dm.sender_id = auth.uid() OR dm.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can remove their own reactions" 
  ON public.message_reactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for group_conversations
CREATE POLICY "Users can view groups they're members of" 
  ON public.group_conversations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_id = id AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" 
  ON public.group_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" 
  ON public.group_conversations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_id = id AND gcm.user_id = auth.uid() AND gcm.role = 'admin'
    )
  );

-- RLS policies for group_conversation_members
CREATE POLICY "Users can view group members for groups they're in" 
  ON public.group_conversation_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_id = group_id AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can add members" 
  ON public.group_conversation_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_id = group_id AND gcm.user_id = auth.uid() AND gcm.role = 'admin'
    ) OR 
    EXISTS (
      SELECT 1 FROM public.group_conversations gc 
      WHERE gc.id = group_id AND gc.created_by = auth.uid()
    )
  );

-- RLS policies for group_messages
CREATE POLICY "Users can view messages in groups they're members of" 
  ON public.group_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_id = group_id AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages" 
  ON public.group_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.group_conversation_members gcm 
      WHERE gcm.group_id = group_id AND gcm.user_id = auth.uid()
    )
  );

-- RLS policies for group_message_reactions
CREATE POLICY "Users can view reactions on group messages they can see" 
  ON public.group_message_reactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_messages gm 
      JOIN public.group_conversation_members gcm ON gm.group_id = gcm.group_id
      WHERE gm.id = message_id AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add reactions" 
  ON public.group_message_reactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_messages gm 
      JOIN public.group_conversation_members gcm ON gm.group_id = gcm.group_id
      WHERE gm.id = message_id AND gcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove their own group message reactions" 
  ON public.group_message_reactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for user_presence
CREATE POLICY "Everyone can view user presence" 
  ON public.user_presence 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own presence" 
  ON public.user_presence 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence status" 
  ON public.user_presence 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Functions to update thread counts
CREATE OR REPLACE FUNCTION update_message_thread_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.parent_message_id IS NOT NULL THEN
    UPDATE public.direct_messages
    SET thread_count = thread_count + 1
    WHERE id = NEW.parent_message_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION update_group_message_thread_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.parent_message_id IS NOT NULL THEN
    UPDATE public.group_messages
    SET thread_count = thread_count + 1
    WHERE id = NEW.parent_message_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.group_conversations 
    SET member_count = member_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.group_conversations 
    SET member_count = member_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Function to add group creator as admin
CREATE OR REPLACE FUNCTION add_group_creator_as_admin()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.group_conversation_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$function$;

-- Create triggers
CREATE TRIGGER update_message_thread_count_trigger
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION update_message_thread_count();

CREATE TRIGGER update_group_message_thread_count_trigger
  AFTER INSERT ON public.group_messages
  FOR EACH ROW EXECUTE FUNCTION update_group_message_thread_count();

CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON public.group_conversation_members
  FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

CREATE TRIGGER add_group_creator_as_admin_trigger
  AFTER INSERT ON public.group_conversations
  FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_admin();
