import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, Users, Check, Plus, Heart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserGames, GameStatus } from "@/hooks/useUserGames";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommunityHighlights } from "@/components/featured/CommunityHighlights";
import { QuickStats } from "@/components/featured/QuickStats";

export const FeaturedSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userGames, addGameToLibrary } = useUserGames();

  // Updated featured content with real game images
  const featuredContent = [
    {
      id: "bg3-featured",
      type: "Game of the Month",
      title: "Baldur's Gate 3",
      description: "The community's current obsession. Epic RPG storytelling meets tactical combat.",
      image: "https://images.igdb.com/igdb/image/upload/t_1080p/co5f5z.webp",
      rating: 4.9,
      reviews: 15420,
      icon: Star
    },
    {
      id: "pizza-tower-featured",
      type: "Rising Star",
      title: "Pizza Tower",
      description: "This indie platformer is climbing the charts with its unique art style.",
      image: "https://images.igdb.com/igdb/image/upload/t_1080p/co6d2z.webp",
      rating: 4.7,
      reviews: 3240,
      icon: TrendingUp
    },
    {
      id: "hollow-knight-featured",
      type: "Community Choice",
      title: "Hollow Knight",
      description: "The most recommended indie game by our community members.",
      image: "https://images.igdb.com/igdb/image/upload/t_1080p/co1rgi.webp",
      rating: 4.8,
      reviews: 8950,
      icon: Users
    }
  ];

  const handleExploreGame = (gameId: string, gameTitle: string) => {
    const mockGame = {
      id: gameId,
      title: gameTitle,
      description: featuredContent.find(item => item.id === gameId)?.description || "",
      genre: "Featured",
      platform: "Multiple",
      release_year: 2023,
      cover_image_url: featuredContent.find(item => item.id === gameId)?.image || "",
      developer: "Featured Developer",
      publisher: "Featured Publisher"
    };

    navigate(`/game/${gameId}`, { state: { game: mockGame } });
  };

  const handleAddToLibrary = async (gameId: string, gameTitle: string, status: GameStatus) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add games to your library.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    try {
      await addGameToLibrary.mutateAsync({
        gameId,
        status,
      });
      
      toast({
        title: "Game added!",
        description: `${gameTitle} has been added to your ${status} list.`,
      });
    } catch (error) {
      console.error("Error adding game to library:", error);
      toast({
        title: "Error",
        description: "Failed to add game to library. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isGameInLibrary = (gameId: string) => {
    return userGames.some(ug => ug.game_id === gameId);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto">
        <CommunityHighlights />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredContent.map((item, index) => {
            const IconComponent = item.icon;
            const gameInLibrary = isGameInLibrary(item.id);
            
            return (
              <Card key={index} className="gaming-card group overflow-hidden relative">
                <div className="relative h-48">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <Badge className="absolute top-3 left-3 bg-primary/80 text-primary-foreground">
                    <IconComponent className="w-4 h-4" />
                    <span className="ml-1">{item.type}</span>
                  </Badge>

                  {/* Add to Library Button */}
                  <div className="absolute top-3 right-3">
                    {!gameInLibrary ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="w-8 h-8 glass-card hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            disabled={addGameToLibrary.isPending}
                          >
                            {addGameToLibrary.isPending ? (
                              <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent" />
                            ) : (
                              <Plus className="w-4 h-4 morphing-icon" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/20">
                          <DropdownMenuItem onClick={() => handleAddToLibrary(item.id, item.title, "wishlist")}>
                            <Heart className="w-4 h-4 mr-2 text-pink-400" />
                            Add to Wishlist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddToLibrary(item.id, item.title, "playing")}>
                            <Clock className="w-4 h-4 mr-2 text-blue-400" />
                            Currently Playing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddToLibrary(item.id, item.title, "completed")}>
                            <Check className="w-4 h-4 mr-2 text-green-400" />
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddToLibrary(item.id, item.title, "backlog")}>
                            <Plus className="w-4 h-4 mr-2 text-yellow-400" />
                            Add to Backlog
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-3 h-3 mr-1" />
                        In Library
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center bg-black/80 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-bold text-white mr-2">{item.rating}</span>
                    <span className="text-xs text-gray-300">
                      {item.reviews.toLocaleString()}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
                    onClick={() => handleExploreGame(item.id, item.title)}
                  >
                    Explore Game
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <QuickStats />
      </div>
    </section>
  );
};
