
-- Create a table for game reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id) -- One review per user per game
);

-- Create a table for review likes
CREATE TABLE public.review_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id) -- One like per user per review
);

-- Create a table for helpful votes on reviews
CREATE TABLE public.review_helpful (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id) -- One helpful vote per user per review
);

-- Add Row Level Security (RLS) to ensure users can interact appropriately
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Review likes policies
CREATE POLICY "Anyone can view review likes" 
  ON public.review_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can like reviews" 
  ON public.review_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
  ON public.review_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Review helpful policies
CREATE POLICY "Anyone can view helpful votes" 
  ON public.review_helpful 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can mark reviews as helpful" 
  ON public.review_helpful 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful votes" 
  ON public.review_helpful 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_review_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update counts
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.review_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_likes_count();

CREATE TRIGGER update_helpful_count_trigger
  AFTER INSERT OR DELETE ON public.review_helpful
  FOR EACH ROW EXECUTE FUNCTION public.update_review_helpful_count();
