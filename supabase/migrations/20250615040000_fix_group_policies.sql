
-- Fix infinite recursion in group conversation policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view group conversations they're members of" ON public.group_conversations;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_conversation_members;

-- Enable RLS on tables
ALTER TABLE public.group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_conversation_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for group_conversations
CREATE POLICY "Allow all to view public group conversations" ON public.group_conversations
    FOR SELECT USING (NOT is_private OR created_by = auth.uid());

CREATE POLICY "Allow authenticated users to create group conversations" ON public.group_conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Allow group creators to update their group conversations" ON public.group_conversations
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Allow group creators to delete their group conversations" ON public.group_conversations
    FOR DELETE USING (created_by = auth.uid());

-- Create simple policies for group_conversation_members
CREATE POLICY "Allow users to view all group memberships" ON public.group_conversation_members
    FOR SELECT USING (true);

CREATE POLICY "Allow users to join groups as members" ON public.group_conversation_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Allow users to leave groups" ON public.group_conversation_members
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Allow group creators to manage members" ON public.group_conversation_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_conversations 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );
