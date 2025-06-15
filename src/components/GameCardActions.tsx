
import { Button } from "@/components/ui/button";
import { Star, Eye } from "lucide-react";
import { Game } from "@/hooks/useUserGames";

interface GameCardActionsProps {
  game: Game;
  onWriteReview?: (game: Game) => void;
  onQuickView: () => void;
}

export const GameCardActions = ({ game, onWriteReview, onQuickView }: GameCardActionsProps) => {
  return (
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
        onClick={onQuickView}
        className="border-white/20 text-xs"
      >
        <Eye className="w-3 h-3 mr-1" />
        Quick View
      </Button>
    </div>
  );
};
