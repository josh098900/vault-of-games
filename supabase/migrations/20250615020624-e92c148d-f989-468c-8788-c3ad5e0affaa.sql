
-- Create friends/follow system table
CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create gaming groups/clans table
CREATE TABLE public.gaming_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_url text,
  is_private boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  member_count integer NOT NULL DEFAULT 1
);

-- Create group members table
CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.gaming_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create challenges table
CREATE TABLE public.gaming_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL CHECK (challenge_type IN ('game_completion', 'hours_played', 'achievement', 'custom')),
  target_value integer,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone,
  is_group_challenge boolean NOT NULL DEFAULT false,
  group_id uuid REFERENCES public.gaming_groups(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.gaming_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'withdrawn')),
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create game recommendations table
CREATE TABLE public.game_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(recommender_id, recipient_id, game_id)
);

-- Create gaming events table
CREATE TABLE public.gaming_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('release', 'tournament', 'sale', 'update', 'dlc')),
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  external_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create event interests table (users can mark interest in events)
CREATE TABLE public.event_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.gaming_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can view all follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for gaming_groups
CREATE POLICY "Users can view public groups and their own groups" ON public.gaming_groups 
  FOR SELECT USING (
    NOT is_private OR 
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid())
  );
CREATE POLICY "Authenticated users can create groups" ON public.gaming_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Group owners can update their groups" ON public.gaming_groups FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Group owners can delete their groups" ON public.gaming_groups FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for group_members
CREATE POLICY "Users can view group members" ON public.group_members 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gaming_groups g WHERE g.id = group_id AND (NOT g.is_private OR g.created_by = auth.uid() OR user_id = auth.uid()))
  );
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups or owners can remove members" ON public.group_members 
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.gaming_groups WHERE id = group_id AND created_by = auth.uid())
  );

-- RLS Policies for gaming_challenges
CREATE POLICY "Users can view public challenges and their own" ON public.gaming_challenges 
  FOR SELECT USING (
    created_by = auth.uid() OR 
    NOT is_group_challenge OR
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = gaming_challenges.group_id AND user_id = auth.uid())
  );
CREATE POLICY "Authenticated users can create challenges" ON public.gaming_challenges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Challenge creators can update their challenges" ON public.gaming_challenges FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Challenge creators can delete their challenges" ON public.gaming_challenges FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for challenge_participants
CREATE POLICY "Users can view challenge participants" ON public.challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own participation" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can withdraw from challenges" ON public.challenge_participants FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for game_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.game_recommendations 
  FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = recommender_id);
CREATE POLICY "Users can create recommendations" ON public.game_recommendations FOR INSERT WITH CHECK (auth.uid() = recommender_id);
CREATE POLICY "Recipients can update read status" ON public.game_recommendations FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Recommenders can delete their recommendations" ON public.game_recommendations FOR DELETE USING (auth.uid() = recommender_id);

-- RLS Policies for gaming_events
CREATE POLICY "Users can view all events" ON public.gaming_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.gaming_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Event creators can update their events" ON public.gaming_events FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Event creators can delete their events" ON public.gaming_events FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for event_interests
CREATE POLICY "Users can view event interests" ON public.event_interests FOR SELECT USING (true);
CREATE POLICY "Users can mark interest in events" ON public.event_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their interest" ON public.event_interests FOR DELETE USING (auth.uid() = user_id);

-- Create function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gaming_groups 
    SET member_count = member_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gaming_groups 
    SET member_count = member_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for group member count
CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();

-- Insert the group creator as the first member when a group is created
CREATE OR REPLACE FUNCTION add_group_creator_as_member()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add group creator as member
CREATE TRIGGER add_group_creator_as_member_trigger
  AFTER INSERT ON public.gaming_groups
  FOR EACH ROW
  EXECUTE FUNCTION add_group_creator_as_member();
