
-- First, let's drop any existing problematic policies and create proper ones

-- Drop existing policies for gaming_groups if they exist
DROP POLICY IF EXISTS "Users can view gaming groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Users can create gaming groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Group owners can delete their groups" ON public.gaming_groups;

-- Drop existing policies for group_members if they exist
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Group owners can manage members" ON public.group_members;

-- Drop existing policies for gaming_challenges if they exist
DROP POLICY IF EXISTS "Users can view challenges" ON public.gaming_challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON public.gaming_challenges;
DROP POLICY IF EXISTS "Challenge creators can update their challenges" ON public.gaming_challenges;

-- Drop existing policies for challenge_participants if they exist
DROP POLICY IF EXISTS "Users can view challenge participants" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.challenge_participants;

-- Enable RLS on all tables
ALTER TABLE public.gaming_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for gaming_groups
CREATE POLICY "Allow all to view public groups" ON public.gaming_groups
    FOR SELECT USING (NOT is_private OR created_by = auth.uid());

CREATE POLICY "Allow authenticated users to create groups" ON public.gaming_groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Allow group creators to update their groups" ON public.gaming_groups
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Allow group creators to delete their groups" ON public.gaming_groups
    FOR DELETE USING (created_by = auth.uid());

-- Create simple policies for group_members
CREATE POLICY "Allow users to view group memberships" ON public.group_members
    FOR SELECT USING (true);

CREATE POLICY "Allow users to join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Allow users to manage their own membership" ON public.group_members
    FOR DELETE USING (user_id = auth.uid());

-- Create policies for gaming_challenges
CREATE POLICY "Allow all to view challenges" ON public.gaming_challenges
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create challenges" ON public.gaming_challenges
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Allow challenge creators to update their challenges" ON public.gaming_challenges
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Allow challenge creators to delete their challenges" ON public.gaming_challenges
    FOR DELETE USING (created_by = auth.uid());

-- Create policies for challenge_participants
CREATE POLICY "Allow all to view challenge participants" ON public.challenge_participants
    FOR SELECT USING (true);

CREATE POLICY "Allow users to join challenges" ON public.challenge_participants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Allow users to update their own participation" ON public.challenge_participants
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Allow users to leave challenges" ON public.challenge_participants
    FOR DELETE USING (user_id = auth.uid());
