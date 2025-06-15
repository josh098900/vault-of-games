
import { Badge } from "@/components/ui/badge";
import { EnhancedGameCard } from "@/components/EnhancedGameCard";
import { Game } from "@/hooks/useUserGames";

interface FeaturedGamesSectionProps {
  featuredGames: Game[];
  onWriteReview: (game: Game) => void;
}

export const FeaturedGamesSection = ({ featuredGames, onWriteReview }: FeaturedGamesSectionProps) => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold animate-fade-in-up">Featured Games</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-blue-400 text-blue-400 glass-card micro-interaction">All</Badge>
            <Badge variant="outline" className="glass-card border-white/20 micro-interaction">Playing</Badge>
            <Badge variant="outline" className="glass-card border-white/20 micro-interaction">Completed</Badge>
            <Badge variant="outline" className="glass-card border-white/20 micro-interaction">Wishlist</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGames.map((game, index) => (
            <div key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <EnhancedGameCard game={game} onWriteReview={onWriteReview} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
