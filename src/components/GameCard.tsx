
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, Plus, Clock, Check } from "lucide-react";

interface Game {
  id: number;
  title: string;
  cover: string;
  rating: number;
  genre: string;
  platform: string;
  status: string;
  year: number;
}

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
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
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card className="gaming-card group overflow-hidden">
      <div className="relative">
        <img
          src={game.cover}
          alt={game.title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
          <span className="text-xs font-bold text-white">{game.rating}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`${getStatusColor(game.status)} flex items-center gap-1 text-xs`}>
            {getStatusIcon(game.status)}
            {game.status}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/20">
            <Heart className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {game.title}
            </h3>
            <p className="text-sm text-muted-foreground">{game.year}</p>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-white/20 text-xs">
              {game.genre}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-xs">
              {game.platform}
            </Badge>
          </div>

          <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
