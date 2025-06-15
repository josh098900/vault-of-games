import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Plus, Clock, Check, Edit } from "lucide-react";
import { Game, GameStatus, useUserGames } from "@/hooks/useUserGames";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GameCardProps {
  game: Game;
  onWriteReview?: (game: Game) => void;
}

export const GameCard = ({ game, onWriteReview }: GameCardProps) => {
  const { user } = useAuth();
  const { userGames, addGameToLibrary } = useUserGames();
  const navigate = useNavigate();
  
  // Check if this game is already in user's library
  const userGame = userGames.find(ug => ug.game_id === game.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "playing":
        return <Clock className="w-3 h-3" />;
      case "completed":
        return <Check className="w-3 h-3" />;
      case "wishlist":
        return <Heart className="w-3 h-3" />;
      default:
        return <Plus className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "playing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "wishlist":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "backlog":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "dropped":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
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

  const handleWriteReview = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to write reviews.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (onWriteReview) {
      onWriteReview(game);
    }
  };

  const handleViewDetails = () => {
    // Navigate to game details page with game ID
    navigate(`/game/${game.id}`, { state: { game } });
  };

  return (
    <Card className="gaming-card group overflow-hidden">
      <div className="relative">
        <img
          src={game.cover_image_url || "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=400&fit=crop"}
          alt={game.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Status Badge (if in user's library) */}
        {userGame && (
          <div className="absolute top-2 left-2">
            <Badge className={`${getStatusColor(userGame.status)} flex items-center gap-1 text-xs`}>
              {getStatusIcon(userGame.status)}
              {userGame.status}
            </Badge>
          </div>
        )}

        {/* User Rating (if in library and rated) */}
        {userGame?.user_rating && (
          <div className="absolute top-2 right-2 flex items-center bg-black/90 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-xs font-bold text-white">{userGame.user_rating}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!userGame ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-black/90 backdrop-blur-sm border border-white/30 hover:bg-black text-white shadow-lg"
                  disabled={addGameToLibrary.isPending}
                >
                  {addGameToLibrary.isPending ? (
                    <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent mr-1" />
                  ) : (
                    <Plus className="w-3 h-3 mr-1" />
                  )}
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border border-white/20">
                <DropdownMenuItem onClick={() => handleAddToLibrary("wishlist")}>
                  <Heart className="w-3 h-3 mr-2 text-pink-400" />
                  Add to Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToLibrary("playing")}>
                  <Clock className="w-3 h-3 mr-2 text-blue-400" />
                  Currently Playing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToLibrary("completed")}>
                  <Check className="w-3 h-3 mr-2 text-green-400" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddToLibrary("backlog")}>
                  <Plus className="w-3 h-3 mr-2 text-yellow-400" />
                  Add to Backlog
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge className={`${getStatusColor(userGame.status)} text-xs flex items-center gap-1 border border-white/20 shadow-lg`}>
              {getStatusIcon(userGame.status)}
              In Library
            </Badge>
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

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            {onWriteReview && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleWriteReview}
                className="border-white/20 hover:bg-white/10"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
