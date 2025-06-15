
import { Button } from "@/components/ui/button";
import { EnhancedGameCard } from "@/components/EnhancedGameCard";
import { Game } from "@/hooks/useUserGames";

interface SearchResultsProps {
  searchResults: Game[];
  searchQuery: string;
  onWriteReview: (game: Game) => void;
  onViewAllResults: () => void;
}

export const SearchResults = ({ 
  searchResults, 
  searchQuery, 
  onWriteReview, 
  onViewAllResults 
}: SearchResultsProps) => {
  if (searchResults.length === 0) return null;

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-6 animate-fade-in-up">
          Search Results for "{searchQuery}"
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {searchResults.map((game, index) => (
            <div key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <EnhancedGameCard game={game} onWriteReview={onWriteReview} />
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onViewAllResults} 
            className="glass-card border-white/20 micro-interaction"
          >
            View All Results
          </Button>
        </div>
      </div>
    </section>
  );
};
