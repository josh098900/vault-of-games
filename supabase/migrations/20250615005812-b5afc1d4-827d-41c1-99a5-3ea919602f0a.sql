
-- Add Row Level Security policies for reviews functionality

-- Reviews policies (updating the existing ones to ensure they work properly)
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Create proper RLS policies for reviews
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create reviews" 
  ON public.reviews 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Review likes policies (updating existing ones)
DROP POLICY IF EXISTS "Anyone can view review likes" ON public.review_likes;
DROP POLICY IF EXISTS "Users can like reviews" ON public.review_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.review_likes;

CREATE POLICY "Anyone can view review likes" 
  ON public.review_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like reviews" 
  ON public.review_likes 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
  ON public.review_likes 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Review helpful policies (updating existing ones)
DROP POLICY IF EXISTS "Anyone can view helpful votes" ON public.review_helpful;
DROP POLICY IF EXISTS "Users can mark reviews as helpful" ON public.review_helpful;
DROP POLICY IF EXISTS "Users can remove their helpful votes" ON public.review_helpful;

CREATE POLICY "Anyone can view helpful votes" 
  ON public.review_helpful 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can mark reviews as helpful" 
  ON public.review_helpful 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful votes" 
  ON public.review_helpful 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
