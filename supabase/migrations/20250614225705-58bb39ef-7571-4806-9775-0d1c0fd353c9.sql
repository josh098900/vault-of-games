
-- Create an enum for game status
CREATE TYPE public.game_status AS ENUM ('playing', 'completed', 'wishlist', 'backlog', 'dropped');

-- Create a games table to store game information
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  platform TEXT,
  release_year INTEGER,
  cover_image_url TEXT,
  developer TEXT,
  publisher TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a user_games table to track user's game library
CREATE TABLE public.user_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  status game_status NOT NULL DEFAULT 'wishlist',
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  hours_played INTEGER DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS on both tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

-- RLS policies for games table (public read access)
CREATE POLICY "Anyone can view games" 
  ON public.games 
  FOR SELECT 
  USING (true);

-- RLS policies for user_games table (users can only see their own games)
CREATE POLICY "Users can view their own game library" 
  ON public.user_games 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add games to their library" 
  ON public.user_games 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game entries" 
  ON public.user_games 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game entries" 
  ON public.user_games 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert some sample games
INSERT INTO public.games (title, description, genre, platform, release_year, cover_image_url, developer, publisher) VALUES
('The Witcher 3: Wild Hunt', 'An open-world RPG adventure', 'RPG', 'PC', 2015, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=400&fit=crop', 'CD Projekt RED', 'CD Projekt'),
('Cyberpunk 2077', 'A futuristic open-world RPG', 'RPG', 'PC', 2020, 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=300&h=400&fit=crop', 'CD Projekt RED', 'CD Projekt'),
('Elden Ring', 'A dark fantasy action RPG', 'RPG', 'PC', 2022, 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=400&fit=crop', 'FromSoftware', 'Bandai Namco'),
('God of War', 'Norse mythology action-adventure', 'Action', 'PlayStation', 2018, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', 'Santa Monica Studio', 'Sony Interactive Entertainment'),
('Spider-Man 2', 'Superhero action-adventure', 'Action', 'PlayStation', 2023, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop', 'Insomniac Games', 'Sony Interactive Entertainment'),
('Civilization VI', 'Turn-based strategy game', 'Strategy', 'PC', 2016, 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=400&fit=crop', 'Firaxis Games', '2K Games');
