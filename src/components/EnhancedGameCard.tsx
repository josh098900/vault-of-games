
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Game, useUserGames } from "@/hooks/useUserGames";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { QuickViewDialog } from "./QuickViewDialog";
import { getGameImage } from "@/utils/gameImageMapping";
import { AddToLibraryDropdown } from "./AddToLibraryDropdown";
import { QuickViewButton } from "./QuickViewButton";
import { LibraryStatusBadge, LibraryActionButton } from "./LibraryStatusBadge";
import { GameCardActions } from "./GameCardActions";

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
          
          <LibraryStatusBadge userGame={userGame} />

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <QuickViewButton onQuickView={handleQuickView} />
          </div>

          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!userGame ? (
              <AddToLibraryDropdown 
                onAddToLibrary={handleAddToLibrary}
                isLoading={addGameToLibrary.isPending}
              />
            ) : (
              <LibraryActionButton userGame={userGame} />
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

            <GameCardActions 
              game={game}
              onWriteReview={onWriteReview}
              onQuickView={handleQuickView}
            />
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
