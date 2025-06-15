
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow all to view public group conversations" ON public.group_conversations;
DROP POLICY IF EXISTS "Allow authenticated users to create group conversations" ON public.group_conversations;
DROP POLICY IF EXISTS "Allow group creators to update their group conversations" ON public.group_conversations;
DROP POLICY IF EXISTS "Allow group creators to delete their group conversations" ON public.group_conversations;
DROP POLICY IF EXISTS "Allow users to view all group memberships" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Allow users to join groups as members" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Allow users to leave groups" ON public.group_conversation_members;
DROP POLICY IF EXISTS "Allow group creators to manage members" ON public.group_conversation_members;

-- Create better policies for group conversations
CREATE POLICY "Users can view group conversations they're members of" ON public.group_conversations
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.group_conversation_members 
                WHERE group_id = id AND user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Authenticated users can create group conversations" ON public.group_conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Group creators can update their groups" ON public.group_conversations
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Group creators can delete their groups" ON public.group_conversations
    FOR DELETE USING (created_by = auth.uid());

-- Create policies for group members
CREATE POLICY "Users can view group memberships for their groups" ON public.group_conversation_members
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.group_conversations 
                WHERE id = group_id AND created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Users can be added to groups" ON public.group_conversation_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can leave groups" ON public.group_conversation_members
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.group_conversations 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Group creators and admins can manage members" ON public.group_conversation_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_conversations 
            WHERE id = group_id AND created_by = auth.uid()
        ) OR
        (user_id = auth.uid() AND role = 'admin')
    );

-- Ensure the group creator is automatically added as an admin when a group is created
CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_conversation_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add creator as admin
DROP TRIGGER IF EXISTS trigger_add_group_creator_as_admin ON public.group_conversations;
CREATE TRIGGER trigger_add_group_creator_as_admin
    AFTER INSERT ON public.group_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.add_group_creator_as_admin();
