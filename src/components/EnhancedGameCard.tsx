import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, Plus, Clock, Check, Heart } from "lucide-react";
import { Game, GameStatus, useUserGames } from "@/hooks/useUserGames";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { QuickViewDialog } from "./QuickViewDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedGameCardProps {
  game: Game;
  onWriteReview?: (game: Game) => void;
}

export const EnhancedGameCard = ({ game, onWriteReview }: EnhancedGameCardProps) => {
  const { user } = useAuth();
  const { userGames, addGameToLibrary } = useUserGames();
  const navigate = useNavigate();
  const [showQuickView, setShowQuickView] = useState(false);

  const userGame = userGames.find(ug => ug.game_id === game.id);

  // Correct image mapping for each specific game
  const getGameImage = (game: Game) => {
    if (game.cover_image_url && game.cover_image_url.includes('igdb.com')) {
      return game.cover_image_url.replace('t_cover_big', 't_cover_big');
    }
    
    // Properly matched game images
    const gameImages: Record<string, string> = {
      "Cyberpunk 2077": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp",
      "The Last of Us Part II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp", 
      "Hades": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
      "Ghost of Tsushima": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb6.webp",
      "Baldur's Gate 3": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5f5z.webp",
      "Grand Theft Auto V": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7g.webp",
      "The Witcher 3: Wild Hunt": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
      "Red Dead Redemption 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
      "God of War": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
      "Horizon Zero Dawn": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u9l.webp",
      "Spider-Man Remastered": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
      "Elden Ring": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jj6.webp",
      "Call of Duty: Modern Warfare II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s4j.webp",
      "FIFA 23": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s2f.webp"
    };
    
    return gameImages[game.title] || game.cover_image_url || "https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp";
  };

  const handleAddToLibrary = async (status: GameStatus) => {
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
        gameId: game.id,
        status,
      });
      
      toast({
        title: "Game added!",
        description: `${game.title} has been added to your ${status} list.`,
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

  const handleQuickView = () => {
    setShowQuickView(true);
  };

  return (
    <>
      <Card className="gaming-card group overflow-hidden">
        <div className="relative">
          <img
            src={getGameImage(game)}
            alt={game.title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {userGame && (
            <Badge className="absolute top-2 left-2 bg-primary/80 text-primary-foreground">
              In Library
            </Badge>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickView}
              className="bg-black/50 backdrop-blur-sm border-white/20"
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>

          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!userGame ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/20">
                    <Plus className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleAddToLibrary("wishlist")}>
                    <Heart className="w-4 h-4 mr-2 text-pink-400" />
                    Add to Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddToLibrary("playing")}>
                    <Clock className="w-4 h-4 mr-2 text-blue-400" />
                    Currently Playing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddToLibrary("completed")}>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddToLibrary("backlog")}>
                    <Plus className="w-4 h-4 mr-2 text-yellow-400" />
                    Add to Backlog
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="secondary" className="bg-green-500/20 backdrop-blur-sm border-green-500/30" disabled>
                <Check className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {game.title}
              </h3>
              <p className="text-sm text-muted-foreground">{game.release_year}</p>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-white/20 text-xs">
                {game.genre}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-xs">
                {game.platform}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onWriteReview?.(game)}
                className="border-white/20 text-xs"
              >
                <Star className="w-3 h-3 mr-1" />
                Rate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleQuickView}
                className="border-white/20 text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Quick View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuickViewDialog 
        game={game}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};
