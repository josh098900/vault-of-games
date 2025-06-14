
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Star, Gamepad, User, TrendingUp, Heart, Plus } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { Header } from "@/components/Header";
import { FeaturedSection } from "@/components/FeaturedSection";
import { useAuth } from "@/contexts/AuthContext";
import { Game } from "@/hooks/useUserGames";
import { useGames } from "@/hooks/useGames";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const { games, isLoading: gamesLoading } = useGames();
  const navigate = useNavigate();

  const featuredGames: Game[] = [
    {
      id: "1",
      title: "Cyberpunk 2077",
      description: "A futuristic open-world RPG",
      genre: "RPG",
      platform: "PC",
      release_year: 2020,
      cover_image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=400&fit=crop",
      developer: "CD Projekt RED",
      publisher: "CD Projekt"
    },
    {
      id: "2",
      title: "The Last of Us Part II",
      description: "Post-apocalyptic action-adventure",
      genre: "Action",
      platform: "PlayStation",
      release_year: 2020,
      cover_image_url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=400&fit=crop",
      developer: "Naughty Dog",
      publisher: "Sony Interactive Entertainment"
    },
    {
      id: "3",
      title: "Hades",
      description: "A rogue-like dungeon crawler",
      genre: "Roguelike",
      platform: "Steam",
      release_year: 2020,
      cover_image_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=400&fit=crop",
      developer: "Supergiant Games",
      publisher: "Supergiant Games"
    },
    {
      id: "4",
      title: "Ghost of Tsushima",
      description: "Samurai action-adventure",
      genre: "Action",
      platform: "PlayStation",
      release_year: 2020,
      cover_image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      developer: "Sucker Punch Productions",
      publisher: "Sony Interactive Entertainment"
    }
  ];

  const trendingGames = [
    { title: "Baldur's Gate 3", rating: 4.9, reviews: 2847 },
    { title: "Spider-Man 2", rating: 4.7, reviews: 1923 },
    { title: "Alan Wake 2", rating: 4.5, reviews: 1456 },
    { title: "Super Mario Wonder", rating: 4.8, reviews: 1234 }
  ];

  // Filter games from database based on search
  const searchResults = searchQuery.length > 0 
    ? games.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleWriteReview = (game: Game) => {
    navigate('/reviews', { state: { selectedGame: game } });
  };

  if (loading || gamesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gamepad className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading GameVault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-green-600/20 to-pink-600/20 animate-pulse-rgb"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-float mb-8">
            <Gamepad className="w-16 h-16 mx-auto text-primary mb-4" />
          </div>
          <h1 className="text-6xl font-bold mb-6 text-gradient">
            GameVault
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {user 
              ? `Welcome back, ${user.user_metadata?.username || user.email?.split('@')[0]}! Track, rate, and discover your next favorite game.`
              : "The Ultimate Gaming Social Paradise. Track, rate, and discover your next favorite game with the community."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-background/50 border-white/20 backdrop-blur-sm"
              />
            </div>
            {user ? (
              <Button 
                className="bg-primary hover:bg-primary/80 glow-blue"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                Search Games
              </Button>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/80 glow-blue"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">Search Results for "{searchQuery}"</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              {searchResults.map((game) => (
                <GameCard key={game.id} game={game} onWriteReview={handleWriteReview} />
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={handleSearch}>
                View All Results
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Section */}
      <FeaturedSection />

      {/* Trending Games */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-green-400" />
              Trending Now
            </h2>
            <Button variant="outline" className="border-white/20 hover:border-primary/50">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingGames.map((game, index) => (
              <Card key={index} className="gaming-card group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      <span className="font-bold">{game.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {game.reviews.toLocaleString()} reviews
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Game Collection */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Games</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-blue-400 text-blue-400">All</Badge>
              <Badge variant="outline" className="border-white/20">Playing</Badge>
              <Badge variant="outline" className="border-white/20">Completed</Badge>
              <Badge variant="outline" className="border-white/20">Wishlist</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} onWriteReview={handleWriteReview} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Games Tracked</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">25K+</div>
              <div className="text-sm text-muted-foreground">Active Gamers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-pink-400">100K+</div>
              <div className="text-sm text-muted-foreground">Reviews Written</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-400">500K+</div>
              <div className="text-sm text-muted-foreground">Hours Logged</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
