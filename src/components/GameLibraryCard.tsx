
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Plus, Clock, Check, Trash2, Edit } from "lucide-react";
import { UserGame, GameStatus, useUserGames } from "@/hooks/useUserGames";
import { HoursPlayedDialog } from "./HoursPlayedDialog";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GameLibraryCardProps {
  userGame: UserGame;
}

export const GameLibraryCard = ({ userGame }: GameLibraryCardProps) => {
  const { updateGameStatus, updateGameHours, removeGameFromLibrary } = useUserGames();
  const { games: game } = userGame;
  const navigate = useNavigate();

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

  const handleStatusChange = (newStatus: GameStatus) => {
    updateGameStatus.mutate({
      userGameId: userGame.id,
      status: newStatus,
    });
  };

  const handleRemove = () => {
    removeGameFromLibrary.mutate(userGame.id);
  };

  const handleViewDetails = () => {
    navigate(`/game/${game.id}`, { state: { game } });
  };

  const handleUpdateHours = (hours: number) => {
    updateGameHours.mutate({
      userGameId: userGame.id,
      hoursPlayed: hours,
    });
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
        
        {/* Rating */}
        {userGame.user_rating && (
          <div className="absolute top-2 right-2 flex items-center bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-xs font-bold text-white">{userGame.user_rating}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`${getStatusColor(userGame.status)} flex items-center gap-1 text-xs`}>
            {getStatusIcon(userGame.status)}
            {userGame.status}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/20">
                <Edit className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleStatusChange("wishlist")}>
                Wishlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("playing")}>
                Playing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("backlog")}>
                Backlog
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("dropped")}>
                Dropped
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <HoursPlayedDialog
            currentHours={userGame.hours_played}
            onUpdateHours={handleUpdateHours}
            isUpdating={updateGameHours.isPending}
          />
          
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-black/50 backdrop-blur-sm border-white/20"
            onClick={handleRemove}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
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

          {userGame.hours_played !== null && userGame.hours_played > 0 && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {userGame.hours_played} hours played
            </div>
          )}

          <Button 
            className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
