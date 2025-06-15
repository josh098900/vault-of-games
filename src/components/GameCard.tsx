
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Edit } from "lucide-react";
import { Game, useUserGames } from "@/hooks/useUserGames";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { getGameImage } from "@/utils/gameImageMapping";
import { getStatusIcon, getStatusColor } from "@/utils/gameStatusUtils";
import { AddToLibraryDropdown } from "./AddToLibraryDropdown";

interface GameCardProps {
  game: Game;
  onWriteReview?: (game: Game) => void;
}

export const GameCard = ({ game, onWriteReview }: GameCardProps) => {
  const { user } = useAuth();
  const { userGames, addGameToLibrary } = useUserGames();
  const navigate = useNavigate();
  
  const userGame = userGames.find(ug => ug.game_id === game.id);

  const handleAddToLibrary = async (status: any) => {
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
    navigate(`/game/${game.id}`, { state: { game } });
  };

  const StatusIcon = getStatusIcon(userGame?.status || "");

  return (
    <Card className="gaming-card group overflow-hidden">
      <div className="relative">
        <img
          src={getGameImage(game)}
          alt={game.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {userGame && (
          <div className="absolute top-2 left-2">
            <Badge className={`${getStatusColor(userGame.status)} flex items-center gap-1 text-xs`}>
              <StatusIcon className="w-3 h-3" />
              {userGame.status}
            </Badge>
          </div>
        )}

        {userGame?.user_rating && (
          <div className="absolute top-2 right-2 flex items-center bg-black/90 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-xs font-bold text-white">{userGame.user_rating}</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!userGame ? (
            <AddToLibraryDropdown 
              onAddToLibrary={handleAddToLibrary}
              isLoading={addGameToLibrary.isPending}
            />
          ) : (
            <Badge className={`${getStatusColor(userGame.status)} text-xs flex items-center gap-1 border border-white/20 shadow-lg`}>
              <StatusIcon className="w-3 h-3" />
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
