
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { UserGame } from "@/hooks/useUserGames";

interface LibraryStatusBadgeProps {
  userGame?: UserGame;
}

export const LibraryStatusBadge = ({ userGame }: LibraryStatusBadgeProps) => {
  if (!userGame) return null;

  return (
    <Badge className="absolute top-2 left-2 bg-primary/80 text-primary-foreground">
      In Library
    </Badge>
  );
};

export const LibraryActionButton = ({ userGame }: LibraryStatusBadgeProps) => {
  if (userGame) {
    return (
      <Button size="sm" variant="secondary" className="bg-green-500/20 backdrop-blur-sm border-green-500/30" disabled>
        <Check className="w-3 h-3" />
      </Button>
    );
  }
  return null;
};
