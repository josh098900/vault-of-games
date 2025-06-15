
-- Add RLS policy to allow inserting games (for bulk import functionality)
CREATE POLICY "Allow inserting games for bulk import" 
  ON public.games 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policy to allow updating games 
CREATE POLICY "Allow updating games" 
  ON public.games 
  FOR UPDATE 
  USING (true);
