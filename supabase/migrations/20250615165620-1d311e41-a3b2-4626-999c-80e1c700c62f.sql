
-- First, drop the existing foreign key constraint that references auth.users
ALTER TABLE public.live_gaming_sessions 
DROP CONSTRAINT IF EXISTS live_gaming_sessions_user_id_fkey;

-- Add the correct foreign key constraint that references profiles
ALTER TABLE public.live_gaming_sessions 
ADD CONSTRAINT live_gaming_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
