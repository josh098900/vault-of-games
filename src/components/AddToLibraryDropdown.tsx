
import { Button } from "@/components/ui/button";
import { Plus, Clock, Check, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GameStatus } from "@/hooks/useUserGames";

interface AddToLibraryDropdownProps {
  onAddToLibrary: (status: GameStatus) => void;
  isLoading: boolean;
}

export const AddToLibraryDropdown = ({ onAddToLibrary, isLoading }: AddToLibraryDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-black/90 backdrop-blur-sm border border-white/30 hover:bg-black text-white shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent mr-1" />
          ) : (
            <Plus className="w-3 h-3 mr-1" />
          )}
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border border-white/20">
        <DropdownMenuItem onClick={() => onAddToLibrary("wishlist")}>
          <Heart className="w-3 h-3 mr-2 text-pink-400" />
          Add to Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddToLibrary("playing")}>
          <Clock className="w-3 h-3 mr-2 text-blue-400" />
          Currently Playing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddToLibrary("completed")}>
          <Check className="w-3 h-3 mr-2 text-green-400" />
          Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddToLibrary("backlog")}>
          <Plus className="w-3 h-3 mr-2 text-yellow-400" />
          Add to Backlog
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
