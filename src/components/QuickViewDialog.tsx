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

  // High-resolution versions for quick view - same mapping as EnhancedGameCard but with t_1080p
  const getGameImage = (game: Game) => {
    if (game.cover_image_url && game.cover_image_url.includes('igdb.com')) {
      return game.cover_image_url.replace('t_cover_big', 't_1080p');
    }
    
    // Accurately matched high-resolution game covers
    const gameImages: Record<string, string> = {
      // Popular AAA Games
      "Cyberpunk 2077": "https://images.igdb.com/igdb/image/upload/t_1080p/co2lbd.webp",
      "The Witcher 3: Wild Hunt": "https://images.igdb.com/igdb/image/upload/t_1080p/co1wyy.webp",
      "Red Dead Redemption 2": "https://images.igdb.com/igdb/image/upload/t_1080p/co1q1f.webp",
      "Grand Theft Auto V": "https://images.igdb.com/igdb/image/upload/t_1080p/co1r7g.webp",
      "Elden Ring": "https://images.igdb.com/igdb/image/upload/t_1080p/co4jj6.webp",
      "God of War": "https://images.igdb.com/igdb/image/upload/t_1080p/co1tmu.webp",
      "The Last of Us Part II": "https://images.igdb.com/igdb/image/upload/t_1080p/co2f2z.webp",
      "Ghost of Tsushima": "https://images.igdb.com/igdb/image/upload/t_1080p/co1rb6.webp",
      "Horizon Zero Dawn": "https://images.igdb.com/igdb/image/upload/t_1080p/co1u9l.webp",
      "Spider-Man Remastered": "https://images.igdb.com/igdb/image/upload/t_1080p/co4jni.webp",
      "Baldur's Gate 3": "https://images.igdb.com/igdb/image/upload/t_1080p/co5f5z.webp",
      
      // Indie Games
      "Hades": "https://images.igdb.com/igdb/image/upload/t_1080p/co2i2d.webp",
      "Hollow Knight": "https://images.igdb.com/igdb/image/upload/t_1080p/co1rgi.webp",
      "Celeste": "https://images.igdb.com/igdb/image/upload/t_1080p/co1tmu.webp",
      "Ori and the Will of the Wisps": "https://images.igdb.com/igdb/image/upload/t_1080p/co1t8z.webp",
      "Dead Cells": "https://images.igdb.com/igdb/image/upload/t_1080p/co1rhu.webp",
      "Stardew Valley": "https://images.igdb.com/igdb/image/upload/t_1080p/co1tmu.webp",
      "Among Us": "https://images.igdb.com/igdb/image/upload/t_1080p/co2eub.webp",
      "Fall Guys": "https://images.igdb.com/igdb/image/upload/t_1080p/co2fpz.webp",
      "Pizza Tower": "https://images.igdb.com/igdb/image/upload/t_1080p/co6d2z.webp",
      
      // Sports Games
      "FIFA 23": "https://images.igdb.com/igdb/image/upload/t_1080p/co5s2f.webp",
      "NBA 2K23": "https://images.igdb.com/igdb/image/upload/t_1080p/co5l9p.webp",
      "F1 22": "https://images.igdb.com/igdb/image/upload/t_1080p/co4t4c.webp",
      
      // Shooters
      "Call of Duty: Modern Warfare II": "https://images.igdb.com/igdb/image/upload/t_1080p/co5s4j.webp",
      "Apex Legends": "https://images.igdb.com/igdb/image/upload/t_1080p/co20ai.webp",
      "Valorant": "https://images.igdb.com/igdb/image/upload/t_1080p/co87xu.webp",
      "Overwatch 2": "https://images.igdb.com/igdb/image/upload/t_1080p/co5w2s.webp",
      "Counter-Strike 2": "https://images.igdb.com/igdb/image/upload/t_1080p/co6w0k.webp",
      
      // Strategy Games
      "Age of Empires IV": "https://images.igdb.com/igdb/image/upload/t_1080p/co3pud.webp",
      "Civilization VI": "https://images.igdb.com/igdb/image/upload/t_1080p/co1q7r.webp",
      "Total War: Warhammer III": "https://images.igdb.com/igdb/image/upload/t_1080p/co47od.webp",
      
      // Racing Games
      "Forza Horizon 5": "https://images.igdb.com/igdb/image/upload/t_1080p/co3x1q.webp",
      "Gran Turismo 7": "https://images.igdb.com/igdb/image/upload/t_1080p/co4dqt.webp",
      
      // Action/Adventure
      "Assassin's Creed Valhalla": "https://images.igdb.com/igdb/image/upload/t_1080p/co2c7g.webp",
      "Minecraft": "https://images.igdb.com/igdb/image/upload/t_1080p/co49x5.webp",
      "Terraria": "https://images.igdb.com/igdb/image/upload/t_1080p/co49x8.webp",
      "Roblox": "https://images.igdb.com/igdb/image/upload/t_1080p/co87xu.webp",
      
      // Horror Games
      "Resident Evil 4": "https://images.igdb.com/igdb/image/upload/t_1080p/co6ac8.webp",
      "Phasmophobia": "https://images.igdb.com/igdb/image/upload/t_1080p/co2lef.webp",
      
      // MMO/Online
      "World of Warcraft": "https://images.igdb.com/igdb/image/upload/t_1080p/co20ai.webp",
      "Final Fantasy XIV": "https://images.igdb.com/igdb/image/upload/t_1080p/co3p2d.webp",
      "Lost Ark": "https://images.igdb.com/igdb/image/upload/t_1080p/co4jec.webp",
      
      // Battle Royale
      "Fortnite": "https://images.igdb.com/igdb/image/upload/t_1080p/co20ai.webp",
      "PUBG": "https://images.igdb.com/igdb/image/upload/t_1080p/co1q2m.webp",
      
      // Simulation
      "The Sims 4": "https://images.igdb.com/igdb/image/upload/t_1080p/co1q7c.webp",
      "Cities: Skylines": "https://images.igdb.com/igdb/image/upload/t_1080p/co20ai.webp",
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
