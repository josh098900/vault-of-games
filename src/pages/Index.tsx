import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad } from "lucide-react";
import { Header } from "@/components/Header";
import { FeaturedSection } from "@/components/FeaturedSection";
import { HowItWorksButton } from "@/components/HowItWorksButton";
import { useAuth } from "@/contexts/AuthContext";
import { Game } from "@/hooks/useUserGames";
import { useGames } from "@/hooks/useGames";
import { ParticleSystem } from "@/components/ParticleSystem";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchResults } from "@/components/home/SearchResults";
import { TrendingSection } from "@/components/home/TrendingSection";
import { FeaturedGamesSection } from "@/components/home/FeaturedGamesSection";
import { StatsSection } from "@/components/home/StatsSection";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const navigate = useNavigate();

  // Updated featured games with correct game images
  const featuredGames: Game[] = [
    {
      id: "1",
      title: "Cyberpunk 2077",
      description: "A futuristic open-world RPG",
      genre: "RPG",
      platform: "PC",
      release_year: 2020,
      cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp",
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
      cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2f2z.webp",
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
      cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2i2d.webp",
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
      cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb6.webp",
      developer: "Sucker Punch Productions",
      publisher: "Sony Interactive Entertainment"
    }
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
      <ParticleSystem />
      <Header />
      
      <HeroSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      <SearchResults
        searchResults={searchResults}
        searchQuery={searchQuery}
        onWriteReview={handleWriteReview}
        onViewAllResults={handleSearch}
      />

      <FeaturedSection />

      <TrendingSection />

      <FeaturedGamesSection 
        featuredGames={featuredGames}
        onWriteReview={handleWriteReview}
      />

      <StatsSection />

      <HowItWorksButton />
    </div>
  );
};

export default Index;
