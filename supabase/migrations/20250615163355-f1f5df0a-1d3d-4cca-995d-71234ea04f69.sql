
-- Add foreign key constraint between live_gaming_sessions and games tables (this is the missing one)
ALTER TABLE public.live_gaming_sessions 
ADD CONSTRAINT live_gaming_sessions_game_id_fkey 
FOREIGN KEY (game_id) REFERENCES public.games(id);

-- Only add other constraints if they don't exist
DO $$
BEGIN
    -- Check and add gaming_session_participants constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gaming_session_participants_session_id_fkey'
    ) THEN
        ALTER TABLE public.gaming_session_participants 
        ADD CONSTRAINT gaming_session_participants_session_id_fkey 
        FOREIGN KEY (session_id) REFERENCES public.live_gaming_sessions(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gaming_session_participants_user_id_fkey'
    ) THEN
        ALTER TABLE public.gaming_session_participants 
        ADD CONSTRAINT gaming_session_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;
