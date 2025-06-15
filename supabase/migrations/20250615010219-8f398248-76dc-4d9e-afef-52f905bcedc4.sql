
-- Add foreign key constraint between reviews and profiles
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also add the missing foreign key constraints for review tables if they don't exist
ALTER TABLE public.review_likes 
DROP CONSTRAINT IF EXISTS review_likes_user_id_fkey;

ALTER TABLE public.review_likes 
ADD CONSTRAINT review_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.review_helpful 
DROP CONSTRAINT IF EXISTS review_helpful_user_id_fkey;

ALTER TABLE public.review_helpful 
ADD CONSTRAINT review_helpful_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
