
-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view group conversations they're members of" ON public.group_conversations;
DROP POLICY IF EXISTS "Users can view group memberships for their groups" ON public.group_conversation_members;

-- Create a security definer function to check if user is a group member
CREATE OR REPLACE FUNCTION public.is_group_member(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_conversation_members 
    WHERE group_conversation_members.group_id = $1 
    AND group_conversation_members.user_id = $2
  )
$$;

-- Create a security definer function to check if user is a group creator
CREATE OR REPLACE FUNCTION public.is_group_creator(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_conversations 
    WHERE id = $1 AND created_by = $2
  )
$$;

-- Recreate policies using the security definer functions
CREATE POLICY "Users can view group conversations they're members of" ON public.group_conversations
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            created_by = auth.uid() OR
            public.is_group_member(id, auth.uid())
        )
    );

CREATE POLICY "Users can view group memberships for their groups" ON public.group_conversation_members
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            public.is_group_creator(group_id, auth.uid())
        )
    );
