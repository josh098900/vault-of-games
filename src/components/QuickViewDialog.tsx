import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar, User, Building, Gamepad2, Plus, Clock, Check, Heart } from "lucide-react";
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

interface QuickViewDialogProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewDialog = ({ game, isOpen, onClose }: QuickViewDialogProps) => {
  const { user } = useAuth();
  const { userGames, addGameToLibrary } = useUserGames();
  const navigate = useNavigate();

  if (!game) return null;

  const userGame = userGames.find(ug => ug.game_id === game.id);

  // Better image handling for quick view
  const getGameImage = (game: Game) => {
    if (game.cover_image_url && game.cover_image_url.includes('igdb.com')) {
      return game.cover_image_url.replace('t_cover_big', 't_1080p');
    }
    
    const gameImages: Record<string, string> = {
      "Cyberpunk 2077": "https://images.igdb.com/igdb/image/upload/t_1080p/co2lbd.webp",
      "The Last of Us Part II": "https://images.igdb.com/igdb/image/upload/t_1080p/co1wyy.webp",
      "Hades": "https://images.igdb.com/igdb/image/upload/t_1080p/co1tmu.webp",
      "Ghost of Tsushima": "https://images.igdb.com/igdb/image/upload/t_1080p/co1rb6.webp",
      "Baldur's Gate 3": "https://images.igdb.com/igdb/image/upload/t_1080p/co5f5z.webp"
    };
    
    return gameImages[game.title] || game.cover_image_url || "https://images.igdb.com/igdb/image/upload/t_1080p/nocover.webp";
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
      onClose();
    } catch (error) {
      console.error("Error adding game to library:", error);
      toast({
        title: "Error",
        description: "Failed to add game to library. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewFullDetails = () => {
    navigate(`/game/${game.id}`, { state: { game } });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient">
            {game.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game Cover */}
          <div className="relative">
            <img
              src={getGameImage(game)}
              alt={game.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
            {userGame && (
              <Badge className="absolute top-2 left-2 bg-primary/80 text-primary-foreground">
                In Library
              </Badge>
            )}
          </div>

          {/* Game Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{game.release_year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                <span>{game.platform}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{game.developer}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{game.publisher}</span>
              </div>
            </div>

            <div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {game.genre}
              </Badge>
            </div>

            {game.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {game.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {!userGame ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="w-full bg-primary/80 hover:bg-primary"
                      disabled={addGameToLibrary.isPending}
                    >
                      {addGameToLibrary.isPending ? (
                        <div className="w-4 h-4 animate-spin rounded-full border border-white border-t-transparent mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add to Library
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full glass-card border-white/20">
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
                <Button variant="outline" className="w-full border-green-500/30 text-green-400" disabled>
                  <Check className="w-4 h-4 mr-2" />
                  Already in Library
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full glass-card border-white/20"
                onClick={handleViewFullDetails}
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
