
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Plus, Play, Trophy, Zap } from "lucide-react";
import { Game } from "@/hooks/useUserGames";
import { QuickViewDialog } from "@/components/QuickViewDialog";

interface EnhancedGameCardProps {
  game: Game;
  onWriteReview: (game: Game) => void;
}

export const EnhancedGameCard = ({ game, onWriteReview }: EnhancedGameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Add particle effect on like
    if (!isLiked) {
      // Trigger like animation
    }
  };

  const handleQuickView = () => {
    setShowQuickView(true);
  };

  return (
    <>
      <Card 
        className="gaming-card group overflow-hidden relative transform transition-all duration-500 hover:scale-[1.02] hover:z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-holographic" />
        
        {/* Game Cover */}
        <div className="relative overflow-hidden">
          <img
            src={game.cover_image_url || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=400&fit=crop"}
            alt={game.title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Floating action buttons */}
          <div className={`absolute top-2 right-2 space-y-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 glass-card hover:scale-110 transition-all duration-200"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 morphing-icon transition-all duration-300 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8 glass-card hover:scale-110 transition-all duration-200"
            >
              <Plus className="w-4 h-4 morphing-icon" />
            </Button>
          </div>

          {/* Play overlay */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button 
              size="lg" 
              className="glass-card border-white/20 hover:border-white/40 micro-interaction"
              onClick={handleQuickView}
            >
              <Play className="w-6 h-6 mr-2 morphing-icon" />
              Quick View
            </Button>
          </div>

          {/* Genre badge */}
          <Badge className="absolute top-2 left-2 glass-card border-white/20">
            {game.genre}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title and Year */}
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {game.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {game.developer} • {game.release_year}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {game.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 morphing-icon" />
                <span className="ml-1">4.5</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-3 h-3 text-amber-400 morphing-icon" />
                <span className="ml-1">12 achievements</span>
              </div>
            </div>
            <Badge variant="outline" className="glass-card border-white/20">
              {game.platform}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 glass-card border-white/20 hover:border-primary/50 micro-interaction"
              onClick={() => onWriteReview(game)}
            >
              <Zap className="w-4 h-4 mr-2 morphing-icon" />
              Review
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary/80 hover:bg-primary micro-interaction glow-blue"
            >
              <Star className="w-4 h-4 mr-2 morphing-icon" />
              Rate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <QuickViewDialog
        game={game}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};
