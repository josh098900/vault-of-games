
-- First, let's add the missing foreign key constraint between discussions and profiles
-- This assumes that all user_id values in discussions already exist in profiles
ALTER TABLE public.discussions 
DROP CONSTRAINT IF EXISTS discussions_user_id_fkey;

ALTER TABLE public.discussions 
ADD CONSTRAINT discussions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also add the missing foreign key constraints for other tables if they don't exist
ALTER TABLE public.discussion_likes 
DROP CONSTRAINT IF EXISTS discussion_likes_user_id_fkey;

ALTER TABLE public.discussion_likes 
ADD CONSTRAINT discussion_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.discussion_replies 
DROP CONSTRAINT IF EXISTS discussion_replies_user_id_fkey;

ALTER TABLE public.discussion_replies 
ADD CONSTRAINT discussion_replies_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update the RLS policies for discussions to work with profiles
DROP POLICY IF EXISTS "Users can update their own discussions" ON public.discussions;
DROP POLICY IF EXISTS "Users can delete their own discussions" ON public.discussions;
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON public.discussions;

CREATE POLICY "Users can update their own discussions" 
  ON public.discussions 
  FOR UPDATE 
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own discussions" 
  ON public.discussions 
  FOR DELETE 
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Authenticated users can create discussions" 
  ON public.discussions 
  FOR INSERT 
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));
