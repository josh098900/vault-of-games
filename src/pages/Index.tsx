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
import { HowItWorksButton } from "@/components/HowItWorksButton";
import { useAuth } from "@/contexts/AuthContext";
import { Game } from "@/hooks/useUserGames";
import { useGames } from "@/hooks/useGames";
import { ParticleSystem } from "@/components/ParticleSystem";
import { EnhancedGameCard } from "@/components/EnhancedGameCard";

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
          <Gamepad className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse morphing-icon" />
          <p className="text-muted-foreground">Loading GameVault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Particle System */}
      <ParticleSystem />
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-green-600/20 to-pink-600/20 animate-pulse-rgb"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-float mb-8">
            <Gamepad className="w-16 h-16 mx-auto text-primary mb-4 morphing-icon" />
          </div>
          <h1 className="text-6xl font-bold mb-6 text-gradient animate-fade-in-up">
            GameVault
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {user 
              ? `Welcome back, ${user.user_metadata?.username || user.email?.split('@')[0]}! Track, rate, and discover your next favorite game.`
              : "The Ultimate Gaming Social Paradise. Track, rate, and discover your next favorite game with the community."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 morphing-icon" />
              <Input
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 glass-card border-white/20 backdrop-blur-sm micro-interaction"
              />
            </div>
            {user ? (
              <Button 
                className="bg-primary hover:bg-primary/80 glow-blue micro-interaction"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2 morphing-icon" />
                Search Games
              </Button>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/80 glow-blue micro-interaction"
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
            <h2 className="text-2xl font-bold mb-6 animate-fade-in-up">Search Results for "{searchQuery}"</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
              {searchResults.map((game, index) => (
                <div key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <EnhancedGameCard game={game} onWriteReview={handleWriteReview} />
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={handleSearch} className="glass-card border-white/20 micro-interaction">
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
            <h2 className="text-3xl font-bold flex items-center animate-fade-in-up">
              <TrendingUp className="w-8 h-8 mr-3 text-green-400 morphing-icon" />
              Trending Now
            </h2>
            <Button variant="outline" className="glass-card border-white/20 hover:border-primary/50 micro-interaction">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingGames.map((game, index) => (
              <Card key={index} className="glass-card group micro-interaction" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs glass-card">
                      #{index + 1}
                    </Badge>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current mr-1 morphing-icon" />
                      <span className="font-bold animate-counter">{game.rating}</span>
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
            <h2 className="text-3xl font-bold animate-fade-in-up">Featured Games</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-blue-400 text-blue-400 glass-card micro-interaction">All</Badge>
              <Badge variant="outline" className="glass-card border-white/20 micro-interaction">Playing</Badge>
              <Badge variant="outline" className="glass-card border-white/20 micro-interaction">Completed</Badge>
              <Badge variant="outline" className="glass-card border-white/20 micro-interaction">Wishlist</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game, index) => (
              <div key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <EnhancedGameCard game={game} onWriteReview={handleWriteReview} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2 animate-fade-in-up">
              <div className="text-3xl font-bold text-primary animate-counter">50K+</div>
              <div className="text-sm text-muted-foreground">Games Tracked</div>
            </div>
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl font-bold text-green-400 animate-counter">25K+</div>
              <div className="text-sm text-muted-foreground">Active Gamers</div>
            </div>
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-pink-400 animate-counter">100K+</div>
              <div className="text-sm text-muted-foreground">Reviews Written</div>
            </div>
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl font-bold text-purple-400 animate-counter">500K+</div>
              <div className="text-sm text-muted-foreground">Hours Logged</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Button */}
      <HowItWorksButton />
    </div>
  );
};

export default Index;
