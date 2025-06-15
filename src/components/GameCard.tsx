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

  // Comprehensive game image mapping - same as EnhancedGameCard
  const getGameImage = (game: Game) => {
    if (game.cover_image_url && game.cover_image_url.includes('igdb.com')) {
      return game.cover_image_url.replace('t_cover_big', 't_cover_big');
    }
    
    // Accurately matched game covers by exact title
    const gameImages: Record<string, string> = {
      // Popular AAA Games
      "Cyberpunk 2077": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp",
      "The Witcher 3: Wild Hunt": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
      "Red Dead Redemption 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
      "Grand Theft Auto V": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7g.webp",
      "Elden Ring": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jj6.webp",
      "God of War": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
      "The Last of Us Part II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2f2z.webp",
      "Ghost of Tsushima": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb6.webp",
      "Horizon Zero Dawn": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u9l.webp",
      "Spider-Man Remastered": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp",
      "Baldur's Gate 3": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5f5z.webp",
      
      // Indie Games
      "Hades": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2i2d.webp",
      "Hollow Knight": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp",
      "Celeste": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
      "Ori and the Will of the Wisps": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1t8z.webp",
      "Dead Cells": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rhu.webp",
      "Stardew Valley": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp",
      "Among Us": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2eub.webp",
      "Fall Guys": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2fpz.webp",
      "Pizza Tower": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6d2z.webp",
      
      // Sports Games
      "FIFA 23": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s2f.webp",
      "NBA 2K23": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5l9p.webp",
      "F1 22": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4t4c.webp",
      
      // Shooters
      "Call of Duty: Modern Warfare II": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s4j.webp",
      "Apex Legends": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
      "Valorant": "https://images.igdb.com/igdb/image/upload/t_cover_big/co87xu.webp",
      "Overwatch 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5w2s.webp",
      "Counter-Strike 2": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6w0k.webp",
      
      // Strategy Games
      "Age of Empires IV": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3pud.webp",
      "Civilization VI": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q7r.webp",
      "Total War: Warhammer III": "https://images.igdb.com/igdb/image/upload/t_cover_big/co47od.webp",
      
      // Racing Games
      "Forza Horizon 5": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3x1q.webp",
      "Gran Turismo 7": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4dqt.webp",
      
      // Action/Adventure
      "Assassin's Creed Valhalla": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2c7g.webp",
      "Minecraft": "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.webp",
      "Terraria": "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x8.webp",
      "Roblox": "https://images.igdb.com/igdb/image/upload/t_cover_big/co87xu.webp",
      
      // Horror Games
      "Resident Evil 4": "https://images.igdb.com/igdb/image/upload/t_cover_big/co6ac8.webp",
      "Phasmophobia": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lef.webp",
      
      // MMO/Online
      "World of Warcraft": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
      "Final Fantasy XIV": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.webp",
      "Lost Ark": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jec.webp",
      
      // Battle Royale
      "Fortnite": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
      "PUBG": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q2m.webp",
      
      // Simulation
      "The Sims 4": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q7c.webp",
      "Cities: Skylines": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20ai.webp",
    };
    
    return gameImages[game.title] || game.cover_image_url || "https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp";
  };

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
          src={getGameImage(game)}
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
